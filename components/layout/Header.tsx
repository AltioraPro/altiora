"use client";

import { useState, useEffect } from "react";
import { Home, Target, TrendingUp, Users, Settings, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  className?: string;
}

export const Header = ({ className = "" }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        toggleMenu();
      }
    };

    if (isMenuOpen) {
      window.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { href: "/", label: "HOME", icon: Home, angle: -60 },
    { href: "/trading-journal", label: "TRADING", icon: TrendingUp, angle: -30 },
    { href: "/habits", label: "HABITS", icon: Target, angle: 0 },
    { href: "/goals", label: "GOALS", icon: Users, angle: 30 },
    { href: "/settings", label: "SETTINGS", icon: Settings, angle: 60 },
    { href: "/contact", label: "CONTACT", icon: Phone, angle: 90 },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-30 bg-transparent backdrop-blur-md border border-white/10 ${className}`}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="relative">
              <button
                onClick={toggleMenu}
                className="relative w-12 h-12 flex items-center justify-center group"
                aria-label="Toggle menu"
              >
                <div className="relative w-6 h-6 cursor-pointer">
                  <div className={`absolute inset-0 transition-all duration-700 ease-out `} />
                  
                  <div className="absolute inset-0 flex flex-col justify-center items-center">
                    <span className={`block h-0.5 bg-white transition-all duration-500 ease-out ${
                      isMenuOpen 
                        ? 'w-4 rotate-45 translate-y-[1px] shadow-[0_0_10px_rgba(255,255,255,0.5)]' 
                        : 'w-4 rotate-0 translate-y-[-3px] group-hover:w-5'
                    }`} />
                    <span className={`block h-0.5 bg-white transition-all duration-300 ${
                      isMenuOpen 
                        ? 'w-0 opacity-0' 
                        : 'w-3 opacity-100 group-hover:w-4'
                    }`} />
                    <span className={`block h-0.5 bg-white transition-all duration-500 ease-out ${
                      isMenuOpen 
                        ? 'w-4 -rotate-45 translate-y-[-1px] shadow-[0_0_10px_rgba(255,255,255,0.5)]' 
                        : 'w-4 rotate-0 translate-y-[3px] group-hover:w-5'
                    }`} />
                  </div>

                  {/* Pulse Effect */}
                  <div className={`absolute inset-0 transition-all duration-300 ${
                    isMenuOpen 
                      ? 'opacity-0' 
                      : 'opacity-0 group-hover:opacity-100 bg-white/5 animate-ping'
                  }`} />
                </div>
              </button>
            </div>

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

      {/* Revolutionary Full-Screen Menu */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-700 ease-out ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Dynamic Background with Mouse Follow Effect */}
        <div 
          className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
          style={{
            background: isMenuOpen ? `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.95) 100%)` : 'rgba(0,0,0,0.95)'
          }}
        />

        {/* Central Menu Container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="relative flex flex-col items-center">
            {/* Central Logo/Title */}
            <div className={`text-center mb-8 transition-all duration-1000 ${
              isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <h1 className="text-5xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent font-argesta leading-none mb-2">
                ALTIORA
              </h1>
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto opacity-50" />
            </div>

            {/* Revolutionary Circular Menu */}
            <div className="relative w-96 h-96 mx-auto mb-8">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const radius = 160;
                const angleRad = (item.angle * Math.PI) / 180;
                const x = Math.cos(angleRad) * radius;
                const y = Math.sin(angleRad) * radius;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={toggleMenu}
                    className={`absolute group transition-all duration-700 ease-out z-10 ${
                      isMenuOpen 
                        ? 'opacity-100 translate-x-0 translate-y-0' 
                        : 'opacity-0 translate-x-0 translate-y-0'
                    }`}
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: 'translate(-50%, -50%)',
                      transitionDelay: `${index * 100}ms`
                    }}
                  >
                    {/* Menu Item Container */}
                    <div className="relative">
                      {/* Glow Effect */}
                      <div className="absolute inset-0 rounded-full bg-white/5 scale-0 group-hover:scale-150 transition-all duration-500 blur-xl" />
                      
                      {/* Main Button */}
                      <div className="relative w-16 h-16 rounded-full border border-white/20 bg-black/50 backdrop-blur-md flex items-center justify-center group-hover:border-white/60 group-hover:bg-white/10 transition-all duration-300 group-hover:scale-110">
                        <Icon className="w-6 h-6 text-white/70 group-hover:text-white transition-colors duration-300" />
                      </div>
                      
                      {/* Label - Positioned outward from circle */}
                      <div 
                        className="absolute opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105 z-20"
                        style={{
                          left: `${x > 0 ? '100%' : x < 0 ? '-100%' : '50%'}`,
                          top: `${y > 0 ? '100%' : y < 0 ? '-100%' : '50%'}`,
                          transform: `translate(${x > 0 ? '12px' : x < 0 ? '-12px' : '-50%'}, ${y > 0 ? '12px' : y < 0 ? '-12px' : '-50%'})`,
                          transformOrigin: 'center'
                        }}
                      >
                        <div className="bg-black/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/30 shadow-lg">
                          <span className="text-white text-xs font-medium font-argesta tracking-widest whitespace-nowrap">
                            {item.label}
                          </span>
                        </div>
                      </div>

                      {/* Connection Line to Center */}
                      <div 
                        className="absolute opacity-0 group-hover:opacity-30 transition-all duration-500 z-0"
                        style={{
                          width: '2px',
                          height: `${radius * 0.3}px`,
                          background: 'linear-gradient(to center, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%)',
                          left: '50%',
                          top: '50%',
                          transformOrigin: 'top center',
                          transform: `translate(-50%, -50%) rotate(${item.angle + 180}deg)`
                        }}
                      />
                    </div>
                  </Link>
                );
              })}

              {/* Central Logo */}
              <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 z-5 ${
                isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              }`}>
                <div className="w-24 h-24 rounded-full border border-white/20 bg-black/50 backdrop-blur-md flex items-center justify-center group-hover:border-white/40 transition-all duration-300">
                  <Image
                    src="/img/logo.png"
                    alt="Altiora Logo"
                    width={50}
                    height={14}
                    className="h-20 w-auto opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Bottom Action */}
            <div className={`text-center transition-all duration-1000 delay-500 ${
              isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <Link
                href="/pricing"
                onClick={toggleMenu}
                className="inline-flex items-center px-8 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white/80 hover:text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 font-medium font-argesta tracking-wide group"
              >
                GET STARTED
                <div className="ml-2 w-1 h-1 rounded-full bg-white/60 group-hover:w-6 group-hover:h-0.5 transition-all duration-300" />
              </Link>
            </div>
          </div>

          {/* ESC Hint - Positioned absolutely in corner */}
          <button 
            onClick={toggleMenu}
            className={`absolute top-8 right-8 transition-all duration-1000 delay-700 hover:opacity-100 cursor-pointer group ${
              isMenuOpen ? 'opacity-60 translate-y-0' : 'opacity-0 translate-y-[-10px]'
            }`}
          >
            <span className="text-xs text-white/40 font-argesta tracking-widest group-hover:text-white/80 transition-colors duration-200">
              ESC TO CLOSE
            </span>
          </button>
        </div>
      </div>


    </>
  );
}; 