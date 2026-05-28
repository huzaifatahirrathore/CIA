import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

interface PrivateComponentProps {
    children: React.ReactNode;
}

export function PrivateComponent({ children }: PrivateComponentProps): any {
    const token = Cookies.get("token");
    return token ? children : <Navigate to="/login" replace />;
}
