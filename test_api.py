import requests

BASE_URL = "http://localhost:8000"

def print_result(name, passed, expected=None, got=None, request_data=None, response_body=None):
    if passed:
        print(f"{name}: ✅ PASSED")
    else:
        print(f"{name}: ❌ FAILED")
        if request_data:
            print(f"  Request: {request_data}")
        if expected is not None and got is not None:
            print(f"  Expected: {expected}, Got: {got}")
        if response_body:
            print(f"  Response Body: {response_body}")

def test_register_user():
    payload = {"username": "puja", "password": "mypassword"}
    res = requests.post(f"{BASE_URL}/register", json=payload)
    passed = res.status_code in [201, 409]
    print_result("User Registration", passed, "201 or 409", res.status_code, payload, res.text)

def test_login():
    payload = {"username": "puja", "password": "mypassword"}
    res = requests.post(f"{BASE_URL}/login", json=payload)
    token = None
    if res.status_code == 200:
        try:
            token = res.json().get("access_token")
            return token
        except:
            return None
    return None

def test_add_product(token):
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "name": "Phone",
        "type": "Electronics",
        "sku": "PHN-001",
        "image_url": "http://example.com/image.png",
        "description": "Smartphone",
        "quantity": 10,
        "price": 299.99
    }
    res = requests.post(f"{BASE_URL}/products", json=payload, headers=headers)
    if res.status_code == 201:
        return res.json().get("id")
    return None

def test_update_quantity(token, product_id, new_qty):
    headers = {"Authorization": f"Bearer {token}"}
    payload = {"quantity": new_qty}
    res = requests.put(f"{BASE_URL}/products/{product_id}/quantity", json=payload, headers=headers)
    print_result("Update Quantity", res.status_code == 200, 200, res.status_code, payload, res.text)

def test_get_products(token):
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get(f"{BASE_URL}/products", headers=headers)
    print_result("Get Products", res.status_code == 200, 200, res.status_code, None, res.text)

def run_all():
    test_register_user()
    token = test_login()
    if not token:
        print("Login failed. Exiting tests.")
        return
    pid = test_add_product(token)
    if pid:
        test_update_quantity(token, pid, 20)
        test_get_products(token)
    else:
        print("Add product failed. Skipping further tests.")

if __name__ == "__main__":
    run_all()
