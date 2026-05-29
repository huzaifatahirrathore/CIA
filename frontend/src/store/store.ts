import { legacy_createStore as createStore, applyMiddleware, Store } from "redux";
import { thunk, ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import rootReducers from "./reducers/root.reducer";
import { tokenStore } from "./tokenStore";
import { logout } from "./actions/account.actions";

const store: Store = createStore(rootReducers, applyMiddleware(thunk as any));

// Typed dispatch that knows thunks return Promises
export type AppDispatch = ThunkDispatch<ReturnType<typeof rootReducers>, void, AnyAction>;

tokenStore.registerUnauthenticatedHandler(() => {
    store.dispatch(logout() as any);
    window.location.href = '/login';
});

store.subscribe(() => {});
export default store;
