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
                    <CafeLayout tables={tables} chairs={chairs} />
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
