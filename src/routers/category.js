const express = require("express");
const router = new express.Router();
const mongoose = require("mongoose");
const _ = require("lodash");

const Categories = require('../models/category');

router.get("/categories", async (req, res) => {
  try {
    const pageIndex = req.query.pageIndex * 1;
    const pageSize = req.query.pageSize * 1;
    const categories = await Categories.find()
      .skip(pageIndex * pageSize)
      .limit(pageSize);
    const total = await Categories.countDocuments({});
    res.send({categories, total});
  } catch (e) {
    console.log(e);
    res.send({
      errorCode: 1,
      errorMessage: "Can not create review"
    });
  }
});

module.exports = router;
