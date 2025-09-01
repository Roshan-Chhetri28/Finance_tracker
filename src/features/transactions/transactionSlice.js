import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { address } from '../../api/axiosConfig'

export const transactionSlice = createSlice({
    name: 'transactions',
    initialState: {
        income: 0,
        expenses: 0,
        incomeList: [],
        expenseList: [],
        isLoading: false,
        error: null
    },
    reducers: {
        setTransactionData: (state, action) => {
            state.income = action.payload.income;
            state.expenses = action.payload.expenses;
            state.incomeList = action.payload.incomeList;
            state.expenseList = action.payload.expenseList;
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        }
    },
})

// Action creators are generated for each case reducer function
export const { setTransactionData, setLoading, setError } = transactionSlice.actions

// Create an async thunk for fetching transactions
export const fetchTransactions = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await axios.get(`${address}/api/transactions`);
        const data = response.data.transactions;
        
        // Handle the specific response structure with separate income and expenses arrays
        const incomeList = data.income || [];
        const expenseList = data.expenses || [];
        
        // Calculate totals
        let totalIncome = 0;
        let totalExpenses = 0;
        
        incomeList.forEach(item => {
            totalIncome += Number(item.amount);
        });
        
        expenseList.forEach(item => {
            totalExpenses += Number(item.amount);
        });
        
        dispatch(setTransactionData({ 
            income: totalIncome, 
            expenses: totalExpenses,
            incomeList,
            expenseList
        }));
    } catch (error) {
        console.error('Error fetching transactions:', error);
        dispatch(setError(error.message || 'Failed to fetch transactions'));
    } finally {
        dispatch(setLoading(false));
    }
};

// Adding a thunk for adding new transactions
export const addTransaction = (transactionData) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        await axios.post(`${address}/api/transactions`, transactionData);
        // After adding a transaction, fetch all transactions to update the state
        await dispatch(fetchTransactions());
        return { success: true };
    } catch (error) {
        console.error('Error adding transaction:', error);
        dispatch(setError(error.message || 'Failed to add transaction'));
        return { success: false, error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

// Edit an existing transaction
export const editTransaction = (id, transactionData) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        await axios.put(`${address}/api/transactions/${id}`, transactionData);
        // After editing, fetch all transactions to update the state
        await dispatch(fetchTransactions());
        return { success: true };
    } catch (error) {
        console.error('Error editing transaction:', error);
        dispatch(setError(error.message || 'Failed to edit transaction'));
        return { success: false, error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

// Delete a transaction
export const deleteTransaction = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        await axios.delete(`${address}/api/transactions/${id}`);
        // After deleting, fetch all transactions to update the state
        await dispatch(fetchTransactions());
        return { success: true };
    } catch (error) {
        console.error('Error deleting transaction:', error);
        dispatch(setError(error.message || 'Failed to delete transaction'));
        return { success: false, error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

export const transactionReducer = transactionSlice.reducer;
export default transactionSlice.reducer;