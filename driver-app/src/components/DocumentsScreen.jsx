import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  XCircle,
  Calendar,
  Camera,
  Download,
  RefreshCw,
  Plus,
  Trash2,
  Clock
} from 'lucide-react';

const DocumentsScreen = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const documents = [
    {
      id: 1,
      category: 'Personal Documents',
      items: [
        {
          id: 'cnic',
          name: 'CNIC (Computerized National Identity Card)',
          status: 'verified',
          uploadDate: '2024-01-15',
          expiryDate: '2030-06-15',
          fileUrl: '/documents/cnic.pdf',
          required: true,
          description: 'Valid Pakistani CNIC required for driver verification',
          fileSize: '2.4 MB',
          fileType: 'PDF'
        },
        {
          id: 'license',
          name: 'Driving License',
          status: 'verified',
          uploadDate: '2024-01-15',
          expiryDate: '2025-12-31',
          fileUrl: '/documents/license.pdf',
          required: true,
          description: 'Valid driving license for vehicle category',
          fileSize: '1.8 MB',
          fileType: 'PDF'
        },
        {
          id: 'photo',
          name: 'Passport Size Photo',
          status: 'verified',
          uploadDate: '2024-01-15',
          expiryDate: null,
          fileUrl: '/documents/photo.jpg',
          required: true,
          description: 'Recent passport size photograph',
          fileSize: '0.8 MB',
          fileType: 'JPG'
        }
      ]
    },
    {
      id: 2,
      category: 'Vehicle Documents',
      items: [
        {
          id: 'registration',
          name: 'Vehicle Registration',
          status: 'verified',
          uploadDate: '2024-01-10',
          expiryDate: '2025-01-10',
          fileUrl: '/documents/registration.pdf',
          required: true,
          description: 'Vehicle registration certificate from Excise & Taxation',
          fileSize: '3.2 MB',
          fileType: 'PDF'
        },
        {
          id: 'insurance',
          name: 'Insurance Certificate',
          status: 'pending',
          uploadDate: '2024-09-10',
          expiryDate: '2024-12-31',
          fileUrl: '/documents/insurance.pdf',
          required: true,
          description: 'Valid vehicle insurance certificate',
          fileSize: '1.5 MB',
          fileType: 'PDF'
        },
        {
          id: 'fitness',
          name: 'Fitness Certificate',
          status: 'expired',
          uploadDate: '2023-11-01',
          expiryDate: '2024-08-31',
          fileUrl: '/documents/fitness.pdf',
          required: true,
          description: 'Vehicle fitness certificate from authorized center',
          fileSize: '2.1 MB',
          fileType: 'PDF'
        }
      ]
    },
    {
      id: 3,
      category: 'Business Documents',
      items: [
        {
          id: 'permit',
          name: 'Route Permit',
          status: 'rejected',
          uploadDate: '2024-08-15',
          expiryDate: '2025-08-15',
          fileUrl: '/documents/permit.pdf',
          required: false,
          description: 'Commercial transport permit (if applicable)',
          rejectionReason: 'Document quality is poor, please re-upload with better clarity',
          fileSize: '4.1 MB',
          fileType: 'PDF'
        },
        {
          id: 'tax',
          name: 'Tax Certificate',
          status: 'not_uploaded',
          uploadDate: null,
          expiryDate: null,
          fileUrl: null,
          required: false,
          description: 'Income tax certificate (if applicable)',
          fileSize: null,
          fileType: null
        },
        {
          id: 'pcc',
          name: 'Police Character Certificate',
          status: 'pending',
          uploadDate: '2024-09-01',
          expiryDate: '2025-09-01',
          fileUrl: '/documents/pcc.pdf',
          required: true,
          description: 'Police verification certificate',
          fileSize: '1.9 MB',
          fileType: 'PDF'
        }
      ]
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'expired':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'rejected':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'not_uploaded':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'expired':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'not_uploaded':
        return <Upload className="w-5 h-5 text-gray-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Under Review';
      case 'expired':
        return 'Expired';
      case 'rejected':
        return 'Rejected';
      case 'not_uploaded':
        return 'Not Uploaded';
      default:
        return 'Unknown';
    }
  };

  const handleUpload = (documentId) => {
    setSelectedDocument(documentId);
    setShowUpload(true);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate file upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setIsUploading(false);
          setShowUpload(false);
          setSelectedFile(null);
          alert('Document uploaded successfully! It will be reviewed within 24-48 hours.');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDeleteDocument = (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      alert('Document deleted successfully');
      // In real app, this would call API to delete document
    }
  };

  const handleViewDocument = (fileUrl) => {
    // In real app, this would open the document in a viewer or download it
    alert('Document viewer would open here');
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Documents</h1>
            <p className="text-sm text-gray-600">Manage your verification documents</p>
          </div>
          <button 
            onClick={() => setShowUpload(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Status Overview */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Document Status Overview</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {documents.flatMap(cat => cat.items).filter(doc => doc.status === 'verified').length}
              </div>
              <div className="text-sm text-green-700">Verified</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">
                {documents.flatMap(cat => cat.items).filter(doc => doc.status === 'pending').length}
              </div>
              <div className="text-sm text-yellow-700">Pending Review</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">
                {documents.flatMap(cat => cat.items).filter(doc => doc.status === 'rejected').length}
              </div>
              <div className="text-sm text-red-700">Rejected</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">
                {documents.flatMap(cat => cat.items).filter(doc => doc.status === 'expired').length}
              </div>
              <div className="text-sm text-orange-700">Expired</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Verification Progress</span>
              <span>{Math.round((documents.flatMap(cat => cat.items).filter(doc => doc.status === 'verified').length / documents.flatMap(cat => cat.items).filter(doc => doc.required).length) * 100)}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(documents.flatMap(cat => cat.items).filter(doc => doc.status === 'verified').length / documents.flatMap(cat => cat.items).filter(doc => doc.required).length) * 100}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Expiring Soon Alert */}
          {documents.flatMap(cat => cat.items).some(doc => isExpiringSoon(doc.expiryDate)) && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800">Documents Expiring Soon</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Some of your documents are expiring within 30 days. Please renew them to avoid service disruption.
                  </p>
                  <ul className="text-sm text-orange-700 mt-2 list-disc list-inside">
                    {documents.flatMap(cat => cat.items).filter(doc => isExpiringSoon(doc.expiryDate)).map(doc => (
                      <li key={doc.id}>{doc.name} - expires {new Date(doc.expiryDate).toLocaleDateString()}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Document Categories */}
        {documents.map(category => (
          <div key={category.id} className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{category.category}</h3>
            
            <div className="space-y-4">
              {category.items.map(doc => (
                <div key={doc.id} className={`p-4 rounded-lg border ${getStatusColor(doc.status)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getStatusIcon(doc.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-800 truncate">{doc.name}</h4>
                          {doc.required && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full whitespace-nowrap">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                        
                        {doc.uploadDate && (
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500">
                              <span>Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</span>
                              {doc.fileSize && doc.fileType && (
                                <span className="ml-2">• {doc.fileType} • {doc.fileSize}</span>
                              )}
                            </p>
                            {doc.expiryDate && (
                              <p className="text-xs text-gray-500">
                                Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                                {isExpiringSoon(doc.expiryDate) && (
                                  <span className="text-orange-600 font-medium ml-1">(Expiring Soon!)</span>
                                )}
                              </p>
                            )}
                          </div>
                        )}

                        {doc.rejectionReason && (
                          <div className="mt-2 p-3 bg-red-50 rounded border border-red-200">
                            <p className="text-sm text-red-700">
                              <strong>Rejection Reason:</strong> {doc.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                        {getStatusText(doc.status)}
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        {doc.fileUrl && (
                          <>
                            <button 
                              onClick={() => handleViewDocument(doc.fileUrl)}
                              className="p-2 text-gray-400 hover:text-blue-600 rounded transition-colors"
                              title="View Document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleViewDocument(doc.fileUrl)}
                              className="p-2 text-gray-400 hover:text-green-600 rounded transition-colors"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        <button 
                          onClick={() => handleUpload(doc.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded transition-colors"
                          title={doc.status === 'not_uploaded' ? 'Upload Document' : 'Re-upload Document'}
                        >
                          {doc.status === 'not_uploaded' ? (
                            <Upload className="w-4 h-4" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </button>

                        {doc.fileUrl && (
                          <button 
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded transition-colors"
                            title="Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Document Guidelines */}
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">📋 Document Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div className="space-y-2">
              <h4 className="font-medium">Photo Requirements:</h4>
              <div className="space-y-1">
                <div className="flex items-start space-x-2">
                  <span className="font-medium">✓</span>
                  <span>High resolution (minimum 1080p)</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-medium">✓</span>
                  <span>Good lighting, no shadows</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-medium">✓</span>
                  <span>All text clearly readable</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">File Specifications:</h4>
              <div className="space-y-1">
                <div className="flex items-start space-x-2">
                  <span className="font-medium">✓</span>
                  <span>Formats: PDF, JPG, PNG</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-medium">✓</span>
                  <span>Maximum size: 5MB</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-medium">✓</span>
                  <span>Documents must be valid/not expired</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Need Help?</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800">Document Verification Process</div>
                  <div className="text-sm text-gray-600">Learn about our verification timeline (24-48 hours)</div>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </button>
            <button className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800">Common Rejection Reasons</div>
                  <div className="text-sm text-gray-600">Why documents get rejected and how to fix them</div>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </button>
            <button className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800">Contact Support</div>
                  <div className="text-sm text-gray-600">Get help with document-related issues</div>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </button>
          </div>
        </div>

        {/* Verification Timeline */}
        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-4">⏱️ Verification Timeline</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-sm text-green-700">Document upload: Instant</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-sm text-green-700">Initial review: 2-6 hours</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-sm text-green-700">Final verification: 24-48 hours</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-sm text-green-700">Account activation: Within 1 hour of approval</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => !isUploading && setShowUpload(false)}
          ></div>
          <div className="relative bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Document</h3>
            
            <div className="space-y-4">
              {!selectedFile ? (
                <div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Drag and drop your file here</p>
                    <p className="text-sm text-gray-500 mb-4">or</p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer inline-block"
                    >
                      Choose File
                    </label>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 flex items-center justify-center space-x-2">
                      <Camera className="w-5 h-5" />
                      <span>Take Photo</span>
                    </button>
                    <label
                      htmlFor="file-upload"
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <FileText className="w-5 h-5" />
                      <span>Browse Files</span>
                    </label>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{selectedFile.name}</h4>
                        <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      {!isUploading && (
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isUploading && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <strong>Requirements:</strong> PDF, JPG, PNG formats only. Maximum 5MB. 
                Ensure document is clear and all text is readable.
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowUpload(false)}
                  disabled={isUploading}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isUploading}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload Document'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsScreen;