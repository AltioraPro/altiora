import BlurText from "@/components/landing/BlurText";
import ShinyText from "@/components/landing/ShinyText";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { Header } from "@/components/layout/Header";
import { ArrowRight, TrendingUp, Target, Zap, BarChart3, Clock, Star, ChevronDown } from "lucide-react";
import Link from "next/link";
import Silk from "@/components/Silk/Silk";



export default function HomePage() {
  return (
    <>
      <Header />
      <section className="h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden grayscale ">
        <div className="absolute inset-0 w-full h-full">
        <Silk
          speed={5}
          scale={1}
          color="#121112"
          noiseIntensity={1.5}
          rotation={0}
        />
        </div>

        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[120%] h-[60%] pointer-events-none opacity-50 z-10"
          style={{
            background: 'radial-gradient(ellipse at center bottom, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 30%, rgba(255, 255, 255, 0.05) 50%, transparent 70%)'
          }}
        ></div>

        <div className="absolute left-8 top-1/2 transform -translate-y-1/2 space-y-8 opacity-60 z-20">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center space-x-3">
                <TrendingUp className="w-6 h-6 text-white" />
              <span className="text-white font-argesta text-sm">TRADING</span>
            </div>
            <div className="flex items-center space-x-3">
              <Target className="w-6 h-6 text-white" />
              <span className="text-white font-argesta text-sm">GOALS</span>
            </div>
            <div className="flex items-center space-x-3">
              <Zap className="w-6 h-6 text-white" />
              <span className="text-white font-argesta text-sm">HABITS</span>
            </div>
          </div>
          
          <div className="w-px h-32 bg-gradient-to-b from-transparent via-white to-transparent opacity-30"></div>
          
          <div className="space-y-2">
            <p className="text-white font-argesta text-xs opacity-70 transform -rotate-90 origin-left">DISCIPLINE</p>
          </div>
        </div>

        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 space-y-8 opacity-60 z-20 flex flex-col items-end">
          <div className="flex flex-col items-end space-y-6">
            <div className="flex items-center space-x-3">
              <span className="text-white font-argesta text-sm">ANALYTICS</span>
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-white font-argesta text-sm">TRACKING</span>
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-white font-argesta text-sm">PROGRESS</span>
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="w-px h-32 bg-gradient-to-b from-transparent via-white to-transparent opacity-30"></div>
          
          <div className="space-y-2">
            <p className="text-white font-argesta text-xs opacity-70 transform rotate-90 origin-right">FOCUS</p>
          </div>
        </div>

        <div className="absolute top-20 left-20 w-4 h-4 border border-white opacity-20 rotate-45 z-20"></div>
        <div className="absolute top-32 right-32 w-6 h-6 border border-white opacity-15 rotate-12 z-20"></div>
        <div className="absolute bottom-40 left-40 w-3 h-3 bg-white opacity-10 rounded-full z-20"></div>
        <div className="absolute bottom-60 right-20 w-8 h-8 border border-white opacity-25 rotate-45 z-20"></div>

        
        <div className="text-pure-white relative overflow-hidden flex items-center justify-center flex-col z-30">
          <div className="flex items-center justify-center flex-col z-10">
            <h1 className="text-[13vw] bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent opacity-90 select-none pointer-events-none whitespace-nowrap font-argesta leading-none">
              ALTIORA
            </h1>

            <ShinyText 
              text="Personal coaching platform: trading, habits, and goals in one place."
              className="text-[1vw] font-bold text-pure-white opacity-90 select-none pointer-events-none whitespace-nowrap font-argesta -mt-2 mb-2"
              speed={8}
            />

            <BlurText 
              text="Your discipline, our platform."
              className="text-[1vw] text-pure-white opacity-90 select-none pointer-events-none whitespace-nowrap font-argesta -mt-2"
            />
          </div>

          <div className="flex items-center justify-center">
            <div className="flex flex-col sm:flex-row gap-4 mt-12">
              <Link href="/auth/register">
                <HoverBorderGradient
                  containerClassName="bg-pure-black"
                  className="bg-pure-black text-white opacity-70"
                >
                  <span className="flex items-center gap-2">
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </HoverBorderGradient>
              </Link>
              
              
              <Link href="/pricing">
                <HoverBorderGradient
                  containerClassName="bg-pure-white"
                  className="bg-pure-black text-white opacity-70"
                >
                  About Us
                </HoverBorderGradient>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
          <div className="flex flex-col items-center space-y-2 animate-bounce">
            <span className="text-white/50 text-xs font-argesta tracking-widest">EXPLORE</span>
            <ChevronDown className="w-5 h-5 text-white/50" />
          </div>
        </div>
      </section>

      <FeaturesSection />
    </>
  );
}  