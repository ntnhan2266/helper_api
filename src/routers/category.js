const express = require("express");
const router = new express.Router();
const mongoose = require("mongoose");
const _ = require("lodash");

const adminMiddleware = require("../middleware/admin");
const Categories = require('../models/category');

router.get("/categories", adminMiddleware, async (req, res) => {
    try {
        const pageIndex = req.query.pageIndex * 1;
        const pageSize = req.query.pageSize * 1;
        const categories = await Categories.find()
            .sort({ order: 1 })
            .skip(pageIndex * pageSize)
            .limit(pageSize);
        const total = await Categories.countDocuments({});
        res.send({ categories, total });
    } catch (e) {
        console.log(e);
        res.send({
            errorCode: 1,
            errorMessage: "Can not load data"
        });
    }
});

router.get("/category", adminMiddleware, async (req, res) => {
    try {
        const id = req.query.id;
        const category = await Categories.findById(id);
        if (category) {
            return res.send({ category });
        } else {
            throw Error('Not found');
        }
    } catch (e) {
        console.log(e);
        res.send({
            errorCode: 1,
            errorMessage: "Can not load data"
        });
    }
});

router.put("/category/edit", adminMiddleware, async (req, res) => {
    try {
        const id = req.body._id;
        const category = await Categories.findById(id);
        if (category) {
            category.nameEn = req.body.nameEn;
            category.nameVi = req.body.nameVi;
            category.icon = req.body.icon;
            category.isActive = req.body.isActive;
            category.order = req.body.order;
            await category.save();
            return res.send({ category });
        } else {
            throw Error('Not found');
        }
    } catch (e) {
        console.log(e);
        res.send({
            errorCode: 1,
            errorMessage: "Can not edit data"
        });
    }
});

router.put("/category/active", adminMiddleware, async (req, res) => {
    try {
        const id = req.body._id;
        const category = await Categories.findById(id);
        if (category) {
            category.isActive = true;
            await category.save();
            return res.send({ category });
        } else {
            throw Error('Not found');
        }
    } catch (e) {
        console.log(e);
        res.send({
            errorCode: 1,
            errorMessage: "Can not edit data"
        });
    }
});

router.put("/category/deactive", adminMiddleware, async (req, res) => {
    try {
        const id = req.body._id;
        const category = await Categories.findById(id);
        if (category) {
            category.isActive = false;
            await category.save();
            return res.send({ category });
        } else {
            throw Error('Not found');
        }
    } catch (e) {
        console.log(e);
        res.send({
            errorCode: 1,
            errorMessage: "Can not edit data"
        });
    }
});

router.delete("/category/delete", adminMiddleware, async (req, res) => {
    try {
        const id = req.query.id;
        await Categories.deleteOne({ _id: id });
        return res.send({ completed: true });
    } catch (e) {
        console.log(e);
        res.send({
            errorCode: 1,
            errorMessage: "Can not delete data"
        });
    }
});

router.post("/category", adminMiddleware, async (req, res) => {
    try {
        const category = new Categories();
        category.icon = req.body.icon;
        category.nameVi = req.body.nameVi;
        category.nameEn = req.body.nameEn;
        category.order = req.body.order;
        category.isActive = req.body.isActive;
        await category.save();
        return res.send({ category });
    } catch (e) {
        console.log(e);
        res.send({
            errorCode: 1,
            errorMessage: "Can not create data"
        });
    }
});

module.exports = router;
