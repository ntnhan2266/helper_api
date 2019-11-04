const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    icon: {
        type: String,
        default: null
    },
    nameVi: {
        type: String,
        required: true
    },
    nameEn: {
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
