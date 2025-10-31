import React, { useMemo, useState } from 'react';
import { Recipient } from '../types';
import { PaperAirplaneIcon, ClipboardIcon, DownloadIcon } from './icons';

interface PreviewProps {
  recipients: Recipient[];
  subjectTemplate: string;
  bodyTemplate: string;
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

export const Preview: React.FC<PreviewProps> = ({ recipients, subjectTemplate, bodyTemplate }) => {
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
    
    const escapeCsvField = (field: string) => {
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };

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
          `<!-- Email to: ${email.to} -->\n<p><strong>Subject:</strong> ${email.subject}</p>\n<div>${email.body.replace(/\n/g, '<br />')}</div>\n\n<hr />\n`
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
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg h-full">
        <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2"><PaperAirplaneIcon className="h-5 w-5" /> 3. Preview & Generate</h2>
        
        {recipients.length === 0 ? (
          <div className="flex items-center justify-center h-96 bg-gray-900/50 rounded-lg">
              <p className="text-gray-500">Parse data and create a template to see previews here.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2 text-sm text-gray-400">
                <p>Showing {mergedEmails.length} of {recipients.length} merged emails.</p>
            </div>

            <div className="mt-6">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
              >
                Generate Email Content
              </button>
            </div>
            
            <div className="mt-4 space-y-6 max-h-[calc(100vh-25rem)] overflow-y-auto pr-2">
              {mergedEmails.map((email, index) => (
                <div key={email.id} className="bg-gray-900 border border-gray-700 rounded-lg p-4 transition duration-300 hover:border-green-500">
                  <div className="border-b border-gray-700 pb-2 mb-2">
                    <p className="text-xs text-gray-500">PREVIEW {index + 1}</p>
                    <p><span className="font-semibold text-gray-400">To:</span> {email.to}</p>
                    <p><span className="font-semibold text-gray-400">Subject:</span> {email.subject}</p>
                  </div>
                  <div className="whitespace-pre-wrap font-sans text-gray-300 text-sm" dangerouslySetInnerHTML={{ __html: email.body.replace(/\n/g, '<br />') }} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
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