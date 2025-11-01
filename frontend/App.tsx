import React, { useState, useEffect, useRef } from 'react';
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

function App() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [subject, setSubject] = useState<string>('Special Offer for {{Name}}');
  const [body, setBody] = useState<string>('Hi {{Name}},\n\nWe have an exciting new product, the {{Product}}, that we think you\'ll love.\n\nBest regards,\nTeam Awesome');
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [backendUrl, setBackendUrl] = useState<string>('https://ai-mail-merge-assistant-nerx6mrxvq-uw.a.run.app');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'assistant', text: "Hello! I'm ready to help. Sign in with Google to send emails, or ask me to 'get stats', 'preview emails', or 'draft an email'. You can also import contacts from Google Contacts." }
  ]);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [auth, setAuth] = useState<AuthState>({ isLoggedIn: false, userProfile: null });
  const tokenClientRef = useRef<any>(null);


  useEffect(() => {
    // Auto-parse the default CSV data on initial load
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
    setRecipients(defaultRecipients);
  }, []);

  useEffect(() => {
    let tries = 0;
    const maxTries = 40; // ~10s at 250ms
    const interval = setInterval(() => {
      tries++;
      if (window.google && process.env.GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: process.env.GOOGLE_CLIENT_ID,
          callback: handleLoginSuccess,
        });
        const btn = document.getElementById('google-signin-button');
        if (btn) {
          window.google.accounts.id.renderButton(btn, { theme: 'outline', size: 'large' });
        }
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/contacts.readonly',
          callback: '', // Callback is handled by the promise
        });
        clearInterval(interval);
      } else if (tries >= maxTries) {
        clearInterval(interval);
        console.warn('Google Identity script not available yet.');
      }
    }, 250);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (response: any) => {
    const credential = response.credential;
    try {
      const payload = JSON.parse(atob(credential.split('.')[1]));
      setAuth({
        isLoggedIn: true,
        userProfile: {
          name: payload.name,
          email: payload.email,
          picture: payload.picture,
        },
      });
    } catch (e) {
      console.error("Error decoding JWT", e);
    }
  };

  const handleLogout = () => {
    setAuth({ isLoggedIn: false, userProfile: null });
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  const requestGapiToken = (): Promise<TokenResponse> => {
    return new Promise((resolve, reject) => {
      if (!tokenClientRef.current) {
        return reject(new Error("Google Auth is not initialized."));
      }
      tokenClientRef.current.callback = (tokenResponse: TokenResponse | { error: string }) => {
        if ('access_token' in tokenResponse) {
          resolve(tokenResponse);
        } else {
          reject(new Error(tokenResponse.error || "User did not grant consent."));
        }
      };
      tokenClientRef.current.requestAccessToken({ prompt: 'consent' });
    });
  };

  const handleDataParsed = (parsedHeaders: string[], parsedRecipients: Recipient[]) => {
    setHeaders(parsedHeaders);
    setRecipients(parsedRecipients);
  };

  const updateTemplate = (newSubject: string, newBody: string) => {
    setSubject(newSubject);
    setBody(newBody);
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

  const handleSendAll = async () => {
    if (!backendUrl) {
      alert('Backend URL is not configured.');
      return;
    }
    if (!auth.isLoggedIn) {
      alert('Please sign in with Google to send emails.');
      return;
    }
    try {
      setIsSending(true);
      const tokenResponse = await requestGapiToken();
      const payload = {
        recipients,
        subject,
        body,
        userEmail: auth.userProfile?.email || null
      };
      const apiResult = await callBackend(backendUrl, 'send', payload, tokenResponse.access_token);
      if (apiResult.success) {
        alert('Send triggered successfully. Check the assistant panel for details.');
      } else {
        alert(`Send failed: ${apiResult.error}`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      alert(`Authorization or network error: ${msg}`);
    } finally {
      setIsSending(false);
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


  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto relative">
        <GoogleAuth auth={auth} onLogout={handleLogout} />
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            AI Mail Merge Assistant
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Craft personalized emails and control your mail merge with natural language.
          </p>
        </header>

        {parsingError && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Parsing Error: </strong>
            <span className="block sm:inline">{parsingError}</span>
          </div>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <DataInput onDataParsed={handleDataParsed} setParsingError={setParsingError} onImportFromContacts={importFromGoogleContacts} />
            <TemplateEditor
              subject={subject}
              setSubject={setSubject}
              body={body}
              setBody={setBody}
              headers={headers}
            />
          </div>
          <div className="lg:sticky lg:top-8 self-start">
            <Preview
              recipients={recipients}
              subjectTemplate={subject}
              bodyTemplate={body}
              onSendEmails={handleSendAll}
              isSending={isSending}
            />
          </div>
        </main>
         <footer className="text-center mt-12 py-6 border-t border-gray-800">
            <p className="text-sm text-gray-500">
                Powered by React, Tailwind CSS, and the Google Gemini API.
            </p>
        </footer>
      </div>
       <AIAssistant 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isLoading={isAssistantLoading}
            backendUrl={backendUrl}
            setBackendUrl={setBackendUrl}
            updateTemplate={updateTemplate}
        />
    </div>
  );
}

export default App;
