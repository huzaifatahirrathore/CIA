import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { refresh } from "../../store/actions/account.actions";
import { IStateType } from "../../store/models/root.interface";
import { AppDispatch } from "../../store/store";

interface PrivateComponentProps {
    children: React.ReactNode;
}

export function PrivateComponent({ children }: PrivateComponentProps): any {
    const dispatch = useDispatch<AppDispatch>();
    const email = useSelector((state: IStateType) => state.account.email);
    const [loading, setLoading] = useState(!email && !!Cookies.get('loggedIn'));

    useEffect(() => {
        if (!email && Cookies.get('loggedIn')) {
            dispatch(refresh()).finally(() => setLoading(false));
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) return null;
    if (!email) return <Navigate to="/login" replace />;
    return <>{children}</>;
}
