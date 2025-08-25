import { useState, useEffect, useCallback, useRef } from 'react';
import { Message, Role, ChatConfig } from '../types';
import { getChatStream } from '../services/geminiService';

export const useChat = (config: ChatConfig) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const processStream = useCallback(async (stream: ReadableStream<Uint8Array>) => {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        
        const botMessageId = Date.now().toString();
        let botMessage: Message = { id: botMessageId, role: Role.BOT, text: '' };
        setMessages(prev => [...prev, botMessage]);

        let fullText = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            fullText += decoder.decode(value, { stream: true });
            setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, text: fullText } : m));
        }
    }, []);

    // Initial message effect
    useEffect(() => {
        const getInitialMessage = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const stream = await getChatStream(config, [], "התחל את השיחה");
                if (stream) {
                    await processStream(stream);
                }
            } catch (e) {
                console.error(e);
                setError('שגיאה בתקשורת עם השרת.');
            }
            setIsLoading(false);
        };
        getInitialMessage();
    }, [config, processStream]);

    const sendMessage = useCallback(async (text: string, imageBase64?: string) => {
        if (isLoading) return;

        setIsLoading(true);
        setError(null);
        const userMessage: Message = { 
            id: Date.now().toString(), 
            role: Role.USER, 
            text, 
            image: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : undefined 
        };
        
        const currentMessages = [...messages, userMessage];
        setMessages(currentMessages);

        const history = currentMessages.slice(0, -1).map(msg => ({
            role: msg.role === Role.USER ? 'user' : 'model',
            parts: [{ text: msg.text }] // Note: History doesn't include images for simplicity
        }));

        try {
            const stream = await getChatStream(config, history, text, imageBase64);
            if(stream) {
                await processStream(stream);
            }
        } catch (e) {
            console.error(e);
            setError('שגיאה בתקשורת עם השרת.');
        }
        
        setIsLoading(false);
    }, [isLoading, messages, config, processStream]);
    
    useEffect(() => {
        if(error) {
            setMessages(prev => [...prev, {
                id: 'error-' + Date.now(),
                role: Role.BOT,
                text: error
            }]);
        }
    }, [error]);

    return { messages, isLoading, sendMessage };
};