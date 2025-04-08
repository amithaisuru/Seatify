import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut,X } from 'lucide-react'; 

function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  console.log('User from Sidebar:', user); // Debugging line

  if (!user) {
    return null; // No sidebar if not logged in
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
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
          {/* <h3 className="font-sans text-xl font-semibold text-gray-800 dark:text-white tracking-wide">
            Seatify
          </h3> */}
          <h3 className="text-center text-3xl font-bold leading-9 tracking-tight text-primary-darker dark:text-primary-lighter font-sans">
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
            {user.user_type === 1 && (
              <li>
                <Link 
                  to="/profile"
                  onClick={() => setIsOpen(false)}  // close menu after click
                  className="text-xl block px-4 py-2 bg-primary-dark dark:bg-primary-darker text-gray-800 rounded-md hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  Profile
                </Link>
              </li>
            )}
            {user.user_type === 2 && (
              <li>
                <Link 
                  to="/details"
                  onClick={() => setIsOpen(false)}
                  className="text-xl block px-4 py-2 bg-primary-dark text-gray-800 rounded-md hover:bg-gray-50 dark:text-gray-700 dark:hover:bg-primary-dark transition-colors duration-200"
                >
                  Details
                </Link>
              </li>
            )}
          </ul>

          {/* Logout */}
          <div className="pt-8">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-xl w-full text-left px-4 py-2 text-red-600 rounded-md bg-primary-lighter dark:bg-primary-darker hover:bg-red-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
   
  );
}

export default Sidebar;
