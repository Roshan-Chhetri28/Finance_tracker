import { Link } from 'react-router-dom'
import './Advisor.css'

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg pattern-geometric">
      <div className="container mx-auto px-4 content-layer">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-gray-800 flex items-center">
            <svg className="w-7 h-7 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13.41 18.09V20H10.74V18.07C9.03 17.71 7.58 16.61 7.47 14.67H9.43C9.53 15.72 10.31 16.54 12.08 16.54C13.9 16.54 14.53 15.56 14.53 14.81C14.53 13.86 14.05 13.16 12.33 12.73L10.64 12.29C8.34 11.71 7.32 10.3 7.32 8.68C7.32 6.84 8.74 5.46 10.74 5.1V3H13.41V5.11C15.09 5.55 16.05 6.9 16.11 8.52H14.15C14.1 7.5 13.47 6.63 12.08 6.63C10.79 6.63 9.92 7.38 9.92 8.63C9.92 9.38 10.36 10.07 11.91 10.48L13.55 10.91C16.16 11.56 17.19 12.96 17.19 14.67C17.19 16.68 15.79 17.76 13.41 18.09Z" fill="currentColor" />
            </svg>
            Alka Subba ❤️
          </Link>
          <div className="flex space-x-4">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 13H10V20H4V13ZM4 4H10V11H4V4ZM14 4H20V11H14V4ZM14 13H20V20H14V13Z" fill="currentColor" />
              </svg>
              Dashboard
            </Link>
            <Link
              to="/transactions"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 10H9V17H7V10ZM11 7H13V17H11V7ZM15 13H17V17H15V13Z" fill="currentColor" />
              </svg>
              Transactions
            </Link>
            <Link
              to="/advisor"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-purple-100 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#a78bfa" />
                <path d="M12 7C10.34 7 9 8.34 9 10C9 11.66 10.34 13 12 13C13.66 13 15 11.66 15 10C15 8.34 13.66 7 12 7ZM12 15C9.33 15 6 16.34 6 19V20H18V19C18 16.34 14.67 15 12 15Z" fill="#fff"/>
              </svg>
              Advisor
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar