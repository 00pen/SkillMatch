import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ShareModal = ({ isOpen, onClose, job }) => {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen) return null;

  const jobUrl = `${window.location?.origin}/job-details?id=${job?.id}`;
  
  const shareOptions = [
    {
      name: 'LinkedIn',
      icon: 'Linkedin',
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
      }
    },
    {
      name: 'Twitter',
      icon: 'Twitter',
      color: 'bg-blue-400 hover:bg-blue-500',
      action: () => {
        const text = `Check out this job opportunity: ${job?.title} at ${job?.company?.name}`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(jobUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
      }
    },
    {
      name: 'Facebook',
      icon: 'Facebook',
      color: 'bg-blue-800 hover:bg-blue-900',
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
      }
    },
    {
      name: 'WhatsApp',
      icon: 'MessageCircle',
      color: 'bg-green-600 hover:bg-green-700',
      action: () => {
        const text = `Check out this job: ${job?.title} at ${job?.company?.name} - ${jobUrl}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
      }
    }
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard?.writeText(jobUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleEmailShare = async (e) => {
    e?.preventDefault();
    setIsSharing(true);
    
    try {
      // Simulate email sharing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would send an email via API
      console.log('Sharing via email:', { email, message, jobUrl });
      
      setEmail('');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Email sharing failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e?.target === e?.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-card border border-border rounded-lg shadow-modal w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary">Share Job</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            iconName="X"
            iconSize={20}
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Job Preview */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold text-text-primary mb-1">{job?.title}</h3>
            <p className="text-sm text-text-secondary">{job?.company?.name}</p>
            <p className="text-sm text-text-secondary">{job?.location}</p>
          </div>

          {/* Social Share Options */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">Share on social media</h4>
            <div className="grid grid-cols-2 gap-3">
              {shareOptions?.map((option) => (
                <Button
                  key={option?.name}
                  variant="outline"
                  onClick={option?.action}
                  className="justify-start"
                  iconName={option?.icon}
                  iconPosition="left"
                >
                  {option?.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Copy Link */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">Copy link</h4>
            <div className="flex gap-2">
              <Input
                type="text"
                value={jobUrl}
                readOnly
                className="flex-1"
              />
              <Button
                variant={copied ? "success" : "outline"}
                onClick={handleCopyLink}
                iconName={copied ? "Check" : "Copy"}
                iconSize={16}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Email Share */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">Share via email</h4>
            <form onSubmit={handleEmailShare} className="space-y-3">
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e?.target?.value)}
                required
              />
              <textarea
                placeholder="Add a personal message (optional)"
                value={message}
                onChange={(e) => setMessage(e?.target?.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
              <Button
                type="submit"
                variant="default"
                fullWidth
                loading={isSharing}
                iconName="Mail"
                iconPosition="left"
                disabled={!email}
              >
                {isSharing ? 'Sending...' : 'Send Email'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;