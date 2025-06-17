'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react'; // Added useCallback
import Sidebar from './Sidebar'; // Adjust path as necessary (assuming this is the student sidebar)
// Lucide Icons for the popup
import { RotateCw, Monitor, X } from 'lucide-react';

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const [isMobileView, setIsMobileView] = useState(false); // State to track mobile view
  const [showOrientationPopup, setShowOrientationPopup] = useState(false); // State for the popup
  const hasShownPopup = useRef(false); // Ref to track if popup has been shown in current session

  // New state to track the sidebar's open/closed status from the Sidebar component
  // Initialize to true, matching the Sidebar's default open state for desktop
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Callback function to receive the isOpen state from Sidebar
  // Memoize this callback to prevent unnecessary re-renders in Sidebar
  const handleSidebarToggle = useCallback((isOpen: boolean) => {
    setIsSidebarOpen(isOpen);
  }, []);

  useEffect(() => {
    // Client-side execution check
    if (typeof window !== 'undefined') {
      const checkMobile = () => window.innerWidth < 768; // Tailwind's 'md' breakpoint
      const checkPortrait = () => window.innerHeight > window.innerWidth; // Check if in portrait mode

      const handleResize = () => {
        const mobile = checkMobile();
        const portrait = checkPortrait();

        setIsMobileView(mobile);

        // Show popup only if on mobile, in portrait, and hasn't been shown yet
        if (mobile && portrait && !hasShownPopup.current) {
          setShowOrientationPopup(true);
          hasShownPopup.current = true; // Mark as shown for this session
        } else if (!mobile || !portrait) {
          // Hide popup if not on mobile or not in portrait (e.g., landscape or desktop)
          setShowOrientationPopup(false);
        }
      };

      // Set initial state
      handleResize();

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []); // Empty dependency array means this runs once on mount and on unmount


  return (
    <>
      <head>
        <title>Student Dashboard</title> {/* Changed title to be more specific */}
      </head>
      <div className="min-h-screen bg-gray-100 flex">
        {/* Pass the handleSidebarToggle callback as a prop to Sidebar */}
        <Sidebar onSidebarToggle={handleSidebarToggle} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <main className="w-full p-6"> {/* Added p-6 for consistent padding */}
            {children}
          </main>
        </div>
      </div>

      {/* --- Orientation Popup --- */}
      {showOrientationPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
          <div className="relative bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center transform scale-100 animate-fade-in-up">
            <button
              onClick={() => setShowOrientationPopup(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close message"
            >
              <X size={24} />
            </button>

            <div className="mb-6">
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-4 rounded-full inline-flex justify-center items-center mb-4 shadow-md">
                <RotateCw size={36} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Optimal Viewing Experience
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                For the best experience, please rotate your device to{" "}
                <span className="font-semibold text-blue-700">
                  landscape mode
                </span>{" "}
                or use Desktop View.
              </p>
            </div>

            <div className="flex justify-center items-center space-x-4 text-gray-500 text-sm">
              <div className="flex flex-col items-center">
                <RotateCw size={24} className="mb-1 text-gray-400" />
                <span>Landscape</span>
              </div>
              <span>/</span>
              <div className="flex flex-col items-center">
                <Monitor size={24} className="mb-1 text-gray-400" />
                <span>Desktop View</span>
              </div>
            </div>

            <button
              onClick={() => setShowOrientationPopup(false)}
              className="mt-6 w-full py-3 px-4 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Got It!
            </button>
          </div>
        </div>
      )}

      {/* Add this style block for the popup animation */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}