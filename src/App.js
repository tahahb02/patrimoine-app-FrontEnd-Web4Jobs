import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ResponsableHome from './components/ResponsableHome';
import Equipments from './components/Equipments';
import AdherantHome from './components/AdherantHome';
import EquipmentDisponible from './components/EquipmentDisponible';
import GestionDemandes from './components/GestionDemandes';
import AdminHome from './components/AdminHome';
import GererUtilisateurs from './components/GererUtilisateurs';
import SuiviDemandeAdherant from './components/SuiviDemandeAdherant';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/ResponsableHome" element={<ResponsableHome />} />
                <Route path="/AdherantHome" element={<AdherantHome />} />
                <Route path="/Equipments" element={<Equipments />} />
                <Route path="/EquipmentDisponible" element={<EquipmentDisponible />} />
                <Route path="/GestionDemandes" element={<GestionDemandes />} />
                <Route path="/AdminHome" element={<AdminHome />} />
                <Route path="/GererUtilisateurs" element={<GererUtilisateurs />} />
                <Route path="/SuiviDemandeAdherant" element={<SuiviDemandeAdherant />} />
            </Routes>
        </Router>
    );
}

export default App;
