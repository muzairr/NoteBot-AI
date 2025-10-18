'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    // { name: 'HOME', href: '/' },
    // { name: 'FAQ', href: '/#faq' },
    // { name: 'PRICING', href: '/pricing' },
    // { name: 'ABOUT US', href: '/about-us' },
    // { name: 'CONTACT', href: '/#contact' }
  ]

  return (
    <nav className="container md:mx-auto pr-4 md:px-4 text-[#2b3990]">
      <div className="flex justify-between items-center mt-4">


        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className="text-gray-600 hover:text-gray-900"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex space-x-4">
          <Link href="/signin">
            <button className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors w-24">
              Sign In
            </button>
          </Link>
          {/* <Link href="/signup">
            <button className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors w-24">
              Sign Up
            </button>
          </Link> */}
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden z-20 relative"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <div className={`hamburger-icon ${isMenuOpen ? 'open' : ''}`}>
            <span className="bg-gray-800"></span>
            <span className="bg-gray-800"></span>
            <span className="bg-gray-800"></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`
        fixed inset-0 bg-white z-10 md:hidden
        transition-transform duration-300 ease-in-out
        ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col items-center justify-center h-full text-2xl space-y-8">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className="text-gray-800 hover:text-gray-900"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          {/* Sign In and Sign Up buttons for Mobile */}
          <Link href="/signin">
            <button className="bg-blue-700 text-white px-6 py-3 rounded-md hover:bg-blue-800 transition-colors mt-4 w-36 md:w-32">
              Sign In
            </button>
          </Link>
          {/* <Link href="/signup">
            <button className="bg-blue-700 text-white px-6 py-3 rounded-md hover:bg-blue-800 transition-colors mt-4 w-36 md:w-32">
              Sign Up
            </button>
          </Link> */}
        </div>
      </div>

      {/* Add CSS for hamburger icon animation */}
      <style jsx>{`
        .hamburger-icon {
          width: 24px;
          height: 20px;
          position: relative;
          cursor: pointer;
        }

        .hamburger-icon span {
          display: block;
          position: absolute;
          height: 2px;
          width: 100%;
          transition: .2s ease-in-out;
        }

        .hamburger-icon span:nth-child(1) { top: 0; }
        .hamburger-icon span:nth-child(2) { top: 9px; }
        .hamburger-icon span:nth-child(3) { top: 18px; }

        .hamburger-icon.open span:nth-child(1) {
          top: 9px;
          transform: rotate(45deg);
        }

        .hamburger-icon.open span:nth-child(2) {
          opacity: 0;
        }

        .hamburger-icon.open span:nth-child(3) {
          top: 9px;
          transform: rotate(-45deg);
        }
      `}</style>
    </nav>
  )
}