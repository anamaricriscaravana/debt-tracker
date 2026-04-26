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
        <div>
            <h1>Expense Tracker</h1>
            <form onSubmit={handleSubmit}>
                <input name="item" placeholder="Item" value={formData.item} onChange={handleChange} required />
                <input name="amount" placeholder="Amount" value={formData.amount} onChange={handleChange} required />
                <select name="category" value={formData.category} onChange={handleChange} required>
                    <option value="">Select Category</option>
                    <option value="Food">Food</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Entertainment">Entertainment</option>
                </select>
                <input name="date" type="date" value={formData.date} onChange={handleChange} required/>
                <button type="submit">Save</button>
            </form>

            <hr />

            <ul>
                {expenses.map((exp, i ) => (
                    <li key={i}>{exp.item} - ₱{exp.amount} ({exp.date})</li>
                ))}
            </ul>
        </div>
    );
};

export default ExpenseForm;