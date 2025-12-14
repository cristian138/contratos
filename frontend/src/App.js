import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/App.css';
import { Toaster } from '@/components/ui/sonner';

// Admin pages
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';
import Contracts from '@/pages/Contracts';
import SignatureRequests from '@/pages/SignatureRequests';
import AuditLogs from '@/pages/AuditLogs';
import VerifyIntegrity from '@/pages/VerifyIntegrity';

// Public pages
import SignContract from '@/pages/SignContract';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/contracts" element={<Contracts />} />
          <Route path="/admin/signature-requests" element={<SignatureRequests />} />
          <Route path="/admin/audit-logs" element={<AuditLogs />} />
          <Route path="/admin/verify" element={<VerifyIntegrity />} />
          <Route path="/sign/:token" element={<SignContract />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;