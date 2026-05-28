import React, { useState, FormEvent, Dispatch, Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import { IStateType, IInventoryState } from "../../store/models/root.interface";
import { IInventory, InventoryModificationStatus } from "../../store/models/inventory.interface";
import TextInput from "../../common/components/TextInput";
import NumberInput from "../../common/components/NumberInput";
import SelectInput from "../../common/components/Select";
import { OnChangeModel, IInventoryFormState } from "../../common/types/Form.types";
import {
  createInventoryItem,
  updateInventoryItem,
  clearSelectedInventory,
  setInventoryModificationState
} from "../../store/actions/inventory.actions";

const InventoryForm: React.FC = () => {
  const dispatch: Dispatch<any> = useDispatch();
  const inventory: IInventoryState = useSelector((state: IStateType) => state.inventory);
  let item: IInventory | null = inventory.selectedItem;
  const isCreate: boolean = inventory.modificationState === InventoryModificationStatus.Create;

  if (!item || isCreate) {
    item = { id: 0, name: "", description: "", quantity: 0, price: 0, category: "" };
  }

  const [formState, setFormState] = useState<IInventoryFormState>({
    name: { error: "", value: item.name },
    description: { error: "", value: item.description },
    quantity: { error: "", value: item.quantity },
    price: { error: "", value: item.price },
    category: { error: "", value: item.category }
  });

  function hasFormValueChanged(model: OnChangeModel): void {
    setFormState({ ...formState, [model.field]: { error: model.error, value: model.value } });
  }

  function onSave(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (isFormInvalid()) return;

    const payload = {
      name: formState.name.value as string,
      description: formState.description.value as string,
      quantity: formState.quantity.value as number,
      price: formState.price.value as number,
      category: formState.category.value as string
    };

    if (isCreate) {
      dispatch(createInventoryItem(payload));
    } else if (item) {
      dispatch(updateInventoryItem(item.id, payload));
    }

    dispatch(clearSelectedInventory());
    dispatch(setInventoryModificationState(InventoryModificationStatus.None));
  }

  function cancelForm(): void {
    dispatch(setInventoryModificationState(InventoryModificationStatus.None));
  }

  function isFormInvalid(): boolean {
    return !!(
      formState.name.error || formState.description.error ||
      formState.quantity.error || formState.price.error ||
      formState.category.error || !formState.name.value || !formState.category.value
    );
  }

  function getDisabledClass(): string {
    return isFormInvalid() ? "disabled" : "";
  }

  return (
    <Fragment>
      <div className="col-xl-7 col-lg-7">
        <div className="card shadow mb-4">
          <div className="card-header py-3">
            <h6 className="m-0 fw-bold text-green">Inventory {isCreate ? "create" : "edit"}</h6>
          </div>
          <div className="card-body">
            <form onSubmit={onSave}>
              <div className="row">
                <div className="mb-3 col-md-6">
                  <TextInput
                    id="input_name"
                    value={formState.name.value}
                    field="name"
                    onChange={hasFormValueChanged}
                    required={true}
                    maxLength={100}
                    label="Name"
                    placeholder="Name"
                  />
                </div>
                <div className="mb-3 col-md-6">
                  <SelectInput
                    id="input_category"
                    field="category"
                    label="Category"
                    options={["Electronics", "Food", "Clothing", "Tools", "Other"]}
                    required={true}
                    onChange={hasFormValueChanged}
                    value={formState.category.value}
                  />
                </div>
              </div>
              <div className="mb-3">
                <TextInput
                  id="input_description"
                  field="description"
                  value={formState.description.value}
                  onChange={hasFormValueChanged}
                  required={false}
                  maxLength={200}
                  label="Description"
                  placeholder="Description"
                />
              </div>
              <div className="row">
                <div className="mb-3 col-md-6">
                  <NumberInput
                    id="input_quantity"
                    value={formState.quantity.value}
                    field="quantity"
                    onChange={hasFormValueChanged}
                    max={100000}
                    min={0}
                    label="Quantity"
                  />
                </div>
                <div className="mb-3 col-md-6">
                  <NumberInput
                    id="input_price"
                    value={formState.price.value}
                    field="price"
                    onChange={hasFormValueChanged}
                    max={1000000}
                    min={0}
                    label="Price"
                  />
                </div>
              </div>
              <button className="btn btn-danger" type="button" onClick={cancelForm}>Cancel</button>
              <button type="submit" className={`btn btn-success left-margin ${getDisabledClass()}`}>Save</button>
            </form>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default InventoryForm;
