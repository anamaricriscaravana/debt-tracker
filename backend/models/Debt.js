const mongoose = require('mongoose');

const DebtSchema = new mongoose.Schema({
    debtorName: { type: String, required: true },
    amount: { type: Number, required: true, min: 1 },
    debtDate: { type: String, required: true },
    dueDate: { type: String },
    interest: { type: Number, default: 0 },
    status: { type: String, enum: ['Unpaid', 'Partially Paid', 'Fully Paid', 'Overdue'], default: 'Unpaid' },
    amountPaid: { type: Number, default: 0 },
    paymentMethod: { type: String, default: 'Cash' },
    datePaid: { type: String },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
}, { timestamps: true });

module.exports = mongoose.models.Debt || mongoose.model('Debt', DebtSchema);