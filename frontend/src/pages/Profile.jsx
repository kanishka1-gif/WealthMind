import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaCog } from 'react-icons/fa'

const Profile = () => {
  const { user, updatePreferences } = useAuth()
  const [preferences, setPreferences] = useState({
    riskLevel: user?.preferences?.riskLevel || 'Medium',
    goal: user?.preferences?.goal || 'Growth',
    investmentHorizon: user?.preferences?.investmentHorizon || 'Long'
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const result = await updatePreferences(preferences)
    
    if (result.success) {
      setMessage('Preferences updated successfully!')
    } else {
      setMessage('Failed to update preferences')
    }
    
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account and investment preferences</p>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <FaUser className="mr-2 text-blue-600" />
          Personal Information
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <FaUser className="text-gray-400 text-2xl" />
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-semibold text-gray-900">{user?.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <FaEnvelope className="text-gray-400 text-2xl" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-900">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <FaPhone className="text-gray-400 text-2xl" />
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-semibold text-gray-900">{user?.phone || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <FaCalendar className="text-gray-400 text-2xl" />
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-semibold text-gray-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Preferences Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <FaCog className="mr-2 text-blue-600" />
          Investment Preferences
        </h2>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.includes('success') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Risk Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Risk Tolerance
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleChange('riskLevel', 'Low')}
                className={`p-4 border-2 rounded-lg transition ${
                  preferences.riskLevel === 'Low'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <p className="font-semibold">Low</p>
                <p className="text-xs mt-1">Conservative</p>
              </button>
              <button
                type="button"
                onClick={() => handleChange('riskLevel', 'Medium')}
                className={`p-4 border-2 rounded-lg transition ${
                  preferences.riskLevel === 'Medium'
                    ? 'border-yellow-600 bg-yellow-50 text-yellow-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <p className="font-semibold">Medium</p>
                <p className="text-xs mt-1">Moderate</p>
              </button>
              <button
                type="button"
                onClick={() => handleChange('riskLevel', 'High')}
                className={`p-4 border-2 rounded-lg transition ${
                  preferences.riskLevel === 'High'
                    ? 'border-red-600 bg-red-50 text-red-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <p className="font-semibold">High</p>
                <p className="text-xs mt-1">Aggressive</p>
              </button>
            </div>
          </div>

          {/* Investment Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Investment Goal
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleChange('goal', 'Income')}
                className={`p-4 border-2 rounded-lg transition ${
                  preferences.goal === 'Income'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <p className="font-semibold">Income</p>
                <p className="text-xs mt-1">Regular returns</p>
              </button>
              <button
                type="button"
                onClick={() => handleChange('goal', 'Growth')}
                className={`p-4 border-2 rounded-lg transition ${
                  preferences.goal === 'Growth'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <p className="font-semibold">Growth</p>
                <p className="text-xs mt-1">Capital appreciation</p>
              </button>
              <button
                type="button"
                onClick={() => handleChange('goal', 'Balanced')}
                className={`p-4 border-2 rounded-lg transition ${
                  preferences.goal === 'Balanced'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <p className="font-semibold">Balanced</p>
                <p className="text-xs mt-1">Mix of both</p>
              </button>
            </div>
          </div>

          {/* Investment Horizon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Investment Horizon
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleChange('investmentHorizon', 'Short')}
                className={`p-4 border-2 rounded-lg transition ${
                  preferences.investmentHorizon === 'Short'
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <p className="font-semibold">Short</p>
                <p className="text-xs mt-1">{'< 1 year'}</p>
              </button>
              <button
                type="button"
                onClick={() => handleChange('investmentHorizon', 'Medium')}
                className={`p-4 border-2 rounded-lg transition ${
                  preferences.investmentHorizon === 'Medium'
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <p className="font-semibold">Medium</p>
                <p className="text-xs mt-1">1-5 years</p>
              </button>
              <button
                type="button"
                onClick={() => handleChange('investmentHorizon', 'Long')}
                className={`p-4 border-2 rounded-lg transition ${
                  preferences.investmentHorizon === 'Long'
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <p className="font-semibold">Long</p>
                <p className="text-xs mt-1">{'>5 years'}</p>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Profile