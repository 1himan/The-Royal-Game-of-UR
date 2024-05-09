const Joi = require("joi");

const schema = Joi.object({
  joinRoomName: Joi.string().length(6).required(),
});
module.exports = schema;
