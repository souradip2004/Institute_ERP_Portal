'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';


type CostDetail = {
  id: string;
  institutionId: string;
  videoCreditsBalance: number;
  questionPaperCreditsBalance: number;
  assignmentCreditsBalane: number;
  copyCheckingCreditsBalance: number;
  attendanceCreditsBalance: number;
  total: number;
  lastUpdated: string;
  studentLimit: number;
  classSectionLimit: number;
  reserveLimit: number;
  sectionCreditsBalance: number;
};


const fetchCostDetails = async (id: string, month: number, year: number): Promise<CostDetail> => {
  const res = await fetch(`/api/credits/${id}?month=${month}&year=${year}`);
  if (!res.ok) throw new Error('Failed to fetch cost details');
  return res.json();
};

const CreditCard: React.FC<{ title: string; balance: number; color: string }> = ({
  title,
  balance,
  color,
}) => (
  <div
    className="rounded-lg shadow-md p-6 bg-white flex flex-col items-center border-t-4"
    style={{ borderColor: color }}
  >
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <div className="text-3xl font-bold mb-1" style={{ color }}>
      {balance}
    </div>
  </div>
);

interface ViewCost {
  id: string;
}
const CostManagementPage: React.FC<ViewCost> = ({ id }) => {
  const now = new Date();
  const [costDetails, setCostDetails] = useState<CostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [creditsRemaining, setCreditsRemaining] = useState(0);

  useEffect(() => {

    const getCoins = async () => {
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

          setCreditsRemaining(coinRes.data.coins);
          setLoading(false);
          setCostDetails(coinRes.data.coins);
        } catch (err) {
          console.log(err);
        }
      }
    };

    getCoins();


  }, [])


  // useEffect(() => {
  //   setLoading(true);
  //   fetchCostDetails(id, selectedMonth + 1, selectedYear)
  //     .then((data) => setCostDetails(data))
  //     .catch((error) => {
  //       console.error(error);
  //       setCostDetails(null);
  //     })
  //     .finally(() => setLoading(false));
  // }, [id, selectedMonth, selectedYear]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></span>
      </div>
    );
  }

  if (!costDetails) {
    return <div className="text-center text-red-500 mt-10">No cost details found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-2 text-blue-700">Cost Management</h1>
      <p className="text-gray-600 mb-8">
        View your current credit balances, daily limits, and usage for your institution.
      </p>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        {/* Month & Year Selector */}
        <div className="flex items-center gap-2">
          <label className="font-medium text-gray-700">Select Month:</label>
          <select
            className="border rounded px-2 py-1"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }).map((_, idx) => (
              <option key={idx} value={idx}>
                {new Date(0, idx).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>

          <select
            className="border rounded px-2 py-1"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {Array.from({ length: 5 }).map((_, idx) => {
              const year = new Date().getFullYear() - idx;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>

        {/* Pay Bill Button */}
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded shadow"
          onClick={() => alert('Pay Bill functionality coming soon!')}
        >
          Pay Bill
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <CreditCard
          title="Credits Remaning"
          balance={creditsRemaining}
          color="#3b82f6"
        />
        {/* <CreditCard
          title="Video Credits Used"
          balance={costDetails.videoCreditsBalance}
          color="#3b82f6"
        />
        <CreditCard
          title="Question Paper Credits Used"
          balance={costDetails.questionPaperCreditsBalance}
          color="#10b981"
        />
        <CreditCard
          title="Copy Checking Credits Used"
          balance={costDetails.copyCheckingCreditsBalance}
          color="#f59e42"
        />
        <CreditCard
          title="Attendance Credits Used"
          balance={costDetails.attendanceCreditsBalance}
          color="#ef4444"
        />
        <CreditCard
          title="Section Creation Credits Used"
          balance={costDetails.sectionCreditsBalance}
          color="#10b981"
        /> */}
      </div>

      {/* <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row justify-between items-center">
        <div>
          <div className="text-lg font-semibold text-gray-700">Total Credits Used</div>
          <div className="text-4xl font-bold text-blue-600">{costDetails.total}</div>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="text-sm text-gray-500">Last Updated</div>
          <div className="text-md text-gray-700">
            {new Date(costDetails.lastUpdated).toLocaleString()}
          </div>
        </div>
      </div> */}

      {/*
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <EditableLimitCard
          label="Student Daily Limit"
          value={costDetails.studentLimit}
          field="studentLimit"
          costDetails={costDetails}
          setCostDetails={setCostDetails}
        />
        <EditableLimitCard
          label="Class Section Daily Limit"
          value={costDetails.classSectionLimit}
          field="classSectionLimit"
          costDetails={costDetails}
          setCostDetails={setCostDetails}
        />
        <EditableLimitCard
          label="Reserve Daily Limit"
          value={costDetails.reserveLimit}
          field="reserveLimit"
          costDetails={costDetails}
          setCostDetails={setCostDetails}
        />
      </div>*/}
    </div>
  );
};


type EditableLimitCardProps = {
  label: string;
  value: number;
  field: keyof CostDetail;
  costDetails: CostDetail;
  setCostDetails: React.Dispatch<React.SetStateAction<CostDetail | null>>;
};

const EditableLimitCard: React.FC<EditableLimitCardProps> = ({
  label,
  value,
  field,
  costDetails,
  setCostDetails,
}) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Replace with your API endpoint for updating limits
      const res = await fetch(`/api/credits/${costDetails.id}/updateLimit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value: inputValue }),
      });
      if (!res.ok) throw new Error('Failed to update limit');
      setCostDetails(prev =>
        prev ? { ...prev, [field]: inputValue } : prev
      );
      setEditing(false);
    } catch (err: any) {
      setError(err.message || 'Error updating limit');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
      <div className="text-md font-semibold mb-2">{label}</div>
      {editing ? (
        <div className="flex flex-col items-center">
          <input
            type="number"
            className="border rounded px-2 py-1 w-20 text-center mb-2"
            value={inputValue}
            onChange={e => setInputValue(Number(e.target.value))}
            min={0}
          />
          <div className="flex gap-2">
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm"
              onClick={() => { setEditing(false); setInputValue(value); }}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
          {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
        </div>
      ) : (
        <>
          <div className="text-2xl font-bold mb-2">{value}</div>
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
        </>
      )}
    </div>
  );
};

export default CostManagementPage;