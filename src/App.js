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
import FormulaireFeedback from './components/FormulaireFeedback';
import ResponsablePatrimoineHome from './components/ResponsablePatrimoineHome';
import EquipmentsRP from './components/EquipmentsRP';
import ValidationEquipementRP from './components/ValidationEquipementRP';
import HistoriqueDemandesRP from './components/HistoriqueDemandesRP';
import HistoriqueEquipementsRP from './components/HistoriqueEquipementsRP';
import TechnicienHome from './components/TechnicienHome';
import DiagnostiqueEquipements from './components/DiagnostiqueEquipements';
import EquipementReparation from './components/EquipementReparation';
import HistoriqueReparations from './components/HistoriqueReparations';
import NotificationsTechnicien from './components/NotificationsTechnicien';
import Notifications from './components/Notifications';
import MesDemandes from './components/MesDemandes;';
import DirecteurHome from './components/DirecteurHome';  
import EquipementsDirecteur  from './components/EquipementsDirecteur';
import DirecteurUtilisateurs from './components/DirecteurUtilisateurs';           
import DiagnosticsDirecteur from './components/DiagnosticsDirecteur';
import HistoriqueDemandesDirecteur from './components/HistoriqueDemandesDirecteur';
import  HistoriqueEquipementsDirecteur from './components/HistoriqueEquipementsDirecteur';


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
                <Route path="/FormulaireFeedback/:demandeId" element={<FormulaireFeedback />} />
                <Route path="/ResponsablePatrimoineHome" element={<ResponsablePatrimoineHome />} />
                <Route path="/EquipmentsRP" element={<EquipmentsRP />} />
                <Route path="/ValidationEquipementRP" element={<ValidationEquipementRP />} />
                <Route path="/HistoriqueDemandesRP" element={<HistoriqueDemandesRP />} />
                <Route path="/HistoriqueEquipementsRP" element={<HistoriqueEquipementsRP />} />
                <Route path="/TechnicienHome" element={<TechnicienHome />} />
                <Route path="/DiagnostiqueEquipements" element={<DiagnostiqueEquipements />} />
                <Route path="/EquipementReparation" element={<EquipementReparation />} />
                <Route path="/HistoriqueReparations" element={<HistoriqueReparations />} />
                <Route path="/NotificationsTechnicien" element={<NotificationsTechnicien />} />
                <Route path="/Notifications" element={<Notifications />} />
                <Route path="/MesDemandes" element={<MesDemandes />} />
                <Route path="/DirecteurHome" element={<DirecteurHome />} />
                <Route path="/EquipementsDirecteur" element={<EquipementsDirecteur />} />
                <Route path="/DirecteurUtilisateurs" element={<DirecteurUtilisateurs />} />
                <Route path="/DiagnosticsDirecteur" element={<DiagnosticsDirecteur />} />
                <Route path="/HistoriqueDemandesDirecteur" element={<HistoriqueDemandesDirecteur />} />
                <Route path="/HistoriqueEquipementsDirecteur" element={<HistoriqueEquipementsDirecteur />} />
            </Routes>
        </Router>
    );
}

export default App;