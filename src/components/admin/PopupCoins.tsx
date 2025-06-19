// components/ui/InstitutionCreationPopup.tsx
'use client';

import { setCookie } from 'cookies-next'; // Import setCookie
import { useRouter } from 'next/navigation'; // For optional refresh

export default function InstitutionCreationPopup() {
  const router = useRouter();

  const handleStartLearning = () => {
    // Set a cookie to indicate that the popup has been shown
    setCookie('institution_created_popup_shown', 'true', {
      maxAge: 60 * 60 * 24 * 365, // Expires in 1 year (adjust as needed)
      path: '/', // Make the cookie available across the entire site
      // httpOnly: false, // Must be false for client-side JS to set it
      // secure: process.env.NODE_ENV === 'production', // Recommended in production
      // sameSite: 'Lax', // Recommended for security
    });

    // Optionally, force a refresh to immediately re-evaluate the server component logic
    // This will make the popup disappear immediately upon click and not just on next full page load.
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md">
  {/* Solid blue outline */}
  <div className="border-2 border-blue-500 rounded-3xl">
    {/* Card - now with bg-white class */}
    <div className="w-[85vw] max-w-[420px] rounded-3xl p-10 text-center shadow-2xl bg-white">
      {/* Heading */}
      <h2 className="text-[#3A1078] font-bold mb-3 text-4xl drop-shadow-sm">
        Unlocked Credits
      </h2>

      {/* 100 + coin */}
      <div className="flex items-center justify-center gap-2 mb-2 text-[48px] font-bold text-[#FFB300]">
        {/* Using 100coins.png as per your image. Ensure the file exists in your public folder. */}
        <img src="/100coins.png" alt="coins" className="h-20 align-middle" />
      </div>

      {/* FREE label */}
      <div className="mb-8 text-[28px] font-bold text-[#3A1078]">FREE</div>

      {/* CTA button */}
      <button
        className="w-full rounded-xl bg-gradient-to-r from-[#4f7dff] to-[#6d35ff] py-3 text-lg font-semibold text-white shadow-md transition-transform duration-150 hover:scale-105"
        // Assuming handleStartLearning is defined in your component
        onClick={handleStartLearning}
      >
        Start Learning With AI Classroom
      </button>
    </div>
  </div>
</div>
  );
}