import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

interface PrivateRouteProps {
    children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps): React.ReactElement {
    const token = Cookies.get("token");
    return token ? <>{children}</> : <Navigate to="/login" replace />;
}
