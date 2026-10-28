'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react'; // Sử dụng icon từ lucide-react

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-200 w-full relative z-50">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-[20px] font-bold text-[#E89B5A]">
              PawLife
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/shelter/pets" className="text-gray-600 hover:text-[#E89B5A] text-sm font-medium transition-colors">
              Thú cưng
            </Link>
            <Link href="/shelter/applications" className="text-gray-600 hover:text-[#E89B5A] text-sm font-medium transition-colors">
              Nhận nuôi
            </Link>
            <Link href="/shelter/profile" className="text-gray-600 hover:text-[#E89B5A] text-sm font-medium transition-colors">
              Hồ sơ
            </Link>
          </div>

          {/* Mobile menu button (Hamburger Icon) */}
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-[#E89B5A] hover:bg-gray-100 focus:outline-none transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Mở menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        className={`md:hidden absolute top-16 left-0 w-full bg-white shadow-lg transition-all duration-300 ease-in-out origin-top ${
          isMobileMenuOpen ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-0 pointer-events-none'
        }`}
        id="mobile-menu"
      >
        <div className="px-4 pt-2 pb-6 space-y-2 border-t border-gray-100">
          <Link
            href="/shelter/pets"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-[#E89B5A] hover:bg-orange-50 transition-colors"
          >
            Thú cưng
          </Link>
          <Link
            href="/shelter/applications"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-[#E89B5A] hover:bg-orange-50 transition-colors"
          >
            Nhận nuôi
          </Link>
          <Link
            href="/shelter/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-[#E89B5A] hover:bg-orange-50 transition-colors"
          >
            Hồ sơ
          </Link>
        </div>
      </div>
    </nav>
  );
};