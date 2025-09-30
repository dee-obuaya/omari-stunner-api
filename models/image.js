const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Service = require('./service');

const ImageSchema = new Schema({
	image: {
		type: {
			url: String,
			filename: String,
            name: String,
		},
		required: [true, 'Please include an image'],
	},
	service: {
		type: Schema.Types.ObjectId, ref: 'Service',
		required: [true, 'Image service type cannot be blank'],
	},
});

module.exports = mongoose.model('Image', ImageSchema);
