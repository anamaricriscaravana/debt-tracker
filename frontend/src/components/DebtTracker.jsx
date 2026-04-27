import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DebtTracker.css';

const DebtTracker = () => {
    const [formData, setFormData] = useState({ debtorName: '', amount: '', dueDate: '', status: 'Pending' });
    const [debts, setDebts] = useState([]);

    const today = new Date().toLocaleDateString('en-CA');

    const fetchDebts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/debts/all');
            setDebts(response.data);
        } catch (error) {
            console.error('Error fetching debts:', error);
        }
    };

    useEffect(() => {
        fetchDebts();
    }, []);

    const totalDebt = debts.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this debt record?')) {
            try {
                await axios.delete(`http://localhost:5000/api/debts/${id}`);
                await fetchDebts();
            } catch (error) {
                console.error('Error deleting debt:', error);
                alert("Delete failed. Please try again.");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newEntry = { ...formData, dateBorrowed: today };

        try {
            await axios.post('http://localhost:5000/api/debts/add', newEntry)
            await fetchDebts();
            setFormData({ debtorName: '', amount: '', dueDate: '', status: 'Pending' });
        } catch (error) {
            console.error('Error adding debt:', error);
            alert("Failed to add debt. Please check your input and try again.");
        }
    };

    return (
        <div className="min-vh-100 bg-light">
            {/* Navbar with Total Display */}
            <nav className="navbar navbar-light bg-white border-bottom mb-4 shadow-sm">
                <div className="container d-flex justify-content-between align-items-center">
                    <span className="navbar-brand mb-0 h1 fw-bold text-primary">DEBT TRACKER</span>
                    <div className="text-end">
                        <small className="text-muted d-block">Total</small>
                        <span className="text-primary fw-bold fs-4">
                            ₱{totalDebt.toLocaleString()}
                        </span>
                    </div>
                </div>
            </nav>

            <div className="container">
                <div className="row g-4">
                    {/* Record Form */}
                    <div className="col-md-4">
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-4">
                                <h5 className="card-title mb-4 fw-bold text-dark">Record New Debt</h5>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Debtor Name</label>
                                        <input name="debtorName" className="form-control" placeholder="Who borrowed?" value={formData.debtorName} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Amount (PHP)</label>
                                        <input name="amount" type="number" className="form-control" placeholder="0.00" value={formData.amount} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Status</label>
                                        <select name="status" className="form-select" value={formData.status} onChange={handleChange} required>
                                            <option value="Pending">Pending</option>
                                            <option value="Fully Paid">Fully Paid</option>
                                            <option value="Overdue">Overdue</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Due Date</label>
                                        <input name="dueDate" type="date" className="form-control" value={formData.dueDate} onChange={handleChange} required />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 fw-bold py-2 shadow-sm text-white">
                                        Add to Records
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/*Table Side*/}
                    <div className="col-md-8">
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-4">
                                <h5 className="card-title mb-4 fw-bold text-dark">Collection History</h5>
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle border-top">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Debtor & Status</th>
                                                <th>Amount</th>
                                                <th>Due Date</th>
                                                <th className="text-end">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {debts.length > 0 ? (
                                                debts.map((debt, i) => (
                                                    <tr key={debt._id}>
                                                        <td>
                                                            <div className="fw-bold text-dark">{debt.debtorName}</div>
                                                            <span className={`badge ${debt.status === 'Overdue' ? 'bg-danger' : 'bg-secondary'}`}>
                                                                {debt.status}
                                                            </span>
                                                        </td>
                                                        <td className="fw-bold text-primary">
                                                            ₱{parseFloat(debt.amount).toLocaleString()}
                                                        </td>
                                                        <td className="text-muted font-monospace">{debt.dueDate}</td>
                                                        <td className="text-end">
                                                            <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleDelete(debt._id)}>
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="4" className="text-center">No debt records found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DebtTracker;