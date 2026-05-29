import React, { Fragment, Dispatch, useState, useEffect } from "react";
import InventoryList from "./InventoryList";
import InventoryForm from "./InventoryForm";
import TopCard from "../../common/components/TopCard";
import "./Inventory.css";
import { useDispatch, useSelector } from "react-redux";
import { updateCurrentPath } from "../../store/actions/root.actions";
import { IInventoryState, IStateType, IRootPageStateType } from "../../store/models/root.interface";
import { IInventory, InventoryModificationStatus } from "../../store/models/inventory.interface";
import Popup from "reactjs-popup";
import {
  fetchInventory,
  deleteInventoryItem,
  clearSelectedInventory,
  setInventoryModificationState,
  changeSelectedInventory
} from "../../store/actions/inventory.actions";
import { addNotification } from "../../store/actions/notifications.action";

const Inventory: React.FC = () => {
  const dispatch: Dispatch<any> = useDispatch();
  const inventory: IInventoryState = useSelector((state: IStateType) => state.inventory);
  const path: IRootPageStateType = useSelector((state: IStateType) => state.root.page);
  const isAdmin: boolean = useSelector((state: IStateType) => state.account.role === "ADMIN");
  const [popup, setPopup] = useState(false);

  useEffect(() => {
    dispatch(clearSelectedInventory());
    dispatch(updateCurrentPath("inventory", "list"));
    dispatch(fetchInventory());
  }, [path.area, dispatch]);

  const totalQuantity: number = inventory.items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const totalValue: number = inventory.items.reduce((sum, i) => sum + ((i.price * i.quantity) || 0), 0);

  function onRowEdit(item: IInventory): void {
    dispatch(changeSelectedInventory(item));
    dispatch(setInventoryModificationState(InventoryModificationStatus.Edit));
  }

  function onRowDelete(item: IInventory): void {
    dispatch(changeSelectedInventory(item));
    setPopup(true);
  }

  return (
    <Fragment>
      <h1 className="h3 mb-2 text-gray-800">Inventory</h1>
      <p className="mb-4">Manage inventory items</p>
      <div className="row">
        <TopCard title="ITEM COUNT" text={`${inventory.items.length}`} icon="box" class="primary" />
        <TopCard title="TOTAL QUANTITY" text={`${totalQuantity}`} icon="warehouse" class="danger" />
        <TopCard title="TOTAL VALUE" text={`$${totalValue.toFixed(2)}`} icon="dollar-sign" class="success" />
      </div>

      <div className="row">
        <div className="col-xl-12 col-lg-12">
          <div className="card shadow mb-4">
            <div className="card-header py-3 inventory-card-header">
              <h6 className="m-0 fw-bold text-green">Inventory List</h6>
              {isAdmin && (
                <button className="btn btn-success btn-green" onClick={() =>
                  dispatch(setInventoryModificationState(InventoryModificationStatus.Create))}>
                  <i className="fas fa fa-plus"></i>
                </button>
              )}
            </div>
            <div className="card-body">
              <InventoryList onEdit={onRowEdit} onDelete={onRowDelete} />
            </div>
          </div>
        </div>
        {((inventory.modificationState === InventoryModificationStatus.Create)
          || (inventory.modificationState === InventoryModificationStatus.Edit && inventory.selectedItem))
          ? <InventoryForm /> : null}
      </div>

      <Popup
        className="popup-modal"
        open={popup}
        onClose={() => setPopup(false)}
        closeOnDocumentClick
      >
        <div className="popup-modal">
          <div className="popup-title">Are you sure?</div>
          <div className="popup-content">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                if (!inventory.selectedItem) return;
                dispatch(addNotification("Inventory", `Item "${inventory.selectedItem.name}" removed`));
                dispatch(deleteInventoryItem(inventory.selectedItem.id));
                dispatch(clearSelectedInventory());
                setPopup(false);
              }}
            >
              Remove
            </button>
          </div>
        </div>
      </Popup>
    </Fragment>
  );
};

export default Inventory;
