import BlurText from "@/components/landing/BlurText";
import ShinyText from "@/components/landing/ShinyText";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    

<section className="h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/img/bghero1.png)' }}>
    <div className="text-pure-white relative overflow-hidden flex items-center justify-center flex-col">

      <div className="flex items-center justify-center flex-col z-10">
          <h1 className="text-[13vw] font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent opacity-90 select-none pointer-events-none whitespace-nowrap font-argesta leading-none">
            ALTIORA
          </h1>

          <ShinyText 
            text="Personal coaching platform: trading, habits, and goals in one place."
            className="text-[1vw] font-bold text-pure-white opacity-90 select-none pointer-events-none whitespace-nowrap font-argesta -mt-2 mb-2"
            speed={8}
          />

        <BlurText 
          text="Your discipline, our platform."
          className="text-[1vw] font-bold text-pure-white opacity-90 select-none pointer-events-none whitespace-nowrap font-argesta -mt-2"
        />


      </div>

      <div className="flex items-center justify-center">

        <div className="flex flex-col sm:flex-row gap-4 mt-12">
            <Link href="/auth">
              <HoverBorderGradient
                containerClassName="bg-pure-black"
                className="bg-pure-black text-white opacity-70"
              >
                <span className="flex items-center gap-2">
                  Let&apos;s start
                  <ArrowRight className="w-4 h-4" />
                </span>
              </HoverBorderGradient>
            </Link>
            
            <Link href="/about">
              <HoverBorderGradient
                containerClassName="bg-pure-white"
                className="bg-pure-black text-white opacity-70"
              >
                Learn more
              </HoverBorderGradient>
            </Link>
          </div>
        </div>
    </div>


</section>
  );
}  