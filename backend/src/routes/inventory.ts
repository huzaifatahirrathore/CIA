import { Router } from 'express';
import InventoryController from '../controller/InventoryController';
import { checkJwt } from '../middlewares/checkJwt';
import { checkRole } from '../middlewares/checkRole';

const router = Router();

// List all inventory items (auth required)
router.get('/', [checkJwt], InventoryController.listAll);

// Get one inventory item by id (auth required)
router.get('/:id([0-9]+)', [checkJwt], InventoryController.getOne);

// Create new inventory item (ADMIN only)
router.post('/', [checkJwt, checkRole(['ADMIN'])], InventoryController.create);

// Update inventory item (ADMIN only)
router.patch('/:id([0-9]+)', [checkJwt, checkRole(['ADMIN'])], InventoryController.update);

// Delete inventory item (ADMIN only)
router.delete('/:id([0-9]+)', [checkJwt, checkRole(['ADMIN'])], InventoryController.delete);

export default router;
