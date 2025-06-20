import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import jwt_decode from 'jwt-decode';
import DarkModeToggle from '../components/DarkModeToggle';
import Toast from '../components/Toast'; // Import your Toast component
import { BASE_URL } from '../constants/config';
import landImage2 from '../assets/Landpage/LandPageImage3.png';
function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [messages, setMessages] = useState({});

  const [toast, setToast] = useState({ show: false, type: '', message: '' });


  const inputValidate=()=> {
    const Errors = {};
    if(!email) {
      Errors.email = 'Please fill email !'
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Errors.email = 'Invalid email format';
    }
    if(!password) {
      Errors.password = 'Please fill password !'
    }
    setMessages(Errors);
    // if there is no error, return true
    return Object.keys(Errors).length === 0;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    // frontend input validation
    if (!inputValidate()) {
      // if there is an error, return and show the error message
      return;
    }

    setMessages({}); // Clear previous messages

    try{const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // alert(data.message)
      setToast({ show: true, type: 'success', message: 'Login successful!' });
      
      console.log(response.message)
      login(data.access_token);
      const decoded = jwt_decode(data.access_token);
      console.log('Decoded token:', decoded); 

      const userType = decoded.user_type;
      console.log('User type:', userType);

      setTimeout(() => {
        if (userType === 1) {
          // Customer
          navigate('/homepage');
        } else if (userType === 2) {
          // Cafe Owner
          navigate('/details');
        }
        else{
          // Admin
          navigate('/homepage')
        }
      }, 1000); // Small delay so toast shows before redirect
    } else {
      setToast({ show: true, type: 'error', message: 'Login failed!' });
      console.log('Login failed:', data.message);}
    }
    catch (error) {
      console.error('Network or unexpected error:', error);
      setToast({ show: true, type: 'error', message: 'Network error! Please try again later.' });
    }
  };

  return (
    // <>    
    // <div className="relative flex flex-col flex-1 overflow-y-hidden bg-primary-lighter dark:bg-primary-darker justify-center overflow-x-hidden font-poppins">
    //   <div className={` flex w-screen min-h-screen flex-1 flex-col px-6 py-12 lg:px-8`}>
    //     <div className="sm:mx-auto sm:w-full sm:max-w-sm">
    //       <h2 className="mt-10 text-center text-3xl font-bold leading-9 tracking-tight text-primary-darker dark:text-primary-lighter font-sans">
    //           Sign in to your account
    //       </h2>
    //       <DarkModeToggle/>
    //     </div>
    //     <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    //       <form className="space-y-6" action="#" method="POST">
    //         <div>
    //           <label htmlFor="email" className="block text-md font-medium leading-6  text-gray-600 dark:text-gray-400">
    //             Email
    //           </label>
    //           <div className="mt-2">
    //             <input
    //               id="email"
    //               name="email"
    //               type="email"
    //               autoComplete="email"
    //               required
    //               value={email}
    //               onChange={e => setEmail(e.target.value)}
    //               className="block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-dark sm:text-sm sm:leading-6 bg-gray-50 dark:bg-gray-800"
    //             />
    //           </div>
    //           {messages.email && <p className="text-red-500 text-sm mt-2">{messages.email}</p>}

    //         </div>
    //         <div>
    //           <div className="flex items-center justify-between">
    //             <label htmlFor="password" className="block text-md font-medium leading-6 text-gray-600 dark:text-gray-400 ">
    //               Password
    //             </label>
    //           </div>
    //           <div className="mt-2">
    //             <input
    //               id="password"
    //               name="password"
    //               type="password"
    //               autoComplete="current-password"
    //               required
    //               value={password}
    //               onChange={e => setPassword(e.target.value)} 
    //               className="block w-full rounded-md border-0 px-1.5 py-1.5  text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-dark sm:text-sm sm:leading-6  dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-dark sm:text-sm sm:leading-6 bg-gray-50 dark:bg-gray-800"
    //             />
            
    //           </div>
    //           {messages.password && <p className="text-red-500 text-sm mt-2">{messages.password}</p>}
    //         </div>
    //         <div>
    //           <button
    //             type="submit"
    //             className="h-10 w-full flex items-center justify-center px-4 py-2 text-sm rounded-md custom-button bg-primary-dark dark:bg-primary-dark  text-white hover:bg-primary-light dark:hover:bg-primary-light transition-colors duration-300"
    //             onClick={handleLogin}
    //           >
    //             Sign in
    //           </button>
    //           <div className='font-medium text-sm text-gray-600 dark:text-gray-400 text-center mt-2 flex justify-between'>
    //         <p> Don't have an account?</p><a href="/signup" className='underline'>Signup</a>
    //           </div>
    //         </div>
    //       </form>
    //     </div>
    //   </div>
      
    // </div>
    // {toast.show && (
    //   <Toast
    //     type={toast.type}
    //     message={toast.message}
    //     onClose={() => setToast({ ...toast, show: false })}
    //   />
    // )}
    // </>
  
    <>
    <div className="flex flex-col md:flex-row min-h-screen bg-primary-lighter dark:bg-primary-darker overflow-hidden font-poppins">
      
      {/* Left Side - Introduction */}
      <div className="flex-1 flex flex-col justify-center items-center text-center p-10 bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: `url(${landImage2})`}} >
        
        <div className="flex flex-col justify-center items-center inset-0 bg-black bg-opacity-50 z-0 w-full p-4 rounded-md">
      
          <h1 className="text-5xl font-bold mb-6 text-primary-dark dark:text-primary-lighter">
          Welcome to Seatify
        </h1>
  
       
         <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md">
          Find, Book, and Relax at your Favorite cafes and Lounges.  
          Seamless Seat Reservation made simple.
        </p>
    
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="w-full max-w-sm space-y-6">
          <h2 className="text-center text-3xl font-bold leading-9 tracking-tight text-primary-darker dark:text-primary-lighter">
            Sign in to your account
          </h2>

          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-md font-medium leading-6 text-gray-600 dark:text-gray-400">
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
                  onChange={e => setEmail(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-dark sm:text-sm sm:leading-6 bg-gray-50 dark:bg-gray-800"
                />
              </div>
              {messages.email && <p className="text-red-500 text-sm mt-2">{messages.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-md font-medium leading-6 text-gray-600 dark:text-gray-400">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-dark sm:text-sm sm:leading-6 bg-gray-50 dark:bg-gray-800"
                />
              </div>
              {messages.password && <p className="text-red-500 text-sm mt-2">{messages.password}</p>}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="h-10 w-full flex items-center justify-center px-4 py-2 text-sm rounded-md custom-button bg-primary-dark dark:bg-primary-dark text-white hover:bg-primary-light dark:hover:bg-primary-light transition-colors duration-300"
              >
                Sign in
              </button>
            </div>

            {/* Link to Signup */}
            <div className="text-center text-gray-600 dark:text-gray-400 text-sm mt-2">
              <p>
                Don't have an account? <a href="/signup" className="underline">Signup</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>

    {/* Toast Message */}
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

export default Login;
