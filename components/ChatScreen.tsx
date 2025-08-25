import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { ChatConfig, Message, Role } from '../types';
import { SendIcon, UploadIcon, BackIcon, RestartIcon } from '../constants';

interface ChatScreenProps {
    config: ChatConfig;
    onReset: () => void;
}

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.role === Role.USER;

    const renderMathText = (text: string): React.ReactNode => {
        // This function parses text to find math exponents (like x^2) and renders them correctly
        // as superscript, while also enforcing Left-to-Right (LTR) direction for the math expression
        // to prevent rendering issues in a Right-to-Left (RTL) context.
        const parts = text.split(/(\^[\w\d.()-]+)/g);
        const elements: (string | JSX.Element)[] = [];

        for (let i = 0; i < parts.length; i++) {
            const currentPart = parts[i];

            if (currentPart.startsWith('^') && elements.length > 0) {
                const prevPart = elements.pop();
                
                // Ensure prevPart is a string before matching
                if (typeof prevPart === 'string') {
                    // Regex to extract a potential math 'base' from the end of the previous text part.
                    // It looks for a number, a variable, or a parenthesized expression.
                    const baseRegex = /([\w\d.]+|\([^)]+\))$/;
                    const match = prevPart.match(baseRegex);

                    if (match) {
                        const base = match[0];
                        const remainingText = prevPart.substring(0, prevPart.length - base.length);

                        if (remainingText) {
                            elements.push(remainingText);
                        }

                        elements.push(
                            <span key={i} dir="ltr" style={{ display: 'inline-block' }}>
                                {base}<sup>{currentPart.substring(1)}</sup>
                            </span>
                        );
                    } else {
                        // If no clear base is found, revert to pushing parts separately.
                        elements.push(prevPart);
                        elements.push(currentPart);
                    }
                } else {
                    // If prevPart is not a string (i.e., already a JSX element), don't try to process it.
                    if(prevPart) elements.push(prevPart);
                    elements.push(currentPart);
                }

            } else if (currentPart) {
                elements.push(currentPart);
            }
        }

        return <>{elements}</>;
    };


    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl lg:max-w-2xl px-5 py-3 rounded-2xl shadow-md ${isUser ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                {message.image && <img src={message.image} alt="Uploaded problem" className="rounded-lg mb-2 max-h-64" />}
                <p className="whitespace-pre-wrap">{renderMathText(message.text)}</p>
            </div>
        </div>
    );
};

const ChatScreen: React.FC<ChatScreenProps> = ({ config, onReset }) => {
    const { messages, isLoading, sendMessage } = useChat(config);
    const [inputText, setInputText] = useState('');
    const [imageBase64, setImageBase64] = useState<string>('');
    const [showQuickReplies, setShowQuickReplies] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        if (messages.length === 1 && lastMessage?.role === Role.BOT) {
            setShowQuickReplies(true);
        }
    }, [messages]);
    
    const handleSend = () => {
        if ((!inputText.trim() && !imageBase64) || isLoading) return;
        setShowQuickReplies(false);
        sendMessage(inputText, imageBase64);
        setInputText('');
        setImageBase64('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleQuickReply = (text: string) => {
        if (isLoading) return;
        setShowQuickReplies(false);
        sendMessage(text);
    };

    const handleUploadClick = () => {
        setShowQuickReplies(false);
        fileInputRef.current?.click();
    };
    
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).replace('data:', '').replace(/^.+,/, '');
                setImageBase64(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <header className="bg-white dark:bg-gray-800 shadow-sm p-3 flex justify-between items-center z-10">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">שיחה עם אישימתי</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">נושא: {config.topic}</p>
                </div>
                <div className="flex gap-2">
                     <button onClick={onReset} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        <RestartIcon />
                        התחלה חדשה
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100 dark:bg-gray-900">
                <div className="space-y-6">
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                    {isLoading && messages.length > 0 && (
                        <div className="flex justify-start">
                           <div className="px-5 py-3 rounded-2xl shadow-md bg-white dark:bg-gray-700 rounded-bl-none">
                             <div className="flex items-center space-x-2 space-x-reverse">
                               <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                               <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                               <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                             </div>
                           </div>
                        </div>
                    )}
                    {showQuickReplies && !isLoading && (
                        <div className="flex justify-start gap-3 px-1 pt-2">
                             <button onClick={() => handleQuickReply('אשמח לתרגיל לדוגמא')} className="px-4 py-2 bg-white dark:bg-gray-700 border border-blue-500 text-blue-500 dark:text-blue-400 rounded-full text-sm font-semibold hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors shadow-sm">
                                תרגיל לדוגמא
                            </button>
                             <button onClick={handleUploadClick} className="px-4 py-2 bg-white dark:bg-gray-700 border border-blue-500 text-blue-500 dark:text-blue-400 rounded-full text-sm font-semibold hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors shadow-sm">
                                לצרף צילום תרגיל
                            </button>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>
            
            <footer className="bg-white dark:bg-gray-800 p-3 border-t dark:border-gray-700">
                <div className="max-w-4xl mx-auto flex items-center gap-2">
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <button onClick={handleUploadClick} title="צרף צילום תרגיל" className={`p-2 rounded-full transition-colors ${imageBase64 ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                        <UploadIcon />
                    </button>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                        placeholder="כתוב הודעה או צרף צילום של תרגיל..."
                        className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl resize-none border-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={1}
                    />
                    <button onClick={handleSend} disabled={(!inputText.trim() && !imageBase64) || isLoading} className="p-3 bg-blue-600 text-white rounded-full disabled:bg-gray-400 hover:bg-blue-700 transition-colors">
                        <SendIcon />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default ChatScreen;