require("dotenv").config();
const { API_KEY } = process.env;
const { Router } = require("express");
const router = Router();
const axios = require("axios").default;
const { Videogame, Genre } = require("../db");

//Busco todos los juegos o por query Name
router.get("/", async (req, res) => {
  const { name } = req.query;
  //Busco en la Api
  try {
    if (name) {
      var apiresult = await axios.get(
        `https://api.rawg.io/api/games?search=${name}&key=${API_KEY}&page_size=100`
      );
      apiresult = apiresult.data.results;
    } else {
      async function SearchApi() {
        try {
          const promise1 = axios.get(
            `https://api.rawg.io/api/games?key=${API_KEY}&page=1&page_size=50`
          );
          const promise2 = axios.get(
            `https://api.rawg.io/api/games?key=${API_KEY}&page=2&page_size=50`
          );
          const promise3 = axios.get(
            `https://api.rawg.io/api/games?key=${API_KEY}&page=3&page_size=50`
          );
          const promise4 = axios.get(
            `https://api.rawg.io/api/games?key=${API_KEY}&page=3&page_size=50`
          );
          const promise5 = axios.get(
            `https://api.rawg.io/api/games?key=${API_KEY}&page=3&page_size=50`
          );
          const promise6 = axios.get(
            `https://api.rawg.io/api/games?key=${API_KEY}&page=3&page_size=50`
          );

          await Promise.all([
            promise1,
            promise2,
            promise3,
            promise4,
            promise5,
            promise6,
          ]).then(function (values) {
            apiresult = values[0].data.results
              .concat(values[1].data.results)
              .concat(values[2].data.results)
              .concat(values[3].data.results)
              .concat(values[4].data.results)
              .concat(values[5].data.results);
          });
        } catch (err) {
          console.log("Error buscando en la API: ", err);
        }
      }
      await SearchApi();
    }
    if (apiresult.length > 0) {
      var apivgames = apiresult.map((p) => {
        let b = [];
        for (i = 0; i < p.genres.length; i++) {
          b.push(p.genres[i].name);
        }
        return {
          id: p.id,
          name: p.name,
          image: p.background_image,
          genres: b.toString(),
          rating: p.rating,
          platform: p.platforms.map((p) => p.platform.name),
          origin: "API",
        };
      });
      if (name) {
        apivgames = apivgames.filter((p) =>
          p.name.toLowerCase().includes(name.toLowerCase())
        );
      }
    } else var apivgames = [];

    //Busco en la Base de Datos
    var dbvgames = [];
    dbvgames = await Videogame.findAll({
      include: {
        model: Genre,
        attributes: ["name"],
        through: { attributes: [] },
      },
    });
    if (name) {
      dbvgames = dbvgames.filter((p) =>
        p.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    var dbvgames = dbvgames.map((p) => {
      let b = [];
      for (i = 0; i < p.genres.length; i++) {
        b.push(p.genres[i].name);
      }
      return {
        id: p.id,
        name: p.name,
        image: p.image,
        genres: b.toString(),
        createdInDb: true,
        rating: p.rating,
        platform: p.platforms,
        origin: "DB",
      };
    });
    //Concateno los resultados de api + db
    const allvgames = dbvgames.concat(apivgames);
    res.json(allvgames.length ? allvgames : "No videogames found");
  } catch (error) {
    res.send(`Error en ruta /videogames ${error}`);
  }
});

//POST /videogame

router.post("/", async (req, res) => {
  let {
    name,
    description,
    image,
    releaseDate,
    rating,
    createdInDb,
    genres,
    platforms,
  } = req.body;
  platforms = platforms.toString();
  let gameCreated = await Videogame.create({
    name,
    description,
    image,
    releaseDate,
    rating,
    createdInDb,
    platforms,
  });
  let genreDb = await Genre.findAll({
    where: { name: genres },
  });
  gameCreated.addGenre(genreDb);

  res.send("Juego creado con exito");
});

module.exports = router;
