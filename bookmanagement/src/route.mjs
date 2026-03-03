import express from 'express';
const router = express.Router();
import { registerUser,login } from './controllers/userController.mjs';
import { createBook, getBooks } from './controllers/bookController.mjs';
router.post('/register', registerUser);
router.post('/login', login);
router.post('/books', createBook);
router.get('/books', getBooks);

export default router;