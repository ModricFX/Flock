import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage'; // Uvoz LoginPage.jsx
import RegisterPage from './components/RegisterPage'; // Uvoz RegisterPage.jsx
import HelloUser from './components/HelloUser'; // Uvoz HelloUser.jsx

const App = () => {
    return (
        <Router>
            <div className="App">
            <br />
               {/*<Typography variant="h1" align="center"> </Typography>*/}
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/Hello" element={<HelloUser />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;