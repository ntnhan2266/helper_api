const mongoose = require("mongoose");

const userCategorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    count: {
      type: Number,
      required: true,
      default: 0
    },
  },
  { timestamps: true }
);

const UserCategory = mongoose.model("UserCategory", userCategorySchema);

module.exports = UserCategory;
