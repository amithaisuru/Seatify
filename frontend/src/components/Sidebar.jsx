import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut,X } from 'lucide-react';
import Toast from './Toast';

function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useContext(AuthContext);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });//toast messages

  console.log('User from Sidebar:', user); // Debugging line

  if (!user) {
    return null; // No sidebar if not logged in
  }

  const handleLogout = () => {
    // Show toast message
    setToast({ show: true, type: 'success', message: 'Logout successful!' });
    
    setTimeout(() => {
      logout();
    }
    , 1000);
  };

  return (
    <>
    {/* Mobile overlay */}
    <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

    <aside
        className={`fixed z-50 rounded-sm inset-y-0 left-0 w-64 transform bg-primary-light dark:bg-primary-dark border-r border-gray-200 dark:border-primary-darker shadow-md transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:static md:translate-x-0 md:flex md:flex-col`}
      >
        <div className="flex items-center justify-between h-16 border-b border-gray-300 dark:border-primary-darker px-4">
          <h3 className="text-center text-2xl font-bold leading-9 tracking-tight text-primary-darker dark:text-primary-lighter font-sans">
            Seatify
        </h3>
          {/* Mobile Close Button */}
          <button onClick={() => setIsOpen(false)} className="md:hidden">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex flex-col flex-1 justify-between px-4 py-6 overflow-y-auto">
          <ul className="space-y-4">
            {/* customer */}
            {user.user_type === 1 && (
              <ul>
              <li>
                <Link 
                  to="/profile"
                  onClick={() => setIsOpen(false)}  // close menu after click
                  className="text-sm block px-4 py-2 mb-2 bg-primary-dark dark:bg-primary-darker text-gray-100 rounded-md hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link 
                  to="/homepage"
                  onClick={() => setIsOpen(false)}  // close menu after click
                  className="text-sm block px-4 mb-2 py-2 bg-primary-dark dark:bg-primary-darker text-gray-100 rounded-md hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  HomePage
                </Link>
              </li>
              </ul>
            )}
            {/* cafe */}
            {user.user_type === 2 && (
            <ul>
              <li>
                <Link 
                  to="/cafelayout"
                  onClick={() => setIsOpen(false)}
                  className="text-sm block px-4 mb-2 py-2 bg-primary-dark dark:bg-primary-darker text-gray-800 rounded-md hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  Cafe Layout
                </Link>
              </li>
              <li>
                <Link 
                  to="/analytics"
                  onClick={() => setIsOpen(false)}
                  className="text-sm block px-4 mb-2 py-2 bg-primary-dark dark:bg-primary-darker text-gray-800 rounded-md hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  Analytics Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/details"
                  onClick={() => setIsOpen(false)}
                  className="text-sm block px-4 mb-2 py-2 bg-primary-dark dark:bg-primary-darker text-gray-800 rounded-md hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  Cafe Profile
                </Link>
              </li>
            </ul>

              
            )}
            {/*admin*/}
            {user.user_type === 3 && (
              <ul>
                <li>
                <Link 
                  to="/homepage"
                  onClick={() => setIsOpen(false)}
                  className="text-sm block px-4 mb-2 py-2 bg-primary-dark dark:bg-primary-darker text-gray-800 rounded-md hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  Homepage
                </Link>
              </li>
              <li>
                <Link 
                  to="/userProfiles"
                  onClick={() => setIsOpen(false)}  // close menu after click
                  className="text-sm block px-4 mb-2 py-2 bg-primary-dark dark:bg-primary-darker text-gray-800 rounded-md hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  User Profiles
                </Link>
              </li>
              <li>
                <Link 
                  to="/addUsers"
                  onClick={() => setIsOpen(false)}  // close menu after click
                  className="text-sm block px-4 mb-2 py-2 bg-primary-dark dark:bg-primary-darker text-gray-800 rounded-md hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  Add Users
                </Link>
              </li>
              
              </ul>
              
            )}
          </ul>

          {/* Logout */}
          <div className="pt-8">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm w-full text-left px-4 py-2 text-red-600 rounded-md bg-primary-lighter dark:bg-primary-darker hover:bg-red-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>
      {/* Toast message */}
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </>
   
  );
}

export default Sidebar;
