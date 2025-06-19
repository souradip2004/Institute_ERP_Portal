// components/pythonCopyChecking/QuestionConfigForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { marked } from 'marked';

interface QuestionConfig {
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  biasedMarks: number;
  thresholdMarks: number;
  isFigureBased: boolean;
  figureUrl?: string;
}

interface Config1 {
  [questionNumber: string]: [number, string, number, number];
}

interface Config2 {
  [questionNumber: string]: [number, string, number, number, string];
}

interface Config3 {
  [questionNumber: string]: {
    text: string[][];
    diagram: string[][];
  };
}

interface QuestionConfigFormProps {
  parsedData: any;
  onSubmit: (configData: { config1: Config1; config2: Config2; config3: Config3 }) => void;
}

export function QuestionConfigForm({ parsedData, onSubmit }: QuestionConfigFormProps) {
  const [questions, setQuestions] = useState<Record<string, any>>({});
  const [questionConfigs, setQuestionConfigs] = useState<Record<string, QuestionConfig>>({});
  const [uploadingFigure, setUploadingFigure] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (parsedData && parsedData.ANS_KEY_JSON_Data) {
      try {
        const parsedQuestions = JSON.parse(parsedData.ANS_KEY_JSON_Data);
        setQuestions(parsedQuestions);

        // Initialize configuration for each question
        const initialConfigs: Record<string, QuestionConfig> = {};
        Object.keys(parsedQuestions).forEach(qNum => {
          initialConfigs[qNum] = {
            marks: 1,
            difficulty: 'medium',
            biasedMarks: 1,
            thresholdMarks: 0.5,
            isFigureBased: false
          };
        });
        setQuestionConfigs(initialConfigs);
      } catch (error) {
        console.error('Error parsing question data:', error);
      }
    }
  }, [parsedData]);

  const handleConfigChange = (questionNumber: string, field: keyof QuestionConfig, value: any) => {
    setQuestionConfigs(prev => ({
      ...prev,
      [questionNumber]: {
        ...prev[questionNumber],
        [field]: value
      }
    }));
  };

  const handleFigureUpload = async (questionNumber: string, file: File) => {
    setUploadingFigure(prev => ({ ...prev, [questionNumber]: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/teachers/2323/answerSheet/uploadDiagram', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        handleConfigChange(questionNumber, 'figureUrl', data.url);
      }
    } catch (error) {
      console.error('Error uploading figure:', error);
    } finally {
      setUploadingFigure(prev => ({ ...prev, [questionNumber]: false }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create config1: [marks, difficulty, biasedMarks, threshold]
    const config1: Config1 = {};
    Object.entries(questionConfigs).forEach(([qNum, config]) => {
      config1[qNum] = [
        config.marks,
        config.difficulty,
        config.biasedMarks,
        config.thresholdMarks
      ];
    });

    // Create config2: [marks, difficulty, biasedMarks, threshold, figBased_y/figBased_n]
    const config2: Config2 = {};
    Object.entries(questionConfigs).forEach(([qNum, config]) => {
      config2[qNum] = [
        config.marks,
        config.difficulty,
        config.biasedMarks,
        config.thresholdMarks,
        config.isFigureBased ? 'figBased_y' : 'figBased_n'
      ];
    });

    // Create config3: { text: [[]], diagram: [[url]] }
    const config3: Config3 = {};
    Object.entries(questionConfigs).forEach(([qNum, config]) => {
      config3[qNum] = {
        text: [[]],
        diagram: config.isFigureBased && config.figureUrl ? [[config.figureUrl]] : [[]]
      };
    });

    onSubmit({ config1, config2, config3 });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div
        className="flex-1 overflow-y-auto"
        style={{ maxHeight: 500, minHeight: 300 }} // Fixed height, scrollable
      >
        {Object.entries(questions).map(([questionNumber, questionData]: [string, any], idx) => (
          <div
            key={questionNumber}
            className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col gap-2"
            style={{ border: '1px solid #e5e7eb' }}
          >
            <div className="flex items-start gap-2">
              <span className="font-bold text-lg mr-1" style={{ minWidth: 32 }}>{idx + 1})</span>
              <div className="flex-1 text-base leading-relaxed">
                <span
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(questionData[0][0] || '') as string
                  }}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6 mt-2">
              <div className="flex flex-col items-center">
                <span className="font-semibold text-sm mb-1 underline">Total Marks</span>
                <div className="flex items-center border rounded px-2 py-1">
                  <button type="button" className="px-1" onClick={() => handleConfigChange(questionNumber, 'marks', Math.max(0, (questionConfigs[questionNumber]?.marks || 1) - 1))}>{'<'}</button>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={questionConfigs[questionNumber]?.marks || 1}
                    onChange={(e) => handleConfigChange(
                      questionNumber,
                      'marks',
                      parseFloat(e.target.value)
                    )}
                    className="w-12 text-center border-0 focus:ring-0 focus:outline-none bg-transparent"
                  />
                  <button type="button" className="px-1" onClick={() => handleConfigChange(questionNumber, 'marks', (questionConfigs[questionNumber]?.marks || 1) + 1)}>{'>'}</button>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-semibold text-sm mb-1 underline">Difficulty Level</span>
                <select
                  value={questionConfigs[questionNumber]?.difficulty || 'medium'}
                  onChange={(e) => handleConfigChange(
                    questionNumber,
                    'difficulty',
                    e.target.value as 'easy' | 'medium' | 'hard'
                  )}
                  className="border rounded px-2 py-1"
                  style={{ minWidth: 80 }}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-semibold text-sm mb-1 underline">Bias Mark</span>
                <div className="flex items-center border rounded px-2 py-1">
                  <button type="button" className="px-1" onClick={() => handleConfigChange(questionNumber, 'biasedMarks', Math.max(0, (questionConfigs[questionNumber]?.biasedMarks || 1) - 1))}>{'<'}</button>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={questionConfigs[questionNumber]?.biasedMarks || 1}
                    onChange={(e) => handleConfigChange(
                      questionNumber,
                      'biasedMarks',
                      parseFloat(e.target.value)
                    )}
                    className="w-10 text-center border-0 focus:ring-0 focus:outline-none bg-transparent"
                  />
                  <button type="button" className="px-1" onClick={() => handleConfigChange(questionNumber, 'biasedMarks', (questionConfigs[questionNumber]?.biasedMarks || 1) + 1)}>{'>'}</button>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-semibold text-sm mb-1 underline">Threshold Marks</span>
                <div className="flex items-center border rounded px-2 py-1">
                  <button type="button" className="px-1" onClick={() => handleConfigChange(questionNumber, 'thresholdMarks', Math.max(0, (questionConfigs[questionNumber]?.thresholdMarks || 0.5) - 1))}>{'<'}</button>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    max={questionConfigs[questionNumber]?.marks || 1}
                    value={questionConfigs[questionNumber]?.thresholdMarks || 0.5}
                    onChange={(e) => handleConfigChange(
                      questionNumber,
                      'thresholdMarks',
                      parseFloat(e.target.value)
                    )}
                    className="w-10 text-center border-0 focus:ring-0 focus:outline-none bg-transparent"
                  />
                  <button type="button" className="px-1" onClick={() => handleConfigChange(questionNumber, 'thresholdMarks', (questionConfigs[questionNumber]?.thresholdMarks || 0.5) + 1)}>{'>'}</button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-5">
                <input
                  type="checkbox"
                  id={`figure-based-${questionNumber}`}
                  checked={questionConfigs[questionNumber]?.isFigureBased || false}
                  onChange={(e) => handleConfigChange(
                    questionNumber,
                    'isFigureBased',
                    e.target.checked
                  )}
                  className="mr-1"
                />
                <label htmlFor={`figure-based-${questionNumber}`} className="text-sm font-medium">Diagram Based?</label>
                {questionConfigs[questionNumber]?.isFigureBased && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFigureUpload(questionNumber, e.target.files[0]);
                      }
                    }}
                    className="ml-2 border rounded px-2 py-1"
                    style={{ minWidth: 120 }}
                    disabled={uploadingFigure[questionNumber]}
                  />
                )}
                {uploadingFigure[questionNumber] && <span className="text-xs text-blue-500 ml-2">Uploading...</span>}
                {questionConfigs[questionNumber]?.figureUrl && (
                  <span className="text-xs text-green-500 ml-2">Uploaded!</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save All Configuration
        </button>
      </div>
    </form>
  );
}