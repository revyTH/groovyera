/**
 * ---------------------------------------------------------------------------------------------------------------------
 * categoryController.js
 * ---------------------------------------------------------------------------------------------------------------------
 */

const Category = require("../models/Category");
const router = require("express").Router()

router.get("/", async (req, res) => {
    const categories = await Category.find({}, null, {sort: {name: 1}});
    res.json(categories);
});

module.exports = router;
