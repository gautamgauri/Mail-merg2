
import React, { useState } from 'react';
import { enhanceEmailTemplate } from '../services/geminiService';
import { WandIcon } from './icons';

interface TemplateEditorProps {
  subject: string;
  // FIX: Use React.Dispatch<React.SetStateAction<string>> for correct state setter prop typing.
  setSubject: React.Dispatch<React.SetStateAction<string>>;
  body: string;
  setBody: React.Dispatch<React.SetStateAction<string>>;
  headers: string[];
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ subject, setSubject, body, setBody, headers }) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('more friendly and engaging');

  const addPlaceholder = (placeholder: string) => {
    // A more robust implementation could insert at cursor position
    setBody(prev => `${prev}{{${placeholder}}}`);
  };

  const handleEnhance = async () => {
    setIsEnhancing(true);
    const enhancedBody = await enhanceEmailTemplate(body, aiPrompt);
    setBody(enhancedBody);
    setIsEnhancing(false);
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold text-purple-400 mb-4">2. Email Template</h2>
      
      <div className="mb-4">
        <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
        <input
          id="subject"
          type="text"
          className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-300 mb-1">Body</label>
        <div className="mb-3">
            <p className="text-xs text-gray-400 mb-2">Click to add placeholders:</p>
            <div className="flex flex-wrap gap-2">
                {headers.length > 0 ? headers.map(header => (
                    <button key={header} onClick={() => addPlaceholder(header)} className="bg-gray-700 hover:bg-gray-600 text-xs text-gray-200 font-mono py-1 px-2 rounded-full transition">
                        {`{{${header}}}`}
                    </button>
                )) : <p className="text-xs text-gray-500">Parse data to see placeholders.</p>}
            </div>
        </div>
        <textarea
          id="body"
          className="w-full h-48 bg-gray-900 border border-gray-700 rounded-md p-3 text-sm font-mono focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
        <h3 className="text-md font-semibold text-gray-200 mb-2 flex items-center gap-2"><WandIcon className="h-5 w-5 text-purple-400" /> AI Enhancement</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            className="flex-grow bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g., more professional"
            />
          <button
            onClick={handleEnhance}
            disabled={isEnhancing}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-purple-800 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
          >
            {isEnhancing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enhancing...
              </>
            ) : (
             'Enhance with AI'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
