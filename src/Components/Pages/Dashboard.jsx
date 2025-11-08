import { useState, useEffect } from 'react';
import Sidebar from '../Layout/Sidebar';
import Header from '../Layout/Header';
import Footer from '../Layout/Footer';
import Overview from './Overview';
import DeviceManagement from './DeviceManagement';
import Profile from './Profile';
import Help from './Help';

const Dashboard = () => { // 1. REMOVE ONNAVIGATE FROM PROPS
  const [activeView, setActiveView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkScreenSize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        setSidebarOpen(localStorage.getItem('sidebarOpen') === 'true');
      } else {
        setSidebarOpen(false);
      }
    };

    const loadUserData = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Failed to load user data', error);
      }
    };

    const loadNotifications = () => {
      setNotificationCount(3); // Mock value
    };

    checkScreenSize();
    loadUserData();
    loadNotifications();
    
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem('sidebarOpen', newState);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'devices': return <DeviceManagement />;
      case 'profile': return <Profile />;
      case 'help': return <Help />;
      case 'overview':
      default: return <Overview />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 overflow-hidden">
      <Header 
        toggleSidebar={toggleSidebar}
        showSidebarToggle={true}
        user={user}
        notificationCount={notificationCount}
        isSidebarOpen={sidebarOpen}
      />
      
      <div className="flex flex-1 relative">
        <Sidebar
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          activeView={activeView}
          setActiveView={setActiveView}
          // onNavigate={onNavigate} // 2. REMOVE THIS
          user={user}
          isDesktop={isDesktop}
        />
        
        <main className="flex-1 min-w-0 transition-all duration-300 ease-in-out">
          <div className="p-4 md:p-6 mx-auto xl:max-w-[calc(100%-200px)]">
            {renderActiveView()}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;