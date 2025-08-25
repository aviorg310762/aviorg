import { useState, useEffect, useCallback, useRef } from 'react';
import type { Chat } from "@google/genai";
import { Message, Role, ChatConfig } from '../types';
import { initializeChat, sendChatMessage } from '../services/geminiService';

export const useChat = (config: ChatConfig) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const chatRef = useRef<Chat | null>(null);

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            const chat = initializeChat(config);
            if(chat) {
                chatRef.current = chat;
                const stream = await sendChatMessage(chat, "התחל את השיחה");
                if (stream) {
                    const botMessageId = Date.now().toString();
                    let botMessage: Message = { id: botMessageId, role: Role.BOT, text: '' };
                    setMessages([botMessage]);
                    
                    let fullText = '';
                    for await (const chunk of stream) {
                        fullText += chunk.text || '';
                        setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, text: fullText } : m));
                    }
                }
            } else {
                setMessages([{
                    id: 'error',
                    role: Role.BOT,
                    text: 'שגיאה: מפתח ה-API של Gemini אינו מוגדר. לא ניתן להתחיל שיחה.'
                }]);
            }
            setIsLoading(false);
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config]);
    
    const sendMessage = useCallback(async (text: string, imageBase64?: string) => {
        if (isLoading || !chatRef.current) return;
        
        setIsLoading(true);
        const userMessage: Message = { id: Date.now().toString(), role: Role.USER, text, image: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : undefined };
        
        setMessages(prev => [...prev, userMessage]);

        const stream = await sendChatMessage(chatRef.current, text, imageBase64);
        
        if (stream) {
            let botMessage: Message = { id: (Date.now() + 1).toString(), role: Role.BOT, text: '' };
            setMessages(prev => [...prev, botMessage]);

            let fullText = '';
            for await (const chunk of stream) {
                fullText += chunk.text || '';
                setMessages(prev => prev.map(m => m.id === botMessage.id ? { ...m, text: fullText } : m));
            }
        } else {
             const errorMsg: Message = { id: (Date.now() + 1).toString(), role: Role.BOT, text: 'התרחשה שגיאה בתקשורת עם השרת.' };
             setMessages(prev => [...prev, errorMsg]);
        }
        
        setIsLoading(false);

    }, [isLoading]);

    return { messages, isLoading, sendMessage };
};