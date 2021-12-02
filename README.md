# E-Commerce API

### Run Project

- _`npm install`_
- _`nodemon app.js`_

### Database Config

Ubah credential database di _`dbconfig/index.js`_

```
const { Client } = require("pg");

const connection = new Client({
  host: "localhost",
  port: 5432,
  user: "jubelio",
  password: "kamujelek",
  database: "ecommerce_api",
});

connection
  .connect()
  .then(() => console.log("database connected..."))
  .catch((err) => console.log("connection error...", err.stack));

module.exports = connection;

```

# List API

- ## Generate Product from Elevenia

```
url: http://localhost:3000/generate-product
method: GET
```

`Response:`

```
{
    "newProduct": 0,
    "duplicateProduct": 24,
    "message": "New product added: 0, Duplicate product: 24"
}
```

- ## List Product with Pagination

```
url: http://localhost:3000/product-list
method: GET

// with pagination
url: localhost:3000/product-list?page=2&limit=2
method: GET
```

`response:`

```
{
    "next": {
        "page": 3,
        "limit": 3
    },
    "previous": {
        "page": 1,
        "limit": 3
    },
    "data": [
        {
            "sku": "25920736",
            "name": "test el6",
            "image": "https://picsum.photos/200",
            "price": "1000000",
            "description": "-",
            "stock": "0",
            "createdat": "2021-12-01T13:51:11.999Z",
            "updatedat": "2021-12-01T13:51:11.999Z"
        },
        {
            "sku": "25922874",
            "name": "test el5",
            "image": "https://picsum.photos/200",
            "price": "1000000",
            "description": "-",
            "stock": "0",
            "createdat": "2021-12-01T13:50:17.379Z",
            "updatedat": "2021-12-01T13:50:17.379Z"
        },
    ]
}
```

- ## Detail Product by SKU

```
url: http://localhost:3000/product/25922874
method: GET
```

`response:`

```
{
    "sku": "25922874",
    "name": "test el5",
    "image": "https://picsum.photos/200",
    "price": "1000000",
    "description": "-",
    "stock": "0",
    "createdat": "2021-12-01T13:50:17.379Z",
    "updatedat": "2021-12-01T13:50:17.379Z"
}
```

- ## Add Product

```
url: http://localhost:3000/add-product
method: POST
body: raw/json
params:

{
    "sku": "25922884",
    "name": "Helm",
    "image": "https://picsum.photos/200",
    "price": 130000,
    "description": "-",
    "stock": 15
}
```

`response:`

```
{
    "code": 201,
    "status": "success",
    "message": "Product has been saved successfully",
    "data": {
        "sku": "25922884",
        "name": "Helm",
        "image": "https://picsum.photos/200",
        "price": 130000,
        "description": "-",
        "stock": 15
    }
}
```

- ## Update Product

```
url: http://localhost:3000/update-product/25922884
method: PUT
body: raw/json
params:

{
    "name": "Helm 123",
    "stock": 24
}
```

`response:`

```
{
    "code": 200,
    "status": "updated",
    "message": "Product has been updated."
}
```

- ## Delete Product

```
url: http://localhost:3000/delete-product/25922884
method: DELETE
```

`response:`

```
{
    "code": 200,
    "message": "Product with sku: 25922884 has been deleted."
}
```

- ## List Transaction with pagination

```
url: http://localhost:3000/transaction-list
method: GET


// with pagination
url: http://localhost:3000/transaction-list?page=1&limit=3
method: GET
```

`response:`

```
{
    "next": {
        "page": 2,
        "limit": 2
    },
    "data": [
        {
            "id": 21,
            "transaction_id": 22,
            "sku": "26682731",
            "qty": 4,
            "amount": "396000"
        },
        {
            "id": 22,
            "transaction_id": 22,
            "sku": "28015301",
            "qty": 3,
            "amount": "3000000"
        }
    ]
}
```

- ## Transaction Detail

```
url: http://localhost:3000/transaction-detail/22
method: GET
```

`response:`

```
{
    "transaction_id": 22,
    "buyer_name": "Bagas",
    "buyer_phone": "02131232",
    "buyer_address": "Jl. Haji Radin No. 60",
    "products": [
        {
            "sku": "26682731",
            "qty": 4,
            "amount": 396000
        },
        {
            "sku": "28015301",
            "qty": 3,
            "amount": 3000000
        }
    ],
    "total_price": 3396000
}
```

- ## Add Transaction

```
url: http://localhost:3000/add-transaction
method: POST
body: raw/json
params:
{
    "buyer_name": "Andre",
    "buyer_phone": "0856123232",
    "buyer_address": "Jl. Haji Radin No. 60",
    "products": [
        {
            "sku": "26682731",
            "qty": 3
        },
        {
            "sku": "28015301",
            "qty": 1
        }
    ]
}
```

`response:`

```
{
    "code": 201,
    "status": "success",
    "message": "Transaction has been succesfully added."
}
```

- ## Delete Transaction

```
url: http://localhost:3000/delete-transaction/21
method: DELETE
```

`response:`

```
{
    "code": 200,
    "message": "Transaction with id: 21 has been deleted"
}
```

- ## Accept Transaction

```
url: http://localhost:3000/accept-transaction/24
method: GET
```

`response:`

```
{
    "code": 200,
    "message": "Transaction with id: 21 has been deleted"
}
```

- ## Cancel Transaction

```
url: http://localhost:3000/cancel-transaction/24
method: GET
```

`response:`

```
{
    "code": 200,
    "message": "Transaction has been canceled."
}
```
