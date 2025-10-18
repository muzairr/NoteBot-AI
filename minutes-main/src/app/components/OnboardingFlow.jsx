// components/OnboardingFlow.jsx
"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { signUp } from '../../utils/auth';
import { addToWaitlist } from '../../utils/waitlist'

export const OnboardingFlow = ({ signupData }) => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    isSLPProvider: null,
    activities: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const activities = [
    { id: 1, text: 'Dysarthria Treatment', correct: true },
    { id: 2, text: 'Apraxia Treatment', correct: true },
    { id: 3, text: 'Autism Treatment', correct: true },
    { id: 4, text: 'Biopsies of the Larynx', correct: false },
    { id: 5, text: 'Diagnosis of Swallowing Disorders', correct: true }
  ];

  const handleNext = async () => {
    if (step === 0 && answers.isSLPProvider === false) {
        setIsLoading(true);
        try {
          // If using backend API
          await addToWaitlist(signupData.email, signupData.name);
    
          setStep(3); // Move to waitlist message
        } catch (error) {
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
        return;
      }

    if (step === 1) {
        setIsLoading(true);
        try {
          console.log(signupData.plan);
          
          const result = await signUp(
            signupData.email,
            signupData.password,
            signupData.name,
            answers,
            signupData.plan,
          );
    
          if (result.status === 'WAITLIST') {
            setStep(3); // Move to waitlist message
          } else {
            // Redirect to confirmation page with email
            router.push(`/confirm-signup/?email=${encodeURIComponent(signupData.email)}`);
          }
        } catch (error) {
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
        return;
      }

    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const slideVariants = {
    enter: { x: '100%', opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 flex items-center justify-center p-4 text-black">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-8 flex flex-col items-center">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#2b3990] mb-2">
            Access Your Exclusive Early Free SLP Account
          </h1>
          {/* <div className="w-full bg-gray-200 h-2 rounded-full"> */}
            {/* <div 
              className="bg-[#ed155a] h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / 2) * 100}%` }}
            /> */}
          {/* </div> */}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {step === 0 && (
              <div className="space-y-4">
                <label className="block text-lg text-[#2b3990]">
                  Are you an SLP/SLPA provider?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setAnswers(prev => ({ ...prev, isSLPProvider: true }))}
                    className={`p-4 rounded-lg border-2 flex items-center justify-center space-x-2
                      ${answers.isSLPProvider === true 
                        ? 'border-[#2b3990] bg-[#2b3990] text-white' 
                        : 'border-gray-300 hover:border-[#2b3990]'}`}
                  >
                    <Check className="w-5 h-5" />
                    <span>Yes</span>
                  </button>
                  <button
                    onClick={() => setAnswers(prev => ({ ...prev, isSLPProvider: false }))}
                    className={`p-4 rounded-lg border-2 flex items-center justify-center space-x-2
                      ${answers.isSLPProvider === false 
                        ? 'border-[#2b3990] bg-[#2b3990] text-white' 
                        : 'border-gray-300 hover:border-[#2b3990]'}`}
                  >
                    <X className="w-5 h-5" />
                    <span>No</span>
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <label className="block text-lg text-[#2b3990]">
                  Check ALL activities that a Speech-Language Pathologist May Perform:
                </label>
                <div className="space-y-3">
                  {activities.map(activity => (
                    <button
                      key={activity.id}
                      onClick={() => {
                        setAnswers(prev => {
                          const newActivities = prev.activities.includes(activity.id)
                            ? prev.activities.filter(id => id !== activity.id)
                            : [...prev.activities, activity.id];
                          return { ...prev, activities: newActivities };
                        });
                      }}
                      className={`w-full p-4 rounded-lg border-2 flex items-center justify-between
                        ${answers.activities.includes(activity.id)
                          ? 'border-[#2b3990] bg-[#2b3990] text-white'
                          : 'border-gray-300 hover:border-[#2b3990]'}`}
                    >
                      <span>{activity.text}</span>
                      {answers.activities.includes(activity.id) && (
                        <Check className="w-5 h-5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="text-center space-y-4">
                <h2 className="text-xl font-bold text-[#2b3990]">
                  Congratulations! You&apos;ve successfully signed up!
                </h2>
                <p>Please check your email to verify your account before signing in.</p>
                <button
                  onClick={() => router.push('/signin')}
                  className="w-full p-4 bg-[#ed155a] text-white rounded-lg hover:bg-[#d01350]"
                >
                  Go to Sign In
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="text-center space-y-4">
                <h2 className="text-xl font-bold text-[#2b3990]">
                  Thanks for your interest!
                </h2>
                <p>
                  You&apos;ve been added to our exclusive waitlist. We&apos;ll review your application
                  and contact you soon with next steps. Thank you for your patience!
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="w-full p-4 bg-[#ed155a] text-white rounded-lg hover:bg-[#d01350]"
                >
                  Return to Home
                </button>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm mt-4">{error}</p>
            )}

            {step < 2 && (
              <div className="flex justify-between pt-6">
                {step > 0 ? (
                  <button
                    onClick={handleBack}
                    className="flex items-center space-x-2 text-[#2b3990]"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div></div>
                )}
                <button
                  onClick={handleNext}
                  disabled={isLoading || (step === 0 && answers.isSLPProvider === null)}
                  className="flex items-center space-x-2 text-[#2b3990]"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};