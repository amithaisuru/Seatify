import { useParams } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Toast from '../../components/Toast'; // Import your Toast component
// import SeatMap from '../../components/SeatMap';
import CafeLayout from '../../components/CafeLayout';
import { BASE_URL } from '../../constants/config';

function CafeDetails() {
const { id } = useParams();  // Get cafe id from URL
const { token } = useContext(AuthContext);
const [cafe, setCafe] = useState(null);

const [tables, setTables] = useState([])
const [chairs, setChairs] = useState([]) //seats

const [toast, setToast] = useState({ show: false, type: '', message: '' });//toast messages
const { logout } = useContext(AuthContext);
const delayLogout = () => {
    setTimeout(() => {
        logout();
    }, 2000);
};

const fetchCafeDetails = async () => {
    // setCafe({
    //     cafe_name: "Cafe Example",
    //     location: { id: 1, name: "Downtown" },
    //     contact_number: "123-456-7890"
    // })
// try {
//     const response = await fetch(`http://localhost:5000/cafes/${id}`, {
//     method: 'GET',
//     headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//     }
//     });
//     const data = await response.json();

//     if (response.ok) {
//     setCafe(data.cafe);
//     } else {
//     console.error('Failed to fetch cafe details');
//     }
// } catch (error) {
//     console.error('Error fetching cafe details:', error);
// }
try {
    const response = await fetch(`${BASE_URL}/cafes/${id}/info`,{
        method: 'GET',
        headers: { 
        'Content-Type': 'application/json' ,
        'Authorization': `Bearer ${token}`}
    });
    const data = await response.json();

    if (response.ok) {
        setCafe(data.cafe);
    } else {
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
    console.error('Failed to fetch cafes:', data.error);
    }
    }
    } catch (error) {
      // Handle network errors or other unexpected errors
    setToast({ show: true, type: 'error', message: 'An error occurred while fetching cafes.' });
    console.error('Error fetching cafes:', error);
  }

};

// fetch cafe layout details
const fetchCafeLayoutDetails = async () => {
    try {
        const response = await fetch(`${BASE_URL}/cafes/${id}/layout`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        

        if (response.ok) {
            const data = await response.json();
            setTables(data.tables);
            setChairs(data.chairs);

        } else {
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
            setToast({ show: true, type: 'error', message: 'Failed to fetch layout details. Please try again.' });
            console.error('Failed to fetch layout details:', data.error);
            }        }
    } catch (error) {
        console.error('Error fetching cafe layout details:', error);
        setToast({ show: true, type: 'error', message: 'An error occurred while fetching layout details.' });
        
    }
}

useEffect(() => {
fetchCafeDetails();
fetchCafeLayoutDetails();
}, [id]);

if (!cafe) {
return (
    <div className="flex justify-center items-center h-screen text-gray-500">
    Loading cafe details...
    </div>
);
}

return (
<>
<div className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900">
    <main className="grow">
    <div className="mb-4 sm:mb-0">
        <h1 className="mb-6 text-sm md:text-xl text-primary-light dark:text-primary-dark font-bold">Cafe</h1>
        </div>
        <div className='bg-gray-200 dark:bg-gray-800 rounded-md p-4'>
        {/* <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white"> */}
        <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 shadow-lg rounded-lg p-6">
        <h1 className="text-lg font-bold text-primary-dark mb-4">{cafe.cafe_name}</h1>
        <p className="text-md mb-2"><strong>Location:</strong> {cafe.location?.name}</p>
        <p className="text-md mb-2"><strong>Contact:</strong> {cafe.contact_number}</p>
        <p className="text-md mb-2"><strong>Seats Available:</strong> {cafe.seats_available}</p>
        {/* </div> */}
    </div> 
    </div>
    <div className="mt-6">
        <h2 className="text-lg font-bold text-primary-dark mb-4">Seat Map</h2>
        {/* <div className="flex justify-center">
            <SeatMap seats={seats} />
        </div> */}
    </div>
    <div className="w-full max-w-[100%] overflow-auto">
    <CafeLayout tables={tables} chairs={chairs} />

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

export default CafeDetails;
