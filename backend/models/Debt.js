const mongoose = require('mongoose');

const DebtSchema = new mongoose.Schema({
    debtorName: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    dateBorrowed: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Debt', DebtSchema);