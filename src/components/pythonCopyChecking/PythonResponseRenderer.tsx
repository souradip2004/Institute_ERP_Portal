// components/PythonResponseRenderer.tsx
'use client';

interface PythonResponseRendererProps {
  response: any;
}

export function PythonResponseRenderer({ response }: PythonResponseRendererProps) {
  // Parse the ANS_KEY_JSON_Data string into a JS object
  const answerData = response.ANS_KEY_JSON_Data ? 
    JSON.parse(response.ANS_KEY_JSON_Data) : {};
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Exam Questions</h3>
      <div className="space-y-4">
        {Object.entries(answerData).map(([questionNumber, questionData]: [string, any]) => (
          <div key={questionNumber} className="p-3 bg-white rounded shadow-sm">
            <h4 className="font-medium mb-2">Question {questionNumber}</h4>
            <p>{questionData[0][0]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}