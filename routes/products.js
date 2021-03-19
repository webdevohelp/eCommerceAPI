const { Product } = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');

router.get(`/`, async (req, res) => {
    //products?categories=xxxx,yyyy,zzzz
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') };
        console.log(filter);
    }
    const productList = await Product.find(filter)
        .select()
        .populate('category'); // .select is used to select what fields to display and what not

    if (!productList) {
        res.status(500).json({ success: false });
    }
    res.send(productList);
});

router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
        res.status(500).json({ success: false });
    }
    res.send(product);
});

router.post(`/`, async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) {
        res.status(400).json({
            success: false,
            message: 'Invalid category!',
        });
    }
    let addProduct = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    });

    product = await addProduct.save();
    if (!product) {
        res.status(500).json({
            success: false,
            message: 'The product can not be created!',
        });
    }
    res.status(201).json(product);
});

router.put('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send('Invalid Product Id');
    }
    const category = await Category.findById(req.body.category);
    if (!category) {
        res.status(400).json({
            success: false,
            message: 'Invalid category!',
        });
    }
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        { new: true } // to show updated data as a response when updating data
    );
    if (!product) res.status(500).send('The Product can not be updated!');
    res.send(product);
});

router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id)
        .then((data) => {
            if (data) {
                res.status(200).json({
                    success: true,
                    message: 'The Product is removed!',
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Product not found!',
                });
            }
        })
        .catch((err) => {
            res.status(400).json({ success: false, error: err });
        });
});

// Total number of products in the database
router.get('/get/count', async (req, res) => {
    const productCount = await Product.countDocuments((count) => count);

    if (!productCount) {
        res.status(500).json({ success: false });
    }
    res.send({ productCount: productCount });
});

// Featured products from DB
router.get('/get/featured/:count', async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({ isFeatured: true }).limit(
        parseInt(count)
    );
    console.log('Hello');
    console.log(products);
    if (!products) {
        res.status(500).json({ success: true });
    }
    res.send(products);
});

module.exports = router;
