// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors'); 

// Create an instance of the express server
const app = express();
const port = process.argv[2] || 3000; // Utilisez le port spécifié en argument ou 3000 par défaut


// Middleware to parse JSON in the request body
app.use(cors())
app.use(bodyParser.json());




let database = JSON.parse(fs.readFileSync('database.json', 'utf-8'));  

app.get('/products', (req, res) => {
    const { category, inStock } = req.query;
  
    let filteredProducts = database.products;
  
    if (category) {
      filteredProducts = filteredProducts.filter(product => product.category === category);
    }
  
    if (inStock) {
      const isStockAvailable = inStock.toLowerCase() === 'true';
      filteredProducts = filteredProducts.filter(product => product.inStock === isStockAvailable);
    }
  
    res.json(filteredProducts);
  });

  app.get('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
  
    if (isNaN(productId)) {
      res.status(400).json({ error: 'Invalid product ID' });
      return;
    }
  
    const product = database.products.find(p => p.id === productId);
  
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
  
    res.json(product);
});


// POST create a new product
app.post('/products', (req, res) => {
    const newProduct = req.body;
    const productId = database.products.length + 1;
    newProduct.id = productId;
  
    database.products.push(newProduct);
    saveDatabase(); // Sauvegarder la base de données dans le fichier JSON
  
    res.status(201).json(newProduct);
  });
  

// PUT update details of an existing product by ID
app.put('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const updatedProduct = req.body;
  
    if (isNaN(productId)) {
      res.status(400).json({ error: 'Invalid product ID' });
      return;
    }
  
    let index = products.findIndex(p => p.id === productId);
  
    if (index === -1) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
  
    if (!updatedProduct || Object.keys(updatedProduct).length === 0) {
      res.status(400).json({ error: 'Invalid product information for update' });
      return;
    }
  
    products[index] = { ...products[index], ...updatedProduct };
  
    res.json(products[index]);
  });
  

app.delete('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
  
    if (isNaN(productId)) {
      res.status(400).json({ error: 'Invalid product ID' });
      return;
    }
  
    products = products.filter(product => product.id !== productId);
  
    res.json({ message: 'Product deleted successfully' });
  });

  app.post('/orders', (req, res) => {
    const { products: orderedProducts, userInfo } = req.body;

    // Validate that products are provided
    if (!orderedProducts || !Array.isArray(orderedProducts) || orderedProducts.length === 0) {
        res.status(400).json({ error: 'Invalid order. Products must be provided.' });
        return;
    }

    // Validate that products exist in the system
    const invalidProducts = orderedProducts.filter(item => !database.products.some(product => product.id === item.productId));
    if (invalidProducts.length > 0) {
        res.status(400).json({ error: 'Invalid products in the order.' });
        return;
    }

    // Calculate total price
    const totalPrice = orderedProducts.reduce((total, item) => {
        const product = database.products.find(p => p.id === item.productId);
        return total + product.price * item.quantity;
    }, 0);

    // Create a new order
    const orderId = database.orders.length + 1;
    const newOrder = {
        orderId,
        products: orderedProducts.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
        })),
        totalPrice,
        status: 'Pending', // You can set the initial status as needed
        userInfo,
    };

    database.orders.push(newOrder);
    saveDatabase()

    res.status(201).json(newOrder);
});

  
  // GET orders for a specific user
  app.get('/orders/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const userOrders = database.orders.filter(order => order.userInfo && order.userInfo.userId === userId);
  
    res.json(userOrders);
});


app.post('/cart/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const { productId, quantity } = req.body;
  
    // Validate that product ID and quantity are provided
    if (!productId || !quantity || isNaN(quantity) || quantity <= 0) {
      res.status(400).json({ error: 'Invalid product information. Please provide a valid product ID and quantity.' });
      return;
    }
  
    // Validate that the product exists in the system
    const selectedProduct = database.products.find(product => product.id === productId);
    if (!selectedProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
  
    // Update the user's shopping cart or create a new one if not exists
    let userCart = database.userCarts.find(cart => cart.userId === userId);
  
    if (!userCart) {
      userCart = { userId, items: [] };
      database.userCarts.push(userCart);
    }
  
    // Check if the product is already in the cart, update quantity, or add a new item
    const existingItem = userCart.items.find(item => item.productId === productId);
  
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      userCart.items.push({ productId, quantity });
    }
  
    // Calculate total price for the cart
    const totalPrice = userCart.items.reduce((total, item) => {
      const product = database.products.find(p => p.id === item.productId);
      return total + product.price * item.quantity;
    }, 0);
  
    userCart.totalPrice = totalPrice;
    saveDatabase()
  
    res.json({ cart: userCart });
});

  
  // GET retrieve the current state of a user's shopping cart
  app.get('/cart/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const userCart = database.userCarts.find(cart => cart.userId === userId);
  
    if (!userCart) {
      res.json({ cart: { userId, items: [], totalPrice: 0 } });
      return;
    }
  
    res.json({ cart: userCart });
});
  
app.delete('/cart/:userId/item/:productId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const productId = parseInt(req.params.productId);
  
    const userCart = database.userCarts.find(cart => cart.userId === userId);
  
    if (!userCart) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }
  
    // Remove the specified product from the cart
    userCart.items = userCart.items.filter(item => item.productId !== productId);
  
    // Recalculate total price for the cart
    const totalPrice = userCart.items.reduce((total, item) => {
      const product = database.products.find(p => p.id === item.productId);
      return total + product.price * item.quantity;
    }, 0);
  
    userCart.totalPrice = totalPrice;
  
    res.json({ cart: userCart });
});

  
  function saveDatabase() {
    fs.writeFileSync('database.json', JSON.stringify(database, null, 2), 'utf-8');
  }

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`E-commerce API Server is running on http://localhost:${port}`);
  });
