const formidable = require("formidable");
const _ = require("lodash");
const { Product, validateProduct } = require("../models/product");
const fs = require("fs");
const { orderBy } = require("lodash");

//param
exports.getProductById = async(req, res, next, id) => {
    try {
        const product = await Product.findById(id)
            .populate("wishedBy", "name email phone photo")
            .populate("postedBy", "name email phone photo")
            .populate("orderedBy", "name email phone photo")
            .populate("category");
        if (!product) return res.status(400).json({ error: "Product not found!" });
        req.product = product;
        next();
    } catch (err) {
        console.error("Error", err);
    }
};

//middleware
exports.updateStock = (req, res, next) => {
    let myOperation = req.body.order.products.map((product) => {
        return [{
                updateMany: {
                    filter: { _id: product._id },
                    update: { $inc: { stock: -product.count, sold: +product.count } },
                },
            },
            {
                updateMany: {
                    filter: { _id: product._id },
                    update: { $push: { orderedBy: req.profile } },
                },
            },
        ];
    });

    Product.bulkWrite(myOperation, {}, (err, products) => {
        if (err) return res.status(400).json({ error: "Bulk operation failed" });
        next();
    });
};

exports.isOrdered = async(req, res, next) => {
    try {
        const product = await Product.findById(req.body.productId);
        if (!product.isOrdered) {
            next();
        } else {
            if (product.orderedBy.toString() === req.profile._id.toString()) {
                return res.json({ message: "You have already ordered this product!" });
            }
            return res.json({
                success: false,
                message: "Sorry, the product is already purchased by someone else!",
            });
        }
    } catch (err) {
        console.error("Error", err);
    }
};

exports.canUnOrder = async(req, res, next) => {
    try {
        const product = await Product.findById(req.body.productId);
        // if (product.orderedBy !== req.profile._id.toString()) {


        if (!product.orderedBy.includes(req.profile._id.toString())) {
            return res.json({
                success: false,
                message1: "Sorry, Cannot unorder this product!",
                message2: "Try refreshing page",
            });
        } else {
            next();
        }
    } catch (err) {
        console.error("Error", err);
    }
};

//routes
//create
exports.createProduct = (req, res) => {
    try {
        const { name, description, price, photo, category } = req.body;
        if (!name || !description || !price || !category) {
            return res.status(400).json({ error: "Please include all the fields" });
        }

        const { error } = validateProduct(req.body);
        if (error)
            return res.status(400).json({ errror: error.details[0].message });

        const product = new Product({
            name,
            description,
            price,
            photo,
            category,
            postedBy: req.profile,
        });

        req.profile.password = undefined;
        console.log(product);
        product.save((err, product) => {
            if (err) {
                return res.status(400).json({ error: "Saving product to db failed" });
            }
            return res.json(product);
        });
    } catch (err) {
        console.error(err);
    }
};

//delete
exports.deleteProduct = (req, res) => {
    let product = req.product;
    product.remove((err, deletedProduct) => {
        if (err) return res.status(400).json({ error: "failed to delete" });
        res.json({ success: "deleted successfully", deletedProduct });
    });
};

//update
exports.updateProduct = (req, res) => {
    Product.findByIdAndUpdate({ _id: req.product._id }, { $set: req.body }, { new: true, useFindAndModify: false },
        (err, product) => {
            if (err) {
                return res.status(400).json({ error: "No authorization to update" });
            }
            return res.json(product);
        }
    );
};

//get one
exports.getProduct = (req, res) => {
    return res.json(req.product);
};

//listing
exports.getAllProducts = async(req, res) => {
    try {
        const products = await Product.find()
            .populate("category")
            .populate("wishedBy", "name email phone photo")
            .populate("orderedBy", "name email phone photo")
            .sort("-createdAt");
        res.json(products);
    } catch (err) {
        console.error("Error", err);
    }
};

exports.getAvailableProducts = async(req, res) => {
    try {
        const products = await Product.find({ isOrdered: false })
            .populate("category")
            .populate("postedBy", "_id name email phone photo")
            .populate("wishedBy", "_id name email phone photo")
            .populate("orderedBy", "name email phone photo");
        return res.json(products);
    } catch (err) {
        console.error("Error", err);
    }
};

exports.getProductsByCategory = async(req, res) => {
    try {
        const products = await Product.find({ category: req.category })
            .populate("category")
            .populate("postedBy", "_id name email phone photo")
            .populate("wishedBy", "_id name email phone photo")
            .populate("orderedBy", "name email phone photo")
            .sort("-createdAt");
        res.json(products);
    } catch (err) {
        console.error("Error", err);
    }
};

exports.getMyPostedProducts = async(req, res) => {
    try {
        const products = await Product.find({ postedBy: req.profile._id })
            .populate("category")
            .populate("postedBy", "_id name email phone photo")
            .populate("wishedBy", "_id name email phone photo")
            .populate("orderedBy", "name email phone photo")

        .sort("-createdAt");
        res.json(products);
    } catch (err) {
        console.error("Error", err);
    }
};

//wish
exports.getMyWishedProducts = async(req, res) => {
    try {
        let products = await Product.find({ wishedBy: req.profile._id })
            .populate("category")
            .populate("postedBy", "_id name email phone photo")
            .populate("wishedBy", "_id name email phone photo");

        return res.json(products);
    } catch (err) {
        console.error("Error", err);
    }
};

exports.getAllUniqueCategories = (req, res) => {
    Product.distinct("category", {}, (err, category) => {
        if (err) return res.status(400).json({ error: "No category found" });
        return res.json(category);
    });
};

exports.wishProduct = async(req, res) => {
    try {
        const result = await Product.findByIdAndUpdate(
                req.body.productId, {
                    $push: { wishedBy: req.profile },
                }, {
                    new: true,
                }
            )
            .populate("wishedBy", "_id name email phone photo address")
            .populate("postedBy", "_id name email phone photo address")
            .populate("category", "name");
        return res.json(result);
    } catch (err) {
        console.error("Error", err);
    }
};

exports.unwishProduct = async(req, res) => {
    try {
        const result = await Product.findByIdAndUpdate(
                req.body.productId, {
                    $pull: { wishedBy: req.profile._id },
                }, {
                    new: true,
                }
            )
            .populate("wishedBy", "_id name email phone photo address")
            .populate("postedBy", "_id name email phone photo address")
            .populate("category", "name");
        return res.json(result);
    } catch (err) {
        console.error("Error", err);
    }
};

//order
exports.orderProduct = async(req, res) => {
    try {
        const result = await Product.findByIdAndUpdate(
                req.body.productId, {
                    $push: { orderedBy: req.profile },
                }, {
                    new: true,
                }
            )
            .populate("orderedBy", "_id name email phone photo address")
            .populate("postedBy", "_id name email phone photo address")
            .populate("category", "name");
        return res.json({
            success: true,
            message1: "Successfully Placed Order!",
            message2: "Your details have reached the seller.",
            payload: result,
        });
    } catch (err) {
        console.error("Error", err);
    }
};

exports.unorderProduct = async(req, res) => {
    try {
        const result = await Product.findByIdAndUpdate(
                req.body.productId, {
                    $pull: { orderedBy: req.profile._id },
                }, {
                    new: true,
                }
            )
            .populate("orderedBy", "_id name email phone photo address")
            .populate("postedBy", "_id name email phone photo address")
            .populate("category", "name");
        return res.json({
            success: true,
            message: "Successfully Cancelled Order",
            payload: result,
        });
    } catch (err) {
        console.error("Error", err);
    }
};

exports.getMyOrderedProducts = async(req, res) => {
    try {
        let products = await Product.find({ orderedBy: req.profile._id })
            .populate("category")
            .populate("postedBy", "_id name email phone photo")
            .populate("orderedBy", "_id name email phone photo");

        return res.json(products);
    } catch (err) {
        console.error("Error", err);
    }
};

exports.searchProduct = async(req, res) => {
    let productPattern = new RegExp('.*' + req.body.query + '.*', 'i')
    Product.find({ name: { $regex: productPattern } })
        .then(product => {
            return res.json({ product })
        }).catch(err => console.error("Error", err))
}