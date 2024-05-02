const { object, string } = require("yup");
const UserModel = require("../models/User.model");
const {
  requestFail,
  requestSuccess,
} = require("../helpers/RequestResponse.helper");

var bcrypt = require("bcryptjs");
const { generateId } = require("../helpers/Common.helper");
const { generateJWT, verifyJWT } = require("../helpers/JWT.helper");
const Logger = require("../helpers/Logger.helper");
const { templateEmail } = require("../helpers/Mail.helper");
const { getAppName } = require("../constant/App.constant");
const LoggerLabel = "AuthController";

async function login({ body }, res) {
  const LoginSchema = object({
    email: string()
      .required("Please enter an email")
      .min(3, "Email is to short. Look like you enter a wrong email")
      .email(),
    password: string().min(6, "Password must be greater then 6"),
  });

  let FormData = null;

  try {
    FormData = await LoginSchema.validate(body);
  } catch (e) {
    Logger.debug(LoggerLabel, e);
    return requestFail(res);
  }

  let user = null;

  try {
    user = await UserModel.findOne({ email: FormData.email });
    if (user.status !== "active") {
      Logger.http(LoggerLabel, "Request Failed, User has been blocked");
      return requestFail(
        res,
        "You can't login to your account. Maybe your are blocked"
      );
    }
  } catch (e2) {
    Logger.debug(LoggerLabel, e2);
  }

  if (!user) {
    Logger.debug(LoggerLabel, "User not found");
    return requestFail(res, "Email address not register with us.");
  }

  const isPasswordMatch = await bcrypt.compare(
    FormData.password,
    user.password
  );

  if (!isPasswordMatch) return requestFail(res, "Email or Password is wrong.");

  const returnData = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    status: user.status,
    email: user.email,
  };

  return requestSuccess(res, {
    ...returnData,
    token: generateJWT(returnData),
  });
}

async function register(req, res) {
  const { body } = req;

  // Customer Schema
  const UserSchema = object({
    firstName: string(),
    lastName: string(),
    email: string()
      .required("Please enter an email")
      .min(3, "Email is to short. Look like you enter a wrong email")
      .email(),
    password: string().min(6, "Password must be greater then 6 "),
  });

  let user = null;

  //   Verify customer schema
  try {
    user = await UserSchema.validate(body);
  } catch (e) {
    return requestFail(res, e.message);
  }

  if (!user) return requestFail(res, "Validation error");

  let checkExitingUser = await UserModel.findOne({ email: user.email });

  if (checkExitingUser) return requestFail(res, "User already exist");

  const userId = `U${generateId(6)}`;
  const encryptedPassword = bcrypt.hashSync(user.password, 8);

  const userRegisterResponse = await new UserModel({
    id: userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: encryptedPassword,
    status: "active",
    createdOn: new Date(),
    updatedOn: new Date(),
    createdBy: "itself",
    updatedBy: "itself",
  }).save();

  if (userRegisterResponse) {
    return requestSuccess(res, "User register successfully");
  }

  return requestFail(res, "Something went wrong, Unable to register user");
}
async function forgetPassword(req, res) {
  let FormData = req.body;
  let user = null;

  const FormSchema = object({
    email: string()
      .required("Please enter an email")
      .min(3, "Email is to short. Look like you enter a wrong email")
      .email(),
  });

  try {
    FormData = await FormSchema.validate(FormData);
  } catch (e) {
    return requestFail(res, e.message);
  }

  try {
    user = await UserModel.findOne({ email: FormData.email });
  } catch (e1) {
    Logger.error(ll, e1);
  }

  if (!user) return requestFail(res, "Email address not register with us.");

  if (user.status !== "active")
    return requestFail(
      res,
      "You can't reset password of your account. Maybe your are blocked"
    );

  let token = generateJWT(
    {
      email: user.email,
      id: user.id,
    },
    {
      expiresIn: "2h",
    }
  );

  const updateResult = await UserModel.updateOne(
    { id: user.id },
    {
      $set: {
        resetToken: token,
      },
    }
  );

  if (updateResult.acknowledged) {
    sendRestLinkToUser(user.email, {
      userName: user.firstName,
      userEmail: user.email,
      token: token,
    });
    return requestSuccess(
      res,
      "We have send an email at your register email address"
    );
  } else {
    return requestFail(res, "Unable to reset password");
  }
}

async function changePassword({ body }, res) {
  let cpForm = null;
  let user = null;

  const cpFormSchema = object({
    password: string()
      .required("Please enter an password")
      .min(3, "Email is to short. Look like you enter a wrong email"),
    token: string().required("Something went wrong"),
  });

  try {
    cpForm = await cpFormSchema.validate(body);
  } catch (e) {
    return requestFail(res, e.message);
  }

  // verify token
  let tokenUser = verifyJWT(cpForm.token);

  if (!tokenUser)
    return requestFail(res, "Something went wrong, Retry to change password");

  try {
    user = await UserModel.findOne({ email: tokenUser.email });
  } catch (e1) {
    console.error("Error finding user:", e1);
    return requestFail(res, "Something went wrong while finding the user");
  }

  if (!user) return requestFail(res, "Email address not register with us.");

  if (user.status !== "active")
    return requestFail(
      res,
      "You can't reset password of your account. Maybe your are blocked"
    );

  if (user.resetToken != cpForm.token) {
    return requestFail(
      res,
      "You are using an invalid link to reset password, Request again to reset you password"
    );
  }

  UserModel.updateOne(
    { id: tokenUser.id },
    {
      $set: {
        password: bcrypt.hashSync(cpForm.password, 8),
        resetToken: "",
      },
    },
    (error, result) => {
      if (!error) {
        return requestSuccess(res, "Password updated successfully");
      } else {
        return requestFail(res, "Can't update password");
      }
    }
  );
}

async function sendRestLinkToUser(to, data) {
  data.buttonLink = `${process.env.RESET_PAGE_LINK ?? ""}/${data.token}`;

  return await templateEmail(
    "userManagement/rest_password.template.html",
    to,
    `Reset your password for ${getAppName()}`,
    data
  );
}

module.exports = {
  login,
  register,
  changePassword,
  forgetPassword,
};
