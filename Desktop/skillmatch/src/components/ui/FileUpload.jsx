import React, { useRef, useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const FileUpload = ({ 
  onFileSelect, 
  acceptedFileTypes = ".pdf,.doc,.docx", 
  maxFileSize = 5 * 1024 * 1024, // 5MB
  label = "Upload File",
  description = "Choose a file to upload",
  currentFile = null,
  disabled = false,
  required = false
}) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (file) => {
    setError('');
    
    // Validate file size
    if (file.size > maxFileSize) {
      setError(`File size must be less than ${Math.round(maxFileSize / (1024 * 1024))}MB`);
      return;
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const allowedTypes = acceptedFileTypes.split(',').map(type => type.trim().toLowerCase());
    
    if (!allowedTypes.includes(fileExtension)) {
      setError(`File type not supported. Allowed types: ${acceptedFileTypes}`);
      return;
    }

    onFileSelect(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (disabled) return;
    
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const removeFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-card-secondary/50'}
          ${error ? 'border-error' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleInputChange}
          accept={acceptedFileTypes}
          className="hidden"
          disabled={disabled}
        />

        {currentFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <Icon name="FileText" size={24} className="text-success" />
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">{currentFile.name}</p>
                <p className="text-xs text-text-secondary">
                  {formatFileSize(currentFile.size)}
                </p>
              </div>
            </div>
            <div className="flex justify-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                Replace File
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                iconName="Trash2"
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Icon 
              name="Upload" 
              size={32} 
              className={`mx-auto ${dragActive ? 'text-primary' : 'text-text-secondary'}`} 
            />
            <div>
              <p className="text-sm font-medium text-text-primary">
                {dragActive ? 'Drop file here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {description}
              </p>
              <p className="text-xs text-text-secondary">
                Max size: {Math.round(maxFileSize / (1024 * 1024))}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-error">
          <Icon name="AlertCircle" size={16} />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;