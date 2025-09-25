"use client";
import { useState, useRef, useEffect } from 'react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Create assistant message placeholder
        const assistantMessageId = (Date.now() + 1).toString();
        const assistantMessage: Message = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);

        try {
            const response = await fetch('/API/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(msg => ({
                        role: msg.role,
                        content: msg.content
                    }))
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('API Error:', data);
                throw new Error(data.details || data.error || 'Network response was not ok');
            }

            // Handle the JSON response
            if (data.content) {
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === assistantMessageId
                            ? { ...msg, content: data.content }
                            : msg
                    )
                );
            } else {
                throw new Error('No content in response');
            }

        } catch (error) {
            console.error('Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

            setMessages(prev =>
                prev.map(msg =>
                    msg.id === assistantMessageId
                        ? { ...msg, content: `Sorry, I encountered an error: ${errorMessage}` }
                        : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
    };

    return (
        <div className="chat-container">
            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <h2>👋 Hello! Im Bumblebyte</h2>
                        <p>Im here to help you with programming and computer science questions. Ask me anything!</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div key={message.id} className={`message ${message.role}`}>
                            <div className="message-content">
                                <div className="message-role">
                                    {message.role === 'user' ? '👤 You' : '🐝 Bumblebyte'}
                                </div>
                                <div className="message-text">
                                    {message.content || (message.role === 'assistant' && isLoading ? 'Thinking...' : '')}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-container">
                {messages.length > 0 && (
                    <button onClick={clearChat} className="clear-btn" type="button">
                        Clear Chat
                    </button>
                )}

                <form onSubmit={handleSubmit} className="input-form">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me about programming, algorithms, or any CS topic..."
                        disabled={isLoading}
                        className="message-input"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="send-btn"
                    >
                        {isLoading ? '⏳' : '📤'}
                    </button>
                </form>
            </div>

            <style jsx>{`
                .chat-container {
                    display: flex;
                    flex-direction: column;
                    height: 600px;
                    max-width: 800px;
                    margin: 0 auto;
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    overflow: hidden;
                    background: white;
                }

                .messages-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    background: #fafafa;
                }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: #666;
                }

                .empty-state h2 {
                    margin: 0 0 10px 0;
                    color: #333;
                }

                .message {
                    margin-bottom: 20px;
                }

                .message.user .message-content {
                    margin-left: auto;
                    background: #007bff;
                    color: white;
                    max-width: 80%;
                }

                .message.assistant .message-content {
                    background: white;
                    border: 1px solid #e0e0e0;
                    max-width: 80%;
                }

                .message-content {
                    padding: 12px 16px;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .message-role {
                    font-size: 12px;
                    font-weight: 600;
                    margin-bottom: 4px;
                    opacity: 0.8;
                }

                .message-text {
                    line-height: 1.5;
                    white-space: pre-wrap;
                }

                .input-container {
                    padding: 20px;
                    background: white;
                    border-top: 1px solid #e0e0e0;
                }

                .clear-btn {
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    margin-bottom: 10px;
                    transition: background-color 0.2s;
                }

                .clear-btn:hover {
                    background: #5a6268;
                }

                .input-form {
                    display: flex;
                    gap: 10px;
                }

                .message-input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 1px solid #ddd;
                    border-radius: 25px;
                    outline: none;
                    font-size: 14px;
                    transition: border-color 0.2s;
                }

                .message-input:focus {
                    border-color: #007bff;
                }

                .message-input:disabled {
                    background: #f5f5f5;
                    cursor: not-allowed;
                }

                .send-btn {
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: background-color 0.2s;
                    min-width: 60px;
                }

                .send-btn:hover:not(:disabled) {
                    background: #0056b3;
                }

                .send-btn:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}