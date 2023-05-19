const express = require("express");
const router = express.Router();

const Film = require("../models/filmsModel");

// Get function to get films
router.get("/", async (req, res) => {
    if (req.header("Accept") === "application/json") {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "*");
        try {
            let totalItems = await Film.countDocuments();

            // Limit voor pagination
            let startInt = parseInt(req.query.start);
            let limitInt = parseInt(req.query.limit);
            let start = isNaN(startInt) || isNaN(limitInt) ? 1 : startInt;
            let limit = isNaN(limitInt) || isNaN(startInt) ? totalItems : limitInt;

            let films = await Film.find()
                .skip(start - 1)
                .limit(limit);
            let filmsCollection = {

                items: films,
                _links: {
                    self: {
                        href: `${process.env.BASE_URI}films/`
                    },
                    collection: {
                        href: `${process.env.BASE_URI}films/`
                    }
                },
                pagination: Pagination(
                    totalItems,
                    startInt,
                    limitInt,
                    films.length
                ),
            }
            res.json(filmsCollection);
            res.send("Hoi")
        } catch {
            res.status(500).send()
        }
    } else {
        res.status(415).send();
    }
});

// Get for the details of individual films
router.get("/:id", async(req, res) => {
    if (req.header("Accept") === "application/json")
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "*");
        try {
            let film = await Film.findById(req.params.id);
            if (film == null) {
                res.status(404).send();
        } else {
                res.json(film).send();
            }
    } catch {
            res.status(404).send();
    }
});

// Middleware for the header.
router.post("/", async(req, res, next) => {
    console.log("middleware")
    // Check if content type is right
    if (req.header("Content-Type") === "application/json" || "application/x-www-form-urlencoded") {
        next();
    } else {
        res.status(415).send();
    }
});

// Checker for empty fields
router.post("/", (req, res, next) => {
    if (req.body.director && req.body.music && req.body.starring) {
        next();
    } else {
        res.status(400).send();
    }
});

// Put function (works just like update function)
router.put("/:id", async function(req, res){
    console.log(`PUT for ${req.params.id}`);

    let newFilm = {}
    newFilm.director = req.body.director
    newFilm.music = req.body.music
    newFilm.starring = req.body.starring

    try {
        if (newFilm.director && newFilm.music && newFilm.starring !== "") {
            await Film.findByIdAndUpdate(req.params.id, newFilm)
            res.status(201).send();
        } else {
            res.status(400).send();
        }
    } catch {
        res.status(500).send();
    }
});

// Post function to create films
router.post("/", async (req, res) => {
    console.log("POST")

    let film = new Film({
        director: req.body.director,
        music: req.body.music,
        starring: req.body.starring
    })
    try {
        await film.save()
        res.status(201).send()
    } catch {
        res.status(500).send()
    }
});

// Delete function that deletes films
router.delete("/:id", async(req, res) => {
    try {
        let film = await Film.findByIdAndDelete(req.params.id)
        res.status(204).send()

    } catch {
        res.status(404).send()
    }
});

// Pagination variables
let Start = (start, limit) => !isNaN(start) && !isNaN(limit);

let Page = (total, start, limit) => Math.ceil(total / limit);

let currentPage = (total, start, limit) =>
    Math.floor((start - 1) / limit) + 1;

let nextPage = (total, start, limit) =>
    start + limit < total ? start + limit : start;

let previousPage = (total, start, limit) =>
    start - limit > 0 ? start - limit : start;

let lastPage = (total, start, limit) =>
    (Page(total, start, limit) - 1) * limit + 1;

let firstQueryString = (total, start, limit) =>
    Start(start, limit) ? `?start=1&limit=${limit}` : "";

let nextQueryString = (total, start, limit) =>
    Start(start, limit)
        ? `?start=${nextPage(total, start, limit)}&limit=${limit}`
        : "";

let previousQueryString = (total, start, limit) =>
    Start(start, limit)
        ? `?start=${previousPage(total, start, limit)}&limit=${limit}`
        : "";

let lastQueryString = (total, start, limit) =>
    Start(start, limit)
        ? `?start=${lastPage(total, start, limit)}&limit=${limit}`
        : "";


// Create the pagination
let Pagination = (total, start, limit, currentItems) => {

    let page = currentPage(total, start, limit);

    let pages = Page(total, start, limit);

    return {
        currentPage: page,
        currentItems,
        totalPages: pages,
        totalItems: total,
        _links: {
            first: {
                page: 1,
                href: `${process.env.BASE_URI}/films/${firstQueryString(
                    total,
                    start,
                    limit
                )}`,
            },
            next: {
                page: page + 1 > pages ? page : page + 1,
                href: `${process.env.BASE_URI}/films/${nextQueryString(
                    total,
                    start,
                    limit
                )}`,
            },
            previous: {
                page: page - 1 <= 1 ? 1 : page - 1,
                href: `${process.env.BASE_URI}/films/${previousQueryString(
                    total,
                    start,
                    limit
                )}`,
            },
            last: {
                page: pages,
                href: `${process.env.BASE_URI}/films/${lastQueryString(
                    total,
                    start,
                    limit
                )}`,
            },
        },
    };
};

// Options
router.options("/", (req, res) => {
    res.setHeader("Allow", "GET, POST, OPTIONS")
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.send();
});

// Options for detail
router.options("/:id", (req, res) => {
    res.setHeader("Allow", "GET, PUT, OPTIONS, DELETE")
    res.header("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
    res.send();
});

module.exports = router;