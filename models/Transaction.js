const Connection = require("./../dbconfig");
const Pagination = require("./Pagination");

const Transactions = {};

Transactions.add = async function (data) {
  let addPrd = [];
  let slugEmptyPrd = false;
  let emptyPrd = [];
  for (let prd of data.products) {
    const queryFindPrd = {
      text: "SELECT * FROM products WHERE sku = $1",
      values: [prd.sku],
    };

    let findPrd = await Connection.query(queryFindPrd);

    if (findPrd.rows[0].stock < 1) {
      slugEmptyPrd = true;
      emptyPrd.push({
        sku: findPrd.rows[0].sku,
        name: findPrd.rows[0].name,
        stock: findPrd.rows[0].stock,
      });
    }

    let objTrans = {
      sku: prd.sku,
      qty: prd.qty,
      amount: prd.qty * findPrd.rows[0].price,
    };

    addPrd.push(objTrans);

    // console.log(addPrd);
  }

  console.log(emptyPrd);
  if (slugEmptyPrd)
    return {
      code: 200,
      status: "failed",
      message:
        "Transactions cannot be processed, there are products that are out of stock.",
      emptyProduct: emptyPrd,
    };

  let totalPrice = addPrd.reduce((n, { amount }) => n + amount, 0);

  const query = {
    text: "INSERT INTO transactions (buyer_name, buyer_phone, buyer_address, total_price, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    values: [
      data.buyer_name,
      data.buyer_phone,
      data.buyer_address,
      totalPrice,
      "waiting",
    ],
  };

  try {
    const addTrans = await Connection.query(query);
    // console.log(addTrans);

    if (addTrans.rowCount > 0) {
      for (let prd of addPrd) {
        let queryDetTrans = {
          text: "INSERT INTO detail_transactions (transaction_id, sku, qty, amount) VALUES ($1, $2, $3, $4) RETURNING *",
          values: [addTrans.rows[0].id, prd.sku, prd.qty, prd.amount],
        };
        // console.log(queryDetTrans.values);

        let queryStockUpdate = {
          text: "UPDATE products SET stock = (stock - $2) WHERE sku = $1",
          values: [prd.sku, prd.qty],
        };

        await Connection.query(queryStockUpdate);

        await Connection.query(queryDetTrans);
        // console.log(addDetTrans.rows[0]);
      }
      const result = {
        code: 201,
        status: "success",
        message: "Transaction has been succesfully added.",
      };

      return result;
    }
  } catch (err) {
    return err.stack;
  }
};

Transactions.list = async function (pagination) {
  const page = parseInt(pagination.page);
  const limit = parseInt(pagination.limit);
  const query = {
    text: "SELECT * FROM detail_transactions",
  };

  try {
    const transList = await Connection.query(query);
    if (!page && !limit) {
      return transList.rows;
    }

    if (!page || !limit) {
      return "page and limit is required.";
    } else {
      const data = {
        page: page,
        limit: limit,
        results: transList.rows,
      };

      return Pagination(data);
    }
  } catch (err) {
    return err.stack;
  }
};

Transactions.get = async function (id) {
  const queryTrans = {
    text: "SELECT * FROM transactions WHERE id = $1",
    values: [id],
  };

  let resTrans = await Connection.query(queryTrans);

  if (resTrans.rowCount > 0) {
    const queryTransDet = {
      text: "SELECT sku, qty, CAST (amount AS INTEGER) FROM detail_transactions WHERE transaction_id = $1",
      values: [resTrans.rows[0].id],
    };

    let resTransDet = await Connection.query(queryTransDet);

    let totalPrice = resTransDet.rows.reduce(
      (n, { amount }) => n + parseInt(amount),
      0
    );

    return {
      transaction_id: resTrans.rows[0].id,
      buyer_name: resTrans.rows[0].buyer_name,
      buyer_phone: resTrans.rows[0].buyer_phone,
      buyer_address: resTrans.rows[0].buyer_address,
      products: resTransDet.rows,
      total_price: totalPrice,
    };
  } else {
    return {
      code: 200,
      message: "Transaction not found.",
    };
  }
};

Transactions.delete = async function (id) {
  const query = {
    text: "DELETE FROM transactions WHERE id = $1",
    values: [id],
  };

  const deleteTrans = await Connection.query(query);

  if (deleteTrans.rowCount > 0) {
    return {
      code: 200,
      message: "Transaction with id: " + id + " has been deleted",
    };
  } else {
    return {
      code: 403,
      message: "Transaction not found.",
    };
  }
};

Transactions.acceptTransaction = async function (id) {
  const queryUpdate = {
    text: "UPDATE transactions SET status = 'accept' WHERE id = $1",
    values: [id],
  };

  let acceptTrans = await Connection.query(queryUpdate);

  if (acceptTrans.rowCount > 0) {
    return {
      code: 200,
      message: "Transaction accepted.",
    };
  } else {
    return {
      code: 200,
      message: "Transaction not found.",
    };
  }
};

Transactions.cancelTrans = async function (id) {
  const queryCanceled = {
    text: "UPDATE transactions SET status = 'canceled' WHERE id = $1",
    values: [id],
  };

  let cancelTrans = await Connection.query(queryCanceled);

  if (cancelTrans.rowCount > 0) {
    const queryTransDet = {
      text: "SELECT * FROM detail_transactions WHERE transaction_id = $1",
      values: [id],
    };

    let transDet = await Connection.query(queryTransDet);
    console.log(transDet);

    if (transDet.rowCount > 0) {
      for (let det of transDet.rows) {
        const qStockUpdate = {
          text: "UPDATE products SET stock = (stock + $2) WHERE sku = $1",
          values: [det.sku, det.qty],
        };

        await Connection.query(qStockUpdate);
      }
    }

    return {
      code: 200,
      message: "Transaction has been canceled.",
    };
  } else {
    return {
      code: 200,
      message: "Transaction not found.",
    };
  }
};

module.exports = Transactions;
