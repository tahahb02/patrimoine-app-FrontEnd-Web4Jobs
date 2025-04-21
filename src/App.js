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
import Account from './components/Account';
import HistoriqueDemandes from './components/HistoriqueDemandes';
import HistoriqueEquipements from './components/HistoriqueEquipements';
import LivraisonsRetours from './components/LivraisonsRetours';
import TechnicienHome from './components/TechnicienHome';
import FormulaireFeedback from './components/FormulaireFeedback';

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
                <Route path="/Account" element={<Account />} />
                <Route path="/HistoriqueDemandes" element={<HistoriqueDemandes />} />
                <Route path="/HistoriqueEquipements" element={<HistoriqueEquipements />} />
                <Route path="/LivraisonsRetours" element={<LivraisonsRetours />} />
                <Route path="/TechnicienHome" element={<TechnicienHome />} />
                <Route path="/FormulaireFeedback" element={<FormulaireFeedback />} />
            </Routes>
        </Router>
    );
}

export default App;
