import React from 'react';

export const FooterInfo = () => {
  return (
    <div className="mt-8 text-center text-sm text-gray-500">
      <p>© 2024 Melospeech Inc. All rights reserved.</p>
      <div className="mt-2 mb-4">
        <a href="/privacy-policy"  target="_blank" className="text-[#2b3990] hover:text-[#2b3990] mr-4">Privacy Policy</a>
        <a href="/terms-of-service"  target="_blank" className="text-[#2b3990] hover:text-[#2b3990]">Terms of Service</a>
      </div>
    </div>
  );
};