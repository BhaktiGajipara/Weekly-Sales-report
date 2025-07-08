import React, { useState, useRef, useCallback } from 'react';
import { Upload, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadStatus: 'idle' | 'success' | 'error';
  errorMessage?: string;
  pdfUrl?: string;
  onViewReport?: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  isUploading,
  uploadStatus,
  errorMessage,
  pdfUrl,
  onViewReport
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    return file.type === 'text/csv' || file.name.endsWith('.csv');
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileUpload(file);
      }
    }
  }, [onFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const getUploadAreaClasses = () => {
    let classes = "relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ";
    
    if (isDragOver) {
      classes += "border-blue-500 bg-blue-50 ";
    } else if (uploadStatus === 'success') {
      classes += "border-green-300 bg-green-50 ";
    } else if (uploadStatus === 'error') {
      classes += "border-red-300 bg-red-50 ";
    } else {
      classes += "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 ";
    }
    
    return classes;
  };

  const renderUploadContent = () => {
    if (isUploading) {
      return (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-lg font-medium text-gray-700">Uploading...</p>
          <p className="text-sm text-gray-500">Processing your CSV file</p>
        </div>
      );
    }

    if (uploadStatus === 'success') {
      return (
        <div className="flex flex-col items-center space-y-4">
          <CheckCircle className="w-12 h-12 text-green-500" />
          <p className="text-lg font-medium text-green-700">
            {pdfUrl ? 'Report Generated Successfully!' : 'Upload Successful!'}
          </p>
          <p className="text-sm text-gray-600">
            {pdfUrl ? 'Your CSV file has been processed and a report is ready' : 'Your CSV file has been sent to n8n'}
          </p>
          {pdfUrl && onViewReport && (
            <button
              onClick={onViewReport}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <File className="w-4 h-4" />
              <span>View Report</span>
            </button>
          )}
        </div>
      );
    }

    if (uploadStatus === 'error') {
      return (
        <div className="flex flex-col items-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-lg font-medium text-red-700">Upload Failed</p>
          <p className="text-sm text-red-600">{errorMessage || 'Please try again'}</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="p-4 bg-blue-100 rounded-full">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-700">
            Drag and drop your CSV file here
          </p>
          <p className="text-sm text-gray-500">or</p>
        </div>
        <button
          onClick={handleBrowseClick}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Browse Files
        </button>
        <p className="text-xs text-gray-400 mt-2">Supports CSV files only</p>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        className={getUploadAreaClasses()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {renderUploadContent()}
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {selectedFile && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <File className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};