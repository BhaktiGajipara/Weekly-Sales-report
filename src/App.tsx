import { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { ExpectedFormat } from './components/ExpectedFormat';
import { Navigation } from './components/Navigation';
import { PdfViewer } from './components/PdfViewer';
import { uploadToN8n } from './services/n8nService';

function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'process' | 'report'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');
    setPdfUrl('');
    setUploadedFileName(file.name);

    try {
      const result = await uploadToN8n(file);
      
      if (result.success) {
        setUploadStatus('success');
        
        // If PDF is returned, set the PDF URL
        if (result.pdfUrl) {
          setPdfUrl(result.pdfUrl);
        }
      } else {
        setUploadStatus('error');
        setErrorMessage(result.message);
      }
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Upload Sales Data
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload your CSV file to generate a comprehensive success report highlighting top performers
              </p>
            </div>
            
            <FileUploader
              onFileUpload={handleFileUpload}
              isUploading={isUploading}
              uploadStatus={uploadStatus}
              errorMessage={errorMessage}
              pdfUrl={pdfUrl}
              onViewReport={() => setPdfUrl(pdfUrl)} // This will trigger the PDF viewer
            />
            
            <ExpectedFormat />
          </div>
        );
      
      case 'process':
        return (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Process Data</h2>
              <p className="text-gray-600">
                This section will show processing options and status once a file is uploaded.
              </p>
            </div>
          </div>
        );
      
      case 'report':
        return (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Generate Report</h2>
              <p className="text-gray-600">
                View comprehensive reports and analytics once your data has been processed.
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const handleClosePdf = () => {
    setPdfUrl('');
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl); // Clean up the blob URL
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Weekly Sales Performance
            </h1>
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Powered by n8n workflow automation</p>
          </div>
        </div>
      </footer>

      {/* PDF Viewer Modal */}
      {pdfUrl && (
        <PdfViewer 
          pdfUrl={pdfUrl} 
          filename={uploadedFileName.replace('.csv', '-report.pdf')}
          onClose={handleClosePdf}
        />
      )}
    </div>
  );
}

export default App;