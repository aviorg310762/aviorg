import { ChatConfig } from '../types';

// This function now sends a request to our own backend endpoint (/api/chat)
// instead of communicating directly with the Gemini API.
// The backend will handle the API key and communication with Google.
export const getChatStream = async (
    config: ChatConfig,
    history: { role: string, parts: any[] }[],
    message: string,
    base64Image?: string
) => {
    
    const body: { config: ChatConfig, history: any[], message: any[] } = {
        config,
        history,
        message: [{ type: 'text', text: message }]
    };

    if (base64Image) {
        body.message.push({
            type: 'image',
            data: base64Image,
            mimeType: 'image/jpeg'
        });
    }

    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error('Failed to connect to the server.');
    }

    return response.body;
};
