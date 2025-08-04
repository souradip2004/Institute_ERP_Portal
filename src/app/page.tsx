'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Sparkles, MessageSquare, BarChart2, Zap, TrendingUp, ShieldCheck, LifeBuoy } from 'lucide-react';
import { Building, Briefcase, Users, UserCheck, CalendarCheck } from 'lucide-react';
import HeroA from '@/components/HeroA';
import React from 'react';
import { useRouter } from 'next/navigation';

import { BsFileEarmarkText, BsCalendarDate } from 'react-icons/bs';
import { FaUserCheck } from 'react-icons/fa'; // Using a different icon for better representation
import { PiHandshakeFill } from "react-icons/pi";

import {
    Instagram,
    Linkedin,
    Twitter,
    Youtube,
    Facebook,
    UserCircle,
    UserPlus,
    ChevronDown,
    ChevronUp,
    AtomIcon,
} from "lucide-react";
import FAQ from '@/components/ui/faq';
import Popup from '@/components/ui/popup';
import {
    Navigation,
    Pagination,
    Autoplay,
    EffectCoverflow,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

const features = [
    {
        title: "One-Click Access to Study Materials",
        description:
            "Access curated notes, textbooks, and resources tailored to your syllabus.",
        icon: "./a5.png",
    },
    {
        title: "Multi-Device Seamless Sync",
        description:
            "Learn on-the-go with full sync between mobile, tablet, and desktop platforms.",
        icon: "./a4.png",
    },
    {
        title: "AI POWERED VIDEO GENERATION",
        description:
            "Convert any PDF or notes into engaging, AI-generated explainer videos in seconds.",
        icon: "./a1.png",
    },
    {
        title: "LIVE DOUBT SOLVING WITH AI AND MENTORS",
        description:
            "Real-time chat support from AI tutors and human mentors for instant problem-solving.",
        icon: "/a2.png",
    },
    {
        title: "Personalized Dashboard",
        description:
            "Track your progress and manage upcoming tasks with an intuitive planner.",
        icon: "./a3.png",
    },
    {
        title: "Gamified Learning Interface",
        description:
            "Earn badges, rewards, and motivation boosts as you complete learning modules.",
        icon: "./a6.png",
    },
];
type FeatureItemProps = {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    title: string;
};

const FeatureItem = ({ icon: Icon, title }: FeatureItemProps) => {
    return (
        <li className="flex items-start space-x-4">
            <div className="flex-shrink-0">
                <Icon className="h-6 w-6 text-purple-600" aria-hidden="true" />
            </div>
            <p className="text-lg text-gray-700">
                {title}
            </p>
        </li>
    );
};
type FeatureCardProps = {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    title: string;
};
const features1 = [
    { icon: Building, title: "Centralized Management" },
    { icon: Briefcase, title: "Teacher Management" },
    { icon: Users, title: "Student Organizer" },
    { icon: TrendingUp, title: "Growth Analytics" },
    { icon: UserCheck, title: "Attendance Manager" },
    { icon: CalendarCheck, title: "Smart Scheduling" },
];

const FeatureCard = ({ icon: Icon, title }: FeatureCardProps) => {
    return (
        <div className="flex flex-col items-center p-4">
            <div className="bg-purple-200 p-4 rounded-xl mb-4 shadow-md">
                <Icon className="h-10 w-10 text-purple-700" aria-hidden="true" />
            </div>
            <p className="text-lg font-medium text-purple-800">
                {title}
            </p>
        </div>
    );
};


export default function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState<'success' | 'error'>('success');
    const [popupMessage, setPopupMessage] = useState('');
    const router = useRouter();


    // A reusable component for each step in the process
    type WorkStepProps = {
        icon: React.ComponentType<{ size?: number; className?: string }>;
        title: string;
        text: string;
    };
    const WorkStep = ({ icon, title, text }: WorkStepProps) => (
        <div className="flex flex-col items-center text-center w-full md:w-56 mx-4">
            <div className="bg-white rounded-full p-6 mb-5 shadow-md flex-shrink-0">
                {/* The icon is created dynamically based on the passed prop */}
                {React.createElement(icon, { size: 32, className: "text-[#6750A4]" })}
            </div>
            <h3 className="text-2xl font-normal mb-3 text-white">{title}</h3>
            <p className="text-base text-sm text-indigo-200">{text}</p>
        </div>
    );

    // A reusable component for the connecting line
    const Connector = () => (
        <div className="flex-1 max-w-[100px] h-0.5 bg-white hidden md:block mb-22"></div>
    );


    const handelGetEmailQuote = async () => {
        if (!email) {
            setPopupType('error');
            setPopupMessage('Please enter your email address');
            setShowPopup(true);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/emails/quote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setPopupType('success');
                setPopupMessage('Quote sent successfully! Check your email.');
                setShowPopup(true);
                setEmail('');
            } else {
                setPopupType('error');
                setPopupMessage('Failed to send quote. Please try again.');
                setShowPopup(true);
            }
        } catch (error) {
            setPopupType('error');
            setPopupMessage('An error occurred. Please try again.');
            setShowPopup(true);
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-screen mx-auto px-6 py-4 flex justify-between items-center">
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        width={160}
                        height={40}
                        className="object-contain"
                    />
                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6"> {/* Increased gap for better spacing */}
                        {/* Individual Button with Enhanced Tooltip */}
                        <div className="relative group inline-block">
                            <button
                                onClick={() => window.location.href = "https://aiclassroom.in/"}
                                className="glow-button px-6 py-2 rounded-lg text-base font-semibold cursor-pointer relative overflow-hidden transition-all duration-300 ease-in-out hover:scale-105"
                            >
                                Individual
                            </button>
                            <div
                                className="absolute top-[calc(100%+8px)] left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out pointer-events-none group-hover:scale-100 scale-95 origin-top"
                            >
                                For Individuals
                                <svg className="absolute text-gray-800 h-2 w-full left-0 top-[-7px]" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve"><polygon className="fill-current" points="0,255 127.5,0 255,255" /></svg>
                            </div>
                        </div>

                        {/* Login Button with UserCircle Icon */}
                        <Link
                            href="/login"
                            className="flex items-center gap-2 text-base bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5"
                        >
                            <UserCircle size={20} className="text-white" /> {/* Keeping UserCircle for Login */}
                            Login
                        </Link>

                        {/* Register Button with UserPlus Icon */}
                        <Link
                            href="/register"
                            className="flex items-center gap-2 text-base bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5"
                        >
                            <UserPlus size={20} className="text-gray-700" /> {/* Changed to UserPlus icon for Register */}
                            Register
                        </Link>
                    </nav>
                    {/* Mobile Menu Toggle */}
                    <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-gray-700">
                        <Menu size={28} />
                    </button>
                </div>

                {/* Mobile Side Drawer */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end">
                        <div className="w-64 bg-white h-full shadow-xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold">Menu</h2>
                                <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex flex-col gap-4">
                                {/* Login Link - Now a flex container */}
                                <Link
                                    href="/login"
                                    className="flex items-center justify-center gap-2 text-base bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <UserCircle size={20} className="text-white" />
                                    Login
                                </Link>

                                {/* Register Link - Now a flex container */}
                                <Link
                                    href="/register"
                                    className="flex items-center justify-center gap-2 text-base bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium transition-colors duration-200"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <UserPlus size={20} className="text-gray-700" />
                                    Register
                                </Link>

                                {/* Individual Button (Glow Button) - Centered */}
                                <div className="flex justify-center mt-2"> {/* Added margin-top for spacing from buttons above */}
                                    <div className="relative group inline-block">
                                        <button
                                            onClick={() => {
                                                window.location.href = "https://aiclassroom.in/";
                                                setMobileMenuOpen(false); // Close menu on click
                                            }}
                                            // Applying similar styles as desktop for consistency
                                            className="glow-button px-6 py-2 rounded-lg text-base font-semibold cursor-pointer relative overflow-hidden transition-all duration-300 ease-in-out"
                                        >
                                            Individual
                                        </button>
                                        <div
                                            className="absolute top-[calc(100%+8px)] left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out pointer-events-none group-hover:scale-100 scale-95 origin-top"
                                        >
                                            For Individuals
                                            <svg className="absolute text-gray-800 h-2 w-full left-0 top-[-7px]" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve"><polygon className="fill-current" points="0,255 127.5,0 255,255" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="relative bg-white font-sans overflow-hidden">


                {/* Decorative background elements */}
                <div className="absolute top-5 right-5 text-purple-100/50 z-10">
                    <AtomIcon />
                </div>
                {/* <div className="absolute -top-12 -left-12 w-72 h-72 bg-purple-50/50 rounded-full z-0"></div> */}
                <div className="absolute -bottom-16 -right-16 w-80 h-80 border-4 border-purple-100/50 rounded-full z-0"></div>

                <div className="flex flex-col md:flex-row items-center justify-center">
                    <div className="block md:hidden w-[80%] h-[80%] object-cover z-10">
                        <img src="/mainscreen.png" alt="Hero" className="object-cover" />
                    </div>
                    <div className="relative container mx-auto flex px-6 py-6 sm:py-32 z-10 md:ml-24">
                        <div className="max-w-2xl text-left">
                            <div className="flex flex-col items-start gap-2">
                                <h2 className="text-2xl md:text-3xl font-medium text-gray-800">Smart</h2>
                                <h1 className="text-5xl md:text-7xl font-bold text-[#3A1078]">Classrooms</h1>
                                <h3 className="text-3xl md:text-5xl font-medium text-gray-800">
                                    Smart <span className="text-[#3A1078] font-bold">Futures</span>
                                </h3></div>

                            <p className="mt-8 text-lg text-gray-600 max-w-lg">
                                Transform the way you learn and teach with AI-powered tools that enhance productivity and engagement.
                            </p>

                            <ul className="mt-10 space-y-5 text-xl font-medium text-purple-800">
                                <li className="flex items-center gap-4">
                                    <img src="/Frame.svg" alt="Admin" className="w-10 h-10 object-cover" />
                                    <span>Smart Admin Panel</span>
                                </li>
                                <li className="flex items-center gap-4">
                                    <img src="/h2SVG.svg" alt="Admin" className="w-10 h-10 object-cover" />
                                    <span>Seamless Teacher Dashboard</span>
                                </li>
                                <li className="flex items-center gap-4">
                                    <img src="/h1SVG.svg" alt="Admin" className="w-10 h-10 object-cover" />
                                    <span>24/7 Student Access</span>
                                </li>
                            </ul>

                            <button className="mt-12 bg-purple-900 hover:bg-purple-800 text-white font-bold text-xl py-4 px-36 rounded-lg transition-colors shadow-lg hover:shadow-xl" onClick={() => window.location.href = "/register"}>
                                Get Started
                            </button>
                        </div>
                    </div>

                </div>
                <div className="hidden md:block absolute top-[10%] right-0 w-[40%] h-[40%] object-cover z-10">
                    <img src="/hero_image.png" alt="Hero" className="absolute top-0 right-0 object-cover" />
                </div>
            </section>


            <div className='hidden  md:flex'>
                <div className="relative left-32 -top-28">
                    <img src="/home_line.png" alt="Hero" className="w-[416px] h-auto object-cover" />
                </div>


                <div className="bg-white font-sans mt-48">
                    <div className="container mx-auto max-w-7xl px-6 py-16 md:py-24">
                        {/* === TOP SECTION === */}
                        <div className="max-w-5xl">
                            {/* Main Headline */}
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#4a0e6c] leading-tight">
                                Let's explore from here
                            </h1>

                            {/* Sub-headline */}
                            <p className="mt-4 md:mt-6 text-lg md:text-xl text-gray-600 max-w-3xl">
                                Harnessed for productivity. Designed for collaboration. Celebrated for
                                smoothness. Welcome to the ERP platform institutions love.
                            </p>

                            {/* CTA Form Section */}
                            <div className="mt-8 md:mt-10 flex flex-col lg:flex-row items-center gap-x-6 gap-y-4">
                                {/* Email Input & Primary Button */}
                                <div className="flex w-full flex-col sm:flex-row sm:w-auto gap-3">
                                    <input
                                        type="email"
                                        placeholder="Email address"
                                        aria-label="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full sm:w-72 appearance-none rounded-md border border-gray-300 px-4 py-3 placeholder-gray-400 shadow-sm focus:border-[#6f42c1] focus:outline-none focus:ring-2 focus:ring-[#a38fc9]"
                                    />
                                    <button
                                        onClick={handelGetEmailQuote}
                                        disabled={isLoading}
                                        className="w-full sm:w-auto whitespace-nowrap rounded-md bg-[#6f42c1] px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-[#5a34a0] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Sending...' : 'Get a quote'}
                                    </button>
                                </div>



                                {/* Vertical Divider */}
                                <div className="hidden lg:block border-l border-gray-300 h-8"></div>

                                {/* Secondary Button */}
                                <div className="w-full lg:w-auto">
                                    <button className="w-full lg:w-auto whitespace-nowrap rounded-md border border-[#c5b3e5] px-6 py-3 font-semibold text-[#6f42c1] transition-colors hover:bg-[#f3e5f5] hover:border-[#6f42c1]"
                                        onClick={() => router.push('/register')}
                                    >
                                        Start a free enterprise trial
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* === BOTTOM SECTION === */}
                        <div className="mt-20 md:mt-32 max-w-5xl">
                            <h2 className="text-4xl font-normal font-[Helvetica]">
                                <span className="text-[#4a0e6c]">
                                    Accelerate high-quality{' '}
                                </span>
                                <span className="text-[#a38fc9]">
                                    Institution Management development. Our platform drives innovation
                                    with tools that boost management velocity.
                                </span>
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className='flex justify-center mt-8'>
                <img src="/CodeEditorImage.png" alt="img" />
            </div>


            <section className=" w-full mt-8 md:mt-0">
                <div className='flex flex-col'>
                    <div className="container mx-auto max-w-7xl px-4 pb-10">
                        {/* Flex container for the two-column layout */}
                        <div className="flex flex-col lg:flex-row items-center justify-center">

                            {/* === Left Column: Text Content === */}
                            <div className="flex-1">
                                <h2 className="text-[28px] font-normal font-[Helvetica]">
                                    <span className="text-[#4a0e6c]">
                                        AI-Classroom Workspaces {' '}
                                    </span>
                                    <span className="text-[#a38fc9]">
                                        offers a complete ERP platform, so you can control, manage, structure, and access from any part and from anywhere.
                                    </span>
                                </h2>
                            </div>

                            {/* === Right Column: Image Content === */}
                            <div className="flex-1">
                                {/* The image is wrapped in a div to create the card/shadow effect */}
                                <div className='flex flex-col justify-center align-middle items-center flex-1 max-h-36 relative top-96 md:top-40'>
                                    <img src="/PortsView.png" alt="AI-Classroom Workspaces" className='relative -top-72 md:-top-0' />
                                    <img src="/ActionsMenu.png" alt="AI-Classroom Workspaces Actions Menu" className='hidden md:block relative z-10 -top-96 left-36' />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>


            <div className="font-[Helvetica]">
                <div>
                    <div className='flex justify-center mt-2 px-4 mb:px-16 top-50'>

                        <div className='hidden md:block relative -left-14 top-40'>
                            <img src="/Tab.png" alt="qq" className='' />
                        </div>
                        <div className="max-w-3xl p-0 pb-20 md:p-20 mt-24">
                            {/* Subheading */}
                            <div className="inline-block relative">
                                <h2 className="text-sm font-bold tracking-[.2em] text-purple-400">ABOUT US</h2>
                                <div className="absolute -bottom-1 left-0 w-12 h-[2px] bg-purple-200"></div>
                            </div>

                            {/* Main Heading */}
                            <h1 className="text-4xl font-medium text-indigo-900 mt-4 mb-6 leading-tight">
                                The Easy Way To Get <br /> Your Space Organized
                            </h1>

                            {/* Paragraph */}
                            <p className="text-md text-gray-600 leading-relaxed">
                                We are more than just an educational platform. AI Classroom revolutionizes the way institutions manage their academic operations through intelligent automation, seamless integration, and data-driven insights. Our comprehensive ERP solution empowers administrators, teachers, and students to achieve excellence in education management.
                            </p>
                        </div>



                    </div>


                    <div className='hidden md:block relative -top-70 left-[80%] max-h-0'>
                        <img src="/Phone.png" alt="qq" className='' />
                    </div>

                    <div className='py-2 md:py-20 bg-[url(/qwqw.png)] '>

                        {/* <img src="/qwqw.png" alt="qq" className='w-screen' /> */}

                        <div className="font-sans w-full py-20 px-10">
                            <div className="container mx-auto text-center">
                                {/* Heading */}
                                <p className="tracking-wider text-sm text-white mb-2">HEADING 1</p>
                                <h2 className="text-3xl text-white mb-20">How We Work?</h2>

                                {/* Steps container */}
                                <div className="flex flex-col md:flex-row items-center justify-center space-y-12 md:space-y-0">
                                    <WorkStep
                                        icon={BsFileEarmarkText}
                                        title="Application"
                                        text="Submit your institution's requirements and let us understand your specific needs for digital transformation."
                                    />
                                    <Connector />
                                    <WorkStep
                                        icon={BsCalendarDate}
                                        title="Schedule Demo"
                                        text="Book a personalized demo session to explore our AI-powered classroom management features."
                                    />
                                    <Connector />
                                    <WorkStep
                                        icon={PiHandshakeFill}
                                        title="Partnership"
                                        text="Choose the perfect plan and begin your journey towards smarter education management."
                                    />
                                    <Connector />
                                    <WorkStep
                                        icon={FaUserCheck}
                                        title="Implementation"
                                        text="Get full support during setup and training to ensure seamless adoption across your institution."
                                    />
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>




            <FAQ />
            {/* Footer */}
            <footer className="border-t bg-gray-100 pt-8 mt-">
                <div className="flex flex-wrap justify-between mx-[10%] gap-8">
                    <div className="w-full md:w-auto">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="relative">
                                <img
                                    src="/logo.png"
                                    alt="AI Classroom Logo"
                                    className="w-full h-[50px] hover:opacity-90 transition-opacity duration-200 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-4 max-w-[450px]">
                            AI Classroom, developed by RnPsoft Private Limited, is designed to meet all the needs of a modern classroom by integrating the power of artificial intelligence.

                        </div>
                    </div>

                    {/* <div className="w-full sm:w-auto">
                        <h3 className="font-medium mb-4">About Us</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li
                                className="hover:text-purple-700 cursor-pointer transition-colors duration-200"
                                onClick={() => { window.location.href = "https://rnpsoft.com/our-team" }}
                            >
                                Our Team
                            </li>
                            <li
                                className="hover:text-purple-700 cursor-pointer transition-colors duration-200"
                                onClick={() => { window.location.href = "https://rnpsoft.com/event" }}
                            >
                                Events
                            </li>
                        </ul>
                    </div> */}

                    <div className="w-full sm:w-auto">
                        <h3 className="font-medium mb-4">Policies</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li
                                className="hover:text-purple-700 cursor-pointer transition-colors duration-200"
                                onClick={() => { window.location.href = "/terms" }}
                            >
                                Terms and Conditions
                            </li>
                            <li
                                className="hover:text-purple-700 cursor-pointer transition-colors duration-200"
                                onClick={() => { window.location.href = "/privacy" }}
                            >
                                Privacy
                            </li>
                            <li
                                className="hover:text-purple-700 cursor-pointer transition-colors duration-200"
                                onClick={() => { window.location.href = "/refund" }}
                            >
                                Refund
                            </li>
                        </ul>
                    </div>

                    <div className="w-full sm:w-auto">
                        <h3 className="font-medium mb-4">Follow Us</h3>
                        <div className="mt-[15px] flex gap-2">
                            <Instagram
                                className="h-5 w-5 hover:text-purple-700 cursor-pointer transition-colors duration-200"
                                onClick={() => { window.location.href = "https://www.instagram.com/aiclassroom_v1/" }}
                            />
                            <Facebook
                                className="h-5 w-5 hover:text-purple-700 cursor-pointer transition-colors duration-200"
                                onClick={() => { window.location.href = "https://www.facebook.com/profile.php?id=61555927914160" }}
                            />
                            <Linkedin
                                className="h-5 w-5 hover:text-purple-700 cursor-pointer transition-colors duration-200"
                                onClick={() => { window.location.href = "https://www.linkedin.com/showcase/ai-classroom/" }}
                            />
                            <Youtube
                                className="h-5 w-5 hover:text-purple-700 cursor-pointer transition-colors duration-200"
                                onClick={() => { window.location.href = "https://www.youtube.com/@RnPsoft" }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap justify-between mx-[10%] mt-8">
                    <div className="w-full sm:w-auto">
                        <div
                            className="text-sm text-gray-600 mb-2 hover:text-purple-700 cursor-pointer transition-colors duration-200"
                            onClick={() => window.location.href = "mailto:support@@aiclassroom.in"}
                        >
                            support@aiclassroom.in
                        </div>
                        <div
                            className="text-sm text-gray-600 mb-2 hover:text-purple-700 cursor-pointer transition-colors duration-200"
                            onClick={() => window.location.href = "tel:+919938512307"}
                        >
                            +91 9938512307
                        </div>
                    </div>

                    <div className="w-full sm:w-auto text-center text-xs text-gray-500 mt-8 pt-4">
                        © 2025 AI Classroom All rights reserved
                    </div>
                </div>
            </footer>
            {/* Popup Component */}
            <Popup
                isOpen={showPopup}
                onClose={() => setShowPopup(false)}
                type={popupType}
                title={popupType === 'success' ? 'Success!' : 'Error'}
                message={popupMessage}
            />
        </div>
    );
}