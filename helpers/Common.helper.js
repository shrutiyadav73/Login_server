const Logger = require("./Logger.helper");
const { verifyJWT } = require("./JWT.helper");
const UrlPattern = require("url-pattern");
const ll = "CommonHelper";
const { ToWords } = require("to-words");

//  Define this method to generate random number to represent service _id

/**
 * It generates a random number of a given length
 * @param [length=5] - The length of the ID to be generated.
 * @returns a random number of length 5.
 */

function generateId(length = 5) {
  let id = "";
  for (let i = 0; i < length; i++) {
    id += Math.floor(Math.random() * (9 - 0)) + 0;
  }
  return id;
}

function generatePassword(length = 8) {
  var charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

function generateOTP() {
  var digits = "0123456789";
  var otpLength = 4;
  var otp = "";
  for (let i = 1; i <= otpLength; i++) {
    var index = Math.floor(Math.random() * digits.length);
    otp = otp + digits[index];
  }
  return otp;
}

async function generateNextSerialNumber(model, length = 1) {
  try {
    // Get the current date
    const today = new Date();
    today.setHours(0, 0, 0);

    const model_query = {
      createdOn: {
        $gte: today,
      },
    };

    Logger.debug(
      ll,
      `model_query to get next serial number ${JSON.stringify(model_query)}`
    );

    // Find the count of documents created today
    const todayCount = await model.find(model_query);

    // Calculate the next serial number
    const nextSerialNumber = (todayCount.length ?? 0) + 1;

    return nextSerialNumber.toString().padStart(length, "0");
  } catch (error) {
    console.error("Error generating next serial number:", error);
    throw error;
  }
}

async function generateNextSerialId(model, prefix, retry = 1) {
  let nextSerialNumber;

  try {
    // Get the current date
    const today = new Date();
    today.setHours(0, 0, 0);

    const model_query = {
      createdOn: {
        $gte: today,
      },
    };

    Logger.debug(
      ll,
      `model_query to get next serial number ${JSON.stringify(model_query)}`
    );

    // Find the count of documents created today
    const todayCount = await model.find(model_query);

    // Calculate the next serial number
    nextSerialNumber = (todayCount.length ?? 0) + retry;
  } catch (error) {
    console.error("Error generating next serial number:", error);
    throw error;
  }

  // generate a unique id
  const id = `${prefix}${new Date().getFullYear()}${(new Date().getMonth() + 1)
    .toString()
    .padStart(2, "0")}${new Date()
    .getDate()
    .toString()
    .padStart(2, "0")}${nextSerialNumber.toString().padStart(3, "0")}`;

  let uniqueIdResult = await model.findOne({ id: id });

  return !uniqueIdResult
    ? id
    : await generateNextSerialId(model, prefix, retry + 1);
}

async function getAdmin() {
  const requestToken = getRequestToken();
  let user = requestToken ? verifyJWT(requestToken) : null;
  if (!user) return false;
  try {
    user = await UserModel.findOne({ email: user.email });
    return { id: user.id, name: user.name, email: user.email, type: "admin" };
  } catch (error) {
    Logger.debug(ll, error);
    return false;
  }
}

async function getCustomer() {
  const requestToken = getRequestToken();
  let user = requestToken ? verifyJWT(requestToken) : null;
  if (user)
    try {
      user = await CustomerModel.findOne({ email: user.email });
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        type: "customer",
      };
    } catch (error) {
      return false;
    }
}

async function getCurrentUser() {
  // Get token from request and verify
  const tempUser = verifyJWT(getRequestToken());
  let userType = "customer";

  let user = false;

  // check user is valid customer
  try {
    user = await CustomerModel.findOne({ id: tempUser.id });
    userType = "customer";
  } catch (err) {
    print(err.message);
  }

  if (!user) {
    try {
      user = await UserModel.findOne({ id: tempUser.id });
      userType = "admin";
    } catch (err) {
      print(err.message);
    }
  }

  if (user)
    return { id: user.id, name: user.name, email: user.email, type: userType };

  return user;
}

function getRequestToken() {
  try {
    return currentHttpRequest.headers["authorization"].split(" ")[1];
  } catch (error) {
    return "";
  }
}

async function paramProxy(value) {
  if (typeof value === "object") {
    let cValue = JSON.stringify(value);

    let user = await getCurrentUser();
    if (user) cValue = cValue.replace("__self__", user.id);

    return JSON.parse(cValue);
  }
  return false;
}

function isAuthProxyUrl(url) {
  const proxyUrls = require("../configs/BasicAuthProxyUrl.config") ?? [];

  for (let index = 0; index < proxyUrls.length; index++) {
    const urlPattern = new UrlPattern(proxyUrls[index]);
    if (urlPattern.match(url) !== null) return true;
  }
  return false;
}

function appendItemInArrayList(list, item) {
  if (!Array.isArray(list)) {
    list = [];
  }

  list.push(item);

  return list;
}

function convertIntToWord(number) {
  if (typeof number !== "number" || isNaN(number)) return false;
  const toWords = new ToWords({
    localeCode: "en-IN",
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      doNotAddOnly: false,
      currencyOptions: {
        // can be used to override defaults for the selected locale
        name: "Rupee",
        plural: "Rupees",
        symbol: "₹",
        fractionalUnit: {
          name: "Paisa",
          plural: "Paise",
          symbol: "",
        },
      },
    },
  });

  return toWords.convert(number);
}

function fallbackValue(
  value,
  defaultValue = "-",
  config = { empty: true, null: true, nan: true, undefined: true }
) {
  if (config.empty && value === "") return defaultValue;
  if (config.null && value === null) return defaultValue;
  if (config.nan && value === NaN) return defaultValue;
  if (config.undefined && value === undefined) return defaultValue;
  return value;
}

// async function storeMessage(message, config = { session, meta: {} }) {
//   // Step 2: Generate message payload and create one
//   // -----------------------------------------------
//   let message = {
//     id: generateRandomString(28),
//     userId: currentHttpRequest.user.id,
//     message: message,
//     entity: currentHttpRequest.params.id,
//     meta: config.meta,
//   };

//   // Store Message into database
//   let messageResult = null;

//   try {
//     messageResult = await new MessageModel(message).save({ session });
//   } catch (error) {
//     Logger.error(
//       ll,
//       `Error occurred while store message in pr, Error: ${error.message}`
//     );
//   }

//   if (!messageResult) {
//     await session.abortTransaction();
//     return requestFail(res, "Unexpected error occurred");
//   }
// }

function formateDate(dateString, configuration) {
  configuration = {
    withTime: true,
    blankOutput: "-",
    ...configuration,
  };

  const date = new Date(dateString);

  let output = "";

  output = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  if (configuration.withTime) {
    output +=
      " at " +
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });
  }

  return output.indexOf("Invalid") !== -1 ? configuration.blankOutput : output;
}

module.exports = {
  generateId,
  generatePassword,
  generateRandomString: generatePassword,
  generateOTP,
  generateNextSerialNumber,
  generateNextSerialId,
  getAdmin,
  paramProxy,
  getCustomer,
  getCurrentUser,
  isAuthProxyUrl,
  appendItemInArrayList,
  convertIntToWord,
  fallbackValue,
  formateDate,
};
