"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import axios from "axios";
// Lucide Icons
import {
  BookOpenCheck,
  Users2,
  GraduationCap,
  Mail,
  CalendarCheck2,
  Bell,
  Menu,
  X,
  RotateCw,
  Monitor,
  User,
  IndianRupeeIcon,
} from "lucide-react";

interface AdminSidebarProps {
  id: string;
  userId: string;
  logo: string | null;
  name: string;
  primaryColor: string;
  verified: boolean;
  coins?: number;
}

const navItems = [
  {
    name: "Teacher Management",
    href: "/a/teachers",
    icon: <Users2 size={18} />,
  },
  {
    name: "Class Management",
    href: "/a/classes",
    icon: <BookOpenCheck size={18} />,
  },
  {
    name: "Student Management",
    href: "/a/students",
    icon: <GraduationCap size={18} />,
  },
  {
    name: "Attendance Management",
    href: "/a/attendance",
    icon: <CalendarCheck2 size={18} />,
  },
  {
    name: "Fees Management",
    href: "/a/fees",
    icon: <IndianRupeeIcon size={18} />,
  },
  {
    name: "Cost Management",
    href: "/a/costs",
    icon: <Bell size={18} />,
  },
  {
    name: "Notice Management",
    href: "/a/notices",
    icon: <Mail size={18} />,
  },
];

const AdminSidebar = ({
  id,
  userId,
  logo,
  name,
  primaryColor,
  verified,
  coins,
}: AdminSidebarProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showOrientationPopup, setShowOrientationPopup] = useState(false);
  const hasShownPopup = useRef(false);
  const pathname = usePathname();
  const [color, setColor] = useState<string>(primaryColor);
  const [feesAvailable, setFeesAvailable] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem("primaryColor", primaryColor);
    const temp = localStorage.getItem("primaryColor");
    if (temp) {
      setColor(temp);
    }
  }, [primaryColor]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) return;
    const data = JSON.parse(user as string);

    const checkFeesAvailability = async () => {
      try {
        const response = await axios.get(
          `/api/payment/create-fee-account?institutionId=${data.institutionId}`
        );
        if (response.data.id) {
          setFeesAvailable(true);
        } else {
          setFeesAvailable(false);
        }
      } catch (error) {
        console.error("Error fetching fees availability:", error);
      }
    };

    checkFeesAvailability();
  }, []);

  useEffect(() => {
    localStorage.setItem("verified", JSON.stringify(verified));
    if (typeof window !== "undefined") {
      const checkMobile = () => window.innerWidth < 768;
      const checkPortrait = () => window.innerHeight > window.innerWidth;

      const handleResize = () => {
        const mobile = checkMobile();
        const portrait = checkPortrait();

        setIsMobileView(mobile);

        if (mobile && portrait && !hasShownPopup.current) {
          setShowOrientationPopup(true);
          hasShownPopup.current = true;
        } else if (!mobile || !portrait) {
          setShowOrientationPopup(false);
        }
      };

      handleResize();

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [verified]);

  const handleNavLinkClick = () => {
    if (isMobileView && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  const isLightColor = (hex: string) => {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance > 0.6;
  };

  const commonClasses =
    "flex items-center px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium group";
  const inactiveClasses = "text-gray-700 hover:bg-gray-100 hover:text-blue-600";

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobileView && !isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-[60] p-2 bg-blue-600 text-white rounded-md md:hidden shadow-lg"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Desktop Toggle Button */}
      {!isMobileView && !isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`fixed top-4 z-[60] p-2 bg-blue-600 text-white rounded-md shadow-lg transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "left-68" : "left-4"
          }`}
        >
          {!isSidebarOpen && <Menu size={24} />}
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-xl border-r border-gray-200 z-[55] transition-transform duration-300 ease-in-out flex flex-col justify-between 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          w-64`}
      >
        <div className="p-5">
          {/* Logo */}
          <div className="flex items-center mb-8 justify-between">
            <Image
              src={logo ? logo : "/logo.png"}
              alt="Logo"
              width={logo ? 40 : 160}
              height={40}
              className="object-contain"
            />
            {logo && (
              <span className="text-base font-semibold text-gray-800 ml-2 whitespace-normal break-words max-w-[8rem] leading-tight">
                {name}
              </span>
            )}
            {isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <X size={24} />
              </button>
            )}
          </div>

          {/* Nav Items */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + "/");

              const activeTextClass = isLightColor(color)
                ? "text-black"
                : "text-white";
              const activeBgStyle = { backgroundColor: color };
              const activeIconClass = isLightColor(color)
                ? "text-black"
                : "text-white";

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavLinkClick}
                  className={`${commonClasses} ${
                    isActive ? "shadow-md" : inactiveClasses
                  }`}
                  style={isActive ? activeBgStyle : undefined}
                >
                  <span
                    className={`mr-3 ${
                      isActive
                        ? activeIconClass
                        : "text-gray-500 group-hover:text-blue-600"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className={isActive ? activeTextClass : ""}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col justify-center">
          <div className="p-5 border-t border-gray-200">
            {verified ? (
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Coins:</span>
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-blue-600">
                    {coins}
                  </span>
                  <img src="/coin.png" alt="coin" className="h-6 ml-1" />
                </div>
              </div>
            ) : (
              <div className="p-4 border rounded-lg bg-white max-w-xs shadow">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-600">Coins:</span>
                  <span className="text-lg font-semibold text-red-600">
                    Not Verified
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">
                    Please wait for verification to earn coins.
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="mb-8 p-3">
            <Link
              href="/a/dashboard"
              className="flex items-center w-full px-4 py-2.5 rounded-lg transition-colors duration-100 text-gray-500 bg-gray-100 hover:bg-gray-200"
            >
              <span className="flex items-center justify-center w-6 h-6">
                <User size={20} />
              </span>
              <span className="ml-4 font-medium">My Profile</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Orientation Popup */}
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
};

export default AdminSidebar;
