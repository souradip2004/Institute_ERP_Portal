import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { IoCheckmark } from "react-icons/io5";
import { RiArrowGoBackFill } from "react-icons/ri";

// Types
interface Topic {
  topicId: string;
  dayNo: number;
  date?: string;
  topicName: string;
  notes: {
    normalNotes: any[];
    translatedNotes: any[];
  };
  completed: boolean;
  _id: string;
  video: any[];
  deadlinePassed?: boolean;
}

interface Score {
  title: number;
  notes: number;
  quiz: number;
}

interface Scores {
  [topicId: string]: Score;
}

const StructuredBreakdown: React.FC = () => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dayRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleProceed = () => {
    router.push("/mcq-quiz");
  };

  const [showAllDays, setShowAllDays] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<Topic[][]>([]);
  const [mainSchedule, setMainSchedule] = useState<any>(null);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [wbStrId, setWbStrId] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<string>("medium");
  const [hasDate, setHasDate] = useState(true);
  const [scrollToToday, setScrollToToday] = useState(false);
  const [scores, setScores] = useState<Scores>({});
  const [userVivaPreference, setUserVivaPreference] = useState<any>(null);
  const [initialPref, setInitialPref] = useState<{ topic: string; language: string }>({ topic: '', language: '' });

  const translator = (word1: string, word2: string) => {
    const lang = (typeof window !== 'undefined' && localStorage.getItem("lang")) || '';
    return lang.toLowerCase().includes("english") ? word1 : lang ? word2 : word1;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('userVivaPreference');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setInitialPref({
          topic: parsed.topic || '',
          language: parsed.language || ''
        });
        setUserVivaPreference(parsed);
        console.log('Loaded userVivaPreference from localStorage:', parsed);
      } catch {
        // ignore parse error
      }
    }
  }, []);

  // Fetch data from API
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dataToSendStr = localStorage.getItem("dataToSend");
    const dataToSend = dataToSendStr ? JSON.parse(dataToSendStr) : null;
    let response = null;
    const postData = async () => {
      let url = '';

      url = `${process.env.NEXT_PUBLIC_BACKEND_1_SERVER_URL}/planner/createStudyPlan`;

      const data = JSON.stringify(dataToSend);
      const headers = { 'Content-Type': 'application/json' };
      try {
        const dataForBreakdownStr = localStorage.getItem("dataForBreakdown");
        const dataForBreakdown = dataForBreakdownStr ? JSON.parse(dataForBreakdownStr) : {};
        console.log('dataToSend:', dataToSend);
        console.log('dataForBreakdown:', dataForBreakdown);
        if (dataForBreakdown.shouldDoPostReq === true) {
          response = await axios.post(url, data, { headers });
          console.log('POST response:', response);
        } else {
          const temp = localStorage.getItem("wbStrId2");
          console.log('Fetching planner ---');
          // const temp = '68434fe1b34cf89924855deb';
          const url2 = `${process.env.NEXT_PUBLIC_BACKEND_1_SERVER_URL}/planner/${temp}`;
          response = await axios.get(url2);
          console.log('GET response:', response);
        }

        setMainSchedule(response.data);
        setWbStrId(response.data.data._id);
        localStorage.setItem("dataForBreakdown", JSON.stringify({
          shouldDoPostReq: false,
          wbStrId: response.data.data._id
        }));
        localStorage.setItem("wbStrId2", response.data.data._id);
        if (response.data.data.workBreakdown[0][0].date) {
          setHasDate(true);
        } else {
          setHasDate(false);
        }
        if (response.data && response.data.success && response.data.data && response.data.data.workBreakdown) {
          setSchedule(response.data.data.workBreakdown);
          const initialScores: Scores = {};
          response.data.data.workBreakdown.forEach((dayTopics: Topic[]) => {
            dayTopics.forEach((topic: Topic) => {
              initialScores[topic._id] = { title: 0, notes: 0, quiz: 0 };
            });
          });
          setScores(initialScores);
          setLoading(false);
          console.log('Schedule set:', response.data.data.workBreakdown);
        }
        setScrollToToday(true);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load schedule data");
        setLoading(false);
        console.error('Error fetching schedule data:', err);
      }
    };
    postData();
  }, [hasDate]);

  useEffect(() => {
    console.log('mainSchedule:', mainSchedule);
  }, [mainSchedule]);
  useEffect(() => {
    console.log('topicId:', topicId);
    console.log('wbStrId:', wbStrId);
  }, [topicId, wbStrId]);
  useEffect(() => {
    console.log('schedule:', schedule);
  }, [schedule]);

  // Mock data for fallback and development
  const mockData: Topic[][] = [
    [
      {
        topicId: "mock-topic-1-1",
        dayNo: 1,
        date: '2025-06-07T00:00:00.000Z',
        topicName: 'Introduction to limits',
        notes: { normalNotes: [], translatedNotes: [] },
        completed: false,
        _id: "mock-id-1-1",
        video: []
      },
      {
        topicId: "mock-topic-1-2",
        dayNo: 1,
        date: '2025-06-07T00:00:00.000Z',
        topicName: 'Basic limit concepts',
        notes: { normalNotes: [], translatedNotes: [] },
        completed: false,
        _id: "mock-id-1-2",
        video: []
      }
    ],
    [
      {
        topicId: "mock-topic-2-1",
        dayNo: 2,
        date: '2025-06-14T00:00:00.000Z',
        topicName: 'Continuity and Limits',
        notes: { normalNotes: [], translatedNotes: [] },
        completed: false,
        _id: "mock-id-2-1",
        video: []
      },
      {
        topicId: "mock-topic-2-2",
        dayNo: 2,
        date: '2025-06-14T00:00:00.000Z',
        topicName: 'Advanced limit problems',
        notes: { normalNotes: [], translatedNotes: [] },
        completed: false,
        _id: "mock-id-2-2",
        video: []
      }
    ]
  ];

  const displayedDays = schedule;

  const toggleMarkAsDone = (dayIndex: number, topicIndex: number) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[dayIndex][topicIndex].completed = !updatedSchedule[dayIndex][topicIndex].completed;
    setSchedule(updatedSchedule);
    try {
      const url = `https://api.aiclassroom.in/planner/update-completion/`;
      axios.patch(url, {
        wbStrId: wbStrId,
        topicId: updatedSchedule[dayIndex][topicIndex]._id,
        val: updatedSchedule[dayIndex][topicIndex].completed
      });
      console.log('Toggled mark as done:', { dayIndex, topicIndex, updated: updatedSchedule[dayIndex][topicIndex] });
    } catch (error) {
      console.error('Error toggling mark as done:', error);
    }
  };

  const toggleMarkAsDone2 = async (
    wbStrId: string,
    topicId: string,
    val: boolean,
    dayIndex: number,
    topicIndex: number
  ) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[dayIndex][topicIndex].completed = !updatedSchedule[dayIndex][topicIndex].completed;
    setSchedule(updatedSchedule);
    const requestBody = { wbStrId, topicId, val };
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_1_SERVER_URL}/planner/update-completion`;
      await axios.patch(url, requestBody);
      console.log('Toggled mark as done 2:', { wbStrId, topicId, val, dayIndex, topicIndex });
    } catch (error) {
      console.error('Error toggling mark as done 2:', error);
    }
  };

  const handleScoreChange = (topicId: string, section: keyof Score, score: number) => {
    setScores(prevScores => ({
      ...prevScores,
      [topicId]: {
        ...prevScores[topicId],
        [section]: score
      }
    }));
  };

  const calculateTopicScore = (topicId: string) => {
    if (!scores[topicId]) return 0;
    const topicScores = scores[topicId];
    const total = topicScores.title + topicScores.notes + topicScores.quiz;
    return (total / 3).toFixed(1);
  };

  const handelDataStorage = (wbStrId: string, topicId: string, duration: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem("wbStrId", wbStrId);
    localStorage.setItem("topicId", topicId);
    localStorage.setItem("videoDuration", videoDuration);
    console.log('handelDataStorage:', { wbStrId, topicId, videoDuration });
  };

  // SVG Icons
  const VideoIcon = () => (
    <svg width="13" height="10" viewBox="0 0 13 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11.9936 1.87532C11.8696 1.861 11.7442 1.88325 11.6327 1.93932L8.71875 3.39532V5.95532L11.6327 7.41132C11.7301 7.46002 11.8384 7.48303 11.9472 7.47819C12.0561 7.47334 12.1619 7.44079 12.2546 7.38362C12.3473 7.32645 12.4239 7.24656 12.4772 7.1515C12.5304 7.05645 12.5585 6.94938 12.5588 6.84044V2.5102C12.5586 2.35355 12.501 2.20241 12.3968 2.0854C12.2926 1.9684 12.1492 1.89365 11.9936 1.87532Z"
        fill="#488BFF" />
      <path
        d="M2.31844 0.195312C1.26564 0.195312 0.398438 1.06251 0.398438 2.11531V7.23531C0.398438 8.28811 1.26564 9.15531 2.31844 9.15531H7.43844C8.49124 9.15531 9.35844 8.28811 9.35844 7.23531V2.11531C9.35844 1.06251 8.49124 0.195312 7.43844 0.195312H2.31844Z"
        fill="#488BFF" />
    </svg>
  );

  const NotesIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="12" fill="#F3E8FF" />
      <path
        d="M6.00663 13.7378L6.33751 14.9743C6.72407 16.4175 6.91799 17.1394 7.35639 17.6073C7.70241 17.9764 8.15005 18.2348 8.64279 18.3497C9.26743 18.4956 9.98935 18.3023 11.4332 17.9157C12.8758 17.5292 13.5977 17.3359 14.0655 16.8975C14.1043 16.8608 14.1419 16.8233 14.1782 16.7849C13.9602 16.7652 13.7435 16.7332 13.5292 16.6889C13.0838 16.6005 12.5545 16.4585 11.9286 16.2908L11.8601 16.2722L11.8441 16.2684C11.1631 16.0853 10.5942 15.933 10.1398 15.7692C9.66167 15.5964 9.22775 15.3833 8.85847 15.0377C8.35052 14.5618 7.99506 13.946 7.83703 13.2681C7.72183 12.7759 7.75511 12.2933 7.84471 11.7935C7.93047 11.3141 8.08407 10.7394 8.26839 10.0514L8.61079 8.77527L8.62231 8.73047C7.39351 9.06135 6.74647 9.25719 6.31511 9.66103C5.94551 10.0073 5.68692 10.4554 5.57207 10.9487C5.42615 11.5727 5.61943 12.2946 6.00663 13.7378Z"
        fill="#A855F7" />
      <path fillRule="evenodd" clipRule="evenodd"
        d="M17.5778 11.1792L17.2462 12.4156C16.859 13.8588 16.6658 14.5808 16.2274 15.0486C15.8814 15.418 15.4338 15.6766 14.941 15.7916C14.8791 15.8061 14.8162 15.8172 14.7522 15.8249C14.1666 15.8972 13.4517 15.7059 12.1512 15.3577C10.708 14.9705 9.98608 14.7772 9.51824 14.3388C9.14874 13.9927 8.89016 13.5448 8.7752 13.0518C8.62928 12.4272 8.82256 11.7059 9.20976 10.2627L9.54064 9.0262L9.6968 8.447C9.988 7.38076 10.1838 6.79388 10.5595 6.3926C10.9055 6.02345 11.3532 5.7651 11.8459 5.6502C12.4706 5.50428 13.1925 5.69756 14.6363 6.08476C16.0789 6.47132 16.8008 6.6646 17.2686 7.10236C17.6382 7.44863 17.8968 7.89676 18.0117 8.39004C18.1576 9.01468 17.9643 9.73596 17.5778 11.1792ZM11.3192 10.5968C11.3355 10.5359 11.3637 10.4788 11.4021 10.4288C11.4405 10.3788 11.4884 10.3368 11.543 10.3053C11.5976 10.2738 11.6579 10.2534 11.7204 10.2452C11.7829 10.237 11.8465 10.2412 11.9074 10.2576L14.9986 11.0864C15.0611 11.1012 15.1199 11.1284 15.1717 11.1664C15.2235 11.2044 15.2672 11.2524 15.3001 11.3075C15.333 11.3627 15.3545 11.4239 15.3633 11.4875C15.3721 11.5512 15.368 11.6159 15.3514 11.6779C15.3347 11.74 15.3058 11.798 15.2663 11.8487C15.2267 11.8993 15.1775 11.9415 15.1214 11.9728C15.0652 12.004 15.0034 12.0237 14.9396 12.0306C14.8757 12.0375 14.8111 12.0316 14.7496 12.0131L11.6584 11.1849C11.5356 11.1519 11.4308 11.0715 11.3672 10.9613C11.3036 10.8512 11.2864 10.7196 11.3192 10.5968ZM10.8226 12.4521C10.8556 12.3293 10.936 12.2245 11.0461 12.1609C11.1563 12.0973 11.2872 12.0801 11.4101 12.1129L13.2648 12.6102C13.3276 12.6247 13.3868 12.6517 13.439 12.6896C13.4911 12.7274 13.5351 12.7754 13.5683 12.8307C13.6015 12.8859 13.6232 12.9473 13.6322 13.0111C13.6412 13.0749 13.6372 13.1399 13.6205 13.2021C13.6038 13.2644 13.5748 13.3226 13.5351 13.3734C13.4954 13.4242 13.4459 13.4665 13.3895 13.4977C13.3332 13.529 13.2711 13.5485 13.207 13.5553C13.1429 13.562 13.0781 13.5558 13.0165 13.5369L11.1618 13.0403C11.1009 13.0239 11.0438 12.9958 10.9938 12.9574C10.9438 12.919 10.9018 12.8711 10.8703 12.8165C10.8388 12.7618 10.8184 12.7016 10.8102 12.639C10.802 12.5765 10.8062 12.513 10.8226 12.4521Z"
        fill="#A855F7" />
    </svg>
  );

  // Star rating component
  const StarRating: React.FC<{ value: number; onChange: (val: number) => void; maxStars?: number }> = ({
    value,
    onChange,
    maxStars = 5
  }) => {
    return (
      <div className="flex">
        {[...Array(maxStars)].map((_, i) => (
          <button
            key={i}
            type="button"
            className={`text-lg ${i < value ? 'text-yellow-400' : 'text-gray-300'}`}
            onClick={() => onChange(i + 1)}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (!schedule || schedule.length === 0) return;
    if (!hasDate) return;
    const today = new Date();
    let foundIndex = -1;
    schedule.forEach((dayTopics, idx) => {
      if (dayTopics.length > 0 && dayTopics[0].date) {
        const dayDate = new Date(dayTopics[0].date!);
        if (
          dayDate.getFullYear() === today.getFullYear() &&
          dayDate.getMonth() === today.getMonth() &&
          dayDate.getDate() === today.getDate()
        ) {
          foundIndex = idx;
        }
      }
    });
    if (foundIndex !== -1 && dayRefs.current[foundIndex]) {
      dayRefs.current[foundIndex]!.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [scrollToToday]);

  if (loading) {
    return (
      <div className="bg-[#F8FBFF] w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        <p className="text-xl text-[#3A1078] font-medium font-poppins">
          Please wait while your structured breakdown is being generated.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FBFF] w-full px-4 py-8 md:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-[1304px] flex flex-col items-center">
        <div className="w-full flex flex-col gap-8">
          <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
            <div className="flex flex-row items-center">
              <button className="p-1 hover:bg-white/20 rounded-full block lg:hidden mr-2"
                onClick={() => router.push('/smart-resources')}>
                <RiArrowGoBackFill className="text-[#6B6B6B] w-5 h-5 " />
              </button>
              <h1
                className="text-1xl lg:text-2xl font-bold">{translator("Detailed Structure Breakdown", "विस्तृत संरचना विघटन")}</h1>
            </div>
            <div className="flex flex-row justify-between items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-4">
                <span
                  className="text-[#6B6B6B] text-base md:text-lg">{displayedDays.length} {hasDate ? translator(" Days", " दिन") : translator("Topics", " टॉपिक्स")}</span>
              </div>
              <div
                className="bg-[#DCFCE7] text-[#166434] px-4 sm:px-6 py-1 sm:py-2 rounded-full text-sm sm:text-base font-medium">
                {translator("AI Optimized", "AI अनुकूल")}
              </div>
            </div>
          </div>
          {error && (
            <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <motion.div
            ref={containerRef}
            className="w-full border border-[rgba(0,0,0,0.1)] rounded-2xl bg-[#F9FAFB] p-4 sm:p-8 md:p-12 flex flex-col gap-6 sm:gap-10 max-h-[75vh] overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {schedule.map((dayTopics, dayIndex) => (
              <motion.div
                key={`day-${dayIndex}`}
                ref={el => {
                  dayRefs.current[dayIndex] = el;
                }}
                className="w-full bg-[#F9FAFB] border-[rgba(0,0,0,0.1)] rounded-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: dayIndex * 0.1 }}
              >
                {dayTopics.length > 0 && (
                  <div
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 border-b-4 border-[#b4b4b4] pb-4">
                    <div className="flex items-center gap-4">
                      <h2
                        className="text-lg sm:text-xl font-medium"> {hasDate ? translator("Day", "दिन") : translator("Topic", "टॉपिक")} {dayTopics[0].dayNo}</h2>
                      <span className="text-[#797979] text-base sm:text-lg">
                        {hasDate ? new Date(dayTopics[0].date!).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        }) : dayIndex + 1}
                      </span>
                    </div>
                  </div>
                )}
                {dayTopics.map((topic, topicIndex) => (
                  <div key={topic._id} className="flex flex-col gap-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="sm:ml-auto flex items-center gap-4 mt-2 sm:mt-0">
                        <button
                          className="flex bg-[#7763FF] hover:bg-[#6753E8] transition-colors duration-300 px-[12px] py-[6px] text-[#FFFFFF] rounded-[5px] items-center gap-2 mr-4"
                          onClick={() => {
                            const currentLang = (typeof window !== 'undefined' && localStorage.getItem("lang")) || 'English';
                            localStorage.setItem("userVivaPreference", JSON.stringify({
                              topic: topic.topicName || '',
                              language: currentLang
                            }));
                            router.push("/viva");
                          }}
                        >
                          {translator("Attend Viva", "विवाह भाग लें")} 🧑‍🏫
                        </button>
                        <span
                          className="text-[#4B5563] text-sm sm:text-base">{translator("Mark as Done", "डॉन करें")}</span>
                        <button
                          onClick={() => toggleMarkAsDone2((typeof window !== 'undefined' ? localStorage.getItem("wbStrId2") || '' : ''), topic.topicId, !topic.completed, dayIndex, topicIndex)}
                          className="relative w-10 h-6 flex items-center cursor-pointer"
                          aria-label={topic.completed ? "Mark as not done" : "Mark as done"}
                        >
                          <div
                            className={`w-10 h-6 rounded-full transition-colors duration-300 ${topic.completed ? 'bg-blue-500' : 'bg-[#D1D5DB]'}`}></div>
                          <motion.div
                            className="absolute h-6 w-6 bg-white border-4 border-[#E5E7EB] rounded-full"
                            animate={{
                              x: topic.completed ? 16 : 0,
                            }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          ></motion.div>
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-white p-4 sm:p-6 rounded-2xl flex flex-col gap-4"
                      style={
                        topic.deadlinePassed && topic.completed
                          ? { boxShadow: '0 0 0 4px #b9fbc0 inset, 0 0 16px 2px #b9fbc0 inset' }
                          : topic.deadlinePassed
                            ? { boxShadow: '0 0 0 4px #ffb3b3 inset, 0 0 16px 2px #ffb3b3 inset' }
                            : topic.completed
                              ? { boxShadow: '0 0 0 4px #b9fbc0 inset, 0 0 16px 2px #b9fbc0 inset' }
                              : undefined
                      }
                    >
                      <div className="flex flex-col gap-4 sm:gap-8 sm:flex-row">
                        <motion.div
                          className="flex-1 min-w-[250px] bg-[#EFF6FF] rounded-2xl p-4 px-6 sm:px-8 flex flex-col gap-4"
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-6 h-6 rounded-full bg-[#DBE9FE] flex items-center justify-center">
                                  <VideoIcon />
                                </div>
                                <span className="font-semibold text-lg sm:text-xl">Title: {topic.topicName}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <select
                              className="ml-0 sm:ml-4 mt-2 sm:mt-0 border border-gray-300 rounded px-2 py-1 text-base focus:outline-none focus:ring-2 focus:ring-blue-200"
                              value={videoDuration}
                              onChange={e => setVideoDuration(e.target.value)}
                            >
                              <option value="short">Short</option>
                              <option value="medium">Medium</option>
                              <option value="long">Long</option>
                            </select>
                            <motion.button
                              className="text-[#488BFF] font-semibold text-base sm:text-lg"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                handelDataStorage(wbStrId || '', topic.topicId, videoDuration);
                                router.push("/s/smart-resources/video-section");
                              }}
                            >
                              {translator("Watch Now", "अभी देखें")}
                            </motion.button>
                          </div>
                        </motion.div>
                        <motion.div
                          className="flex-1 min-w-[250px] bg-[#FAF5FF] rounded-2xl p-4 px-6 sm:px-8 flex flex-col gap-4"
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-6 h-6 rounded-full bg-[#F3E8FF] flex items-center justify-center">
                                  <NotesIcon />
                                </div>
                                <span
                                  className="font-semibold text-lg sm:text-xl">{translator("Resources", "नोट्स")}</span>
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-base sm:text-lg">{translator("Study Notes", "अध्ययन नोट्स")}</span>
                              <span
                                className="text-[#AFAFAF] text-sm sm:text-base">{translator("4 PDFs", "4 पीडीएफ़")}</span>
                            </div>
                          </div>
                          <motion.button
                            className="text-[#A855F7] font-semibold text-base sm:text-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              if (typeof window !== 'undefined') {
                                localStorage.setItem("ytLinkforNotes", topic.topicId);
                              }
                              handelDataStorage(wbStrId || '', topic.topicId, videoDuration);
                              router.push("/notes-pdf");
                            }}
                          >
                            {translator("View Resources", "नोट्स देखें")}
                          </motion.button>
                        </motion.div>
                        <motion.div
                          className="flex-1 min-w-[250px] bg-[#E5F8FF] rounded-2xl p-4 px-6 sm:px-8 flex flex-col gap-4"
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-6 h-6 rounded-full bg-[#DCFCE7] flex items-center justify-center">
                                  <IoCheckmark />
                                </div>
                                <span className="font-semibold text-lg sm:text-xl">{translator("Quiz", "क्विज")}</span>
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span
                                className="text-base sm:text-lg">{translator("Practice Quiz", "अभ्यास क्विज़")}</span>
                              <span
                                className="text-[#AFAFAF] text-sm sm:text-base">{translator("AI Generated MCQs", "AI जनित बहुविकल्पीय प्रश्न")}</span>
                            </div>
                          </div>
                          <motion.button
                            onClick={() => {
                              if (typeof window !== 'undefined') {
                                localStorage.setItem('mcq_quiz_topic', topic.topicName);
                                localStorage.setItem("topicId", topic.topicId);
                              }
                              handelDataStorage(wbStrId || '', topic.topicId, videoDuration);
                              router.push("/s/smart-resources/mcqQuiz");
                            }}
                            className="text-[#22C55D] font-semibold text-base sm:text-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {translator("Take Quiz", "क्विज़ दें")}
                          </motion.button>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            ))}
          </motion.div>
          <div className="w-full flex justify-center items-center px-4 sm:px-8 md:px-12 mt-1">
            <motion.button
              className="bg-[#3C82F6] text-white rounded-lg px-4 sm:px-6 md:px-8 py-1 sm:py-2 text-base sm:text-lg md:text-xl"
              whileHover={{ scale: 1.05, backgroundColor: '#2563EB' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/s/smart-resources")}
            >
              {translator("Go to Dashboard", "डैशबोर्ड पर जाएं")}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StructuredBreakdown;
