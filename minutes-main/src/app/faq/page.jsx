'use client'
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQItem = ({ question, answer }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`mx-4 md:mx-0 border border-[#2b3990] border-1 rounded-lg overflow-hidden ${isExpanded ? 'bg-[#2b3990]' : 'bg-white'}`}>
      <button
        className="flex justify-between items-center w-full text-left p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className={`text-xl font-semibold ${isExpanded ? 'text-white' : 'text-[#2b3990]'}`}>{question}</h2>
        {isExpanded ? (
          <ChevronUp className={`w-6 h-6 ${isExpanded ? 'text-white' : 'text-[#2b3990]'}`} />
        ) : (
          <ChevronDown className={`w-6 h-6 ${isExpanded ? 'text-white' : 'text-[#2b3990]'}`} />
        )}
      </button>
      {isExpanded && (
        <p className="mt-2 p-4 text-white font-semibold text-left">{answer}</p>
      )}
    </div>
  );
};

const FAQ = () => {
  const faqItems = [
    {
      question: "Is it Secure?",
      answer: "Yes!! Default notes are de-identified! Unlike other automated notes platforms, we only turn your session summary into a personalized note allowing for the greatest level of privacy for you and your client! The highest level of encryption ensures all private health information is safe."
    },
    // {
    //   question: "What happens after my free trial ends?",
    //   answer: "After your 3-day free trial, you will need to choose from one of our three paid subscription plans to continue using our services."
    // }
  ];

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6 mt-12">
      {faqItems.map((item, index) => (
        <FAQItem key={index} question={item.question} answer={item.answer} />
      ))}
    </div>
  );
};

export default FAQ;