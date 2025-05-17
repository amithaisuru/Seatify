import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';
import Toast from '../../components/Toast'; // Import your Toast component
import { BASE_URL } from '../../constants/config';

function CustomerHome() {
  const { token } = useContext(AuthContext);
  const { logout } = useContext(AuthContext);

  const [cafes, setCafes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAvailable, setFilterAvailable] = useState(false);
  const navigate = useNavigate();

  const [toast, setToast] = useState({ show: false, type: '', message: '' });//toast messages

  // Hardcoded cafes instead of fetching from API
//   useEffect(() => {
//     const dummyCafes = [
//       {
//         id: 1,
//         cafe_name: "Sunrise Cafe",
//         seats_available: 8,
//         location: { id: 1, name: "Downtown" }
//       },
//       {
//         id: 2,
//         cafe_name: "City Brew Lounge",
//         seats_available: 0,
//         location: { id: 2, name: "City Center" }
//       },
//       {
//         id: 3,
//         cafe_name: "Oceanview Coffee",
//         seats_available: 12,
//         location: { id: 3, name: "Seaside" }
//       },
//       {
//         id: 4,
//         cafe_name: "Mountain Bean",
//         seats_available: 2,
//         location: { id: 4, name: "Hilltop" }
//       },
//       {
//         id: 5,
//         cafe_name: "The Night Owl",
//         seats_available: 0,
//         location: { id: 5, name: "Downtown" }
//       }
//     ];
//     setCafes(dummyCafes);
//   }, []);
// Fetch cafes from backend

  const delayLogout = () => {
      setTimeout(() => {
        logout();
      }, 2000);
    };

  const fetchCafes = async () => {
    try {
      const response = await fetch(`${BASE_URL}/cafes`,{
          method: 'GET',
          headers: { 
          'Content-Type': 'application/json' ,
          'Authorization': `Bearer ${token}`}
      });
      const data = await response.json();

      if (response.ok) {
          setCafes(data.cafes);
          console.log('Cafes:', data.cafes);
          setToast({ show: true, type: 'success', message: 'Cafes fetched successfully!' });
          
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
        fetchCafes();
    }, []);

  // Handle search and filter
  const filteredCafes = cafes.filter((cafe) => {
    const matchesSearch = cafe.cafe_name.toLowerCase().includes(searchQuery.toLowerCase()) 
      || cafe.location.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAvailability = filterAvailable ? cafe.seats_available > 0 : true;
    return matchesSearch && matchesAvailability;
  });

  return (
    <>
    <div className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900">
      <main className="grow">
        <div className="mb-4 sm:mb-0">
          <h1 className="mb-6 text-sm md:text-xl text-primary-light dark:text-primary-dark font-bold">HomePage</h1>
        </div>
        <div className='bg-gray-200 dark:bg-gray-800 rounded-md p-4'>
        {/* Search and Filter */}
        <div className="flex text-sm flex-col md:flex-row items-center gap-4 mb-6">
            <input
                type="text"
                placeholder="Search by Location or Cafe name"
                className="w-full md:w-1/2 p-2 rounded-md border shadow-sm dark:bg-gray-800 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={filterAvailable}
                    onChange={() => setFilterAvailable(!filterAvailable)}
                />
                <label className="text-gray-700 dark:text-gray-300">Only show available cafes</label>
            </div>
        </div>

      {/* Cafe Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCafes.map((cafe) => (
            <div
                key={cafe.id}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-4 hover:shadow-xl transition cursor-pointer"
                onClick={() => navigate(`/cafe/${cafe.id}`)}
                >
            <h3 className="text-md font-bold mb-2 dark:text-white">{cafe.cafe_name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{cafe.location.name}</p>
            {/* Real-time seat status */}
            <span className={`inline-block px-3 py-1 text-xs rounded-full ${cafe.seats_available > 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                {cafe.seats_available > 0 ? 'Seats Available' : 'Full'}
            </span>
            </div>
        ))}
        </div>

      {/* No Cafes Found */}
      {filteredCafes.length === 0 && (
        <div className="text-center mt-10 text-gray-600 dark:text-gray-400">
          No cafes match your search!
        </div>
      )}
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

export default CustomerHome;
