import React, { useState } from 'react';
import Button from './Button';
import Icon from '../AppIcon';

const DeleteAccountModal = ({ isOpen, onClose, onConfirm, isLoading = false }) => {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmValid = confirmText.toLowerCase() === 'delete my account';

  const handleConfirm = () => {
    if (isConfirmValid) {
      onConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-full p-4">
        <div className="bg-card border border-destructive rounded-lg shadow-modal w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-destructive rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-destructive-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-destructive">Delete Account</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              iconName="X"
              iconSize={20}
              className="text-text-secondary hover:text-text-primary"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-text-primary mb-4">
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <Icon name="AlertCircle" size={16} className="text-destructive mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-destructive font-medium mb-1">The following data will be permanently deleted:</p>
                  <ul className="text-text-secondary space-y-1">
                    <li>• Your profile and personal information</li>
                    <li>• All job applications and saved jobs</li>
                    <li>• Message history and conversations</li>
                    <li>• Uploaded files (resumes, portfolios)</li>
                    <li>• Account settings and preferences</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-primary mb-2">
                To confirm, type <span className="font-bold text-destructive">"delete my account"</span> below:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type 'delete my account' to confirm"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-destructive focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={!isConfirmValid || isLoading}
              loading={isLoading}
              iconName={isLoading ? "Loader2" : "Trash2"}
              iconSize={16}
            >
              {isLoading ? 'Deleting Account...' : 'Delete Account'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;