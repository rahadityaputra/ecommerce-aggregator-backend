const express = require("express");
const validate = require("../../middlewares/validate.middleware");
const authMiddleware = require("../../middlewares/auth.middleware");
const controller = require("./products.controller");
const {
    createProductSchema,
    updateProductSchema,
    updateStockSchema,
    getProductSchema,
    deleteProductImageSchema,
    listProductsSchema,
} = require("./products.validation");
const { uploadProductImages } = require("./products.upload");

const router = express.Router();

/**
 * @openapi
 * /api/v1/products/upload:
 *   post:
 *     tags: [Products]
 *     summary: Upload product images
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       '200':
 *         description: Images uploaded
 * 
 * /api/v1/products:
 *   get:
 *     tags: [Products]
 *     summary: Get products
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Products fetched
 *   post:
 *     tags: [Products]
 *     summary: Create product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '201':
 *         description: Product created
 * 
 * /api/v1/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product detail
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Product fetched
 *   patch:
 *     tags: [Products]
 *     summary: Update product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Product updated
 *   delete:
 *     tags: [Products]
 *     summary: Delete product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Product deleted
 * 
 * /api/v1/products/{id}/stock:
 *   patch:
 *     tags: [Products]
 *     summary: Update product stock
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stock:
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Stock updated
 * 
 * /api/v1/products/{id}/images:
 *   post:
 *     tags: [Products]
 *     summary: Add product images
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       '200':
 *         description: Images added
 * 
 * /api/v1/products/{id}/images/{imageId}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete product image
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Image deleted
 */
router.use(authMiddleware);
router.post("/upload", uploadProductImages, controller.uploadImages);
router.get("/", validate(listProductsSchema), controller.getProducts);
router.post(
    "/:id/images",
    validate(getProductSchema),
    uploadProductImages,
    controller.addProductImages,
);
router.patch("/:id/stock", validate(updateStockSchema), controller.updateStock);
router.delete(
    "/:id/images/:imageId",
    validate(deleteProductImageSchema),
    controller.deleteProductImage,
);
router.get("/:id", validate(getProductSchema), controller.getProduct);
router.post("/", validate(createProductSchema), controller.createProduct);
router.patch("/:id", validate(updateProductSchema), controller.updateProduct);
router.delete("/:id", validate(getProductSchema), controller.deleteProduct);

module.exports = router;
