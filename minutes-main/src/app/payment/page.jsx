'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { getCurrentUser,updateUser } from '../../utils/auth';
import withAuth from '../components/auth/withAuth';
import LoggedInNavbar from '../components/LoggedInNavbar';
import Head from 'next/head';
import CustomToast from '../components/CustomToast';



// Load your Stripe public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);



const PlanSelectionModal = () => {
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState({});
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for subscription fetching
  
  const [promoCode, setPromoCode] = useState('');  // State for storing the promo code
  const [promoLoading, setPromoLoading] = useState(false);   // State for loading
  const [promoValid, setPromoValid] = useState(null); // State for promo code validity
  const [checkPromoExpiry,setCheckPromoExpiry] = useState(false)
  const [expiryDate, setExpiryDate] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setEmail(user?.email || '');
        setPlan({
          name: user?.['custom:plan'] || '',
          date: user?.['custom:planDate'] || ''
        });
        if(user?.['custom:promoExpiry'] && user?.['custom:promoExpiry']=='true'){
          setCheckPromoExpiry(true)
          if (user?.['custom:planDate']) {
            const planDate = new Date(user['custom:planDate']);
              const calculatedExpiry = new Date(planDate.setDate(planDate.getDate() + 90))
                .toISOString()
                .split('T')[0];
              setExpiryDate(calculatedExpiry);
            }
        }
        if(user?.['custom:plan'] && user?.['custom:plan']=='free' && !user?.['custom:planDate']){
          const currentDate = new Date();

          const planDate=currentDate.toISOString();
          updateUser({planDate})
        }
        console.log(plan.name , plan.date);
        
      } catch (error) {
        console.error('Error fetching user:', error.message);
      }
    };
    
    fetchUser();
  }, []);




  const handlePlanSelection = async (selectedPlan) => {
    try {
      const user = await getCurrentUser();
      console.log(selectedPlan)
      if(selectedPlan==='free'){
        if(plan?.name){
          setMessage("Cannot activate the free plan.");
          setShowMessage(true);
          return;
        }
        else{
          const currentDate = new Date();
          const planDate=currentDate.toISOString();
          const resUp = await updateUser({ selectedPlan,planDate });
          return
        }
      }
      const resUp = await updateUser({ selectedPlan});
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

  const handleClosePopup = () => {
    setShowPopup(false); // Close the popup
  };

  const cancelSubscription = async (subscriptionId) => {
    setLoading(true); // Start loading when the request begins
    try {
      const response = await axios.post('https://test-api.slpeace.com/cancel-subscription', { subscriptionId });
      
      setMessage(response.data.message);
      setShowMessage(true); // You can show a success message here
      fetchSubscriptions(); // Refresh subscription list
    } catch (error) {
      setError('Error canceling subscription');
    }finally {
      setLoading(false); // Stop loading once the request is completed
    }
  };

  const fetchSubscriptions = async () => {
    setLoading(true); // Start loading when the request begins
    try {

      const user = await getCurrentUser(); // Fetch the current user
      const response = await axios.get('https://test-api.slpeace.com/active-subscriptions', { params: { email:user.email,sub:user.sub } });
      setSubscriptions(response.data.filteredSubscriptions);
    } catch (error) {
      setError('Error fetching subscriptions');
    } finally {
      setLoading(false); // Stop loading once the request is completed
    }
  };

  const handlePromoCode = async () => {
    setPromoLoading(true);
    setPromoValid(null); // Reset the validation message while checking

    const user = await getCurrentUser();
      if(!plan?.name){
      }else if( plan.name=='team-member'){
        setMessage("Promo already exists");
        setShowMessage(true);
        setPromoLoading(false);
        setPromoValid(null); 
        return;
      }
    try {
      const response = await axios.get('https://test-api.slpeace.com/promoCode', {
        params: { code: promoCode } // Pass the promoCode as `code` in the query params
      });
      console.log(response.data)
      if (response.data?.valid && response.data?.days) {
        setPromoValid(true);
        const currentDate = new Date();
        const planDate=currentDate.toISOString();
        const resUp = await updateUser({ selectedPlan:'team-member',promoExpiry:'true',planDate:planDate});
        return
      }else if (response.data?.valid) {
        setPromoValid(true);
        const currentDate = new Date();
        const planDate=currentDate.toISOString(); 
        const resUp = await updateUser({ selectedPlan:'team-member',planDate:planDate,promoExpiry:'false'});
        return

      } else {
        setPromoValid(false); // Promo code is invalid
      }
    } catch (error) {
      console.error("Error applying promo code", error);
      setPromoValid(false); // Set as invalid if there's an error in the request
    } finally {
      setPromoLoading(false);
    }
  };



  const features = [
    {
      title: "FREE*",
      name: "free",
      description: [
        "Enjoy a 3-day free trial to explore all the features risk-free!",
        "No credit card required!"
      ]
    },
    {
      title: "INDIVIDUALS*",
      name: "individual",
      description: [
        {
          type: "monthly",
          price: "$9.99/month"
        },
        {
          type: "annual",
          price: "$97/year (save over 15%)"
        },
        "Clear, flexible, and designed for you!"
      ]
    },
    {
      title: "ENTERPRISE*",
      name: "enterprise",
      description: [
        "Flat Rate: $49.99/month for up to 25 users. (save big as you scale)",
        "Scalable: After 25 users, additional users are just $9.99/month each."
      ]
    }
  ];
  useEffect(() => {
    if (email) fetchSubscriptions(); // Fetch subscriptions when the component mounts or email is available
  }, [email]);
  
  const handleButtonClick = (name) => {
    console.log(`Selected plan: ${name}`);
  };

  return (
    <>
      {showMessage && <CustomToast message={message} onClose={() => setShowMessage(false)} />}
    <div className="bg-white min-h-screen flex flex-col">
      <div className="container bg-white mx-auto flex flex-col flex-grow min-h-screen dark:bg-white">
        <LoggedInNavbar />
        {/* Main Button */}
        <div className="text-center mt-8 mb-8">
          <button
            onClick={() => setShowPopup(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors duration-200"
          >
            Select a Plan
          </button>
        </div>
  
        {/* Modal Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-[95%] max-w-4xl mx-auto text-center relative max-h-[95vh] overflow-y-auto">
              {/* Close button moved inside with better visibility */}
              <button
                onClick={handleClosePopup}
                className="sticky top-2 float-right right-2 bg-white text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 shadow-md z-10"
              >
                ×
              </button>
  
              <div className="flex flex-col items-center p-4">
                <h1 className="text-xl sm:text-3xl font-bold mb-4 text-[#2b3990]">Pricing</h1>
  
                <button
                  onClick={() => handlePlanSelection('free')}
                  className="text-lg sm:text-xl font-bold mb-6 bg-[#e20d58] text-white rounded-full py-2 px-6 hover:opacity-90 transition-opacity"
                >
                  Try Free Now!
                </button>
  
                <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-[#cfd0e2] rounded-2xl p-4 shadow-lg transition-transform hover:scale-105 flex flex-col justify-between"
                    >
                      <div>
                        <h2 className="text-[#e20d58] text-lg font-bold mb-2">{feature.title}</h2>
                        {feature.title === "INDIVIDUALS*" ? (
                          <div className="text-[#2b3990] font-bold flex flex-col items-center justify-center text-sm">
                            <p>Monthly:</p>
                            <p className="mb-2">{feature.description[0].price}</p>
                            <p>Annual:</p>
                            <p className="mb-2">{feature.description[1].price}</p>
                            <p>{feature.description[2]}</p>
                          </div>
                        ) : (
                          <div className="text-[#2b3990] font-bold flex flex-col items-center justify-center text-sm">
                            {feature.description.map((desc, i) => (
                              <p key={i} className="mb-2">{desc}</p>
                            ))}
                          </div>
                        )}
                      </div>
  
                      {feature.title === "INDIVIDUALS*" ? (
                        <div className="flex flex-col gap-2 mt-4">
                          <button
                            onClick={() => handlePlanSelection(feature.name + '-monthly')}
                            className="bg-[#e20d58] text-white py-2 px-4 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
                          >
                            BUY MONTHLY
                          </button>
                          <button
                            onClick={() => handlePlanSelection(feature.name + '-annual')}
                            className="bg-[#e20d58] text-white py-2 px-4 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
                          >
                            BUY ANNUAL
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePlanSelection(feature.name)}
                          className={`bg-[#e20d58] text-white py-2 px-4 rounded-full font-bold text-sm transition-opacity ${
                            feature.title === "ENTERPRISE*" ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                          }`}
                          disabled={feature.title === "ENTERPRISE*"}
                        >
                          {feature.title === "ENTERPRISE*" ? "COMING SOON" : "BUY NOW"}
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {/* Centered Promo Code Section */}
                  <div className="flex flex-col justify-center items-center w-full col-span-1 sm:col-span-3">
                    {/* Promo Code Input and Button */}
                    <div className="flex items-center">
                      <input
                        type="text"
                        name="promoCode"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2b3990] text-black"
                        placeholder="Enter your promo code"
                      />
                      <div
                        onClick={() => handlePromoCode()}
                        className={`ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 ${promoLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                        disabled={promoLoading}
                      >
                        {promoLoading ? (
                          <span className="animate-spin rounded-full border-4 border-t-4 border-blue-500 w-6 h-6">🔄</span>
                        ) : (
                          "Apply"
                        )}
                      </div>
                    </div>
  
                    {/* Promo Validation Message */}
                    {promoValid !== null && (
                      <div className={`mt-2 text-sm ${promoValid ? 'text-green-500' : 'text-red-500'}`}>
                        {promoValid ? "Promo code is valid!" : "Invalid promo code"}
                      </div>
                    )}
                  </div>
  
                </div>
  
                <p className="text-xs text-gray-600">
                  *Terms and conditions apply. See{' '}
                  <a href="/terms-of-service" className="text-[#e20d58] hover:underline">Terms of Use</a>.
                </p>
              </div>
            </div>
          </div>
        )}
  
        {/* Active Subscriptions Section */}
        <div className="mt-12 mx-20">
          <h2 className="font-bold flex items-center justify-center text-2xl mb-6 text-center text-gray-800">Your Active Subscriptions</h2>
  
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
  
          {/* Error Message */}
          {error && !loading && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 font-medium">
              {error}
            </div>
          )}
  
          {/* No Subscriptions Message */}
          {!loading && subscriptions?.length === 0 && !error && (
            <div className="text-center py-8 text-gray-600">
              No active subscriptions found.
            </div>
          )}
  
          {/* Subscriptions List */}
          {!loading && subscriptions?.length > 0 && (
            <div className="space-y-4">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-2">
                    <p className="font-medium">
                      <span className="text-gray-600">Plan:</span>{' '}
                      <span className="text-gray-800">{sub.metadata?.plan || 'N/A'}</span>
                    </p>
                    <p className="font-medium">
                      <span className="text-gray-600">Status:</span>{' '}
                      <span className={`text-${sub.status === 'canceled' ? 'red' : 'green'}-500`}>
                        {sub.status || 'Unknown'}
                      </span>
                    </p>
                    <p className="font-medium">
                      <span className="text-gray-600">
                        {sub.status === 'canceled' ? 'Expiry Date:' : 'Renewal Date:'}
                      </span>{' '}
                      <span className="text-gray-800">
                        {new Date(sub.current_period_end * 1000).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
  
                  {sub.status !== 'canceled' && (
  <div className="w-full md:w-auto">
    <button
      onClick={() => cancelSubscription(sub.id)}
      className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 w-full md:w-auto"
    >
      Cancel Subscription
    </button>
    <p className="text-sm text-gray-500 mt-2 text-center md:text-left">
      <a href="/terms-of-service" className="underline hover:text-gray-700">
        Terms apply
      </a>
    </p>
  </div>
)}


                </div>
              ))}
            </div>
          )}
          {plan.name === 'free' && (
  <div className="border border-dashed border-gray-300 rounded-lg p-4 mt-4 bg-gray-50">
    <p className="font-medium text-gray-800">Free Plan</p>
    <p className="text-gray-600">
      Date:{' '}
      <span className="text-gray-800">
        {new Date(plan.date || new Date()).toLocaleDateString()}
      </span>
    </p>
    <p className="text-gray-600">
      Expiry Date:{' '}
      <span className="text-gray-800">
        {new Date(new Date(plan.date || new Date()).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
      </span>
    </p>
  </div>
)}

{plan.name === 'team-member' && (
  <div className="border border-dashed border-gray-300 rounded-lg p-4 mt-4 bg-gray-50">
    <p className="font-medium text-gray-800">Plan: Promo</p>
    {checkPromoExpiry && expiryDate && (
      <p className="text-sm text-gray-600">Expiry Date: {expiryDate}</p>
    )}
  </div>
)}

        </div>
      </div>
      <div className="flex justify-center my-10 mb-5">
    <a 
      href="https://www.trustpilot.com/review/slpeace.com" 
      className="flex w-fit items-center justify-center space-x-2 border border-[#00B67A] text-[#00B67A] font-medium py-2 px-4"
    >
      <span className='text-black'>Review us on</span>
      <img src="/trustpilot.svg" alt="Trustpilot" className="h-5" />
    </a>
  </div>

      </div>
    </>
  );
  
};


export default withAuth(PlanSelectionModal);




{/* <div className="flex flex-col items-center px-4 py-12 text-center">
        <h1 className="text-2xl md:text-5xl font-bold mb-8 text-[#2b3990]">Pricing</h1>
        <button className="text-2xl md:text-4xl font-bold mb-12 bg-[#e20d58] text-white rounded-full py-6 px-12 hover:opacity-90 transition-opacity">
          Try Free Now!
        </button>
        
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-[#cfd0e2] rounded-3xl p-8 shadow-lg transition-transform hover:scale-105 flex flex-col justify-between min-h-[400px]"
            >
              <div>
                <h2 className="text-[#e20d58] text-2xl font-bold mb-6">{feature.title}</h2>
                {feature.title === "INDIVIDUALS*" ? (
                  <div className="text-[#2b3990] font-bold flex flex-col items-center justify-center">
                    <p className="">Monthly:</p>
                    <p className="mb-4">{feature.description[0].price}</p>
                    <p className="">Annual:</p>
                    <p className="mb-4">{feature.description[1].price}</p>
                    <p>{feature.description[2]}</p>
                  </div>
                ) : (
                  <div className="text-[#2b3990] font-bold flex flex-col items-center justify-center">
                    {feature.description.map((desc, i) => (
                      <p key={i} className="mb-4">{desc}</p>
                    ))}
                  </div>
                )}
              </div>
              
              {feature.title === "INDIVIDUALS*" ? (
                <div className="flex flex-col gap-3 mt-6">
                  <button 
                    onClick={() => handlePlanSelection(feature.name+'-monthly')}
                    className="bg-[#e20d58] text-white py-3 px-6 rounded-full font-bold hover:opacity-90 transition-opacity"
                  >
                    BUY MONTHLY
                  </button>
                  <button 
                    onClick={() => handlePlanSelection(feature.name+'-annual')}
                    className="bg-[#e20d58] text-white py-3 px-6 rounded-full font-bold hover:opacity-90 transition-opacity"
                  >
                    BUY ANNUAL
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => handlePlanSelection(feature.name)}
                  className={`bg-[#e20d58] text-white py-3 px-6 rounded-full font-bold transition-opacity ${feature.title === "ENTERPRISE*" ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                  disabled={feature.title === "ENTERPRISE*"}
                >
                  {feature.title === "ENTERPRISE*" ? "COMING SOON" : "BUY NOW"}
                </button>
              )}
            </div>
          ))}
        </div>
        
        <p className="text-sm text-gray-600">
          *Terms and conditions apply. See{' '}
          <a href="#" className="text-[#e20d58] hover:underline">
            Terms of Use
          </a>
          .
        </p>
      </div> */}