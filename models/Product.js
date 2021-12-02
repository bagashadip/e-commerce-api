const Connection = require("./../dbconfig");
const Pagination = require("./Pagination");

const Products = {};

Products.list = async function (pagination) {
  const page = parseInt(pagination.page);
  const limit = parseInt(pagination.limit);
  const query = {
    text: "SELECT * FROM products ORDER by products.sku ASC",
  };

  try {
    const prodList = await Connection.query(query);
    if (!page && !limit) {
      return prodList.rows;
    }

    if (!page || !limit) {
      return "page and limit is required.";
    } else {
      const data = {
        page: page,
        limit: limit,
        results: prodList.rows,
      };

      return Pagination(data);
    }
  } catch (err) {
    return err.stack;
  }
};

Products.add = async function (data) {
  const querySelect = {
    text: "SELECT * FROM products WHERE sku = $1",
    values: [data.sku],
  };

  const query = {
    text: "INSERT INTO products(sku, name, image, price, description, stock) VALUES ($1, $2, $3, $4, $5, $6)",
    values: [
      data.sku,
      data.name,
      data.image,
      data.price,
      data.description,
      data.stock,
    ],
  };

  try {
    const findById = await Connection.query(querySelect);

    if (findById.rows.length > 0) {
      return {
        code: 200,
        status: "duplicate",
        message: "Data already exist",
      };
    }

    await Connection.query(query);

    return {
      code: 201,
      status: "success",
      message: "Product has been saved successfully",
      data: data,
    };
  } catch (err) {
    console.log(err.stack);
    return err.stack;
  }
};

Products.update = async function (sku, data) {
  try {
    const queryFind = {
      text: "SELECT name, image, price, description, stock FROM products WHERE sku = $1",
      values: [sku],
    };

    let prdBySku = await Connection.query(queryFind);

    if (prdBySku.rows.length == 0) {
      return { code: 200, message: "Product not found" };
    }

    let strQryUpdt = "";
    let values = [sku];
    let num = 1;

    if (data.name) {
      num++;
      strQryUpdt += "name = $" + num + ",";
      values.push(data.name);
    }
    if (data.image) {
      num++;
      strQryUpdt += "image = $" + num + ",";
      values.push(data.image);
    }
    if (data.price) {
      num++;
      strQryUpdt += "price = $" + num + ",";
      values.push(data.price);
    }
    if (data.description) {
      num++;
      strQryUpdt += "description = $" + num + ",";
      values.push(data.description);
    }
    if (data.stock) {
      num++;
      strQryUpdt += "stock = $" + num + ",";
      values.push(data.stock);
    }

    const queryUpdate = {
      text:
        "UPDATE products SET " +
        strQryUpdt +
        " updatedat = now() WHERE sku = $1",
      values: values,
    };

    console.log(queryUpdate);

    await Connection.query(queryUpdate);

    return {
      code: 200,
      status: "updated",
      message: "Product has been updated.",
    };
  } catch (err) {
    return err.stack;
  }
};

Products.getBySku = async function (sku) {
  const query = {
    text: "SELECT * FROM products WHERE sku = $1",
    values: [sku],
  };

  try {
    const getData = await Connection.query(query);

    if (getData.rows.length > 0) {
      return getData.rows[0];
    } else {
      return { code: 200, message: "Product not found" };
    }
  } catch (err) {
    return err.stack;
  }
};

Products.deleteProduct = async function (sku) {
  const query = {
    text: "DELETE FROM products WHERE sku = $1",
    values: [sku],
  };

  try {
    const deleteData = await Connection.query(query);
    if (deleteData.rowCount > 0) {
      return {
        code: 200,
        message: "Product with sku: " + sku + " has been deleted.",
      };
    } else {
      return {
        code: 403,
        message: "Product not found.",
      };
    }
  } catch (err) {
    return err.stack;
  }
};

module.exports = Products;
