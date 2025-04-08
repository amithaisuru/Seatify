import { useContext, useEffect, useState } from 'react';
// import { AuthContext } from '../context/AuthContext';

function Details() {
//   const { token } = useContext(AuthContext);
  const [message, setMessage] = useState('');

//   useEffect(() => {
    // const fetchProfile = async () => {
    //   const response = await fetch('http://localhost:5000/profile', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${token}`  // 👈 Add the Bearer token
    //     }
    //   });

    //   const data = await response.json();
    //   setMessage(data.msg);
    // };

    // if (token) {
    //   fetchProfile();
    // }
//   }, [token]);

  return (
   
//       <div className="flex items-center justify-center min-h-screen bg-gray-50 font-sans">
//         <h1 className="text-3xl font-bold text-gray-800">
// Details Page        </h1>
//       </div>
<div className="flex w-full h-screen overflow-hidden bg-white dark:bg-primary-darker">
<div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
  <main className="grow">
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
    <div className="sm:flex sm:justify-between sm:items-center mb-2 ">
        <div className="mb-4 sm:mb-0">
          <h1 className="ml-4 text-2xl md:text-3xl text-primary-light dark:text-primary-lighter font-bold">Details</h1>
        </div>
      </div>
        </div>
        </main>
        </div>
    </div>
    );
}

export default Details;
