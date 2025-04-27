// components/pythonCopyChecking/QuestionConfigForm.tsx
'use client';

import { useState, useEffect } from 'react';

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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        {Object.entries(questions).map(([questionNumber, questionData]: [string, any]) => (
          <div key={questionNumber} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-2">Question {questionNumber}</h3>
            <p className="mb-4">{questionData[0][0]}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marks
                </label>
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
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={questionConfigs[questionNumber]?.difficulty || 'medium'}
                  onChange={(e) => handleConfigChange(
                    questionNumber, 
                    'difficulty', 
                    e.target.value as 'easy' | 'medium' | 'hard'
                  )}
                  className="w-full p-2 border rounded"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biased Marks
                </label>
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
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Threshold Marks
                </label>
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
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`figure-based-${questionNumber}`}
                  checked={questionConfigs[questionNumber]?.isFigureBased || false}
                  onChange={(e) => handleConfigChange(
                    questionNumber, 
                    'isFigureBased', 
                    e.target.checked
                  )}
                  className="mr-2"
                />
                <label htmlFor={`figure-based-${questionNumber}`} className="text-sm font-medium text-gray-700">
                  Is Figure Based?
                </label>
              </div>
              
              {questionConfigs[questionNumber]?.isFigureBased && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Figure
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFigureUpload(questionNumber, e.target.files[0]);
                      }
                    }}
                    className="w-full p-2 border rounded"
                    disabled={uploadingFigure[questionNumber]}
                  />
                  {uploadingFigure[questionNumber] && <p className="text-sm text-blue-500 mt-1">Uploading...</p>}
                  {questionConfigs[questionNumber]?.figureUrl && (
                    <p className="text-sm text-green-500 mt-1">
                      Figure uploaded successfully!
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
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