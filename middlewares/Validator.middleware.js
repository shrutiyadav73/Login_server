module.exports = (req, res, next) => {
  let messages = [];

  /* `validate()` function is a middleware function that is designed to validate the request
body against a given schema. */
  req.getValidatedBody = (schema, config = {}) => {
    try {
      messages = [];
      return schema.validateSync(req.body, { abortEarly: false, ...config });
    } catch (err) {
      messages = err.inner.map((e) => {
        return { name: e.path, errors: e.errors };
      });
      return null;
    }
  };

  /* `isValidationFailed()` If validation get failed, the function will return `true`. Otherwise, it will return `false`. */
  req.isValidationFailed = () => {
    return Boolean(messages?.length);
  };

  /* The `req.getValidationErrors` function is a method added to the `req` object in a Node.js
  middleware. This function is designed to retrieve and return the validation error messages stored
  in the `messages` array. When called, it will return an array containing all the validation error
  messages that were generated during the validation process. */
  req.getValidationErrors = () => {
    return messages;
  };

  next();
};
