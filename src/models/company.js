const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		unique: true,
		ref: 'User'
	},
	name: {
		type: String,
		required: true,
		trim: true,
		maxLength: 100
	},
	website: {
		type: String,
		required: true,
		trim: true
	},
	employeeCount: {
		type: Number,
		required: true,
		min: 1
	},
	description: {
		type: String,
		required: true,
		maxLength: 1000
	},
	status: {
		type: String,
		enum: ['pending', 'apprived', 'rejected'],
		default: 'pending'
	},
	adminNotes: {
		admin: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		note: {
			type: String,
		},
		updatedAt: {
			type: Date,
		}
	}
}, { timestamps: true });

const Company = mongoose.model('Company', schema);

module.exports = Company;