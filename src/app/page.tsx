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
    icon: "https://media-hosting.imagekit.io/1101acf77cf74569/image%20101.png?Expires=1840897655&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=J4edh1H5Z3qpoU~m2-z8eEdhFoOYzzCzv~Pexy0EmQTI53vKCbU-pDVlcqRWhqod7LtH5bUtLQx90fdCXXkCR9kLzn68dzVWIbvh5MoyXlhweLnDSCIKQxjImDCAcZkE3z02NnAlljarcXnPmbbEsSbrzdZnh8WfNRoKmkg5sCbSCsYRc33iGyoqMOvJSNTXJHcru1SIkQxztkCupNfwIk-17vM54naao9bKkjPC5fpq6lredt2PWPHLf6P6t9jI1X1oY0f-yrLywBiKs1L2yXdTv7USoIu~0lqvSQddgpUDABBLj0eCS9g-wnjoxa9Fve~CCaHfCe2W9SCm6jQEqA__",
  },
  {
    title: "Multi-Device Seamless Sync",
    description:
      "Learn on-the-go with full sync between mobile, tablet, and desktop platforms.",
    icon: "https://media-hosting.imagekit.io/1a593ddb7239404b/image%20102.png?Expires=1840897655&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=yYFI8htoAeAiY-NfLzKMjk1t1rSE19ZNeiGRl0cc6IDa1RcMHZdOPvs30ybwHo1COPzUjZpefIp~t0-~BPty3cQEjZTNra6nqEJnBVyB6FUHRA3I0JdvliGHupUY-PcJuc4xQVcZLroyW~NYlNSVsz0dHe7Bqwupf2LS-uu1a2A1LT68GoltxRdq5W0Jr9GpuO1XeorSxLe6yyRulGB4c08TLBb5kKFS6EG-iS-tsUll-V~5B0Fl42W-m3jg331Ty1EuEpKGyLl8W6X7j-3PQibvWZgXiwblLeZE0A9LpZHlXuxHef3F8bttdLj3Isak8lvWtqbzINReMicYjez0Uw__",
  },
  {
    title: "AI POWERED VIDEO GENERATION",
    description:
      "Convert any PDF or notes into engaging, AI-generated explainer videos in seconds.",
    icon: "https://media-hosting.imagekit.io/9ab00f8f14844dfd/pdfslider.png?Expires=1840897655&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=hsE5IpMixW~9TmsDLCTmJ~P9ur2AETqCX1OcTRKk~Kv91IvF2iKrwGU9-Og7tJmjJ5n9jw3Sol0KBBpaEnrRG6qBhDXHbRfnKbIMI9xvE3OZ2N8TMFm9b3y3LPVciAQteBOWiYZHsKpg7ngs8ei6QOfMeBYEOXgYJoTZ370dorqLlMPq1fukW94VXatnfCIEJEX2zYCGBxt52ZAJ0A~TPPPvUvHVagUPN8a~PSCztlzsEncJF7-g5oV6WDj4YD4SFuFIo74OUWzKZka-nbpS14EwxjmZJKr7sJrbG1u6lsMQWH6ZtsVH1wCJnjehAq5NNiowzI5WVSyQUiPNpMk1QA__",
  },
  {
    title: "LIVE DOUBT SOLVING WITH AI AND MENTORS",
    description:
      "Real-time chat support from AI tutors and human mentors for instant problem-solving.",
    icon: "https://media-hosting.imagekit.io/ef8d3c17b3c84875/image%20100.png?Expires=1840897655&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=QhXnNJnl63E6T2tgwPrcxgsd0NLAtsQ~EO9evC3cAHLmaTuYyFv0S50vGljXMITDKZscHMWJ01vaMm30uxtrMhoN1Vpu9AeFzlFSptyUCkGoy7PSsBWYf-h~FhB15xz5DZjVsLvblpZRa2nPIZeo4RMXxEz6pInQYAjvZjJ9ZLifFYzhpgv3JAUEH0IGTJSFp8n6vq8Ef~sN2LKi1XaUrcM50F6Yh8S9oHBQNZOnmTWENXYTtSc8WaeF71viXwHacphN9YXp-lFHWR0xRkw8CMxESPNWwwfu6FoOHPjUt1biajvS7NdrbASf5ZsQ8Sues44FJqN1BJE-YnqIoKOhuw__",
  },
  {
    title: "Personalized Dashboard",
    description:
      "Track your progress and manage upcoming tasks with an intuitive planner.",
    icon: "https://media-hosting.imagekit.io/23c58a4ecfd84b69/image%20105.png?Expires=1840897655&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=FRGXmc4ZSt0UU9cHfR-wmYm1F1y89FMDjISEVxHTGTXRvFOiMj8gNO0unnPDJhn4Du7B035V6j4mZW70widJZ~wtQfRArduxyRPVmMFm9WCHC2hyr7wB1K550xvgZ252bqByBbJL~O12~CgJ4WiClHALyFV14nUhK9Kowyp~FfwCUJlKVYHMyc3e~xYadsRqsLvSIQm3f-Sjc2XwQBqBto0Ou1aoyofWoo1zxKDGeHFD0~L~H-bJlGGcDxY-IW5Vj3~cBpyNN538PjrfDo9kS-bzwRqxIOpRNjO4DYWyeZROVTTzlCpgCrMl45aaISuGKy9IK5pMyIkoVvRIoogLbw__",
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
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition duration-300 min-h-[300px] flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <img src={feature.icon} alt={feature.title} className="w-8 h-8 object-contain" />
                </div>
                <h3 className="text-lg font-semibold text-purple-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 text-center text-sm text-gray-500">
          &copy; 2025 ABIV. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
