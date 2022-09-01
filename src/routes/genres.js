require("dotenv").config();
const { API_KEY } = process.env;
const { Router } = require("express");
const router = Router();
const axios = require("axios").default;
const { Genre } = require("../db");

// GET a "/genres"

router.get("/", async (req, res) => {
  try {
    // Busco en la db.
    const dbGenres = await Genre.findAll();
    if (dbGenres.length) return res.json(dbGenres);

    //sino busco en la API
    const apiGenres = await axios.get(
      `https://api.rawg.io/api/genres?key=${API_KEY}`
    );
    const genres = apiGenres.data.results; //
    //Guardo los generos en la DB filtrando solo el nombre
    genres.forEach((e) => {
      Genre.findOrCreate({
        where: {
          name: e.name,
        },
      });
    });
  } catch (err) {
    return console.log(err);
  }
});

module.exports = router;
