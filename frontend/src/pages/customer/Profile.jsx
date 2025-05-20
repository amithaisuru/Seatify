import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { BASE_URL } from '../../constants/config';
import Toast from '../../components/Toast';

function Profile() {
  const { token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState({ show: false, type: '', message: '' });//toast messages


  const fetchProfile = async () => {
    try{
      const response = await fetch(`${BASE_URL}/customerProfileDetails`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    });

      const data = await response.json();

    if(response.ok) {
    // setMessage(data.customerProfileData?.email);
    setProfile(data.customerProfileData);
    console.log('Profile data:', data); // Debugging line
    }
    else{
      if (data.error === "Token has expired!") {
          console.error('Token expired. Redirecting to login...');
          setToast({ show: true, type: 'error', message: 'Token expired. Please log in again.' });
          delayLogout(); // Call the delayLogout function             
        } 
        else if (data.error === "Authorization header is missing!") {
          console.error('No token found. Redirecting to login...');
          setToast({ show: true, type: 'error', message: 'No token found. Please log in again.' });
          delayLogout(); // Call the delayLogout function
        }
        else if (data.error === "Invalid token!") {
          console.error('Invalid token found. Redirecting to login...');
          setToast({ show: true, type: 'error', message: 'Invalid token. Please log in again.' });
          delayLogout(); // Call the delayLogout function
        } 
        else {
          // Handle other errors
          setToast({ show: true, type: 'error', message: 'Failed to fetch cafes. Please try again.' });
          console.error('Failed to fetch user profile details:', data.error);
        }

    }

    
    }
    catch (error) {
      console.error('Error fetching profile:', error);
      setMessage('An error occurred while fetching profile data.');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);



  return (
    <>
  <div className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900">
    <main className="grow">
      <div className="mb-4 sm:mb-0">
          <h1 className="mb-6 text-sm md:text-xl text-primary-light dark:text-primary-dark font-bold">User Profile</h1>
      </div>
      <div className='bg-gray-200 dark:bg-gray-800 rounded-md p-4'>
        <div className="w-full max-w-sm space-y-6">
          <form className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-md font-medium text-gray-600 dark:text-gray-400">
                Email
              </label>
              <div className="mt-2">
                <input
                  type="email"
                  id="email"
                  value={profile?.email || ''}
                  disabled
                  className="block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 bg-gray-50 dark:bg-gray-800 sm:text-sm"
                />
              </div>
            </div>

            {/* ID */}
            <div>
              <label htmlFor="id" className="block text-md font-medium text-gray-600 dark:text-gray-400">
                User ID
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="id"
                  value={profile?.id || ''}
                  disabled
                  className="block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 bg-gray-50 dark:bg-gray-800 sm:text-sm"
                />
              </div>
            </div>

            {/* User Type */}
            <div>
              <label htmlFor="user_type" className="block text-md font-medium text-gray-600 dark:text-gray-400">
                User Type
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="user_type"
                  value={
                    profile?.user_type === 1
                      ? 'Customer'
                      : profile?.user_type === 2
                      ? 'Cafe'
                      : 'Admin'
                  }
                  disabled
                  className="block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 bg-gray-50 dark:bg-gray-800 sm:text-sm"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
  </main>
  </div>
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

export default Profile;
