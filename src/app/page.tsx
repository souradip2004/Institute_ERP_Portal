'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { Swiper, SwiperSlide } from "swiper/react";
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
            src="https://media-hosting.imagekit.io/ec92e4e35be64d63/navlogo.png?Expires=1840897655&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=l6NqfsMDqkEtJKGne9jQGByswyVWZVOrHU2GGaayrbu4NTBQuKV5FZ4c-II7yle67m~uWVboQmHUb3kogbqNjNUkwJpSK5md7ufqh-ru1VYWk88f8SjXjRfRFxxxMayQzi3Bnoc4iLtuaL25zHXMpKaZSnTPwgbykC9UK2ZVRvwMz6aUFc7eTfDXJoz1tITJ1C2SCfffvvc9Z~1g45cQd0Gl447yTrqqw~XEAl1ekj4Wrnf5sqq6dvFgYpdciK~QUYl8olW9UAea6ZKHRAw2W6sqM0cAjyzxDbHS4GrN7muT9zd5pvkPwbt~A50mkyWKN68FDikIyfwnrqp989YQyw__"
            alt="Logo"
            width={160}
            height={40}
            className="object-contain"
          />
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-4">
            <Link href="/login" className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium">
              Login
            </Link>
            <Link href="/register" className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium">
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
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <Link href="/login" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md text-center" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className="text-sm bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-center" onClick={() => setMobileMenuOpen(false)}>
                  Register
                </Link>
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
              src="https://media-hosting.imagekit.io/5e8f7d1729b0425e/mainscreen.png?Expires=1840897655&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=s5iukeyAhMutNy5ZnLyf3C3E4IE60hh-QhXim6DCPdjKNN7-gweDpmDN~NiD8mDglGPMDTNoQJHnUYFmRED9zw4zOEbvg6KVxkkY2IG214T3zWvmMXDTffghtpPfLIj6895-f70EkDLrhzuw~tr5E7uaZ1VXWrtz1nmPOyzj4aV90eB~lSQ2r4NB4aEfymRPFuxTxprxfBvENWrcPdWcTdx7Gmqr69yfRP32P3KxDAWhLOzMKT2OqwTbeMLNfdD7inPcB521HgN2q-idBaFeNSd1OgFfC8Ff8PHG0E-OyXsWjcRC4bO37fAPFCYGCtp1qP0Y4a3fgcCxOMf-tuUcJA__"
              alt="AI Classroom Illustration"
              width={500}
              height={500}
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Carousel */}
      <section className="bg-gray-50 py-20">
        <div className="text-center mb-12 px-4">
          <h2 className="text-4xl font-bold">
            Experience the Ease of Teaching with <span className="text-purple-900">AI Classroom</span>
          </h2>
        </div>
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
          spaceBetween={30}
          slidesPerView={1}
          centeredSlides
          loop
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          effect="coverflow"
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: false,
          }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="px-6"
        >
          {features.map((feature, index) => (
            <SwiperSlide key={index}>
           <div className="bg-white/70 backdrop-blur-md border border-blue-100 rounded-2xl p-6 shadow-md hover:shadow-xl transition duration-300 min-h-[300px] flex flex-col items-center text-center">
  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 overflow-hidden">
    <img src={feature.icon} alt={feature.title} className="w-full h-full object-contain" />
  </div>
  <h3 className="text-lg font-semibold text-blue-700 mb-2">
    {feature.title}
  </h3>
  <p className="text-gray-500 text-sm">{feature.description}</p>
</div>

            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 text-center text-sm text-gray-500">
          &copy; 2025 AI Classroom. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
