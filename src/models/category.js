const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    icon: {
        type: String,
        default: null
    },
    name_vi: {
        type: String,
        required: true
    },
    name_en: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
