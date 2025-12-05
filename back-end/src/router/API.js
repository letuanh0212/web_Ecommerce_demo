const express = require("express");
const routerAPI = require("express").Router();
const { poolPromise, sql } = require("../config/Sql");
const { verifyToken, checkRole } = require('../middleware/verify_token');
const {createUser, loginUser, GetAllUsers,GetAllsellers } = require("../controller/userController");
const { checkStore, checkStoreController } = require("../controller/sellerController");
const { searchItems } = require("../controller/elasticSearchController");
const { recommendForUser } = require("../controller/recommenderController");


routerAPI.get("/", async (req, res) => {
    return res.status(200).json( { message: "API is working" } );
} );

routerAPI.post("/register", createUser);   

routerAPI.post('/login',loginUser);


routerAPI.get('/users', verifyToken, checkRole(['admin']), async (req, res) => {
    try {
        const users = await GetAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "controller error" });
    }
});

routerAPI.get('/sellers', verifyToken, checkRole(['admin']), async (req, res) => {
    try {
        const sellers = await GetAllsellers();
        res.json(sellers);
    } catch (err) {
        res.status(500).json({ message: "controller error " });
    }
});




routerAPI.get('/seller/store/:userId', verifyToken, checkRole(['seller']), async (req, res) => {
    try {
        const sellerId = req.params.userId;
        console.log("Raw sellerId from params:", sellerId);

        if (!sellerId) return res.status(400).json({ message: "Missing sellerId" });

        const hasStore = await checkStoreController(sellerId); 
        return res.status(200).json({ hasStore }); 
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
});

routerAPI.get('/seller/store/:owner_id', verifyToken, checkRole(['seller']), async (req, res) => {
    try {
        const sellerId = req.params.userId;
        console.log("Raw sellerId from params:", sellerId);

        if (!sellerId) return res.status(400).json({ message: "Missing sellerId" });

        const hasStore = await checkStoreController(sellerId); 
        return res.status(200).json({ hasStore }); 
    } catch (err) {
        console.error(err);c
        return res.status(500).json({ message: err.message });
    }
});

routerAPI.get('/search', searchItems);

// routerAPI.get("/user/:userId", async (req, res) => {
//     try {
//         const userId = parseInt(req.params.userId);
//         const recommended = await recommendForUser(userId);
//         res.json({ recommended });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Error recommending products" });
//     }
// });

routerAPI.get("/user/:userId", async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const recommended = await recommendForUser(userId);

        if (!recommended || recommended.length === 0)
            return res.json([]);

        // Lấy danh sách ID
        const ids = recommended.map(r => r.id).join(",");

        const pool = await poolPromise;
        const query = `
            SELECT 
                i.id, i.name, i.price, 
                c.name AS category_name,
                v.id AS variant_id, v.size, v.color, v.pattern,
                img.image
            FROM Items i
            LEFT JOIN Categories c ON c.id = i.category_id
            LEFT JOIN ItemVariants v ON v.item_id = i.id
            LEFT JOIN ItemImages img ON img.item_id = i.id
            WHERE i.id IN (${ids})
        `;

        const result = await pool.request().query(query);
        const rows = result.recordset;

        // Group theo item
        const items = {};

        rows.forEach(r => {
            if (!items[r.id]) {
                items[r.id] = {
                    id: r.id,
                    name: r.name,
                    price: r.price,
                    category_name: r.category_name,
                    variants: [],
                    images: []
                };
            }

            if (r.variant_id) {
                items[r.id].variants.push({
                    id: r.variant_id,
                    size: r.size,
                    color: r.color,
                    pattern: r.pattern
                });
            }

            if (r.image) {
                items[r.id].images.push(r.image);
            }
        });

        // Giữ đúng thứ tự recommendation
        const finalResult = recommended.map(r => ({
            ...r,
            ...items[r.id]
        }));

        res.json(finalResult);

    } catch (err) {
        console.error("Recommend API error:", err);
        res.status(500).json({ error: "Server error" });
    }
});


routerAPI.use("/items", require("./item.routes"));
routerAPI.use("/categories", require("./category.routes"));

routerAPI.use("/articles", require("./article.routes"));
routerAPI.use("/stores", require("./store.routes"));
routerAPI.use("/orders", require("./order.routes"));



module.exports = routerAPI;

 