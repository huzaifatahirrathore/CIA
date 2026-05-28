import React from "react";
import "./App.css";
import "./styles/sb-admin-2.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Account/Login";
import Admin from "./components/Admin/Admin";
import Register from "./components/Account/Register";
import { PrivateComponent } from "./common/components/PrivateComponent";
import { UseSessionProvider as UseSessionProviderBase } from "react-session-hook";
const UseSessionProvider = UseSessionProviderBase as React.ComponentType<{ children: React.ReactNode }>;

const App: React.FC = () => {
    return (
        <UseSessionProvider>
            <div className="App" id="wrapper">
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/*" element={
                            <PrivateComponent>
                                <Admin />
                            </PrivateComponent>
                        } />
                    </Routes>
                </Router>
            </div>
        </UseSessionProvider>
    );
};

export default App;
