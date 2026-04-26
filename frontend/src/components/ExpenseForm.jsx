import React, { useState } from 'react';
import './ExpenseForm.css';

const DebtTracker = () => {
    const [formData, setFormData] = useState({ debtorName: '', amount: '', dueDate: '', status: 'Pending' });
    const [debts, setDebts] = useState([]);

    const today = new Date().toLocaleDateString('en-CA');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newEntry = { ...formData, dateBorrowed: today };
        setDebts([...debts, newEntry]);
        setFormData({ debtorName: '', amount: '', dueDate: '', status: 'Pending' });
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Debt Tracker</h2>
            <div className="row">
                {/* Record Form */}
                <div className="col-md-4">
                    <form onSubmit={handleSubmit} className="border p-4 rounded shadow-sm bg-light">
                        <div className="mb-3">
                            <label className="form-label">Debtor Name</label>
                            <input name="debtorName" className="form-control" placeholder="Who borrowed?" value={formData.debtorName} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Amount (PHP)</label>
                            <input name="amount" type="number" className="form-control" placeholder="0.00" value={formData.amount} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Status</label>
                                <select name="status" className="form-select" value={formData.status} onChange={handleChange} required>
                                <option value="Pending">Pending</option>
                                <option value="Fully Paid">Fully Paid</option>
                                <option value="Overdue">Overdue</option>
                            </select>                        
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Due Date</label>
                            <input name="dueDate" type="date" className="form-control" value={formData.dueDate} onChange={handleChange} required />
                        </div>
                        <button type="submit" className="btn btn-primary w-100">
                            Add to Records
                        </button>
                    </form>
                </div>

                {/*Table Side*/}
                <div className="col-md-8">
                    <div className="table-responsive">
                    <table className="table table-striped table-hover border">
                        <thead className="table-dark">
                                <tr>
                                    <th>Debtor & Status</th>
                                    <th>Amount</th>
                                    <th>Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {debts.length > 0 ? (
                                    debts.map((debt, i) => (
                                        <tr key={i}>
                                            <td>
                                                <strong>{debt.debtorName}</strong> <br/>
                                                <small className="text-muted">Status: {debt.status}</small>
                                            </td>
                                            <td className="fw-bold text-danger">
                                                ₱{parseFloat(debt.amount).toLocaleString()}
                                            </td>
                                            <td>{debt.dueDate}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="3" className="text-center">No debt records found.</td></tr>
                                )}
                            </tbody>
                    </table>
                    </div>
                </div>        
            </div>
        </div>
    );
};

export default DebtTracker;