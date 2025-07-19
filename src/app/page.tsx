'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Sparkles, MessageSquare, BarChart2, Zap, TrendingUp, ShieldCheck, LifeBuoy } from 'lucide-react';
import { Building, Briefcase, Users, UserCheck, CalendarCheck } from 'lucide-react';
import HeroA from '@/components/HeroA';

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
        title: "Access to Materials",
        description:
            "Access curated notes, videos, and resources aligned with your syllabus.",
        icon: "./access.png",
    },
    {
        title: "Multi-Device Seamless Sync",
        description:
            "Learn on-the-go with full sync between mobile, tablet, and desktop platforms.",
        icon: "./mobile.png",
    },
    {
        title: "AI POWERED VIDEO GENERATION",
        description:
            "Convert any PDF or notes into engaging, AI-generated explainer videos in seconds.",
        icon: "./pdfvideo.png",
    },
    {
        title: "LIVE DOUBT SOLVING WITH AI AND MENTORS",
        description:
            "Real-time chat support from AI tutors and human mentors for instant problem-solving.",
        icon: "/mentorai.png",
    },
    {
        title: "Personalized Dashboard",
        description:
            "Track your progress and manage upcoming tasks with an intuitive planner.",
        icon: "./aidash.png",
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

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
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

                            <button className="mt-12 bg-purple-900 hover:bg-purple-800 text-white font-bold text-xl py-4 px-14 rounded-lg transition-colors shadow-lg hover:shadow-xl" onClick={() => window.location.href = "/register"}>
                                Get Started
                            </button>
                        </div>
                    </div>

                </div>
                <div className="hidden md:block absolute top-[10%] right-0 w-[40%] h-[40%] object-cover z-10">
                    <img src="/hero_image.png" alt="Hero" className="absolute top-0 right-0 object-cover" />
                </div>
            </section>

            {/* Features Section */}
            <div className='flex justify-end bg-white mt-10'>
                <div className="bg-[#dad4ff] p-8 md:bg-gradient-to-l from-[#F1F5FF] to-[#EDECFF] text-gray-900 font-inter flex items-center justify-center md:w-[90%] rounded-l-[114px] py-10 border-1 border-purple-200">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Image Section */}
                        <div className="flex justify-center lg:justify-end">
                            {/* Using a placeholder image for the devices. In a real app, you'd replace this with your actual image. */}
                            <img
                                src="/iconer2.png"
                                alt="Dashboard on Tablet and Phone"
                                className="w-full max-w-md md:max-w-lg"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://placehold.co/600x400/F8F0FF/2D0065?text=Image+Not+Found";
                                }}
                            />
                        </div>

                        {/* Content Section */}
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                            <h2 className="text-lg font-semibold text-purple-700 uppercase tracking-wider mb-2">
                                Smart Features
                            </h2>
                            <h1 className="text-4xl font-bold text-purple-900 leading-tight mb-8">
                                At Your Fingertips
                            </h1>

                            {/* Features List */}
                            <ul className="space-y-3 max-w-md lg:max-w-none">
                                <FeatureItem
                                    icon={Sparkles}
                                    title="Personalized Theme: Lorem Ipsum,"
                                />
                                <FeatureItem
                                    icon={MessageSquare}
                                    title="Multi-Channel Communication: Lorem Ipsum,"
                                />
                                <FeatureItem
                                    icon={BarChart2}
                                    title="Real-Time Analytics: Track performance live."
                                />
                                <FeatureItem
                                    icon={Zap}
                                    title="Real-Time Response: Lorem Ipsum."
                                />
                                <FeatureItem
                                    icon={TrendingUp}
                                    title="Scalability: Handles high traffic effortlessly."
                                />
                                <FeatureItem
                                    icon={ShieldCheck}
                                    title="Secure Data: Advanced encryption and compliance."
                                />
                                <FeatureItem
                                    icon={LifeBuoy}
                                    title="24/7 Support: Always available, uninterrupted service."
                                />
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Carousel */}
            <section className="bg-gradient-to-b from-gray-50 to-white py-20 lg:py-24 overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 leading-tight tracking-tight">
                            Experience the <span className="text-indigo-600">Ease of Teaching</span> with <br /> <span className="text-indigo-800">AI Classroom</span>
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                            Revolutionize your teaching methods with our intuitive AI-powered platform designed to simplify your workflow and enhance student engagement.
                        </p>
                    </div>

                    <Swiper
                        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                        modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
                        spaceBetween={40} // Increased space between slides
                        slidesPerView={1}
                        centeredSlides
                        loop
                        navigation={{
                            nextEl: '.swiper-button-next-custom',
                            prevEl: '.swiper-button-prev-custom',
                        }}
                        pagination={{ clickable: true, el: '.swiper-pagination-custom' }}
                        autoplay={{ delay: 3500, disableOnInteraction: false }} // Slightly longer delay, don't stop on interaction
                        effect="coverflow"
                        coverflowEffect={{
                            rotate: 0,
                            stretch: 0,
                            depth: 100,
                            modifier: 1,
                            slideShadows: false, // Keep shadows off for a cleaner look
                        }}
                        breakpoints={{
                            640: { slidesPerView: 2, spaceBetween: 30 },
                            1024: { slidesPerView: 3, spaceBetween: 40 },
                        }}
                        className="relative pb-16 pt-8" // Added padding for pagination dots and custom arrows
                    >
                        {features.map((feature, index) => (
                            <SwiperSlide key={index}>
                                <div className={`rounded-3xl p-8 shadow-lg transition-all duration-500 ease-in-out transform
        h-[400px] min-h-[320px] flex flex-col items-center text-center border border-gray-100
        ${index === activeIndex ? 'bg-gradient-to-b from-[#C4D9FF] to-[#C5BAFF]' : 'bg-white hover:shadow-xl hover:-translate-y-2'}
      `}>
                                    <h3 className="text-2xl font-bold text-[#3A1078] mb-3">{feature.title}</h3>
                                    <p className="text-black mt-4 text-base leading-relaxed">{feature.description}</p>
                                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mt-auto mb-6 shadow-md p-2">
                                        <img src={feature.icon} alt={feature.title} className="w-full h-full object-cover rounded-full" />
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}

                        {/* Custom Navigation Arrows */}
                        <div className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-white rounded-full p-3 shadow-md hover:bg-gray-100 transition-colors duration-300 hidden md:block">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </div>
                        <div className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-white rounded-full p-3 shadow-md hover:bg-gray-100 transition-colors duration-300 hidden md:block">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>

                        {/* Custom Pagination Dots */}
                        <div className="swiper-pagination-custom mt-8 flex justify-center space-x-2 absolute bottom-4 left-0 right-0"></div>
                    </Swiper>
                </div>
            </section>



            <div className="md:hidden min-h-screen bg-white font-inter flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-purple-50 rounded-3xl shadow-xl p-8 md:p-12 lg:p-16 text-center">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-purple-900 leading-tight mb-4">
                        Built For All Your <br className="sm:hidden" />Administrative Needs
                    </h1>
                    <p className="text-md sm:text-lg text-purple-700 mb-12">
                        AI Powered Institution Management Solution For You!
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                        {features1.map((feature, index) => (
                            <FeatureCard key={index} icon={feature.icon} title={feature.title} />
                        ))}
                    </div>
                </div>
            </div>


            {/* <div className='flex flex-row  bg-[#e0dcff7c]'>
                <div className='flex flex-col items-start justify-center h-[600px] w-[40%]'>
                    <div className="text-3xl sm:text-4xl lg:text-5xl h-[50%] w-[90%] flex flex-col justify-center font-extrabold bg-purple-400 text-white leading-tight mb-4 rounded-r-[250px] pl-8">
                        <div>
                            <div>Smart</div>
                            <div>Classroom</div>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col items-center justify-center h-[600px] w-[60%]'>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-purple-900 leading-tight mb-4">
                        Built For All Your <br className="sm:hidden" />Administrative Needs
                    </h1>
                    <p className="text-md sm:text-lg text-purple-700 mb-12">
                        AI Powered Institution Management Solution For You!
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                        {features1.map((feature, index) => (
                            <FeatureCard key={index} icon={feature.icon} title={feature.title} />
                        ))}
                    </div>
                </div>

            </div> */}

            <div className='hidden md:block mt-10'>
                <HeroA />
            </div>


            <FAQ />
            {/* Footer */}
            <footer className="border-t bg-gray-100 pt-8">
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

                    <div className="w-full sm:w-auto">
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
                    </div>

                    <div className="w-full sm:w-auto">
                        <h3 className="font-medium mb-4">Policies</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li
                                className="hover:text-purple-700 cursor-pointer transition-colors duration-200"
                                onClick={() => { window.location.href = "https://aiclassroom.in/terms-guidelines" }}
                            >
                                Terms and Conditions
                            </li>
                            <li
                                className="hover:text-purple-700 cursor-pointer transition-colors duration-200"
                                onClick={() => { window.location.href = "https://aiclassroom.in/privacy-guidelines" }}
                            >
                                Privacy
                            </li>
                            <li
                                className="hover:text-purple-700 cursor-pointer transition-colors duration-200"
                                onClick={() => { window.location.href = "https://aiclassroom.in/refund-guidelines" }}
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
        </div>
    );
}
