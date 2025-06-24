"use client";
import {useState, useCallback, useEffect, useRef} from 'react';
import {format, isValid, addDays, differenceInCalendarDays} from 'date-fns';
import {DayPicker} from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import {TimePicker} from '@mui/x-date-pickers/TimePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, {Dayjs} from 'dayjs';
import axios from 'axios';
import {useRouter} from 'next/navigation';
import {TbArrowBackUp} from "react-icons/tb";
import type {ChangeEvent} from 'react';

// Custom styles for mobile date picker
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

const SetSchedule = () => {
  const [user, setUser] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('user-data');
      return data ? JSON.parse(data) : null;
    }
    return null;
  });
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [daysCount, setDaysCount] = useState<number>(1);
  const [hoursCount, setHoursCount] = useState<number>(2);
  const [startTime, setStartTime] = useState<Dayjs>(dayjs());
  const [selectedDays, setSelectedDays] = useState<Record<string, boolean>>({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  });
  const [selectedSecondDays, setSelectedSecondDays] = useState<Record<string, boolean>>({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [whatsappNotify, setWhatsappNotify] = useState<boolean>(true);
  const startDatePickerRef = useRef<HTMLDivElement>(null);
  const endDatePickerRef = useRef<HTMLDivElement>(null);


  // Day picker handler functions
  const handleStartDateSelect = (day: Date | undefined) => {
    // Prevent setting undefined/null dates - keep current date if day is undefined
    if (day && isValid(day)) {
      setStartDate(day);
      setEndDate(addDays(day, daysCount - 1));
    }
    setShowStartDatePicker(false);
  };

  const handleEndDateSelect = (day: Date | undefined) => {
    // Prevent setting undefined/null dates - keep current date if day is undefined
    if (day && isValid(day)) {
      setEndDate(day);
      setDaysCount(differenceInCalendarDays(day, startDate) + 1);
    }
    setShowEndDatePicker(false);
  };

  const handleTimeChange = (newTime: Dayjs | null) => {
    if (newTime) setStartTime(newTime);
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

  const toggleDay = (
    day: string,
    setFunction: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  ) => {
    setFunction((prev: Record<string, boolean>) => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const selectAllDays = (
    setFunction: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  ) => {
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

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
    }
  };


  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setUserId(parsedUserData.teacherId);
      } catch (err) {
        console.error("Error parsing user data from localStorage", err);
      }
    }
  }, []);

  // useEffect(() => {
  //     const data = JSON.parse(localStorage.getItem("airf"));
  //     console.log(data);
  //     console.log("searchPrompt from local storage", data.searchPrompt);
  //     console.log("specifications from local storage", data.specifications);
  //     console.log("language from local storage", data.language);
  //     console.log("uploadedFileName from local storage", data.uploadedFileName);
  //     console.log("manualEntryText from local storage", data.manualEntryText);

  // }, []);

  // Click outside handler to close date pickers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (startDatePickerRef.current && !startDatePickerRef.current.contains(event.target as Node)) {
        setShowStartDatePicker(false);
      }
      if (endDatePickerRef.current && !endDatePickerRef.current.contains(event.target as Node)) {
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


  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dataToSend');
      if (localStorage.getItem("premiumTopicId") !== null) {
        const topicId = localStorage.getItem("premiumTopicId");
        const dataToSend = {
          "topicId": topicId,
          "userId": userId,
          "planner": {
            "language": selectedLanguage === "English" ? "en" : "hi",
          }
        };
        localStorage.removeItem('videoSectionChatMessages');
        localStorage.setItem("dataToSend", JSON.stringify(dataToSend));
      } else {
        const Airfdata = JSON.parse(localStorage.getItem("airf") || '{}');
        const dataForBreakdown = {
          "wbStrId": null,
          "shouldDoPostReq": true,
        };
        localStorage.setItem("dataForBreakdown", JSON.stringify(dataForBreakdown));
        const dataToSend = {
          "userId": userId,
          "planner": {
            "promptTopic": Airfdata.searchPrompt ? Airfdata.searchPrompt : Airfdata.specifications,
            "language": Airfdata.language === "English" ? "en" : "hi",
            "manualEntryText": Airfdata.manualEntryText ? Airfdata.manualEntryText : Airfdata.uploadedFileName,
            "pdfLink": Airfdata.pdfUrl,
            "planPurpose": Airfdata.purpose ? Airfdata.purpose : "Study Plan",
          }
        };
        localStorage.removeItem('videoSectionChatMessages');
        localStorage.setItem("dataToSend", JSON.stringify(dataToSend));
      }
      router.push("/t/smart-resources/structure-breakdown");
    }
  };

  const handleProceed = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dataToSend');
      if (localStorage.getItem("premiumTopicId") !== null) {
        const topicId = localStorage.getItem("premiumTopicId");
        const selectedDaysArray = Object.entries(selectedDays)
        .filter(([_, isSelected]) => isSelected)
        .map(([day]) => day);
        const selectedSecondDaysArray = Object.entries(selectedSecondDays)
        .filter(([_, isSelected]) => isSelected)
        .map(([day]) => day);
        const combinedDateTime = new Date(startDate);
        combinedDateTime.setHours(startTime.hour());
        combinedDateTime.setMinutes(startTime.minute());
        combinedDateTime.setSeconds(startTime.second());
        setStartDate(combinedDateTime);
        const formattedStartDate = combinedDateTime.toISOString();
        const dataToSend = {
          "topicId": topicId,
          "userId": userId,
          "receiveReminder": whatsappNotify,
          "planner": {
            "startDate": formattedStartDate,
            "noOfDays": daysCount,
            "language": selectedLanguage === "English" ? "en" : "hi",
            "selectedDays": selectedDaysArray,
          }
        };
        localStorage.removeItem('videoSectionChatMessages');
        localStorage.setItem("dataToSend", JSON.stringify(dataToSend));
      } else {
        const dataForBreakdown = {
          "wbStrId": null,
          "shouldDoPostReq": true
        };
        localStorage.setItem("dataForBreakdown", JSON.stringify(dataForBreakdown));
        localStorage.removeItem('videoSectionChatMessages');
        const selectedDaysArray = Object.entries(selectedDays)
        .filter(([_, isSelected]) => isSelected)
        .map(([day]) => day);
        const selectedSecondDaysArray = Object.entries(selectedSecondDays)
        .filter(([_, isSelected]) => isSelected)
        .map(([day]) => day);
        const Airfdata = JSON.parse(localStorage.getItem("airf") || '{}');
        const combinedDateTime = new Date(startDate);
        combinedDateTime.setHours(startTime.hour());
        combinedDateTime.setMinutes(startTime.minute());
        combinedDateTime.setSeconds(startTime.second());
        setStartDate(combinedDateTime);
        const formattedStartDate = combinedDateTime.toISOString();
        const dataToSend = {
          "userId": userId,
          "receiveReminder": whatsappNotify,
          "planner": {
            "promptTopic": Airfdata.searchPrompt ? Airfdata.searchPrompt : Airfdata.specifications,
            "startDate": formattedStartDate,
            "noOfDays": daysCount,
            "language": Airfdata.language === "English" ? "en" : "hi",
            "selectedDays": selectedDaysArray,
            "manualEntryText": Airfdata.manualEntryText ? Airfdata.manualEntryText : Airfdata.uploadedFileName,
            "pdfLink": Airfdata.pdfUrl,
            "planPurpose": Airfdata.purpose ? Airfdata.purpose : "Study Plan",
          }
        };
        localStorage.setItem("dataToSend", JSON.stringify(dataToSend));
      }
      router.push("/t/smart-resources/structure-breakdown");
    }
  };

  const translator = (word1: string, word2: string) =>
    typeof window !== 'undefined' && localStorage.getItem("lang") && localStorage.getItem("lang")!.toLowerCase().includes("english")
      ? word1
      : localStorage.getItem("lang")
        ? word2
        : word1;

  return (
    <div className="w-full min-h-screen bg-[#F9FAFC] flex items-center justify-center py-2 px-2 sm:py-6 sm:px-4">
      {/* Inject mobile-specific styles */}
      <style dangerouslySetInnerHTML={{__html: mobilePickerStyles}}/>
      <div
        className="w-full max-w-[1200px] bg-white rounded-2xl shadow-lg overflow-hidden border pb-[100px] border-gray-100 relative"
      >

        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-[#A78BFA] to-[#818CF8] p-4 sm:p-6 text-white">
          <div className='flex gap-4 '>
            <button className=" text-white opacity-80 hover:opacity-100 z-10"
                    onClick={() => router.back()}
            >
              <TbArrowBackUp className="w-6 h-6"/>
            </button>
            <div>
              <h1
                className="text-xl sm:text-2xl font-semibold pr-8">{translator("Set Your Study Timeline", "अपना अध्ययन टाइमलाइन सेट करें")}</h1>
              <p
                className="text-xs sm:text-sm opacity-90 mt-1 pr-8">{translator("Design your schedule that suits your needs", "अपने जरूरतों के अनुसार अपना अध्ययन टाइमलाइन डिजाइन करें")}</p>
            </div>
          </div>
        </div>
        <div className="">
          {/* Main content */}
          <div className="p-4 sm:p-6">
            <h2
              className="text-base sm:text-lg font-medium text-[#1E1E2F] mb-4">{translator("Set your Schedule Timeline", "अपना अध्ययन टाइमलाइन सेट करें")}</h2>

            {/* Date selection with inline "To" */}
            <div
              className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6 sm:justify-between">
              <div className="w-full sm:w-[230px] relative">
                <label
                  className="block text-xs font-medium text-gray-600 mb-1">{translator("Start date of your course", "अपने पाठ्यक्रम की प्रारंभ तिथि")}</label>
                <div
                  className="relative cursor-pointer w-full sm:w-[203px]"
                  onClick={() => {
                    setShowStartDatePicker(true);
                  }}
                  ref={startDatePickerRef}
                >
                  <div
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-indigo-500 flex justify-between items-center">
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
                    <div
                      className="absolute z-10 w-[calc(100vw-2rem)] max-w-[300px] sm:w-[300px] bg-white shadow-lg rounded-lg border border-gray-200 mt-1 left-0 sm:left-auto">
                      <DayPicker
                        mode="single"
                        selected={startDate}
                        onSelect={handleStartDateSelect}
                        required={false}
                        className="p-2"
                        disabled={[{before: new Date()}]}
                        styles={{
                          root: {fontSize: '14px'},
                          table: {width: '100%', maxWidth: '100%'},
                          cell: {padding: '4px', textAlign: 'center'},
                          day: {width: '32px', height: '32px', fontSize: '12px'}
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="hidden sm:flex items-center justify-center mt-6 w-[50%]">
                <div className="flex-grow h-px bg-gray-300"></div>
                {/* <span className="text-gray-400 mx-4">{translator("OR", "या")}</span> */}
                <div className="flex-grow h-px bg-gray-300"></div>
              </div>

              <div className="w-full sm:w-auto">
                <label
                  className="block text-xs font-medium text-gray-600 mb-1">{translator("Choose No of Days", "कितने दिन चुनें")}</label>
                <div
                  className="flex rounded-lg overflow-hidden border border-gray-300 w-full sm:w-auto">
                  <button
                    onClick={decrementDays}
                    className="w-10 h-9 bg-gray-100 flex items-center justify-center text-lg font-medium hover:bg-gray-200"
                  >
                    -
                  </button>
                  <div
                    className="w-10 h-9 border-l border-r border-gray-300 flex items-center justify-center text-base font-medium">
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
                {/* <span className="text-gray-400 mx-4">{translator("To", "तक")}</span> */}
                <div className="w-[100%] h-[2px] bg-gray-300"></div>
              </div>

              <div className="w-full sm:w-[230px] relative">
                <label
                  className="block text-xs font-medium text-gray-600 mb-1 ">{translator("Approximate Finish date", "अनुमानित समाप्ति तिथि")}</label>
                <div
                  className="relative cursor-pointer w-full sm:w-[203px]"
                  onClick={() => {
                    setShowEndDatePicker(true);
                  }}
                  ref={endDatePickerRef}
                >
                  <div
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-indigo-500 flex justify-between items-center">
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
                    <div
                      className="absolute z-10 bg-white shadow-lg rounded-lg border border-gray-200 mt-1 right-0 sm:right-0 w-[calc(100vw-2rem)] max-w-[300px] sm:w-[300px] sm:left-auto left-0">
                      <DayPicker
                        mode="single"
                        selected={endDate}
                        onSelect={handleEndDateSelect}
                        required={false}
                        className="p-2"
                        disabled={[{before: startDate}]}
                        styles={{
                          root: {fontSize: '14px'},
                          table: {width: '100%', maxWidth: '100%'},
                          cell: {padding: '4px', textAlign: 'center'},
                          day: {width: '32px', height: '32px', fontSize: '12px'}
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>


            </div>

            {/* First Row: Hours + Select Days */}
            <div className="flex flex-col lg:flex-row gap-6 mt-2">
              <div className="w-full lg:w-1/2">
                <h3
                  className="text-base sm:text-lg font-medium text-[#1E1E2F] mb-3">{translator("At What Time You Prefer to Start ?", "आप किस समय पर शुरू करना चाहते हैं?")}</h3>

                <div>
                  <label
                    className="block text-xs font-medium text-gray-600 mb-1">{translator("Choose Start Time", "शुरू करने का समय चुनें")}</label>
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
                  <h3
                    className="text-sm sm:text-base font-medium">{translator("Select your Study Days", "अपनी अध्ययन के दिन चुनें")}</h3>
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

            {/* want to get notified on whatsapp */}
            <div>
              <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <input type="checkbox" name="whatsappNotify" checked={whatsappNotify}
                       onChange={() => setWhatsappNotify(!whatsappNotify)}/>
                Notify me on WhatsApp
              </label>
            </div>

            {localStorage.getItem("premiumTopicId") !== null &&
              (
                < div className="flex flex-col lg:flex-row gap-6 mt-4">
                  <div className="flex flex-col space-x-2">
                    <label htmlFor="language-select"
                           className="text-lg text-left mb-2 font-semibold text-gray-800">
                      {translator("Choose Your Preferred Language", "अपनी पसंदीदा भाषा चुनें")}{" "}
                      {/* <span className="text-gray-400 font-normal">
                                        {translator("(if any)", "(यदि कोई हो)")}
                                    </span> */}
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
                      {/* <option value="" disabled>{translator("Select Language", "भाषा चुनें")}</option> */}
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      {/* <option value="Hinglish">Hinglish</option> */}
                    </select>
                  </div>
                </div>
              )
            }
            {/* Horizontal divider with OR */}
            {/* <div className="flex items-center my-6">
                        <div className="flex-grow h-[2px] bg-[#7560FF]"></div>
                        <span className="px-4 text-sm text-gray-500">{translator("OR", "या")}</span>
                        <div className="flex-grow h-[2px] bg-[#7560FF]"></div>
                    </div> */}

            {/* Second Row: CSV Upload + Select Days */}
            {/* <div className="flex gap-6">
                        <div className="w-1/2">
                            <div>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-medium">{translator("Upload CSV File", "CSV फाइल अपलोड करें")}</h3>
                                    <label htmlFor="csv-upload" className="text-blue-600 transition-all duration-300 hover:scale-110 hover:text-indigo-700 cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="7 10 12 15 17 10"></polyline>
                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                        </svg>
                                    </label>
                                    <input
                                        type="file"
                                        id="csv-upload"
                                        accept=".csv"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                </div>
                                <button className="text-gray-500 text-xs hover:underline hover:text-indigo-600 transition-colors duration-300">Download Format</button>

                                {csvFile ? (
                                    <div className="mt-2 bg-gray-50 rounded-lg p-3 flex items-center">
                                        <div className="w-6 h-6 text-red-600 mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                <polyline points="14 2 14 8 20 8"></polyline>
                                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                                <polyline points="10 9 9 9 8 9"></polyline>
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium">{csvFile.name}</h4>
                                            <span className="text-gray-500 text-xs">{(csvFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-2 bg-gray-50 rounded-lg p-3 flex items-center border border-dashed border-gray-300">
                                        <p className="text-gray-500 text-sm text-center w-full">{translator("No file selected", "कोई फाइल चुनी नहीं गई")}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="w-1/2">
                            <h3 className="text-lg font-medium text-[#1E1E2F] mb-3">{translator("At What Time You Prefer to Start ?", "आप किस समय पर शुरू करना चाहते हैं?")}</h3>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">{translator("Choose Start Time", "शुरू करने का समय चुनें")}</label>
                                <div className="w-[250px]">
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
                    </div> */}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 pt-4">

              <button
                className="hidden sm:block py-3 px-6 rounded-lg text-base font-medium transition-all duration-300">
              </button>

              <button
                onClick={handleProceed}
                className="py-3 px-4 sm:px-6 bg-gradient-to-r from-[#6BA0FF] to-[#755BFF] text-white rounded-lg text-sm sm:text-base font-semibold relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] before:absolute before:content-[''] before:top-0 before:left-0 before:w-full before:h-full before:bg-white/20 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500 order-1 sm:order-2"
              >
                {translator("Proceed With Study Plan", "अध्ययन योजना के साथ जारी रखें")}
              </button>

              <button
                onClick={handleSkip}
                className="py-3 px-4 sm:px-6 bg-white border border-gray-300 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 hover:bg-gray-50 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] order-2 sm:order-3">
                {translator("Skip", "छोड़ें")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetSchedule;

