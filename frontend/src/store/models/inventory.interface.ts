export interface IInventory {
    id: number;
    name: string;
    description: string;
    quantity: number;
    price: number;
    category: string;
}

export enum InventoryModificationStatus {
    None = 0,
    Create = 1,
    Edit = 2
}
