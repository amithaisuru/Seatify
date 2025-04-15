import React, { useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import Toast from './Toast';
import { useContext } from 'react';

function Table1({ cafes = []  , tableTopic ,fetchUsers}) {
    const [searchTerm, setSearchTerm] = React.useState('');

    // ✅ Filter cafes based on search term
    const filteredCafes = cafes.filter(cafe => 
    cafe.email.toLowerCase().includes(searchTerm.toLowerCase()) 
    // ||    cafe.location?.name.toLowerCase().includes(searchTerm.toLowerCase()
    )

    const [toast, setToast] = React.useState({ show: false, type: '', message: '' });
    const { token } = useContext(AuthContext);

    const tableHeaders = cafes.length > 0 ? Object.keys(cafes[0]) : [];
    // delete function
    const handleDelete = async (email) => {
        try {
            const response = await fetch('http://localhost:5000/admin/deleteUser', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' ,
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({email:email}),
            });
            const data= await response.json();

            if (response.ok) {
                console.log('User deleted successful:', data);
                setToast({ show: true, type: 'success', message: 'Successfully deleted!' });
                fetchUsers();
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
                    setToast({ show: true, type: 'error', message: 'Failed to delete. Please try again.' });
                    console.error('Failed to delete:', data.error);
                }
            }
            }
        catch(error) {
        console.error('Network or unexpected error:', error);
        setToast({ show: true, type: 'error', message: 'Network error! Please try again later.' });
        }
    };


return (
<div className="overflow-x-auto text-sm">
<h1 className="text-2xl font-bold mb-4 text-primary-dark dark:text-primary-light">{tableTopic}</h1>
    {/* ✅ Search Input */}
    <div className="mb-4">
    <input
        type="text"
        placeholder="Search by Cafe Name or Location..."
        className="border border-gray-300 dark:border-gray-600 text-gray-800 rounded-md p-2 w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
    />
    </div>

      {/* ✅ Table */}
    <table className="min-w-full max-h-96 bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
    <thead className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
        <tr>
        {/* <th className="py-2 px-4 text-left">#</th>
        <th className="py-2 px-4 text-left">Email</th>
        <th className="py-2 px-4 text-left">User Type</th>
        <th className="py-2 px-4 text-left">Action</th> */}
        {/* <th className="py-2 px-4 text-left">Contact</th>  */}
        {/* <th className="py-2 px-4 text-left">#</th> Serial Number */}
        {tableHeaders.map((header) => (
        <th key={header} className="py-2 px-4 text-left capitalize">
            {header.replace('_', ' ')}
        </th>
        ))}
        <th className="py-2 px-4 text-left">Action</th> {/* Action Column */}
        </tr>
    </thead>
    <tbody className="text-gray-600 dark:text-gray-400">
        {filteredCafes.length === 0 ? (
        <tr>
            <td colSpan="5" className="text-center py-4">
            No records found.
            </td>
        </tr>
        ) : (
        filteredCafes.map((cafe, index) => (
            <tr key={cafe.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
            {/* <td className="py-2 px-4">{index + 1}</td>
            <td className="py-2 px-4">{cafe.email}</td>
            <td className="py-2 px-4">{cafe.user_type===1 ? 'Customer' : (cafe.user_type === 2 ? 'Cafe' : 'Admin')}</td> */}
                {tableHeaders.map((header) => (
            <td key={header} className="py-2 px-4">
                {header === 'user_type' 
                ? (cafe[header] === 1 ? 'Customer' : cafe[header] === 2 ? 'Cafe' : 'Admin')
                : cafe[header]
                }
            </td>
            ))}
        <td className="py-2 px-4">
            <button
                className="h-7 w-1/2 flex items-center justify-center px-4 py-2 text-sm rounded-md custom-button bg-primary-dark dark:bg-primary-dark  text-white hover:bg-primary-light dark:hover:bg-primary-light transition-colors duration-300"
                onClick={() => {
                    if (window.confirm('Are you sure you want to delete this user?')) {
                    handleDelete(cafe.email)
                    }
                    }}
            >Delete</button></td>
        {/* <td className="py-2 px-4">{cafe.contact_number}</td> */} 
        </tr>
        ))
        )}
    </tbody>
    </table>
        {toast.show && (
        <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
        />
    )}
    </div>
);
}

export default Table1;
