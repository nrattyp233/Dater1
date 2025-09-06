import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, Message, Gender } from '../types';
import type { ColorTheme } from '../constants';
import { CrownIcon, SparklesIcon, BrainIcon } from '../constants';
import { generateChatReplies, getWingmanTip } from '../services/geminiService';
import { useToast } from '../contexts/ToastContext';

interface ChatViewProps {
    currentUser: User;
    matchedUsers: User[];
    allUsers: User[];
    messages: Message[];
    onSendMessage: (receiverId: number, text: string) => void;
    onViewProfile: (user: User) => void;
    isChatDisabled: boolean;
    activeColorTheme: ColorTheme;
    onPremiumFeatureClick: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({
    currentUser,
    matchedUsers,
    allUsers,
    messages,
    onSendMessage,
    onViewProfile,
    isChatDisabled,
    activeColorTheme,
    onPremiumFeatureClick
}) => {
    const [activeChatUserId, setActiveChatUserId] = useState<number | null>(matchedUsers.length > 0 ? matchedUsers[0].id : null);
    const [messageText, setMessageText] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { showToast } = useToast();
    
    const [isWingmanOn, setIsWingmanOn] = useState(false);
    const [wingmanTip, setWingmanTip] = useState<string | null>(null);
    const [isGeneratingTip, setIsGeneratingTip] = useState(false);
    const lastMessageCount = useRef(0);

    const conversations = useMemo(() => {
        return matchedUsers.map(user => {
            const userMessages = messages.filter(
                m => (m.senderId === user.id && m.receiverId === currentUser.id) || (m.senderId === currentUser.id && m.receiverId === user.id)
            ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            
            return {
                user,
                lastMessage: userMessages[0] || null,
            };
        }).sort((a, b) => {
            if (!a.lastMessage) return 1;
            if (!b.lastMessage) return -1;
            return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
        });
    }, [matchedUsers, messages, currentUser.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeChatUserId]);

    useEffect(() => {
        setSuggestions([]); // Clear suggestions when switching chats
        setWingmanTip(null);
        lastMessageCount.current = 0;
    }, [activeChatUserId]);

    const activeChatUser = allUsers.find(u => u.id === activeChatUserId);

    const activeChatMessages = useMemo(() => {
        if (!activeChatUserId) return [];
        return messages
            .filter(m => 
                (m.senderId === currentUser.id && m.receiverId === activeChatUserId) ||
                (m.senderId === activeChatUserId && m.receiverId === currentUser.id)
            )
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [messages, activeChatUserId, currentUser.id]);

    useEffect(() => {
        const fetchTip = async () => {
            if (isWingmanOn && activeChatUser && activeChatMessages.length > lastMessageCount.current) {
                lastMessageCount.current = activeChatMessages.length;
                const lastMessage = activeChatMessages[activeChatMessages.length - 1];
                if (lastMessage && lastMessage.senderId !== currentUser.id) {
                    setIsGeneratingTip(true);
                    setWingmanTip(null);
                    try {
                        const tip = await getWingmanTip(currentUser, activeChatUser, activeChatMessages);
                        setWingmanTip(tip);
                    } catch (e) {
                        console.error("Wingman error:", e);
                    } finally {
                        setIsGeneratingTip(false);
                    }
                }
            }
        };
        fetchTip();
    }, [activeChatMessages, isWingmanOn, activeChatUser, currentUser]);
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim() || !activeChatUserId) return;
        onSendMessage(activeChatUserId, messageText.trim());
        setMessageText('');
        setSuggestions([]);
    };

    const handleGenerateSuggestions = async () => {
        if (!activeChatUser) return;
        setIsGeneratingSuggestions(true);
        try {
            const replies = await generateChatReplies(currentUser, activeChatUser, activeChatMessages);
            setSuggestions(replies);
        } catch (error: any) {
            showToast(error.message || "Failed to get suggestions.", 'error');
        } finally {
            setIsGeneratingSuggestions(false);
        }
    };
    
    const handleSuggestionClick = (suggestion: string) => {
        setMessageText(suggestion);
        setSuggestions([]);
    };

    const handleWingmanToggle = () => {
        if (!currentUser.isPremium) {
            onPremiumFeatureClick();
            return;
        }
        setIsWingmanOn(prev => !prev);
        setWingmanTip(null); // Clear tip on toggle
    };

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-[calc(100vh-150px)]">
            <div className="md:col-span-1 lg:col-span-1 bg-dark-2 rounded-2xl p-4 flex flex-col border border-dark-3">
                <h2 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${activeColorTheme.gradientFrom} ${activeColorTheme.gradientTo} text-transparent bg-clip-text`}>Chats</h2>
                <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                    {conversations.map(({ user, lastMessage }) => (
                        <button
                            key={user.id}
                            onClick={() => setActiveChatUserId(user.id)}
                            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors duration-200 ${activeChatUserId === user.id ? 'bg-dark-3' : 'hover:bg-dark-3/50'}`}
                        >
                            <img src={user.photos[0]} alt={user.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate">{user.name}</p>
                                <p className="text-sm text-gray-400 truncate">{lastMessage?.text || 'No messages yet.'}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3 bg-dark-2 rounded-2xl flex flex-col border border-dark-3">
                {activeChatUser ? (
                    <>
                        <div className="p-4 border-b border-dark-3 flex items-center justify-between gap-3 w-full text-left">
                            <button onClick={() => onViewProfile(activeChatUser)} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                <img src={activeChatUser.photos[0]} alt={activeChatUser.name} className="w-10 h-10 rounded-full object-cover" />
                                <h3 className="text-xl font-bold text-white">{activeChatUser.name}</h3>
                            </button>
                            <div className="relative flex items-center gap-2">
                                <label htmlFor="wingman-toggle" className={`font-semibold text-sm transition-colors ${isWingmanOn ? 'text-cyan-400' : 'text-gray-400'}`}>
                                    AI Wingman
                                </label>
                                <button
                                    id="wingman-toggle"
                                    onClick={handleWingmanToggle}
                                    role="switch"
                                    aria-checked={isWingmanOn}
                                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isWingmanOn ? 'bg-cyan-600' : 'bg-dark-3'}`}
                                >
                                    {!currentUser.isPremium && (
                                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-black p-0.5 rounded-full shadow-md z-10">
                                           <CrownIcon className="w-3 h-3" />
                                       </div>
                                    )}
                                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isWingmanOn ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-grow p-4 overflow-y-auto space-y-4">
                            {activeChatMessages.map(message => (
                                <div key={message.id} className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${message.senderId === currentUser.id ? `${activeColorTheme.bg} text-white` : 'bg-dark-3 text-gray-200'}`}>
                                        <p>{message.text}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t border-dark-3">
                            {isChatDisabled && (
                                <div className="text-center text-yellow-400 mb-2 font-semibold flex items-center justify-center gap-2">
                                   <CrownIcon className="w-5 h-5" />
                                    Upgrade to Premium for unlimited messages!
                                </div>
                            )}

                             {(isGeneratingTip || wingmanTip) && (
                                <div className="mb-3 p-3 bg-dark-3 rounded-lg flex items-center gap-3 animate-fade-in relative">
                                    <BrainIcon className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                                    {isGeneratingTip && <p className="text-sm italic text-gray-400">Wingman is thinking...</p>}
                                    {wingmanTip && <p className="text-sm italic text-cyan-200">{wingmanTip}</p>}
                                    {wingmanTip && <button onClick={() => setWingmanTip(null)} className="absolute top-1 right-1 text-gray-500 hover:text-white">&times;</button>}
                                </div>
                            )}

                            {isGeneratingSuggestions && (
                                <div className="text-center py-2 text-sm text-gray-400">Generating ideas...</div>
                            )}

                            {suggestions.length > 0 && (
                                <div className="mb-3 flex flex-wrap gap-2">
                                    {suggestions.map((s, i) => (
                                        <button key={i} onClick={() => handleSuggestionClick(s)} className="bg-dark-3 text-white text-sm px-3 py-1.5 rounded-full hover:bg-dark-3/80 transition-colors">
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <form onSubmit={handleSendMessage} className="flex gap-3">
                                <div className="relative flex-grow">
                                    <input
                                        type="text"
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        placeholder={isChatDisabled ? "Upgrade to send messages" : "Type a message..."}
                                        className="w-full bg-dark-3 border border-dark-3 rounded-lg p-3 pr-12 text-white focus:ring-2 focus:ring-brand-pink focus:border-brand-pink transition disabled:opacity-50"
                                        disabled={isChatDisabled}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleGenerateSuggestions}
                                        disabled={isChatDisabled || isGeneratingSuggestions}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:bg-dark-1 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="Generate reply suggestions"
                                    >
                                        <SparklesIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <button type="submit" disabled={isChatDisabled || !messageText.trim()} className={`px-6 py-2 ${activeColorTheme.bg} text-white rounded-lg font-bold transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}>
                                    Send
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Select a match to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatView;
