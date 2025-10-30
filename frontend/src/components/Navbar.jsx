import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaChartLine, FaShoppingCart, FaBriefcase, FaUser, FaSignOutAlt } from 'react-icons/fa'

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <FaChartLine className="text-blue-600 text-2xl" />
            <span className="text-xl font-bold text-gray-800">WealthMind</span>
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive('/dashboard')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <FaChartLine />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/market"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive('/market')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <FaShoppingCart />
              <span>Market</span>
            </Link>

            <Link
              to="/portfolio"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive('/portfolio')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <FaBriefcase />
              <span>Portfolio</span>
            </Link>

            <Link
              to="/profile"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive('/profile')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <FaUser />
              <span>Profile</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden md:block text-sm text-gray-700">
              Hello, <span className="font-semibold">{user?.name}</span>
            </span>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition text-sm font-medium"
            >
              <FaSignOutAlt />
              <span className="hidden md:block">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center h-16">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              isActive('/dashboard') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <FaChartLine className="text-xl" />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>

          <Link
            to="/market"
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              isActive('/market') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <FaShoppingCart className="text-xl" />
            <span className="text-xs mt-1">Market</span>
          </Link>

          <Link
            to="/portfolio"
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              isActive('/portfolio') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <FaBriefcase className="text-xl" />
            <span className="text-xs mt-1">Portfolio</span>
          </Link>

          <Link
            to="/profile"
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              isActive('/profile') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <FaUser className="text-xl" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar