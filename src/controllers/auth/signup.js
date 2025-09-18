const bcrypt = require('bcryptjs');
const User = require('../../models/user');

const signup = async (req, res) => {
	res.send(req.body);
};

module.exports = signup;