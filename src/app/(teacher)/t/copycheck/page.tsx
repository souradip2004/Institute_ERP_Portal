"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  QuestionCircle,
  Edit,
  Trash2,
  X,
  Plus,
  Search
} from 'lucide-react'; // Only import icons used directly in this file

// --- MarkOptionalModal Component ---
// This component manages rules for marking optional questions within sections.
// REMOVED 'export' keyword from here, as it's defined in the same file as default export
const MarkOptionalModal = ({ setShowModal, onSave }) => {
  const [optionalRules, setOptionalRules] = useState([
    { section: 'A', total: 6, optional: 2 },
    { section: 'B', total: 8, optional: 4 },
  ]);

  const [newRule, setNewRule] = useState({
    section: '',
    total: '',
    required: '',
    optional: ''
  });

  // State for loading/error specific to the modal's internal operations
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Handles input changes for new rule fields and calculates optional questions
  const handleInputChange = (e, field) => {
    const value = e.target.value;
    setNewRule(prev => ({
      ...prev,
      [field]: value
    }));

    if ((field === 'total' || field === 'required') && value !== '' && newRule.total !== '' && newRule.required !== '') {
      const totalNum = parseInt(newRule.total);
      const requiredNum = parseInt(value);

      if (!isNaN(totalNum) && !isNaN(requiredNum) && requiredNum <= totalNum) {
        const optionalValue = totalNum - requiredNum;
        setNewRule(prev => ({
          ...prev,
          optional: optionalValue.toString()
        }));
      } else {
        setNewRule(prev => ({ ...prev, optional: '' }));
      }
    } else if (field === 'total' && value === '') {
      setNewRule(prev => ({ ...prev, required: '', optional: '' }));
    } else if (field === 'required' && value === '') {
      setNewRule(prev => ({ ...prev, optional: '' }));
    }
  };

  // Adds a new optional rule to the list
  const addRule = () => {
    setModalError(null);

    if (!newRule.section || newRule.total === '' || newRule.required === '') {
      setModalError('Please fill all fields.');
      return;
    }

    const totalNum = parseInt(newRule.total);
    const requiredNum = parseInt(newRule.required);

    if (isNaN(totalNum) || isNaN(requiredNum) || requiredNum > totalNum || requiredNum < 0) {
      setModalError('Invalid numbers. Required questions cannot exceed total questions or be negative.');
      return;
    }

    const optionalValue = totalNum - requiredNum;
    if (isNaN(optionalValue) || optionalValue < 0) {
      setModalError('Calculation error for optional questions. Check total and required values.');
      return;
    }

    const ruleToAdd = {
      section: newRule.section,
      total: totalNum,
      optional: optionalValue
    };

    setOptionalRules([...optionalRules, ruleToAdd]);

    setNewRule({
      section: '',
      total: '',
      required: '',
      optional: ''
    });
  };

  // Deletes an optional rule from the list
  const deleteRule = (index) => {
    const updatedRules = [...optionalRules];
    updatedRules.splice(index, 1);
    setOptionalRules(updatedRules);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-xl font-semibold text-gray-800">Mark Optional Questions</h2>
          <button onClick={() => { setShowModal(false); onSave(optionalRules); }} className="text-gray-500 hover:text-gray-800" aria-label="Close modal and save rules">
            <X size={24} />
          </button>
        </div>

        {modalError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {modalError}
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-6 flex-shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={newRule.section}
                onChange={(e) => handleInputChange(e, 'section')}
                disabled={modalLoading}
              >
                <option value="">Select Section</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Questions</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={newRule.total}
                onChange={(e) => handleInputChange(e, 'total')}
                disabled={modalLoading}
              >
                <option value="">Number Of Questions</option>
                {[...Array(20)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Required</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={newRule.required}
                onChange={(e) => handleInputChange(e, 'required')}
                disabled={modalLoading || !newRule.total || parseInt(newRule.total) === 0}
              >
                <option value="">Must Attempt</option>
                {newRule.total && parseInt(newRule.total) > 0 &&
                  [...Array(parseInt(newRule.total))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))
                }
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Optional</label>
              <input
                type="text"
                value={newRule.optional || ''}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-md bg-blue-50 text-blue-700 text-center font-medium shadow-sm cursor-not-allowed"
                disabled // Always disabled as it's read-only
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={addRule}
              className={`bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-700 flex items-center h-10 transition-colors ${modalLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={modalLoading || !newRule.section || !newRule.total || !newRule.required || parseInt(newRule.required) > parseInt(newRule.total)}
            >
              Add Rule <Plus className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {optionalRules.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full min-w-[500px] bg-white divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600 w-1/4">Section</th>
                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600 w-1/4">Total Q.</th>
                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600 w-1/4">Optional</th>
                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600 w-1/4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {optionalRules.map((rule, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-2 px-4 text-sm text-gray-700 whitespace-nowrap">{rule.section}</td>
                      <td className="py-2 px-4 text-sm text-gray-700 whitespace-nowrap">{rule.total}</td>
                      <td className="py-2 px-4 text-sm text-gray-700 whitespace-nowrap">{rule.optional}</td>
                      <td className="py-2 px-4 text-sm text-gray-700">
                        <div className="flex space-x-2 justify-start">
                          <button
                            onClick={() => deleteRule(index)}
                            className="text-red-500 hover:text-red-700"
                            aria-label={`Delete rule for section ${rule.section}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No optional rules added yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- FileInput Component ---
// This component handles file selection and upload, displaying upload status.
// REMOVED 'export' keyword here, as it's defined in the same file as default export
const FileInput = ({ label, acceptedTypes, onFileChange, disabled = false }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('No File Chosen');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFileName('No File Chosen');
      return;
    }

    setFileName(file.name);
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data' // Corrected header
        }
      });
      onFileChange(response.data.filePath);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setError(error.response?.data?.error || "File upload failed");
      setFileName('Upload Failed!');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-blue-800 mb-2">{label}</label>
      <div className="flex items-center border border-gray-300 rounded-md p-2 bg-white">
        <label
          htmlFor={`file-upload-${label.replace(/\s+/g, '-')}`}
          className={`cursor-pointer bg-white text-gray-700 border border-gray-300 rounded-md px-4 py-1.5 text-sm hover:bg-gray-50 transition-colors ${
            (isUploading || disabled) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isUploading ? "Uploading..." : 'Choose File'}
        </label>
        <input
          id={`file-upload-${label.replace(/\s+/g, '-')}`}
          name={`file-upload-${label.replace(/\s+/g, '-')}`}
          type="file"
          className="sr-only"
          onChange={handleFileChange}
          disabled={isUploading || disabled}
          accept={acceptedTypes.split(' ').map(type => type.startsWith('.') ? type : `.${type}`).join(',')}
        />
        <span className={`ml-3 text-sm flex-1 truncate ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {error || fileName}
        </span>
      </div>
      {acceptedTypes && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><QuestionCircle size={12} /> {acceptedTypes}</p>}
    </div>
  );
};


// --- Main QuestionUploadComponent ---
// This component manages the overall UI for uploading question sheets and answer sheets,
// as well as displaying questions and handling optional question rules.
export default function QuestionUploadComponent() {
  const [showModal, setShowModal] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [optionalRulesCount, setOptionalRulesCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState({
    questionSheet: null,
    answerSheets: []
  });
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setApiLoading(true);
      try {
        const response = await axios.get('/api/questions');
        setQuestions(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to load questions');
        setQuestions([]);
      } finally {
        setApiLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleFileUpload = (type, filePath) => {
    if (type === 'questionSheet') {
      setUploadedFiles(prev => ({ ...prev, questionSheet: filePath }));
    } else {
      setUploadedFiles(prev => ({ ...prev, answerSheets: [...prev.answerSheets, filePath] }));
    }
  };

  const handleEditMarks = async () => {
    setApiLoading(true);
    try {
      const response = await axios.put('/api/questions/marks', {
        questions: [
          { section: 'A', number: 1, marks: 2 },
          { section: 'A', number: 2, marks: 7 },
          { section: 'B', number: 3, marks: 8 },
          { section: 'B', number: 4, marks: 5 },
          { section: 'C', number: 5, marks: 10 },
        ]
      });
      setQuestions(Array.isArray(response.data?.updatedQuestions) ? response.data.updatedQuestions : []);
      setError(null);
    } catch (error) {
      console.error('Error updating marks:', error);
      setError('Failed to update marks');
    } finally {
      setApiLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setApiLoading(true);
    try {
      const response = await axios.get('/api/answer-sheets', {
        params: { search: searchTerm }
      });
      console.log(response.data);
      setError(null);
    } catch (error) {
      console.error('Error searching:', error);
      setError('Search failed');
    } finally {
      setApiLoading(false);
    }
  };

  const handleMarkOptionalSuccess = (rules) => {
    setOptionalRulesCount(rules.length);
    setShowModal(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mx-auto w-full max-w-screen-2xl">
        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
         
          <div>
           
            <div className="mt-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                className={`text-sm bg-white text-blue-600 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 shadow-sm flex items-center justify-center transition-colors w-full sm:w-auto ${apiLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={apiLoading}
              >
                Add More <Plus className="ml-2 h-4 w-4" />
              </button>
              <button
                className={`text-sm bg-white text-blue-600 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 shadow-sm flex items-center justify-center transition-colors w-full sm:w-auto ${apiLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={apiLoading}
              >
                Use AI Copy Checking
              </button>
            </div>
          </div>
        </div>

        <hr className="my-8 border-gray-200" />

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 sm:gap-2">
            <h2 className="text-lg font-semibold text-gray-800">List Of Questions</h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              {optionalRulesCount > 0 ? (
                <div className="flex items-center bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm w-full sm:w-auto justify-center">
                  {optionalRulesCount} Optional Rule(s)
                  <button
                    onClick={() => setShowModal(true)}
                    className="ml-2 text-gray-500 hover:text-gray-800"
                    disabled={apiLoading}
                    aria-label="Edit optional rules"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  className={`text-sm bg-white text-gray-800 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors w-full sm:w-auto ${apiLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={apiLoading}
                >
                  Mark Optional Questions
                </button>
              )}
              <button
                onClick={handleEditMarks}
                className={`text-sm text-white bg-purple-600 px-4 py-2 rounded-md hover:bg-purple-700 transition-colors w-full sm:w-auto ${apiLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={apiLoading}
              >
                {apiLoading ? 'Updating...' : 'Edit Marks'}
              </button>
            </div>
          </div>

          {/* Questions Table */}
          {apiLoading && questions.length === 0 && !error ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-3 text-gray-600 text-sm">Loading questions...</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full min-w-[600px] bg-white divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 sm:px-6 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Section</th>
                    <th className="py-3 px-4 sm:px-6 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Question Number</th>
                    <th className="py-3 px-4 sm:px-6 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Total Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {questions && questions.length > 0 ? (
                    questions.map((q, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 px-4 sm:px-6 text-sm text-gray-900 whitespace-nowrap">{q.section}</td>
                        <td className="py-3 px-4 sm:px-6 text-sm text-gray-900 whitespace-nowrap">{q.number}</td>
                        <td className="py-3 px-4 sm:px-6 text-sm text-gray-900 whitespace-nowrap">{q.marks}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 px-4 sm:px-6 text-center text-sm text-gray-500">
                        No questions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Student Answer Sheet Upload Section */}
        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Students Answer Sheet Upload</h2>
          <div className="flex justify-end">
            <form onSubmit={handleSearch} className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search"
                className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={apiLoading}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </form>
          </div>
        </div>
      </div>

      {showModal && <MarkOptionalModal setShowModal={setShowModal} onSave={handleMarkOptionalSuccess} />}
    </div>
  );
}