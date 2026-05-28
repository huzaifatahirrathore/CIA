import React from "react";
import { useSelector } from "react-redux";
import { IStateType, IInventoryState } from "../../store/models/root.interface";
import { IInventory } from "../../store/models/inventory.interface";

export type InventoryListProps = {
  onEdit: (item: IInventory) => void;
  onDelete: (item: IInventory) => void;
};

function InventoryList(props: InventoryListProps): React.ReactElement {
  const inventory: IInventoryState = useSelector((state: IStateType) => state.inventory);

  const rows = inventory.items.map(item => {
    if (!item) return null;
    const isSelected = inventory.selectedItem && inventory.selectedItem.id === item.id;
    return (
      <tr
        className={`table-row ${isSelected ? "selected" : ""}`}
        key={`inventory_${item.id}`}
      >
        <th scope="row">{item.id}</th>
        <td>{item.name}</td>
        <td>{item.category}</td>
        <td>{item.quantity}</td>
        <td>${item.price}</td>
        <td>{item.description}</td>
        <td>
          <div className="row-action-buttons">
            <button
              className="btn btn-sm btn-blue"
              title="Edit"
              onClick={() => props.onEdit(item)}
            >
              <i className="fas fa fa-pen"></i>
            </button>
            <button
              className="btn btn-sm btn-red"
              title="Delete"
              onClick={() => props.onDelete(item)}
            >
              <i className="fas fa fa-times"></i>
            </button>
          </div>
        </td>
      </tr>
    );
  });

  return (
    <div className="table-responsive portlet">
      <table className="table">
        <thead className="table-light">
          <tr>
            <th scope="col">#</th>
            <th scope="col">Name</th>
            <th scope="col">Category</th>
            <th scope="col">Quantity</th>
            <th scope="col">Price</th>
            <th scope="col">Description</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryList;
