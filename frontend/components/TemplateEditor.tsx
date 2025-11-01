
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
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Email Template</h2>
          <p className="text-xs text-gray-400">Craft your message</p>
        </div>
      </div>
      
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

      <div className="mt-6 p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
        <h3 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
          <WandIcon className="h-5 w-5 text-purple-400" /> 
          AI Enhancement
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            className="flex-grow bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition placeholder-gray-500"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g., more professional and friendly"
            />
          <button
            onClick={handleEnhance}
            disabled={isEnhancing}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 whitespace-nowrap"
          >
            {isEnhancing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enhancing...
              </>
            ) : (
             <>
               <WandIcon className="h-4 w-4" />
               Enhance with AI
             </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
