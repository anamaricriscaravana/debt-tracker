import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DebtTracker.css';

const DebtTracker = () => {
    const today = new Date().toLocaleDateString('en-CA');
    const [formData, setFormData] = useState({ debtorName: '', amount: '', debtDate: today, dueDate: '', interest: 0 });
    const [debts, setDebts] = useState([]);

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

        if (parseFloat(formData.amount) <= 0) {
            return alert("Amount must be greater than zero.");
        }

        if (formData.debtDate > today) {
            return alert("Debt date cannot be in the future.");
        }

        const year = formData.debtDate.split('-')[0];
        if (year.length < 4) {
            return alert("Please enter a valid year");
        }

        try {
            const dataToSave = {...formData, status: 'Pending'};
            await axios.post('http://localhost:5000/api/debts/add', dataToSave)
            await fetchDebts();
            setFormData({ debtorName: '', amount: '', debtDate: today, dueDate: '', interest: 0 });
        } catch (error) {
            console.error('Error adding debt:', error);
            alert("Failed to add debt. Please check your input and try again.");
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await axios.patch(`http://localhost:5000/api/debts/${id}/status`, { status: newStatus });
            fetchDebts(); // Refresh table
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update status.");
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
                                        <label className="form-label fw-semibold">Interest (%) <small className="text-muted">(Optional)</small></label>
                                        <input name="interest" type="number" className="form-control" placeholder="0" value={formData.interest} onChange={handleChange} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Date Borrowed</label>
                                        <input name="debtDate" type="date" className="form-control" max={today} value={formData.debtDate} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Due Date<small className="text-muted">(Optional)</small></label>
                                        <input name="dueDate" type="date" className="form-control" value={formData.dueDate} onChange={handleChange} />
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
                                                <th>Base Amount</th>
                                                <th>Interest (%)</th>
                                                <th>Date Borrowed</th>
                                                <th>Due Date</th>
                                                <th className="text-primary">Total Amount</th>
                                                <th className="text-end">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {debts.length > 0 ? (
                                                debts.map((debt) => {
                                                    const baseAmount = parseFloat(debt.amount || 0);
                                                    const interestVal = parseFloat(debt.interest || 0);
                                                    const totalWithInterest = baseAmount + (baseAmount * (interestVal / 100));
                                                    return (
                                                        <tr key={debt._id}>
                                                            <td>
                                                                <div className="fw-bold text-dark">{debt.debtorName}</div>
                                                                <select
                                                                    className={`form-select form-select-sm border-0 fw-bold badge ${debt.status === 'Overdue' ? 'bg-danger' :
                                                                        debt.status === 'Fully Paid' ? 'bg-success text-white' :
                                                                            debt.status === 'Partially Paid' ? 'bg-warning text-dark' : 'bg-secondary text-white'
                                                                        }`}
                                                                    style={{ width: 'fit-content', cursor: 'pointer', appearance: 'none', textAlign: 'center' }}
                                                                    value={debt.status}
                                                                    onChange={(e) => handleStatusChange(debt._id, e.target.value)}
                                                                >
                                                                    <option value="Pending">Pending </option>
                                                                    <option value="Partially Paid">Partially Paid </option>
                                                                    <option value="Fully Paid">Fully Paid </option>
                                                                    <option value="Overdue">Overdue </option>
                                                                </select>
                                                            </td>
                                                            <td className="fw-semibold">₱{baseAmount.toLocaleString()}</td>
                                                            <td className="text-muted">{interestVal}%</td>
                                                            <td className="text-muted">{debt.dueDate}</td>
                                                            <td className="text-muted">{debt.dueDate || 'No Due Date'}</td>
                                                            <td className="fw-bold text-primary">₱{totalWithInterest.toLocaleString()}</td>
                                                            <td className="text-end">
                                                                <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleDelete(debt._id)}>
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr><td colSpan="7" className="text-center">No debt records found.</td></tr>
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