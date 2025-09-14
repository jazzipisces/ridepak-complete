import React, { useState, useContext } from 'react';
import { 
  Car, 
  Edit, 
  Camera, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  FileText,
  Upload,
  Eye,
  Settings
} from 'lucide-react';
import { DriverContext } from '../utils/DriverContext';

const VehicleScreen = () => {
  const { driver } = useContext(DriverContext);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const vehicleInfo = {
    type: 'Car',
    make: 'Toyota',
    model: 'Corolla',
    year: '2020',
    color: 'White',
    plateNumber: 'ABC-123',
    engineCC: '1300',
    fuelType: 'Petrol',
    transmission: 'Manual',
    registrationDate: '2020-03-15',
    insuranceExpiry: '2024-12-31',
    fitnessExpiry: '2024-11-30'
  };

  const documents = [
    {
      id: 1,
      name: 'Vehicle Registration',
      status: 'verified',
      uploadDate: '2024-01-15',
      expiryDate: '2025-01-15',
      fileUrl: '/documents/registration.pdf'
    },
    {
      id: 2,
      name: 'Insurance Certificate',
      status: 'verified',
      uploadDate: '2024-01-10',
      expiryDate: '2024-12-31',
      fileUrl: '/documents/insurance.pdf'
    },
    {
      id: 3,
      name: 'Fitness Certificate',
      status: 'pending',
      uploadDate: '2024-09-01',
      expiryDate: '2024-11-30',
      fileUrl: '/documents/fitness.pdf'
    },
    {
      id: 4,
      name: 'Route Permit',
      status: 'expired',
      uploadDate: '2023-12-01',
      expiryDate: '2024-08-31',
      fileUrl: '/documents/permit.pdf'
    }
  ];

  const vehicleImages = [
    { id: 1, type: 'front', url: '/images/car-front.jpg', uploaded: true },
    { id: 2, type: 'back', url: '/images/car-back.jpg', uploaded: true },
    { id: 3, type: 'left', url: '/images/car-left.jpg', uploaded: true },
    { id: 4, type: 'right', url: '/images/car-right.jpg', uploaded: false },
    { id: 5, type: 'interior', url: '/images/car-interior.jpg', uploaded: true },
    { id: 6, type: 'dashboard', url: '/images/car-dashboard.jpg', uploaded: false }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const VehicleInfo = () => (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Vehicle Details</h3>
          <button 
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Type</label>
            <p className="font-medium text-gray-800">{vehicleInfo.type}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Make & Model</label>
            <p className="font-medium text-gray-800">{vehicleInfo.make} {vehicleInfo.model}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Year</label>
            <p className="font-medium text-gray-800">{vehicleInfo.year}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Color</label>
            <p className="font-medium text-gray-800">{vehicleInfo.color}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Plate Number</label>
            <p className="font-medium text-gray-800">{vehicleInfo.plateNumber}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Engine CC</label>
            <p className="font-medium text-gray-800">{vehicleInfo.engineCC}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Fuel Type</label>
            <p className="font-medium text-gray-800">{vehicleInfo.fuelType}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Transmission</label>
            <p className="font-medium text-gray-800">{vehicleInfo.transmission}</p>
          </div>
        </div>
      </div>

      {/* Vehicle Status */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Status</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Active & Verified</span>
            </div>
            <span className="text-sm text-green-600">All documents approved</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Insurance Expires:</span>
              <span className="font-medium">{new Date(vehicleInfo.insuranceExpiry).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Fitness Expires:</span>
              <span className="font-medium">{new Date(vehicleInfo.fitnessExpiry).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const DocumentsTab = () => (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Required Documents</h3>
        
        <div className="space-y-3">
          {documents.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(doc.status)}
                <div>
                  <h4 className="font-medium text-gray-800">{doc.name}</h4>
                  <p className="text-sm text-gray-600">
                    Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                  </p>
                  {doc.expiryDate && (
                    <p className="text-xs text-gray-500">
                      Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                </span>
                <button className="p-2 text-gray-400 hover:text-blue-600">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-blue-600">
                  <Upload className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Upload New Document</span>
        </button>
      </div>
    </div>
  );

  const PhotosTab = () => (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Photos</h3>
        <p className="text-sm text-gray-600 mb-4">
          High-quality photos help customers identify your vehicle easily
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          {vehicleImages.map(image => (
            <div key={image.id} className="relative">
              <div className={`aspect-square rounded-lg border-2 border-dashed flex items-center justify-center ${
                image.uploaded ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
              }`}>
                {image.uploaded ? (
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-700 capitalize">{image.type}</p>
                    <p className="text-xs text-green-600">Uploaded</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 capitalize">{image.type}</p>
                    <p className="text-xs text-gray-500">Not uploaded</p>
                  </div>
                )}
              </div>
              
              <button className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700">
                <Camera className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">📸 Photo Guidelines</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Take photos in good lighting</li>
            <li>• Ensure license plate is clearly visible</li>
            <li>• Vehicle should be clean and undamaged</li>
            <li>• Photos should be recent (within 30 days)</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">Accept Intercity Rides</h4>
              <p className="text-sm text-gray-600">Allow long-distance trips outside city</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">Cargo Services</h4>
              <p className="text-sm text-gray-600">Accept package delivery requests</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">Pool Rides</h4>
              <p className="text-sm text-gray-600">Accept shared ride requests</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Ride Distance (km)
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="50">50 km</option>
              <option value="100">100 km</option>
              <option value="200">200 km</option>
              <option value="unlimited">Unlimited</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Service Areas
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Blue Area', 'F-7', 'G-9', 'Saddar', 'PWD', 'Gulberg'].map(area => (
                <label key={area} className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                  <span className="text-sm text-gray-700">{area}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'info', name: 'Vehicle Info', icon: Car },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'photos', name: 'Photos', icon: Camera },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <h1 className="text-xl font-bold text-gray-800">My Vehicle</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-blue-600'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'info' && <VehicleInfo />}
        {activeTab === 'documents' && <DocumentsTab />}
        {activeTab === 'photos' && <PhotosTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
};

export default VehicleScreen;