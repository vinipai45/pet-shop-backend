const express = require("express");
const router = express.Router();
const {
    getProductById,
    createProduct,
    getProduct,
    deleteProduct,
    updateProduct,
    getMyPostedProducts,
    getAllProducts,
    getAllUniqueCategories,
    wishProduct,
    unwishProduct,
    getProductsByCategory,
    getMyWishedProducts,
    orderProduct,
    unorderProduct,
    getMyOrderedProducts,
    isOrdered,
    canUnOrder,
    getAvailableProducts,
    searchProduct
} = require("../controllers/product");
const { getUserById } = require("../controllers/user");
const { getCategoryById } = require("../controllers/category");
const { isAdmin, isSignedIn } = require("../controllers/auth");

//params
router.param("userId", getUserById);
router.param("productId", getProductById);
router.param("categoryId", getCategoryById);

//all routes
// create-route
router.post("/product/create/:userId", isSignedIn, createProduct);

//read-routes
router.get("/product/:productId", getProduct);

//delete-route
router.delete("/product/:productId/:userId", isSignedIn, deleteProduct);

//update-route
router.put("/product/:productId/:userId", isSignedIn, updateProduct);

//listing-route
router.get("/products", getAllProducts);
router.get("/available/products/", getAvailableProducts);
router.get("/products/:categoryId", getProductsByCategory);
router.get("/product/getmyproducts/:userId", isSignedIn, getMyPostedProducts);

router.get("/products/categories", getAllUniqueCategories);

//wishlist
router.put("/product/wish/", isSignedIn, wishProduct);
router.put("/product/unwish/", isSignedIn, unwishProduct);
router.get("/mywish/user/:userId", isSignedIn, getMyWishedProducts);

//order
router.put("/product/order/", isSignedIn, orderProduct);
router.put("/product/unorder/", isSignedIn, canUnOrder, unorderProduct);
router.get("/myorder/user/:userId", isSignedIn, getMyOrderedProducts);

router.post('/search-products', searchProduct)
module.exports = router;