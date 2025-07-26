const axios = require('axios');

const BASE_URL = "http://localhost:8080";

async function quickTest() {
  console.log("🚀 Quick API Test - Inventory Management System\n");
  
  try {
    // Test 1: Health Check
    console.log("1. Testing Health Check...");
    const health = await axios.get(`${BASE_URL}/health`);
    console.log("✅ Health Check: PASSED");
    console.log(`   Status: ${health.status}`);
    console.log(`   Message: ${health.data.message}\n`);
    
    // Test 2: Login
    console.log("2. Testing Login...");
    const login = await axios.post(`${BASE_URL}/login`, {
      username: "puja",
      password: "mypassword"
    });
    console.log("✅ Login: PASSED");
    console.log(`   Status: ${login.status}`);
    console.log(`   Token: ${login.data.access_token.substring(0, 50)}...\n`);
    
    const token = login.data.access_token;
    
    // Test 3: Get Products
    console.log("3. Testing Get Products...");
    const products = await axios.get(`${BASE_URL}/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("✅ Get Products: PASSED");
    console.log(`   Status: ${products.status}`);
    console.log(`   Products Count: ${products.data.products.length}\n`);
    
    // Test 4: Add Product
    console.log("4. Testing Add Product...");
    const newProduct = await axios.post(`${BASE_URL}/products`, {
      name: "Quick Test Product",
      type: "Test",
      sku: `TEST-${Date.now()}`,
      image_url: "https://example.com/test.jpg",
      description: "A quick test product",
      quantity: 5,
      price: 49.99
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("✅ Add Product: PASSED");
    console.log(`   Status: ${newProduct.status}`);
    console.log(`   Product ID: ${newProduct.data.product_id}\n`);
    
    // Test 5: Update Quantity
    console.log("5. Testing Update Quantity...");
    const updateQuantity = await axios.put(`${BASE_URL}/products/${newProduct.data.product_id}/quantity`, {
      quantity: 15
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("✅ Update Quantity: PASSED");
    console.log(`   Status: ${updateQuantity.status}`);
    console.log(`   New Quantity: ${updateQuantity.data.product.quantity}\n`);
    
    console.log("🎉 ALL TESTS PASSED! The Inventory Management API is working perfectly!");
    console.log("\n📚 API Documentation: http://localhost:8080/api-docs");
    console.log("🏥 Health Check: http://localhost:8080/health");
    
  } catch (error) {
    console.error("❌ Test Failed:");
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Error: ${error.response.data.error}`);
      console.error(`   Message: ${error.response.data.message}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }
}

quickTest(); 