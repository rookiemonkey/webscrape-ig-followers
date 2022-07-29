const emailValidator = require("email-validator");

String.prototype.isEmail = function () { return emailValidator.validate(this) }

String.prototype.toBoolean = function() { return this.toLowerCase() === 'true' ? true : false }