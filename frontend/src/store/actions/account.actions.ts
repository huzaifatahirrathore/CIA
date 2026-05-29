import Cookies from "js-cookie";
import apiClient from "../apiClient";
import { tokenStore } from "../tokenStore";
import { addNotification } from "./notifications.action";

export const LOG_IN: string  = "LOG_IN";
export const REGISTER: string = "REGISTER";
export const LOG_OUT: string = "LOG_OUT";

export function login(username: string, password: string): any {
    return async (dispatch: any) => {
        try {
            const { data } = await apiClient.post('/auth/login', { username, password });
            tokenStore.set(data.accessToken);
            // Decode the JWT payload (no signature check — backend verifies on every request)
            const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
            return dispatch({ type: LOG_IN, email: payload.username, role: payload.role });
        } catch (e: any) {
            const msg = e.response?.data?.error ?? e.response?.data ?? e.message;
            return dispatch(addNotification("Error", msg));
        }
    };
}

export function refresh(): any {
    return async (dispatch: any) => {
        try {
            const { data } = await apiClient.post('/auth/refresh');
            tokenStore.set(data.accessToken);
            const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
            dispatch({ type: LOG_IN, email: payload.username, role: payload.role });
            return true;
        } catch {
            Cookies.remove('loggedIn');
            dispatch({ type: LOG_OUT });
            return false;
        }
    };
}

export function register(username: string, password: string): any {
    return async (dispatch: any) => {
        try {
            const { data } = await apiClient.post('/auth/register', { username, password });
            dispatch(addNotification("Success", data));
            return dispatch({ type: REGISTER });
        } catch (e: any) {
            const body = e.response?.data;
            if (Array.isArray(body) && body[0]?.constraints) {
                const first = Object.values(body[0].constraints)[0] as string;
                return dispatch(addNotification("Error", first));
            }
            return dispatch(addNotification("Error", typeof body === "string" ? body : JSON.stringify(body)));
        }
    };
}

export function logout(): any {
    return async (dispatch: any) => {
        try {
            await apiClient.post('/auth/logout');
        } catch { /* best-effort */ }
        tokenStore.clear();
        Cookies.remove('loggedIn');
        dispatch({ type: LOG_OUT });
    };
}
