import { IActionBase } from "../models/root.interface";
import { IAccount } from "../models/account.interface";
import {LOG_IN, LOG_OUT, REGISTER} from "../actions/account.actions";

const initialState: IAccount = {
    email: "",
    registered: false,
    role: ""
};

function accountReducer(state: IAccount = initialState, action: IActionBase): IAccount {
    switch (action.type) {
        case LOG_IN: {
            return { ...state, email: action.email, role: action.role || "", registered: false};
        }
        case LOG_OUT: {
            return { ...state, email: "", role: "", registered: false};
        }
        case REGISTER: {
            return { ...state, registered: true };
        }
        default:
            return state;
    }
}


export default accountReducer;