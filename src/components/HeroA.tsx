import React, { useState, useEffect } from 'react';
import { Grid3X3, Briefcase, Users, TrendingUp, User, Calendar } from 'lucide-react';

interface Feature {
    id: string;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}

const features: Feature[] = [
    {
        id: 'centralized',
        icon: <Grid3X3 className="w-8 h-8" />,
        title: 'Centralized',
        subtitle: 'Management'
    },
    {
        id: 'teacher',
        icon: <Briefcase className="w-8 h-8" />,
        title: 'Teacher',
        subtitle: 'Management'
    },
    {
        id: 'student',
        icon: <Users className="w-8 h-8" />,
        title: 'Student',
        subtitle: 'Organizer'
    },
    {
        id: 'growth',
        icon: <TrendingUp className="w-8 h-8" />,
        title: 'Growth',
        subtitle: 'Analytics'
    },
    {
        id: 'attendance',
        icon: <User className="w-8 h-8" />,
        title: 'Attendance',
        subtitle: 'Manager'
    },
    {
        id: 'scheduling',
        icon: <Calendar className="w-8 h-8" />,
        title: 'Smart',
        subtitle: 'Scheduling'
    }
];

const headingTexts = {
    centralized: {
        main: 'Built For All Your Administrative Needs',
        sub: 'AI Powered Institution Management Solution For You!'
    },
    teacher: {
        main: 'Empower Your Teaching Staff',
        sub: 'Complete Teacher Management & Performance Tracking!'
    },
    student: {
        main: 'Organize Student Life Seamlessly',
        sub: 'Comprehensive Student Information & Activity Management!'
    },
    growth: {
        main: 'Track Progress With Data Insights',
        sub: 'Advanced Analytics For Institutional Growth!'
    },
    attendance: {
        main: 'Effortless Attendance Tracking',
        sub: 'Automated Attendance Management & Reporting!'
    },
    scheduling: {
        main: 'Intelligent Scheduling Made Simple',
        sub: 'Automated Class Planning & Resource Management!'
    }
};

function HeroA() {
    const [activeFeature, setActiveFeature] = useState('centralized');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const featureIds = features.map(f => f.id);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsTransitioning(true);

            setTimeout(() => {
                setCurrentIndex(prev => {
                    const nextIndex = (prev + 1) % featureIds.length;
                    setActiveFeature(featureIds[nextIndex]);
                    return nextIndex;
                });
                setIsTransitioning(false);
            }, 300);
        }, 3000);

        return () => clearInterval(interval);
    }, [featureIds]);

    const currentTexts = headingTexts[activeFeature as keyof typeof headingTexts];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-white relative overflow-hidden">
            {/* Purple blob background */}
            {/* <div className="absolute left-40 top-80 w-[600px] h-[400px] bg-gradient-to-br from-purple-500 to-purple-600 rounded-[250px] transform -translate-x-48 -translate-y-48"></div> */}

            <div className="z-10 container w-screen py-16">
                <div className="flex justify-between gap-12 w-screen items-center">
                    {/* Left side - Brand */}
                    <div className="space-y-8 flex-1">
                        <div className="space-y-4 w-[400px] h-[300px] bg-gradient-to-br from-purple-500 to-purple-600 rounded-r-[250px] flex items-center justify-center">
                            <h1 className="text-6xl lg:text-5xl font-bold text-white leading-tight ">
                                Smart
                                <br />
                                Classroom
                            </h1>
                        </div>
                    </div>

                    {/* Right side - Content */}
                    <div className="space-y-12 flex-1 mr-12">
                        {/* Dynamic heading */}
                        <div className="space-y-4">
                            <h2
                                className={`text-4xl lg:text-5xl font-bold text-purple-900 leading-tight transition-all duration-500 ${isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
                                    }`}
                            >
                                {currentTexts.main}
                            </h2>
                            <p
                                className={`text-xl text-purple-700 transition-all duration-500 delay-100 ${isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
                                    }`}
                            >
                                {currentTexts.sub}
                            </p>
                        </div>

                        {/* Features grid */}
                        <div className="grid grid-cols-3 gap-6">
                            {features.map((feature) => {
                                const isHighlighted = feature.id === activeFeature;

                                return (
                                    <div
                                        key={feature.id}
                                        className={`group relative p-6 rounded-2xl transition-all duration-700 cursor-pointer ${isHighlighted
                                            ? 'bg-purple-200 border-2 border-purple-300 shadow-lg transform scale-105'
                                            : 'bg-purple-100/50 border border-purple-200 hover:bg-purple-100 hover:shadow-md hover:transform hover:scale-102'
                                            }`}
                                        onClick={() => {
                                            const clickedIndex = featureIds.indexOf(feature.id);
                                            setIsTransitioning(true);
                                            setTimeout(() => {
                                                setActiveFeature(feature.id);
                                                setCurrentIndex(clickedIndex);
                                                setIsTransitioning(false);
                                            }, 300);
                                        }}
                                    >
                                        {/* Highlight ring animation */}
                                        {isHighlighted && (
                                            <div className="absolute inset-0 rounded-2xl border-2 border-purple-400 animate-pulse"></div>
                                        )}

                                        {/* Icon */}
                                        <div className={`flex justify-center mb-4 transition-all duration-500 ${isHighlighted ? 'text-purple-700 transform scale-110' : 'text-purple-600'
                                            }`}>
                                            {feature.icon}
                                        </div>

                                        {/* Text */}
                                        <div className="text-center space-y-1">
                                            <h3 className={`font-semibold transition-colors duration-300 ${isHighlighted ? 'text-purple-900' : 'text-purple-800'
                                                }`}>
                                                {feature.title}
                                            </h3>
                                            <p className={`text-sm transition-colors duration-300 ${isHighlighted ? 'text-purple-700' : 'text-purple-600'
                                                }`}>
                                                {feature.subtitle}
                                            </p>
                                        </div>

                                        {/* Glow effect for active feature */}
                                        {isHighlighted && (
                                            <div className="absolute inset-0 rounded-2xl bg-purple-300/20 animate-pulse"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Progress indicator */}
                        <div className="flex justify-center space-x-2">
                            {features.map((feature, index) => (
                                <div
                                    key={feature.id}
                                    className={`w-2 h-2 rounded-full transition-all duration-500 cursor-pointer ${activeFeature === feature.id ? 'bg-purple-600 w-6' : 'bg-purple-300'
                                        }`}
                                    onClick={() => {
                                        setIsTransitioning(true);
                                        setTimeout(() => {
                                            setActiveFeature(feature.id);
                                            setCurrentIndex(index);
                                            setIsTransitioning(false);
                                        }, 300);
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-purple-200/30 to-transparent rounded-full transform translate-x-32 translate-y-32"></div>
            <div className="absolute top-1/2 right-0 w-32 h-32 bg-gradient-to-l from-purple-300/20 to-transparent rounded-full transform translate-x-16"></div>
        </div>
    );
}

export default HeroA;