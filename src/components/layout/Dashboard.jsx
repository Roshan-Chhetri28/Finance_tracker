import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { address } from "../../api/axiosConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const Dashboard = () => {
    // step 1: insert income and expenses (i.e. transaction)
    const [addTransaction, setAddTransaction] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [transactionData, setTransactionData] = useState({
        type: '',
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
    });

    const onChange = (e) => {
        const { name, value } = e.target;
        setTransactionData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTransactionSubmit = async (e) => {
        e.preventDefault();
        // Validate form
        if (!transactionData.type || !transactionData.amount || !transactionData.description || !transactionData.category) {
            alert('Please fill in all required fields');
            return;
        }
        
        setIsSubmitting(true);
        try {
            await axios.post(`${address}/api/transaction`, {
                ...transactionData,
                amount: Number(transactionData.amount)
            });
            
            // Refresh transactions to get the latest data
            await fetchTransactions();
            
            // Clear form after successful submission
            setTransactionData({
                type: '',
                amount: '',
                description: '',
                category: '',
                date: new Date().toISOString().split('T')[0]
            });
            setAddTransaction(false);
            alert('Transaction added successfully');
        } catch (error) {
            console.error(error);
            alert('Failed to add transaction');
        } finally {
            setIsSubmitting(false);
        }
    }

    // step 2: fetch income and expenses this month
    const [income, setIncome] = useState(0);
    const [expense, setExpense] = useState(0);
    const [transactions, setTransactions] = useState([]);

    const fetchTransactions = async () => {
        try {
            // Get all transactions
            const response = await axios.get(`${address}/api/transactions`);
            const transactions = response.data.transactions; // Access the transactions array from the response
            setTransactions(transactions);

            // Calculate totals
            let totalIncome = 0;
            let totalExpense = 0;

            if (Array.isArray(transactions)) {
                transactions.forEach(transaction => {
                    if (transaction.type === 'income') {
                        totalIncome += Number(transaction.amount);
                    } else if (transaction.type === 'expense') {
                        totalExpense += Number(transaction.amount);
                    }
                });
            }

            setIncome(totalIncome);
            setExpense(totalExpense);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setTransactions([]); // Set empty array on error
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);


    // step 3: fetch balance remaining






    // Add categories for transactions
    const categories = [
        { name: 'Salary', type: 'income' },
        { name: 'Freelance', type: 'income' },
        { name: 'Investment', type: 'income' },
        { name: 'Other Income', type: 'income' },
        { name: 'Food & Dining', type: 'expense' },
        { name: 'Transportation', type: 'expense' },
        { name: 'Shopping', type: 'expense' },
        { name: 'Entertainment', type: 'expense' },
        { name: 'Bills & Utilities', type: 'expense' },
        { name: 'Healthcare', type: 'expense' },
        { name: 'Education', type: 'expense' },
        { name: 'Other Expense', type: 'expense' }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-green-100 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-green-800">Total Balance</h3>
                        <p className="text-2xl font-bold text-green-900">${(income - expense).toFixed(2)}</p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-blue-800">Income</h3>
                        <p className="text-2xl font-bold text-blue-900">${income.toFixed(2)}</p>
                    </div>
                    <div className="bg-red-100 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-red-800">Expenses</h3>
                        <p className="text-2xl font-bold text-red-900">${expense.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Transactions</h2>
                    <FontAwesomeIcon icon={faPlus} className="w-5 h-5 text-gray-600" onClick={() => {
                        setAddTransaction(prev => !prev)
                    }} />
                </div>
                {addTransaction ?
                    <>
                        <form className="w-full space-y-4 p-4 bg-gray-50 rounded-lg" onSubmit={handleTransactionSubmit}>
                            <div className="flex flex-col space-y-2">
                                <label htmlFor="type" className="font-medium text-gray-700">Transaction Type *</label>
                                <div className="flex space-x-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="income"
                                            checked={transactionData.type === 'income'}
                                            onChange={onChange}
                                            className="form-radio text-blue-600"
                                            required
                                        />
                                        <span className="ml-2">Income</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="expense"
                                            checked={transactionData.type === 'expense'}
                                            onChange={onChange}
                                            className="form-radio text-red-600"
                                            required
                                        />
                                        <span className="ml-2">Expense</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div className="flex flex-col space-y-2">
                                <label htmlFor="category" className="font-medium text-gray-700">Category</label>
                                <select 
                                    name="category" 
                                    id="category"
                                    value={transactionData.category}
                                    onChange={onChange}
                                    className="form-select rounded-md border-gray-300 shadow-sm"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories
                                        .filter(cat => !transactionData.type || cat.type === transactionData.type)
                                        .map((category, index) => (
                                            <option key={index} value={category.name}>
                                                {category.name}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>

                            <div className="flex flex-col space-y-2">
                                <label htmlFor="amount" className="font-medium text-gray-700">Amount</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={transactionData.amount}
                                    onChange={onChange}
                                    placeholder="Enter amount"
                                    className="form-input rounded-md border-gray-300 shadow-sm"
                                />
                            </div>

                            <div className="flex flex-col space-y-2">
                                <label htmlFor="description" className="font-medium text-gray-700">Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={transactionData.description}
                                    onChange={onChange}
                                    placeholder="Enter description"
                                    className="form-input rounded-md border-gray-300 shadow-sm"
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setAddTransaction(false)}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-4 py-2 text-white rounded-md ${
                                        isSubmitting 
                                            ? 'bg-blue-400 cursor-not-allowed' 
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                    {isSubmitting ? 'Adding...' : 'Add Transaction'}
                                </button>
                            </div>
                        </form>
                    </> :
                    <div className="space-y-4">
                        {transactions.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No transactions found</p>
                        ) : (
                            transactions.map((transaction, index) => (
                                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-gray-800">{transaction.description}</h3>
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm text-gray-500">
                                                {new Date(transaction.date).toLocaleDateString()}
                                            </p>
                                            <span className="text-sm text-gray-500">•</span>
                                            <p className="text-sm text-gray-500">{transaction.category}</p>
                                        </div>
                                    </div>
                                    <span className={`font-medium ${
                                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                }
            </div>
        </div>
    )
}

export default Dashboard;
