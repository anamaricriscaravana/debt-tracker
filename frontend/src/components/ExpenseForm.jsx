import React, { useState } from 'react';
import './ExpenseForm.css';

const ExpenseForm = () => {
    const [formData, setFormData] = useState({ item: '', amount: '', category: '', date: '' });
    const [expenses, setExpenses] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setExpenses([...expenses, formData]);
        setFormData({ item: '', amount: '', category: '', date: '' });
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Expense Tracker</h2>
            <div className="row">
                {/* Expense Form */}
                <div className="col-md-4">
                    <form onSubmit={handleSubmit} className="border p-4 rounded shadow-sm bg-light">
                        <div className="mb-3">
                            <label className="form-label">Item</label>
                            <input name="item" className="form-control" placeholder="Item Name" value={formData.item} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Amount</label>
                            <input name="amount" type="number" className="form-control" placeholder="0.00" value={formData.amount} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Category</label>
                                <select name="category" className="form-select" value={formData.category} onChange={handleChange} required>
                                <option value="">Select Category</option>
                                <option value="Food & Dining">Food & Dining</option>
                                <option value="Transportation">Transportation</option>
                                <option value="Personal & Health">Personal & Health</option>
                            </select>                        
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Date</label>
                            <input name="date" type="date" className="form-control" value={formData.date} onChange={handleChange} required />
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
                                    <th>Details</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.length > 0 ? (
                                    expenses.map((exp, i) => (
                                        <tr key={i}>
                                            <td>{exp.item} <br/><small className="text-muted">{exp.category}</small></td>
                                            <td className="fw-bold">₱{parseFloat(exp.amount).toLocaleString()}</td>
                                            <td>{exp.date}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="3" className="text-center">No history found.</td></tr>
                                )}
                            </tbody>
                    </table>
                    </div>
                </div>        
            </div>
        </div>
    );
};

export default ExpenseForm