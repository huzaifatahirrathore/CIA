import axios from "axios";
import Cookies from "js-cookie";
import { IInventory, InventoryModificationStatus } from "../models/inventory.interface";
import { addNotification } from "./notifications.action";

export const SET_INVENTORY: string = "SET_INVENTORY";
export const ADD_INVENTORY: string = "ADD_INVENTORY";
export const EDIT_INVENTORY: string = "EDIT_INVENTORY";
export const REMOVE_INVENTORY: string = "REMOVE_INVENTORY";
export const CHANGE_INVENTORY_PENDING_EDIT: string = "CHANGE_INVENTORY_PENDING_EDIT";
export const CLEAR_INVENTORY_PENDING_EDIT: string = "CLEAR_INVENTORY_PENDING_EDIT";
export const SET_INVENTORY_MODIFICATION_STATE: string = "SET_INVENTORY_MODIFICATION_STATE";

const instance = axios.create({
    baseURL: 'http://' + process.env.REACT_APP_API_URL,
    timeout: 5000
});

function authHeader() {
    return { auth: Cookies.get('token') };
}

export function fetchInventory(): any {
    return async (dispatch: any) => {
        try {
            const response = await instance.get('/inventory', { headers: authHeader() });
            dispatch({ type: SET_INVENTORY, items: response.data });
        } catch (e: any) {
            dispatch(addNotification("Error", e.response?.data || e.message));
        }
    };
}

export function createInventoryItem(item: Omit<IInventory, 'id'>): any {
    return async (dispatch: any) => {
        try {
            await instance.post('/inventory', item, { headers: authHeader() });
            dispatch(addNotification("Success", `Item "${item.name}" created`));
            dispatch(fetchInventory());
        } catch (e: any) {
            dispatch(addNotification("Error", e.response?.data || e.message));
        }
    };
}

export function updateInventoryItem(id: number, item: Omit<IInventory, 'id'>): any {
    return async (dispatch: any) => {
        try {
            await instance.patch(`/inventory/${id}`, item, { headers: authHeader() });
            dispatch(addNotification("Success", `Item "${item.name}" updated`));
            dispatch(fetchInventory());
        } catch (e: any) {
            dispatch(addNotification("Error", e.response?.data || e.message));
        }
    };
}

export function deleteInventoryItem(id: number): any {
    return async (dispatch: any) => {
        try {
            await instance.delete(`/inventory/${id}`, { headers: authHeader() });
            dispatch(addNotification("Success", `Item deleted`));
            dispatch({ type: REMOVE_INVENTORY, id });
        } catch (e: any) {
            dispatch(addNotification("Error", e.response?.data || e.message));
        }
    };
}

export function changeSelectedInventory(item: IInventory): IChangeSelectedInventoryActionType {
    return { type: CHANGE_INVENTORY_PENDING_EDIT, item };
}

export function clearSelectedInventory(): IClearSelectedInventoryActionType {
    return { type: CLEAR_INVENTORY_PENDING_EDIT };
}

export function setInventoryModificationState(value: InventoryModificationStatus): ISetInventoryModificationStateActionType {
    return { type: SET_INVENTORY_MODIFICATION_STATE, value };
}

interface IChangeSelectedInventoryActionType { type: string; item: IInventory }
interface IClearSelectedInventoryActionType { type: string }
interface ISetInventoryModificationStateActionType { type: string; value: InventoryModificationStatus }
