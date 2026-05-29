import apiClient from "../apiClient";
import { IInventory, InventoryModificationStatus } from "../models/inventory.interface";
import { addNotification } from "./notifications.action";

export const SET_INVENTORY: string = "SET_INVENTORY";
export const ADD_INVENTORY: string = "ADD_INVENTORY";
export const EDIT_INVENTORY: string = "EDIT_INVENTORY";
export const REMOVE_INVENTORY: string = "REMOVE_INVENTORY";
export const CHANGE_INVENTORY_PENDING_EDIT: string = "CHANGE_INVENTORY_PENDING_EDIT";
export const CLEAR_INVENTORY_PENDING_EDIT: string = "CLEAR_INVENTORY_PENDING_EDIT";
export const SET_INVENTORY_MODIFICATION_STATE: string = "SET_INVENTORY_MODIFICATION_STATE";

export function fetchInventory(): any {
    return async (dispatch: any) => {
        try {
            const response = await apiClient.get('/inventory');
            dispatch({ type: SET_INVENTORY, items: response.data });
        } catch (e: any) {
            dispatch(addNotification("Error", e.response?.data || e.message));
        }
    };
}

export function createInventoryItem(item: Omit<IInventory, 'id'>): any {
    return async (dispatch: any) => {
        try {
            await apiClient.post('/inventory', item);
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
            await apiClient.patch(`/inventory/${id}`, item);
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
            await apiClient.delete(`/inventory/${id}`);
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
