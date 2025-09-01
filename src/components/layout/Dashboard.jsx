import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { fetchTransactions, addTransaction } from "../../features/transactions/transactionSlice";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from "chart.js"

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// Chart data preparation utility functions
const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

// Generate colors based on the number of categories
const generateColors = (count) => {
    const baseColors = [
        'rgba(54, 162, 235, 0.6)', // blue
        'rgba(255, 99, 132, 0.6)', // red
        'rgba(75, 192, 192, 0.6)', // teal
        'rgba(255, 206, 86, 0.6)', // yellow
        'rgba(153, 102, 255, 0.6)', // purple
        'rgba(255, 159, 64, 0.6)', // orange
        'rgba(199, 199, 199, 0.6)' // grey
    ];
    
    const colors = [...baseColors];
    // Generate additional colors if needed
    while (colors.length < count) {
        colors.push(`rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`);
    }
    
    return colors.slice(0, count);
};

// Prepare data for pie charts
const preparePieChartData = (transactions, type) => {
    // Filter by type (income or expense)
    const filteredTransactions = transactions.filter(t => t.type === type);
    
    // Group by category
    const categories = {};
    filteredTransactions.forEach(transaction => {
        if (!categories[transaction.category]) {
            categories[transaction.category] = 0;
        }
        categories[transaction.category] += Number(transaction.amount);
    });
    
    const categoryNames = Object.keys(categories);
    const colors = generateColors(categoryNames.length);
    
    return {
        labels: categoryNames,
        datasets: [
            {
                data: Object.values(categories),
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('0.6', '1')),
                borderWidth: 1
            }
        ]
    };
};

// Prepare data for bar chart showing income and expenses by day
const prepareBarChartData = (transactions) => {
    // Get the current month's transactions
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthTransactions = transactions.filter(t => {
        const date = new Date(t.created_at || t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    // Group by date
    const dailyData = {};
    monthTransactions.forEach(transaction => {
        const date = new Date(transaction.created_at || transaction.date);
        const day = date.getDate();
        const dateKey = day.toString();
        
        if (!dailyData[dateKey]) {
            dailyData[dateKey] = { income: 0, expense: 0, date: dateKey };
        }
        
        if (transaction.type === 'income') {
            dailyData[dateKey].income += Number(transaction.amount);
        } else {
            dailyData[dateKey].expense += Number(transaction.amount);
        }
    });
    
    // Convert to arrays for chart.js
    const dates = Object.keys(dailyData).sort((a, b) => Number(a) - Number(b));
    const incomeData = dates.map(date => dailyData[date].income);
    const expenseData = dates.map(date => dailyData[date].expense);
    
    return {
        labels: dates,
        datasets: [
            {
                label: 'Income',
                data: incomeData,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            },
            {
                label: 'Expenses',
                data: expenseData,
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }
        ]
    };
};

// Find top categories by amount
const findTopCategories = (transactions, type, limit = 3) => {
    const filteredTransactions = transactions.filter(t => t.type === type);
    
    // Group by category and sum amounts
    const categories = {};
    filteredTransactions.forEach(transaction => {
        if (!categories[transaction.category]) {
            categories[transaction.category] = 0;
        }
        categories[transaction.category] += Number(transaction.amount);
    });
    
    // Convert to array and sort by amount
    return Object.entries(categories)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, limit);
};

const Dashboard = () => {
    // Use Redux state
    const dispatch = useDispatch();
    const { income, expenses, incomeList, expenseList, isLoading, error } = useSelector(state => state.transactions);
    
    // Local component state
    const [showAddForm, setShowAddForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
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
            // Use the Redux action to add a transaction
            const result = await dispatch(addTransaction({
                ...transactionData,
                amount: Number(transactionData.amount)
            }));
            
            if (result.success) {
                // Clear form after successful submission
                setTransactionData({
                    type: '',
                    amount: '',
                    description: '',
                    category: '',
                    date: new Date().toISOString().split('T')[0]
                });
                setShowAddForm(false);
                alert('Transaction added successfully');
            } else {
                alert('Failed to add transaction');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to add transaction');
        } finally {
            setIsSubmitting(false);
        }
    }

    // Fetch transactions when component mounts
    useEffect(() => {
        // Get current month and year for filtering
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
        const currentYear = now.getFullYear();
        
        // Fetch transactions for current month only
        dispatch(fetchTransactions({ month: currentMonth, year: currentYear }));
    }, [dispatch]);
    
    // Prepare chart data for category analysis
    const preparePieChartData = (transactions, type) => {
        const categoryTotals = {};
        
        // Filter transactions by type and aggregate by category
        transactions
            .filter(t => t.type === type)
            .forEach(transaction => {
                if (!categoryTotals[transaction.category]) {
                    categoryTotals[transaction.category] = 0;
                }
                categoryTotals[transaction.category] += Number(transaction.amount);
            });
        
        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);
        
        // Generate colors based on the type
        const baseColor = type === 'income' ? 'rgba(54, 162, 235, 0.8)' : 'rgba(255, 99, 132, 0.8)';
        const baseColorBorder = type === 'income' ? 'rgb(54, 162, 235)' : 'rgb(255, 99, 132)';
        
        // Generate varying shades of the base color
        const backgroundColors = labels.map((_, i) => {
            const opacity = 0.4 + (i * 0.1) % 0.4;
            return type === 'income' 
                ? `rgba(54, 162, ${235 - i * 15}, ${opacity})`
                : `rgba(${255 - i * 10}, 99, 132, ${opacity})`;
        });
        
        return {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: backgroundColors,
                    borderColor: baseColorBorder,
                    borderWidth: 1,
                },
            ],
        };
    };

    // Prepare bar chart data for daily transactions
    const prepareBarChartData = (transactions) => {
        // Group transactions by date
        const dailyTotals = {};
        
        transactions.forEach(transaction => {
            const date = new Date(transaction.created_at || transaction.date).toLocaleDateString();
            
            if (!dailyTotals[date]) {
                dailyTotals[date] = { income: 0, expense: 0 };
            }
            
            if (transaction.type === 'income') {
                dailyTotals[date].income += Number(transaction.amount);
            } else {
                dailyTotals[date].expense += Number(transaction.amount);
            }
        });
        
        // Sort by date
        const sortedDates = Object.keys(dailyTotals).sort((a, b) => new Date(a) - new Date(b));
        
        return {
            labels: sortedDates,
            datasets: [
                {
                    label: 'Income',
                    data: sortedDates.map(date => dailyTotals[date].income),
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1,
                },
                {
                    label: 'Expenses',
                    data: sortedDates.map(date => dailyTotals[date].expense),
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1,
                }
            ],
        };
    };
    



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
            <div className="bg-white shadow rounded-lg p-6 pattern-geometric">
                <div className="content-layer">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-green-100 p-4 rounded-lg pattern-green">
                            <div className="content-layer">
                                <h3 className="text-lg font-medium text-green-800">Total Balance</h3>
                                <p className="text-2xl font-bold text-green-900">₹{(income - expenses).toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="bg-blue-100 p-4 rounded-lg pattern-blue">
                            <div className="content-layer">
                                <h3 className="text-lg font-medium text-blue-800">Income</h3>
                                <p className="text-2xl font-bold text-blue-900">₹{income.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="bg-red-100 p-4 rounded-lg pattern-red">
                            <div className="content-layer">
                                <h3 className="text-lg font-medium text-red-800">Expenses</h3>
                                <p className="text-2xl font-bold text-red-900">₹{expenses.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Month Analysis */}
            <div className="bg-white shadow rounded-lg p-6 pattern-dots">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-blue-600" />
                        <h2 className="text-2xl font-semibold text-gray-800">
                            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                    </div>
                    <button 
                        onClick={() => setShowAddForm(prev => !prev)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Add Transaction
                    </button>
                </div>
                
                {/* Add Transaction Form */}
                {showAddForm && (
                    <div className="mb-8">
                        <form className="w-full space-y-4 p-4 bg-gray-50 rounded-lg" onSubmit={handleTransactionSubmit}>
                            <div className="flex flex-col space-y-2">
                                <label htmlFor="type" className="font-medium text-gray-700">Transaction Type *</label>
                                <div className="flex space-x-4">
                                    {['income', 'expense'].map(type => (
                                        <label key={type} className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="type"
                                                value={type}
                                                checked={transactionData.type === type}
                                                onChange={onChange}
                                                className={`form-radio ${type === 'income' ? 'text-blue-600' : 'text-red-600'}`}
                                                required
                                            />
                                            <span className="ml-2">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col space-y-2">
                                <label htmlFor="category" className="font-medium text-gray-700">Category *</label>
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
                                <label htmlFor="amount" className="font-medium text-gray-700">Amount *</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={transactionData.amount}
                                    onChange={onChange}
                                    placeholder="Enter amount"
                                    className="form-input rounded-md border-gray-300 shadow-sm"
                                    required
                                />
                            </div>

                            <div className="flex flex-col space-y-2">
                                <label htmlFor="description" className="font-medium text-gray-700">Description *</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={transactionData.description}
                                    onChange={onChange}
                                    placeholder="Enter description"
                                    className="form-input rounded-md border-gray-300 shadow-sm"
                                    required
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-4 py-2 text-white rounded-md transition-colors ${
                                        isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                    {isSubmitting ? 'Adding...' : 'Add Transaction'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md my-4">
                        <p className="font-bold">Error loading transactions</p>
                        <p>{error}</p>
                    </div>
                ) : !incomeList.length && !expenseList.length ? (
                    <div className="bg-gray-100 p-6 rounded-md text-center">
                        <p className="text-gray-600">No transactions found for this month.</p>
                        <p className="text-gray-600">Click the "Add Transaction" button to get started.</p>
                    </div>
                ) : (
                    <>
                        {/* Spending Trends - Bar Chart */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Spending Trend</h3>
                            <div className="h-64 w-full">
                                <Bar 
                                    data={prepareBarChartData([...incomeList, ...expenseList])}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                title: {
                                                    display: true,
                                                    text: 'Amount ($)'
                                                }
                                            },
                                            x: {
                                                title: {
                                                    display: true,
                                                    text: 'Date'
                                                }
                                            }
                                        },
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                            },
                                            title: {
                                                display: true,
                                                text: 'Daily Income & Expenses'
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        
                        {/* Category Analysis */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Income Categories */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-blue-800 mb-4">Income Categories</h3>
                                {incomeList.length > 0 ? (
                                    <div className="flex flex-col md:flex-row">
                                        <div className="w-full md:w-1/2">
                                            <div className="h-48 mb-4">
                                                <Doughnut 
                                                    data={preparePieChartData([...incomeList, ...expenseList], 'income')}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        plugins: {
                                                            legend: {
                                                                position: 'right',
                                                                labels: {
                                                                    boxWidth: 12
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="w-full md:w-1/2 pl-0 md:pl-4">
                                            <h4 className="text-md font-medium mb-2">Top Income Sources</h4>
                                            {findTopCategories([...incomeList, ...expenseList], 'income').map((cat, idx) => (
                                                <div key={idx} className="mb-2">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">{cat.category}</span>
                                                        <span className="text-green-600">${cat.amount.toFixed(2)}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                        <div 
                                                            className="bg-blue-600 h-2.5 rounded-full" 
                                                            style={{ width: `${(cat.amount / income * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-600">No income transactions recorded this month.</p>
                                )}
                            </div>
                            
                            {/* Expense Categories */}
                            <div className="bg-red-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-red-800 mb-4">Expense Categories</h3>
                                {expenseList.length > 0 ? (
                                    <div className="flex flex-col md:flex-row">
                                        <div className="w-full md:w-1/2">
                                            <div className="h-48 mb-4">
                                                <Doughnut 
                                                    data={preparePieChartData([...incomeList, ...expenseList], 'expense')}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        plugins: {
                                                            legend: {
                                                                position: 'right',
                                                                labels: {
                                                                    boxWidth: 12
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="w-full md:w-1/2 pl-0 md:pl-4">
                                            <h4 className="text-md font-medium mb-2">Top Expenses</h4>
                                            {findTopCategories([...incomeList, ...expenseList], 'expense').map((cat, idx) => (
                                                <div key={idx} className="mb-2">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">{cat.category}</span>
                                                        <span className="text-red-600">${cat.amount.toFixed(2)}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                        <div 
                                                            className="bg-red-600 h-2.5 rounded-full" 
                                                            style={{ width: `${(cat.amount / expenses * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-600">No expense transactions recorded this month.</p>
                                )}
                            </div>
                        </div>
                        
                        {/* Recent Transactions */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
                            <div className="space-y-2">
                                {[...incomeList, ...expenseList]
                                    .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
                                    .slice(0, 5)
                                    .map((transaction, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                                            <div>
                                                <h4 className="font-medium text-gray-800">{transaction.description}</h4>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(transaction.created_at || transaction.date).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-sm text-gray-500">•</span>
                                                    <span className="text-sm text-gray-500">{transaction.category}</span>
                                                </div>
                                            </div>
                                            <span className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                                            </span>
                                        </div>
                                    ))
                                }
                                
                                {[...incomeList, ...expenseList].length > 5 && (
                                    <div className="text-center pt-2">
                                        <a href="/transactions" className="text-blue-600 hover:text-blue-800 font-medium">
                                            View all transactions →
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// Helper component to render transaction items
const TransactionItem = ({ transaction, type }) => (
    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
        <span className={`font-medium ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
            {type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
        </span>
    </div>
);


export default Dashboard;
