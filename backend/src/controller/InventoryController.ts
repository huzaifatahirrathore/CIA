import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Inventory } from '../entity/Inventory';
import { validate } from 'class-validator';

class InventoryController {
  static listAll = async (req: Request, res: Response) => {
    const inventoryRepository = getRepository(Inventory);
    const items = await inventoryRepository.find();
    res.send(items);
  };

  static getOne = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const inventoryRepository = getRepository(Inventory);
    try {
      const item = await inventoryRepository.findOneOrFail(id);
      res.send(item);
    } catch (error) {
      res.status(404).send('Inventory item not found');
    }
  };

  static create = async (req: Request, res: Response) => {
    const { name, description, quantity, price, category } = req.body;
    const item = new Inventory();
    item.name = name;
    item.description = description;
    item.quantity = quantity;
    item.price = price;
    item.category = category;

    const errors = await validate(item);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    const inventoryRepository = getRepository(Inventory);
    try {
      await inventoryRepository.save(item);
    } catch (e) {
      res.status(409).send('Inventory item could not be created');
      return;
    }
    res.status(201).send('Inventory item created');
  };

  static update = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { name, description, quantity, price, category } = req.body;
    const inventoryRepository = getRepository(Inventory);
    let item;
    try {
      item = await inventoryRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send('Inventory item not found');
      return;
    }
    item.name = name ?? item.name;
    item.description = description ?? item.description;
    item.quantity = quantity ?? item.quantity;
    item.price = price ?? item.price;
    item.category = category ?? item.category;

    const errors = await validate(item);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }
    try {
      await inventoryRepository.save(item);
    } catch (e) {
      res.status(409).send('Inventory item could not be updated');
      return;
    }
    res.status(204).send();
  };

  static delete = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const inventoryRepository = getRepository(Inventory);
    let item;
    try {
      item = await inventoryRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send('Inventory item not found');
      return;
    }
    await inventoryRepository.delete(id);
    res.status(204).send();
  };
}

export default InventoryController;
