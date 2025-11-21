import { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaCheck } from 'react-icons/fa';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const user = {
    name: 'John Doe',
    email: 'john@scrpcy.com',
    joinDate: 'January 15, 2023',
    lastLogin: '2 hours ago'
  };

  return (
    <div className="mx-auto max-w-[calc(100%-80px)] xl:max-w-[calc(100%-200px)] py-4 md:py-6">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-indigo-100 flex items-center justify-center">
          <FaUser className="text-indigo-600 text-2xl md:text-3xl" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">{user.name}</h1>
          <p className="text-gray-600 text-sm md:text-base">{user.email}</p>
          <div className="flex flex-col sm:flex-row sm:gap-4 mt-2 text-xs md:text-sm text-gray-500">
            <span>Joined {user.joinDate}</span>
            <span>Last login: {user.lastLogin}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-4 md:space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preferences'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Preferences
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium mb-4 md:mb-6">Personal Information</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                defaultValue={user.name}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm md:text-base" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input 
                  type="email" 
                  defaultValue={user.email}
                  className="w-full pl-10 p-2 border border-gray-300 rounded-lg text-sm md:text-base" 
                  disabled
                />
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm md:text-base">
                Update Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium mb-4 md:mb-6">Security Settings</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 p-2 border border-gray-300 rounded-lg text-sm md:text-base" 
                  placeholder="Enter current password"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 p-2 border border-gray-300 rounded-lg text-sm md:text-base" 
                  placeholder="Enter new password"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 p-2 border border-gray-300 rounded-lg text-sm md:text-base" 
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm md:text-base">
                Change Password
              </button>
            </div>
          </form>

          <div className="mt-6 md:mt-8">
            <h4 className="font-medium mb-3">Two-Factor Authentication</h4>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <FaCheck />
                </div>
                <span className="font-medium text-sm md:text-base">2FA is enabled</span>
              </div>
              <button className="text-sm text-indigo-600 hover:text-indigo-800">
                Manage
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium mb-4 md:mb-6">Preferences</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Theme</h4>
              <div className="flex flex-wrap gap-3 md:gap-4">
                <button className="p-3 md:p-4 border-2 border-indigo-500 rounded-lg">
                  <div className="w-20 h-12 md:w-24 md:h-16 bg-gray-800 rounded"></div>
                  <p className="mt-2 text-sm">Dark</p>
                </button>
                <button className="p-3 md:p-4 border border-gray-300 rounded-lg hover:border-gray-400">
                  <div className="w-20 h-12 md:w-24 md:h-16 bg-white border border-gray-200 rounded"></div>
                  <p className="mt-2 text-sm">Light</p>
                </button>
                <button className="p-3 md:p-4 border border-gray-300 rounded-lg hover:border-gray-400">
                  <div className="w-20 h-12 md:w-24 md:h-16 bg-indigo-50 rounded"></div>
                  <p className="mt-2 text-sm">System</p>
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-base">Email notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-base">Push notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm md:text-base">
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;