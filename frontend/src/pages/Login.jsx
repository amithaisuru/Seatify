import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import jwt_decode from 'jwt-decode';
import DarkModeToggle from '../components/DarkModeToggle';
import Toast from '../components/Toast'; // Import your Toast component

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('user1@example.com');
  const [password, setPassword] = useState('password123');
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

    try{const response = await fetch('http://localhost:5000/login', {
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
          navigate('/profile');
        } else {
          navigate('/details');
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
    <>    
    <div className="relative flex flex-col flex-1 overflow-y-hidden bg-primary-lighter dark:bg-primary-darker justify-center overflow-x-hidden font-poppins">
      <div className={` flex w-screen min-h-screen flex-1 flex-col px-6 py-12 lg:px-8`}>
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-3xl font-bold leading-9 tracking-tight text-primary-darker dark:text-primary-lighter font-sans">
              Sign in to your account
          </h2>
          <DarkModeToggle/>
        </div>
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" action="#" method="POST">
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
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)} 
                  className="block w-full rounded-md border-0 px-1.5 py-1.5  text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-dark sm:text-sm sm:leading-6  dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-dark sm:text-sm sm:leading-6 bg-gray-50 dark:bg-gray-800"
                />
            
              </div>
              {messages.password && <p className="text-red-500 text-sm mt-2">{messages.password}</p>}
            </div>
            <div>
              <button
                type="submit"
                className="h-10 w-full flex items-center justify-center px-4 py-2 text-sm rounded-md custom-button bg-primary-dark dark:bg-primary-dark  text-white hover:bg-primary-light dark:hover:bg-primary-light transition-colors duration-300"
                onClick={handleLogin}
              >
                Sign in
              </button>
              <div className='font-medium text-sm text-gray-600 dark:text-gray-400 text-center mt-2 flex justify-between'>
            <p> Don't have an account?</p><a href="/signup" className='underline'>Signup</a>
              </div>
            </div>
          </form>
        </div>
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

export default Login;
