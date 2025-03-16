import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ResponsableHome from './components/ResponsableHome';
import Equipments from './components/Equipments';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/ResponsableHome" element={<ResponsableHome />} />
                <Route path="/ResponsableHome" element={<ResponsableHome />} />
                <Route path="/Equipments" element={<Equipments />} />

            </Routes>
        </Router>
    );
}

export default App;
