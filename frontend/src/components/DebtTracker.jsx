import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DebtTracker.css';

const DebtTracker = ({ darkMode, setHeaderTotal, setHeaderView }) => {
    // --- State & Constants Initialization ---
    const today = new Date().toLocaleDateString('en-CA');

    // Form state for adding new debt records
    const [formData, setFormData] = useState({ debtorName: '', amount: '', debtDate: today, dueDate: '', interest: '' });
    const [debts, setDebts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [partialInput, setPartialInput] = useState({});
    const [sortConfig, setSortConfig] = useState({ key: 'debtorName', direction: 'asc' });
    const [isEditing, setIsEditing] = useState(null);
    const [view, setView] = useState('active');

    // Configuration for payment method badge styles
    const paymentMethods = [
        { label: 'Cash', color: 'bg-success' },
        { label: 'E-Wallet', color: 'bg-primary' },
        { label: 'Bank Transfer', color: 'bg-info text-dark' },
        { label: 'Others', color: 'bg-secondary' }
    ];

    /**
     * Fetch all debt records for the logged-in user from the backend
     */
    const fetchDebts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://recollect-c2bpdeedf6hucjey.southeastasia-01.azurewebsites.net/api/debts/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setDebts(response.data || []);
        } catch (error) {
            console.error('Error fetching debts:', error);
            if (error.response?.status === 401) {
                alert("Session expired. Please login again.");
            }
        }
    };

    // Initial data load on component mount
    useEffect(() => {
        fetchDebts();
    }, []);

    /**
     * Logic to calculate the final amount including interest.
     * Interest is applied if: Overdue, Fully Paid (historical), or if payments exceed base amount.
     */
    const calculateTotalWithSmartInterest = (debt) => {
        if (!debt) return 0;
        const baseAmount = parseFloat(debt.amount || 0);
        const interestVal = parseFloat(debt.interest || 0);
        const amountPaid = parseFloat(debt.amountPaid || 0);
        const isPastDueDate = debt.dueDate && today > debt.dueDate;
        const shouldApplyInterest = (
            isPastDueDate ||
            debt.status === 'Overdue' ||
            amountPaid > baseAmount ||
            debt.status === 'Fully Paid'
        ) && interestVal > 0;

        // Ensure we display the actual paid amount if it was a settled overpayment
        if (debt.status === 'Fully Paid' && amountPaid > baseAmount) {
            return amountPaid;
        }

        const appliedInterest = shouldApplyInterest ? (baseAmount * (interestVal / 100)) : 0;
        return baseAmount + appliedInterest;
    };

    /**
     * Filter master list based on search term (Search across Name, Status, Dates, and Amounts)
     */
    const filteredDebts = debts.filter(debt => {
        if (!debt) return false;
        const search = searchTerm.toLowerCase();
        const totalWithInterest = calculateTotalWithSmartInterest(debt);
        const remainingBalance = totalWithInterest - (debt.amountPaid || 0);
        const dueDateDisplay = debt.dueDate || "no due date";

        return (
            (debt.debtorName || "").toLowerCase().includes(search) ||
            (debt.status || "").toLowerCase().includes(search) ||
            dueDateDisplay.toLowerCase().includes(search) ||
            (debt.debtDate || "").toLowerCase().includes(search) ||
            debt.amount.toString().includes(search) ||
            (debt.interest && debt.interest.toString().includes(search)) ||
            totalWithInterest.toString().includes(search) ||
            remainingBalance.toString().includes(search)
        );
    });

    /**
     * Sets the sorting column and toggles direction
     */
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    /**
     * Apply sorting to the filtered list
     */
    const sortedDebts = [...filteredDebts].sort((a, b) => {
        let aValue, bValue;
        // Custom logic for sorting by calculated total balance
        if (sortConfig.key === 'totalAmount') {
            aValue = calculateTotalWithSmartInterest(a) - (a.amountPaid || 0);
            bValue = calculateTotalWithSmartInterest(b) - (b.amountPaid || 0);
        } else {
            aValue = a[sortConfig.key];
            bValue = b[sortConfig.key];
        }
        // Handle numeric sorting for amount and interest strings
        if (['amount', 'interest'].includes(sortConfig.key)) {
            aValue = parseFloat(aValue || 0);
            bValue = parseFloat(bValue || 0);
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    /**
     * Split sorted debts into "Active" or "History" based on the selected view toggle
     */
    const displayDebts = sortedDebts.filter(debt => {
        if (view === 'active') {
            return debt.status !== 'Fully Paid';
        } else {
            return debt.status === 'Fully Paid';
        }
    });

    /**
     * Calculate aggregate totals to be displayed in the App Header
     */
    const totalDebt = displayDebts.reduce((acc, curr) => {
        const totalWithInterest = calculateTotalWithSmartInterest(curr);
        if (view === 'active') {
            const balance = totalWithInterest - (curr.amountPaid || 0);
            return acc + balance;
        } else {
            return acc + (curr.amountPaid || 0);
        }
    }, 0);

    // Synchronize local total/view with the parent App header
    useEffect(() => {
        setHeaderTotal(totalDebt);
        setHeaderView(view);
    }, [totalDebt, view, setHeaderTotal, setHeaderView]);

    /**
     * Handle input changes for the "Add Debt" form
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    /**
     * API call to delete a record with user confirmation
     */
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this debt record?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`https://recollect-c2bpdeedf6hucjey.southeastasia-01.azurewebsites.net/api/debts/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                await fetchDebts();
            } catch (error) {
                console.error('Error deleting debt:', error);
                alert("Delete failed. Please try again.");
            }
        }
    };

    /**
     * Form submission handler to create a new debt record
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.dueDate && formData.dueDate < formData.debtDate) {
            return alert("Due Date cannot be earlier than Date Borrowed.");
        }
        if (parseFloat(formData.amount) <= 0) {
            return alert("Amount must be greater than zero.");
        }
        try {
            const token = localStorage.getItem('token');
            const dataToSave = {
                ...formData,
                amount: parseFloat(formData.amount),
                status: 'Unpaid',
                paymentMethod: 'Cash',
                amountPaid: 0
            };
            await axios.post('https://recollect-c2bpdeedf6hucjey.southeastasia-01.azurewebsites.net/api/debts/add', dataToSave, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await fetchDebts();
            setFormData({ debtorName: '', amount: '', debtDate: today, dueDate: '', interest: '0' });
        } catch (error) {
            console.error('Error adding debt:', error.response?.data || error);
            alert("Failed to add debt. Please check your input and try again.");
        }
    };

    /**
     * Update the status of a debt (Unpaid, Partially Paid, Fully Paid, Overdue)
     */
    const handleStatusChange = async (id, newStatus, amount = 0) => {
        const debt = debts.find(d => d._id === id);
        if (!debt) return;
        // If "Partially Paid" is selected, trigger the inline input field
        if (newStatus === 'Partially Paid') {
            setIsEditing(id);
            return;
        }
        const token = localStorage.getItem('token');
        const totalWithInterest = calculateTotalWithSmartInterest(debt);
        let updateData = {
            status: newStatus,
            // If fully paid, set amountPaid to the full calculated total
            amountPaid: newStatus === 'Fully Paid' ? totalWithInterest : (newStatus === 'Unpaid' ? 0 : debt.amountPaid)
        };
        if (newStatus === 'Fully Paid') {
            updateData.datePaid = new Date().toLocaleDateString('en-CA');
            updateData.paymentMethod = 'Cash';
        }
        try {
            await axios.patch(`https://recollect-c2bpdeedf6hucjey.southeastasia-01.azurewebsites.net/api/debts/${id}/status`, updateData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setIsEditing(null);
            fetchDebts();
        } catch (error) {
            alert("Update failed.");
        }
    };

    /**
     * Update payment method for settled debts (Historical View)
     */
    const handleMethodChange = async (id, newMethod) => {
        const debt = debts.find(d => d._id === id);
        if (!debt) return;
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`https://recollect-c2bpdeedf6hucjey.southeastasia-01.azurewebsites.net/api/debts/${id}/status`, {
                status: debt.status,
                amountPaid: debt.amountPaid,
                paymentMethod: newMethod
            }, { headers: { 'Authorization': `Bearer ${token}` } });
            fetchDebts();
        } catch (error) {
            console.error("Update failed:", error);
            alert("Method update failed. Please try again.");
        }
    };

    return (
        <div className={`min-vh-100 ${darkMode ? 'bg-dark text-white' : 'bg-light'} w-100 overflow-hidden transition-all`}>
            <div className="container-fluid px-md-4 px-2 py-4">
                <div className="row g-4">
                    {/* Record Form */}
                    <div className="col-12 col-xxl-3">
                        <div className={`card shadow-sm border-0 sticky-xxl-top ${darkMode ? 'bg-secondary text-white shadow-lg' : 'bg-white'}`} style={{ top: '20px' }}>
                            <div className="card-body p-4">
                                <h5 className={`fw-bold mb-4 border-bottom pb-2 ${darkMode ? 'border-dark text-light' : 'text-dark'}`}>Record New Debt</h5>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Debtor Name</label>
                                        <input name="debtorName" className={`form-control form-control-sm shadow-none ${darkMode ? 'bg-dark text-white border-dark' : ''}`} placeholder="Who borrowed?" value={formData.debtorName} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Amount (PHP)</label>
                                        <input name="amount" type="number" className={`form-control form-control-sm shadow-none ${darkMode ? 'bg-dark text-white border-dark' : ''}`} placeholder="0.00" value={formData.amount} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Interest (%)</label>
                                        <input name="interest" type="number" className={`form-control form-control-sm shadow-none ${darkMode ? 'bg-dark text-white border-dark' : ''}`} placeholder="0" value={formData.interest} onChange={handleChange} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Date Borrowed</label>
                                        <input name="debtDate" type="date" className={`form-control form-control-sm shadow-none ${darkMode ? 'bg-dark text-white border-dark' : ''}`} max={today} value={formData.debtDate} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Due Date</label>
                                        <input name="dueDate" type="date" className={`form-control form-control-sm shadow-none ${darkMode ? 'bg-dark border-dark text-white' : ''}`} value={formData.dueDate} onChange={handleChange} />
                                    </div>
                                    <button type="submit" className={`btn ${darkMode ? 'btn-primary text-white' : 'btn-primary'} w-100 fw-bold py-2 shadow-sm`}>Add to Record</button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* --- Main Content: Debt Table --- */}
                    <div className="col-12 col-xxl-9">
                        <div className={`card shadow-sm border-0 w-100 ${darkMode ? 'bg-secondary text-white' : 'bg-white'}`}>
                            <div className="card-body p-2 p-md-4">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                                    <div className="btn-group shadow-sm">
                                        <button className={`btn btn-sm ${view === 'active' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setView('active')}>Active List</button>
                                        <button className={`btn btn-sm ${view === 'history' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setView('history')}>History</button>
                                    </div>
                                    <div className="input-group" style={{ maxWidth: '350px' }}>
                                        <input type="text" className={`form-control shadow-none ${darkMode ? 'bg-dark text-white border-secondary' : ''}`} placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                    </div>
                                </div>

                                <div className="table-responsive" style={{ borderRadius: '8px' }}>
                                    <table className={`table table-hover align-middle mb-0 ${darkMode ? 'table-dark' : ''}`}>
                                        <thead className={darkMode ? 'table-dark' : 'table-light border-bottom'}>
                                            <tr className="small text-nowrap">
                                                <th onClick={() => requestSort('debtorName')} style={{ cursor: 'pointer', minWidth: '150px' }} className="text-center px-3">
                                                    Name & Status <span className="opacity-50">{sortConfig.key === 'debtorName' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span>
                                                </th>
                                                <th onClick={() => requestSort('amount')} style={{ cursor: 'pointer' }} className="text-center px-2">
                                                    Base Amount <span className="opacity-50">{sortConfig.key === 'amount' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span>
                                                </th>
                                                <th onClick={() => requestSort('interest')} style={{ cursor: 'pointer' }} className="text-center px-2">
                                                    Interest <span className="opacity-50">{sortConfig.key === 'interest' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span>
                                                </th>
                                                <th onClick={() => requestSort('debtDate')} style={{ cursor: 'pointer' }} className="text-center px-2">
                                                    Borrowed <span className="opacity-50">{sortConfig.key === 'debtDate' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span>
                                                </th>
                                                <th onClick={() => requestSort('dueDate')} style={{ cursor: 'pointer' }} className="text-center px-2">
                                                    {view === 'active' ? 'Due Date' : 'Date Settled'} <span className="opacity-50">{sortConfig.key === 'dueDate' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span>
                                                </th>
                                                <th onClick={() => requestSort('totalAmount')} style={{ cursor: 'pointer' }} className="text-center px-3">
                                                    Total <span className="opacity-50">{sortConfig.key === 'totalAmount' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span>
                                                </th>
                                                {view === 'history' && <th className="text-center px-3" style={{ minWidth: '130px' }}>Method</th>}
                                                <th className="text-center px-3" style={{ width: '70px' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displayDebts.length > 0 ? (
                                                displayDebts.map((debt) => {
                                                    const baseAmount = parseFloat(debt.amount || 0);
                                                    const totalWithInterest = calculateTotalWithSmartInterest(debt);
                                                    const remainingBalance = totalWithInterest - (debt.amountPaid || 0);
                                                    const isPastDue = debt.dueDate && today > debt.dueDate;
                                                    const displayStatus = (isPastDue && debt.status !== 'Fully Paid') ? 'Overdue' : debt.status;

                                                    return (
                                                        <tr key={debt._id} className={darkMode ? 'border-secondary' : ''}>
                                                            <td className="text-center">
                                                                <div className={`fw-bold small ${darkMode ? 'text-light' : 'text-dark'}`}>{debt.debtorName}</div>
                                                                <div className="d-flex justify-content-center mt-1">
                                                                    <div onClick={() => debt.status === 'Partially Paid' && setIsEditing(debt._id)} style={{ cursor: 'pointer', width: 'fit-content' }}>
                                                                        <select
                                                                            className={`form-select form-select-sm border-0 fw-bold badge no-arrow ${displayStatus === 'Overdue' ? 'bg-danger' : debt.status === 'Fully Paid' ? 'bg-success text-white' : debt.status === 'Partially Paid' ? 'bg-warning text-dark' : 'bg-secondary text-white'}`}
                                                                            style={{ width: 'fit-content', appearance: 'none', textAlign: 'center', backgroundColor: 'inherit', color: 'inherit', fontSize: '0.7rem' }}
                                                                            value={displayStatus}
                                                                            disabled={debt.status === 'Fully Paid'}
                                                                            onChange={(e) => handleStatusChange(debt._id, e.target.value, debt.amountPaid)}
                                                                        >
                                                                            {displayStatus !== 'Overdue' && (
                                                                                <option value="Unpaid" className={darkMode ? 'bg-dark text-white' : 'bg-white text-dark'}>Unpaid</option>
                                                                            )}
                                                                            <option value="Partially Paid" className={darkMode ? 'bg-dark text-white' : 'bg-white text-dark'}>Partially Paid</option>
                                                                            <option value="Fully Paid" className={darkMode ? 'bg-dark text-white' : 'bg-white text-dark'}>Fully Paid</option>
                                                                            <option value="Overdue" className={darkMode ? 'bg-dark text-white' : 'bg-white text-dark'}>Overdue</option>
                                                                        </select>
                                                                    </div>
                                                                </div>

                                                                {isEditing === debt._id && (
                                                                    <div className="mt-2 d-flex gap-1 justify-content-center animate__animated animate__fadeIn">
                                                                        <input type="number" className={`form-control form-control-sm ${darkMode ? 'bg-dark text-white border-secondary' : ''}`} style={{ width: '60px', fontSize: '0.75rem' }} placeholder="Amt" autoFocus value={partialInput[debt._id] || ''} onChange={(e) => setPartialInput({ ...partialInput, [debt._id]: e.target.value })}
                                                                            onBlur={() => { if (!partialInput[debt._id]) setIsEditing(null); }} />
                                                                        <button className="btn btn-sm btn-success py-0 px-2" onClick={async () => {
                                                                            const inputVal = parseFloat(partialInput[debt._id] || 0);
                                                                            if (inputVal <= 0) return alert("Enter valid amount");
                                                                            const totalToPay = calculateTotalWithSmartInterest(debt);
                                                                            const currentAmountPaid = debt.amountPaid || 0;
                                                                            const remainingBalance = totalToPay - currentAmountPaid;
                                                                            if (inputVal > remainingBalance) return alert(`Payment exceeds balance!`);
                                                                            const newTotalPaid = (debt.amountPaid || 0) + inputVal;
                                                                            let finalStatus = newTotalPaid >= totalToPay ? 'Fully Paid' : (debt.status === 'Overdue' ? 'Overdue' : 'Partially Paid');
                                                                            try {
                                                                                const token = localStorage.getItem('token');
                                                                                await axios.patch(`https://recollect-c2bpdeedf6hucjey.southeastasia-01.azurewebsites.net/api/debts/${debt._id}/status`,
                                                                                    {
                                                                                        status: finalStatus,
                                                                                        amountPaid: newTotalPaid,
                                                                                        datePaid: finalStatus === 'Fully Paid' ? today : null
                                                                                    },
                                                                                    {
                                                                                        headers: { 'Authorization': `Bearer ${token}` }
                                                                                    }
                                                                                );
                                                                                setIsEditing(null);
                                                                                setPartialInput({ ...partialInput, [debt._id]: '' });
                                                                                fetchDebts();
                                                                            } catch (e) { alert("Error saving payment"); }
                                                                        }}>✓</button>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="fw-semibold text-center small">₱{baseAmount.toLocaleString()}</td>
                                                            <td className="text-center small">{debt.interest}%</td>
                                                            <td className="text-center small">{debt.debtDate}</td>
                                                            <td className="text-center small">{view === 'active' ? (debt.dueDate || 'No Due Date') : (debt.datePaid || debt.dueDate)}</td>
                                                            <td className="fw-bold text-primary text-center small text-nowrap">
                                                                {debt.status === 'Fully Paid' ? <span className="text-success">₱{totalWithInterest.toLocaleString()}</span> :
                                                                    (<><div>₱{remainingBalance.toLocaleString()}</div>{debt.amountPaid > 0 && <small className="text-success d-block" style={{ fontSize: '0.65rem' }}>Paid: ₱{debt.amountPaid}</small>}</>)}
                                                            </td>
                                                            {view === 'history' && (
                                                                <td className="text-center px-1">
                                                                    {(() => {
                                                                        const currentMethod = paymentMethods.find(m => m.label === (debt.paymentMethod || 'Cash')) || paymentMethods[0];
                                                                        return (
                                                                            <select className={`form-select form-select-sm border-0 fw-bold badge no-arrow ${currentMethod.color} text-white`} style={{ width: 'fit-content', margin: '0 auto', appearance: 'none', textAlign: 'center', cursor: 'pointer', fontSize: '0.65rem', padding: '0.2rem 0.4rem' }} value={debt.paymentMethod || 'Cash'} onChange={(e) => handleMethodChange(debt._id, e.target.value)}>
                                                                                {paymentMethods.map((m) => (<option key={m.label} value={m.label} className={darkMode ? 'bg-dark text-white' : 'bg-white text-dark'}>{m.label}</option>))}
                                                                            </select>
                                                                        );
                                                                    })()}
                                                                </td>
                                                            )}
                                                            <td className="text-center">
                                                                <button className="btn btn-sm btn-outline-danger border-0 p-1" onClick={() => handleDelete(debt._id)} title="Delete Record"><i className="bi bi-trash3-fill"></i></button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr><td colSpan={view === 'history' ? 8 : 7} className={`text-center py-5 ${darkMode ? 'text-white-50 opacity-50' : 'text-muted'}`}>No records found.</td></tr>
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