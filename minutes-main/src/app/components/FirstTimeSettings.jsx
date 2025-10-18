import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import { saveUserSettings } from '../../utils/user-settings';
import { getCurrentUser } from '../../utils/auth';

const FirstTimeSettings = () => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [customClientName, setCustomClientName] = useState('');
  const [customLanguage, setCustomLanguage] = useState('');
  const [customClinicianTitle, setCustomClinicianTitle] = useState('');
  const [customSubjectLine, setCustomSubjectLine] = useState('');
  const [settings, setSettings] = useState({
    useDefaults: null,
    clientName: '',
    clinicianTitle: '',
    language: '',
    emailPreference: '',
    customEmails: [],
    perNoteEmails: false,
    subjectLinePreference: '',
    customClientName: '',
    customClinicianTitle: '',
    customSubject: '',
    customLanguage:''
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setUserEmail(user.email);
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/signin');
      }
    };

    fetchUser();
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleAddEmail = () => {
    if (!validateEmail(newEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (settings.customEmails.length >= 3) {
      setEmailError('Maximum of 3 emails allowed');
      return;
    }
    if (settings.customEmails.includes(newEmail)) {
      setEmailError('Email already added');
      return;
    }
  
    setSettings(prev => ({
      ...prev,
      customEmails: [...prev.customEmails, newEmail]
    }));
    setNewEmail('');
    setEmailError('');
  };

  const handleRemoveEmail = (emailToRemove) => {
    setSettings(prev => ({
      ...prev,
      customEmails: prev.customEmails.filter(email => email !== emailToRemove)
    }));
  };

  const steps = [
    {
      title: "Welcome! 🎉",
      question: "Would you like to keep the default settings or customize them for your notes?",
      options: [
        { id: 'defaults', text: 'Keep Defaults' },
        { id: 'customize', text: 'Customize Settings' }
      ],
      field: 'useDefaults'
    },
    {
      title: "Client Reference",
      question: "What would you like your client to be called in your note?",
      options: [
        { id: 'student', text: 'Student' },
        { id: 'client', text: 'Client' },
        { id: 'child', text: 'Child' },
        { id: 'patient', text: 'Patient' },
        { id: 'by_name', text: 'By Name (as stated in each note)' },
        { id: 'other', text: 'Other' }
      ],
      field: 'clientName'
    },
    {
      title: "Clinician Title",
      question: "How would you like to be referred to in your notes?",
      options: [
        { id: 'clinician', text: 'Clinician' },
        { id: 'slp', text: 'SLP' },
        { id: 'slpa', text: 'SLPA' },
        { id: 'therapist', text: 'Therapist' },
        { id: 'other', text: 'Other' }
      ],
      field: 'clinicianTitle'
    },
    {
      title: "Language Preference",
      question: "What language would you like your notes transcribed in?",
      options: [
        { id: 'as_spoken', text: 'Language I speak to the tool' },
        { id: 'english', text: 'English' },
        { id: 'spanish', text: 'Spanish' },
        { id: 'custom_language', text: 'Custom Language' },
      ],
      field: 'language'
    },
    {
      title: "Email Settings",
      question: "Where would you like your notes sent?",
      options: [
        { id: 'signup_email', text: 'Keep my sign-up email' },
        { id: 'custom_emails', text: 'Enter up to 3 default emails' },
        { id: 'per_note', text: 'Customize each time' }
      ],
      field: 'emailPreference'
    },
    {
      title: "Email Subject",
      question: "How should the email subject appear?",
      options: [
        { id: 'default', text: 'Use Default [Your Name, Date, Time in UTC]' },
        { id: 'per_note', text: 'Customize each time' },
        { id: 'custom', text: 'Custom Format' }
      ],
      field: 'subjectLinePreference'
    }
  ];

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Handle email preferences
      let emailsToSave = [];
      if (settings.emailPreference === 'signup_email') {
        emailsToSave = [userEmail];
      } else if (settings.emailPreference === 'custom_emails') {
        emailsToSave = settings.customEmails;
      }

      const settingsToSave = {
        ...settings,
        customEmails: emailsToSave,
        perNoteEmails: settings.emailPreference === 'per_note'
      };

      await saveUserSettings(userEmail, settingsToSave);
      setIsComplete(true);
      setTimeout(() => {
        router.push('/generate');
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = async (value) => {
    const currentStep = steps[step];
    setSettings(prev => ({
      ...prev,
      [currentStep.field]: value
    }));
  
    if (step === 0 && value === 'defaults') {
      const defaultSettings = {
        useDefaults: 'defaults',
        clientName: 'client',
        clinicianTitle: 'clinician',
        language: 'english',
        emailPreference: 'signup_email',
        customEmails: [userEmail],
        perNoteEmails: false,
        subjectLinePreference: 'default',
        customClientName: '',
        customClinicianTitle: '',
        customSubject: ''
      };
      setIsLoading(true);
      try {
        await saveUserSettings(userEmail, defaultSettings);
        setIsComplete(true);
        setTimeout(() => {
          router.push('/generate');
        }, 2000);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleContinue = () => {
    // Validate if an option has been selected
    if (!settings[steps[step].field]) {
      setError('Please select an option to continue');
      return;
    }
  
    // Validate custom inputs when required
    if (steps[step].field === 'clientName' && 
        settings.clientName === 'other' && 
        !settings.customClientName) {
      setError('Please enter a custom client name');
      return;
    }
  
    if (steps[step].field === 'clinicianTitle' && 
        settings.clinicianTitle === 'other' && 
        !settings.customClinicianTitle) {
      setError('Please enter a custom clinician title');
      return;
    }
  
    if (steps[step].field === 'subjectLinePreference' && 
        settings.subjectLinePreference === 'custom' && 
        !settings.customSubject) {
      setError('Please enter a custom subject format');
      return;
    }
  
    // Clear any existing errors
    setError('');
  
    // If it's the last step
    if (step === steps.length - 1) {
      handleSaveSettings();
    } else {
      // Move to next step
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const currentStep = steps[step];

  const renderEmailInput = () => {
    if (currentStep.field !== 'emailPreference' || settings.emailPreference !== 'custom_emails') {
      return null;
    }

    return (
      <div className="mt-4">
        {settings.customEmails.length < 3 && (
          <div className="flex space-x-2 mb-3">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 p-2 border rounded-lg text-sm"
            />
            <button
              onClick={handleAddEmail}
              disabled={settings.customEmails.length >= 3}
              className="bg-[#2b3990] text-white p-2 rounded-lg hover:bg-[#232d73] disabled:bg-gray-300"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {emailError && (
          <p className="text-red-500 text-xs mb-2">{emailError}</p>
        )}
        
        <div className="space-y-2">
          {settings.customEmails.map((email) => (
            <div key={email} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-black">{email}</span>
              <button
                onClick={() => handleRemoveEmail(email)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };


  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-[#2b3990] mb-4">
            Settings Saved Successfully! 🎉
          </h1>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  const renderCustomInput = () => {
    const currentStep = steps[step];
    
    if (currentStep.field === 'clientName' && settings.clientName === 'other') {
      return (
        <input
          type="text"
          value={customClientName}
          onChange={(e) => {
            setCustomClientName(e.target.value);
            setSettings(prev => ({
              ...prev,
              customClientName: e.target.value
            }));
          }}
          placeholder="Enter custom client name"
          className="mt-4 w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#2b3990] focus:border-transparent"
        />
      );
    }
    
    if (currentStep.field === 'clinicianTitle' && settings.clinicianTitle === 'other') {
      return (
        <input
          type="text"
          value={customClinicianTitle}
          onChange={(e) => {
            setCustomClinicianTitle(e.target.value);
            setSettings(prev => ({
              ...prev,
              customClinicianTitle: e.target.value
            }));
          }}
          placeholder="Enter custom clinician title"
          className="mt-4 w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#2b3990] focus:border-transparent"
        />
      );
    }
  
    if (currentStep.field === 'subjectLinePreference' && settings.subjectLinePreference === 'custom') {
      return (
        <input
          type="text"
          value={customSubjectLine}
          onChange={(e) => {
            setCustomSubjectLine(e.target.value);
            setSettings(prev => ({
              ...prev,
              customSubject: e.target.value
            }));
          }}
          placeholder="Enter custom subject format"
          className="mt-4 w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#2b3990] focus:border-transparent"
        />
      );
    }

    if (currentStep.field === 'language' && settings.language === 'custom_language') {
      return (
        <input
          type="text"
          value={customLanguage}
          onChange={(e) => {
            setCustomLanguage(e.target.value);
            setSettings(prev => ({
              ...prev,    
              customLanguage: e.target.value
            }));
          }}
          placeholder="Enter custom language"
          className="mt-4 w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#2b3990] focus:border-transparent"
        />  
      );    
    }
  
    return null;
  };
  


  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#2b3990] mb-2">
            {currentStep.title}
          </h1>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div 
              className="bg-[#ed155a] h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="space-y-6"
          >
            <p className="text-lg text-[#2b3990] mb-6">
              {currentStep.question}
            </p>

            <div className="space-y-3">
  {/* Render option buttons */}
  {currentStep.options.map(option => (
    <button
      key={option.id}
      onClick={() => handleOptionSelect(option.id)}
      className={`w-full p-4 rounded-lg border-2 flex items-center justify-between
        ${settings[currentStep.field] === option.id
          ? 'border-[#2b3990] bg-[#2b3990] text-white'
          : 'border-gray-300 hover:border-[#2b3990] text-[#2b3990]'
        }`}
    >
      <span>{option.text}</span>
      {settings[currentStep.field] === option.id && (
        <Check className="w-5 h-5" />
      )}
    </button>
  ))}
  {renderCustomInput()}


</div>
          

<div className="flex justify-between pt-6">
  {step > 0 && (
    <button
      onClick={handleBack}
      className="flex items-center space-x-2 text-[#2b3990]"
      disabled={isLoading}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Back</span>
    </button>
  )}
  
  {/* Add Continue button */}
  <button
    onClick={handleContinue}
    disabled={isLoading || !settings[steps[step].field]}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg 
      ${settings[steps[step].field]
        ? 'bg-[#2b3990] text-white hover:bg-[#232d73]'
        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
  >
    <span>{step === steps.length - 1 ? 'Save Settings' : 'Continue'}</span>
    {!isLoading && <ArrowRight className="w-4 h-4" />}
    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
  </button>
</div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FirstTimeSettings;