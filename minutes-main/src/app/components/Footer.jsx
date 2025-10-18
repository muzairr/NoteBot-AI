import React from 'react';
import { FaFacebookF, FaYoutube, FaTwitch, FaTwitter, FaTiktok, FaEnvelope } from 'react-icons/fa';
import Link from 'next/link';

export function Footer() {
  const navLinks = [
    { text: 'HOME', href: '/' },
    { text: 'FAQ', href: '/#faq' },
    { text: 'PRICING', href: '/pricing' },
    { text: 'ABOUT US', href: '/about-us' },
    { text: 'CONTACT', href: '/#contact' }
  ];

  const socialIcons = [
    { Icon: FaFacebookF, href: 'https://www.facebook.com/people/The-SLPeaceBot-by-Melospeech/61567001267156/', color: 'bg-blue-700' },
    { Icon: FaTiktok, href: 'https://www.tiktok.com/@theslpeacebot?lang=en', color: 'bg-black' },
    // { Icon: FaYoutube, href: '#', color: 'bg-red-600' },
    // { Icon: FaTwitch, href: '#', color: 'bg-purple-600' },
    // { Icon: FaTwitter, href: '#', color: 'bg-blue-400' },
    { Icon: FaEnvelope, href: 'mailto:help@slpeace.com', color: 'bg-green-500' }
  ];

  return (
    <footer className="bg-gradient-to-b from-white to-pink-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-center items-center mb-6">
          {/* Logo */}


          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-4 mb-2 md:mb-0">
            {navLinks.map((link, index) => (
              <a 
                key={index}
                href={link.href}
                className="text-gray-600 hover:text-pink-500 transition-colors"
              >
                {link.text}
              </a>
            ))}
          </nav>


        </div>

      </div>
    </footer>
  );
}