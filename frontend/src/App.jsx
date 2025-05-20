import { Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import { Menu } from 'lucide-react'; // Importing the Menu icon
import { useState } from 'react';
import Signup from './pages/Signup';
import Profile from './pages/customer/Profile';
import Details from './pages/cafe/Details';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoutes';
import DarkModeToggle from './components/DarkModeToggle';
import CustomerHome from './pages/customer/CustomerHomePage';
import CafeDetails from './pages/customer/CafeDetails';
import AdminUserProfiles from './pages/Admin/UserProfiles';
import AddUsers from './pages/Admin/AddUsers';

function App() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const noSidebarPaths = ['/login', '/signup'];
  const shouldShowSidebar = !noSidebarPaths.includes(location.pathname);

  return (
    <div className='relative min-h-screen font-poppins bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'>
     <DarkModeToggle/>
     {/* Mobile hamburger menu */}
      {shouldShowSidebar && (
        <button
          className="fixed top-4 left-4 z-50 md:hidden p-2 bg-gray-200 dark:bg-gray-700 rounded"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
      )}
      
      <div className='flex pt-16 md:pt-0'>
      {shouldShowSidebar && <Sidebar  isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}
      <div style={{ flex: 1, padding: '0px' }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
           {/* 🔥 Protected routes */}
           <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/details" element={
            <ProtectedRoute>
              <Details />
            </ProtectedRoute>
          } /> 
          <Route path="/homepage" element={
            <ProtectedRoute>
              <CustomerHome />
            </ProtectedRoute>
          } /> 
          <Route path="/cafe/:id" element={
            <ProtectedRoute>
              <CafeDetails/>
            </ProtectedRoute>
          } /> 
          <Route path="/userProfiles" element={
            <ProtectedRoute>
              <AdminUserProfiles/>
            </ProtectedRoute>
          } /> 
          <Route path="/addUsers" element={
            <ProtectedRoute>
              <AddUsers/>
            </ProtectedRoute>
          } /> 
        </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
