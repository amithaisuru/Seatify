import { useParams } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Toast from '../../components/Toast'; // Import your Toast component
import SeatMap from '../../components/SeatMap';
import CafeLayout from '../../components/CafeLayout';

function CafeDetails() {
const { id } = useParams();  // Get cafe id from URL
const { token } = useContext(AuthContext);
const [cafe, setCafe] = useState(null);

const [toast, setToast] = useState({ show: false, type: '', message: '' });//toast messages
const { logout } = useContext(AuthContext);
const delayLogout = () => {
    setTimeout(() => {
        logout();
    }, 2000);
};

const seats = [
    { x: 20, y: 30, label: 'A1', status: 'available' },
    { x: 80, y: 30, label: 'A2', status: 'occupied' },
    { x: 50, y: 40, label: 'T1', status: 'occupied' },
    { x: 140, y: 30, label: 'A3', status: 'available' },
    { x: 20, y: 80, label: 'B1', status: 'available' },
    { x: 80, y: 80, label: 'B2', status: 'occupied' },
  ];

  const tables = [
    { x: 100, y: 80, label: 'T1' },
    { x: 300, y: 80, label: 'T2' },
  ];
  
  const chairs = [
    { x: 80, y: 60, label: 'C1', status: 'available' },
    { x: 150, y: 60, label: 'C2', status: 'occupied' },
    { x: 80, y: 120, label: 'C3', status: 'available' },
    { x: 170, y: 90, label: 'C13', status: 'available' },
    { x: 160, y: 130, label: 'C4', status: 'available' },
    { x: 130, y: 150, label: 'C5', status: 'occupied' },

  
    { x: 280, y: 60, label: 'C10', status: 'available' },
    { x: 320, y: 60, label: 'C6', status: 'occupied' },
    { x: 360, y: 80, label: 'C11', status: 'occupied' },
    { x: 370, y: 110, label: 'C9', status: 'occupied' },
    { x: 280, y: 120, label: 'C7', status: 'available' },
    { x: 350, y: 140, label: 'C8', status: 'available' },
    { x: 310, y: 140, label: 'C12', status: 'available' },
    
    

  ];
  


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
    const response = await fetch(`http://localhost:5000/cafes/${id}`,{
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

useEffect(() => {
fetchCafeDetails();
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
    <div>
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
