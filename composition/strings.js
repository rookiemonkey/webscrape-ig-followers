const emailValidator = require("email-validator");

const methods = {
  isEmail: function () { return emailValidator.validate(this) },
  toBoolean: function () { return this.toLowerCase() === 'true' ? true : false },
  toInt: function () { return parseInt(this) },
  removeQuoations: function () { return this.replaceAll(/"/g, '') }
}

for (const method of Object.keys(methods)) String.prototype[method] = methods[method]