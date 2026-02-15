import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import './Chat.css';

const API = `${import.meta.env.VITE_API_URL}/messages`;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export default function Chat() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [otherTyping, setOtherTyping] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };

    // Socket initialization
    useEffect(() => {
        if (!user) return;

        socketRef.current = io(SOCKET_URL, {
            withCredentials: true,
        });

        socketRef.current.emit('user_online', user._id);

        socketRef.current.on('users_online', (users) => {
            setOnlineUsers(users);
        });

        socketRef.current.on('new_message', (data) => {
            if (activeConv && data.conversationId === activeConv._id) {
                setMessages((prev) => [...prev, data.message]);
            }
            fetchConversations();
        });

        socketRef.current.on('user_typing', (data) => {
            if (activeConv && data.conversationId === activeConv._id) {
                setOtherTyping(true);
            }
        });

        socketRef.current.on('user_stop_typing', (data) => {
            if (activeConv && data.conversationId === activeConv._id) {
                setOtherTyping(false);
            }
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [user, activeConv?._id]);

    // Load conversations
    const fetchConversations = useCallback(async () => {
        try {
            const res = await fetch(`${API}/conversations`, { headers });
            const data = await res.json();
            if (data.success) setConversations(data.conversations);
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Init Chat
    useEffect(() => {
        const initChat = async () => {
            const recipientId = searchParams.get('to');
            const listingId = searchParams.get('listing');

            if (recipientId) {
                try {
                    const res = await fetch(`${API}/conversation`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ recipientId, listingId }),
                    });
                    const data = await res.json();
                    if (data.success) {
                        setActiveConv(data.conversation);
                    }
                } catch (err) {
                    console.error('Failed to create conversation:', err);
                }
            }
            await fetchConversations();
        };
        initChat();
    }, [user]);

    // Load messages
    useEffect(() => {
        if (!activeConv) return;

        const fetchMessages = async () => {
            try {
                const res = await fetch(`${API}/${activeConv._id}`, { headers });
                const data = await res.json();
                if (data.success) setMessages(data.messages);
            } catch (err) {
                console.error('Failed to fetch messages:', err);
            }
        };

        fetchMessages();

        if (socketRef.current) {
            socketRef.current.emit('join_conversation', activeConv._id);
        }

        return () => {
            if (socketRef.current && activeConv) {
                socketRef.current.emit('leave_conversation', activeConv._id);
            }
        };
    }, [activeConv?._id]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, otherTyping]);

    // Typing behavior
    useEffect(() => {
        if (!activeConv || !socketRef.current) return;

        if (newMessage.trim()) {
            if (!isTyping) {
                setIsTyping(true);
                socketRef.current.emit('typing', { conversationId: activeConv._id });
            }
        } else {
            if (isTyping) {
                setIsTyping(false);
                socketRef.current.emit('stop_typing', { conversationId: activeConv._id });
            }
        }
    }, [newMessage, activeConv?._id]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConv || sending) return;

        const messageText = newMessage;
        setNewMessage('');
        setIsTyping(false);
        socketRef.current.emit('stop_typing', { conversationId: activeConv._id });

        setSending(true);
        try {
            const res = await fetch(`${API}/${activeConv._id}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ text: messageText }),
            });
            const data = await res.json();
            if (data.success) {
                setMessages((prev) => [...prev, data.message]);
                socketRef.current.emit('send_message', {
                    conversationId: activeConv._id,
                    message: data.message
                });
                fetchConversations();
            }
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSending(false);
        }
    };

    const getOtherUser = (conv) => {
        return conv.participants?.find((p) => p._id !== user._id) || {};
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatTime = (date) => {
        const d = new Date(date);
        const now = new Date();
        if (d.toDateString() === now.toDateString()) {
            return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const isUserOnline = (userId) => onlineUsers.includes(userId);

    if (!user) {
        return (
            <div className="chat-page">
                <div className="chat-empty">
                    <div className="chat-empty-icon">🔒</div>
                    <h3>Login to access messages</h3>
                    <Link to="/login" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>Sign In</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-page">
            <div className={`chat-sidebar ${activeConv ? 'hidden-mobile' : ''}`}>
                <div className="chat-sidebar-header">
                    <h2>Messages</h2>
                </div>
                <div className="chat-list">
                    {loading ? (
                        <div className="chat-empty" style={{ padding: 'var(--space-8)' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : conversations.length > 0 ? (
                        conversations.map((conv) => {
                            const other = getOtherUser(conv);
                            const online = isUserOnline(other._id);
                            return (
                                <div
                                    key={conv._id}
                                    className={`chat-item ${activeConv?._id === conv._id ? 'active' : ''}`}
                                    onClick={() => setActiveConv(conv)}
                                >
                                    <div className="chat-item-avatar">
                                        {getInitials(other.name)}
                                        {online && <span className="online-indicator"></span>}
                                    </div>
                                    <div className="chat-item-info">
                                        <div className="chat-item-name">{other.name || 'Student'}</div>
                                        <div className="chat-item-last">
                                            {conv.lastMessage?.text || 'No messages yet'}
                                        </div>
                                    </div>
                                    {conv.lastMessage?.createdAt && (
                                        <div className="chat-item-time">
                                            {formatTime(conv.lastMessage.createdAt)}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="chat-empty" style={{ padding: 'var(--space-8)' }}>
                            <div className="chat-empty-icon">💬</div>
                            <h3>No conversations yet</h3>
                            <p style={{ fontSize: '0.875rem' }}>
                                Contact a seller to start a chat!
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {activeConv ? (
                <div className={`chat-area ${!activeConv ? 'hidden-mobile' : ''}`}>
                    <div className="chat-area-header">
                        <button className="chat-back-btn" onClick={() => setActiveConv(null)}>←</button>
                        <div className="chat-item-avatar" style={{ width: 36, height: 36, fontSize: '0.8125rem' }}>
                            {getInitials(getOtherUser(activeConv).name)}
                            {isUserOnline(getOtherUser(activeConv)._id) && <span className="online-indicator"></span>}
                        </div>
                        <div className="chat-area-header-info">
                            <h3>{getOtherUser(activeConv).name}</h3>
                            <span>{getOtherUser(activeConv).college}</span>
                        </div>
                        {activeConv.listing && (
                            <Link to={`/listing/${activeConv.listing._id}`} className="chat-listing-ref">
                                {activeConv.listing.images?.[0] && (
                                    <img src={`${import.meta.env.VITE_SOCKET_URL}${activeConv.listing.images[0]}`} alt="" />
                                )}
                                <span>₹{activeConv.listing.price?.toLocaleString()}</span>
                            </Link>
                        )}
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`chat-msg ${msg.sender?._id === user._id || msg.sender === user._id ? 'sent' : 'received'}`}
                            >
                                <div className="chat-msg-bubble">{msg.text}</div>
                                <div className="chat-msg-time">{formatTime(msg.createdAt)}</div>
                            </div>
                        ))}
                        {otherTyping && (
                            <div className="chat-msg received">
                                <div className="chat-msg-bubble typing-dots">
                                    <span>.</span><span>.</span><span>.</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className="chat-send-btn" disabled={!newMessage.trim() || sending}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </form>
                </div>
            ) : (
                <div className="chat-area hidden-mobile">
                    <div className="chat-empty">
                        <div className="chat-empty-icon">💬</div>
                        <h3>Select a conversation</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                            Choose from your conversations or contact a seller
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
