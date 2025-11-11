import React, { useState, useCallback, useEffect } from 'react';
import { JsonPrompt } from './types';
import * as geminiService from './services/geminiService';

// --- ICONS ---
const CopyIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const MagicWandIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-2.122.568l-4.24 4.24a1.5 1.5 0 0 0 2.12 2.122l4.24-4.24a3 3 0 0 0-.568-2.122ZM11.978 15.61c-3.132 0-5.657-2.525-5.657-5.657s2.525-5.657 5.657-5.657 5.657 2.525 5.657 5.657-2.525 5.657-5.657 5.657ZM9.53 2.553a2.553 2.553 0 0 1 3.61 0l1.06 1.06a2.553 2.553 0 0 1 0 3.61l-1.06 1.06a2.553 2.553 0 0 1-3.61 0l-1.06-1.06a2.553 2.553 0 0 1 0-3.61l1.06-1.06Z" />
    </svg>
);

const Spinner: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const KeyIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6 text-medium-text" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
    </svg>
);

// --- HELPER FUNCTIONS ---
const formatJsonPrompt = (prompt: JsonPrompt): string => {
    const keyOrder = ['concept', 'composition', 'color', 'background', 'mood', 'style', 'settings'];
    return JSON.stringify(prompt, keyOrder, 2);
};

// --- API KEY MODAL COMPONENT ---
interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (key: string) => void;
}
const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
    const [key, setKey] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        if (key.trim()) {
            onSave(key.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in" aria-modal="true" role="dialog">
            <div className="bg-dark-card rounded-lg p-6 sm:p-8 max-w-md w-full border border-dark-border m-4">
                <h2 className="text-2xl font-bold mb-4">Enter Your Gemini API Key</h2>
                <p className="text-medium-text mb-6">
                    You can get a free API key from{' '}
                    <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline font-semibold">
                        Google AI Studio
                    </a>. Your key is only stored in your browser.
                </p>
                <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    placeholder="Paste your API key here"
                    className="w-full bg-gray-800 border border-dark-border rounded-md px-4 py-3 mb-6 text-light-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    aria-label="Gemini API Key"
                />
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2 px-4 rounded-md transition-colors">
                        Save Key
                    </button>
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [userInput, setUserInput] = useState<string>('');
    const [generatedTitle, setGeneratedTitle] = useState<string>('');
    const [jsonPrompt, setJsonPrompt] = useState<JsonPrompt | null>(null);
    const [iframeUrl, setIframeUrl] = useState<string>('');
    const [showIframe, setShowIframe] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isCreatingPrompt, setIsCreatingPrompt] = useState<boolean>(false);
    const [isModifying, setIsModifying] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState<'title' | 'prompt' | ''>('');
    const [jsonString, setJsonString] = useState('');
    const [apiKey, setApiKey] = useState<string>('');
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

    useEffect(() => {
        const savedKey = localStorage.getItem('gemini-api-key');
        if (savedKey) {
            setApiKey(savedKey);
        } else {
            setIsApiKeyModalOpen(true);
        }
    }, []);

    const handleSaveApiKey = (key: string) => {
        setApiKey(key);
        localStorage.setItem('gemini-api-key', key);
        setIsApiKeyModalOpen(false);
        setError(null); // Clear previous errors
    };
    
    const handleApiCall = async <T,>(apiFunc: () => Promise<T>): Promise<T | null> => {
        if (!apiKey) {
            setError("Please set your Gemini API Key before generating.");
            setIsApiKeyModalOpen(true);
            return null;
        }
        setError(null);
        try {
            return await apiFunc();
        } catch (e: any) {
            setError(e.message || 'An unknown error occurred.');
            if (e.message.toLowerCase().includes('api key')) {
                setIsApiKeyModalOpen(true);
            }
            return null;
        }
    };
    
    const handleGenerate = useCallback(async () => {
        if (!userInput.trim()) {
            setError('Please enter a keyword.');
            return;
        }
        setIsLoading(true);
        setGeneratedTitle('');
        setJsonPrompt(null);
        setJsonString('');
        setShowIframe(false);
        setIframeUrl('');

        const title = await handleApiCall(() => geminiService.generateTitle(userInput, apiKey));
        if(title) {
            setGeneratedTitle(title);
        }
        setIsLoading(false);
    }, [userInput, apiKey]);

    const handleCreateJsonPrompt = async () => {
        if (!generatedTitle) return;
        setIsCreatingPrompt(true);
        const prompt = await handleApiCall(() => geminiService.generateJsonPrompt(generatedTitle, apiKey));
        if(prompt) {
            setJsonPrompt(prompt);
            setJsonString(formatJsonPrompt(prompt));
        }
        setIsCreatingPrompt(false);
    };

    const handleCopy = (textToCopy: string, type: 'title' | 'prompt') => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopySuccess(type);
            setTimeout(() => setCopySuccess(''), 2000);
        }, (err) => {
            console.error('Could not copy text: ', err);
            setError('Failed to copy. Please try again.');
        });
    };

    const handleCheckKeywords = () => {
        setJsonPrompt(null);
        setJsonString('');
        const encodedTitle = encodeURIComponent(generatedTitle);
        const url = `https://www.mykeyworder.com/keywords?language=en&tags=${encodedTitle}`;
        setIframeUrl(url);
        setShowIframe(true);
    };

    const handleModifyPrompt = async (modificationType: 'color' | 'style') => {
        if (!jsonPrompt) return;
        setIsModifying(modificationType);
        
        let updatedFields: Partial<JsonPrompt> | null;
        if (modificationType === 'color') {
            updatedFields = await handleApiCall(() => geminiService.changeColor(jsonPrompt, apiKey));
        } else {
            updatedFields = await handleApiCall(() => geminiService.changeStyle(jsonPrompt, apiKey));
        }
        
        if (updatedFields) {
            const newPrompt = { ...jsonPrompt, ...updatedFields };
            setJsonPrompt(newPrompt);
            setJsonString(formatJsonPrompt(newPrompt));
        }
        setIsModifying(null);
    };

    const charCount = jsonString.length;
    const charCountColor = charCount > 910 ? 'text-red-400' : 'text-green-400';
    const gridLayoutClass = showIframe ? 'lg:grid-cols-2' : 'lg:grid-cols-1';

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} onSave={handleSaveApiKey} />
            <header className="text-center mb-8 relative">
                <button
                    onClick={() => setIsApiKeyModalOpen(true)}
                    className="absolute top-0 right-0 bg-dark-card p-2 rounded-full hover:bg-gray-700 transition-colors"
                    aria-label="Set API Key"
                >
                    <KeyIcon />
                </button>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
                    Microstock Title & Prompt Generator
                </h1>
                <p className="mt-4 text-lg text-medium-text max-w-2xl mx-auto">
                    Enter a keyword to generate an SEO-optimized title and a detailed JSON prompt for AI image generation.
                </p>
            </header>

            <main className="max-w-7xl mx-auto">
                <div className="bg-dark-card shadow-lg rounded-lg p-6 border border-dark-border mb-8 max-w-4xl mx-auto">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                            placeholder="e.g., Christmas Tree, Vintage Flowers"
                            className="flex-grow bg-gray-800 border border-dark-border rounded-md px-4 py-3 text-light-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary transition duration-200"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="flex items-center justify-center bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3 px-6 rounded-md transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                  <Spinner className="-ml-1 mr-3 h-5 w-5 text-white" />
                                  Generating...
                                </>
                            ) : (
                                "Generate Title"
                            )}
                        </button>
                    </div>
                </div>

                {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-8 max-w-4xl mx-auto" role="alert">{error}</div>}

                <div className={`grid ${gridLayoutClass} gap-8`}>
                    <div className="flex flex-col gap-8">
                        {generatedTitle && (
                            <div className="bg-dark-card shadow-lg rounded-lg p-6 border border-dark-border animate-fade-in">
                                <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Generated Title</h2>
                                <p className="text-medium-text mb-4 bg-gray-800 p-4 rounded-md">{generatedTitle}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <button onClick={handleCheckKeywords} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-md transition duration-200 w-full justify-center">
                                        <CheckIcon /> Check Keywords
                                    </button>
                                    <button
                                        onClick={handleCreateJsonPrompt}
                                        disabled={isCreatingPrompt}
                                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-md transition duration-200 w-full justify-center disabled:bg-gray-500"
                                    >
                                        {isCreatingPrompt ? <Spinner /> : <MagicWandIcon />}
                                        Create JSON
                                    </button>
                                    <button onClick={() => handleCopy(generatedTitle, 'title')} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-light-text font-semibold py-2 px-4 rounded-md transition duration-200 w-full justify-center col-span-1 sm:col-span-2 lg:col-span-1">
                                        <CopyIcon /> {copySuccess === 'title' ? 'Copied!' : 'Copy Title'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {jsonPrompt && (
                             <div className="bg-dark-card shadow-lg rounded-lg p-6 border border-dark-border animate-fade-in">
                                <div className="flex justify-between items-center mb-4">
                                     <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">JSON Prompt</h2>
                                     <span className={`text-sm font-mono ${charCountColor}`}>{charCount} / 910 characters</span>
                                </div>
                                <pre className="text-sm bg-gray-800 p-4 rounded-md overflow-x-auto text-light-text whitespace-pre-wrap">
                                    <code>{jsonString}</code>
                                </pre>
                                <div className="mt-4 flex flex-col sm:flex-row gap-4">
                                    <button onClick={() => handleModifyPrompt('color')} disabled={!!isModifying} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-light-text font-semibold py-2 px-4 rounded-md transition duration-200 w-full justify-center disabled:opacity-50">
                                        {isModifying === 'color' ? <Spinner className="mr-2"/> : <MagicWandIcon />} Change Color
                                    </button>
                                    <button onClick={() => handleModifyPrompt('style')} disabled={!!isModifying} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-light-text font-semibold py-2 px-4 rounded-md transition duration-200 w-full justify-center disabled:opacity-50">
                                       {isModifying === 'style' ? <Spinner className="mr-2"/> : <MagicWandIcon />} Change Style
                                    </button>
                                    <button onClick={() => handleCopy(jsonString, 'prompt')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-md transition duration-200 w-full justify-center">
                                        <CopyIcon /> {copySuccess === 'prompt' ? 'Copied!' : 'Copy JSON'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {showIframe && (
                        <div className="animate-fade-in lg:sticky lg:top-8">
                            <div className="bg-dark-card shadow-lg rounded-lg border border-dark-border w-full h-[80vh]">
                                <iframe src={iframeUrl} className="w-full h-full rounded-lg" title="MyKeyworder Keyword Checker"></iframe>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;