import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { ChatBubbleIcon, CloseIcon, CogIcon, PaperAirplaneIcon } from './icons';

interface AIAssistantProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    backendUrl: string;
    setBackendUrl: (url: string) => void;
    updateTemplate: (subject: string, body: string) => void;
}

const AssistantMessage = ({ message, onUseTemplateClick }: { message: ChatMessage, onUseTemplateClick: (text: string) => void }) => {
    
    let content;
    if (message.data?.type === 'stats' && message.data.payload) {
        content = (
            <div className="bg-gray-700 p-3 rounded-lg text-sm">
                <h4 className="font-bold mb-2">📊 Mail Merge Stats</h4>
                <ul className="list-disc list-inside">
                    {Object.entries(message.data.payload).map(([key, value]) => (
                        <li key={key}><span className="font-semibold capitalize">{key.replace(/_/g, ' ')}:</span> {String(value)}</li>
                    ))}
                </ul>
            </div>
        );
    } else if (message.data?.type === 'preview' && Array.isArray(message.data.payload)) {
        content = (
             <div className="space-y-3">
                <h4 className="font-bold text-sm">📧 Email Previews</h4>
                {message.data.payload.length > 0 ? message.data.payload.map((email: any, index: number) => (
                    <div key={index} className="bg-gray-700 p-3 rounded-lg text-xs">
                        <p><span className="font-semibold text-gray-400">To:</span> {email.to || 'N/A'}</p>
                        <p><span className="font-semibold text-gray-400">Subject:</span> {email.subject || 'N/A'}</p>
                        <hr className="border-gray-600 my-1" />
                        <p className="whitespace-pre-wrap">{email.body || 'N/A'}</p>
                    </div>
                )) : <p className="text-xs text-gray-400">No items to preview based on your criteria.</p>}
            </div>
        )
    } else if (message.data?.type === 'draft') {
        content = (
            <div>
                <p className="mb-2">{message.text}</p>
                <div className="bg-gray-700 p-3 rounded-lg text-xs font-mono whitespace-pre-wrap border border-gray-600">
                    {message.data.payload}
                </div>
                <button 
                    onClick={() => onUseTemplateClick(message.data.payload)}
                    className="mt-2 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded-md transition"
                >
                    Use this draft
                </button>
            </div>
        )
    } else {
        content = <p>{message.text}</p>;
    }

    return (
        <div className="flex items-start gap-2.5 my-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold">AI</span>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 max-w-md text-white text-sm">
                {content}
            </div>
        </div>
    );
};

export const AIAssistant: React.FC<AIAssistantProps> = ({ messages, onSendMessage, isLoading, backendUrl, setBackendUrl, updateTemplate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [tempBackendUrl, setTempBackendUrl] = useState(backendUrl);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !isLoading) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    const handleSaveSettings = () => {
        setBackendUrl(tempBackendUrl);
        setIsSettingsOpen(false);
    };

    const onUseTemplateClick = (text: string) => {
        // A simple heuristic to split subject and body
        const lines = text.split('\n');
        let subject = "Generated Subject";
        let body = text;
        if (lines[0].toLowerCase().startsWith('subject:')) {
            subject = lines[0].substring(8).trim();
            body = lines.slice(1).join('\n').trim();
        }
        updateTemplate(subject, body);
        setIsOpen(false); // Close chat after applying template for better UX
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-br from-cyan-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 z-50"
                aria-label="Open AI Assistant"
            >
                <ChatBubbleIcon className="h-8 w-8" />
            </button>
        );
    }
    
    return (
        <div className="fixed bottom-6 right-6 w-[calc(100%-3rem)] max-w-md h-[70vh] max-h-[600px] bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl flex flex-col z-50 animate-fade-in-up">
            <header className="flex items-center justify-between p-4 border-b border-gray-700 shrink-0">
                <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">AI Assistant</h3>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsSettingsOpen(true)} className="text-gray-400 hover:text-white" aria-label="Settings">
                        <CogIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white" aria-label="Close Assistant">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>
            </header>
            <div className="flex-grow p-4 overflow-y-auto">
                {messages.map((msg) => (
                    <div key={msg.id}>
                        {msg.sender === 'user' && (
                            <div className="flex justify-end my-2">
                                <p className="bg-cyan-600 rounded-lg p-3 max-w-md text-white text-sm">{msg.text}</p>
                            </div>
                        )}
                        {msg.sender === 'assistant' && <AssistantMessage message={msg} onUseTemplateClick={onUseTemplateClick} />}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-2.5 my-2">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shrink-0">
                             <span className="text-sm font-bold">AI</span>
                         </div>
                         <div className="bg-gray-700 rounded-lg p-3 max-w-md text-white">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                            </div>
                         </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-4 border-t border-gray-700 shrink-0">
                <div className="relative">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="e.g., Send to all unsent rows"
                        className="w-full bg-gray-900 border border-gray-600 rounded-full py-2 pl-4 pr-12 text-sm focus:ring-2 focus:ring-cyan-500"
                    />
                    <button type="submit" disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-full text-white disabled:bg-gray-600">
                        <PaperAirplaneIcon className="h-4 w-4 transform rotate-90" />
                    </button>
                </div>
            </form>

            {isSettingsOpen && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10" onClick={() => setIsSettingsOpen(false)}>
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-11/12 shadow-xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <h4 className="text-lg font-bold mb-4">Settings</h4>
                        <div className="space-y-2">
                            <label htmlFor="backendUrl" className="text-sm font-medium text-gray-300">Backend Service URL</label>
                            <input
                                id="backendUrl"
                                type="url"
                                value={tempBackendUrl}
                                onChange={(e) => setTempBackendUrl(e.target.value)}
                                placeholder="https://your-service.run.app/api"
                                className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-cyan-500"
                            />
                            <p className="text-xs text-gray-400">This is the URL for your Cloud Run service that connects to your Google Sheet.</p>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setIsSettingsOpen(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md text-sm">Cancel</button>
                            <button onClick={handleSaveSettings} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md text-sm">Save</button>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                .animate-fade-in-up {
                    animation: fadeInUp 0.3s ease-out forwards;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};
