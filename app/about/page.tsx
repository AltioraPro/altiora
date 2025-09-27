import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
return (
    <>
    <Header />
    
    <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
        <h1 className="text-3xl font-argesta text-white mb-2">About</h1>
        <p className="text-white/60">
            A developer and a trader, one vision: democratize trading tools and personal development.
        </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <Card className="border border-white/10 bg-black/20">
            <CardHeader>
            <CardTitle className="text-white">
                Sx
            </CardTitle>
            <CardDescription className="text-white/60">
                Developer & Founder
            </CardDescription>
            </CardHeader>
            <CardContent>
            <p className="text-white/80 leading-relaxed mb-4">
                Developer passionate about grinding and personal growth. 
                Built Altiora to create tools that help others achieve their goals 
                with the same discipline I apply to my own development.
            </p>
            <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/70">TypeScript</span>
                <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/70">Next.js</span>
                <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/70">Discipline</span>
            </div>
            </CardContent>
        </Card>

        <Card className="border border-white/10 bg-black/20">
            <CardHeader>
            <CardTitle className="text-white">
                Troxxy
            </CardTitle>
            <CardDescription className="text-white/60">
                Trader & Co-founder
            </CardDescription>
            </CardHeader>
            <CardContent>
            <p className="text-white/80 leading-relaxed mb-4">
                Trader with 5+ years experience. Tired of overpriced, 
                poorly designed trading journals. We&apos;re changing that.
            </p>
            <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/70">Trading</span>
                <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/70">Risk Management</span>
                <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/70">Mentoring</span>
            </div>
            </CardContent>
        </Card>
        </div>

        <div className="mt-12 text-center">
        <p className="text-sm text-white/40">
            Fair prices • Clean tools • Real results
        </p>
        </div>

        <div className="mt-8 flex justify-start">
        <Link href="/">
            <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
            </Button>
        </Link>
        </div>
    </div>
    </>
);
}
