class Validator {
  messages = [];
  validate(schema, data) {
    try {
      this.messages = [];
      return schema.validateSync(data);
    } catch (err) {
      messages = err.errors.map((err) => i18next.t(err.key));
      return null;
    }
  }

  isFailed() {
    return Boolean(this.messages.length);
  }

  getError() {
    return this.messages;
  }
}

module.exports = Validator;
