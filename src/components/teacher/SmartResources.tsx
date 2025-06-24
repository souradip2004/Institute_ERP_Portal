"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  Star,
  ChevronDown,
  StickyNote,
  CalendarDays,
  PlusCircle,
  Menu,
  Trash2,
} from 'lucide-react';

import axios from 'axios';
import { TbArrowBackUp } from "react-icons/tb";
import Link from 'next/dist/client/link';
import {useRouter} from "next/navigation";


const StarToggle = ({ isStarred, onToggle, t }) => (
  <button
    onClick={onToggle}
    className="text-gray-400 hover:text-yellow-400 focus:outline-none"
    aria-label={isStarred ? t("Unstar this resource", "इस संसाधन को अनस्टार करें") : t("Star this resource", "इस संसाधन को स्टार करें")}
  >
    <Star size={18} fill={isStarred ? "#F59E0B" : "none"} stroke={isStarred ? "#F59E0B" : "currentColor"} />
  </button>
);

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, t }) => {
  const [reason, setReason] = useState('');
  if (!isOpen) return null;
  const handleConfirm = () => {
    onConfirm(reason);
    setReason('');
  };

  const handleCancel = () => {
    onClose();
    setReason(''); // Reset reason after cancel
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold text-red-600 mb-4 text-center">
          {t('Confirm Delete ?', 'हटाने की पुष्टि करें ?')}
        </h2>
        <div className="mb-4">
          <label htmlFor="deleteReason" className="block text-sm font-medium text-gray-700 mb-1">
            {t('Type your Reason', 'अपना कारण टाइप करें')}
          </label>
          <textarea
            id="deleteReason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('Enter Your Reason (Optional)', 'अपना कारण दर्ज करें (वैकल्पिक)')}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            rows={3}
          ></textarea>
        </div>
        <div className="flex justify-between mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t('Cancel', 'रद्द करें')}
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            {t('Delete', 'हटाएं')}
          </button>
        </div>
      </div>
    </div>
  );
};

const ResourceCard = ({ resource, onOpenDeleteModal, onStarToggle, t }) => {
  // const navigate = useNavigate();

  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const { id, title, description, status, date, completedCount, totalCount, isStarred, isPremium } = resource;
  let statusBgColorClass = 'bg-gray-100';
  let statusTextColorClass = 'text-gray-700';
  switch (status?.toLowerCase()) {
    case 'completed':
      statusBgColorClass = 'bg-green-100';
      statusTextColorClass = 'text-green-700';
      break;
    case 'scheduled':
      statusBgColorClass = 'bg-yellow-100';
      statusTextColorClass = 'text-yellow-700';
      break;
    case 'unscheduled':
      statusBgColorClass = 'bg-[#00AEFFC9]';
      statusTextColorClass = 'text-blue-700';
      break;
    default:
      break;
  }
  let cardStyle = {};
  const baseCardClassName = "w-full text-left bg-white p-5 rounded-xl flex flex-col justify-between focus:shadow-lg transition-shadow focus:outline-none h-full";
  let conditionalCardClassName = "shadow-sm border border-gray-200 hover:shadow-xl focus:shadow-xl";
  if (isPremium) {
    let isStyled = false;
    switch (status?.toLowerCase()) {
      // ✅ START: MODIFIED STYLE FOR COMPLETED PREMIUM CARDS
      case 'completed': {
        const completedBaseShadow = '0 6px 20px -4px rgba(16, 185, 129, 0.3)';
        const completedHoverShadow = '0 10px 25px -5px rgba(16, 185, 129, 0.4), 0 8px 10px -6px rgba(16, 185, 129, 0.2)';
        cardStyle = {
          border: '2px solid transparent',
          backgroundImage: 'linear-gradient(white, white), linear-gradient(120deg, #10B981, #0EA5E9)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          boxShadow: isHovered ? completedHoverShadow : completedBaseShadow,
          transition: 'box-shadow 0.3s ease-in-out'
        };
        isStyled = true;
        break;
      }
      case 'scheduled': {
        const scheduledBaseShadow = '0 6px 20px -4px rgba(251, 191, 36, 0.3)';
        const scheduledHoverShadow = '0 10px 25px -5px rgba(251, 191, 36, 0.4), 0 8px 10px -6px rgba(251, 191, 36, 0.2)';
        cardStyle = {
          border: '2px solid transparent',
          backgroundImage: 'linear-gradient(white, white), linear-gradient(120deg, #FBBF24, #F87171)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          boxShadow: isHovered ? scheduledHoverShadow : scheduledBaseShadow,
          transition: 'box-shadow 0.3s ease-in-out'
        };
        isStyled = true;
        break;
      }
    }
    if (isStyled) conditionalCardClassName = "";
  }
  const finalCardClassName = `${baseCardClassName} ${conditionalCardClassName}`;
  const handleCardClick = () => {
    const dataForBreakdown = {
      "wbStrId": id,
      "shouldDoPostReq": false,
    };
    localStorage.setItem("dataForBreakdown", JSON.stringify(dataForBreakdown));
    localStorage.setItem("wbStrId2", id);
    router.push("/t/smart-resources/structure-breakdown");
    // navigate("/structured-breakdown");
  };


  const handleStarClick = (e) => {
    e.stopPropagation();
    onStarToggle(id, !isStarred);
  };
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onOpenDeleteModal(id);
  };
  const translatedStatus = t(status, status?.toLowerCase() === 'completed' ? 'समाप्त' : status?.toLowerCase() === 'scheduled' ? 'निर्धारित' : status?.toLowerCase() === 'unscheduled' ? 'अनियोजित' : status);
  return (
    <div onClick={handleCardClick} className={finalCardClassName} style={cardStyle}
            onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div>
        <div className="flex justify-between items-start mb-3">
					<span
            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusBgColorClass} ${statusTextColorClass}`}>{translatedStatus}</span>
          <div className="flex items-center space-x-2">
            <button onClick={handleDeleteClick} className="text-gray-400 hover:text-red-500 focus:outline-none"
                    aria-label={t("Delete this resource", "इस संसाधन को हटाएँ")}><Trash2 size={18} /></button>
            <StarToggle isStarred={isStarred} onToggle={handleStarClick} t={t} />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1.5">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">{description}</p>
      </div>
      <div className="flex justify-between items-center text-xs text-gray-500 pt-2 mt-auto">
        <span className="flex items-center"><CalendarDays size={14} className="mr-1.5 text-gray-400" />{date}</span>
        {(completedCount !== undefined && totalCount !== undefined) && (
          <span>{`${completedCount}/${totalCount}`}</span>)}
      </div>
    </div>
  );
};


export function SmartResources() {
  const [resources, setResources] = useState([]);
  const [premiumCourses, setPremiumCourses] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for UI controls
  const [activeFilter, setActiveFilter] = useState('All');
  const [scheduleTypeFilter, setScheduleTypeFilter] = useState(null);
  const [purposeFilter, setPurposeFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('date-desc');

  // State for dropdowns
  const [isScheduleDropdownOpen, setIsScheduleDropdownOpen] = useState(false);
  const [isPurposeDropdownOpen, setIsPurposeDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // State for the delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [resourceToDeleteId, setResourceToDeleteId] = useState(null);

  // Refs for closing dropdowns on outside click
  const scheduleDropdownRef = useRef(null);
  const purposeDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  const [lang] = useState(localStorage.getItem("lang") || 'english');
  const t = useCallback((word1, word2) => {
    return lang.toLowerCase().includes("english") ? word1 : (word2 || word1);
  }, [lang]);

  const sortOptions = [
    { value: 'date-desc', label: t('Date (Newest)', 'तिथि (नवीनतम)') },
    { value: 'date-asc', label: t('Date (Oldest)', 'तिथि (पुरानी)') },
    { value: 'title-asc', label: t('Title (A-Z)', 'शीर्षक (A-Z)') },
    { value: 'title-desc', label: t('Title (Z-A)', 'शीर्षक (Z-A)') },
  ];

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // const userId = "gdfgf7rdgrdgf7rejtgdffsd";
      const userId = localStorage.getItem("user") && JSON.parse(localStorage.getItem("user"))?.teacherId;
      if (!userId) {
        throw new Error("User not found. Please log in again.");
      }
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_1_SERVER_URL}/planner/getAllSchedulesFromUser/${userId}`);
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const transformedResources = response.data.data.map((item, index) => {
          let status = 'Unscheduled';
          if (item.completedAll) status = 'Completed';
          else if (item.scheduled) status = 'Scheduled';

          return {
            id: item._id || index.toString(),
            title: item.scheduleTitle || t('Untitled Resource', 'अनाम संसाधन'),
            description: item.scheduleDescription || t('No description available', 'कोई विवरण उपलब्ध नहीं'),
            status: status,
            date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : t('No date', 'कोई तिथि नहीं'),
            rawDate: item.createdAt ? new Date(item.createdAt) : new Date(0),
            completedCount: item.completedTopics || 0,
            totalCount: item.totalTopics || 1,
            isStarred: item.starred || false,
            isPremium: item.premiumSchedule || false,
            planPurpose: item.planPurpose || 'N/A'
          };
        });
        setResources(transformedResources);
      } else {
        throw new Error(response.data.message || 'Failed to fetch resources');
      }
    } catch (err) {
      setError(`${t('Error fetching resources', 'संसाधन प्राप्त करने में त्रुटि')}: ${err.message}`);
      console.error('Error fetching resources:', err);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (scheduleDropdownRef.current && !scheduleDropdownRef.current.contains(event.target)) setIsScheduleDropdownOpen(false);
      if (purposeDropdownRef.current && !purposeDropdownRef.current.contains(event.target)) setIsPurposeDropdownOpen(false);
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) setIsSortDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStarToggle = async (resourceId, newStarredStatus) => {
    const originalResources = [...resources];
    const updatedResources = resources.map(r => r.id === resourceId ? { ...r, isStarred: newStarredStatus } : r);
    setResources(updatedResources);

    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_1_SERVER_URL}/planner/addToFavorites`, {
        wbStrId: resourceId,
        value: newStarredStatus
      });
    } catch (error) {
      console.error('Error updating starred status:', error);
      setResources(originalResources);
    }
  };

  const handleConfirmDelete = async (reason) => {
    if (!resourceToDeleteId) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_1_SERVER_URL}/planner/deleteSchedule/${resourceToDeleteId}`);
      setResources(prev => prev.filter(r => r.id !== resourceToDeleteId));
    } catch (error) {
      console.error('Error deleting resource:', error);
    } finally {
      setIsDeleteModalOpen(false);
      setResourceToDeleteId(null);
    }
  };

  const handleOpenDeleteModal = (id) => {
    setResourceToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    switch (activeFilter) {
      case 'Premium':
        return resource.isPremium;
      case 'Starred':
        return resource.isStarred;
      case 'Schedule Type':
        if (!scheduleTypeFilter) return true; // Show all if no subtype is selected
        return resource.status.toLowerCase() === scheduleTypeFilter?.toLowerCase();
      case 'Purpose':
        if (!purposeFilter) return true;
        return resource.planPurpose?.toLowerCase() === purposeFilter.toLowerCase();
      case 'All':
      default:
        return true;
    }
  });

  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortOption) {
      case 'date-desc':
        return b.rawDate - a.rawDate;
      case 'date-asc':
        return a.rawDate - b.rawDate;
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  // ✅ START: LOGIC TO FILTER PREMIUM COURSES
  // Create a set of titles from the user's existing resources for efficient lookup.
  const existingResourceTitles = new Set(resources.map(r => r.title));

  // Filter the premium courses to exclude any that have a title matching an existing resource.
 /* const filteredPremiumCourses = premiumCourses.filter(
    course => !existingResourceTitles.has(course.scheduleTitle)
  );*/
  // ✅ END: LOGIC TO FILTER PREMIUM COURSES


  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    setScheduleTypeFilter(null);
    setPurposeFilter(null);
  };

  const handleScheduleFilterClick = (scheduleType) => {
    setActiveFilter('Schedule Type');
    setScheduleTypeFilter(scheduleType);
    setPurposeFilter(null);
    setIsScheduleDropdownOpen(false);
  };

  const handlePurposeFilterClick = (purpose) => {
    setActiveFilter('Purpose');
    setPurposeFilter(purpose);
    setScheduleTypeFilter(null);
    setIsPurposeDropdownOpen(false);
  };

  const getActiveTabText = () => {
    if (activeFilter === 'Schedule Type' && scheduleTypeFilter) {
      return t(scheduleTypeFilter, scheduleTypeFilter === 'Scheduled' ? 'निर्धारित' : scheduleTypeFilter === 'Unscheduled' ? 'अनियोजित' : scheduleTypeFilter);
    }
    if (activeFilter === 'Purpose' && purposeFilter) {
      return t(purposeFilter, purposeFilter === 'Academic' ? 'अकादमिक' : 'लक्ष्य परीक्षा');
    }
    return t(activeFilter,
      activeFilter === 'All' ? 'सभी' :
        activeFilter === 'Premium' ? 'प्रीमियम' :
          activeFilter === 'Starred' ? 'तारांकित' : activeFilter
    );
  }

  if (isLoading) {
    return (
      <div className="flex bg-gray-50">
        <main className="flex-1 px-4 pb-4 pt-10 lg:pt-8 lg:px-8  flex items-center justify-center">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('Loading resources...', 'संसाधन लोड हो रहे हैं...')}</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-gray-50">
        <main className="flex-1 px-4 pb-4 pt-10 lg:pt-8 lg:px-8  flex items-center justify-center">
          <div className="text-center p-4">
            <StickyNote size={48} className="mx-auto text-red-400 mb-4" />
            <p className="text-red-600 text-lg font-medium">{error}</p>
            <button onClick={fetchResources}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              {t('Retry', 'पुनः प्रयास करें')}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ✅ MODIFICATION: Update the empty state check to use the newly filtered premium courses list.
  const noResults = sortedResources.length === 0;


  return (
    <div className="flex  bg-gray-50">
      <main className="flex-1 px-4 pb-4 pt-10 lg:pt-8 lg:px-8 ">
        <button className='block absolute top-5 left-16 lg:hidden' onClick={() => window.location.href = '/'}>
          <TbArrowBackUp className='w-10 h-10 text-gray-600' /></button>
        <header className="flex flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
          <h2
            className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">{t('My Resources', 'मेरे संसाधन')}</h2>
          <div className={"flex items-center space-x-1"}>
            <Link
              href={"/t/smart-resources/create-resources"}
              className="bg-[#2563EB] hover:bg-blue-700 text-white font-semibold py-2 px-4 sm:py-2.5 sm:px-5 rounded-lg flex items-center space-x-2 transition-colors self-start sm:self-auto h-full"
              // onClick={() => navigate('/ai-resource-finder')}
            >
              <PlusCircle size={20} />
              <span>{t('Create New', 'नया बनाएँ')}</span>
            </Link>
            <button onClick={() => handleFilterClick('Starred')}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors duration-200  sm:hidden h-full ${activeFilter === 'Starred' ? 'bg-indigo-500 text-white shadow' : 'hover:bg-gray-400'}`}>
              <Star size={20} fill={activeFilter === 'Starred' ? 'white' : 'none'} />
            </button>
          </div>
        </header>

        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-y-4 lg:gap-y-0">
          <div className="flex items-center space-x-2 sm:space-x-4 text-sm sm:text-base font-medium text-gray-600">
            <button onClick={() => handleFilterClick('All')}
                    className={`px-2 py-1 rounded-lg transition-colors duration-200 ${activeFilter === 'All' ? 'bg-indigo-500 text-white shadow' : 'hover:bg-gray-200'}`}>{t('All', 'सभी')}</button>
            {/*<button onClick={() => handleFilterClick('Premium')}
                    className={`px-2 py-1 rounded-lg transition-colors duration-200 ${activeFilter === 'Premium' ? 'bg-indigo-500 text-white shadow' : 'hover:bg-gray-200'}`}>{t('Premium', 'प्रीमियम')}
            </button>*/}

            <div className="relative" ref={scheduleDropdownRef}>
              <button onClick={() => setIsScheduleDropdownOpen(o => !o)}
                      className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors duration-200 ${activeFilter === 'Schedule Type' ? 'bg-indigo-500 text-white shadow' : 'hover:bg-gray-200'}`}>
                <span>{t('Schedule Type', 'शेड्यूल प्रकार')}</span>
                <ChevronDown size={16}
                             className={`transition-transform ${isScheduleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isScheduleDropdownOpen && (
                <div className="absolute z-20 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200">
                  <ul className="py-1">
                    <li>
                      <button onClick={() => handleScheduleFilterClick('Scheduled')}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('Scheduled', 'निर्धारित')}</button>
                    </li>
                    <li>
                      <button onClick={() => handleScheduleFilterClick('Unscheduled')}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('Unscheduled', 'अनियोजित')}</button>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="relative" ref={purposeDropdownRef}>
              <button onClick={() => setIsPurposeDropdownOpen(o => !o)}
                      className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors duration-200 ${activeFilter === 'Purpose' ? 'bg-indigo-500 text-white shadow' : 'hover:bg-gray-200'}`}>
                <span>{t('Purpose', 'उद्देश्य')}</span>
                <ChevronDown size={16} className={`transition-transform ${isPurposeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isPurposeDropdownOpen && (
                <div className="absolute z-20 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200">
                  <ul className="py-1">
                    <li>
                      <button onClick={() => handlePurposeFilterClick('Academic')}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('Academic', 'अकादमिक')}</button>
                    </li>
                    <li>
                      <button onClick={() => handlePurposeFilterClick('Target Exam')}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('Target Exam', 'लक्ष्य परीक्षा')}</button>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <button onClick={() => handleFilterClick('Starred')}
                    className={`hidden  sm:flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors duration-200 ${activeFilter === 'Starred' ? 'bg-indigo-500 text-white shadow' : 'hover:bg-gray-200'}`}>
              <Star size={16} fill={activeFilter === 'Starred' ? 'white' : 'none'} />
              <span>{t('Starred', 'तारांकित')}</span>
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:space-x-4 w-full lg:w-auto">
            <div className="relative w-full sm:flex-1 lg:w-64">
              <input type="text" placeholder={t("Search resources...", "संसाधनों में खोजें...")}
                     className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow shadow-sm"
                     value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <Search size={18} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative w-full sm:w-auto" ref={sortDropdownRef}>
              <button onClick={() => setIsSortDropdownOpen(o => !o)}
                      className="flex w-full sm:w-auto justify-center sm:justify-start items-center space-x-2 text-sm text-gray-700 font-medium border border-gray-300 px-4 py-2.5 rounded-full hover:bg-gray-100 transition-colors shadow-sm bg-white">
                <span>{sortOptions.find(opt => opt.value === sortOption)?.label || t('Sort By', 'इसके अनुसार क्रमबद्ध करें')}</span>
                <ChevronDown size={16} />
              </button>
              {isSortDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200">
                  <ul className="py-1">
                    {sortOptions.map((option) => (
                      <li key={option.value}>
                        <button onClick={() => {
                          setSortOption(option.value);
                          setIsSortDropdownOpen(false);
                        }}
                                className={`block px-4 py-2 text-sm w-full text-left ${sortOption === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>{option.label}</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {activeFilter === 'Purpose' && purposeFilter && (
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2 inline-block">
              {t(purposeFilter, purposeFilter === 'Academic' ? 'अकादमिक' : 'लक्ष्य परीक्षा')}
            </h3>
          </div>
        )}

        {!noResults ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {sortedResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onOpenDeleteModal={handleOpenDeleteModal}
                onStarToggle={handleStarToggle}
                t={t}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <StickyNote size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg font-medium">
              {t(`No resources found for "${getActiveTabText()}"`, `"${getActiveTabText()}" के लिए कोई संसाधन नहीं मिला।`)}
            </p>
            <p
              className="text-gray-500 text-sm mt-2">{t('Try adjusting your filters or create a new resource.', 'अपने फ़िल्टर समायोजित करने का प्रयास करें या एक नया संसाधन बनाएँ।')}</p>
          </div>
        )}
      </main>
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        t={t}
      />
    </div>
  );
}

