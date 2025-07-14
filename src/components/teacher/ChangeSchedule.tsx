// components/ChangeScheduleContent.jsx (or wherever you prefer to put it)
"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { format, isValid, addDays, differenceInCalendarDays } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import { TbArrowBackUp } from "react-icons/tb";
import { useRouter, useSearchParams } from 'next/navigation';

// Custom styles for mobile date picker (keep this as is)
const mobilePickerStyles = `
  .rdp {
    margin: 0;
    font-size: 14px;
  }
  .rdp-table {
    width: 100% !important;
    max-width: 100% !important;
  }
  .rdp-cell {
    padding: 2px !important;
    width: calc(100% / 7) !important;
    max-width: calc(100% / 7) !important;
  }
  .rdp-day {
    width: 28px !important;
    height: 28px !important;
    font-size: 12px !important;
    margin: 0 auto;
  }
  .rdp-head_cell {
    padding: 4px 2px !important;
    font-size: 11px !important;
    width: calc(100% / 7) !important;
  }
  @media (max-width: 640px) {
    .rdp-day {
      width: 24px !important;
      height: 24px !important;
      font-size: 11px !important;
    }
    .rdp-head_cell {
      font-size: 10px !important;
    }
  }
`;

const ChangeScheduleContent = () => {
  const [user, setUser] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [userId, setUserId] = useState(null);
  const router = useRouter();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [daysCount, setDaysCount] = useState(1);
  const [hoursCount, setHoursCount] = useState(2);
  const [startTime, setStartTime] = useState(dayjs());
  const [selectedDays, setSelectedDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  });
  const [selectedSecondDays, setSelectedSecondDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [whatsappNotify, setWhatsappNotify] = useState(true);

  const [isPremiumTopic, setIsPremiumTopic] = useState(false);
  const [currentLang, setCurrentLang] = useState('english');

  // Refs for click outside detection
  const startDatePickerRef = useRef(null);
  const endDatePickerRef = useRef(null);

  // This is the hook that needs Suspense
  const searchParams = useSearchParams();
  const resourceId = searchParams.get('resourceId'); // This line caused the error

  // Day picker handler functions
  const handleStartDateSelect = (day) => {
    if (day && isValid(day)) {
      setStartDate(day);
      setEndDate(addDays(day, daysCount - 1));
    }
    setShowStartDatePicker(false);
  };

  const handleEndDateSelect = (day) => {
    if (day && isValid(day)) {
      setEndDate(day);
      setDaysCount(differenceInCalendarDays(day, startDate) + 1);
    }
    setShowEndDatePicker(false);
  };

  const handleTimeChange = (newTime) => {
    setStartTime(newTime);
  };

  const toggleStartDatePicker = () => {
    setShowStartDatePicker(!showStartDatePicker);
    if (showEndDatePicker) setShowEndDatePicker(false);
  };

  const toggleEndDatePicker = () => {
    setShowEndDatePicker(!showEndDatePicker);
    if (showStartDatePicker) setShowStartDatePicker(false);
  };

  const incrementDays = () => {
    setDaysCount(prev => {
      const newCount = Math.min(prev + 1, 30);
      setEndDate(addDays(startDate, newCount - 1));
      return newCount;
    });
  };

  const decrementDays = () => {
    setDaysCount(prev => {
      const newCount = Math.max(prev - 1, 1);
      setEndDate(addDays(startDate, newCount - 1));
      return newCount;
    });
  };

  const incrementHours = () => {
    setHoursCount(prev => Math.min(prev + 1, 12));
  };

  const decrementHours = () => {
    setHoursCount(prev => Math.max(prev - 1, 1));
  };

  const toggleDay = (day, setFunction) => {
    setFunction(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const selectAllDays = (setFunction) => {
    setFunction({
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const data = localStorage.getItem('user-data');
    if (data) {
      setUser(JSON.parse(data));
    }

    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setUserId(parsedUserData.teacherId);
      } catch (err) {
        console.error("Error parsing user data from localStorage", err);
      }
    }

    const lang = localStorage.getItem("lang");
    if (lang) {
      setCurrentLang(lang.toLowerCase());
    }

    if (localStorage.getItem("premiumTopicId") !== null) {
      setIsPremiumTopic(true);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (startDatePickerRef.current && !startDatePickerRef.current.contains(event.target)) {
        setShowStartDatePicker(false);
      }
      if (endDatePickerRef.current && !endDatePickerRef.current.contains(event.target)) {
        setShowEndDatePicker(false);
      }
    };

    if (showStartDatePicker || showEndDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showStartDatePicker, showEndDatePicker]);

  const handleProceed = async () => {
    console.log("Resource id: ", resourceId); // resourceId is now safe to use here
    if (resourceId) {
      const selectedDaysArray = Object.entries(selectedDays)
        .filter(([_, isSelected]) => isSelected)
        .map(([day]) => day);

      const combinedDateTime = new Date(startDate);
      combinedDateTime.setHours(startTime.hour());
      combinedDateTime.setMinutes(startTime.minute());
      combinedDateTime.setSeconds(startTime.second());
      const formattedStartDate = combinedDateTime.toISOString();

      const payload = {
        wbStrId: resourceId,
        startDate: formattedStartDate,
        noOfDays: daysCount,
        userId: userId || user?.userId,
        selectedDays: selectedDaysArray
      };

      const dataForBreakdown = {
        "wbStrId": resourceId,
        "shouldDoPostReq": false,
      };
      localStorage.setItem("dataForBreakdown", JSON.stringify(dataForBreakdown));
      localStorage.setItem("wbStrId2", resourceId);

      console.log("Payload: ", payload);

      //coin logic
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const instituteId = userData?.institutionId;

        console.log('instituteid --- ', instituteId);
        try {
          const instResponse = await axios.get(`/api/institutions/${instituteId}/getadmin`);
          console.log('instResponse ---', instResponse);
          console.log('instResponse id ---', instResponse?.data?.id);

          const coinRes = await axios.get(`/api/coins/${instResponse?.data?.id}`);
          console.log('coinRes ---', coinRes);

          let coinsToDeduct = 3;

          if (coinRes.data.coins < coinsToDeduct) {
            alert('Institute dosenot have enough Coins! Please Contact Institute Admin.');
            return;
          }

          const resul1 = await axios.post(`/api/coins/${instResponse?.data?.id}?coins=${coinsToDeduct}`, null, {
            headers: {
              "Content-Type": "application/json"
            }
          });

          const coinRes2 = await axios.get(`/api/coins/${instResponse?.data?.id}`);
          console.log('coinRes ---', coinRes2);

        } catch (err) {
          console.log(err);
        }
      }


      try {
        await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_1_SERVER_URL}/planner/rescheduleStudyPlan`, payload);
        router.replace("/t/smart-resources/structure-breakdown");
      } catch (err) {
        console.error('Failed to update schedule', err);
      }
    }
  };

  const translator = useCallback((word1, word2) => {
    return currentLang.includes("english") ? word1 : word2;
  }, [currentLang]);

  return (
    <div className="w-full min-h-screen bg-[#F9FAFC] flex items-center justify-center py-2 px-2 sm:py-6 sm:px-4">
      <style dangerouslySetInnerHTML={{ __html: mobilePickerStyles }} />
      <div className="w-full max-w-[1200px] bg-white rounded-2xl shadow-lg overflow-hidden border pb-[100px] border-gray-100 relative">
        <div className="bg-gradient-to-r from-[#A78BFA] to-[#818CF8] p-4 sm:p-6 text-white">
          <div className='flex gap-4 '>
            <button className=" text-white opacity-80 hover:opacity-100 z-10"
              onClick={() => {
                window.history.back()
              }}
            >
              <TbArrowBackUp className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold pr-8">{translator("Set Your Study Timeline", "अपना अध्ययन टाइमलाइन सेट करें")}</h1>
              <p className="text-xs sm:text-sm opacity-90 mt-1 pr-8">{translator("Design your schedule that suits your needs", "अपने जरूरतों के अनुसार अपना अध्ययन टाइमलाइन डिजाइन करें")}</p>
            </div>
          </div>
        </div>
        <div className="">
          <div className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-medium text-[#1E1E2F] mb-4">{translator("Set your Schedule Timeline", "अपना अध्ययन टाइमलाइन सेट करें")}</h2>

            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6 sm:justify-between">
              <div className="w-full sm:w-[230px] relative">
                <label className="block text-xs font-medium text-gray-600 mb-1">{translator("Start date of your course", "अपने पाठ्यक्रम की प्रारंभ तिथि")}</label>
                <div
                  className="relative cursor-pointer w-full sm:w-[203px]"
                  onClick={() => { setShowStartDatePicker(true); }}
                  ref={startDatePickerRef}
                >
                  <div className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-indigo-500 flex justify-between items-center">
                    <span>{startDate && isValid(startDate) ? format(startDate, 'yyyy-MM-dd') : 'Select Date'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                  {showStartDatePicker && (
                    <div className="absolute z-10 w-[calc(100vw-2rem)] max-w-[300px] sm:w-[300px] bg-white shadow-lg rounded-lg border border-gray-200 mt-1 left-0 sm:left-auto">
                      <DayPicker
                        mode="single"
                        selected={startDate}
                        onSelect={handleStartDateSelect}
                        className="p-2"
                        disabled={[{ before: new Date() }]}
                        styles={{
                          root: { fontSize: '14px' },
                          table: { width: '100%', maxWidth: '100%' },
                          cell: { padding: '4px', textAlign: 'center' },
                          day: { width: '32px', height: '32px', fontSize: '12px' }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="hidden sm:flex items-center justify-center mt-6 w-[50%]">
                <div className="flex-grow h-px bg-gray-300"></div>
                <div className="flex-grow h-px bg-gray-300"></div>
              </div>

              <div className="w-full sm:w-auto">
                <label className="block text-xs font-medium text-gray-600 mb-1">{translator("Choose No of Days", "कितने दिन चुनें")}</label>
                <div className="flex rounded-lg overflow-hidden border border-gray-300 w-full sm:w-auto">
                  <button
                    onClick={decrementDays}
                    className="w-10 h-9 bg-gray-100 flex items-center justify-center text-lg font-medium hover:bg-gray-200"
                  >
                    -
                  </button>
                  <div className="w-10 h-9 border-l border-r border-gray-300 flex items-center justify-center text-base font-medium">
                    {daysCount}
                  </div>
                  <button
                    onClick={incrementDays}
                    className="w-10 h-9 bg-gray-100 flex items-center justify-center text-lg font-medium hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="hidden sm:flex items-center justify-center mt-6 w-[50%]">
                <div className="w-[100%] h-[2px] bg-gray-300"></div>
                <div className="w-[100%] h-[2px] bg-gray-300"></div>
              </div>

              <div className="w-full sm:w-[230px] relative">
                <label className="block text-xs font-medium text-gray-600 mb-1 ">{translator("Approximate Finish date", "अनुमानित समाप्ति तिथि")}</label>
                <div
                  className="relative cursor-pointer w-full sm:w-[203px]"
                  onClick={() => { setShowEndDatePicker(true); }}
                  ref={endDatePickerRef}
                >
                  <div className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-indigo-500 flex justify-between items-center">
                    <span>{endDate && isValid(endDate) ? format(endDate, 'yyyy-MM-dd') : 'Select Date'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                  {showEndDatePicker && (
                    <div className="absolute z-10 bg-white shadow-lg rounded-lg border border-gray-200 mt-1 right-0 sm:right-0 w-[calc(100vw-2rem)] max-w-[300px] sm:w-[300px] sm:left-auto left-0">
                      <DayPicker
                        mode="single"
                        selected={endDate}
                        onSelect={handleEndDateSelect}
                        className="p-2"
                        disabled={[{ before: startDate }]}
                        styles={{
                          root: { fontSize: '14px' },
                          table: { width: '100%', maxWidth: '100%' },
                          cell: { padding: '4px', textAlign: 'center' },
                          day: { width: '32px', height: '32px', fontSize: '12px' }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 mt-2">
              <div className="w-full lg:w-1/2">
                <h3 className="text-base sm:text-lg font-medium text-[#1E1E2F] mb-3">{translator("At What Time You Prefer to Start ?", "आप किस समय पर शुरू करना चाहते हैं?")}</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{translator("Choose Start Time", "शुरू करने का समय चुनें")}</label>
                  <div className="w-full sm:w-[250px]">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                        value={startTime}
                        onChange={handleTimeChange}
                        format="hh:mm a"
                        ampm={true}
                        className="w-full"
                        slotProps={{
                          textField: {
                            variant: 'outlined',
                            size: 'small',
                            className: 'w-full',
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/2">
                <div className="flex items-center mb-3">
                  <h3 className="text-sm sm:text-base font-medium">{translator("Select your Study Days", "अपनी अध्ययन के दिन चुनें")}</h3>
                  <button
                    onClick={() => selectAllDays(setSelectedDays)}
                    className="text-xs text-gray-500 hover:underline ml-2 hover:text-indigo-600 transition-colors duration-300"
                  >
                    {translator("Select ALL", "सभी चुनें")}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                  {Object.keys(selectedDays).map((day) => (
                    <div
                      key={day}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        id={`day-${day}`}
                        checked={selectedDays[day]}
                        onChange={() => toggleDay(day, setSelectedDays)}
                        className="w-4 h-4 rounded border-2 accent-indigo-600 transition-transform duration-200 hover:scale-110"
                      />
                      <label htmlFor={`day-${day}`}
                        className="capitalize text-xs sm:text-sm cursor-pointer">
                        {translator(day,
                          day === "monday" ? "सोमवार" :
                            day === "tuesday" ? "मंगलवार" :
                              day === "wednesday" ? "बुधवार" :
                                day === "thursday" ? "गुरुवार" :
                                  day === "friday" ? "शुक्रवार" :
                                    day === "saturday" ? "शनिवार" :
                                      day === "sunday" ? "रविवार" :
                                        day
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {isPremiumTopic && (
              <div className="flex flex-col lg:flex-row gap-6 mt-4">
                <div className="flex flex-col space-x-2">
                  <label htmlFor="language-select"
                    className="text-lg text-left mb-2 font-semibold text-gray-800">
                    {translator("Choose Your Preferred Language", "अपनी पसंदीदा भाषा चुनें")}{" "}
                  </label>
                  <select
                    id="language-select"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full md:w-[250px] mt-2 md:mt-0 p-3 bg-white border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none pr-10"
                    style={{
                      backgroundImage: `url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'%3E%3C/path%3E%3C/svg%3E\")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1.5em 1.5em',
                    }}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-0 mt-6 pt-4">
              <button
                onClick={handleProceed}
                className="py-3 px-4 sm:px-6 bg-gradient-to-r from-[#6BA0FF] to-[#755BFF] text-white rounded-lg text-sm sm:text-base font-semibold relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] before:absolute before:content-[''] before:top-0 before:left-0 before:w-full before:h-full before:bg-white/20 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500 order-1 sm:order-2"
              >
                {translator("Proceed With Study Plan", "अध्ययन योजना के साथ जारी रखें")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default function ChangeSchedulePage() {
  return (
    <Suspense fallback={<div>Loading schedule...</div>}>
      <ChangeScheduleContent />
    </Suspense>
  );
}