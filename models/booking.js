const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
    clientName: {
        type: String,
        required: [true, 'Client name cannot be blank']
    },
    clientEmail: {
        type: String,
        required: [true, 'Client email cannot be blank']
    },
    clientPhone: {
        type: Number,
        required: [true, 'Client phone number cannot be blank']
    },
	clientService: {
		type: Schema.Types.ObjectId, ref: 'Service',
		required: [true, 'Service cannot be blank'],
	},
    appointmentDate: {
        type: Date,
        required: [true, 'Booking date cannot be blank']
    },
    appointmentTime: {
        type: String,
        required: [true, 'Booking time cannot be blank']
    },
    appointmentAddress: {
        type: String,
        // required: [true, 'Client address cannot be blank']
    },
    totalPeople: {
        type: Number,
        required: [true, 'Total number of people cannot be blank']
    },
    touchupRequired: {
        type: String,
        enum: ['Yes', 'No'],
        default: 'No',
        required: [true, 'Touchup required field cannot be blank']
    },
    downPayment: {
        type: String,
        enum: ['Full', '50%'],
        default: '50%',
        required: [true, 'Down payment option cannot be blank']
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Moved'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending Confirmation', 'Paid', 'Partial', 'Not Paid'],
        default: 'Not Paid'
    },
}, { timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
} });

module.exports = mongoose.model('Booking', BookingSchema);