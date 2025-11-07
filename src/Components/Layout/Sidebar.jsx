import {
  FaHome,
  FaServer,
  FaUser,
  FaQuestionCircle,
  FaSignOutAlt,
  FaUserCircle,
  FaTimes
} from 'react-icons/fa';
import PropTypes from 'prop-types';

const Sidebar = ({ 
  isOpen, 
  toggleSidebar, 
  activeView, 
  setActiveView, 
  onNavigate,
  user,
  isDesktop
}) => {
  const navItems = [
    { id: 'overview', icon: <FaHome />, label: 'Overview' },
    { id: 'devices', icon: <FaServer />, label: 'Devices' },
    { id: 'profile', icon: <FaUser />, label: 'Profile' },
    { id: 'help', icon: <FaQuestionCircle />, label: 'Help' }
  ];

  const handleNavigation = (id) => {
    setActiveView(id);
    if (!isDesktop) {
      toggleSidebar();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // This logs the user out
    localStorage.removeItem('user'); // This clears user data
    onNavigate('login'); // This redirects to login
};

  return (
    <>
      {isOpen && !isDesktop && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30" 
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-indigo-800 to-indigo-900 text-white shadow-xl transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-indigo-700/50">
          <h2 className="text-xl font-bold">NetworkDash</h2>
          <button
            onClick={toggleSidebar}
            className="text-white hover:text-indigo-300 focus:outline-none transition-colors"
            aria-label="Close sidebar"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Rest of your sidebar content remains the same */}
        <div className="p-4 border-b border-indigo-700/50">
          <div className="flex items-center space-x-3 p-3">
            <div className="relative">
              <FaUserCircle className="h-10 w-10 text-indigo-200" />
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border-2 border-indigo-800"></span>
            </div>
            <div>
              <p className="font-medium">{user?.name || 'User'}</p>
              <p className="text-xs text-indigo-200">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 h-[calc(100%-180px)] overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.id)}
                  className={`flex items-center w-full p-3 rounded-lg transition-all ${
                    activeView === item.id
                      ? 'bg-indigo-600/80 shadow-md text-white'
                      : 'hover:bg-indigo-700/50 text-indigo-100'
                  }`}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                  {activeView === item.id && (
                    <span className="ml-auto w-2 h-2 bg-white rounded-full"></span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-700/50 bg-indigo-800/50">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 rounded-lg hover:bg-indigo-700/50 text-indigo-100 hover:text-white transition-colors"
          >
            <FaSignOutAlt className="mr-3" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
  activeView: PropTypes.string.isRequired,
  setActiveView: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }),
  isDesktop: PropTypes.bool.isRequired,
};

export default Sidebar;