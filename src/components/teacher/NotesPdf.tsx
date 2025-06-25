import {useState, useEffect, useRef} from 'react';
import {
  Menu,
  Download,
  Printer,
  MoreVertical,
  FileText,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import {IoIosClose} from "react-icons/io";


// Translator function for English/Hindi UI
const translator = (word1, word2) =>
  localStorage.getItem("lang") && localStorage.getItem("lang").toLowerCase().includes("english")
    ? word1
    : localStorage.getItem("lang")
      ? word2
      : word1;

const NotesPdf = () => {
  const [isMobile, setIsMobile] = useState(false);
  // const navigate = useNavigate();
  const [selectedPdf, setSelectedPdf] = useState(0);
  const [pdfData, setPdfData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < window.innerHeight);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);


  // Fetch PDF data and then fetch blobs via proxy
  useEffect(() => {
    let blobUrlsToRevoke = []; // Array to keep track of blob URLs created

    const fetchAndProcessPdfs = async () => {
      const wbStrId = localStorage.getItem("wbStrId2");
      const topicId = localStorage.getItem("topicId");
      const listUrl = `${import.meta.env.VITE_BACKEND_1_SERVER_URL}/videoData/generatePdfLink/${wbStrId}/${topicId}`; // URL to get the list of PDF links
      const proxyUrlBase = 'https://api.aiclassroom.in/proxy-pdf?url='; // Base URL for the proxy

      console.log("PDF list API url:", listUrl);

      try {
        setLoading(true);
        setError(null);

        const listResponse = await axios.get(listUrl);
        console.log("Response from PDF list API:", listResponse);

        const originalPdfLinks = listResponse.data.data.pdfLinks || [];

        if (originalPdfLinks.length > 0) {
          const pdfPromises = originalPdfLinks.map(async (originalUrl) => {
            try {
              // Fetch PDF blob via proxy
              const proxyResponse = await axios.get(`${proxyUrlBase}${encodeURIComponent(originalUrl)}`, {
                responseType: 'blob' // Crucial to handle PDF binary
              });

              const blob = new Blob([proxyResponse.data], {type: 'application/pdf'});
              const blobUrl = URL.createObjectURL(blob);
              blobUrlsToRevoke.push(blobUrl); // Add to cleanup list
              return {originalUrl, blobUrl};
            } catch (proxyErr) {
              console.error(`Error fetching PDF blob for ${originalUrl}:`, proxyErr);
              // Return a placeholder or handle this error per-PDF if necessary
              return {originalUrl, blobUrl: null, error: 'Failed to fetch blob'};
            }
          });

          const processedPdfs = await Promise.all(pdfPromises);
          const successfulPdfs = processedPdfs.filter(pdf => pdf.blobUrl !== null);

          setPdfData(successfulPdfs);

          // Auto-select first successful PDF if available
          if (successfulPdfs.length > 0) {
            setSelectedPdf(0);
          } else if (originalPdfLinks.length > 0) {
            // If no blobs could be fetched but links were returned, show an error
            setError('Failed to load any PDF content via proxy');
          } else {
            // If no original links were returned
            setError('No PDF links available');
          }

        } else {
          // No PDF links returned by the first API
          setPdfData([]);
          setSelectedPdf(0); // Reset selection
          setError('No PDF links available');
        }

      } catch (err) {
        setError('Failed to fetch PDF list or process PDFs');
        console.error('Error in fetchAndProcessPdfs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessPdfs();

    // Cleanup function to revoke blob URLs
    return () => {
      blobUrlsToRevoke.forEach(url => URL.revokeObjectURL(url));
    };

  }, []); // Empty dependency array means this runs once on mount

  const handlePdfSelect = (index) => {
    if (isMobile) {
      // For mobile, open PDF in new tab
      if (pdfData[index] && pdfData[index].originalUrl) {
        window.open(pdfData[index].originalUrl, '_blank');
      }
    } else {
      // For desktop, set selected PDF for viewer
      setSelectedPdf(index);
    }
  };

  const handleDownload = () => {
    // Use the original URL for download if available, otherwise the blobUrl
    if (pdfData[selectedPdf]) {
      const pdfInfo = pdfData[selectedPdf];
      const link = document.createElement('a');
      link.href = pdfInfo.originalUrl || pdfInfo.blobUrl; // Prefer original for cleaner filename if proxy provides generic one
      link.download = `PDF-${selectedPdf + 1}.pdf`; // You might want to extract filename from originalUrl if possible
      link.click();
    }
  };

  const handlePrint = () => {
    // Opening the blob URL in a new tab should typically work for printing
    if (pdfData[selectedPdf] && pdfData[selectedPdf].blobUrl) {
      window.open(pdfData[selectedPdf].blobUrl, '_blank');
    }
  };

  const handleAiSmartNotes = () => {
    // Placeholder for AI Smart Notes functionality
    //alert('AI Smart Notes feature coming soon!');
    // navigate("/ai-notes");
  };

  const getPdfFileName = (index) => {
    return `PDF - ${index + 1}`;
  };

  return (
    <div className={`${isMobile ? 'min-h-screen bg-gray-100' : 'flex h-screen bg-gray-100'}`}>
      {/* Left Sidebar / Mobile Full Screen */}
      <div className={`${isMobile ? 'w-full min-h-screen' : 'w-80'} bg-white shadow-lg flex flex-col`}>
        {/* Header */}
        <div className="p-6 text-center">
          <div>
            <div className="flex flex-row justify-between items-center">
              <button>
                <IoIosClose size={50} onClick={() => {
                  // navigate('/structured-breakdown')
                }}/>
              </button>
              <h1
                className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                My Resources
              </h1>
            </div>
          </div>
          <hr className="border-gray-200 mb-4"/>

          {/* Day Info */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-lg font-medium text-gray-800">Day 1</span>
            <span className="text-gray-500">Monday, June 16</span>
          </div>
        </div>

        {/* Notes Section */}
        {/* <div className="px-6 mb-4">
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                        <div className="text-gray-600">
                            <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-xl text-gray-700">Notes</span>
                    </div>
                </div> */}

        {/* PDF List */}
        <div className="flex-1 px-6 space-y-2">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-4 p-3 border border-gray-200 rounded">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            pdfData.map((_, index) => (
              <div
                key={index}
                onClick={() => handlePdfSelect(index)}
                className={`flex items-center gap-4 p-3 border rounded cursor-pointer transition-all duration-200 ${!isMobile && selectedPdf === index
                  ? 'bg-gray-100 border-gray-300'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-purple-600">
                  <FileText className="w-5 h-5"/>
                </div>
                <div className="flex-1 flex items-center justify-between">

                  <span
                    className={`font-medium ${!isMobile && selectedPdf === index ? 'text-blue-600' : 'text-gray-700'
                    }`}>{getPdfFileName(index)}</span>
                  {isMobile && (
                    <span className="text-sm text-blue-600 font-medium">
                                            View Now
                                        </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* AI Smart Notes Button */}
        <div className="p-6">
          <button
            onClick={loading ? undefined : handleAiSmartNotes}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg py-3 px-4 flex items-center justify-center gap-3 hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-500"/>
            </div>
            <span
              className="font-medium text-lg">{loading ? translator("Loading...", "लोड हो रहा है...") : translator("AI Smart Notes", "AI स्मार्ट नोट्स")}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area - Hidden on Mobile */}
      {!isMobile && (
        <div className="flex-1 flex flex-col">
          {/* PDF Header */}


          {/* PDF Viewer */}
          <div className="flex-1 bg-gray-300 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p
                    className="text-gray-600">{translator("Fetching Resources ... Hang On !", "संसाधन प्राप्त कर रहे हैं ... रुको !")}</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-red-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50"/>
                  <p
                    className="text-lg font-medium">{translator("Error Loading PDFs", "पीडीएफ़ लोड करने में त्रुटि")}</p>
                  <p className="text-sm">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    {translator("Retry", "पुनः प्रयास करें")}
                  </button>
                </div>
              </div>
            ) : pdfData.length > 0 && pdfData[selectedPdf]?.blobUrl ? ( // Check if blobUrl exists for the selected PDF
              <iframe
                src={pdfData[selectedPdf].blobUrl} // Use the blob URL here
                className="w-full h-full border-0"
                title={`PDF Viewer - ${getPdfFileName(selectedPdf)}`}
                onLoad={() => console.log('PDF loaded')}
                onError={() => console.error('PDF failed to load', pdfData[selectedPdf]?.blobUrl)}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50"/>
                  <p className="text-lg">{translator("No PDFs Available", "कोई पीडीएफ़ उपलब्ध नहीं है")}</p>
                  <p
                    className="text-sm">{translator("No PDF resources found for this day", "इस दिन के लिए कोई पीडीएफ़ संसाधन नहीं मिले")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPdf;