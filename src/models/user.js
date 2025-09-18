const mongoose = require('mongoose');

const schema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			maxlength: 50
		},
		email: {	
			type: String,
			required: true,
			trim: true,
			unique: true,
			match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
			maxlength: 255,
			lowercase: true
		},
		password: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			enum: ['user', 'job-poster', 'admin'],
			default: 'user'
		},
		emailVerified: {
			type: Boolean,
			default: false
		}
	},
	{ timestamps: true }
);

const User = mongoose.model('User', schema);

module.exports = User;