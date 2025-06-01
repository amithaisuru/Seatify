import { useContext, useEffect, useState } from 'react';
import { BASE_URL } from '../../constants/config';
import Toast from '../../components/Toast';
import { AuthContext } from '../../context/AuthContext';
import CafeLayout from '../../components/CafeLayout';

function CafeLayoutPage() {
    const { token } = useContext(AuthContext);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [tables, setTables] = useState([])
    const [chairs, setChairs] = useState([])

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
      const [localChairs, setLocalChairs] = useState([]);
    const [localTables, setLocalTables] = useState([]);

    const fetchCafeLayout= async () => {
        try{
            const response = await fetch(`${BASE_URL}/cafeLayout`, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
            }
        });
        if(response.ok) {
            const data = await response.json();
            setTables(data.tables);
            setChairs(data.chairs);
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
// handle save occupancy setting manually
    const handleSave = async () => {
      console.log('Saving layout...');
      console.log(localTables)
      console.log(localChairs)
      setSaving(true);
      try {
        const response = await fetch(`${BASE_URL}/cafeLayoutUpdate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            tables: localTables,
            chairs: localChairs,
          }),
        });

        if (response.ok) {
          // const data = await response.json();
          // console.log('Save response:', data);
          setMessage('Layout saved successfully!');
        } else {
          setMessage(`Error: ${data.error || 'Failed to save layout'}`);
        }
      } catch (error) {
        console.error('Save error:', error);
        setMessage('Server error. Please try again later.');
      } finally {
        setSaving(false);
      }
    };

useEffect(() => {
    fetchCafeLayout();

}, []);

return (
    <>
    <div className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900">
        <main className="grow">
            <div className="mb-4 sm:mb-0">
                <h1 className="mb-6 text-sm md:text-xl text-primary-light dark:text-primary-dark font-bold">Cafe Layout</h1>
            </div>
            <div className='bg-gray-200 dark:bg-gray-800 rounded-md p-4'>
                <div className="w-full max-w-[100%] overflow-auto">
                    <CafeLayout tables={tables} chairs={chairs} handleSave={handleSave} message={message} saving={saving}
                      localChairs={localChairs} setLocalChairs={setLocalChairs} localTables={localTables} setLocalTables={setLocalTables}
                      editable={true} />
                </div>
            </div>
        </main>
    </div>
    {toast.show && (
    <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ show: false, type: '', message: '' })}
    />
)}
</>
);
}

export default CafeLayoutPage;
