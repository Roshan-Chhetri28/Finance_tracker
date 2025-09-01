import { configureStore } from '@reduxjs/toolkit'
import transactionReducer from '../features/transactions/transactionSlice'

export default configureStore({
  reducer: {
    transactions: transactionReducer
  },
})