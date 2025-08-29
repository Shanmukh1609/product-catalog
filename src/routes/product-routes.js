import express from 'express';
import {getProductById,createProduct,updateProduct,deleteProduct} from '../controllers/products.js';


const router = express.Router();

router.get('/:id',getProductById);
router.post('/newProduct',createProduct);
router.put('/updateProduct/:id',updateProduct);
router.delete('/deleteProduct/:id',deleteProduct);

export default router;