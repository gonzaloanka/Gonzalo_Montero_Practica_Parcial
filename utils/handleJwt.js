const jwt = require('jsonwebtoken');

const tokenSign = async (user, secret) => {
  return jwt.sign(
    {
      id: user._id,
    },
    secret,
    {
      expiresIn: "1h"
    }
  );
};

module.exports = { tokenSign };
