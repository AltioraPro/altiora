  "use client";

  import { useState, useRef, useEffect, FormEvent } from 'react';
  import { Header } from '@/components/layout/Header';
  import { Send, Phone, Mail, User, MessageSquare } from 'lucide-react';

  interface FormData {
    fullName: string;
    email: string;
    phone: string;
    message: string;
  }

  interface FloatingElement {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
  }

  export default function ContactPage() {
    const [formData, setFormData] = useState<FormData>({
      fullName: '',
      email: '',
      phone: '',
      message: ''
    });
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const elements = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 40 + 20,
        duration: Math.random() * 20 + 10
      }));
      setFloatingElements(elements);
    }, []);

    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setMousePosition({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100
          });
        }
      };

      const container = containerRef.current;
      if (container) {
        container.addEventListener('mousemove', handleMouseMove);
        return () => container.removeEventListener('mousemove', handleMouseMove);
      }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitting(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        message: ''
      });
    };

    return (
      <div className="min-h-screen bg-pure-black text-pure-white relative overflow-hidden" ref={containerRef}>
        <Header />
        
        <div className="absolute inset-0 pointer-events-none">
          {floatingElements.map((element) => (
            <div
              key={element.id}
              className="absolute opacity-5 border border-white/20"
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
                width: `${element.size}px`,
                height: `${element.size}px`,
                borderRadius: element.id % 3 === 0 ? '50%' : element.id % 2 === 0 ? '0' : '30%',
                animation: `float-${element.id} ${element.duration}s ease-in-out infinite`,
                transform: `rotate(${element.id * 45}deg)`
              }}
            />
          ))}
        </div>

      <div
        className="absolute pointer-events-none z-5 transition-all duration-300 ease-out"
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)'
          }}
        />

        <div className="relative z-10 pt-20 px-4 h-screen overflow-hidden">
          <div className="max-w-7xl mx-auto h-full flex items-center justify-center">
            
            <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
              
              <div className="relative">
                <div className="absolute -top-8 -left-8 w-16 h-16 border border-white/20 rounded-full animate-pulse" />
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-white/10 rotate-45" />
                
                <h1 className="text-[8vw] lg:text-[6vw] leading-none font-bold font-argesta bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent mb-8 text-right">
                  CONTACT<br />
                                                   <span className="relative inline-block text-white">
                   <span className="absolute -left-96 top-1/2 transform -translate-y-1/2 w-96 h-px bg-gradient-to-r from-transparent to-white/60"></span>
                    US
                 </span>
                </h1>
                
                <div className="flex">
                  <div className="w-20 h-20 rounded-full border border-white/30 relative">
                    <div className="absolute inset-0 rounded-full border border-white/10 animate-spin" style={{animationDuration: '20s'}} />
                    <div className="absolute inset-2 rounded-full border border-white/20 animate-spin" style={{animationDuration: '15s', animationDirection: 'reverse'}} />
                    <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
                    
                    <div className="absolute top-1/2 -right-12 w-12 h-px bg-gradient-to-r from-white/60 to-transparent" />
                    <div className="absolute top-1/2 -left-12 w-12 h-px bg-gradient-to-l from-white/60 to-transparent" />
                  </div>
                </div>
              </div>

              <div className="relative w-full max-w-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="relative">
                  <label className="block text-xs font-medium text-white/60 mb-2 tracking-widest">
                    FULL NAME *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('fullName')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full pl-10 pr-3 py-3 bg-transparent border-b-2 transition-all duration-300 focus:outline-none font-argesta text-sm ${
                        focusedField === 'fullName' 
                          ? 'border-white text-white' 
                          : 'border-white/20 text-white/80'
                      }`}
                      placeholder="Enter your full name"
                      required
                    />
                    <div className={`absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300 ${
                      focusedField === 'fullName' ? 'w-full' : 'w-0'
                    }`} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-xs font-medium text-white/60 mb-2 tracking-widest">
                      EMAIL *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full pl-10 pr-3 py-3 bg-transparent border-b-2 transition-all duration-300 focus:outline-none font-argesta text-sm ${
                          focusedField === 'email' 
                            ? 'border-white text-white' 
                            : 'border-white/20 text-white/80'
                        }`}
                        placeholder="your@email.com"
                        required
                      />
                      <div className={`absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300 ${
                        focusedField === 'email' ? 'w-full' : 'w-0'
                      }`} />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-medium text-white/60 mb-2 tracking-widest">
                      PHONE
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full pl-10 pr-3 py-3 bg-transparent border-b-2 transition-all duration-300 focus:outline-none font-argesta text-sm ${
                          focusedField === 'phone' 
                            ? 'border-white text-white' 
                            : 'border-white/20 text-white/80'
                        }`}
                        placeholder="+33 1 23 45 67 89"
                      />
                      <div className={`absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300 ${
                        focusedField === 'phone' ? 'w-full' : 'w-0'
                      }`} />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-xs font-medium text-white/60 mb-2 tracking-widest">
                    MESSAGE *
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-4 w-4 h-4 text-white/40" />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                      rows={4}
                      className={`w-full pl-10 pr-3 py-3 bg-transparent border-2 rounded-lg transition-all duration-300 focus:outline-none font-argesta resize-none text-sm ${
                        focusedField === 'message' 
                          ? 'border-white text-white' 
                          : 'border-white/20 text-white/80'
                      }`}
                      placeholder="Describe your project or ask your question..."
                      required
                    />
                  </div>
                </div>

              <div className="relative mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full py-6 bg-transparent border border-white/30 rounded-none overflow-hidden transition-all duration-700 hover:border-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center" />
                  <div className="absolute inset-0 bg-white/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  
                  <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/40 transform -translate-x-full -translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/40 transform translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500 delay-100" />
                  
                  <div className="absolute top-0 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-600" />
                  <div className="absolute bottom-0 right-0 w-0 h-px bg-white group-hover:w-full transition-all duration-600 delay-200" />
                  
                  <div className="relative flex items-center justify-center space-x-3 z-10">
                    {isSubmitting ? (
                      <>
                        <div className="relative">
                          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <div className="absolute inset-0 w-6 h-6 border border-white/10 rounded-full animate-pulse" />
                        </div>
                        <span className="font-argesta tracking-[0.2em] text-white/90 transition-all duration-300 text-base">
                          SENDING...
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="relative">
                          <Send className="w-6 h-6 text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                          <div className="absolute inset-0 w-6 h-6 opacity-0 group-hover:opacity-30 transition-opacity duration-300">
                            <Send className="w-6 h-6 text-white animate-pulse" />
                          </div>
                        </div>
                        <span className="font-argesta tracking-[0.2em] text-white transition-all duration-300 text-base group-hover:tracking-[0.3em]">
                          SEND MESSAGE
                        </span>
                        <div className="w-2 h-2 bg-white/0 group-hover:bg-white/60 transition-all duration-300 transform group-hover:scale-100 scale-0 rounded-full" />
                      </>
                    )}
                  </div>
                  
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-sm" />
                </button>
              </div>
              </form>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          ${floatingElements.map(element => `
            @keyframes float-${element.id} {
              0%, 100% { transform: translate(0, 0) rotate(${element.id * 45}deg); }
              25% { transform: translate(20px, -20px) rotate(${element.id * 45 + 90}deg); }
              50% { transform: translate(-10px, -30px) rotate(${element.id * 45 + 180}deg); }
              75% { transform: translate(-20px, 10px) rotate(${element.id * 45 + 270}deg); }
            }
          `).join('')}
        `}</style>
      </div>
    );
  } 