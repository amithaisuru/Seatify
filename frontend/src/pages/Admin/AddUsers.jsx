import { useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';
import Toast from '../../components/Toast'; 

function AddUsers() {
    const { token } = useContext(AuthContext);
    const { logout } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState(1);
    const [messages, setMessages] = useState({});
    
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    const [cafeName, setCafeName] = useState('');
    const [location, setLocation] = useState('');
    const [contactNumber, setContactNumber] = useState('');

    // store fetched locations
    const [locations, setLocations] = useState([]);

    const delayLogout = () => {
        setTimeout(() => {
        logout();
        }, 2000);
    };

    // frontend input validation
    const inputValidate=()=> {
        const Errors = {};
        if (!/\S+@\S+\.\S+/.test(email)) {
        Errors.email = 'Invalid email format';
        }
        if(!email) {
        Errors.email = 'Please fill email !'
        }
        if(!password) {
        Errors.password = 'Please fill password !'
        }
        if(!userType){
        Errors.userType = 'Please select user type !'

        }
        if (userType === 2) {
        if (!cafeName) Errors.cafeName = 'Please enter cafe name!';
        if (!location) Errors.location = 'Please enter location!';
        if (!contactNumber) Errors.contactNumber = 'Please enter contact number!';
        }
        setMessages(Errors);
        // if there is no error, return true
        return Object.keys(Errors).length === 0;
    }
    // handle signup
    const handleSignup = async (e) => {
        e.preventDefault();

        // frontend input validation
        if (!inputValidate()) {
        return;
        }

        const bodyData = {
        email,
        password,
        user_type: userType
        };

        if (userType === 2) {
        bodyData.cafe_name = cafeName;
        bodyData.location = location;
        bodyData.contact_number = contactNumber;
        }
        console.log(bodyData)

        setMessages({}); // Clear previous messages

        try {
        const response = await fetch('http://localhost:5000/admin/addUsers', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json' ,
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyData),
        });

        const data= await response.json();

        if (response.ok) {
            console.log('User added successful:', data);
            setToast({ show: true, type: 'success', message: 'Registration successful!' });
        
        } 
        else {
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
            else{
                // Handle other errors
                setToast({ show: true, type: 'error', message: 'Failed to signup. Please try again.' });
                console.error('Failed to signup:', data.error);
            }
        }
        }
        catch(error) {
        console.error('Network or unexpected error:', error);
        setToast({ show: true, type: 'error', message: 'Network error! Please try again later.' });
        }
    };
    const fetchLocations = async (e) =>{
        try {
        const response = await fetch('http://localhost:5000/admin/locations', {
            method: 'GET',
            headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        });
        const data = await response.json();
        console.log('Locations:', data.locations);
        if (response.ok) {
            setLocations(data.locations)
            console.log('Cafes:', data.cafes);
            setToast({ show: true, type: 'success', message: 'Cafes fetched successfully!' });
        } 
        else {
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
        setToast({ show: true, type: 'error', message: 'Error fetching locations' });
        console.error('Error fetching locations:', error);
        }

    };

    useEffect(() => {
        fetchLocations();
    },[]);

return (
<>
<div className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900">
    <main className="grow">
        <div className="mb-4 sm:mb-0">
        <h1 className="mb-6 text-sm md:text-xl text-primary-light dark:text-primary-dark font-bold">Add Users</h1>
        </div>
        <div className="relative flex flex-col flex-1 overflow-y-hidden bg-primary-lighter dark:bg-gray-800 rounded-md justify-center overflow-x-hidden font-poppins">
            <div className={` flex flex-1 flex-col px-6 py-6 lg:px-8`}>
            <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-2">
                <div>
                <div className="flex items-center justify-between">
                    <label htmlFor="userType" className="block text-md font-medium leading-6 text-gray-600 dark:text-gray-400 ">
                    User Type
                    </label>
                </div>
                <div className="mt-2">
                    <select
                    className="block w-full rounded-md border-0 px-1.5 py-1.5  text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-dark sm:text-sm sm:leading-6  dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-dark sm:text-sm sm:leading-6 bg-gray-50 dark:bg-gray-800"
                    value={userType} 
                    onChange={e => setUserType(Number(e.target.value))}>
                        <option value={1}>Customer</option>
                        <option value={2}>Cafe</option>
                        <option value={3}>Admin</option>
                    </select>  
                </div>
                {messages.userType && <p className="text-red-500 text-sm mt-2">{messages.userType}</p>}
                </div>
                <div>
                    <label htmlFor="email" className="block text-md font-medium leading-6  text-gray-600 dark:text-gray-400">
                    Email
                    </label>
                    <div className="mt-2">
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        placeholder="Enter your email"
                        onChange={e => setEmail(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-dark sm:text-sm sm:leading-6 bg-gray-50 dark:bg-gray-800"
                    />
                    </div>
                    {messages.email && <p className="text-red-500 text-sm mt-2">{messages.email}</p>}
                </div>
                <div>
                    <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-md font-medium leading-6 text-gray-600 dark:text-gray-400 ">
                        Password
                    </label>
                    </div>
                    <div className="mt-2">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter a Strong Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)} 
                        className="block w-full rounded-md border-0 px-1.5 py-1.5  text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-dark sm:text-sm sm:leading-6  dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-dark sm:text-sm sm:leading-6 bg-gray-50 dark:bg-gray-800"
                    />
                
                    </div>
                    {messages.password && <p className="text-red-500 text-sm mt-2">{messages.password}</p>}
                </div>
                
                {userType === 2 && (
                <>
                <div>
                    <label className="block text-md font-medium leading-6 text-gray-600 dark:text-gray-400 mt-4">
                    Cafe/Restaurant Name
                    </label>
                    <div className="mt-2">
                    <input
                        type="text"
                        value={cafeName}
                        onChange={e => setCafeName(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-dark sm:text-sm sm:leading-6 bg-gray-50 dark:bg-gray-800"
                        placeholder="Enter Cafe or Restaurant Name"
                    />
                    </div>
                    {messages.cafeName && <p className="text-red-500 text-sm mt-2">{messages.cafeName}</p>}
                </div>
                <div>
                    <label className="block text-md font-medium leading-6 text-gray-600 dark:text-gray-400 mt-4">
                    Location
                    </label>
                    <div className="mt-2">
                    <select
                    className="block w-full rounded-md border-0 px-1.5 py-1.5  text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-dark sm:text-sm sm:leading-6  dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-dark sm:text-sm sm:leading-6 bg-gray-50 dark:bg-gray-800"
                    value={location} 
                    placeholder="Enter Location"
                    onChange={e => setLocation(Number(e.target.value))}>
                        <option value="">Select Location</option>
                        {locations.map((loc)=>(
                        <option key={loc.id} value={loc.id}>
                            {loc.location}
                        </option>))}
                    </select> 
                    </div>
                    {messages.location && <p className="text-red-500 text-sm mt-2">{messages.location}</p>}
                </div>
                <div>
                    <label className="block text-md font-medium leading-6 text-gray-600 dark:text-gray-400 mt-4">
                    Contact Number
                    </label>
                    <div className="mt-2">
                    <input
                        type="text"
                        value={contactNumber}
                        onChange={e => setContactNumber(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-dark sm:text-sm sm:leading-6 bg-gray-50 dark:bg-gray-800"
                        placeholder="Enter Contact Number"
                    />
                    </div>
                    {messages.contactNumber && <p className="text-red-500 text-sm mt-2">{messages.contactNumber}</p>}
                </div>
                </>
                )}
                <div>
                    <button
                    type="submit"
                    className="h-10 w-full flex items-center justify-center px-4 py-2 text-sm rounded-md custom-button bg-primary-dark dark:bg-primary-dark  text-white hover:bg-primary-light dark:hover:bg-primary-light transition-colors duration-300"
                    onClick={handleSignup}
                    >
                    Sign Up
                    </button>
                </div>
                </form>
            </div>
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

export default AddUsers;
