import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DebtTracker.css';

const DebtTracker = () => {
    const today = new Date().toLocaleDateString('en-CA');
    const [formData, setFormData] = useState({ debtorName: '', amount: '', debtDate: today, dueDate: '', interest: '' });
    const [debts, setDebts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [partialInput, setPartialInput] = useState({});

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('debtTrackerTheme') === 'dark';
    });

    useEffect(() => {
        if (darkMode) {
            localStorage.setItem('debtTrackerTheme', 'dark');
        } else {
            localStorage.setItem('debtTrackerTheme', 'light');
        }
    }, [darkMode]);

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

    const filteredDebts = debts.filter(debt =>
        debt.debtorName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalDebt = filteredDebts.reduce((acc, curr) => {
        const baseAmount = parseFloat(curr.amount || 0);
        const interestVal = parseFloat(curr.interest || 0);
        const totalWithInterest = baseAmount + (baseAmount * (interestVal / 100));
        const balance = totalWithInterest - (curr.amountPaid || 0);
        return curr.status === 'Fully Paid' ? acc : acc + balance;
    }, 0);

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
        try {
            const dataToSave = { ...formData, status: 'Pending' };
            await axios.post('http://localhost:5000/api/debts/add', dataToSave)
            await fetchDebts();
            setFormData({ debtorName: '', amount: '', debtDate: today, dueDate: '', interest: 0 });
        } catch (error) {
            console.error('Error adding debt:', error);
            alert("Failed to add debt. Please check your input and try again.");
        }
    };

    const handleStatusChange = async (id, newStatus, amount = 0) => {
        try {
            const amountToPay = parseFloat(amount || 0);
            await axios.patch(`http://localhost:5000/api/debts/${id}/status`, { status: newStatus, amountPaid: amountToPay });
            fetchDebts();
            setPartialInput({ ...partialInput, [id]: '' });
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update status.");
        }
    };

    return (
        <div className={`min-vh-100 ${darkMode ? 'bg-dark text-white' : 'bg-light'} w-100 vw-100 overflow-hidden transition-all`}>
            {/* Navbar with Total Display */}
            <nav className={`navbar ${darkMode ? 'navbar-dark bg-black' : 'navbar-dark bg-primary'} shadow-sm sticky-top w-100`}>
                <div className="container-fluid px-4">
                    <span className="navbar-brand fw-bold fs-4">DEBT TRACKER</span>
                    <div className="d-flex align-items-center text-white gap-3 ms-auto">
                        <div className="text-end">
                            <small className="d-block opacity-75" style={{ fontSize: '0.7rem' }}>Total</small>
                            <span className="fw-bold fs-5">₱{totalDebt.toLocaleString()}</span>
                        </div>
                        <div className="vr mx-2 opacity-50" style={{ height: '30px' }}></div>
                        <button
                            className={`btn btn-sm ${darkMode ? 'btn-warning' : 'btn-light'} rounded-pill px-3 fw-bold`}
                            onClick={() => setDarkMode(!darkMode)}
                        >
                            {darkMode ? '☀️ Light mode' : '🌙 Dark mode'}
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container-fluid px-0 mx-0 w-100">
                <div className="row g-4 m-0 p-4">
                    {/* Record Form */}
                    <div className="col-lg-3">
                        <div className={`card shadow-sm border-0 sticky-lg-top ${darkMode ? 'bg-secondary text-white shadow-lg' : 'bg-white'}`} style={{ top: '90px' }}>
                            <div className="card-body p-4">
                                <h5 className={`fw-bold mb-4 border-bottom pb-2 ${darkMode ? 'border-dark text-light' : 'text-dark'}`}>Record New Debt</h5>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className={`form-label small fw-bold ${darkMode ? 'text-light' : 'text-dark'}`}>Debtor Name</label>
                                        <input name="debtorName" className={`form-control form-control-sm shadow-none ${darkMode ? 'bg-dark text-white border-dark' : 'bg-white text-dark border-secondary-subtle'}`} placeholder="Who borrowed?" value={formData.debtorName} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className={`form-label small fw-bold ${darkMode ? 'text-light' : 'text-dark'}`}>Amount (PHP)</label>
                                        <input name="amount" type="number" className={`form-control form-control-sm shadow-none ${darkMode ? 'bg-dark text-white border-dark' : 'bg-white text-dark border-secondary-subtle'}`} placeholder="0.00" value={formData.amount} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className={`form-label small fw-bold ${darkMode ? 'text-light' : 'text-dark'}`}>Interest (%) <small className={darkMode ? 'text-white-50' : 'text-muted'} style={{ fontSize: '0.7rem' }}>(Optional)</small></label>
                                        <input name="interest" type="number" className={`form-control form-control-sm shadow-none ${darkMode ? 'bg-dark text-white border-dark' : 'bg-white text-dark border-secondary-subtle'}`} placeholder="0" value={formData.interest} onChange={handleChange} />
                                    </div>
                                    <div className="mb-3">
                                        <label className={`form-label small fw-bold ${darkMode ? 'text-light' : 'text-dark'}`}>Date Borrowed</label>
                                        <input name="debtDate" type="date" className={`form-control form-control-sm shadow-none ${darkMode ? 'bg-dark text-white border-dark' : 'bg-white text-dark border-secondary-subtle'}`} max={today} value={formData.debtDate} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className={`form-label small fw-bold ${darkMode ? 'text-light' : 'text-dark'}`}>Due Date <small className={darkMode ? 'text-white-50' : 'text-muted'} style={{ fontSize: '0.7rem' }}>(Optional)</small></label>
                                        <input name="dueDate" type="date" className={`form-control form-control-sm shadow-none ${darkMode ? 'bg-dark border-dark' : 'bg-white border-secondary-subtle'
                                            } ${!formData.dueDate
                                                ? (darkMode ? 'text-white-50' : 'text-muted')
                                                : (darkMode ? 'text-white' : 'text-dark')
                                            }`} value={formData.dueDate} onChange={handleChange} />
                                    </div>
                                    <button type="submit" className={`btn ${darkMode ? 'btn-info text-dark' : 'btn-primary'} w-100 fw-bold py-2 shadow-sm`}>
                                        Add to Record
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/*Table Side*/}
                    <div className="col-lg-9">
                        <div className={`card shadow-sm border-0 ${darkMode ? 'bg-secondary text-white' : 'bg-white'}`}>
                            <div className="card-body p-4">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                                    <h5 className={`fw-bold mb-0 ${darkMode ? 'text-light' : 'text-dark'}`}>Active Debt List</h5>
                                    <div className="input-group" style={{ maxWidth: '350px' }}>
                                        <input type="text" className={`form-control shadow-none ${darkMode ? 'bg-dark text-white border-secondary' : ''}`} placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                    </div>
                                </div>

                                <table className={`table table-hover align-middle ${darkMode ? 'table-dark' : ''}`}>
                                    <thead className={darkMode ? 'table-dark' : 'table-light border-bottom'}>
                                        <tr className="small">
                                            <th className="text-center">Name & Status</th>
                                            <th className="text-center">Base Amount</th>
                                            <th className="text-center">Interest</th>
                                            <th className="text-center">Date Borrowed</th>
                                            <th className="text-center">Due Date</th>
                                            <th className="text-center">Total Amount</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDebts.length > 0 ? (
                                            filteredDebts.map((debt) => {
                                                const baseAmount = parseFloat(debt.amount || 0);
                                                const interestVal = parseFloat(debt.interest || 0);
                                                const totalWithInterest = baseAmount + (baseAmount * (interestVal / 100));
                                                const remainingBalance = totalWithInterest - (debt.amountPaid || 0);
                                                return (
                                                    <tr key={debt._id} className={darkMode ? 'border-secondary' : ''}>
                                                        <td>
                                                            <div className={`fw-bold ${darkMode ? 'text-light' : 'text-dark'}`}>{debt.debtorName}</div>
                                                            <select
                                                                className={`form-select form-select-sm border-0 fw-bold badge ${debt.status === 'Overdue' ? 'bg-danger' :
                                                                    debt.status === 'Fully Paid' ? 'bg-success text-white' :
                                                                        debt.status === 'Partially Paid' ? 'bg-warning text-dark' : 'bg-secondary text-white'
                                                                    }`}
                                                                style={{ width: 'fit-content', cursor: 'pointer', appearance: 'none', textAlign: 'center' }}
                                                                value={debt.status}
                                                                onChange={(e) => handleStatusChange(debt._id, e.target.value, debt.amountPaid)}
                                                            >
                                                                <option value="Pending">Pending </option>
                                                                <option value="Partially Paid">Partially Paid </option>
                                                                <option value="Fully Paid">Fully Paid </option>
                                                                <option value="Overdue">Overdue </option>
                                                            </select>
                                                            {debt.status === 'Partially Paid' && (
                                                                <div className="mt-2 d-flex gap-1">
                                                                    <input
                                                                        type="number"
                                                                        className="form-control form-control-sm"
                                                                        placeholder="Amt Paid"
                                                                        style={{ width: '80px' }}
                                                                        value={partialInput[debt._id] || ''}
                                                                        onChange={(e) => setPartialInput({ ...partialInput, [debt._id]: e.target.value })}
                                                                    />
                                                                    <button
                                                                        className="btn btn-sm btn-success"
                                                                        onClick={() => handleStatusChange(debt._id, 'Partially Paid', partialInput[debt._id])}
                                                                    >
                                                                        ✓
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="fw-semibold">₱{baseAmount.toLocaleString()}</td>
                                                        <td className="text">{interestVal}%</td>
                                                        <td className="small text">{debt.dueDate || today }</td>
                                                        <td className="small text">{debt.dueDate || 'No Due Date'}</td>
                                                        <td className="fw-bold text-primary">
                                                            {debt.status === 'Fully Paid' ? (
                                                                <span className="text text-decoration-line-through">
                                                                    ₱{totalWithInterest.toLocaleString()}
                                                                </span>
                                                            ) : (
                                                                <>
                                                                    <div>₱{remainingBalance.toLocaleString()}</div>
                                                                    {debt.amountPaid > 0 && (
                                                                        <small className="text-success d-block" style={{ fontSize: '0.7rem' }}>
                                                                            Paid: ₱{debt.amountPaid}
                                                                        </small>
                                                                    )}
                                                                </>
                                                            )}
                                                        </td>
                                                        <td className="text-center px-3">
                                                            <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleDelete(debt._id)}>
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr><td colSpan="7" className={`text-center py-5 ${darkMode ? 'text-white-50 opacity-50' : 'text-muted'}`}>No debt records found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DebtTracker;