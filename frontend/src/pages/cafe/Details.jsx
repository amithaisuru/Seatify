import {useContext, useEffect, useState } from 'react';
import { BASE_URL } from '../../constants/config';
import Toast from '../../components/Toast';
import { AuthContext } from '../../context/AuthContext';

function Details() {
  const { token } = useContext(AuthContext);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [profile, setProfile] = useState(null); 
  const [formData, setFormData] = useState({
    cafe_name: '',
    email: '',
    location: '',
    contact_number: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  
  // fetch cafe profile details
  const fetchCafeProfileDetails = async () => {
    try{
        const response = await fetch(`${BASE_URL}/cafeProfileDetails`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });

      const data = await response.json();

      if(response.ok) {
        const fetchedProfile = data.cafeProfileData;

        setFormData({ 
          email: fetchedProfile.email || '',
          cafe_name: fetchedProfile.cafe_name || '',
          location: fetchedProfile.location?.name || '',
          contact_number: fetchedProfile.contact_number || ''
        }); // editable version
        setProfile(fetchedProfile);

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
      setToast({ show: true, type: 'error', message: 'An error occurred while fetching profile data.' });
    }
  };

  // Function to handle logout with a delay 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle save profile details
  const handleSave = async () => {
  try{
      const response = await fetch(`${BASE_URL}/updateCafeProfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

    const data = await response.json();

    if (response.ok) {
      setToast({ show: true, type: 'success', message: 'Profile updated successfully!' });
      fetchCafeProfileDetails(); // Refresh profile details after saving
      setIsEditing(false);
    } else{
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
          console.error('Failed to update profile details:', data.error);
        }
    }
  } catch (error) {
    console.error('Update failed:', error);
    setToast({ show: true, type: 'error', message: 'Error updating profile' });
  }
};

  useEffect(() => {
    fetchCafeProfileDetails();
  }
  , []); // Empty dependency array to run only once on mount
  return (
  <> 
  <div className="flex w-full h-screen overflow-hidden bg-white dark:bg-primary-darker">
  <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
    <main className="grow">
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <div className="sm:flex sm:justify-between sm:items-center mb-2 ">
          <div className="mb-4 sm:mb-0">
            <h1 className="ml-4 text-2xl md:text-3xl text-primary-light dark:text-primary-lighter font-bold">Cafe Profile</h1>
          </div>
          <div className='bg-gray-200 dark:bg-gray-800 rounded-md p-4'>
          <div className="w-full max-w-sm space-y-6 p-4">
            <form className="space-y-6">
              {/* Email */}
              <div className='flex items-center mb-4'>
                <label htmlFor="email" className="block text-md font-medium text-gray-600 dark:text-gray-400 w-full">
                  Email
                </label>
                <div className="mt-2 w-full">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    disabled={!isEditing}
                    onChange={handleChange}
                    className="w-full rounded-md border-0 py-1.5 px-2 text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 bg-gray-50 dark:bg-gray-800 sm:text-sm"
                  />
                </div>
              </div>
              {/* ID */}
              <div className='flex items-center mb-4'>
                <label htmlFor="id" className="block text-md font-medium text-gray-600 dark:text-gray-400 w-full">
                  Contact Number
                </label>
                <div className="mt-2 w-full">
                  <input
                    type="text"
                    name="contact_number"
                    id="contact_number"
                    value={formData.contact_number}
                    disabled={!isEditing}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 bg-gray-50 dark:bg-gray-800 sm:text-sm"
                  />
                </div>
              </div>
              {/* cafe name */}
                <div className='flex items-center mb-4'>
                <label htmlFor="id" className="block text-md font-medium text-gray-600 dark:text-gray-400 w-full">
                  Cafe Name
                </label>
                <div className="mt-2 w-full">
                  <input
                    type="text"
                    id="cafe_name"
                    name="cafe_name"
                    value={formData.cafe_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 bg-gray-50 dark:bg-gray-800 sm:text-sm"
                  />
                </div>
              </div>
              {/* Location */}
              <div className='flex items-center mb-4'>
                <label htmlFor="id" className="block text-md font-medium text-gray-600 dark:text-gray-400 w-full">
                  Location
                </label>
                <div className="mt-2 w-full">
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={formData.location}
                    // disabled={!isEditing}
                    disabled
                    // onChange={handleChange}
                    className="block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 bg-gray-50 dark:bg-gray-800 sm:text-sm"
                  />
                </div>
              </div>

              
  <div className="flex justify-end gap-4 mt-4">
    {!isEditing ? (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="h-10 w-24 flex items-center justify-center px-4 py-2 text-sm rounded-md custom-button bg-primary-dark dark:bg-primary-dark text-white hover:bg-primary-light dark:hover:bg-primary-light transition-colors duration-300"
      >
        Edit
      </button>
    ) : (
      <>
        <button
          type="button"
          onClick={handleSave}
          className="h-10 w-24 flex items-center justify-center px-4 py-2 text-sm rounded-md custom-button bg-primary-dark hover:bg-primary-light text-white transition-colors duration-300"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setFormData({
              email: profile?.email || '',
              cafe_name: profile?.cafe_name || '',
              location: profile?.location?.name || '',
              contact_number: profile?.contact_number || '',
            });
          }}
          className="h-10 w-24 flex items-center justify-center px-4 py-2 text-sm rounded-md custom-button bg-gray-500 hover:bg-gray-600 text-white transition-colors duration-300"
        >
          Cancel
        </button>
      </>
    )}
  </div>


            </form>
          </div>
        </div>
        </div>
          </div>
          </main>
          </div>
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

export default Details;
