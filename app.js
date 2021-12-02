"use strict";

const Hapi = require("@hapi/hapi");
const axios = require("axios");
const { parseString } = require("xml2js");
const Products = require("./models/Product");
const Transactions = require("./models/Transaction");

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "localhost",
  });

  server.route([
    {
      method: "GET",
      path: "/",
      handler: (request, h) => {
        return "E-Commerce API Key";
      },
    },
    {
      method: "GET",
      path: "/product-list",
      handler: async (req, h) => {
        const pagination = {
          page: req.query.page,
          limit: req.query.limit,
        };
        const prodList = await Products.list(pagination);
        return h.response(prodList);
      },
    },
    {
      method: "POST",
      path: "/add-product",
      handler: async (request, h) => {
        const addProduct = await Products.add(request.payload);
        return h.response(addProduct).code(addProduct.code);
      },
    },
    {
      method: "PUT",
      path: "/update-product/{sku}",
      handler: async (request, h) => {
        const updateProduct = await Products.update(
          request.params.sku,
          request.payload
        );
        return h.response(updateProduct).code(updateProduct.code);
      },
    },
    {
      method: "GET",
      path: "/product/{sku}",
      handler: async (req, h) => {
        const getProduct = await Products.getBySku(req.params.sku);
        return h.response(getProduct);
      },
    },
    {
      method: "DELETE",
      path: "/delete-product/{sku}",
      handler: async (req, h) => {
        const deleteProduct = await Products.deleteProduct(req.params.sku);
        return h.response(deleteProduct).code(deleteProduct.code);
      },
    },
    {
      method: "GET",
      path: "/generate-product",
      handler: async (req, h) => {
        try {
          const result = await axios.get(
            "https://api.elevenia.co.id/rest/prodservices/product/listing",
            { headers: { openapikey: "721407f393e84a28593374cc2b347a98" } }
          );

          let products = {};
          let countDuplicate = 0;
          let countSuccess = 0;
          parseString(result.data, function (err, results) {
            products = results.Products.product;
          });

          for (let prd of products) {
            let prdData = {
              sku: prd.prdNo[0],
              name: prd.prdNm[0],
              image: "https://picsum.photos/200",
              price: parseInt(prd.selPrc[0]),
              description: "-",
              stock: parseInt(prd.stock[0]),
            };

            const addProduct = await Products.add(prdData);
            if (addProduct.status == "duplicate") countDuplicate++;
            if (addProduct.status == "success") countSuccess++;

            console.log(addProduct);
          }

          let resp = {
            newProduct: countSuccess,
            duplicateProduct: countDuplicate,
            message:
              "New product added: " +
              countSuccess +
              ", Duplicate product: " +
              countDuplicate,
          };

          return h.response(resp);
        } catch (err) {
          return err.stack;
        }
      },
    },
    {
      method: "POST",
      path: "/add-transaction",
      handler: async (request, h) => {
        const addTransaction = await Transactions.add(request.payload);
        return h.response(addTransaction).code(addTransaction.code);
      },
    },
    {
      method: "GET",
      path: "/transaction-list",
      handler: async (request, h) => {
        const pagination = {
          page: request.query.page,
          limit: request.query.limit,
        };
        const transList = await Transactions.list(pagination);
        return h.response(transList);
      },
    },
    {
      method: "GET",
      path: "/transaction-detail/{id}",
      handler: async (request, h) => {
        let getTransDet = await Transactions.get(request.params.id);
        return h.response(getTransDet);
      },
    },
    {
      method: "DELETE",
      path: "/delete-transaction/{id}",
      handler: async (request, h) => {
        let deleteTrans = await Transactions.delete(request.params.id);
        return h.response(deleteTrans).code(deleteTrans.code);
      },
    },
    {
      method: "GET",
      path: "/accept-transaction/{id}",
      handler: async (request, h) => {
        let updateStatusTrans = await Transactions.acceptTransaction(
          request.params.id
        );

        return h.response(updateStatusTrans).code(updateStatusTrans.code);
      },
    },
    {
      method: "GET",
      path: "/cancel-transaction/{id}",
      handler: async (request, h) => {
        let cancelTrans = await Transactions.cancelTrans(request.params.id);
        return h.response(cancelTrans).code(cancelTrans.code);
      },
    },
  ]);

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
