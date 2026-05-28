import { legacy_createStore as createStore, applyMiddleware, Store } from "redux";
import { thunk } from "redux-thunk";
import rootReducers from "./reducers/root.reducer";

const store: Store = createStore(rootReducers, applyMiddleware(thunk as any));

store.subscribe(() => {});
export default store;
