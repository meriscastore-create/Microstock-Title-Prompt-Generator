
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { JsonPrompt, TopicCategory, KeywordSuggestion } from './types';
import * as geminiService from './services/geminiService';

// --- ICONS ---
const CopyIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
  </svg>
);

const KeywordCheckerIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const MagicWandIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-2.122.568l-4.24 4.24a1.5 1.5 0 0 0 2.12 2.122l4.24-4.24a3 3 0 0 0-.568-2.122ZM11.978 15.61c-3.132 0-5.657-2.525-5.657-5.657s2.525-5.657 5.657-5.657 5.657 2.525 5.657 5.657-2.525 5.657-5.657 5.657ZM9.53 2.553a2.553 2.553 0 0 1 3.61 0l1.06 1.06a2.553 2.553 0 0 1 0 3.61l-1.06 1.06a2.553 2.553 0 0 1-3.61 0l-1.06-1.06a2.553 2.553 0 0 1 0-3.61l1.06-1.06Z" />
    </svg>
);

const RefreshIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-3.181-3.182-3.182 3.182a8.25 8.25 0 0 1-11.667 0l-3.181-3.182m3.181 3.182L6.341 12.66m11.314 0-3.181 3.182" />
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

const LightbulbIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a7.5 7.5 0 0 1-7.5 0c-1.421 0-2.8-.31-4.097-.862a1.12 1.12 0 0 1-.614-1.28L6 14.25M12 18h.008M18 14.25l.89-1.522a1.12 1.12 0 0 1 .614-1.28c1.3-.552 2.678-.862 4.097-.862a7.5 7.5 0 0 1-7.5 0c-1.42 0-2.8.31-4.097-.862a1.12 1.12 0 0 1-.614 1.28L6 14.25m12 0a12.06 12.06 0 0 0-4.5 0m3.75-2.311a7.5 7.5 0 0 0-7.5 0c-1.42 0-2.8.31-4.097-.862a1.12 1.12 0 0 0-.614 1.28L6 14.25" />
    </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const SlidersIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
    </svg>
);

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);


// --- TYPES ---
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

// --- CONSTANTS ---
const STYLE_PREFERENCES = [
    'Creative', 'Minimalist', 'Elegant', 'Trendy', 'Organic', 'Hand-Drawn', 
    'Geometric', 'Cute', 'Pastel', 'Vintage', 'Whimsical', 'Boho', 
    'Cottagecore', 'Flat', 'Abstract', 'Art Deco', 'Memphis', 'Line Art',
    'Ukiyo-e', 'Psychedelic', 'Gothic', 'Steampunk', 'Luxury', 'Modern', 'Kawaii'
];


// --- HELPER FUNCTIONS ---
const formatJsonPrompt = (prompt: JsonPrompt): string => {
    const keyOrder = ['concept', 'composition', 'color', 'background', 'mood', 'style', 'settings'];
    return JSON.stringify(prompt, keyOrder, 2);
};

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


// --- COMPONENTS ---
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-600/90 border-green-700' : 'bg-red-600/90 border-red-700';

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg shadow-lg text-white border backdrop-blur-sm ${bgColor} animate-fade-in`}>
      <span className="pr-4">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100">&times;</button>
    </div>
  );
};

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

interface StylePreferencesPopoverProps {
    isOpen: boolean;
    onClose: () => void;
    preferences: string[];
    selectedPreferences: string[];
    onToggle: (preference: string) => void;
    anchorRef: React.RefObject<HTMLButtonElement>;
}

const StylePreferencesPopover: React.FC<StylePreferencesPopoverProps> = ({ isOpen, onClose, preferences, selectedPreferences, onToggle, anchorRef }) => {
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && anchorRef.current && !anchorRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, anchorRef]);

    if (!isOpen) return null;

    return (
        <div ref={popoverRef} className="absolute z-20 mt-2 w-80 sm:w-96 bg-dark-card border border-dark-border rounded-lg shadow-xl p-4 right-0 animate-fade-in">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg text-light-text">Style Preferences</h3>
                <button onClick={onClose} className="text-medium-text hover:text-light-text">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-2">
                {preferences.map(pref => (
                    <button
                        key={pref}
                        onClick={() => onToggle(pref)}
                        className={`text-sm text-left p-2 rounded-md transition-colors duration-150 ${
                            selectedPreferences.includes(pref)
                                ? 'bg-brand-primary text-white font-semibold'
                                : 'bg-gray-800 hover:bg-gray-700 text-medium-text'
                        }`}
                    >
                        {pref}
                    </button>
                ))}
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [userInput, setUserInput] = useState<string>('');
    const [baseKeywords, setBaseKeywords] = useState<string>('');
    const [generatedTitle, setGeneratedTitle] = useState<string>('');
    const [jsonPrompt, setJsonPrompt] = useState<JsonPrompt | null>(null);
    const [iframeUrl, setIframeUrl] = useState<string>('');
    const [showIframe, setShowIframe] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRefreshingTitle, setIsRefreshingTitle] = useState<boolean>(false);
    const [isCreatingPrompt, setIsCreatingPrompt] = useState<boolean>(false);
    const [isModifying, setIsModifying] = useState<string | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [jsonString, setJsonString] = useState('');
    const [apiKey, setApiKey] = useState<string>('');
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
    
    // Suggestion System State
    const [topicCategories, setTopicCategories] = useState<TopicCategory[]>([]);
    const [activeTopicCategory, setActiveTopicCategory] = useState<string | null>(null);
    const [activeTopic, setActiveTopic] = useState<string | null>(null);
    const [specificKeywords, setSpecificKeywords] = useState<KeywordSuggestion[]>([]);
    const [isSuggestingTopics, setIsSuggestingTopics] = useState<boolean>(false);
    const [isSuggestingSpecifics, setIsSuggestingSpecifics] = useState<boolean>(false);
    const [showSuggestionArea, setShowSuggestionArea] = useState<boolean>(false);

    const [isCombining, setIsCombining] = useState<boolean>(false);
    const [styleHistory, setStyleHistory] = useState<string[]>([]);
    const [selectedStylePreferences, setSelectedStylePreferences] = useState<string[]>([]);
    const [isPreferencesOpen, setIsPreferencesOpen] = useState<boolean>(false);

    const preferencesButtonRef = useRef<HTMLButtonElement>(null);
    const styleRequestRef = useRef(0);


    useEffect(() => {
        const savedKey = localStorage.getItem('gemini-api-key');
        if (savedKey) {
            setApiKey(savedKey);
        } else {
            setIsApiKeyModalOpen(true);
        }
    }, []);

    const addToast = useCallback((message: string, type: 'success' | 'error') => {
        const id = Date.now() + Math.random();
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    }, []);
    
    const removeToast = (id: number) => {
        setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    };

    const handleSaveApiKey = (key: string) => {
        setApiKey(key);
        localStorage.setItem('gemini-api-key', key);
        setIsApiKeyModalOpen(false);
        addToast('API Key saved successfully!', 'success');
    };
    
    const handleApiCall = async <T,>(apiFunc: () => Promise<T>): Promise<T | null> => {
        if (!apiKey) {
            addToast("Please set your Gemini API Key.", 'error');
            setIsApiKeyModalOpen(true);
            return null;
        }
        try {
            return await apiFunc();
        } catch (e: any) {
             if (e.message !== "Request aborted by user.") {
                addToast(e.message || 'An unknown error occurred.', 'error');
            }
            if (e.message.toLowerCase().includes('api key')) {
                setIsApiKeyModalOpen(true);
            }
            return null;
        }
    };
    
    const handleGenerate = useCallback(async () => {
        if (!userInput.trim()) {
            addToast('Please enter a keyword.', 'error');
            return;
        }
        setIsLoading(true);
        setGeneratedTitle('');
        setJsonPrompt(null);
        setJsonString('');
        setShowIframe(false);
        setIframeUrl('');
        setShowSuggestionArea(false);
        setStyleHistory([]);

        const title = await handleApiCall(() => geminiService.generateTitle(userInput, apiKey));
        if(title) {
            setGeneratedTitle(title);
        }
        setIsLoading(false);
    }, [userInput, apiKey, addToast]);
    
    const handleClearInput = () => {
        setUserInput('');
        setBaseKeywords('');
        setGeneratedTitle('');
        setJsonPrompt(null);
        setJsonString('');
        setShowIframe(false);
        setIframeUrl('');
        setShowSuggestionArea(false);
        // Reset Suggestion State
        setActiveTopic(null);
        setSpecificKeywords([]);
        setStyleHistory([]);
        setSelectedStylePreferences([]);
    };

    const handleLoadTopics = async (forceRefresh: boolean = false) => {
        setShowSuggestionArea(true);
        setActiveTopic(null); // Reset deep dive view if re-opening
        setSpecificKeywords([]);

        if (topicCategories.length === 0 || forceRefresh) {
            setIsSuggestingTopics(true);
            if (forceRefresh) setTopicCategories([]); // Clear for visual feedback
            
            const categories = await handleApiCall(() => geminiService.generateBroadTopics(apiKey));
            if (categories) {
                setTopicCategories(categories);
            }
            setIsSuggestingTopics(false);
        }
    };

    const handleTopicClick = async (topic: string, category: string) => {
        setActiveTopic(topic);
        setActiveTopicCategory(category);
        setSpecificKeywords([]);
        setIsSuggestingSpecifics(true);

        const keywords = await handleApiCall(() => geminiService.generateSpecificTrends(topic, category, apiKey));
        if (keywords) {
            setSpecificKeywords(keywords);
        }
        setIsSuggestingSpecifics(false);
    };

    const handleBackToTopics = () => {
        setActiveTopic(null);
        setActiveTopicCategory(null);
        setSpecificKeywords([]);
    };

    const handleSelectFinalKeyword = (keyword: string) => {
        setUserInput(keyword);
        setBaseKeywords(keyword);
        setShowSuggestionArea(false);
    };

    const handleCombineKeyword = async () => {
        const baseForCombination = baseKeywords || userInput;
        if (!baseForCombination.trim()) return;

        if (!baseKeywords) {
            setBaseKeywords(baseForCombination);
        }
        
        setIsCombining(true);
        const uniqueKeyword = await handleApiCall(() => geminiService.generateUniqueKeywords(baseForCombination, apiKey));
        
        if (uniqueKeyword && uniqueKeyword.trim()) {
            const trendKeywords = baseForCombination.split(' ').map(k => k.trim().replace(/,$/, '')).filter(Boolean);
            const allKeywords = [...trendKeywords, uniqueKeyword.trim()];
            const shuffledKeywords = shuffleArray(allKeywords);
            setUserInput(shuffledKeywords.join(', '));
            addToast('Combination randomized!', 'success');
        }
        setIsCombining(false);
    };

    const handleRefreshTitleElements = async () => {
        if (!generatedTitle) return;

        setIsRefreshingTitle(true);
        // Reset downstream data that depends on the title
        setJsonPrompt(null);
        setJsonString('');
        setShowIframe(false);
        setIframeUrl('');
        setStyleHistory([]);

        const newTitle = await handleApiCall(() => geminiService.changeTitleElements(generatedTitle, apiKey));
        if (newTitle) {
            setGeneratedTitle(newTitle);
            addToast('Title elements have been refreshed!', 'success');
        }
        setIsRefreshingTitle(false);
    };

    const handleCreateJsonPrompt = async () => {
        if (!generatedTitle) return;
        setIsCreatingPrompt(true);
        setStyleHistory([]);
        const prompt = await handleApiCall(() => geminiService.generateJsonPrompt(generatedTitle, apiKey, selectedStylePreferences));
        if(prompt) {
            setJsonPrompt(prompt);
            setJsonString(formatJsonPrompt(prompt));
            setStyleHistory([prompt.style]);
        }
        setIsCreatingPrompt(false);
    };

    const handleCopy = (textToCopy: string, type: 'title' | 'prompt') => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            addToast(type === 'title' ? 'Title copied!' : 'JSON copied!', 'success');
        }, (err) => {
            console.error('Could not copy text: ', err);
            addToast('Failed to copy. Please try again.', 'error');
        });
    };

    const handleCheckKeywords = () => {
        setJsonPrompt(null);
        setJsonString('');
        setStyleHistory([]);
        const encodedTitle = encodeURIComponent(generatedTitle);
        const url = `https://www.mykeyworder.com/keywords?language=en&tags=${encodedTitle}`;
        setIframeUrl(url);
        setShowIframe(true);
    };

    const handleModifyPrompt = async (modificationType: 'color' | 'style') => {
        if (!jsonPrompt) return;
        setIsModifying(modificationType);
        
        const currentRequestId = ++styleRequestRef.current;
        
        let updatedFields: Partial<JsonPrompt> | null;
        if (modificationType === 'color') {
            updatedFields = await handleApiCall(() => geminiService.changeColor(jsonPrompt, apiKey));
        } else {
            updatedFields = await handleApiCall(() => geminiService.changeStyle(jsonPrompt, styleHistory, apiKey));
        }
        
        if (currentRequestId === styleRequestRef.current && updatedFields) {
            const newPrompt = { ...jsonPrompt, ...updatedFields };
            setJsonPrompt(newPrompt);
            setJsonString(formatJsonPrompt(newPrompt));
            if (modificationType === 'style' && updatedFields.style) {
                 setStyleHistory(prev => [...prev, updatedFields.style!]);
            }
             setIsModifying(null);
        }
    };
    
    const handleTogglePreference = (preference: string) => {
        setSelectedStylePreferences(prev => 
            prev.includes(preference) 
                ? prev.filter(p => p !== preference) 
                : [...prev, preference]
        );
    };

    const titleCharCount = generatedTitle.length;
    const titleCharCountColor = titleCharCount > 170 ? 'text-red-400' : 'text-green-400';
    const jsonCharCount = jsonString.length;
    const jsonCharCountColor = jsonCharCount > 910 ? 'text-red-400' : 'text-green-400';
    const gridLayoutClass = showIframe ? 'lg:grid-cols-2' : 'lg:grid-cols-1';

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div aria-live="assertive" className="fixed inset-0 flex items-start justify-end p-4 sm:p-6 z-50 pointer-events-none">
                <div className="w-full max-w-sm space-y-2">
                    {toasts.map((toast) => (
                        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
                    ))}
                </div>
            </div>

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
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative flex-grow w-full">
                             <input
                                type="text"
                                value={userInput}
                                onChange={(e) => {
                                    setUserInput(e.target.value);
                                    if(baseKeywords) setBaseKeywords(''); 
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                placeholder={
                                    isCombining 
                                    ? "Creating a new concept..." 
                                    : "e.g., Christmas Tree, Vintage Flowers"
                                }
                                disabled={isCombining}
                                className="w-full bg-gray-800 border border-dark-border rounded-md px-4 py-3 text-light-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary transition duration-200 pr-10 disabled:opacity-70"
                            />
                            {(isCombining) ? (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <Spinner className="w-5 h-5 text-brand-primary" />
                                </div>
                            ) : userInput && (
                                <button
                                    onClick={handleClearInput}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-medium-text hover:text-light-text transition-colors"
                                    aria-label="Clear input"
                                >
                                    <CloseIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        <div className="flex w-full sm:w-auto gap-4">
                             {userInput.trim().length > 0 ? (
                                <button
                                    onClick={handleCombineKeyword}
                                    disabled={isLoading || isCombining}
                                    className="flex-grow flex items-center justify-center bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-md transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
                                    title="Combine with a new unique keyword"
                                >
                                    {isCombining ? <Spinner /> : <MagicWandIcon />}
                                    <span className="hidden sm:inline sm:ml-2">Combine</span>
                                </button>
                             ) : (
                                <button
                                    onClick={() => handleLoadTopics(false)}
                                    disabled={isLoading || isSuggestingTopics}
                                    className="flex-grow flex items-center justify-center bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-md transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
                                    title="Suggest Trending Keywords"
                                >
                                    {isSuggestingTopics ? <Spinner /> : <LightbulbIcon />}
                                    <span className="hidden sm:inline sm:ml-2">Suggest</span>
                                </button>
                             )}
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || isSuggestingTopics || isCombining || !userInput.trim()}
                                className="flex-grow flex items-center justify-center bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3 px-6 rounded-md transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                      <Spinner className="-ml-1 mr-3 h-5 w-5 text-white" />
                                      Generating...
                                    </>
                                ) : (
                                    "Generate"
                                )}
                            </button>
                        </div>
                    </div>
                    
                    {/* SUGGESTION AREA */}
                    <div className={`transition-[max-height,opacity,margin] duration-500 ease-in-out ${showSuggestionArea ? 'max-h-[1200px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'} overflow-hidden`}>
                        {isSuggestingTopics ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="flex flex-col items-center gap-3">
                                    <Spinner className="h-10 w-10 text-brand-primary" />
                                    <p className="text-medium-text">Analyzing market trends...</p>
                                </div>
                            </div>
                        ) : activeTopic ? (
                            // LEVEL 2: SPECIFIC KEYWORDS VIEW
                            <div className="animate-fade-in p-2">
                                <div className="flex items-center gap-4 mb-6">
                                    <button 
                                        onClick={handleBackToTopics}
                                        className="flex items-center gap-2 text-medium-text hover:text-white transition-colors bg-gray-800/50 px-3 py-2 rounded-md"
                                    >
                                        <ChevronLeftIcon /> Back
                                    </button>
                                    <h3 className="text-xl font-bold text-white">
                                        Trends for: <span className="text-brand-primary">{activeTopic}</span>
                                    </h3>
                                </div>

                                {isSuggestingSpecifics ? (
                                    <div className="flex justify-center items-center py-12">
                                         <div className="flex flex-col items-center gap-3">
                                            <Spinner className="h-10 w-10 text-brand-secondary" />
                                            <p className="text-medium-text">Finding high-demand long-tail keywords...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {specificKeywords.map((kw, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSelectFinalKeyword(kw.name)}
                                                className="text-left p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md transition-all flex justify-between items-start group"
                                            >
                                                <span className="text-sm text-gray-200 group-hover:text-white pr-2">{kw.name}</span>
                                                <span className={`text-xs font-mono font-bold ${kw.score > 85 ? 'text-green-400' : 'text-yellow-400'}`}>
                                                    {kw.score}%
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : topicCategories.length > 0 ? (
                            // LEVEL 1: BROAD TOPICS VIEW
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-end">
                                    <button 
                                        onClick={() => handleLoadTopics(true)} 
                                        className="flex items-center gap-2 text-xs sm:text-sm text-medium-text hover:text-brand-primary transition-colors bg-gray-800 px-3 py-1.5 rounded-md border border-gray-700"
                                    >
                                        <RefreshIcon className="w-4 h-4" /> Refresh Trends
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {topicCategories.map((cat, idx) => (
                                        <div key={idx} className="flex flex-col h-full bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                                            <h3 className="font-bold text-lg mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 min-h-[3.5rem] flex items-center justify-center">
                                                {cat.category}
                                            </h3>
                                            <div className={`flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar ${cat.topics.length > 12 ? 'max-h-[400px]' : 'h-auto'}`}>
                                                {cat.topics.map((topic, tIdx) => (
                                                    <button
                                                        key={tIdx}
                                                        onClick={() => handleTopicClick(topic, cat.category)}
                                                        className="text-left px-3 py-2 rounded-md text-sm text-gray-300 hover:text-white hover:bg-brand-primary/20 hover:border-l-2 hover:border-brand-primary transition-all duration-150 bg-gray-900/50"
                                                    >
                                                        {topic}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>

                </div>

                <div className={`grid ${gridLayoutClass} gap-8`}>
                    <div className="flex flex-col gap-8">
                        {generatedTitle && (
                            <div className="bg-dark-card shadow-lg rounded-lg p-6 border border-dark-border animate-fade-in">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Generated Title</h2>
                                    <span className={`text-sm font-mono ${titleCharCountColor}`}>{titleCharCount} / 170 characters</span>
                                </div>
                                <p className="text-medium-text mb-4 bg-gray-800 p-4 rounded-md">{generatedTitle}</p>
                                
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={handleRefreshTitleElements}
                                        disabled={isCreatingPrompt || isRefreshingTitle}
                                        className="flex-1 flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-light-text font-semibold py-2 px-4 rounded-md transition duration-200 justify-center disabled:bg-gray-500"
                                        title="Refresh title elements"
                                    >
                                        {isRefreshingTitle ? <Spinner /> : <RefreshIcon />} Refresh Elements
                                    </button>

                                    <div className="relative flex w-full flex-1">
                                        <button
                                            onClick={handleCreateJsonPrompt}
                                            disabled={isCreatingPrompt || isRefreshingTitle}
                                            className="flex-grow flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-l-md transition duration-200 justify-center disabled:bg-gray-500"
                                        >
                                            {isCreatingPrompt ? <Spinner /> : <MagicWandIcon />}
                                            Create JSON
                                        </button>
                                        <button
                                            ref={preferencesButtonRef}
                                            onClick={() => setIsPreferencesOpen(prev => !prev)}
                                            className="flex items-center justify-center bg-purple-700 hover:bg-purple-600 border-l border-purple-800 text-white font-bold py-2 px-4 rounded-r-md transition duration-200 h-full"
                                            title="Set Style Preferences"
                                        >
                                            <SlidersIcon />
                                            {selectedStylePreferences.length > 0 && (
                                                <span className="absolute -top-2 -right-2 bg-brand-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                    {selectedStylePreferences.length}
                                                </span>
                                            )}
                                        </button>
                                        <StylePreferencesPopover 
                                            isOpen={isPreferencesOpen}
                                            onClose={() => setIsPreferencesOpen(false)}
                                            preferences={STYLE_PREFERENCES}
                                            selectedPreferences={selectedStylePreferences}
                                            onToggle={handleTogglePreference}
                                            anchorRef={preferencesButtonRef}
                                        />
                                    </div>

                                    <button onClick={() => handleCopy(generatedTitle, 'title')} className="flex-1 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-md transition duration-200 justify-center">
                                        <CopyIcon /> Copy Title
                                    </button>
                                </div>

                                <div className="mt-4">
                                     <button onClick={handleCheckKeywords} className="flex items-center gap-2 bg-indigo-600/50 hover:bg-indigo-500/50 text-white font-semibold py-2 px-4 rounded-md transition duration-200 w-full justify-center">
                                        <KeywordCheckerIcon /> Check Keywords on MyKeyworder
                                    </button>
                                </div>
                            </div>
                        )}

                        {jsonPrompt && (
                             <div className="bg-dark-card shadow-lg rounded-lg p-6 border border-dark-border animate-fade-in">
                                <div className="flex justify-between items-center mb-4">
                                     <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">JSON Prompt</h2>
                                     <span className={`text-sm font-mono ${jsonCharCountColor}`}>{jsonCharCount} / 910 characters</span>
                                </div>
                                <pre className="text-sm bg-gray-800 p-4 rounded-md overflow-x-auto text-light-text whitespace-pre-wrap">
                                    <code>{jsonString}</code>
                                </pre>
                                <div className="mt-4 flex flex-col sm:flex-row gap-4">
                                    <button onClick={() => handleModifyPrompt('color')} disabled={!!isModifying} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-light-text font-semibold py-2 px-4 rounded-md transition duration-200 w-full justify-center disabled:bg-gray-600 disabled:cursor-not-allowed">
                                        {isModifying === 'color' ? <Spinner /> : <MagicWandIcon />} Change Color
                                    </button>
                                    <button onClick={() => handleModifyPrompt('style')} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-light-text font-semibold py-2 px-4 rounded-md transition duration-200 w-full justify-center">
                                       {isModifying === 'style' ? <Spinner /> : <MagicWandIcon />} Change Style
                                    </button>
                                    <button onClick={() => handleCopy(jsonString, 'prompt')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-md transition duration-200 w-full justify-center">
                                        <CopyIcon /> Copy JSON
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