import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { Contactos } from './pages/Contactos';
import { Meetings } from './pages/Meetings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/contactos" element={<Contactos />} />
          <Route path="/meetings" element={<Meetings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
