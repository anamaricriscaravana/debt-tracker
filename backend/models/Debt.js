const mongoose = require('mongoose');

const DebtSchema = new mongoose.Schema({
    debtorName: { type: String, required: true },
    amount: { type: Number, required: true, min: 1 },
    debtDate: { type: String, required: true },
    dueDate: { type: String },
    interest: { type: Number, default: 0},
    status: { type: String, enum: ['Pending', 'Partially Paid', 'Fully Paid', 'Overdue'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.models.Debt || mongoose.model('Debt', DebtSchema);