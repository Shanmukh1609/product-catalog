import redisClient from '../config/redis-connection.js';
import logger from '../utils/logger.js';

const db = {
    products :{
    '101': { name: 'Wireless Mouse', price: 29.99, stock: 150 },
    '102': { name: 'Mechanical Keyboard', price: 89.99, stock: 75 },
    '103': { name: '4K Monitor', price: 349.99, stock: 50 },
    '104': { name: 'Webcam with Ring Light', price: 59.99, stock: 100 },
  },
    }


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
        const product = db.products[id];
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
        if(db.products[id]){
            return res.status(400).json({
                success:false,
                message:`Product with id ${id} already exists`
            });
        }

        db.products[id] = {name,price,stock};

        //add to cache
        const cacheKey =`product:${id}`;
        await redisClient.setEx(cacheKey,3600,JSON.stringify(db.products[id]));

        return res.status(201).json({
            success:true,
            message:`Product with id ${id} created successfully`,
        });

    }
    catch(err){
        logger.error('Error creating product:', err);
       return  res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}


export const updateProduct = async(req,res)=>{
    logger.info("Updating the product details");
    try{
        //We need to include the product id in the request params.
        const {id} = req.params;
        if(!db.products[id]){
            return res.status(404).json({
                success:false,
                message:`Product with id ${id} not found`
            });
        }

        const {name,price,stock} = req.body;
       const updatedProduct = { ...existingProduct, ...req.body };
        db.products[id] = updatedProduct;
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
        if(!db.products[id]){
            return res.status(404).json({
                success:false,
                message:`Product with id ${id} not found`
            });
        }

        delete db.products[id];
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