/**
 * Inventory Management Tool - API Test Script
 * This Node.js script is provided to test your Inventory Management Tool as part of the Fi Internship Assignment.
 * 
 * Requirements:
 * Node.js 14+
 * axios library
 * 
 * Setup Instructions:
 * 1. Install Node.js dependencies:
 *    Make sure you have axios installed. If not, run:
 *    npm install axios
 * 
 * 2. Set your server URL:
 *    Open test_api.js in a text editor and update the BASE_URL variable to point to your running server instance
 * 
 * 3. Run the script:
 *    From your terminal, run:
 *    node test_api.js
 */
const axios = require('axios');

const BASE_URL = "http://localhost:8080"; // Change this to your API base URL

function printResult(testName, passed, expected = null, got = null, requestData = null, responseBody = null) {
  /**
   * Prints test result.
   * If passed, prints only success.
   * If failed, prints request, expected vs got, and response body.
   */
  if (passed) {
    console.log(`${testName}: PASSED`);
  } else {
    console.log(`${testName}: FAILED`);
    if (requestData) {
      console.log(` Request: ${JSON.stringify(requestData)}`);
    }
    if (expected !== null && got !== null) {
      console.log(` Expected: ${expected}, Got: ${got}`);
    }
    if (responseBody) {
      console.log(` Response Body: ${responseBody}`);
    }
  }
}

async function testRegisterUser() {
  /**
   * Change payload keys/values as needed for your registration API.
   * Expected status codes are 201 (created) or 409 (conflict if user exists).
   */
  const payload = { "username": "puja", "password": "mypassword" }; // Change username/password if needed
  try {
    const res = await axios.post(`${BASE_URL}/register`, payload);
    const passed = res.status === 201 || res.status === 409;
    printResult("User Registration", passed, "201 or 409", res.status, payload, res.data);
  } catch (error) {
    const status = error.response ? error.response.status : 'Network Error';
    const passed = status === 201 || status === 409;
    printResult("User Registration", passed, "201 or 409", status, payload, error.response ? error.response.data : error.message);
  }
}

async function testLogin() {
  /**
   * Change payload for different username/password.
   * On success, expects 200 status and an 'access_token' in JSON response.
   * Returns the token for authenticated requests.
   */
  const payload = { "username": "puja", "password": "mypassword" }; // Change to test different login credentials
  try {
    const res = await axios.post(`${BASE_URL}/login`, payload);
    let token = null;
    let passed = false;
    
    if (res.status === 200) {
      try {
        token = res.data.access_token;
        passed = token !== null && token !== undefined;
      } catch (e) {
        passed = false;
      }
    }
    
    printResult("Login Test", passed, { "username": payload.username, "password": payload.password }, res.data, payload, res.data);
    return token;
  } catch (error) {
    const status = error.response ? error.response.status : 'Network Error';
    printResult("Login Test", false, { "username": payload.username, "password": payload.password }, error.response ? error.response.data : error.message, payload, error.response ? error.response.data : error.message);
    return null;
  }
}

async function testAddProduct(token) {
  /**
   * Change payload fields as per your product API requirements.
   * Must include Authorization header with Bearer token.
   * Returns product_id on success to be used in other tests.
   */
  const payload = {
    "name": "Phone", // Change product name
    "type": "Electronics", // Change type/category
    "sku": "PHN-001", // Change SKU if needed
    "image_url": "https://example.com/phone.jpg", // Change image URL
    "description": "Latest Phone", // Change description
    "quantity": 5, // Initial quantity
    "price": 999.99 // Price
  };
  
  try {
    const res = await axios.post(`${BASE_URL}/products`, payload, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    const passed = res.status === 201;
    if (passed) {
      console.log("Add Product: PASSED");
      try {
        return res.data.product_id;
      } catch (e) {
        return null;
      }
    } else {
      printResult("Add Product", false, 201, res.status, payload, res.data);
      return null;
    }
  } catch (error) {
    const status = error.response ? error.response.status : 'Network Error';
    printResult("Add Product", false, 201, status, payload, error.response ? error.response.data : error.message);
    return null;
  }
}

async function testUpdateQuantity(token, productId, newQuantity) {
  /**
   * Tests update quantity API for a specific product.
   * Change endpoint if your API uses a different URL structure.
   * Pass the product ID and the new quantity.
   */
  const payload = { "quantity": newQuantity }; // Change field name if your API expects different key
  
  try {
    const res = await axios.put(
      `${BASE_URL}/products/${productId}/quantity`,
      payload,
      {
        headers: { "Authorization": `Bearer ${token}` }
      }
    );
    
    const passed = res.status === 200;
    if (passed) {
      if (res.data) {
        try {
          const updatedInfo = res.data;
          const updatedQty = updatedInfo.quantity || updatedInfo.product?.quantity || "unknown"; // Change key if API uses a different key for quantity
          console.log(`Update Quantity: PASSED, Updated quantity: ${updatedQty}`);
        } catch (e) {
          console.log("Update Quantity: PASSED, but response body is not valid JSON");
        }
      } else {
        console.log("Update Quantity: PASSED, but response body is empty");
      }
    } else {
      printResult("Update Quantity", false, 200, res.status, payload, res.data);
    }
  } catch (error) {
    const status = error.response ? error.response.status : 'Network Error';
    printResult("Update Quantity", false, 200, status, payload, error.response ? error.response.data : error.message);
  }
}

async function testGetProducts(token, expectedQuantity) {
  /**
   * Tests fetching the list of products.
   * Change endpoint if needed.
   * Checks if there is a product named 'Phone' with expected quantity.
   * Change 'name' and 'quantity' keys if your API structure differs.
   */
  try {
    const res = await axios.get(`${BASE_URL}/products`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    if (res.status !== 200) {
      printResult("Get Products", false, 200, res.status, null, res.data);
      return;
    }
    
    let products;
    try {
      products = res.data.products || res.data; // Handle both paginated and non-paginated responses
    } catch (e) {
      printResult("Get Products", false, "valid JSON list", "Invalid JSON", null, res.data);
      return;
    }
    
    const phoneProducts = products.filter(p => p.name === "Phone");
    if (phoneProducts.length === 0) {
      console.log("Get Products: FAILED");
      console.log(" Could not find product named 'Phone'");
      console.log(` Response Body: ${JSON.stringify(products)}`);
      return;
    }
    
    const phoneQuantity = phoneProducts[0].quantity;
    if (phoneQuantity === expectedQuantity) {
      console.log(`Get Products: PASSED (Quantity = ${phoneQuantity})`);
    } else {
      console.log("Get Products: FAILED");
      console.log(` Expected Quantity: ${expectedQuantity}, Got: ${phoneQuantity}`);
      console.log(` Response Body: ${JSON.stringify(products)}`);
    }
  } catch (error) {
    const status = error.response ? error.response.status : 'Network Error';
    printResult("Get Products", false, 200, status, null, error.response ? error.response.data : error.message);
  }
}

async function runAllTests() {
  /**
   * Runs all tests in sequence.
   * If any test fails, subsequent tests are skipped.
   */
  console.log("🚀 Starting Inventory Management API Tests...\n");
  
  await testRegisterUser();
  const token = await testLogin();
  if (!token) {
    console.log("Login failed. Skipping further tests.");
    return;
  }
  
  const productId = await testAddProduct(token);
  if (!productId) {
    console.log("Product creation failed. Skipping further tests.");
    return;
  }
  
  const newQuantity = 15; // Change this to test different updated quantity
  await testUpdateQuantity(token, productId, newQuantity);
  await testGetProducts(token, expectedQuantity = newQuantity);
  
  console.log("\n✅ All tests completed!");
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testRegisterUser,
  testLogin,
  testAddProduct,
  testUpdateQuantity,
  testGetProducts,
  runAllTests
}; 