import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Dashboard from "./Dashboard";
import Monitoring from "./Monitoring";
import Alerts from "./Alerts";
import Settings from "./Settings";

function App() {
 return (
 <Router>
 <Routes>
 <Route path="/" element={<Home />} />
 <Route path="/dashboard" element={<Dashboard />} />
 <Route path="/monitoring" element={<Monitoring />} />
 <Route path="/alerts" element={<Alerts />} />
 <Route path="/settings" element={<Settings />} />
 </Routes>
 </Router>
 );
}

export default App;