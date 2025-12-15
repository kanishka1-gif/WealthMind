import { Link } from 'react-router-dom'
import { FaChartLine, FaShieldAlt, FaLightbulb, FaMobileAlt } from 'react-icons/fa'

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <FaChartLine className="text-blue-600 text-6xl" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">WealthMind</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your Smart Investment Partner. Start investing in stocks with personalized recommendations 
            and intelligent portfolio management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <FaChartLine className="text-blue-600 text-3xl" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
              Smart Analytics
            </h3>
            <p className="text-gray-600 text-center">
              Track your portfolio performance with detailed analytics and interactive charts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-4 rounded-full">
                <FaLightbulb className="text-green-600 text-3xl" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
              AI Recommendations
            </h3>
            <p className="text-gray-600 text-center">
              Get personalized stock recommendations based on your risk profile and goals.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
            <div className="flex justify-center mb-4">
              <div className="bg-purple-100 p-4 rounded-full">
                <FaShieldAlt className="text-purple-600 text-3xl" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
              Secure Trading
            </h3>
            <p className="text-gray-600 text-center">
              Trade with confidence using our secure and encrypted platform.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
            <div className="flex justify-center mb-4">
              <div className="bg-orange-100 p-4 rounded-full">
                <FaMobileAlt className="text-orange-600 text-3xl" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
              Easy to Use
            </h3>
            <p className="text-gray-600 text-center">
              Simple and intuitive interface designed for both beginners and experts.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">50+</p>
              <p className="text-gray-600">Stocks Available</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-600 mb-2">24/7</p>
              <p className="text-gray-600">Market Access</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-600 mb-2">100%</p>
              <p className="text-gray-600">Secure Platform</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of smart investors today.
          </p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl"
          >
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 WealthMind. All rights reserved. For educational purposes only.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Landing