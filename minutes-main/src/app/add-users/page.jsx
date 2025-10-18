'use client';

import React, { useState, useEffect } from 'react';
import { createAccount, getCurrentUser, updateUser } from '../../utils/auth'; // Adjust the import path as needed
import { withAuthCheck } from '../components/auth/withAuthRedirect';

const AddUsers = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [childUsers, setChildUsers] = useState([]);

  // Fetch the current user's child users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const user = await getCurrentUser();
        const userChild = user?.['custom:child'];
        const children = userChild ? userChild.split('|') : [];
        setChildUsers(children);
      } catch (error) {
        setMessage({ type: 'error', text: `Error fetching users: ${error.message}` });
      }
    };

    fetchUsers();
  }, []);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Default values
    const password = 'StrongPassword123!';
    const plan = 'Individual';

    try {
      const newUser = await createAccount(email, password, name, plan);
      const newUsername = newUser.getUsername();

      const user = await getCurrentUser();
      const userChild = user?.['custom:child'];
      const updatedUserChild = userChild ? `${userChild}|${newUsername}` : newUsername;

      const updateUserAnswer = await updateUser({ children: updatedUserChild });

      if (updateUserAnswer.status === 'SUCCESS') {
        setMessage({ type: 'success', text: `Account created successfully for user: ${newUsername}` });

        // Refresh the user list
        const refreshedUser = await getCurrentUser();
        const refreshedChild = refreshedUser?.['custom:child'];
        setChildUsers(refreshedChild ? refreshedChild.split('|') : []);
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error creating account: ${error.message}` });
    } finally {
      setLoading(false);
      setEmail('');
      setName('');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Add Users</h1>

      {/* Form to add a new user */}
      <form onSubmit={handleCreateAccount} className="space-y-4 mb-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>

      {/* Display messages */}
      {message.text && (
        <div
          className={`p-4 mb-4 rounded ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* List of existing child users */}
      <h2 className="text-lg font-bold mb-4">Existing Users</h2>
      {childUsers.length > 0 ? (
        <ul className="space-y-2">
          {childUsers.map((child, index) => (
            <li key={index} className="p-2 bg-gray-100 rounded-md shadow-sm">
              {child}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No users added yet.</p>
      )}
    </div>
  );
};

export default withAuthCheck(AddUsers);
