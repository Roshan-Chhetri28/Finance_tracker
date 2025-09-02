import './App.css'
import './assets/patterns.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Dashboard from './components/layout/Dashboard'
import Transactions from './components/transactions/transactions'
import TransactionEdit from './components/transactions/TransactionEdit'
import Advisor from './components/layout/Advisor'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 pattern-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 content-layer">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transaction/:id" element={<TransactionEdit />} />
            <Route path="/advisor" element={<Advisor />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
