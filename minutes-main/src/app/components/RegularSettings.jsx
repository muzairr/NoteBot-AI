import React, { useState,useEffect } from 'react';
import { Check, Loader2, Plus, X } from 'lucide-react';

const RegularSettings = ({ currentSettings, onSave, userEmail }) => {
  const [settings, setSettings] = useState({
    ...currentSettings?.settings,
    clientName: currentSettings?.settings?.clientName || currentSettings?.clientName,
    clinicianTitle: currentSettings?.settings?.clinicianTitle || currentSettings?.clinicianTitle,
    customClientName: currentSettings?.settings?.customClientName || '',
    customClinicianTitle: currentSettings?.settings?.customClinicianTitle || '',
    customSubject: currentSettings?.settings?.customSubject || '',
    language: currentSettings?.settings?.language || currentSettings?.language,
    customLanguage: currentSettings?.settings?.customLanguage || '',
    emailPreference: currentSettings?.settings?.emailPreference || currentSettings?.emailPreference,
    subjectLinePreference: currentSettings?.settings?.subjectLinePreference || currentSettings?.subjectLinePreference,
    customEmails: currentSettings?.settings?.customEmails || [],
    perNoteEmails: currentSettings?.settings?.perNoteEmails || false,
  });
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');


  const categories = {
    "Client Information": {
      clientName: [
        { id: 'student', text: 'Student' },
        { id: 'client', text: 'Client' },
        { id: 'child', text: 'Child' },
        { id: 'patient', text: 'Patient' },
        { id: 'by_name', text: 'By Name' },
        { id: 'other', text: 'Other' }
      ],
      clinicianTitle: [
        { id: 'clinician', text: 'Clinician' },
        { id: 'slp', text: 'SLP' },
        { id: 'slpa', text: 'SLPA' },
        { id: 'therapist', text: 'Therapist' },
        { id: 'other', text: 'Other' }
      ],
    },
    "Note Preferences": {
      language: [
        { id: 'as_spoken', text: 'As Spoken' },
        { id: 'english', text: 'English' },
        { id: 'spanish', text: 'Spanish' },
        { id: 'custom_language', text: 'Custom Language' },

      ],
      subjectLinePreference: [
        { id: 'default', text: 'Default Format' },
        { id: 'per_note', text: 'Customize Each Time' },
        { id: 'custom', text: 'Custom Format' }
      ],
    },
    "Email Settings": {
      emailPreference: [
        { id: 'signup_email', text: 'Sign-up Email' },
        { id: 'custom_emails', text: 'Custom Emails' },
        { id: 'per_note', text: 'Per Note' }
      ],
    }
  };

  const handleOptionChange = (field, value) => {
    setSettings(prev => {
      let newSettings = { ...prev, [field]: value };
      
      if (field === 'emailPreference') {
        if (value === 'signup_email') {
          newSettings.customEmails = [userEmail];
          newSettings.perNoteEmails = false;
        } else if (value === 'per_note') {
          newSettings.customEmails = [];
          newSettings.perNoteEmails = true;
        }
      }
      
      return newSettings;
    });
    setSaved(false);
  };

  const handleCustomInput = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setSaved(false);
  };

  const renderCustomInput = (field) => {
    switch (field) {
      case 'clientName':
        if (settings.clientName === 'other') {
          return (
            <div className="mt-2">
              <input
                type="text"
                value={settings.customClientName || ''}
                onChange={(e) => handleCustomInput('customClientName', e.target.value)}
                placeholder="Enter custom client name"
                className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#2b3990] focus:border-transparent text-black"
              />
            </div>
          );
        }
        break;

      case 'clinicianTitle':
        if (settings.clinicianTitle === 'other') {
          return (
            <div className="mt-2">
              <input
                type="text"
                value={settings.customClinicianTitle || ''}
                onChange={(e) => handleCustomInput('customClinicianTitle', e.target.value)}
                placeholder="Enter custom clinician title"
                className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#2b3990] focus:border-transparent text-black"
              />
            </div>
          );
        }
        break;

      case 'subjectLinePreference':
        if (settings.subjectLinePreference === 'custom') {
          return (
            <div className="mt-2 space-y-2">
              <input
                type="text"
                value={settings.customSubject || ''}
                onChange={(e) => handleCustomInput('customSubject', e.target.value)}
                placeholder="Enter custom subject format"
                className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#2b3990] focus:border-transparent text-black"
              />
              <p className="text-sm text-black">
                Available placeholders: [Date], [Time], [Name]
              </p>
            </div>
          );
        }
        break;

      case 'language':
        if (settings.language === 'custom_language') {
          return (
            <div className="mt-2 space-y-2">
              <input
                type="text"
                value={settings.customLanguage || ''}
                onChange={(e) => handleCustomInput('customLanguage', e.target.value)}
                placeholder="Enter custom subject format"
                className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#2b3990] focus:border-transparent text-black"
              />
            </div>
          );
        }
        break;
      }
    return null;
  };

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

  // const handleOptionChange = (field, value) => {
  //   setSettings(prev => {
  //     let newSettings = { ...prev, [field]: value };
      
  //     // Handle email preference changes
  //     if (field === 'emailPreference') {
  //       if (value === 'signup_email') {
  //         newSettings.customEmails = [userEmail]; // Save only logged-in user's email
  //         newSettings.perNoteEmails = false;
  //       } else if (value === 'per_note') {
  //         newSettings.customEmails = [];
  //         newSettings.perNoteEmails = true;
  //       } else if (value === 'custom_emails') {
  //         newSettings.perNoteEmails = false;
  //         // Keep existing custom emails if any
  //       }
  //     }
      
  //     return newSettings;
  //   });
  //   setSaved(false);
  // };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const success = await onSave({
        ...settings,
        firstTimeLogin: false
      });
      if (success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError('Failed to save settings');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#2b3990]">Settings</h1>
            <button
      onClick={handleSave}
      disabled={loading}
      className="bg-[#2b3990] text-white px-6 py-2 rounded-lg hover:bg-[#232d73] flex items-center space-x-2"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : saved ? (
        <>
          <Check className="w-4 h-4" />
          <span>Saved!</span>
        </>
      ) : (
        <span>Save Changes</span>
      )}
    </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          {Object.entries(categories).map(([category, fields]) => (
            <div key={category} className="mb-8">
              <h2 className="text-lg font-semibold text-[#2b3990] mb-4 border-b pb-2">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(fields).map(([field, options]) => (
                  <div key={field} className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700 capitalize">
                      {field.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                    </h3>
                    <div className="space-y-2">
                      {options.map(option => (
                        <button
                          key={option.id}
                          onClick={() => handleOptionChange(field, option.id)}
                          className={`w-full p-3 rounded-lg border text-sm flex items-center justify-between
                            ${settings[field] === option.id
                              ? 'border-[#2b3990] bg-[#2b3990] text-white'
                              : 'border-gray-300 hover:border-[#2b3990] text-[#2b3990]'
                            }`}
                        >
                          <span>{option.text}</span>
                          {settings[field] === option.id && (
                            <Check className="w-4 h-4 ml-2" />
                          )}
                        </button>
                      ))}
                      {renderCustomInput(field)}
                    </div>

                    {field === 'emailPreference' && settings.emailPreference === 'custom_emails' && (
                      <div className="mt-4 space-y-3">
                        <div className="flex space-x-2">
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
                            className="bg-[#2b3990] text-white p-2 rounded-lg hover:bg-[#232d73]"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {emailError && (
                          <p className="text-red-500 text-xs">{emailError}</p>
                        )}
                        <div className="space-y-2">
                          {settings.customEmails.map((email) => (
                            <div key={email} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-600">{email}</span>
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
                    )}
                    
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegularSettings;