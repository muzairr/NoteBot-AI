"use client"
import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Settings, LogOut, ChevronDown, PenSquare, Mic } from 'lucide-react';
import { logout } from '../../utils/auth';

const LoggedInNavbar = () => {
  const router = useRouter();
  const pathname = usePathname(); // Correct way to get the path in app router

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  
  const handleLogout = () => {
    try {
      localStorage.removeItem('token'); // Clear the stored JWT token
      router.push('/signin'); // Redirect to signin
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  

  const handleNavigation = () => {
    if (pathname === '/generate/') {
      window.location.reload();
    } else {
      router.replace('/generate');
    }
  };
  

  return (
    <nav className="w-full bg-white shadow-sm py-2 px-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <>
{/* Full button for desktop */}
<button
  onClick={handleNavigation}
  className="items-center space-x-2 bg-[#262e75] text-white hidden sm:flex px-5 py-2 rounded-lg  transition-colors shadow-md transform hover:scale-105 text-lg font-medium"
>
  <Mic className="w-5 h-5" />
  <span className="font-bold">Generate Note</span>
</button>

{/* Rounded icon button for mobile */}
<button
  onClick={handleNavigation}
  className="sm:hidden flex items-center justify-center w-12 h-12 bg-[#ed155a] text-white rounded-full hover:bg-[#d11350] transition-colors shadow-md transform hover:scale-105"
>
  <Mic className="w-6 h-6" />
</button>
</>
        </div>

        <div className="relative">
        <div className="gap-4 flex items-center justify-center">
  <button
    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    className="flex items-center space-x-2 text-[#2b3990] hover:text-[#232d73] p-2 rounded-lg"
  >
    <Settings className="w-5 h-5" />
    <ChevronDown className="w-4 h-4" />
  </button>
  {/* <div>
    <a 
      href="/payment"
      className="text-gray-900 hover:text-gray-700" 
    >
      Plans
    </a>
  </div> */}
</div>


          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
              {/* <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  router.push('/settings');
                }}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button> */}
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default LoggedInNavbar;