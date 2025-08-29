import redisClient from '../config/redis-connection.js';
import logger from '../utils/logger.js';
import db from '../config/db.js';



export const getProductById = async (req, res) => {

    logger.info("Returning the product details based on the id of the product");
    try{
      
        const {id} = req.params;
        const cacheKey =`product:${id}`;

        const cachedProduct = await redisClient.get(cacheKey);
        
        if(cachedProduct){
             logger.info(`Product details of ${id} added to cache with key ${cacheKey}`);

           return  res.status(201).json({
                source:"cache",
                success:true,
                message:`Details of the product ${id} sent successfully`,
                data:JSON.parse(cachedProduct)
            });
        }
          

        //Send the details from the database and add it to cache.
        const query =   `SELECT * FROM products WHERE id = $1`;
        const  result  = await db.query(query, [id]);
        const product = result.rows[0];

        if(!product){
            return res.status(404).json({
                success:false,
                message:`Product ${id} is not found`
            });
        }
          
        //Add to the redis cache.
        await redisClient.setEx(cacheKey,3600,JSON.stringify(product));
    
        return res.status(201).json({
                source:"DB",
                success:true,
                message:`Details of the product ${id} sent successfully`,
                data:product
        });

    }
    catch(err){
        logger.error('Error fetching product:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error in getProductById' });
    }
};


export const createProduct = async (req,res)=>{
    logger.info("Creating a new product");
    try{
        const {id,name,price,stock} = req.body;

        const query = `INSERT INTO products (id, name, price, stock) VALUES ($1, $2, $3, $4) RETURNING *`;
        const result = await db.query(query, [id, name, price, stock]);
        const newProduct = result.rows[0];
        //add to cache
        const cacheKey =`product:${id}`;
        await redisClient.setEx(cacheKey,3600,JSON.stringify(newProduct));

        return res.status(201).json({
            success:true,
            message:`Product with id ${id} created successfully`,
        });

    }
    catch(err){
          if (err.code === '23505') {
            // A 409 Conflict is the correct HTTP status code for a duplicate.
            return res.status(409).json({
                success: false,
                message: `Product with id ${req.body.id} already exists.`
            });
        }
        
        logger.error('Error creating product:', err);
       return  res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}


export const updateProduct = async(req,res)=>{
    logger.info("Updating the product details");
    try{
        //We need to include the product id in the request params.
        const {id} = req.params;
    
      
        // First, get the existing product to merge data
        const existingResult = await db.query('SELECT * FROM products WHERE id = $1', [id]);
        if (existingResult.rows.length === 0) {
            return res.status(404).json({ message: `Product with id ${id} not found` });
        }
        const existingProduct = existingResult.rows[0];
        const updatedProduct = { ...existingProduct, ...req.body };
        
        // NEW: Query the database
        const sql = 'UPDATE products SET name = $1, price = $2, stock = $3 WHERE id = $4 RETURNING *';
        const result = await db.query(sql, [updatedProduct.name, updatedProduct.price, updatedProduct.stock, id]);
        
        //Update the cache
        const cacheKey =`product:${id}`;
        await redisClient.del(cacheKey); //Delete the old cache
        console.log(`INVALIDATED CACHE for ${cacheKey}`);
       return res.status(200).json({
            success:true,
            message:`Product with id ${id} updated successfully`
        });
    }
    catch(err){
        logger.error('Error updating product:', err);
     return   res.status(500).json({ success: false, message: 'Internal Server Error in updateproduct' });
    }
}

export const deleteProduct = async(req,res)=>{
    logger.info("Deleting a product");
    try{

        const {id} = req.params;
       
        const sql = 'DELETE FROM products WHERE id = $1';
        const result = await db.query(sql, [id]);

         if (result.rowCount === 0) {
            return res.status(404).json({ message: `Product with id ${id} not found` });
        }
        
        //Delete from cache
        const cacheKey =`product:${id}`;
        await redisClient.del(cacheKey);
        console.log(`INVALIDATED CACHE for ${cacheKey}`);
       return res.status(200).json({
            success:true,
            message:`Product with id ${id} deleted successfully`
        });

    }
    catch(err){
        logger.error('Error deleting product:', err);
      return  res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}