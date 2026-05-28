import { IInventoryState, IActionBase } from "../models/root.interface";
import {
    SET_INVENTORY,
    REMOVE_INVENTORY,
    CHANGE_INVENTORY_PENDING_EDIT,
    CLEAR_INVENTORY_PENDING_EDIT,
    SET_INVENTORY_MODIFICATION_STATE
} from "../actions/inventory.actions";
import { InventoryModificationStatus } from "../models/inventory.interface";

const initialState: IInventoryState = {
    modificationState: InventoryModificationStatus.None,
    selectedItem: null,
    items: []
};

function inventoryReducer(state: IInventoryState = initialState, action: IActionBase): IInventoryState {
    switch (action.type) {
        case SET_INVENTORY:
            return { ...state, items: action.items };
        case REMOVE_INVENTORY:
            return { ...state, items: state.items.filter(i => i.id !== action.id) };
        case CHANGE_INVENTORY_PENDING_EDIT:
            return { ...state, selectedItem: action.item };
        case CLEAR_INVENTORY_PENDING_EDIT:
            return { ...state, selectedItem: null };
        case SET_INVENTORY_MODIFICATION_STATE:
            return { ...state, modificationState: action.value };
        default:
            return state;
    }
}

export default inventoryReducer;
