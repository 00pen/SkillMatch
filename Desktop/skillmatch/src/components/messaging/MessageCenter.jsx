import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Icon from '../AppIcon';

const MessageCenter = ({ isOpen, onClose, recipientId, jobId = null }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      loadConversations();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      if (!supabase) {
        console.log('Messaging requires real Supabase connection');
        setConversations([]);
        return;
      }

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_1:participant_1_id(id, full_name),
          participant_2:participant_2_id(id, full_name),
          job:job_id(id, title, company:companies(name))
        `)
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        // Handle table not existing gracefully
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.log('Messaging tables not set up yet - messaging features disabled');
          setConversations([]);
          return;
        }
        throw error;
      }
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      if (!supabase) {
        setMessages([]);
        return;
      }

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, full_name),
          recipient:recipient_id(id, full_name)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      if (error) {
        // Handle table not existing gracefully
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.log('Messages table not set up yet');
          setMessages([]);
          return;
        }
        throw error;
      }
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    setIsSending(true);
    try {
      if (!supabase) {
        alert('Messaging requires real Supabase connection');
        return;
      }

      const recipientId = selectedConversation.participant_1_id === user.id 
        ? selectedConversation.participant_2_id 
        : selectedConversation.participant_1_id;

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          job_id: selectedConversation.job_id,
          content: newMessage.trim(),
          message_type: 'general'
        })
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          alert('Messaging feature not available yet. Please contact support.');
          return;
        }
        throw error;
      }

      setMessages(prev => [...prev, data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const createNewConversation = async (recipientId, jobId = null) => {
    try {
      if (!supabase) {
        alert('Messaging requires real Supabase connection');
        return;
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participant_1_id: Math.min(user.id, recipientId),
          participant_2_id: Math.max(user.id, recipientId),
          job_id: jobId
        })
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          alert('Messaging feature not available yet. Please contact support.');
          return;
        }
        throw error;
      }
      
      setSelectedConversation(data);
      loadConversations();
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Unable to start conversation. Please try again later.');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-card border border-border rounded-lg shadow-modal w-full max-w-4xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary">Messages</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            iconName="X"
            iconSize={20}
          />
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="font-medium text-text-primary mb-2">Conversations</h3>
              {recipientId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => createNewConversation(recipientId, jobId)}
                  iconName="Plus"
                  iconSize={14}
                  className="w-full"
                >
                  New Message
                </Button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-text-secondary">
                  <Icon name="Loader2" size={20} className="animate-spin mx-auto mb-2" />
                  Loading conversations...
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-text-secondary">
                  <Icon name="MessageCircle" size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                conversations.map((conversation) => {
                  const otherParticipant = conversation.participant_1_id === user.id
                    ? conversation.participant_2
                    : conversation.participant_1;
                  
                  return (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-3 border-b border-border cursor-pointer hover:bg-muted transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-medium">
                          {otherParticipant?.full_name?.[0] || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary truncate">
                            {otherParticipant?.full_name || 'Unknown User'}
                          </p>
                          {conversation.job && (
                            <p className="text-xs text-text-secondary truncate">
                              Re: {conversation.job.title} at {conversation.job.company?.name}
                            </p>
                          )}
                          <p className="text-xs text-text-secondary">
                            {formatTime(conversation.last_message_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Messages Header */}
                <div className="p-4 border-b border-border">
                  <h3 className="font-medium text-text-primary">
                    {selectedConversation.participant_1_id === user.id
                      ? selectedConversation.participant_2?.full_name
                      : selectedConversation.participant_1?.full_name}
                  </h3>
                  {selectedConversation.job && (
                    <p className="text-sm text-text-secondary">
                      Re: {selectedConversation.job.title}
                    </p>
                  )}
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
                    const isOwnMessage = message.sender_id === user.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwnMessage
                              ? 'bg-secondary text-white'
                              : 'bg-muted text-text-primary'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 opacity-70`}>
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || isSending}
                      iconName={isSending ? "Loader2" : "Send"}
                      iconSize={16}
                      className={isSending ? "animate-spin" : ""}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-text-secondary">
                <div className="text-center">
                  <Icon name="MessageCircle" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageCenter;