
'use client'
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { getCurrentUser,updateUser } from '../../utils/auth';
import { useState,useEffect } from "react";
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import {checkAuth} from '../components/auth/checkAuth';
import axios from 'axios';




const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);


export default function PricingPage() {

  const router = useRouter();

  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState({});

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
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setEmail(user?.email || '');
        setPlan({
          name: user?.['custom:plan'] || '',
          date: user?.['custom:planDate'] || ''
        });
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

      const authStatus = await checkAuth();
      if (!authStatus.isAuthenticated) {
        router.replace('/signup'); // Redirect to sign-in page
        return;
      }


      console.log(selectedPlan)
      if(selectedPlan==='free'){
        if(plan?.name){
          alert('Can not activate free plan');
          return;
        }
        else{
          const currentDate = new Date();
          const planDate=currentDate.toISOString();
          const resUp = await updateUser({ selectedPlan,planDate });
          return;
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
      console.log(err);
      setError('Error creating checkout session');
    }
  };
    return (
<div className="flex bg-white flex-col w-screen min-h-screen justify-between">
  <Navbar />
  
  <div className="bg-white w-[95%] max-w-4xl mx-auto text-center relative max-h-[95vh] overflow-y-auto mt-10">
    <div className="flex flex-col items-center p-4">
      <h1 className="text-xl sm:text-3xl font-bold mb-4 text-[#2b3990]">Pricing</h1>
      
      <button 
        onClick={() => handlePlanSelection('free')} 
        className="text-lg sm:text-xl font-bold mb-6 bg-[#e20d58] text-white rounded-full py-2 px-6 hover:opacity-90 transition-opacity">
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
                  onClick={() => handlePlanSelection(feature.name+'-monthly')}
                  className="bg-[#e20d58] text-white py-2 px-4 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  BUY MONTHLY
                </button>
                <button 
                  onClick={() => handlePlanSelection(feature.name+'-annual')}
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
      </div>
      
      <p className="text-xs text-gray-600">
        *Terms and conditions apply. See{' '}
        <a href="/terms-of-service" className="text-[#e20d58] hover:underline">Terms of Use</a>.
      </p>
    </div>
  </div>

  <Footer />
</div>

    );
  }
  