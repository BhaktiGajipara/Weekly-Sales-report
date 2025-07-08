import { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { ExpectedFormat } from './components/ExpectedFormat';
import { Navigation } from './components/Navigation';
import { uploadToN8n } from './services/n8nService';

function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'process' | 'report'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [reportHistory, setReportHistory] = useState<Array<{
    filename: string;
    timestamp: Date;
    pdfUrl?: string;
  }>>([]);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');
    setPdfUrl('');
    setUploadedFileName(file.name);
    
    // Switch to process tab when upload starts
    handleTabChange('process');

    try {
      const result = await uploadToN8n(file);
      
      if (result.success) {
        setUploadStatus('success');
        
        // Add to report history
        const newReport = {
          filename: file.name,
          timestamp: new Date(),
          pdfUrl: result.pdfUrl
        };
        setReportHistory(prev => [newReport, ...prev]);
        
        // If PDF is returned, set the PDF URL and switch to report tab
        if (result.pdfUrl) {
          setPdfUrl(result.pdfUrl);
          handleTabChange('report');
        }
      } else {
        setUploadStatus('error');
        setErrorMessage(result.message);
        // Stay on process tab to show error
      }
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage('Failed to upload file. Please try again.');
      // Stay on process tab to show error
    } finally {
      setIsUploading(false);
    }
  };

  const handleTabChange = (tab: 'upload' | 'process' | 'report') => {
    setActiveTab(tab);
    // Reset upload status when going to upload tab for a fresh start
    if (tab === 'upload') {
      setUploadStatus('idle');
      setErrorMessage('');
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
              onViewReport={() => handleTabChange('report')}
            />
            
            <ExpectedFormat />

            {/* Previous Reports Section */}
            {reportHistory.length > 0 && (
              <div className="w-full max-w-4xl mx-auto mt-12">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Reports</h3>
                  <div className="space-y-3">
                    {reportHistory.slice(0, 5).map((report, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{report.filename}</p>
                            <p className="text-xs text-gray-500">
                              {report.timestamp.toLocaleDateString()} at {report.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {report.pdfUrl && (
                            <>
                              <button
                                onClick={() => {
                                  setPdfUrl(report.pdfUrl!);
                                  setUploadedFileName(report.filename);
                                  handleTabChange('report');
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                View
                              </button>
                              <button
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = report.pdfUrl!;
                                  link.download = report.filename.replace('.csv', '-report.pdf');
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                                className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                              >
                                Download
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {reportHistory.length > 5 && (
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      Showing 5 most recent reports
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'process':
        return (
          <div>
            {isUploading ? (
              <div className="text-center py-20">
                <div className="max-w-lg mx-auto">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Processing Your File</h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Your CSV file <span className="font-medium text-blue-600">{uploadedFileName}</span> is being processed...
                  </p>
                  
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Steps:</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700">File uploaded successfully</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </div>
                        <span className="text-gray-700">Analyzing sales data...</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <span className="text-gray-500">Generating PDF report...</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">This usually takes 10-30 seconds</p>
                  </div>
                </div>
              </div>
            ) : uploadStatus === 'error' ? (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Processing Failed</h2>
                  <p className="text-gray-600 mb-6">{errorMessage}</p>
                  <button
                    onClick={() => handleTabChange('upload')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : uploadStatus === 'success' && !pdfUrl ? (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">File Processed Successfully</h2>
                  <p className="text-gray-600 mb-6">
                    Your CSV file has been uploaded and processed by the webhook.
                  </p>
                  <button
                    onClick={() => handleTabChange('upload')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Upload Another File
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Process</h2>
                  <p className="text-gray-600 mb-6">
                    Upload a CSV file to see the processing status and track the workflow progress.
                  </p>
                  <button
                    onClick={() => handleTabChange('upload')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Upload CSV File
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'report':
        return (
          <div>
            {pdfUrl ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Generated Report
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Your CSV file has been processed successfully. View and download your report below.
                  </p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Sales Report
                        </h3>
                        <p className="text-sm text-gray-600">
                          {uploadedFileName.replace('.csv', '-report.pdf')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = pdfUrl;
                        link.download = uploadedFileName.replace('.csv', '-report.pdf');
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download</span>
                    </button>
                  </div>

                  {/* PDF Viewer */}
                  <div className="w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden">
                    <iframe
                      src={pdfUrl}
                      className="w-full h-full border-0"
                      title="PDF Report"
                    />
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Report generated successfully from your uploaded CSV file
                      </p>
                      <button
                        onClick={() => handleTabChange('upload')}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Upload New File
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">No Reports Generated</h2>
                  <p className="text-gray-600 mb-6">
                    Upload a CSV file to generate your first sales report. Reports will appear here once processed.
                  </p>
                  <button
                    onClick={() => handleTabChange('upload')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Upload CSV File
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
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
            <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
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
    </div>
  );
}

export default App;