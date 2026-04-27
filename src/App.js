import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PatientsPage from './pages/PatientsPage';
import MedicalRecordPage from './pages/MedicalRecordPage';
import NuevaConsultaPage from './pages/NuevaConsultaPage';
import LabPanel from './pages/LabPanel';
import ResultsPanel from './pages/ResultsPanel';
import ImportExportPage from './pages/ImportExportPage';

import UsersPage from './pages/UsersPage';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import NavbarLayout from './layouts/NavbarLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<NavbarLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patients/:id" element={<MedicalRecordPage />} />
            <Route path="/patients/:id/lab" element={<LabPanel />} />
            <Route path="/lab" element={<LabPanel />} />
            <Route path="/results" element={<ResultsPanel />} />
            <Route path="/import-export" element={<ImportExportPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/consultas/nueva" element={<NuevaConsultaPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
