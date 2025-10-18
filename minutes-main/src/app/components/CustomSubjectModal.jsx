import React, { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';

const CustomSubjectModal = ({ onClose, onSubmit, isLoading, defaultSubject }) => {
  const [subject, setSubject] = useState(defaultSubject || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (subject.trim()) {
      onSubmit(subject);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md m-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#2b3990]">Customize Email Subject</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#2b3990] focus:border-transparent text-black"
            />

            <button
              type="submit"
              disabled={isLoading || !subject.trim()}
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

export default CustomSubjectModal;