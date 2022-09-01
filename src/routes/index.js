require("dotenv").config();
const { Router } = require("express");
const router = Router();

//Importo todos los routers;
const videogames = require("./videogames");
const videogame = require("./videogame");
const genres = require("./genres");
const platforms = require("./platforms");

//Configuro todos los routers
router.use("/videogames", videogames);
router.use("/genres", genres);
router.use("/videogame", videogame);
router.use("/platforms", platforms);

module.exports = router;
