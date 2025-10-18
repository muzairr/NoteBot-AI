// app/confirm-signup/page.jsx
"use client"
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { confirmSignUp, resendConfirmationCode } from '../../utils/auth';
import { Navbar } from '../components/Navbar';
import { FooterInfo } from '../components/FooterInfo';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);



function ConfirmSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleConfirmSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    
    const verify = searchParams.get('verify');

    try {
      await confirmSignUp(email, verificationCode);
      if(verify){
        router.push('/signin');
        return
      }
      const selectedPlan = localStorage.getItem('plan');
      if(selectedPlan && (selectedPlan=='free' || selectedPlan=='team-member') ){
        router.push('/signin');
        return
      }
      if (!selectedPlan) {
        throw new Error('Please select a plan before confirming signup.');
      }
      const response = await axios.post('https://test-api.slpeace.com/create-checkout-session', {
        email,
        plan: selectedPlan,
      });
      const { sessionId } = response.data;
      localStorage.setItem('checkoutSessionId', sessionId);
      const stripe = await stripePromise;

      const { error:errorStripe } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (errorStripe) {
        setError('Error Creating checkout session');
      }

    } catch (error) {
      setError(error.message || 'Failed to confirm signup');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setError('');
    setResendSuccess(false);

    try {
      await resendConfirmationCode(email);
      setResendSuccess(true);
    } catch (error) {
      setError(error.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-[#2b3990] mb-6">Verify Your Email</h2>
      
      <div className="mb-6 text-gray-600">
        <p className="mb-2">
          We&apos;ve sent a verification code to your email address:
        </p>
        <p className="font-medium text-[#2b3990]">{email}</p>
        <p className="mt-2 text-sm">
          Please check your inbox (and spam folder) for the verification code.
        </p>
      </div>

      <form onSubmit={handleConfirmSignUp} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Verification Code
          </label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter code"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2b3990] text-black"
            required
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {resendSuccess && (
          <p className="text-green-500 text-sm">
            A new verification code has been sent to your email.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2b3990] text-white py-3 rounded-lg hover:bg-[#232d73] flex items-center justify-center"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Email'}
        </button>

        <button
          type="button"
          onClick={handleResendCode}
          disabled={resendLoading}
          className="w-full text-[#2b3990] text-sm hover:underline flex items-center justify-center"
        >
          {resendLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Resend verification code'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          Didn&apos;t receive the email? Please check your spam folder or{' '}
          <button
            onClick={handleResendCode}
            disabled={resendLoading}
            className="text-[#2b3990] hover:underline"
          >
            click here to resend
          </button>
        </p>
      </div>

      <div className="mt-4 text-center text-sm text-[#2b3990] font-medium">
        For a smooth verification process, <br />
        <span className="text-red-500 font-semibold">please do not navigate away from this page.</span>
      </div>
    </div>
  );
}

// The main page component
export default function ConfirmSignup() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 flex flex-col items-center justify-between">
      <Navbar />
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#2b3990]" />
        </div>
      }>
        <ConfirmSignupContent />
      </Suspense>
      <FooterInfo />
    </div>
  );
}