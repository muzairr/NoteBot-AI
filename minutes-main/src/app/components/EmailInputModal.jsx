import React, { useState } from 'react';
import { X, Plus, Send, Loader2 } from 'lucide-react';

const EmailInputModal = ({ onClose, onSubmit, isLoading }) => {
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleAddEmail = (e) => {
    e.preventDefault(); // Prevent form submission
    
    if (!validateEmail(newEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    if (emails.length >= 3) {
      setError('Maximum of 3 emails allowed');
      return;
    }
    if (emails.includes(newEmail)) {
      setError('Email already added');
      return;
    }

    setEmails([...emails, newEmail]);
    setNewEmail('');
    setError('');
  };

  const handleRemoveEmail = (emailToRemove) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent form submission
    
    if (emails.length === 0) {
      setError('Please add at least one email address');
      return;
    }
    onSubmit(emails);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md m-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#2b3990]">Send Note</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter email address"
                className="flex-1 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#2b3990] focus:border-transparent text-black"
              />
              <button
                type="button"
                onClick={handleAddEmail}
                disabled={emails.length >= 3}
                className="bg-[#2b3990] text-white p-2 rounded-lg hover:bg-[#232d73] disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-xs">{error}</p>
            )}

            <div className="space-y-2">
              {emails.map((email) => (
                <div key={email} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{email}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(email)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || emails.length === 0}
              className="w-full py-3 bg-[#ed155a] text-white rounded-lg hover:bg-[#d11350] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Note</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailInputModal;