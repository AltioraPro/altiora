"use client";

import { useState } from "react";
import { Home, Target, TrendingUp, Users, Settings, Phone, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  className?: string;
}

export const Header = ({ className = "" }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/trading-journal", label: "Trading Journal", icon: TrendingUp },
    { href: "/habits", label: "Habits", icon: Target },
    { href: "/goals", label: "Goals", icon: Users },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/contact", label: "Contact", icon: Phone },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-20 bg-transparent backdrop-blur-sm ${className}`}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Menu Burger - Gauche */}
            <button
              onClick={toggleMenu}
              className={`relative text-gray-400 hover:text-pure-white p-2 hover:bg-white/5 rounded-lg transition-all duration-300 group ${isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-70 hover:opacity-100'}`}
              aria-label="Toggle menu"
            >
              <div className="relative w-4 h-4">
                <span className={`absolute block h-0.5 w-4 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 top-2' : 'top-1'}`} />
                <span className={`absolute block h-0.5 w-4 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'top-2'}`} />
                <span className={`absolute block h-0.5 w-4 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 top-2' : 'top-3'}`} />
              </div>
            </button>

            {/* Logo - Centre */}
            <Link href="/" className="flex items-center">
              <Image
                src="/img/logo.png"
                alt="Altiora Logo"
                width={70}
                height={20}
                className="h-10 w-auto"
                priority
              />
            </Link>

            {/* Contact Us - Droite */}
            <Link
              href="/contact"
              className="text-pure-white px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300 text-sm font-medium backdrop-blur-sm"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </header>

      {/* Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60"
          onClick={toggleMenu}
        />

        {/* Menu Panel */}
        <div
          className={`absolute left-0 top-0 h-full w-64 max-w-[70vw] bg-pure-black border-r border-white/5 transform transition-all duration-400 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">A</span>
              </div>
              <h2 className="text-white font-medium text-sm">ALTIORA</h2>
            </div>
            <button
              onClick={toggleMenu}
              className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded transition-all duration-300"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={toggleMenu}
                  className={`flex items-center space-x-3 p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200 group ${
                    isMenuOpen
                      ? "animate-slide-in"
                      : ""
                  }`}
                  style={{
                    animationDelay: `${index * 30}ms`,
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Menu Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
            <Link
              href="/auth"
              onClick={toggleMenu}
              className="block w-full text-center px-3 py-2 bg-white/10 text-white rounded-lg text-xs hover:bg-white/15 transition-colors duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}; 