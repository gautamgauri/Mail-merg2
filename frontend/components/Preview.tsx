import React, { useMemo, useState } from 'react';
import { Recipient } from '../types';
import { PaperAirplaneIcon, ClipboardIcon, DownloadIcon } from './icons';
import { escapeHtml, escapeCsvField } from '../utils/security';

interface PreviewProps {
  recipients: Recipient[];
  subjectTemplate: string;
  bodyTemplate: string;
  onSendEmails?: () => void;
  isSending?: boolean;
  alert?: { type: 'success' | 'error' | 'info'; message: string } | null;
  onUndo?: () => void;
}

const renderMerge = (template: string, recipient: Recipient): string => {
  let rendered = template;
  for (const key in recipient) {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    rendered = rendered.replace(placeholder, recipient[key] || '');
  }
  return rendered;
};

type OutputFormat = 'text' | 'csv' | 'html';

export const Preview: React.FC<PreviewProps> = ({ recipients, subjectTemplate, bodyTemplate, onSendEmails, isSending, alert, onUndo }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('text');
  const [copyButtonText, setCopyButtonText] = useState('Copy to Clipboard');

  const mergedEmails = useMemo(() => {
    if (!recipients || recipients.length === 0) return [];
    return recipients.map((recipient, index) => ({
      id: index,
      to: recipient.Email || '[No Email Found]',
      subject: renderMerge(subjectTemplate, recipient),
      body: renderMerge(bodyTemplate, recipient),
    }));
  }, [recipients, subjectTemplate, bodyTemplate]);

  const generatedOutput = useMemo(() => {
    if (recipients.length === 0) return '';

    switch (outputFormat) {
      case 'csv':
        const headers = [...Object.keys(recipients[0]), 'GeneratedSubject', 'GeneratedBody'];
        const csvRows = [headers.map(escapeCsvField).join(',')];
        recipients.forEach((recipient, index) => {
          const merged = mergedEmails[index];
          const originalValues = Object.values(recipient).map(val => escapeCsvField(val || ''));
          const newValues = [escapeCsvField(merged.subject), escapeCsvField(merged.body)];
          csvRows.push([...originalValues, ...newValues].join(','));
        });
        return csvRows.join('\n');

      case 'html':
        return mergedEmails.map(email =>
          `<!-- Email to: ${escapeHtml(email.to)} -->\n<p><strong>Subject:</strong> ${escapeHtml(email.subject)}</p>\n<div>${escapeHtml(email.body).replace(/\n/g, '<br />')}</div>\n\n<hr />\n`
        ).join('\n');

      case 'text':
      default:
        return mergedEmails.map(email =>
          `To: ${email.to}\nSubject: ${email.subject}\n---\n${email.body}\n\n====================\n`
        ).join('\n');
    }
  }, [outputFormat, mergedEmails, recipients]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedOutput);
    setCopyButtonText('Copied!');
    setTimeout(() => setCopyButtonText('Copy to Clipboard'), 2000);
  };
  
  const handleDownloadCsv = () => {
    const blob = new Blob([generatedOutput], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'mail_merge_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const tabButtonStyle = (isActive: boolean) => 
    `px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`;

  return (
    <>
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <PaperAirplaneIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Preview & Send</h2>
            <p className="text-xs text-gray-400">Review before sending</p>
          </div>
        </div>
        
        {recipients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 bg-gray-900/30 rounded-xl border-2 border-dashed border-gray-700">
            <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400 text-center px-4">Parse data and create a template to see previews here</p>
          </div>
        ) : (
          <>
            {alert && (
              <div className={`mb-4 rounded-xl px-4 py-3 border ${alert.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-300' : alert.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm">{alert.message}</p>
                  {alert.type === 'info' && onUndo && (
                    <button onClick={onUndo} className="text-xs bg-gray-800/60 hover:bg-gray-700 text-white px-3 py-1 rounded-md border border-gray-600">Undo</button>
                  )}
                </div>
              </div>
            )}
            <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {mergedEmails.length}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Ready to send</p>
                    <p className="text-xs text-gray-400">{recipients.length} total recipient{recipients.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 mb-6 sticky top-0 z-10">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition duration-300 ease-in-out transform hover:scale-[1.02] shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview All Emails
              </button>
              {onSendEmails && (
                <button
                  onClick={onSendEmails}
                  disabled={isSending}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition duration-300 ease-in-out shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-5 w-5" />
                      Send All Emails
                    </>
                  )}
                </button>
              )}
            </div>
            
            <div className="space-y-3 max-h-[calc(100vh-28rem)] overflow-y-auto pr-2 custom-scrollbar">
              {mergedEmails.slice(0, 5).map((email, index) => (
                <div key={email.id} className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700/50 rounded-xl p-4 transition duration-300 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">TO</p>
                      <p className="text-sm font-medium text-white truncate">{email.to}</p>
                    </div>
                  </div>
                  <div className="pl-11">
                    <p className="text-xs text-gray-500 mb-1">SUBJECT</p>
                    <p className="text-sm font-medium text-gray-300 mb-3">{email.subject}</p>
                    <p className="text-xs text-gray-500 mb-1">MESSAGE PREVIEW</p>
                    <p className="text-xs text-gray-400 line-clamp-2">{email.body}</p>
                  </div>
                </div>
              ))}
              {mergedEmails.length > 5 && (
                <div className="text-center py-4">
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="text-sm text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    View all {mergedEmails.length} emails →
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(96, 165, 250, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(96, 165, 250, 0.7);
        }
      `}</style>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-green-400">Generated Email Output</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">&times;</button>
                </header>
                <div className="p-4 bg-gray-900/50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Format:</span>
                        <div className="flex gap-2 p-1 bg-gray-700 rounded-lg">
                            <button onClick={() => setOutputFormat('text')} className={tabButtonStyle(outputFormat === 'text')}>Plain Text</button>
                            <button onClick={() => setOutputFormat('csv')} className={tabButtonStyle(outputFormat === 'csv')}>CSV Export</button>
                            <button onClick={() => setOutputFormat('html')} className={tabButtonStyle(outputFormat === 'html')}>HTML</button>
                        </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleCopyToClipboard} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-md transition flex items-center gap-2 text-sm">
                        <ClipboardIcon className="h-4 w-4" />
                        {copyButtonText}
                      </button>
                      {outputFormat === 'csv' && (
                        <button onClick={handleDownloadCsv} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-md transition flex items-center gap-2 text-sm">
                            <DownloadIcon className="h-4 w-4" />
                            Download .csv
                        </button>
                      )}
                    </div>
                </div>
                <div className="p-4 flex-grow overflow-hidden">
                  <textarea
                    readOnly
                    className="w-full h-full bg-gray-900 border border-gray-700 rounded-md p-3 text-sm font-mono focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
                    value={generatedOutput}
                  />
                </div>
            </div>
        </div>
      )}
    </>
  );
};