import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DebtTracker.css';

const DebtTracker = () => {
    const today = new Date().toLocaleDateString('en-CA');
    const [formData, setFormData] = useState({ debtorName: '', amount: '', debtDate: today, dueDate: '', interest: '' });
    const [debts, setDebts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [partialInput, setPartialInput] = useState({});
    const [sortConfig, setSortConfig] = useState({ key: 'debtorName', direction: 'asc' });
    const [isEditing, setIsEditing] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

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

    const calculateTotalWithSmartInterest = (debt) => {
        const baseAmount = parseFloat(debt.amount || 0);
        const interestVal = parseFloat(debt.interest || 0);
        const amountPaid = parseFloat(debt.amountPaid || 0);
        const isPastDue = debt.dueDate && today > debt.dueDate;
        const shouldApplyInterest = (isPastDue || amountPaid > baseAmount || debt.status === 'Fully Paid') && interestVal > 0;
        if (debt.status === 'Fully Paid' && amountPaid > baseAmount) {
            return amountPaid;
        }

        const appliedInterest = shouldApplyInterest ? (baseAmount * (interestVal / 100)) : 0;
        return baseAmount + appliedInterest;
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedDebts = [...filteredDebts].sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (['amount', 'interest'].includes(sortConfig.key)) {
            aValue = parseFloat(aValue || 0);
            bValue = parseFloat(bValue || 0);
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const totalDebt = filteredDebts.reduce((acc, curr) => {
        if (curr.status === 'Fully Paid') return acc;
        const totalWithInterest = calculateTotalWithSmartInterest(curr);
        const balance = totalWithInterest - (curr.amountPaid || 0);
        return acc + balance;
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

        if (parseFloat(formData.interest) < 0) {
            return alert("Interest cannot be negative.");
        }

        if (formData.dueDate && formData.dueDate < formData.debtDate) {
            return alert("Due date cannot be earlier than the borrowed date.");
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
        const debt = debts.find(d => d._id === id);
        if (!debt) return;

        const totalWithInterest = calculateTotalWithSmartInterest(debt);
        const currentPaid = parseFloat(debt.amountPaid || 0);

        if (newStatus === 'Partially Paid') {
            setIsEditing(id);
            return;
        }

        let finalAmountPaid = currentPaid;
        
        if (newStatus === 'Fully Paid') {
            finalAmountPaid = totalWithInterest;
        } else if (newStatus === 'Pending') {
            finalAmountPaid = 0;
        }

        try {
            await axios.patch(`http://localhost:5000/api/debts/${id}/status`, {
                status: newStatus,
                amountPaid: finalAmountPaid
            });
            setIsEditing(null);
            fetchDebts();
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
                        <div className="px-3 d-none d-md-block text-center">
                            <div className="small fw-bold" style={{ fontSize: '0.8rem', lineHeight: '1' }}>
                                {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <small className="opacity-75" style={{ fontSize: '0.7rem' }}>
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </small>
                        </div>
                        <div className="vr opacity-25 d-none d-md-block" style={{ height: '30px' }}></div>
                        <button
                            className={`btn btn-sm ${darkMode ? 'btn-warning' : 'btn-light'} rounded-pill px-3 fw-bold`}
                            onClick={() => setDarkMode(!darkMode)}
                        >
                            {darkMode ? '☀️' : '🌙'}
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
                                            <th onClick={() => requestSort('debtorName')} style={{ cursor: 'pointer', transition: 'all 0.2s' }} className="text-center">
                                                Name & Status
                                                <span className="ms-1 opacity-50" style={{ fontSize: '0.8rem' }}>
                                                    {sortConfig.key === 'debtorName' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                                                </span></th>
                                            <th onClick={() => requestSort('amount')} style={{ cursor: 'pointer' }} className="text-center">
                                                Base Amount
                                                <span className="ms-1 opacity-50" style={{ fontSize: '0.8rem' }}>
                                                    {sortConfig.key === 'amount' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                                                </span></th>
                                            <th className="text-center">Interest</th>
                                            <th onClick={() => requestSort('debtDate')} style={{ cursor: 'pointer' }} className="text-center">
                                                Borrowed
                                                <span className="ms-1 opacity-50" style={{ fontSize: '0.8rem' }}>
                                                    {sortConfig.key === 'debtDate' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                                                </span></th>
                                            <th onClick={() => requestSort('dueDate')} style={{ cursor: 'pointer' }} className="text-center">
                                                Due Date
                                                <span className="ms-1 opacity-50" style={{ fontSize: '0.8rem' }}>
                                                    {sortConfig.key === 'dueDate' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                                                </span></th>
                                            <th className="text-center">Total Amount</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedDebts.length > 0 ? (
                                            sortedDebts.map((debt) => {
                                                const baseAmount = parseFloat(debt.amount || 0);
                                                const totalWithInterest = calculateTotalWithSmartInterest(debt);
                                                const remainingBalance = totalWithInterest - (debt.amountPaid || 0);

                                                const isPastDue = debt.dueDate && today > debt.dueDate;
                                                const displayStatus = (isPastDue && debt.status !== 'Fully Paid') ? 'Overdue' : debt.status;

                                                return (
                                                    <tr key={debt._id} className={darkMode ? 'border-secondary' : ''}>
                                                        <td>
                                                            <div className={`fw-bold ${darkMode ? 'text-light' : 'text-dark'}`}>{debt.debtorName}</div>
                                                            <div
                                                                onClick={() => {
                                                                    if (debt.status === 'Partially Paid') {
                                                                        setIsEditing(debt._id);
                                                                    }
                                                                }}
                                                                style={{ cursor: debt.status === 'Fully Paid' ? 'not-allowed' : 'pointer', width: 'fit-content' }}
                                                            >
                                                                <select
                                                                    className={`form-select form-select-sm border-0 fw-bold badge ${displayStatus === 'Overdue' ? 'bg-danger' :
                                                                        debt.status === 'Fully Paid' ? 'bg-success text-white' :
                                                                            debt.status === 'Partially Paid' ? 'bg-warning text-dark' : 'bg-secondary text-white'
                                                                        }`}
                                                                    style={{
                                                                        width: 'fit-content',
                                                                        appearance: 'none',
                                                                        textAlign: 'center',
                                                                        pointerEvents: debt.status === 'Partially Paid' ? 'none' : 'auto'
                                                                    }}
                                                                    value={displayStatus}
                                                                    disabled={debt.status === 'Fully Paid'}
                                                                    onChange={(e) => handleStatusChange(debt._id, e.target.value, debt.amountPaid)}
                                                                >
                                                                    {!(debt.status === 'Partially Paid' || displayStatus === 'Overdue' || debt.amountPaid > 0) && (
                                                                        <option value="Pending">Pending</option>
                                                                    )}
                                                                    <option value="Partially Paid">Partially Paid</option>
                                                                    <option value="Fully Paid">Fully Paid</option>
                                                                    <option value="Overdue">Overdue</option>
                                                                </select>
                                                            </div>

                                                            {(isEditing === debt._id) && (
                                                                <div className="mt-2 d-flex gap-1 animate__animated animate__fadeIn">
                                                                    <input
                                                                        type="number"
                                                                        className={`form-control form-control-sm ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                                                                        placeholder="Amt Paid"
                                                                        style={{ width: '80px' }}
                                                                        value={partialInput[debt._id] || ''}
                                                                        autoFocus
                                                                        onChange={(e) => setPartialInput({ ...partialInput, [debt._id]: e.target.value })}
                                                                        onBlur={() => {
                                                                            setTimeout(() => {
                                                                                if (!partialInput[debt._id]) {
                                                                                    setIsEditing(null);
                                                                                }
                                                                            }, 250);
                                                                        }}
                                                                    />

                                                                    <button
                                                                        className="btn btn-sm btn-success"
                                                                        onClick={async () => {
                                                                            const inputVal = parseFloat(partialInput[debt._id] || 0);
                                                                            if (inputVal <= 0) return alert("Enter valid amount");
                                                                            const totalWithInterest = calculateTotalWithSmartInterest(debt);
                                                                            const previousPaid = parseFloat(debt.amountPaid || 0);
                                                                            let newTotalPaid = previousPaid + inputVal;

                                                                            let statusToSave = 'Partially Paid';
                                                                            if (newTotalPaid >= totalWithInterest) {
                                                                                statusToSave = 'Fully Paid';
                                                                                newTotalPaid = totalWithInterest;
                                                                            }

                                                                            try {
                                                                                await axios.patch(`http://localhost:5000/api/debts/${debt._id}/status`, { status: statusToSave, amountPaid: newTotalPaid });
                                                                                setIsEditing(null);
                                                                                setPartialInput({ ...partialInput, [debt._id]: '' });
                                                                                fetchDebts();
                                                                            } catch (error) {
                                                                                alert("Update failed");
                                                                            }
                                                                        }}
                                                                    >
                                                                        ✓
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="fw-semibold">₱{baseAmount.toLocaleString()}</td>
                                                        <td className="text">{debt.interest}%</td>
                                                        <td className="small text">{debt.dueDate || today}</td>
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
                                                                            Paid: ₱{debt.amountPaid.toLocaleString()}
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