import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions, editTransaction } from '../../features/transactions/transactionSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave } from '@fortawesome/free-solid-svg-icons';

const TransactionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { incomeList, expenseList, isLoading } = useSelector((state) => state.transactions);
  
  // Find the transaction by ID
  const allTransactions = [...incomeList, ...expenseList];
  const transaction = allTransactions.find((t) => t.id === Number(id) || t.id === id);
  
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    description: '',
    category: '',
    date: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Categories
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

  // Load transaction data when component mounts or ID changes
  useEffect(() => {
    if (!transaction) {
      dispatch(fetchTransactions());
    } else {
      const date = transaction.created_at 
        ? new Date(transaction.created_at).toISOString().split('T')[0]
        : transaction.date || new Date().toISOString().split('T')[0];
      
      setFormData({
        type: transaction.type || '',
        amount: transaction.amount || '',
        description: transaction.description || '',
        category: transaction.category || '',
        date: date
      });
    }
  }, [transaction, dispatch, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.type || !formData.amount || !formData.description || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await dispatch(editTransaction(id, {
        ...formData,
        amount: Number(formData.amount)
      }));
      
      if (result.success) {
        navigate('/transactions');
      } else {
        setError(result.error || 'Failed to update transaction');
      }
    } catch (err) {
      setError('Error updating transaction: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !transaction) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!transaction && !isLoading) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md my-4">
        <p className="font-bold">Error</p>
        <p>Transaction not found. Please check the ID and try again.</p>
        <button 
          className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
          onClick={() => navigate('/transactions')}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back to Transactions
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow pattern-geometric">
      <div className="content-layer">
        <div className="flex justify-between items-center mb-6">
          <button 
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 flex items-center pattern-dots"
            onClick={() => navigate('/transactions')}
          >
            <div className="content-layer">
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back
            </div>
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">Edit Transaction</h1>
          <div></div> {/* Empty div to maintain flex spacing */}
        </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4 pattern-red">
          <div className="content-layer">
            <p>{error}</p>
          </div>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="flex flex-col space-y-2">
          <label htmlFor="type" className="font-medium text-gray-700">Transaction Type *</label>
          <div className="flex space-x-6 bg-gray-50 p-3 rounded-lg pattern-light">
            <div className="content-layer">
              {['income', 'expense'].map(type => (
                <label 
                  key={type} 
                  className={`inline-flex items-center px-4 py-2 rounded-md mr-4 transition-colors cursor-pointer ${
                    formData.type === type 
                      ? type === 'income' 
                        ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                        : 'bg-red-100 text-red-700 border border-red-300'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={formData.type === type}
                    onChange={handleChange}
                    className="sr-only"
                    required
                  />
                  <span className="flex items-center">
                    <svg 
                      className={`w-5 h-5 mr-2 ${
                        type === 'income' ? 'text-blue-500' : 'text-red-500'
                      }`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      {type === 'income' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      )}
                    </svg>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="category" className="font-medium text-gray-700">Category *</label>
          <div className="bg-gray-50 p-3 rounded-lg pattern-stripe">
            <div className="content-layer">
              <select
                name="category"
                id="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
              >
                <option value="">Select a category</option>
                {categories
                  .filter(cat => !formData.type || cat.type === formData.type)
                  .map((category, index) => (
                    <option key={index} value={category.name}>
                      {category.name}
                    </option>
                  ))
                }
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="amount" className="font-medium text-gray-700">Amount *</label>
          <div className="bg-gray-50 p-3 rounded-lg pattern-dots">
            <div className="content-layer relative">
              <div className="absolute left-3 top-2 text-gray-500">₹</div>
              <input
                type="number"
                name="amount"
                id="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full pl-7 p-2 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="description" className="font-medium text-gray-700">Description *</label>
          <div className="bg-gray-50 p-3 rounded-lg pattern-geometric">
            <div className="content-layer">
              <input
                type="text"
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="Enter description"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="date" className="font-medium text-gray-700">Date</label>
          <div className="bg-gray-50 p-3 rounded-lg pattern-light">
            <div className="content-layer">
              <input
                type="date"
                name="date"
                id="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-2 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 flex items-center justify-center rounded-md transition-colors pattern-blue ${
              isSubmitting 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <div className="content-layer">
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </div>
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default TransactionEdit;
