const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		unique: true,
	},
	resumeURL: {
		type: String,
		trim: true,
	},
	coverLetter: {
		type: String,
		trim: true,
		maxlength: 1000,
	},
	skills: {
		type: [String],
		default: [],
	},
	LinkedInURL: {
		type: String,
		trim: true,
	},
});

const Profile = mongoose.model('Profile', schema);

module.exports = Profile;