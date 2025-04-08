import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DarkModeToggle from '../components/DarkModeToggle';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState(1);
  const navigate = useNavigate();

  const handleSignup = async () => {
    const response = await fetch('http://localhost:5000/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, user_type: userType }),
    });
    alert('Signup request sent!')

    if (response.ok) {
      alert('Signup successful! Please login.');
      navigate('/login');
    } else {
      alert('Signup failed.');
    }
  };

  return (
  //   <div className="relative flex flex-col flex-1 overflow-y-hidden bg-primary-lighter dark:bg-primary-darker justify-center overflow-x-hidden font-poppins">
  //   <div className="flex w-screen min-h-screen flex-1 flex-col px-6 py-12 lg:px-8">
  //     <div className="sm:mx-auto sm:w-full sm:max-w-sm">
  //       <h2 className="mt-10 text-center text-3xl font-bold leading-9 tracking-tight text-primary-darker dark:text-primary-lighter font-sans">
  //         Sign up for an account
  //       </h2>
  //       <DarkModeToggle />
  //     </div>

  //     <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
  //       <form className="space-y-6" onSubmit={handleSignup}>
  //         <div>
  //           <label htmlFor="email" className="block text-md font-medium leading-6 text-gray-600 dark:text-gray-400">
  //             Email
  //           </label>
  //           <div className="mt-2">
  //             <input
  //               id="email"
  //               name="email"
  //               type="email"
  //               required
  //               value={email}
  //               onChange={e => setEmail(e.target.value)}
  //               className="block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-dark sm:text-sm sm:leading-6 bg-gray-50 dark:bg-gray-800"
  //             />
  //           </div>
  //         </div>

  //         <div>
  //           <label htmlFor="password" className="block text-md font-medium leading-6 text-gray-600 dark:text-gray-400">
  //             Password
  //           </label>
  //           <div className="mt-2">
  //             <input
  //               id="password"
  //               name="password"
  //               type="password"
  //               required
  //               value={password}
  //               onChange={e => setPassword(e.target.value)}
  //               className="block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-dark sm:text-sm sm:leading-6 bg-gray-50 dark:bg-gray-800"
  //             />
  //           </div>
  //         </div>

  //         <div>
  //           <label htmlFor="userType" className="block text-md font-medium leading-6 text-gray-600 dark:text-gray-400">
  //             Select User Type
  //           </label>
  //           <div className="mt-2">
  //             <select
  //               id="userType"
  //               name="userType"
  //               required
  //               value={userType}
  //               onChange={e => setUserType(Number(e.target.value))}
  //               className="block w-full rounded-md border-0 py-2 px-2 text-gray-900 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-dark sm:text-sm sm:leading-6"
  //             >
  //               <option value={1}>User Type 1</option>
  //               <option value={2}>User Type 2</option>
  //             </select>
  //           </div>
  //         </div>

  //         <div>
  //           <button
  //             type="submit"
  //             className="h-10 w-full flex items-center justify-center px-4 py-2 text-sm rounded-md custom-button bg-primary-dark dark:bg-primary-dark text-white hover:bg-primary-light dark:hover:bg-primary-light transition-colors duration-300"
  //           >
  //             Sign Up
  //           </button>
  //         </div>
  //       </form>
  //     </div>
  //   </div>
  // </div>
//   <div>
//   <h2>Sign Up</h2>
//   <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
//   <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
//   <select value={userType} onChange={e => setUserType(Number(e.target.value))}>
//     <option value={1}>User Type 1</option>
//     <option value={2}>User Type 2</option>
//   </select>
//   <button onClick={handleSignup}>Sign Up</button>
// </div>
<>
<div className="relative flex flex-col flex-1 overflow-y-hidden bg-primary-lighter dark:bg-primary-darker justify-center overflow-x-hidden font-poppins">
    <div className={` flex w-screen min-h-screen flex-1 flex-col px-6 py-12 lg:px-8`}>
    <h2>Sign Up</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <select value={userType} onChange={e => setUserType(Number(e.target.value))}>
        <option value={1}>User Type 1</option>
        <option value={2}>User Type 2</option>
      </select>
      <button onClick={handleSignup}>Sign Up</button>
 


      </div>
      </div>
</>
  );
}

export default Signup;
