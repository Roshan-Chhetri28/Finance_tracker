import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchTransactions, editTransaction, deleteTransaction } from '../../features/transactions/transactionSlice'
import { Disclosure } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp, faInfoCircle, faEdit, faTrash, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../common/ConfirmModal'
import { Pie, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
)

const Transactions = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { incomeList, expenseList, isLoading, error } = useSelector((state) => state.transactions)
  const [activeTransactionId, setActiveTransactionId] = useState(null)
  const [monthlyData, setMonthlyData] = useState([])
  const [editingTransactionId, setEditingTransactionId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'delete',
    id: null,
    title: '',
    message: ''
  })

  // Get the current month and year
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth()

  useEffect(() => {
    // Fetch transactions on component mount
    dispatch(fetchTransactions())
  }, [dispatch])

  useEffect(() => {
    // Process transactions by month once data is loaded
    if (incomeList.length > 0 || expenseList.length > 0) {
      const allTransactions = [...incomeList, ...expenseList]
      const groupedByMonth = groupTransactionsByMonth(allTransactions)
      setMonthlyData(groupedByMonth)
    }
  }, [incomeList, expenseList])

  // Group transactions by month
  const groupTransactionsByMonth = (transactions) => {
    const months = {}

    transactions.forEach(transaction => {
      const date = new Date(transaction.created_at || transaction.date)
      const year = date.getFullYear()
      const month = date.getMonth()
      const key = `${year}-${month}`

      if (!months[key]) {
        months[key] = {
          year,
          month,
          displayDate: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
          income: [],
          expenses: []
        }
      }

      if (transaction.type === 'income') {
        months[key].income.push(transaction)
      } else {
        months[key].expenses.push(transaction)
      }
    })

    // Convert to array and sort by date (newest first)
    return Object.values(months)
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
      })
  }

  // Toggle transaction details
  const toggleTransactionDetails = (id) => {
    setActiveTransactionId(activeTransactionId === id ? null : id)
  }

  // Generate chart data
  const preparePieChartData = (transactions) => {
    const categoryTotals = {}

    // Calculate totals by category
    transactions.forEach(transaction => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0
      }
      categoryTotals[transaction.category] += Number(transaction.amount)
    })

    // Convert to arrays for chart.js
    const labels = Object.keys(categoryTotals)
    const data = Object.values(categoryTotals)
    
    // Generate colors
    const backgroundColors = labels.map((_, i) => {
      const hue = (i * 137.5) % 360
      return `hsl(${hue}, 70%, 65%)`
    })

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderWidth: 1,
        },
      ],
    }
  }

  const prepareBarChartData = (transactions) => {
    const categoryTotals = {}

    transactions.forEach(transaction => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0
      }
      categoryTotals[transaction.category] += Number(transaction.amount)
    })

    return {
      labels: Object.keys(categoryTotals),
      datasets: [
        {
          label: 'Amount',
          data: Object.values(categoryTotals),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1,
        },
      ],
    }
  }

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          font: {
            size: 10
          }
        }
      }
    }
  }

  // Find highest transaction category
  const findHighestCategory = (transactions) => {
    if (!transactions.length) return { category: 'None', amount: 0 }

    const categoryTotals = {}
    transactions.forEach(transaction => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0
      }
      categoryTotals[transaction.category] += Number(transaction.amount)
    })

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .reduce((max, current) => (current.amount > max.amount ? current : max), { category: 'None', amount: 0 })
  }

  // Show confirm edit modal
  const showEditConfirm = (id) => {
    // Find the transaction to get its details
    const allTransactions = [...incomeList, ...expenseList]
    const transaction = allTransactions.find(t => t.id === id)

    if (transaction) {
      setConfirmModal({
        isOpen: true,
        type: 'edit',
        id: id,
        title: 'Edit Transaction',
        message: `Would you like to edit the ${transaction.type} transaction: "${transaction.description}" for ₹${Number(transaction.amount).toFixed(2)}?`
      })
    }
  }

  // Show confirm delete modal
  const showDeleteConfirm = (id) => {
    // Find the transaction to get its details
    const allTransactions = [...incomeList, ...expenseList]
    const transaction = allTransactions.find(t => t.id === id)

    if (transaction) {
      setConfirmModal({
        isOpen: true,
        type: 'delete',
        id: id,
        title: 'Delete Transaction',
        message: `Are you sure you want to delete this ${transaction.type} transaction: "${transaction.description}" for ₹${Number(transaction.amount).toFixed(2)}?`
      })
    }
  }

  // Handle edit transaction
  const handleEditTransaction = () => {
    const id = confirmModal.id
    setConfirmModal({ ...confirmModal, isOpen: false })
    navigate(`/transaction/${id}`)
  }

  // Handle delete transaction
  const handleDeleteTransaction = async () => {
    const id = confirmModal.id
    setIsDeleting(true)
    
    try {
      const result = await dispatch(deleteTransaction(id))
      if (result.success) {
        // Transaction was deleted successfully
        setActiveTransactionId(null)
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
    } finally {
      setIsDeleting(false)
      setConfirmModal({ ...confirmModal, isOpen: false })
    }
  }

  // Prevent event propagation
  const handleActionClick = (e) => {
    e.stopPropagation()
  }

  // Render a single transaction
  const TransactionItem = ({ transaction }) => {
    const isActive = activeTransactionId === transaction.id
    const type = transaction.type
    const displayDate = transaction.created_at ? new Date(transaction.created_at) : new Date(transaction.date)

    return (
      <div className="mb-2">
        <div
          className={`flex justify-between items-center p-3 rounded-md cursor-pointer ${
            type === 'income' ? 'pattern-dots' : 'pattern-stripe'
          } ${
            isActive ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'
          }`}
          onClick={() => toggleTransactionDetails(transaction.id)}
        >
          <div className="content-layer">
            <span className="font-medium">{transaction.category}</span>
            <span className="text-sm text-gray-500 ml-2">
              {displayDate.toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center content-layer">
            <span className={`font-bold mr-2 ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
              {type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
            </span>
            <button 
              onClick={(e) => {
                handleActionClick(e)
                showEditConfirm(transaction.id)
              }}
              className="p-1 text-blue-500 hover:text-blue-700 transition-colors mr-1"
              title="Edit transaction"
              disabled={isDeleting}
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button 
              onClick={(e) => {
                handleActionClick(e)
                showDeleteConfirm(transaction.id)
              }}
              className="p-1 text-red-500 hover:text-red-700 transition-colors mr-1"
              title="Delete transaction"
              disabled={isDeleting}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
            <FontAwesomeIcon
              icon={faInfoCircle}
              className="ml-1 text-gray-400 hover:text-gray-600"
            />
          </div>
        </div>

        {isActive && (
          <div className="p-3 bg-gray-50 border-t border-gray-200 rounded-b-md pattern-geometric">
            <div className="content-layer">
              <p className="mb-1"><span className="font-medium">Description:</span> {transaction.description}</p>
              <p className="mb-1"><span className="font-medium">Date:</span> {displayDate.toLocaleDateString()}</p>
              <p className="mb-1"><span className="font-medium">ID:</span> {transaction.id}</p>
              {transaction.created_at && (
                <p className="mb-2"><span className="font-medium">Created:</span> {new Date(transaction.created_at).toLocaleString()}</p>
              )}
              <div className="flex mt-3 space-x-2">
                <button
                  onClick={(e) => {
                    handleActionClick(e)
                    showEditConfirm(transaction.id)
                  }}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center"
                  disabled={isDeleting}
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-1" /> Edit
                </button>
                <button
                  onClick={(e) => {
                    handleActionClick(e)
                    showDeleteConfirm(transaction.id)
                  }}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center"
                  disabled={isDeleting}
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-1" /> {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md my-4 pattern-red">
        <div className="content-layer">
          <p className="font-bold">Error loading transactions</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 pattern-geometric">
      <div className="content-layer">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
          <button
            onClick={() => navigate('/')} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow flex items-center pattern-blue"
          >
            <div className="content-layer">
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Transaction
            </div>
          </button>
        </div>

        {monthlyData.length === 0 && !isLoading ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center pattern-light">
            <div className="content-layer">
              <p className="text-gray-600 mb-4">No transactions yet. Click the Add Transaction button to get started!</p>
              <button
                onClick={() => navigate('/')} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow inline-flex items-center"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Transaction
              </button>
            </div>
          </div>
        ) : (
          monthlyData.map((monthData, index) => (
          <Disclosure as="div" key={index} defaultOpen={index === 0}>
            {({ open }) => (
              <div className="mb-4 border border-gray-200 rounded-md overflow-hidden">
                <Disclosure.Button className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 pattern-light">
                  <div className="content-layer">
                    <h2 className="text-lg font-semibold">{monthData.displayDate}</h2>
                  </div>
                  <div className="content-layer">
                    <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} />
                  </div>
                </Disclosure.Button>

                <Disclosure.Panel className="px-4 py-3 text-gray-700">
                  {/* Income section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-green-800 mb-4">Income</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Transactions list */}
                      <div>
                        <h4 className="text-md font-medium mb-3">Transactions</h4>
                        {monthData.income.length > 0 ? (
                          <div>
                            {monthData.income.map(transaction => (
                              <TransactionItem
                                key={transaction.id}
                                transaction={transaction}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded-lg text-center pattern-light">
                            <div className="content-layer">
                              <p className="text-gray-500 mb-2">No income transactions for this month</p>
                              <button
                                onClick={() => navigate('/')} 
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded inline-flex items-center"
                              >
                                <FontAwesomeIcon icon={faPlus} className="mr-1" />
                                Add Income
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Charts */}
                      {monthData.income.length > 0 && (
                        <div>
                          <h4 className="text-md font-medium mb-3">Income by Category</h4>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg pattern-dots">
                              <div className="content-layer">
                                <h5 className="text-sm font-medium mb-2 text-center">Distribution</h5>
                                <div className="h-48">
                                  <Pie
                                    data={preparePieChartData(monthData.income)}
                                    options={chartOptions}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg pattern-stripe">
                              <div className="content-layer">
                                <h5 className="text-sm font-medium mb-2 text-center">By Category</h5>
                                <div className="h-48">
                                  <Bar
                                    data={prepareBarChartData(monthData.income)}
                                    options={{
                                      ...chartOptions,
                                      indexAxis: 'y',
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Summary */}
                    <div className="bg-green-50 p-4 rounded-lg pattern-green">
                      <div className="content-layer">
                        <h4 className="text-md font-medium mb-2">Summary</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm mb-1">
                              Total income: <strong className="text-green-700">${monthData.income.reduce((sum, t) => sum + Number(t.amount), 0).toFixed(2)}</strong>
                            </p>
                            <p className="text-sm mb-1">Number of transactions: {monthData.income.length}</p>
                            {monthData.income.length > 0 && (
                              <p className="text-sm">
                                Top income category: <strong>{findHighestCategory(monthData.income).category}</strong>
                                <span className="text-green-600 font-bold ml-1">
                                  ${findHighestCategory(monthData.income).amount.toFixed(2)}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expenses section */}
                  <div>
                    <h3 className="text-lg font-medium text-red-800 mb-4">Expenses</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Transactions list */}
                      <div>
                        <h4 className="text-md font-medium mb-3">Transactions</h4>
                        {monthData.expenses.length > 0 ? (
                          <div>
                            {monthData.expenses.map(transaction => (
                              <TransactionItem
                                key={transaction.id}
                                transaction={transaction}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded-lg text-center pattern-light">
                            <div className="content-layer">
                              <p className="text-gray-500 mb-2">No expense transactions for this month</p>
                              <button
                                onClick={() => navigate('/')} 
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded inline-flex items-center"
                              >
                                <FontAwesomeIcon icon={faPlus} className="mr-1" />
                                Add Expense
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Charts */}
                      {monthData.expenses.length > 0 && (
                        <div>
                          <h4 className="text-md font-medium mb-3">Expenses by Category</h4>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg pattern-dots">
                              <div className="content-layer">
                                <h5 className="text-sm font-medium mb-2 text-center">Distribution</h5>
                                <div className="h-48">
                                  <Pie
                                    data={preparePieChartData(monthData.expenses)}
                                    options={chartOptions}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg pattern-stripe">
                              <div className="content-layer">
                                <h5 className="text-sm font-medium mb-2 text-center">By Category</h5>
                                <div className="h-48">
                                  <Bar
                                    data={prepareBarChartData(monthData.expenses)}
                                    options={{
                                      ...chartOptions,
                                      indexAxis: 'y',
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Summary */}
                    <div className="bg-red-50 p-4 rounded-lg pattern-red">
                      <div className="content-layer">
                        <h4 className="text-md font-medium mb-2">Summary</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm mb-1">
                              Total expenses: <strong className="text-red-700">${monthData.expenses.reduce((sum, t) => sum + Number(t.amount), 0).toFixed(2)}</strong>
                            </p>
                            <p className="text-sm mb-1">Number of transactions: {monthData.expenses.length}</p>
                            {monthData.expenses.length > 0 && (
                              <p className="text-sm">
                                Highest expense category: <strong>{findHighestCategory(monthData.expenses).category}</strong>
                                <span className="text-red-600 font-bold ml-1">
                                  ${findHighestCategory(monthData.expenses).amount.toFixed(2)}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>
        ))
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.type === 'delete' ? handleDeleteTransaction : handleEditTransaction}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.type === 'delete' ? 'Delete' : 'Edit'}
        cancelText="Cancel"
        type={confirmModal.type}
      />
    </div>
  )
}

export default Transactions
