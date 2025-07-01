'use client'

import React, { useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import Image from 'next/image';


// --- Helper Components for Icons ---

const HeaderLogo = '/navlogo.png'; // Adjust the path as necessary


type Translator = (word1: string, word2: string) => string;
const translator: Translator = (word1, word2) => word1; // Default to English until client-side

const BackArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

// --- Types ---
interface TableOfContentItem {
    id: number;
    title: string;
    page: number;
}

interface ContentItem {
    heading: string;
    content: string;
    image: {
        src: string | null;
        alt: string;
        caption: string;
        title: string;
    };
}

interface PageData {
    mainTitle: string;
    lastUpdated: string;
    documentTitle: string;
    tableOfContents: TableOfContentItem[];
    contents: ContentItem[];
}

// AI Header Generation Function
const generateHeaderFromContent = async (content: string): Promise<string> => {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that generates concise, descriptive titles for educational content. Respond with just the title (no quotes or formatting). Keep it under 7 words.'
                    },
                    {
                        role: 'user',
                        content: `Generate a short, descriptive title for this content:\n\n${content}`
                    }
                ],
                temperature: 0.3,
                max_tokens: 20
            }),
        });
        const data = await response.json();
        return data.choices?.[0]?.message?.content.trim() || 'Resource Notes';
    } catch (error) {
        console.error('Error generating header:', error);
        return 'Resource Notes';
    }
};

let lastImageRequestTime = 0;
const IMAGE_REQUEST_DELAY = 1000; // 1 second delay to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateImageFromPrompt = async (prompt: string): Promise<string | null> => {
    // Calculate time since last request
    const now = Date.now();
    const timeSinceLastRequest = now - lastImageRequestTime;
    if (timeSinceLastRequest < IMAGE_REQUEST_DELAY) {
        const waitTime = IMAGE_REQUEST_DELAY - timeSinceLastRequest;
        await delay(waitTime);
    }
    lastImageRequestTime = Date.now();
    try {
        const response = await axios.post(
            'https://topic-image-search-855e437-v4.app.beam.cloud',
            { topic: prompt },
            {
                headers: {
                    'Connection': 'keep-alive',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer -zv556xQlRmwWUdTMsky2ipIfiwEnCtUrvkjhvHFHgT7gP8LLlVoG5uPn-XQFljCXHOimG31PdLYzzKC1KLcMA=='
                }
            }
        );
        const data = response.data.Image_Link_Data_url_beam || response.data.Image_Link_Data_url_original;
        return data;
    } catch (error: any) {
        console.error('Error generating image:', error.response ? error.response.data : error.message);
        return null;
    }
};

const markdownToPlainTextForPdf = (markdown: string = ''): string => {
    let text = markdown;
    text = text.replace(/^#{1,6}\s+(.*)/gm, '$1');
    text = text.replace(/^>\s+(.*)/gm, '$1');
    text = text.replace(/```[a-z]*\n([\s\S]+?)\n```/g, '$1');
    text = text.replace(/\*\*(.*?)\*\*/g, '$1');
    text = text.replace(/__(.*?)__/g, '$1');
    text = text.replace(/\*(.*?)\*/g, '$1');
    text = text.replace(/_(.*?)_/g, '$1');
    text = text.replace(/^\s*[-*+]\s+(.*)/gm, '• $1');
    text = text.replace(/`([^`]+)`/g, '$1');
    text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
    text = text.replace(/!\[[^\]]*\]\([^\)]+\)/g, '');
    text = text.replace(/^(-{3,}|_{3,}|\*{3,})$/gm, '');
    text = text.replace(/\n{2,}/g, '\n');
    return text.trim();
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    });
};

const optimizeImageToDataUrl = async (img: HTMLImageElement, maxHeight = 14) => {
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    const height = maxHeight;
    const width = Math.round(height * aspectRatio);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx!.clearRect(0, 0, width, height);
    ctx!.drawImage(img, 0, 0, width, height);
    return { dataUrl: canvas.toDataURL('image/png'), width, height };
};

// --- Main Component ---

const AiNotesPage: React.FC = () => {
    const [pageData, setPageData] = useState<PageData>({
        mainTitle: 'AI Generated Notes',
        lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        documentTitle: 'Loading...',
        tableOfContents: [],
        contents: []
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [lang, setLang] = useState<'en' | 'other'>('en');
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Detect language on client only
        if (typeof window !== 'undefined') {
            const langVal = localStorage.getItem('lang');
            if (langVal && !langVal.toLowerCase().includes('english')) {
                setLang('other');
            } else {
                setLang('en');
            }
        }
    }, []);

    useEffect(() => {
        const fetchNotesData = async () => {
            setIsLoading(true);
            const url = `${process.env.NEXT_PUBLIC_BACKEND_1_SERVER_URL}/videoData/makeNotesFromPdf`;
            const wbStrId = typeof window !== 'undefined' ? localStorage.getItem('wbStrId2') : null;
            const topicId = typeof window !== 'undefined' ? localStorage.getItem('topicId') : null;
            console.log("wbStrId:", wbStrId, "topicId:", topicId);
            try {
                const response = await axios.patch(url, {
                    wbStrId: wbStrId,
                    topicId: topicId
                });
                const notesRaw = response.data.data.Notes_Data.normal_notes;
                if (!notesRaw || Object.keys(notesRaw).length === 0) {
                    setPageData(prev => ({ ...prev, documentTitle: 'No content available.' }));
                    setIsLoading(false);
                    return;
                }
                const notesContent = Array.isArray(notesRaw) ? notesRaw : Object.values(notesRaw);
                const documentTitle = await generateHeaderFromContent(notesContent.join(' ').substring(0, 500));
                const initialParsedContents: ContentItem[] = notesContent.map((rawNote: string) => {
                    const lines = rawNote.split('\n');
                    const titleLine = lines.find((line: string) => line.startsWith('##')) || lines[0] || 'Untitled Section';
                    const heading = titleLine.replace(/##/g, '').replace(/\*\*/g, '').trim();
                    const titleLineIndex = lines.indexOf(titleLine);
                    const content = lines.slice(titleLineIndex + 1).join('\n').trim();
                    return {
                        heading,
                        content,
                        image: {
                            src: null,
                            alt: `Illustration for ${heading}`,
                            caption: `Fig - for ${heading}`,
                            title: heading
                        }
                    };
                });
                const tocItemsPerPage = 25;
                const tocPages = Math.ceil(initialParsedContents.length / tocItemsPerPage) || 1;
                const tableOfContents: TableOfContentItem[] = initialParsedContents.map((content, index) => ({
                    id: index + 1,
                    title: content.heading,
                    page: index + 1 + tocPages
                }));
                setPageData({
                    mainTitle: 'AI Generated Notes',
                    lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                    documentTitle,
                    tableOfContents,
                    contents: initialParsedContents
                });
                setIsLoading(false);
                initialParsedContents.forEach(async (content, index) => {
                    try {
                        const imagePrompt = content.heading || 'abstract concept';
                        const imageUrl = await generateImageFromPrompt(imagePrompt);
                        setPageData(prevData => {
                            const newContents = prevData.contents.map((item, i) => {
                                if (i === index) {
                                    return { ...item, image: { ...item.image, src: imageUrl } };
                                }
                                return item;
                            });
                            return { ...prevData, contents: newContents };
                        });
                    } catch (error) {
                        // Ignore image error
                    }
                });
            } catch (error) {
                setPageData(prev => ({ ...prev, documentTitle: 'Failed to load notes.' }));
                setIsLoading(false);
            }
        };
        fetchNotesData();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">{
            lang === 'en'
                ? 'AI is processing your request. This may take a moment — we appreciate your patience.'
                : 'AI आपके अनुरोध पर कार्य कर रहा है। इसमें कुछ क्षण लग सकते हैं — आपकी धैर्यता के लिए धन्यवाद।'
        }</div>;
    }

    const { mainTitle, lastUpdated, documentTitle, tableOfContents, contents } = pageData;

    const handleDownload = async () => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;
        let currentPage = 1;
        let headerLogoDataUrl: string | null = null;
        let headerLogoWidth = 0;
        let headerLogoHeight = 0;
        try {
            let logoSrc: string;
            if (typeof HeaderLogo === 'string') {
                logoSrc = HeaderLogo;
            } else if ('src' in HeaderLogo) {
                logoSrc = HeaderLogo.src;
            } else {
                logoSrc = '';
            }
            const headerLogoImg = await loadImage(logoSrc);
            const optimized = await optimizeImageToDataUrl(headerLogoImg, 24);
            headerLogoDataUrl = optimized.dataUrl;
            headerLogoWidth = optimized.width * 0.2;
            headerLogoHeight = optimized.height * 0.2;
        } catch (e) {
            headerLogoDataUrl = null;
            headerLogoWidth = 0;
            headerLogoHeight = 0;
        }
        const addHeaderFooter = (pageNum: number) => {
            pdf.setTextColor(0, 0, 128);
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text(documentTitle, margin, 15);
            try {
                if (headerLogoDataUrl) {
                    pdf.addImage(
                        headerLogoDataUrl,
                        'PNG',
                        pageWidth - margin - headerLogoWidth,
                        6,
                        headerLogoWidth,
                        headerLogoHeight
                    );
                } else {
                    pdf.setFontSize(8);
                    pdf.text('AI Classroom', pageWidth - margin - 15, 10);
                }
            } catch (error) {
                pdf.setFontSize(8);
                pdf.text('AI Classroom', pageWidth - margin - 15, 10);
            }
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        };
        addHeaderFooter(currentPage);
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Contents', pageWidth / 2, 35, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        let yPosition = 50;
        const tocItemsPerPage = 25;
        tableOfContents.forEach((item, index) => {
            if (index > 0 && index % tocItemsPerPage === 0) {
                currentPage++;
                pdf.addPage();
                addHeaderFooter(currentPage);
                yPosition = 35;
                pdf.setTextColor(0, 0, 0);
                pdf.setFontSize(16);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Contents (cont.)', pageWidth / 2, 25, { align: 'center' });
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(11);
            }
            pdf.text(`${item.id}. ${item.title}`, margin, yPosition);
            const titleWidth = pdf.getTextWidth(`${item.id}. ${item.title}`);
            const pageNumWidth = pdf.getTextWidth(`Page ${item.page}`);
            const dotsWidth = pageWidth - (2 * margin) - titleWidth - pageNumWidth - 5;
            const dotCount = Math.floor(dotsWidth / 1.5);
            let dots = '';
            for (let i = 0; i < dotCount; i++) {
                dots += '.';
            }
            pdf.text(dots, margin + titleWidth + 2, yPosition);
            pdf.text(`Page ${item.page}`, pageWidth - margin, yPosition, { align: 'right' });
            yPosition += 8;
        });
        try {
            const imagePromises = contents.map(content =>
                content.image.src ? loadImage(content.image.src).catch(() => null) : Promise.resolve(null)
            );
            const loadedImages = await Promise.all(imagePromises);
            contents.forEach((content, index) => {
                currentPage++;
                pdf.addPage();
                addHeaderFooter(currentPage);
                pdf.setTextColor(0, 0, 0);
                pdf.setFontSize(14);
                pdf.setFont('helvetica', 'bold');
                pdf.text(content.heading, margin, 35);
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(11);
                let yPosition = 45;
                const loadedImg = loadedImages[index];
                const hasImage = !!loadedImg;
                const plainTextContent = markdownToPlainTextForPdf(content.content);
                const contentWidth = hasImage ? pageWidth - (2 * margin) - 80 : pageWidth - (2 * margin);
                const drawText = (startX: number, startY: number, maxWidth: number, text: string): number => {
                    const splitText = pdf.splitTextToSize(text || '', maxWidth);
                    let localY = startY;
                    let lineIndex = 0;
                    while (lineIndex < splitText.length) {
                        if (localY + 6 > pageHeight - margin) {
                            currentPage++;
                            pdf.addPage();
                            addHeaderFooter(currentPage);
                            localY = 35;
                            pdf.setFont('helvetica', 'bold');
                            pdf.text(`${content.heading} (cont.)`, margin, 25);
                            pdf.setFont('helvetica', 'normal');
                            const fullWidth = pageWidth - (2 * margin);
                            const remainingText = splitText.slice(lineIndex).join('\n');
                            return drawText(margin, localY, fullWidth, remainingText);
                        }
                        pdf.text(splitText[lineIndex], startX, localY);
                        localY += 6;
                        lineIndex++;
                    }
                    return localY;
                };
                let textFinalY = drawText(margin, yPosition, contentWidth, plainTextContent);
                if (hasImage) {
                    try {
                        const imageX = pageWidth - margin - 70;
                        const imageY = 45;
                        const imageBottom = imageY + 65;
                        textFinalY = drawText(margin, yPosition, contentWidth, plainTextContent);
                        pdf.addImage(loadedImg, 'PNG', pageWidth - margin - 70, imageY, 65, 65);
                        pdf.setFontSize(9);
                        pdf.setFont('helvetica', 'normal');
                        pdf.setTextColor(100, 100, 100);
                        const captionText = pdf.splitTextToSize(content.image.caption, 70);
                        pdf.text(captionText, pageWidth - margin - 70, imageY + 5 + 65);
                        yPosition = Math.max(textFinalY, imageBottom);
                    } catch (error) {
                        pdf.setFontSize(10);
                        pdf.text('[Image could not be drawn]', pageWidth - margin - 70, 45 + 30, { align: 'center' });
                    }
                } else if (content.image.src) {
                    pdf.setFontSize(10);
                    pdf.text('[Image could not be loaded]', pageWidth - margin - 75, 75, { align: 'center' });
                }
            });
            pdf.save(`${documentTitle.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            pdf.save(`${documentTitle.replace(/\s+/g, '_')}.pdf`);
        }
    };

    const AiClassroomLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
        <Image src={HeaderLogo} alt="AI Classroom" width={120} height={40} className={`h-10 ${className}`} style={{ height: '2.5rem', width: 'auto' }} />
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 font-sans">
            <style>{`
                .markdown-body {
                    line-height: 1.6;
                }
                .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 {
                    margin-top: 1.2em;
                    margin-bottom: 0.6em;
                    font-weight: 600;
                }
                .markdown-body p {
                    margin-bottom: 1em;
                }
                .markdown-body ul, .markdown-body ol {
                    margin-bottom: 1em;
                    padding-left: 2em;
                }
                .markdown-body li {
                    margin-bottom: 0.4em;
                }
                .markdown-body code {
                    background-color: #f3f4f6;
                    padding: 0.2em 0.4em;
                    border-radius: 0.25em;
                    font-family: monospace;
                }
                .markdown-body pre {
                    background-color: #f3f4f6;
                    padding: 1em;
                    border-radius: 0.5em;
                    overflow-x: auto;
                }
                .markdown-body a {
                    color: #3b82f6;
                    text-decoration: underline;
                }
                .markdown-body blockquote {
                    border-left: 4px solid #e5e7eb;
                    padding-left: 1em;
                    margin-left: 0;
                    color: #6b7280;
                }
                .katex-display {
                    overflow-x: auto;
                    padding: 1em 0;
                }
            `}</style>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <button className="text-gray-600 hover:text-gray-900"
                        onClick={() => window.history.back()}
                    >
                        <BackArrowIcon />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{mainTitle}</h1>
                        <p className="text-sm text-gray-500 mt-1">Last updated: {lastUpdated}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 self-end sm:self-center">
                    <button className="flex items-center gap-2 bg-gray-200/70 hover:bg-gray-300/80 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors" onClick={handleDownload}>
                        <DownloadIcon />
                        <span>Download PDF</span>
                    </button>
                    <AiClassroomLogo className="hidden sm:flex" />
                </div>
            </header>
            <main className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto max-h-[75vh]">
                <div className="p-6 md:p-10 relative" ref={contentRef}>
                    <section>
                        <header className="flex justify-between items-center border-b-2 border-indigo-500 pb-3 mb-8">
                            <h2 className="text-xl font-bold text-indigo-800 tracking-wide">{documentTitle}</h2>
                            <AiClassroomLogo />
                        </header>
                        <h3 className="text-2xl font-semibold text-center text-gray-800 mb-8">Contents</h3>
                        <ol className="list-none p-0 mx-auto max-w-2xl text-base text-gray-600 space-y-3">
                            {tableOfContents.map(item => (
                                <li key={item.id} className="flex items-baseline">
                                    <span className="w-6 text-right mr-2">{item.id}.</span>
                                    <span>{item.title}</span>
                                    <span className="flex-grow border-b border-dotted border-gray-300 mx-2"></span>
                                    <span className="font-medium">Page {item.page}</span>
                                </li>
                            ))}
                        </ol>
                        <div className="text-right text-sm text-gray-400 mt-12">Page 1</div>
                    </section>
                    <hr className="border-t border-gray-600 my-12" />
                    {contents.map((content, index) => (
                        <section key={index}>
                            <header className="flex justify-between items-center border-b-2 border-indigo-500 pb-3 mb-8">
                                <h2 className="text-xl font-bold text-indigo-800 tracking-wide">{documentTitle}</h2>
                                <AiClassroomLogo />
                            </header>
                            <div className="flex flex-col lg:flex-row gap-10">
                                <div className="lg:flex-[2]">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">{content.heading}</h3>
                                    <div className="markdown-body">
                                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                            {content.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                                <div className="lg:flex-1 mt-4 lg:mt-0">
                                    <figure className="text-center">
                                        <h4 className="text-lg font-semibold mb-4 text-gray-800">{content.image.title}</h4>
                                        {content.image.src ? (
                                            // Use <img> for dynamic/external images to avoid next/image domain issues
                                            <img src={content.image.src} alt={content.image.alt} width={320} height={192} className="w-full max-w-xs mx-auto border border-gray-200 rounded-lg shadow-sm" />
                                        ) : (
                                            <div className="w-full max-w-xs h-48 mx-auto bg-gray-200 rounded-lg flex items-center justify-center animate-pulse">
                                                <span className="text-gray-500 text-sm">Generating image...</span>
                                            </div>
                                        )}
                                        <figcaption className="text-sm text-gray-500 mt-3 max-w-xs mx-auto text-left">{content.image.caption}</figcaption>
                                    </figure>
                                </div>
                            </div>
                            {index < contents.length - 1 && (
                                <hr className="border-t border-gray-200 my-12" />
                            )}
                            <div className="text-right text-sm text-gray-400 mt-12">Page {index + 2}</div>
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default AiNotesPage;