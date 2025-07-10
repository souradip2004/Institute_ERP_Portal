"use client";
import React, { useState } from 'react';
import { S3Utils } from "@/utils/s3Utils";

// Define the type for the form data, matching your Prisma schema
interface FeesFormData {
  institutionId: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  upiqrCode?: string;
  email?: string;
  password?: string;
}

interface FeesFormProps {
  id: string;
}

const FeesForm: React.FC<FeesFormProps> = ({ id }) => {
  // Initialize form state with empty strings for required fields and undefined for optional
  const [formData, setFormData] = useState<FeesFormData>({
    institutionId: id,
    accountHolder: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
    upiqrCode: undefined,
    email: undefined,
    password: undefined,
  });

  // State for form submission status and messages
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // Handle input changes and update the form data state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setMessageType('');

    // Basic client-side validation for required fields
    const requiredFields = [
      'institutionId',
      'accountHolder',
      'accountNumber',
      'ifscCode',
      'bankName',
      'branchName',
    ];
    for (const field of requiredFields) {
      if (!formData[field as keyof FeesFormData]) {
        setMessage(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
        setMessageType('error');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // In a real application, you would send this data to your API endpoint
      // For demonstration, we'll just log it and simulate a delay
      console.log('Form Data Submitted:', formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setMessage('Fees details submitted successfully!');
      setMessageType('success');
      // Optionally reset the form after successful submission
      setFormData({
        institutionId: '',
        accountHolder: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: '',
        upiqrCode: undefined,
        email: undefined,
        password: undefined,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage('Failed to submit fees details. Please try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Enter Fees Details</h2>

        {message && (
          <div
            className={`p-3 mb-4 rounded-md text-sm ${
              messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
            role="alert"
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Institution ID */}
          

          {/* Account Holder */}
          <div>
            <label htmlFor="accountHolder" className="block text-sm font-medium text-gray-700 mb-1">
              Account Holder Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="accountHolder"
              name="accountHolder"
              value={formData.accountHolder}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="e.g., John Doe"
            />
          </div>

          {/* Account Number */}
          <div>
            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Account Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="accountNumber"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="e.g., 1234567890"
            />
          </div>

          {/* IFSC Code */}
          <div>
            <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700 mb-1">
              IFSC Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="ifscCode"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="e.g., ABCD0001234"
            />
          </div>

          {/* Bank Name */}
          <div>
            <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
              Bank Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="bankName"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="e.g., State Bank of India"
            />
          </div>

          {/* Branch Name */}
          <div>
            <label htmlFor="branchName" className="block text-sm font-medium text-gray-700 mb-1">
              Branch Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="branchName"
              name="branchName"
              value={formData.branchName}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="e.g., Main Branch, City"
            />
          </div>

          {/* UPI QR Code (Optional) */}
          <div>
            <label htmlFor="upiqrCode" className="block text-sm font-medium text-gray-700 mb-1">
              UPI QR Code (Optional)
            </label>
            <input
              type="text"
              id="upiqrCode"
              name="upiqrCode"
              value={formData.upiqrCode || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="e.g., upi://pay?pa=..."
            />
          </div>

          {/* Email (Optional) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email (Optional)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="e.g., contact@institution.com"
            />
          </div>

          {/* Password (Optional - Note: Storing passwords directly in a Fees model might be unusual, consider security implications) */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password (Optional)
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="********"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out ${
              isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : null}
            {isSubmitting ? 'Submitting...' : 'Submit Fees Details'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeesForm;

