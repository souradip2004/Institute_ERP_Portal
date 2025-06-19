'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { Swiper, SwiperSlide } from "swiper/react";
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
    icon:"/mentorai.png",
  },
  {
    title: "Personalized Dashboard",
    description:
      "Track your progress and manage upcoming tasks with an intuitive planner.",
    icon: "./aidash.png",
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
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
            <svg className="absolute text-gray-800 h-2 w-full left-0 top-[-7px]" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve"><polygon className="fill-current" points="0,255 127.5,0 255,255"/></svg>
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
              <svg className="absolute text-gray-800 h-2 w-full left-0 top-[-7px]" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve"><polygon className="fill-current" points="0,255 127.5,0 255,255"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
      </header>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center px-6 py-20 gap-16">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h2 className="text-xl font-medium text-gray-600">Smart</h2>
            <h1 className="text-6xl font-bold text-purple-900 mb-2">Classrooms</h1>
            <h3 className="text-3xl font-medium text-gray-800 mb-6">
              Smart <span className="text-purple-900 font-semibold">Futures</span>
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto lg:mx-0">
              Transform the way you learn and teach with AI-powered tools that enhance productivity and engagement.
            </p>
            <Link href="/register" className="bg-purple-900 hover:bg-purple-800 text-white font-medium py-3 px-8 rounded-lg transition-colors">
              Get Started
            </Link>
          </div>
          <div className="lg:w-1/2">
            <Image
              src="/mainscreen.png"
              alt="AI Classroom Illustration"
              width={500}
              height={500}
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Carousel */}
  <section className="bg-gradient-to-b from-gray-50 to-white py-20 lg:py-24 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Experience the <span className="text-indigo-600">Ease of Teaching</span> with <br /> <span className="text-indigo-800">AI Classroom</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Revolutionize your teaching methods with our intuitive AI-powered platform designed to simplify your workflow and enhance student engagement.
          </p>
        </div>

        <Swiper
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
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 ease-in-out transform hover:-translate-y-2 min-h-[320px] flex flex-col items-center text-center border border-gray-100">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-md p-2">
                  <img src={feature.icon} alt={feature.title} className="w-full h-full object-cover rounded-full" style={{ width: '100%', height: '100%' }} />
                </div>
                <h3 className="text-xl font-bold text-indigo-700 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed">{feature.description}</p>
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
<FAQ/>
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
                AI Classroom is designed by RnPsoft Private Limited to cater all the needs of a classroom with the AI Effect.
                 
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
                onClick={() => window.location.href = "mailto:team@rnpsoft.com"}
              >
                team@rnpsoft.com
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
