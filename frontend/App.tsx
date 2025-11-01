import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Recipient, ChatMessage, AuthState, TokenResponse } from './types';
import { DataInput } from './components/DataInput';
import { TemplateEditor } from './components/TemplateEditor';
import { Preview } from './components/Preview';
import { AIAssistant } from './components/AIAssistant';
import { GoogleAuth } from './components/GoogleAuth';
import { parseCommand, enhanceEmailTemplate } from './services/geminiService';
import { callBackend } from './services/backendService';
declare global {
  interface Window {
    google: any;
  }
}
// Vite inlines process.env.* at build; declare for TS type purposes
declare const process: any;

const LOCAL_STORAGE_KEY = 'mail-merge-app-state';

type SavedState = {
  headers: string[];
  recipients: Recipient[];
  subject: string;
  body: string;
  activeSegment?: string;
  timestamp: string;
};

function App() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [allRecipients, setAllRecipients] = useState<Recipient[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [segments, setSegments] = useState<string[]>([]);
  const [activeSegment, setActiveSegment] = useState<string>('All');
  const [pendingRestore, setPendingRestore] = useState<SavedState | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [subject, setSubject] = useState<string>('Special Offer for {{Name}}');
  const [body, setBody] = useState<string>('Hi {{Name}},\n\nWe have an exciting new product, the {{Product}}, that we think you\'ll love.\n\nBest regards,\nTeam Awesome');
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [backendUrl, setBackendUrl] = useState<string>('https://ai-mail-merge-assistant-nerx6mrxvq-uw.a.run.app');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'assistant', text: "Hello! I'm ready to help. Sign in with Google to send emails, or ask me to 'get stats', 'preview emails', or 'draft an email'. You can also import contacts from Google Contacts." }
  ]);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  // P0/P1 UI states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [sendAlert, setSendAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const countdownRef = useRef<number>(0);
  const countdownTimerRef = useRef<number | null>(null);
  const [auth, setAuth] = useState<AuthState>({ isLoggedIn: false, userProfile: null });
  const tokenClientRef = useRef<any>(null);
  const accessTokenRef = useRef<string | null>(null);
  const tokenExpiryRef = useRef<number>(0);
  const [selectedRecipients, setSelectedRecipients] = useState<Set<number>>(new Set());

  const groupHeader = useMemo(() => headers.find(h => h.toLowerCase() === 'group'), [headers]);


  const loadDefaultData = useCallback(() => {
    const defaultCsv = 'Email,Name,Product\njohn.doe@example.com,John Doe,SuperWidget\njane.smith@example.com,Jane Smith,MegaGadget';
    const lines = defaultCsv.trim().split('\n');
    const defaultHeaders = lines[0].split(',').map(h => h.trim());
    const defaultRecipients: Recipient[] = [];
    for (let i = 1; i < lines.length; i++) {
      const data = lines[i].split(',');
      const recipient: Recipient = {};
      defaultHeaders.forEach((header, index) => {
        recipient[header] = data[index] ? data[index].trim() : '';
      });
      defaultRecipients.push(recipient);
    }
    setHeaders(defaultHeaders);
    setAllRecipients(defaultRecipients);
  }, []);

  useEffect(() => {
    const savedRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedRaw) {
      try {
        const parsed: SavedState = JSON.parse(savedRaw);
        if (parsed?.headers && parsed?.recipients) {
          setPendingRestore(parsed);
        } else {
          loadDefaultData();
        }
      } catch {
        loadDefaultData();
      }
    } else {
      loadDefaultData();
    }
    setHasInitialized(true);
  }, [loadDefaultData]);

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        window.clearTimeout(countdownTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasInitialized) return;
    if (!headers.length && !allRecipients.length) return;
    const payload: SavedState = {
      headers,
      recipients: allRecipients,
      subject,
      body,
      activeSegment,
      timestamp: new Date().toISOString()
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save session state', e);
    }
  }, [headers, allRecipients, subject, body, activeSegment, hasInitialized]);

  useEffect(() => {
    if (!groupHeader) {
      setSegments([]);
      if (activeSegment !== 'All') {
        setActiveSegment('All');
      }
      setRecipients(allRecipients);
      return;
    }

    const uniqueSegments = Array.from(new Set(allRecipients
      .map(r => (r[groupHeader] || '').trim())
      .filter(Boolean)));
    setSegments(uniqueSegments);

    const nextSegment = activeSegment === 'All' || uniqueSegments.includes(activeSegment)
      ? activeSegment
      : 'All';

    if (nextSegment !== activeSegment) {
      setActiveSegment(nextSegment);
    }

    if (nextSegment === 'All') {
      setRecipients(allRecipients);
    } else {
      setRecipients(allRecipients.filter(r => (r[groupHeader] || '').trim() === nextSegment));
    }
  }, [groupHeader, allRecipients, activeSegment]);

  useEffect(() => {
    let tries = 0;
    const maxTries = 40; // ~10s at 250ms
    const interval = setInterval(() => {
      tries++;
      if (window.google && process.env.GOOGLE_CLIENT_ID) {
        // Use OAuth2 flow for everything - no popup, single consent screen
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.GOOGLE_CLIENT_ID,
          scope: 'openid profile email https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/contacts.readonly',
          callback: handleOAuthSuccess,
        });

        // Render custom sign-in button
        const btn = document.getElementById('google-signin-button');
        if (btn && !btn.hasChildNodes()) {
          const signInBtn = document.createElement('button');
          signInBtn.className = 'bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-6 border border-gray-300 rounded-lg shadow transition flex items-center gap-3';
          signInBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          `;
          signInBtn.onclick = handleSignInClick;
          btn.appendChild(signInBtn);
        }
        clearInterval(interval);
      } else if (tries >= maxTries) {
        clearInterval(interval);
        console.warn('Google Identity script not available yet.');
      }
    }, 250);
    return () => clearInterval(interval);
  }, []);

  const handleSignInClick = () => {
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken();
    }
  };

  const handleOAuthSuccess = async (tokenResponse: any) => {
    if (tokenResponse.error) {
      console.error('OAuth error:', tokenResponse.error);
      return;
    }

    // Store the access token
    accessTokenRef.current = tokenResponse.access_token;
    tokenExpiryRef.current = Date.now() + (tokenResponse.expires_in * 1000);

    // Fetch user profile from Google using the token
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      });
      const userInfo = await response.json();

      setAuth({
        isLoggedIn: true,
        userProfile: {
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture,
        },
      });
    } catch (e) {
      console.error('Error fetching user profile:', e);
    }
  };

  const handleLogout = () => {
    setAuth({ isLoggedIn: false, userProfile: null });
    accessTokenRef.current = null;
    tokenExpiryRef.current = 0;
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  const requestGapiToken = (): Promise<TokenResponse> => {
    return new Promise((resolve, reject) => {
      // Check if we have a valid cached token
      const now = Date.now();
      if (accessTokenRef.current && tokenExpiryRef.current > now) {
        resolve({ access_token: accessTokenRef.current, expires_in: Math.floor((tokenExpiryRef.current - now) / 1000) });
        return;
      }

      // Token expired or not available - user needs to sign in again
      reject(new Error("Session expired. Please sign in again."));
    });
  };

  const handleDataParsed = (parsedHeaders: string[], parsedRecipients: Recipient[]) => {
    setHeaders(parsedHeaders);
    setAllRecipients(parsedRecipients);
    // Select all recipients by default when new data is parsed
    setSelectedRecipients(new Set(parsedRecipients.map((_, i) => i)));
  };

  const updateTemplate = (newSubject: string, newBody: string) => {
    setSubject(newSubject);
    setBody(newBody);
  };

  const handleToggleRecipient = (index: number) => {
    setSelectedRecipients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleToggleAll = () => {
    if (selectedRecipients.size === recipients.length) {
      setSelectedRecipients(new Set());
    } else {
      setSelectedRecipients(new Set(recipients.map((_, i) => i)));
    }
  };

  const handleSegmentChange = (segment: string) => {
    setActiveSegment(segment);
  };

  const restoreSavedState = () => {
    if (!pendingRestore) return;
    setHeaders(pendingRestore.headers || []);
    setAllRecipients(pendingRestore.recipients || []);
    setSubject(pendingRestore.subject || '');
    setBody(pendingRestore.body || '');
    setActiveSegment(pendingRestore.activeSegment || 'All');
    setPendingRestore(null);
  };

  const discardSavedState = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setPendingRestore(null);
    if (!allRecipients.length) {
      loadDefaultData();
    }
  };

  const handleSendMessage = async (messageText: string) => {
    const userMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setIsAssistantLoading(true);

    let assistantResponse: ChatMessage;

    try {
        const result = await parseCommand(messageText, body);

        if (result.functionCalls && result.functionCalls.length > 0) {
            const functionCall = result.functionCalls[0];
            const { name, args } = functionCall;

            const logEvent = async (event: { type: string; status: 'success' | 'error'; message: string; meta?: any }) => {
                if (!backendUrl) return; // best-effort logging
                const payload = {
                    event: {
                        type: event.type,
                        status: event.status,
                        message: event.message,
                        meta: event.meta || null,
                        userEmail: auth.userProfile?.email || null,
                        timestamp: new Date().toISOString(),
                        retention_days: 30
                    }
                };
                try { await callBackend(backendUrl, 'log_event', payload); } catch {}
            };

            if (name === 'send_emails') {
                if (!auth.isLoggedIn) {
                    assistantResponse = { id: Date.now().toString(), sender: 'assistant', text: "Please sign in with your Google Account first to send emails." };
                } else if (!backendUrl) {
                    assistantResponse = { id: Date.now().toString(), sender: 'assistant', text: "I can't send emails without the Backend Service URL. Please configure it in the assistant's settings (cog icon)." };
                } else {
                    try {
                        const tokenResponse = await requestGapiToken();
                        const sendPayload = {
                          recipients,
                          subject,
                          body,
                          userEmail: auth.userProfile?.email || null
                        };
                        const apiResult = await callBackend(backendUrl, 'send', sendPayload, tokenResponse.access_token);
                        if (apiResult.success) {
                            assistantResponse = { 
                                id: Date.now().toString(), 
                                sender: 'assistant', 
                                text: "The send command was successfully executed. Here is the result:",
                                data: { type: 'send', payload: apiResult.data }
                            };
                            logEvent({ type: 'send', status: 'success', message: 'Send executed', meta: apiResult.data });
                        } else {
                             assistantResponse = { id: Date.now().toString(), sender: 'assistant', text: `There was an error: ${apiResult.error}` };
                             logEvent({ type: 'send', status: 'error', message: apiResult.error || 'Unknown error' });
                        }
                    } catch (tokenError) {
                         const errorMessage = tokenError instanceof Error ? tokenError.message : "An unknown authorization error occurred.";
                         assistantResponse = { id: Date.now().toString(), sender: 'assistant', text: `Authorization failed: ${errorMessage}` };
                         logEvent({ type: 'send', status: 'error', message: `auth_failed: ${errorMessage}` });
                    }
                }
            } else if (name === 'get_stats' || name === 'preview_emails') {
                if (!backendUrl) {
                    assistantResponse = { id: Date.now().toString(), sender: 'assistant', text: "I can't do that without the Backend Service URL. Please configure it in the assistant's settings (cog icon)." };
                } else {
                    const actionMap: Record<string, string> = { get_stats: 'stats', preview_emails: 'preview' };
                    const action = actionMap[name];
                    // For preview, pass the current recipients and template to generate previews server-side.
                    const previewPayload = name === 'preview_emails'
                      ? {
                          recipients: (args?.count && Number(args.count) > 0)
                            ? recipients.slice(0, Math.min(Number(args.count), recipients.length))
                            : recipients,
                          subject,
                          body
                        }
                      : {};
                    const apiResult = await callBackend(backendUrl, action, previewPayload);
                    
                    if (apiResult.success) {
                        const successMessages: Record<string, string> = {
                            stats: `Here are the latest stats from your sheet:`,
                            preview: `Here are the previews from your sheet:`,
                        };
                        assistantResponse = { 
                            id: Date.now().toString(), 
                            sender: 'assistant', 
                            text: successMessages[action] || "Action completed.",
                            data: { type: action, payload: apiResult.data }
                        };
                        logEvent({ type: action, status: 'success', message: `${action} executed`, meta: apiResult.data });
                    } else {
                        assistantResponse = { id: Date.now().toString(), sender: 'assistant', text: `There was an error: ${apiResult.error}` };
                        logEvent({ type: action, status: 'error', message: apiResult.error || 'Unknown error' });
                    }
                }
            } else if (name === 'draft_email') {
                 const enhancedBody = await enhanceEmailTemplate((args.current_body as string) ?? body, args.prompt as string);
                 assistantResponse = {
                    id: Date.now().toString(),
                    sender: 'assistant',
                    text: "Here's a draft based on your request. You can ask for more changes or use it in the editor.",
                    data: { type: 'draft', payload: enhancedBody }
                 };
            } else {
                 assistantResponse = { id: Date.now().toString(), sender: 'assistant', text: "I understood the action but I'm not sure how to handle that function." };
            }
        } else if (result.text) {
             assistantResponse = { id: Date.now().toString(), sender: 'assistant', text: result.text };
        } else {
            assistantResponse = { id: Date.now().toString(), sender: 'assistant', text: "I'm not sure how to respond to that. Please try rephrasing your request." };
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        assistantResponse = { id: Date.now().toString(), sender: 'assistant', text: `Sorry, I ran into an issue: ${errorMessage}` };
    }
    
    setMessages(prev => [...prev, assistantResponse]);
    setIsAssistantLoading(false);
  };

  const executeSend = async () => {
    if (!backendUrl) {
      setSendAlert({ type: 'error', message: 'Backend URL is not configured.' });
      return;
    }
    if (!auth.isLoggedIn) {
      setSendAlert({ type: 'error', message: 'Please sign in with Google to send emails.' });
      return;
    }

    // Filter to only selected recipients
    const selectedRecipientsArray = recipients.filter((_, index) => selectedRecipients.has(index));

    if (selectedRecipientsArray.length === 0) {
      setSendAlert({ type: 'error', message: 'No recipients selected. Please select at least one recipient.' });
      return;
    }

    try {
      setIsSending(true);
      const tokenResponse = await requestGapiToken();
      const payload = {
        recipients: selectedRecipientsArray,
        subject,
        body,
        userEmail: auth.userProfile?.email || null
      };

      // Add a message to the assistant showing we're sending
      const sendingMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `Sending ${selectedRecipientsArray.length} personalized email${selectedRecipientsArray.length !== 1 ? 's' : ''}...`
      };
      setMessages(prev => [...prev, sendingMessage]);

      const apiResult = await callBackend(backendUrl, 'send', payload, tokenResponse.access_token);

      // Add result to assistant and auto-open it
      if (apiResult.success) {
        const resultMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Emails sent successfully!',
          data: { type: 'send', payload: apiResult.data }
        };
        setMessages(prev => [...prev, resultMessage]);
        setIsAssistantOpen(true); // Auto-open to show results
        setSendAlert({ type: 'success', message: `Send completed for ${selectedRecipientsArray.length} recipient${selectedRecipientsArray.length !== 1 ? 's' : ''}.` });
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: `Send failed: ${apiResult.error}`
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsAssistantOpen(true); // Auto-open to show error
        setSendAlert({ type: 'error', message: apiResult.error || 'Send failed. Check assistant for details.' });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `Authorization or network error: ${msg}`
      };
      setMessages(prev => [...prev, errorMessage]);
      setSendAlert({ type: 'error', message: msg });
    } finally {
      setIsSending(false);
    }
  };

  // P0: Confirmation with 5s undo countdown
  const handleSendAll = () => {
    // Basic guardrails for empty recipients or missing headers
    if (!recipients || recipients.length === 0) {
      setSendAlert({ type: 'error', message: 'No recipients found. Please add recipient data first.' });
      return;
    }
    if (selectedRecipients.size === 0) {
      setSendAlert({ type: 'error', message: 'No recipients selected. Please select at least one recipient.' });
      return;
    }
    setIsConfirmOpen(true);
    countdownRef.current = 5;
  };

  const confirmAndStartCountdown = () => {
    setIsConfirmOpen(false);
    setSendAlert({ type: 'info', message: `Sending in ${countdownRef.current}s… You can undo.` });
    // Update countdown every second
    const tick = () => {
      countdownRef.current -= 1;
      if (countdownRef.current > 0) {
        setSendAlert({ type: 'info', message: `Sending in ${countdownRef.current}s… You can undo.` });
        countdownTimerRef.current = window.setTimeout(tick, 1000);
      } else {
        setSendAlert(null);
        executeSend();
        countdownTimerRef.current = null;
      }
    };
    countdownTimerRef.current = window.setTimeout(tick, 1000);
  };

  const undoSend = () => {
    if (countdownTimerRef.current) {
      window.clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
      setSendAlert({ type: 'error', message: 'Send cancelled.' });
      // Clear the message after a moment
      window.setTimeout(() => setSendAlert(null), 3000);
    }
  };

  // Import contacts from Google People API and map to recipients
  const importFromGoogleContacts = async () => {
    try {
      const token = await requestGapiToken();
      const results: Recipient[] = [];
      const seen = new Set<string>();
      let pageToken = '';
      let fetched = 0;
      const max = 1000;
      do {
        const url = new URL('https://people.googleapis.com/v1/people/me/connections');
        url.searchParams.set('personFields', 'names,emailAddresses');
        url.searchParams.set('pageSize', '200');
        if (pageToken) url.searchParams.set('pageToken', pageToken);
        const resp = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token.access_token}` } });
        if (!resp.ok) {
          const errorText = await resp.text();
          throw new Error(`Failed to fetch contacts: ${resp.status} - ${errorText}`);
        }
        const data = await resp.json();
        const connections = Array.isArray(data.connections) ? data.connections : [];
        for (const p of connections) {
          const email = p?.emailAddresses?.[0]?.value || '';
          const name = p?.names?.[0]?.displayName || '';
          if (email && !seen.has(email.toLowerCase())) {
            seen.add(email.toLowerCase());
            results.push({ Email: email, Name: name });
            fetched++;
            if (fetched >= max) break;
          }
        }
        pageToken = data.nextPageToken || '';
        if (fetched >= max) break;
      } while (pageToken);

      const parsed: Recipient[] = results;
      if (parsed.length > 0) {
        handleDataParsed(['Email', 'Name'], parsed);
      } else {
        setParsingError('No contacts with emails were found.');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error importing contacts';
      setParsingError(msg);
    }
  };


  // If not logged in, show login gate
  if (!auth.isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <div className="inline-block mb-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-cyan-400 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/30 animate-pulse">
              <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <h1 className="text-6xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-6">
            AI Mail Merge Assistant
          </h1>

          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Send personalized emails to your team with AI-powered templates
          </p>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Sign in to get started</h2>
            <p className="text-gray-400 mb-6">Sign in with your Google account to access the mail merge assistant</p>

            <div className="flex justify-center">
              <div id="google-signin-button"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-1">Import Contacts</h3>
              <p className="text-sm text-gray-400">Import up to 1000 contacts from Google Contacts</p>
            </div>

            <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-1">Personalize Templates</h3>
              <p className="text-sm text-gray-400">Use placeholders like {'{{Name}}'} for personalization</p>
            </div>

            <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4">
              <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-1">Select Recipients</h3>
              <p className="text-sm text-gray-400">Choose exactly who receives your emails</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <GoogleAuth auth={auth} onLogout={handleLogout} />

          <header className="text-center mb-12 pt-8">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-4">
              AI Mail Merge Assistant
            </h1>
            <p className="mt-3 text-xl text-gray-300 max-w-2xl mx-auto">
              Send personalized emails to your team with AI-powered templates
            </p>
            {auth.isLoggedIn && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Ready to send to {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}
              </div>
            )}
          </header>

          {parsingError && (
            <div className="max-w-4xl mx-auto mb-8 bg-red-900/20 border border-red-500/30 text-red-300 px-6 py-4 rounded-xl backdrop-blur-sm shadow-lg" role="alert">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong className="font-bold">Warning: </strong>
                  <span>{parsingError}</span>
                </div>
              </div>
            </div>
          )}

          <main className="grid grid-cols-1 xl:grid-cols-5 gap-6 lg:gap-8">
            <div className="xl:col-span-3 space-y-6">
              <DataInput onDataParsed={handleDataParsed} setParsingError={setParsingError} onImportFromContacts={importFromGoogleContacts} />
              <TemplateEditor
                subject={subject}
                setSubject={setSubject}
                body={body}
                setBody={setBody}
                headers={headers}
              />
            </div>
            <div className="xl:col-span-2 xl:sticky xl:top-6 self-start">
              <Preview
                recipients={recipients}
                subjectTemplate={subject}
                bodyTemplate={body}
                onSendEmails={handleSendAll}
                isSending={isSending}
                alert={sendAlert}
                onUndo={undoSend}
                selectedRecipients={selectedRecipients}
                onToggleRecipient={handleToggleRecipient}
                onToggleAll={handleToggleAll}
              />
            </div>
          </main>
          
          <footer className="text-center mt-16 py-8 border-t border-gray-700/50">
            <p className="text-sm text-gray-400">
              Powered by React, Tailwind CSS, and Google Gemini API
            </p>
          </footer>
        </div>
      </div>
      
      <AIAssistant 
        messages={messages} 
        onSendMessage={handleSendMessage} 
        isLoading={isAssistantLoading}
        backendUrl={backendUrl}
        setBackendUrl={setBackendUrl}
        updateTemplate={updateTemplate}
        isOpen={isAssistantOpen}
        setIsOpen={setIsAssistantOpen}
      />

      {/* P0: Send confirmation modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setIsConfirmOpen(false)}>
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-11/12 max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-3">Confirm send</h3>
            <p className="text-gray-300 mb-4">You are about to send <span className="font-semibold">{selectedRecipients.size}</span> personalized email{selectedRecipients.size !== 1 ? 's' : ''}.</p>
            <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-3 text-sm mb-4">
              <p><span className="text-gray-400">From:</span> {auth.userProfile?.email || 'Your Google Account'}</p>
              <p className="truncate"><span className="text-gray-400">Subject:</span> {subject || '(empty)'}</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsConfirmOpen(false)} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">Cancel</button>
              <button onClick={confirmAndStartCountdown} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md">Send in 5s</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
