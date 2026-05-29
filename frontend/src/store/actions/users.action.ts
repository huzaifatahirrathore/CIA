import { IUser } from "../models/user.interface";
import apiClient from "../apiClient";

export const ADD_ADMIN: string = "ADD_ADMIN";
export const GET_USERS: string = "GET_USERS";
export const REMOVE_ADMIN: string = "REMOVE_ADMIN";

export function addAdmin(user: IUser): any {
    return async (dispatch: any) => {
        try {
            await apiClient.patch('/user/' + user.id, {
                username: user.username, role: "ADMIN"
            });
            return dispatch({ type: ADD_ADMIN, user: user });
        } catch (e: any) {
            console.error('addAdmin failed:', e.response?.data || e.message);
        }
    }
}

export function removeAdmin(user: IUser): (dispatch: any) => Promise<any> {
    return async (dispatch: any) => {
        try {
            await apiClient.patch('/user/' + user.id, {
                username: user.username, role: "NORMAL"
            });
            return dispatch({ type: REMOVE_ADMIN, user: user });
        } catch (e: any) {
            console.error('removeAdmin failed:', e.response?.data || e.message);
        }
    }
}

export function getUsers(): any {
    return async (dispatch: any) => {
        try {
            const response = await apiClient.get('/user');
            const tmpUsers: IUser[] = response.data;
            const users: IUser[] = [];
            const admins: IUser[] = [];
            tmpUsers.forEach((user: IUser) => {
                if (user.role === "ADMIN") {
                    admins.push(user);
                } else {
                    users.push(user);
                }
            });
            return dispatch({ type: GET_USERS, admins, users });
        } catch (e: any) {
            console.error('getUsers failed:', e.response?.data || e.message);
        }
    }
}
