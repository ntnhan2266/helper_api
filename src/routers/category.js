const express = require("express");
const router = new express.Router();
const mongoose = require("mongoose");
const _ = require("lodash");

const adminMiddleware = require("../middleware/admin");
const authMiddleware = require("../middleware/auth");
const Categories = require('../models/category');
const UserCategory = require("../models/userCategory");
const Booking = require("../models/booking");
const Constants = require("../utils/constants");

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

router.get("/categories/available", authMiddleware, async (req, res) => {
    try {
        const categories = await Categories.find({ isActive: true })
            .sort({ order: 1 })
        res.send({ categories });
    } catch (e) {
        console.log(e);
        res.send({
            errorCode: 1,
            errorMessage: "Can not load data"
        });
    }
});

router.get("/categories/suggested", authMiddleware, async (req, res) => {
    const requestUser = req.user;
    try {
        var userCategories = await UserCategory.find({
            user: requestUser._id,
        })
            .populate("category")
            .sort({ count: -1 });
        if (userCategories.length == 0) {
            const bookings = await Booking.find({
                createdBy: requestUser._id,
                status: Constants.BOOKING_STATUS.COMPLETED,
            });
            var bookingObj = {};
            bookings.forEach(booking => {
                bookingObj[booking.category] = bookingObj[booking.category] ? (bookingObj[booking.category] + 1) : 1;
            });
            for (let [key, value] of Object.entries(bookingObj)) {
                var userCategory = new UserCategory();
                userCategory.user = requestUser._id;
                userCategory.category = key;
                userCategory.count = value;
                userCategory.save();
            }
            userCategories = await UserCategory.find({
                user: requestUser._id,
            })
                .populate("category")
                .sort({ count: -1 });
        }
        var categories = userCategories
            .filter(userCategory => userCategory.category.isActive)
            .map(userCategory => userCategory.category);
        if (categories.length < 4) {
            const moreCategories = await Categories.find({
                isActive: true,
                _id: { $nin: categories.map(c => c._id) }
            }).sort({ order: 1 }).limit(4);
            categories = [...categories, ...moreCategories];
        }
        console.log("categories");
        console.log(categories);
        res.send({ categories });
    } catch (e) {
        console.log(e);
        res.send({
            errorCode: 1,
            errorMessage: "Can not load data"
        });
    }
});

router.get("/categories/statistic", authMiddleware, async (req, res) => {
    const requestUser = req.user;
    try {
        var userCategories = await UserCategory.find({
            user: requestUser._id,
        })
            .populate("category")
            .sort({ count: -1 });
        if (userCategories.length == 0) {
            const bookings = await Booking.find({
                createdBy: requestUser._id,
                status: Constants.BOOKING_STATUS.COMPLETED,
            });
            var bookingObj = {};
            bookings.forEach(booking => {
                bookingObj[booking.category] = bookingObj[booking.category] ? (bookingObj[booking.category] + 1) : 1;
            });
            for (let [key, value] of Object.entries(bookingObj)) {
                var userCategory = new UserCategory();
                userCategory.user = requestUser._id;
                userCategory.category = key;
                userCategory.count = value;
                userCategory.save();
            }
            userCategories = await UserCategory.find({
                user: requestUser._id,
            })
                .populate("category")
                .sort({ count: -1 });
        }
        var statistic = userCategories
            .filter(userCategory => userCategory.category.isActive)
            .map(userCategory => {
                return {
                    category: userCategory.category,
                    count: userCategory.count,
                }
            });
        console.log("statistic");
        console.log(statistic);
        res.send({ statistic });
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
