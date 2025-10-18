import React, { useState,useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff, Info } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from './Navbar';
import { FooterInfo } from './FooterInfo';
import axios from 'axios';

export const SignUpForm = ({ onComplete }) => {
  const [selectedPlan, setSelectedPlan] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    plan:''
  });
  const [agreements, setAgreements] = useState({
    termsAndPrivacy: false,
    baa: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [promoCode, setPromoCode] = useState('');  // State for storing the promo code
  const [promoLoading, setPromoLoading] = useState(false);   // State for loading
  const [promoValid, setPromoValid] = useState(null); // State for promo code validity


  const handlePromoCode = async () => {
    setPromoLoading(true);
    setPromoValid(null); // Reset the validation message while checking
    try {
      const response = await axios.get('https://test-api.slpeace.com/promoCode', {
        params: { code: promoCode } // Pass the promoCode as `code` in the query params
      });
      
      if (response.data?.valid) {
        setPromoValid(true); // Promo code is valid
        localStorage.setItem("plan", `team-member`);
        
      if (response.data?.days) {
        localStorage.setItem("promoExpiry", `true`);
      }
        setSelectedPlan(`team-member`);
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


  const isAgreementsAccepted = agreements.termsAndPrivacy && agreements.baa;

  // Password validation checks
  const passwordValidation = {
    minLength: formData.password.length >= 8,
    hasNumber: /\d/.test(formData.password),
    hasSpecial: /[^A-Za-z0-9]/.test(formData.password),
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password)
  };
  

  const handleSubmit = async (e) => {
    console.log("clicked");
    e.preventDefault();
    
    setLoading(true);
    setError('');
  
    if (!isAgreementsAccepted || !selectedPlan) {
      setError('Please accept agreements and select a plan');
      setLoading(false); // Ensure loading is reset
      return;
    }
  
    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
  
      if (!Object.values(passwordValidation).every(Boolean)) {
        throw new Error('Password does not meet all requirements');
      }
  
      onComplete({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        plan: formData.plan,
        agreements: agreements
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false); // Ensure loading is always reset
    }
  };
  
  

  useEffect(() => {
    // Update the plan in formData whenever selectedPlan changes
    setFormData((prevFormData) => ({
      ...prevFormData,
      plan: selectedPlan,
    }));
  }, [selectedPlan])

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

  return (
    <div className="flex items-center justify-center min-h-screen flex flex-col items-center justify-between text-black">
      <Navbar />
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-[#2b3990] mb-6">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2b3990]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2b3990]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
              <div
                type="div"
                className="ml-1 inline-flex items-center text-black"
                onMouseEnter={() => setIsPasswordFocused(true)}
                onMouseLeave={() => setIsPasswordFocused(false)}
              >
                <Info className="w-4 h-4 text-gray-400" />
              </div>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2b3990]"
                required
              />
              <div
                type="div"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
              </div>
            </div>
            {isPasswordFocused && (
  <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
    <p className="font-medium mb-2">Password requirements:</p>
    <ul className="space-y-1">
      <li className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-600'}`}>
        {passwordValidation.minLength ? '✓' : '○'} At least 8 characters
      </li>
      <li className={`flex items-center ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-600'}`}>
        {passwordValidation.hasNumber ? '✓' : '○'} At least one number
      </li>
      <li className={`flex items-center ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-gray-600'}`}>
        {passwordValidation.hasSpecial ? '✓' : '○'} At least one special character
      </li>
      <li className={`flex items-center ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-600'}`}>
        {passwordValidation.hasUppercase ? '✓' : '○'} At least one uppercase letter
      </li>
      <li className={`flex items-center ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-600'}`}>
        {passwordValidation.hasLowercase ? '✓' : '○'} At least one lowercase letter
      </li>
    </ul>
  </div>
)}

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2b3990] text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter Promo Code</label>
            <div className="flex items-center">
              <input
                type="text"
                name="promoCode"
                value={promoCode}  // Bind input value to state
                onChange={(e) => setPromoCode(e.target.value)}  // Update state when input changes
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2b3990] text-black"
                placeholder="Enter your promo code"
              />
              <div
                onClick={() => handlePromoCode()}
                className={`ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 ${promoLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                disabled={promoLoading}  // Disable div if loading
              >
                {promoLoading ? (
                  <span className="animate-spin rounded-full border-4 border-t-4 border-blue-500 w-6 h-6">🔄</span> // Custom spinner
                ) : (
                  "Apply"
                )}
              </div>
            </div>
              
            {/* Display validation message below the input */}
            {promoValid !== null && (
              <div className={`mt-2 text-sm ${promoValid ? 'text-green-500' : 'text-red-500'}`}>
                {promoValid ? "Promo code is valid!" : "Invalid promo code"}
              </div>
            )}
          </div>



          <div className="relative mt-4">
  {/* div to open the popup */}
  {promoValid !== true && (
  <div
    onClick={() => setShowPopup(true)}
    className="bg-blue-500 text-white px-4 py-2 rounded-md w-fit cursor-pointer"
  >
    Choose Plan
  </div>
)}


  {/* Display selected plan */}
  {selectedPlan && (
    <p className="mt-2 text-gray-700">
      Selected Plan: <span className="font-bold">{selectedPlan}</span>
    </p>
  )}

  {/* Full-screen popup */}
  {showPopup && (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-xl shadow-xl w-[95%] max-w-4xl mx-auto text-center relative max-h-[95vh] overflow-y-auto">
      <div
        onClick={() => setShowPopup(false)}
        className="sticky top-2 float-right right-2 bg-white text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 shadow-md z-10"
      >
        ×
      </div>

      <div className="flex flex-col items-center p-4">
        <h1 className="text-xl sm:text-3xl font-bold mb-4 text-[#2b3990]">Pricing</h1>
        
        <div 
        onClick={() => {localStorage.setItem("plan", 'free');
                    setSelectedPlan('free');
                    setShowPopup(false);
                  }} 
        className="text-lg sm:text-xl font-bold mb-6 bg-[#e20d58] text-white rounded-full py-2 px-6 hover:opacity-90 transition-opacity">
          Try Free Now!
        </div>
        
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
                  <div 
                    onClick={() => {
                      localStorage.setItem("plan", `${feature.name}-monthly`);
                      setSelectedPlan(`${feature.name}-monthly`);
                      setShowPopup(false);
                    }}
                    className="bg-[#e20d58] text-white py-2 px-4 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
                  >
                    BUY MONTHLY
                  </div>
                  <div 
                    onClick={() => {
                      localStorage.setItem("plan", `${feature.name}-annual`);
                      setSelectedPlan(`${feature.name}-annual`);
                      setShowPopup(false);
                    }}
                    className="bg-[#e20d58] text-white py-2 px-4 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
                  >
                    BUY ANNUAL
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => {
                    localStorage.setItem("plan", feature.name);
                    setSelectedPlan(feature.name);
                    setShowPopup(false);
                  }}
                  className={`bg-[#e20d58] text-white py-2 px-4 rounded-full font-bold text-sm transition-opacity ${
                    feature.title === "ENTERPRISE*" ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                  }`}
                  disabled={feature.title === "ENTERPRISE*"}
                >
                  {feature.title === "ENTERPRISE*" ? "COMING SOON" : "BUY NOW"}
                </div>
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
  </div>
)}
          </div>
          {/* Agreement Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms-privacy"
                  type="checkbox"
                  checked={agreements.termsAndPrivacy}
                  onChange={(e) => setAgreements({...agreements, termsAndPrivacy: e.target.checked})}
                  className="w-4 h-4 border border-gray-300 rounded text-[#2b3990] focus:ring-[#2b3990]"
                />
              </div>
              <label htmlFor="terms-privacy" className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <Link href="/terms-of-service" target="_blank" className="text-[#2b3990] hover:text-[#232d73] underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy-policy" target="_blank" className="text-[#2b3990] hover:text-[#232d73] underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="baa"
                  type="checkbox"
                  checked={agreements.baa}
                  onChange={(e) => setAgreements({...agreements, baa: e.target.checked})}
                  className="w-4 h-4 border border-gray-300 rounded text-[#2b3990] focus:ring-[#2b3990]"
                />
              </div>
              <label htmlFor="baa" className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <Link href="/baa" target="_blank" className="text-[#2b3990] hover:text-[#232d73] underline">
                  Business Associate Agreement (BAA)
                </Link>
              </label>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !isAgreementsAccepted || !selectedPlan}
            className={`w-full py-3 rounded-lg flex items-center justify-center transition-colors
              ${loading || !selectedPlan ? 'bg-gray-400 cursor-not-allowed' : 
                isAgreementsAccepted ? 'bg-[#2b3990] hover:bg-[#232d73] text-white' : 
                'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
          </button>
        </form>
      </div>
      <FooterInfo />
    </div>
  );
};

export default SignUpForm;