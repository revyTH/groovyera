const { Category, validate } = require("../models/Category");
const router = require("express").Router();
const Status = require("http-status-codes");

router.get("/", async (req, res) => {
    const categories = await Category.find({}, null, {sort: {name: 1}});
    res.json(categories);
});

router.post("/", async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(Status.BAD_REQUEST).send(error.details[0].message);
    let category = new Category({ name: req.body.name });
    category = await category.save();
    res.send(category);
})

// router.delete("/", async (req, res) => {
//     await Category.remove({});
//     res.send();
// })

module.exports = router;
