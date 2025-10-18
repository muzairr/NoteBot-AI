'use client'


import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { useState, useEffect } from 'react';
import FAQ from './faq/page';
import { ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
export default function Home() {

  const [expandedIndex, setExpandedIndex] = useState(null);
  const router = useRouter();

  const toggleItem = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const [activeIndex, setActiveIndex] = useState(2); // Center image is active

  useEffect(() => {
    // Add smooth scrolling behavior to the whole page
    document.documentElement.style.scrollBehavior = 'smooth';

    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const slideIn = {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5 } }
  };


  const nextSlide = () => {
    setActiveIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setActiveIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  

  const features = [
    {
      icon: "/Relax.png", // Replace with actual icon component
      title: "Quick And Easy To Use",
      color: "bg-[#cfd0e2]",
      textColor: "text-[#2b3990]",
      description: "Share a summary of your session visit with family members at the end of each session Cut documentation time out of your day!"
    },
    {
      icon: "nail.png", // Replace with actual icon component
      title: "Cost Effective!",
      color: "bg-[#cfd0e2]",
      textColor: "text-[#2b3990]",
      description: "Our tool is accessible for less than the cost of a manicure! In fact, it's accessible to try for Free! No credit card required!"
    },
    {
      icon: "hands.png", // Replace with actual icon component
      title: "We Know!",
      color: "bg-[#cfd0e2]",
      textColor: "text-[#2b3990]",
      description: "We know because we've been there! Our team has been using this tool for the last several months and we love how much easier it is! See what our team has to say here!"
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    
    // Get form data
    const formData = new FormData(e.target);
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const comment = formData.get('comment');
  
    // Format email body
    const body = `
  First Name: ${firstName}
  Last Name: ${lastName}
  Email: ${email}
  Phone: ${phone}
  
  Comment:
  ${comment}
    `.trim();
  
    // Encode the body for mailto
    const mailtoLink = `mailto:help@slpeace.com?subject=Contact Form Submission&body=${encodeURIComponent(body)}`;
    
    // Open email client
    window.location.href = mailtoLink;
  };


  return (
    <div className="bg-white text-black z-0 font-sans">
  <Navbar />
  
  <motion.section 
    initial="hidden"
    animate="visible"
    variants={fadeIn}
    className="bg-gradient-to-b from-white md:pt-16 pt-8 to-green-50 text-black z-0 font-sans flex flex-col md:flex-row items-center justify-between mx-auto px-4 md:ml-0 pb-20"
  >
    <motion.div 
      variants={slideIn}
      className="w-full md:w-1/2 mb-8 md:mb-0 md:ml-24"
    >
      <img src="/privatisation-commission.jpeg" alt="Privatisation Commission Pakistan" className="h-20 mb-4"/>
      <h1 className="text-4xl md:text-6xl font-bold text-[#01411c] mb-6">
        Meeting Minutes Generator <br />
      </h1>
      <div className="flex items-center">
        <button className="bg-[#006600] text-white px-6 py-2 md:px-10 md:py-2 rounded-full text-xl md:text-xl mb-4 hover:bg-[#004d00]" onClick={() => router.push('/signup')}>
          Start Now
        </button>
        <img src="/mic.png" alt="Microphone icon" className="ml-4"/>
        <p className="text-[#01411c] text-lg font-semibold">Use voice commands</p>
      </div>
      <p className="text-[#01411c] max-w-xl font-semibold text-lg text-center sm:text-left">
        Specially designed for the Privatisation Commission of Pakistan. Generate comprehensive meeting minutes using just your voice. Eliminate administrative burden, enhance documentation compliance, and increase productivity with our secure, customizable solution.
      </p>
    </motion.div>
    <motion.div
      variants={slideIn}
      className="w-full md:w-1/2 flex justify-center"
    >
      <img 
        src="/privatisation-commission.jpeg" 
        alt="Privatisation Commission Meeting" 
        className="rounded-lg shadow-xl max-w-md"
      />
    </motion.div>
  </motion.section>

  <motion.section
    initial="hidden"
    animate="visible"
    variants={fadeIn}
    className="block bg-[url('/pakistan-pattern.png')] bg-repeat bg-auto text-black flex flex-col items-center justify-center md:min-h-screen py-4 md:p-4"
  >
    <h1 className="text-2xl md:text-5xl text-[#01411c] font-bold mt-8">Documentation Process</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16 px-4">
      {/* Step 1 */}
      <div className="bg-white rounded-lg shadow-lg p-6 relative">
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#006600] text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">1</div>
        <h3 className="text-xl font-bold text-[#01411c] mt-6 mb-4 text-center">Record Meeting</h3>
        <p className="text-gray-700 text-center">Activate the microphone during your commission meetings or patient consultations.</p>
      </div>

      {/* Step 2 */}
      <div className="bg-white rounded-lg shadow-lg p-6 relative">
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#006600] text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">2</div>
        <h3 className="text-xl font-bold text-[#01411c] mt-6 mb-4 text-center">AI Processing</h3>
        <p className="text-gray-700 text-center">Our system instantly transcribes and formats content into professional minutes or SOAP notes.</p>
      </div>

      {/* Step 3 */}
      <div className="bg-white rounded-lg shadow-lg p-6 relative">
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#006600] text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">3</div>
        <h3 className="text-xl font-bold text-[#01411c] mt-6 mb-4 text-center">Review & Distribute</h3>
        <p className="text-gray-700 text-center">Edit if needed, then securely distribute documents to all relevant stakeholders.</p>
      </div>
    </div>
  </motion.section>

  <section className="bg-white py-16">
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-2xl md:text-5xl font-bold mb-12 text-[#01411c] text-center">Document Templates</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Meeting Minutes Template */}
        <div className="bg-green-50 rounded-lg shadow-lg p-6 border-l-4 border-[#006600]">
          <h3 className="text-2xl font-bold text-[#01411c] mb-4">Meeting Minutes</h3>
          <div className="bg-white p-4 rounded shadow mb-4">
            <p className="font-bold">Privatisation Commission Meeting</p>
            <p><span className="font-semibold">Date:</span> [Auto-Generated]</p>
            <p><span className="font-semibold">Attendees:</span> [Auto-Generated]</p>
            <p><span className="font-semibold">Agenda Items:</span> [Auto-Generated]</p>
            <p><span className="font-semibold">Key Discussions:</span> [Auto-Generated]</p>
            <p><span className="font-semibold">Decisions Made:</span> [Auto-Generated]</p>
            <p><span className="font-semibold">Action Items:</span> [Auto-Generated]</p>
          </div>
          <button className="bg-[#006600] text-white px-6 py-2 rounded-full hover:bg-[#004d00] w-full">
            Generate Meeting Minutes
          </button>
        </div>
        
      
      </div>
    </div>
  </section>

  <section id="faq" className="bg-gradient-to-b from-white to-green-50 flex items-center justify-center flex-col mx-auto w-full space-y-12 py-20 text-center">
    <h1 className="text-2xl md:text-5xl text-[#01411c] font-bold">Frequently Asked Questions</h1>
    <FAQ/>
  </section>
  
  <div className="bg-gradient-to-b from-white to-green-50 flex flex-col items-center px-4 text-black justify-center py-8">
    <h1 className="text-2xl md:text-5xl font-bold mb-12 text-[#01411c]">Why Choose Our Solution?</h1>
    <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 mt-8">
      {/* Feature 1 */}
      <div className="relative bg-[#e8f5e9] text-[#01411c] rounded-2xl p-8 transition-transform hover:scale-105 text-center">
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <div className="w-24 h-24 flex items-center justify-center">
          </div>
        </div>
        <h2 className="text-xl font-semibold mt-4 mb-4">Government-Grade Security</h2>
        <p className="text-lg opacity-90">Advanced encryption and compliance with Pakistani government data protection standards.</p>
      </div>
      
      {/* Feature 2 */}
      <div className="relative bg-[#e8f5e9] text-[#01411c] rounded-2xl p-8 transition-transform hover:scale-105 text-center">
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <div className="w-24 h-24 flex items-center justify-center">
          </div>
        </div>
        <h2 className="text-xl font-semibold mt-4 mb-4">Save 200+ Hours Annually</h2>
        <p className="text-lg opacity-90">Automate documentation to focus on critical privatisation decisions and stakeholder engagement.</p>
      </div>
      
      {/* Feature 3 */}
      <div className="relative bg-[#e8f5e9] text-[#01411c] rounded-2xl p-8 transition-transform hover:scale-105 text-center">
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <div className="w-24 h-24 flex items-center justify-center">
          </div>
        </div>
        <h2 className="text-xl font-semibold mt-4 mb-4">Fully Customizable</h2>
        <p className="text-lg opacity-90">Tailor templates to specific privatisation projects and commission requirements.</p>
      </div>
    </div>
  </div>

  {/* <section className="bg-[#01411c] text-white py-16">
    <div className="max-w-6xl mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-8">Trusted by Government Agencies</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="bg-white/10 p-4 rounded-lg">
          <img src="/ministry-finance.png" alt="Ministry of Finance" className="h-16 mx-auto" />
        </div>
        <div className="bg-white/10 p-4 rounded-lg">
          <img src="/state-bank.png" alt="State Bank of Pakistan" className="h-16 mx-auto" />
        </div>
        <div className="bg-white/10 p-4 rounded-lg">
          <img src="/secp.png" alt="SECP" className="h-16 mx-auto" />
        </div>
        <div className="bg-white/10 p-4 rounded-lg">
          <img src="/ministry-it.png" alt="Ministry of IT" className="h-16 mx-auto" />
        </div>
      </div>
    </div>
  </section> */}
  
  <Footer/>
</div>
  )
}

function getImagePosition(position) {
  switch (position) {
    case -2:
      return "transform -translate-x-32 opacity-0";
    case -1:
      return "transform -translate-x-16 opacity-70 scale-75";
    case 0:
      return "transform translate-x-0 opacity-100 scale-100 z-0";
    case 1:
      return "transform translate-x-16 opacity-70 scale-75";
    case 2:
      return "transform translate-x-32 opacity-0";
    default:
      return "opacity-0";
  }
}