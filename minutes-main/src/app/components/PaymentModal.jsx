import React, { useState } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

// Load your Stripe public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const PlanSelectionModal = ({ isModalOpen, setIsModalOpen, email }) => {
  const [error, setError] = useState(null);

  const handlePlanSelection = async (selectedPlan) => {
    try {
      const response = await axios.post('https://test-api.slpeace.com/create-checkout-session', {
        email,
        plan: selectedPlan,
      });

      const { sessionId } = response.data;
      localStorage.setItem('checkoutSessionId', sessionId);

      const stripe = await stripePromise;

      const { error: errorStripe } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (errorStripe) {
        setError('Error creating checkout session');
      }
    } catch (err) {
      setError('Error creating checkout session');
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-auto text-center relative">
        {/* Close Button */}
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Title */}
        <p className="font-medium text-xl mb-6">Select a Plan:</p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Individual Plan */}
          <div className="border rounded-lg p-4 hover:shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Individual</h3>
            <p className="text-gray-600 mb-4">$10 / month</p>
            <button
              onClick={() => handlePlanSelection('Individual')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-full"
            >
              Choose Individual
            </button>
          </div>

          {/* Professional Plan */}
          <div className="border rounded-lg p-4 hover:shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Professional</h3>
            <p className="text-gray-600 mb-4">$90 / month</p>
            <button
              onClick={() => handlePlanSelection('Professional')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-full"
            >
              Choose Professional
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanSelectionModal;
