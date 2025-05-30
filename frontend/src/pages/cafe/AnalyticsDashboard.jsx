import { useContext, useEffect, useState } from 'react';
// import { AuthContext } from '../context/AuthContext';

function AnalyticsDashboard() {
//   const { token } = useContext(AuthContext);
const [message, setMessage] = useState('');



return (
<div className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900">
    <main className="grow">
        <div className="mb-4 sm:mb-0">
            <h1 className="mb-6 text-sm md:text-xl text-primary-light dark:text-primary-dark font-bold">Analytics Dashboard</h1>
        </div>
        <div className='bg-gray-200 dark:bg-gray-800 rounded-md p-4'>
        </div>
    </main>
</div>
    );
}

export default AnalyticsDashboard;
