"use client";

import { Mail, MessageSquare, Phone, Send, User } from "lucide-react";
import { type FormEvent, useState } from "react";

interface FormData {
    fullName: string;
    email: string;
    phone: string;
    message: string;
}

export const ContactForm = () => {
    const [formData, setFormData] = useState<FormData>({
        fullName: "",
        email: "",
        phone: "",
        message: "",
    });
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        await new Promise((resolve) => setTimeout(resolve, 2000));

        setIsSubmitting(false);

        setFormData({
            fullName: "",
            email: "",
            phone: "",
            message: "",
        });
    };

    return (
        <div className="relative w-full max-w-2xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="relative">
                    <label
                        className="mb-2 block font-medium text-white/60 text-xs tracking-widest"
                        htmlFor="fullName"
                    >
                        FULL NAME *
                    </label>
                    <div className="relative">
                        <User className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-white/40" />
                        <input
                            className={`w-full border-b-2 bg-transparent py-3 pr-3 pl-10 text-sm transition-all duration-300 focus:outline-hidden ${
                                focusedField === "fullName"
                                    ? "border-white text-white"
                                    : "border-white/20 text-white/80"
                            }`}
                            name="fullName"
                            onBlur={() => setFocusedField(null)}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField("fullName")}
                            placeholder="Enter your full name"
                            required
                            type="text"
                            value={formData.fullName}
                        />
                        <div
                            className={`absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300 ${
                                focusedField === "fullName" ? "w-full" : "w-0"
                            }`}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <label
                            className="mb-2 block font-medium text-white/60 text-xs tracking-widest"
                            htmlFor="email"
                        >
                            EMAIL *
                        </label>
                        <div className="relative">
                            <Mail className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-white/40" />
                            <input
                                className={`w-full border-b-2 bg-transparent py-3 pr-3 pl-10 text-sm transition-all duration-300 focus:outline-hidden ${
                                    focusedField === "email"
                                        ? "border-white text-white"
                                        : "border-white/20 text-white/80"
                                }`}
                                name="email"
                                onBlur={() => setFocusedField(null)}
                                onChange={handleInputChange}
                                onFocus={() => setFocusedField("email")}
                                placeholder="your@email.com"
                                required
                                type="email"
                                value={formData.email}
                            />
                            <div
                                className={`absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300 ${
                                    focusedField === "email" ? "w-full" : "w-0"
                                }`}
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label
                            className="mb-2 block font-medium text-white/60 text-xs tracking-widest"
                            htmlFor="phone"
                        >
                            PHONE
                        </label>
                        <div className="relative">
                            <Phone className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-white/40" />
                            <input
                                className={`w-full border-b-2 bg-transparent py-3 pr-3 pl-10 text-sm transition-all duration-300 focus:outline-hidden ${
                                    focusedField === "phone"
                                        ? "border-white text-white"
                                        : "border-white/20 text-white/80"
                                }`}
                                name="phone"
                                onBlur={() => setFocusedField(null)}
                                onChange={handleInputChange}
                                onFocus={() => setFocusedField("phone")}
                                placeholder="+33 1 23 45 67 89"
                                type="tel"
                                value={formData.phone}
                            />
                            <div
                                className={`absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300 ${
                                    focusedField === "phone" ? "w-full" : "w-0"
                                }`}
                            />
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <label
                        className="mb-2 block font-medium text-white/60 text-xs tracking-widest"
                        htmlFor="message"
                    >
                        MESSAGE *
                    </label>
                    <div className="relative">
                        <MessageSquare className="absolute top-4 left-3 h-4 w-4 text-white/40" />
                        <textarea
                            className={`w-full resize-none rounded-lg border-2 bg-transparent py-3 pr-3 pl-10 text-sm transition-all duration-300 focus:outline-hidden ${
                                focusedField === "message"
                                    ? "border-white text-white"
                                    : "border-white/20 text-white/80"
                            }`}
                            name="message"
                            onBlur={() => setFocusedField(null)}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField("message")}
                            placeholder="Describe your project or ask your question..."
                            required
                            rows={4}
                            value={formData.message}
                        />
                    </div>
                </div>

                <div className="relative mt-8">
                    <button
                        className="group relative w-full overflow-hidden rounded-none border border-white/30 bg-transparent py-6 transition-all duration-700 hover:border-white disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isSubmitting}
                        type="submit"
                    >
                        <div className="absolute inset-0 origin-center scale-x-0 transform bg-linear-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:scale-x-100" />
                        <div className="absolute inset-0 translate-y-full transform bg-white/10 transition-transform duration-500 group-hover:translate-y-0" />

                        <div className="-translate-x-full -translate-y-full absolute top-0 left-0 h-8 w-8 transform border-white/40 border-t border-l transition-transform duration-500 group-hover:translate-x-0 group-hover:translate-y-0" />
                        <div className="absolute right-0 bottom-0 h-8 w-8 translate-x-full translate-y-full transform border-white/40 border-r border-b transition-transform delay-100 duration-500 group-hover:translate-x-0 group-hover:translate-y-0" />

                        <div className="absolute top-0 left-0 h-px w-0 bg-white transition-all duration-600 group-hover:w-full" />
                        <div className="absolute right-0 bottom-0 h-px w-0 bg-white transition-all delay-200 duration-600 group-hover:w-full" />

                        <div className="relative z-10 flex items-center justify-center space-x-3">
                            {isSubmitting ? (
                                <>
                                    <div className="relative">
                                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                        <div className="absolute inset-0 h-6 w-6 animate-pulse rounded-full border border-white/10" />
                                    </div>
                                    <span className="text-base text-white/90 tracking-[0.2em] transition-all duration-300">
                                        SENDING...
                                    </span>
                                </>
                            ) : (
                                <>
                                    <div className="relative">
                                        <Send className="h-6 w-6 text-white transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                                        <div className="absolute inset-0 h-6 w-6 opacity-0 transition-opacity duration-300 group-hover:opacity-30">
                                            <Send className="h-6 w-6 animate-pulse text-white" />
                                        </div>
                                    </div>
                                    <span className="text-base text-white tracking-[0.2em] transition-all duration-300 group-hover:tracking-[0.3em]">
                                        SEND MESSAGE
                                    </span>
                                    <div className="h-2 w-2 scale-0 transform rounded-full bg-white/0 transition-all duration-300 group-hover:scale-100 group-hover:bg-white/60" />
                                </>
                            )}
                        </div>

                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent opacity-0 blur-xs transition-opacity duration-500 group-hover:opacity-20" />
                    </button>
                </div>
            </form>
        </div>
    );
};

