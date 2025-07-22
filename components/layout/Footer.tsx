    "use client";

    import { useState, useEffect, useRef } from "react";
    import Link from "next/link";
    import Image from "next/image";
    import { 
    TrendingUp, 
    Target, 
    Zap, 
    Users, 
    Mail, 
    MapPin, 
    Twitter,
    Linkedin,
    ArrowUp,
    Shield,
    FileText,
    Cookie,
    Send,
    Star
    } from "lucide-react";

    // Discord Icon SVG Component
    const DiscordIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
    );

    export const Footer = () => {
    const [email, setEmail] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const footerRef = useRef<HTMLElement>(null);

    useEffect(() => {
    const handleScroll = () => {
        setIsVisible(window.scrollY > 300);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (footerRef.current) {
        const rect = footerRef.current.getBoundingClientRect();
        setMousePosition({ 
            x: e.clientX - rect.left, 
            y: e.clientY - rect.top 
        });
        }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('mousemove', handleMouseMove);
    };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Newsletter signup logic here
        console.log('Newsletter signup:', email);
        setEmail("");
    };

    const navigationLinks = [
        { href: "/", label: "HOME", icon: Users },
        { href: "/trading-journal", label: "TRADING", icon: TrendingUp },
        { href: "/habits", label: "HABITS", icon: Target },
        { href: "/goals", label: "GOALS", icon: Zap },
        { href: "/pricing", label: "PRICING", icon: Star },
        { href: "/contact", label: "CONTACT", icon: Mail },
    ];

    const legalLinks = [
        { href: "/legal/privacy", label: "Privacy Policy", icon: Shield },
        { href: "/legal/terms", label: "Terms of Service", icon: FileText },
        { href: "/legal/cookies", label: "Cookies Policy", icon: Cookie },
    ];

    const socialLinks = [
        { href: "https://twitter.com/altiora", label: "Twitter", icon: Twitter },
        { href: "https://linkedin.com/company/altiora", label: "LinkedIn", icon: Linkedin },
        { href: "https://discord.gg/altiora", label: "Discord", icon: DiscordIcon },
    ];

        return (
    <>

        
    <footer ref={footerRef} className="relative bg-pure-black text-pure-white overflow-hidden">
            {/* Sophisticated "woaw" border with subtle animation */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/12 to-transparent"></div>
            
            {/* Elegant flowing accent */}
            <div className="absolute top-0 left-0 w-full h-px overflow-hidden">
            <div 
                className="absolute top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent w-64"
                style={{
                animation: 'elegantFlow 12s ease-in-out infinite',
                }}
            />
            </div>

            {/* Dynamic background with mouse follow effect */}
            <div 
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
                background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 30%, transparent 50%)`
            }}
            />

            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Gradient mesh */}
            <div className="absolute inset-0 opacity-[0.02]" 
                style={{
                    backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }} 
            />
            
            {/* Floating geometric shapes */}
            <div className="absolute top-20 left-20 w-6 h-6 border border-white/10 rotate-45 animate-pulse" style={{animationDuration: '4s'}} />
            <div className="absolute top-40 right-32 w-8 h-8 border border-white/15 rotate-12" />
            <div className="absolute bottom-40 left-1/3 w-4 h-4 bg-white/5 rounded-full animate-pulse" style={{animationDelay: '2s', animationDuration: '6s'}} />
            
            {/* Gradient lines */}

            </div>

            <div className="relative z-10 w-full px-6 lg:px-8 py-20">
            
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                
                {/* Brand Section */}
                <div className="lg:col-span-1 space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                    <Image
                    src="/img/logo.png"
                    alt="Altiora Logo"
                    width={80}
                    height={22}
                    className="h-12 w-auto"
                    priority
                    />
                </div>
                
                <p className="text-white/70 text-sm leading-relaxed font-argesta">
                    Transform your discipline with our comprehensive platform for trading, habits, and goals. 
                    Build the mindset of a champion.
                </p>
                
                {/* Newsletter Signup */}
                <div className="space-y-4">
                    <h4 className="text-white font-argesta font-bold tracking-wider text-sm">
                    STAY UPDATED
                    </h4>
                    <form onSubmit={handleNewsletterSubmit} className="flex space-x-2">
                    <div className="flex-1 relative group">
                        <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                        required
                        />
                        <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
                    </div>
                    <button
                        type="submit"
                        className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-xl px-4 py-3 transition-all duration-300 group backdrop-blur-sm"
                    >
                        <Send className="w-4 h-4 text-white/80 group-hover:text-white transition-colors duration-300" />
                    </button>
                    </form>
                </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-6">
                <h4 className="text-white font-argesta font-bold tracking-wider text-sm flex items-center space-x-2">
                    <div className="w-1 h-1 bg-white/60 rounded-full" />
                    <span>NAVIGATION</span>
                </h4>
                <ul className="space-y-3">
                    {navigationLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                        <li key={link.href}>
                        <Link
                            href={link.href}
                            className="flex items-center space-x-3 text-white/60 hover:text-white transition-all duration-300 group"
                        >
                            <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                            <span className="text-sm font-argesta">{link.label}</span>
                            <div className="w-0 h-px bg-white/60 group-hover:w-6 transition-all duration-300" />
                        </Link>
                        </li>
                    );
                    })}
                </ul>
                </div>

                {/* Legal & Support */}
                <div className="space-y-6">
                <h4 className="text-white font-argesta font-bold tracking-wider text-sm flex items-center space-x-2">
                    <div className="w-1 h-1 bg-white/60 rounded-full" />
                    <span>LEGAL & SUPPORT</span>
                </h4>
                <ul className="space-y-3">
                    {legalLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                        <li key={link.href}>
                        <Link
                            href={link.href}
                            className="flex items-center space-x-3 text-white/60 hover:text-white transition-all duration-300 group"
                        >
                            <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                            <span className="text-sm font-argesta">{link.label}</span>
                            <div className="w-0 h-px bg-white/60 group-hover:w-6 transition-all duration-300" />
                        </Link>
                        </li>
                    );
                    })}
                    <li>
                    <a
                        href="mailto:support@altiora.app"
                        className="flex items-center space-x-3 text-white/60 hover:text-white transition-all duration-300 group"
                    >
                        <Mail className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                        <span className="text-sm font-argesta">SUPPORT</span>
                        <div className="w-0 h-px bg-white/60 group-hover:w-6 transition-all duration-300" />
                    </a>
                    </li>
                </ul>
                </div>

                {/* Contact & Social */}
                <div className="space-y-6">
                <h4 className="text-white font-argesta font-bold tracking-wider text-sm flex items-center space-x-2">
                    <div className="w-1 h-1 bg-white/60 rounded-full" />
                    <span>CONNECT</span>
                </h4>
                
                {/* Contact Info */}
                <div className="space-y-3 text-sm text-white/60">
                    <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4" />
                    <span className="font-argesta">hello@altiora.app</span>
                    </div>
                    <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4" />
                    <span className="font-argesta">Paris, France</span>
                    </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                    <h5 className="text-white/80 font-argesta text-xs tracking-wider">FOLLOW US</h5>
                    <div className="flex space-x-4">
                    {socialLinks.map((social) => {
                        const Icon = social.icon;
                        return (
                        <a
                            key={social.href}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-white/5 hover:bg-white/15 border border-white/20 hover:border-white/40 rounded-xl flex items-center justify-center transition-all duration-300 group backdrop-blur-sm"
                            title={social.label}
                        >
                            <Icon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-300" />
                        </a>
                        );
                    })}
                    </div>
                </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-white/10 pt-8">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                
                {/* Copyright */}
                <div className="text-center md:text-left">
                    <p className="text-white/50 text-sm font-argesta">
                    &copy; {new Date().getFullYear()} Altiora. All rights reserved.
                    </p>
                </div>

                {/* Additional Links */}
                <div className="flex items-center space-x-6 text-xs text-white/50">
                    <span className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-argesta">System Status</span>
                    </span>
                    <Link 
                    href="/changelog" 
                    className="hover:text-white/70 transition-colors duration-300 font-argesta"
                    >
                    Changelog
                    </Link>
                </div>
                </div>
            </div>
            </div>
        </footer>

        {/* Scroll to Top Button */}
        <button
            onClick={scrollToTop}
            className={`fixed bottom-8 right-8 w-12 h-12 bg-pure-black/80 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center transition-all duration-500 z-50 group hover:bg-white/10 hover:border-white/40 hover:scale-110 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
            aria-label="Scroll to top"
        >
            <ArrowUp className="w-5 h-5 text-white/80 group-hover:text-white transition-colors duration-300" />
            <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-300 -z-10 blur-xl" />
        </button>
        </>
    );
    };