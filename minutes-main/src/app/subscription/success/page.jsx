'use client'


import React, { useEffect, useState } from 'react';
import axios from 'axios';



export default function Success() {

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', or 'failure'
  

  useEffect(() => {
    const queryString = window.location.search;
    const searchParams = new URLSearchParams(queryString);
    let sessionId = searchParams.get('session_id');
    console.log(sessionId)
    if (!sessionId) {
      sessionId = localStorage.getItem('checkoutSessionId');
    }

    if (!sessionId) {
      setStatus('failure');
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
      return;
    }

    verifyPayment(sessionId)
      .then(() => {
        setStatus('success');
        setTimeout(() => {
          window.location.href = '/signin'; // Redirect on success
        }, 3000);
      })
      .catch((error) => {
        console.error('Error verifying payment:', error);
        setStatus('failure');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      });
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      {status === 'verifying' && (
        <p className="text-lg">Verifying payment... Please wait.</p>
      )}
{status === 'success' && (
  <div className="text-center">
    <h1 className="text-2xl font-bold text-green-500">Payment Successful!</h1>
    <p className="mt-4 text-lg">Redirecting to Sign Up page...</p>
  </div>
)}
{status === 'failure' && (
  <div className="text-center">
    <h1 className="text-2xl font-bold text-red-500">Payment Not Successful</h1>
    <p className="mt-4 text-lg">Please try again. Redirecting to home page...</p>
  </div>
)}

    </div>
  );
}

// Function to verify payment by making a POST request
async function verifyPayment(sessionId) {
  const { data } = await axios.post('https://test-api.slpeace.com/verify-payment', { sessionId });
  const { paid } = data;
  localStorage.removeItem('checkoutSessionId');

  if (!paid) {
    throw new Error('Failed to verify payment');
  }
}
