import React, { useState, useCallback, useRef } from 'react';
import { Recipient } from '../types';
import { UploadIcon, PlusIcon, TrashIcon } from './icons';
import { isValidEmail } from '../utils/security';

interface DataInputProps {
  onDataParsed: (headers: string[], recipients: Recipient[]) => void;
  setParsingError: (error: string | null) => void;
  onImportFromContacts?: () => void;
}

export const DataInput: React.FC<DataInputProps> = ({ onDataParsed, setParsingError, onImportFromContacts }) => {
  const [activeTab, setActiveTab] = useState<'csv' | 'manual'>('csv');

  // State for CSV tab
  const [csvText, setCsvText] = useState('Email,Name,Product\njohn.doe@example.com,John Doe,SuperWidget\njane.smith@example.com,Jane Smith,MegaGadget');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for Manual Entry tab (spreadsheet-style)
  const [manualHeaders, setManualHeaders] = useState<string[]>(['Email', 'Name', 'Product']);
  const [manualData, setManualData] = useState<string[][]>([
    ['john.doe@example.com', 'John Doe', 'SuperWidget'],
    ['jane.smith@example.com', 'Jane Smith', 'MegaGadget'],
  ]);

  const handleCsvParse = useCallback(() => {
    setParsingError(null);
    if (!csvText.trim()) {
      onDataParsed([], []);
      return;
    }

    const lines = csvText.trim().split('\n');
    if (lines.length < 1) {
      onDataParsed([], []);
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const recipients: Recipient[] = [];
    const invalidEmails: number[] = [];

    for (let i = 1; i < lines.length; i++) {
      const data = lines[i].split(',');
      if (data.length !== headers.length) {
          console.warn(`Skipping CSV row ${i+1}: column count mismatch.`);
          continue;
      }
      const recipient: Recipient = {};
      headers.forEach((header, index) => {
        recipient[header] = data[index] ? data[index].trim() : '';
      });

      // Validate email if Email field exists
      if (recipient.Email && !isValidEmail(recipient.Email)) {
        invalidEmails.push(i + 1);
        console.warn(`Row ${i+1}: Invalid email format - ${recipient.Email}`);
      }

      recipients.push(recipient);
    }

    if (invalidEmails.length > 0) {
      setParsingError(`Warning: ${invalidEmails.length} row(s) have invalid email formats (rows: ${invalidEmails.slice(0, 5).join(', ')}${invalidEmails.length > 5 ? '...' : ''})`);
    }

    onDataParsed(headers, recipients);
  }, [csvText, onDataParsed, setParsingError]);

  const handleManualParse = useCallback(() => {
    setParsingError(null);
    const cleanedHeaders = manualHeaders.map(h => h.trim());

    if (cleanedHeaders.some(h => h === '')) {
      setParsingError('Header names cannot be empty.');
      onDataParsed([], []);
      return;
    }

    const emailColIndex = cleanedHeaders.findIndex(h => h.toLowerCase() === 'email');
    const invalidEmails: number[] = [];

    const recipients: Recipient[] = manualData
        .filter(row => row.length === cleanedHeaders.length && row.some(cell => cell.trim() !== '')) // Ensure row isn't just empty strings
        .map((row, rowIndex) => {
            const recipient: Recipient = {};
            cleanedHeaders.forEach((header, index) => {
                recipient[header] = row[index] ? row[index].trim() : '';
            });

            // Validate email if Email column exists
            if (emailColIndex !== -1 && recipient[cleanedHeaders[emailColIndex]] &&
                !isValidEmail(recipient[cleanedHeaders[emailColIndex]])) {
              invalidEmails.push(rowIndex + 1);
            }

            return recipient;
        });

    if (invalidEmails.length > 0) {
      setParsingError(`Warning: ${invalidEmails.length} row(s) have invalid email formats (rows: ${invalidEmails.slice(0, 5).join(', ')}${invalidEmails.length > 5 ? '...' : ''})`);
    }

    onDataParsed(cleanedHeaders, recipients);
  }, [manualHeaders, manualData, onDataParsed, setParsingError]);

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...manualHeaders];
    newHeaders[index] = value;
    setManualHeaders(newHeaders);
  };

  const addHeader = () => {
    setManualHeaders([...manualHeaders, `Column ${manualHeaders.length + 1}`]);
    setManualData(manualData.map(row => [...row, '']));
  };

  const removeHeader = (index: number) => {
    if (manualHeaders.length <= 1) return; // Don't allow removing the last column
    setManualHeaders(manualHeaders.filter((_, i) => i !== index));
    setManualData(manualData.map(row => row.filter((_, i) => i !== index)));
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...manualData];
    newData[rowIndex][colIndex] = value;
    setManualData(newData);
  };

  const addRow = () => {
    setManualData([...manualData, Array(manualHeaders.length).fill('')]);
  };

  const removeRow = (index: number) => {
    setManualData(manualData.filter((_, i) => i !== index));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvText(text);
      };
      reader.readAsText(file);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleParseClick = () => {
    if (activeTab === 'csv') {
      handleCsvParse();
    } else {
      handleManualParse();
    }
  };

  const tabButtonStyle = (isActive: boolean) => 
    `px-4 py-2 text-sm font-medium transition-colors ${isActive ? 'border-b-2 border-cyan-400 text-white' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`;

  const iconButtonClass = "p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition";

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Recipient Data</h2>
          <p className="text-xs text-gray-400">Add your team members</p>
        </div>
      </div>

      <div className="flex border-b border-gray-700 mb-4">
        <button onClick={() => setActiveTab('csv')} className={tabButtonStyle(activeTab === 'csv')}>
          CSV Paste / Upload
        </button>
        <button onClick={() => setActiveTab('manual')} className={tabButtonStyle(activeTab === 'manual')}>
          Manual Table Entry
        </button>
      </div>

      {activeTab === 'csv' && (
        <div className="animate-fade-in">
          <p className="text-sm text-gray-400 mb-4">Paste your CSV data below or upload a .csv file. First row must be headers. Click "Load Recipients" when ready.</p>
          <textarea
            className="w-full h-40 bg-gray-900 border border-gray-700 rounded-md p-3 text-sm font-mono focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Email,Name,Product..."
          />
          <div className="mt-4">
            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <button
              onClick={triggerFileSelect}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out flex items-center justify-center gap-2"
            >
              <UploadIcon className="h-5 w-5"/>
              Upload CSV
            </button>
          </div>
        </div>
      )}

      {activeTab === 'manual' && (
        <div className="animate-fade-in space-y-4">
          <p className="text-sm text-gray-400">Add or remove columns and rows, then fill in your recipient data. Click "Load Recipients" when ready.</p>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Headers */}
              <div className="flex items-center gap-2 pb-2 border-b border-gray-700">
                  <div className="w-8 shrink-0"></div> {/* Spacer for remove button */}
                  {manualHeaders.map((header, index) => (
                      <div key={index} className="relative flex-1 min-w-[120px]">
                          <input
                              type="text"
                              value={header}
                              onChange={(e) => handleHeaderChange(index, e.target.value)}
                              className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-sm font-semibold text-gray-200 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                          />
                          <button onClick={() => removeHeader(index)} className={`${iconButtonClass} absolute top-1/2 right-1 -translate-y-1/2`}>
                              <TrashIcon className="h-4 w-4 text-red-500 hover:text-red-400" />
                          </button>
                      </div>
                  ))}
                  <button onClick={addHeader} className={`${iconButtonClass} shrink-0`}>
                      <PlusIcon className="h-5 w-5" />
                  </button>
              </div>
              {/* Data Rows */}
              <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                {manualData.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex items-center gap-2">
                    <button onClick={() => removeRow(rowIndex)} className={`${iconButtonClass} w-8 shrink-0`}>
                      <TrashIcon className="h-4 w-4 text-red-500/70 hover:text-red-400" />
                    </button>
                    {row.map((cell, colIndex) => (
                      <div key={colIndex} className="flex-1 min-w-[120px]">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                      </div>
                    ))}
                     <div className="w-6 shrink-0"></div> {/* Spacer for add column button */}
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <button onClick={addRow} className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold flex items-center gap-2 p-1">
                  <PlusIcon className="h-4 w-4"/> Add Recipient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <button
          onClick={handleParseClick}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl transition duration-300 ease-in-out transform hover:scale-[1.02] shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Load Recipients
        </button>
        {onImportFromContacts && (
          <button
            onClick={onImportFromContacts}
            className="w-full bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition duration-300 ease-in-out flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Import from Google Contacts
          </button>
        )}
      </div>
    </div>
  );
};