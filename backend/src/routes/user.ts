import {Router} from 'express';
import UserController from '../controller/UserController';
import {checkJwt} from '../middlewares/checkJwt';
import {checkRole} from '../middlewares/checkRole';

const router = Router();

// Get all users — any authenticated user can view the list
router.get('/', [checkJwt], UserController.listAll);

// Get one user — any authenticated user
router.get('/:id', [checkJwt], UserController.getOneById);

// Create a new user
router.post('/', [checkJwt, checkRole(['ADMIN'])], UserController.newUser);
// Edit one user
router.patch('/:id', [checkJwt, checkRole(['ADMIN'])], UserController.editUser);

// Delete one user
router.delete('/:id', [checkJwt, checkRole(['ADMIN'])], UserController.deleteUser);

export default router;
