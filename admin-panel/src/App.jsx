import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import RideManagement from './components/RideManagement';
import DriverManagement from './components/DriverManagement';
import CustomerManagement from './components/CustomerManagement';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Login from './components/Login';
import { AuthProvider, useAuth } from './services/AuthService';
import { SocketProvider } from './services/SocketService';
import { APIProvider } from './services/APIService';
import NotificationManager from './components/NotificationManager';
import './App.css';

const AppLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <Header 
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          user={user}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="container mx-auto fade-in">
            {children}
          </div>
        </main>
      </div>
      <NotificationManager />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <APIProvider>
        <SocketProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/*" element={
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/rides" element={<RideManagement />} />
                      <Route path="/drivers" element={<DriverManagement />} />
                      <Route path="/customers" element={<CustomerManagement />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </AppLayout>
                } />
              </Routes>
            </div>
          </Router>
        </SocketProvider>
      </APIProvider>
    </AuthProvider>
  );
};

export default App;