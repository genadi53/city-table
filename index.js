import Express from "express";
import mysql from "mysql";
import "dotenv/config";
import * as path from "path"
import * as url from "url";
import cors from "cors";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url))

const main = async () => {

    const app = Express();
    const PORT = 3000;
    const connection = mysql.createConnection({
        host     : process.env.host,
        user     : process.env.user,
        password : process.env.password,
        database : process.env.database,
    });
    
    app.use(cors({ origin: "*", credentials: true }))
    app.set("view engine", "ejs")
    app.set("views", path.join(__dirname, "views"))
    app.use(Express.static(path.join(__dirname, "public")))
    app.use(Express.urlencoded({extended: true}))
    app.use(Express.json())

    app.get("/", async (req, res) => {
        const points = await getAllPoints();
        const countries = await getAllCountries();
        const cities = await getAllCities()
        res.render("index", { points, count: points.length, countries, cities })
    })

    app.get("/wp", async (req, res) => {
        const points = await getAllPoints();
        const countries = await getAllCountries();
        const cities = await getAllCities()
        res.json({ points, count: points.length, countries, cities })
    })

    app.post("/", async (req, res) => {
        let filters = {...req.body};
        // console.log(filters)
        const points = await getWithFilters(filters);
        const countries = await getAllCountries();
        const cities = await getAllCities()
        res.render("index", {points, count: points.length, countries, cities})
    })

    app.post("/wp", async (req, res) => {
        console.log(req.body)
        let filters = {...req.body};
        const points = await getWithFilters(filters);
        const countries = await getAllCountries();
        const cities = await getAllCities()
        res.json({ points, count: points.length, countries, cities })
    })

    app.post("/wp/rect", async (req, res) => {
        let filters = {...req.body};
        console.log(filters)
        const points = await getAllCitiesInRect(filters);
        const countries = await getAllCountries();
        const cities = await getAllCities()
        res.json({points, count: points.length, countries, cities  })
    })

    app.get("/cities/:country", async (req, res) => {
        const { country } = req.params;
        const cities = await getCitiesByCountry(country)
        // console.log(cities)
        res.json(cities)
    })

    app.get("/country/:city", async (req, res) => {
        const { city } = req.params;
        const country = await getCountryByCity(city)
        // console.log(country)
        res.json(country)
    })

    app.get("/map", async (req, res) => {
        const points = await getAllPoints();
        const countries = await getAllCountries();
        const cities = await getAllCities()
        res.render("map", {points, count: points.length, countries, cities,  })
    })

    app.post("/map", async (req, res) => {
        let filters = {...req.body};
        const points = await getWithFilters(filters);
        const countries = await getAllCountries();
        const cities = await getAllCities()
        res.render("map", {points, count: points.length, countries, cities})
    })

    app.get("/points", async (req, res) => {
        const points = await getAllPoints();
        res.json(points)
    })

    app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}!`)
    })


    const getAllPoints = async () => {
        const pr = await new Promise((resolve, reject) => {
            connection.query(`select id, city, region, country, latitude, longtitude, population from wp_my_points_v2;`, 
            function (error, results, fields) {
                if (error) throw error;
                // console.log(results);
                resolve(results)
            });
        });
        return pr;
    }

    const getAllCountries = async () => {
        const pr = await new Promise((resolve, reject) => {
            connection.query(`select distinct country from wp_my_points_v2;`, 
            function (error, results, fields) {
                if (error) throw error;
                // console.log(results);
                resolve(results)
            });
        });
        return pr;
    }

    const getAllCities = async () => {
        const pr = await new Promise((resolve, reject) => {
            connection.query(`select distinct city from wp_my_points_v2;`, 
            function (error, results, fields) {
                if (error) throw error;
                // console.log(results);
                resolve(results)
            });
        });
        return pr;
    }

    const getCitiesByCountry = async (country) => {
        const pr = await new Promise((resolve, reject) => {
            connection.query(`select distinct city from wp_my_points_v2 where country = '${country}';`, 
            function (error, results, fields) {
                if (error) throw error;
                // console.log(results);
                resolve(results)
            });
        });
        return pr;
    }

    const getCountryByCity = async (city) => {
        const pr = await new Promise((resolve, reject) => {
            connection.query(`select distinct country from wp_my_points_v2 where city = '${city}';`, 
            function (error, results, fields) {
                if (error) throw error;
                // console.log(results);
                resolve(results)
            });
        });
        return pr;
    }

    const getWithFilters = async (filters) => {
        console.log(filters)
        let query = `select id, city, region, country, latitude, longtitude, population from wp_my_points_v2  `;
        let isOther = false;
        const values = [];
        
        if(filters.Country){
            query += ` where country = ?`;
            values.push(filters.Country)
            isOther = true;
        }
        
        if(filters.from && parseInt(filters.to) !== NaN){
            if(isOther){
                query += ` and population >= ?`;
                values.push(parseInt(filters.from))
            } else {
                query += `where population >= ?`;
                values.push(parseInt(filters.from))
                isOther = true;
            }
        }
        
        if(filters.to && parseInt(filters.to) !== NaN){
            if(isOther){
                query += ` and population <= ?`;
                values.push(parseInt(filters.to))
            } else {
                query += `where population <= ?`;
                values.push(parseInt(filters.to))
                isOther = true;
            }
        }
        
        if(filters.City){
            if(isOther){
                query += ` and city = ?`;
                values.push(filters.City)
            } else {
                query += `where city = ?`;
                values.push(filters.City)
                isOther = true;
            }
        }

        if(filters.x1 && filters.y1 && filters.x2 && filters.y2){
            if(isOther){
                query += ` and latitude >= ? and latitude <= ? and longtitude >= ? and longtitude <= ?`;
                values.push(filters.x1)
                values.push(filters.x2)
                values.push(filters.y1)
                values.push(filters.y2)
            } else {
                query += `where latitude >= ? and latitude <= ? and longtitude >= ? and longtitude <= ?`;
                values.push(filters.x1)
                values.push(filters.x2)
                values.push(filters.y1)
                values.push(filters.y2)
                isOther = true;
            }
        }

        query += `;`
        console.log(query)
        console.log(values)
        const pr = await new Promise((resolve, reject) => {
            connection.query({ sql: query, values}, 
                function (error, results, fields) {
                    if (error) throw error;
                    // console.log(results);
                    resolve(results)
            });
        });
        return pr;
    }

    const getAllCitiesInRect = async (rectCoord) => {
        // rectCoord = {
        //     east: 10.58825,
        //     north: 52.70058209319302,
        //     south: 21.97475755593838,
        //     west: 5.875562499999978,

        //     // latitude: 22.785
        //     // longtitude: 5.522777777

        // }
        

        let query = `select id, city, region, country, latitude, longtitude, population from wp_my_points_v2 
        where latitude >= ${rectCoord.south} and latitude <= ${rectCoord.north} and longtitude >= ${rectCoord.west} and longtitude <= ${rectCoord.east};`;
        console.log(query)
        // console.log(values)
        const pr = await new Promise((resolve, reject) => {
            connection.query({ sql: query}, 
                function (error, results, fields) {
                    if (error) throw error;
                    console.log(results.length);
                    resolve(results)
            });
        });
        return pr;
    }

    async function initMap(points) {

        const loader = new Loader({
            apiKey: "",
            version: "weekly",
            libraries: ["places"]
          });
          
        let pointsWithCoords = [];
        // const res =  await fetch("http://localhost:3000/points");
        // const data = await res.json();
        points.forEach(p => {
            pointsWithCoords = [...pointsWithCoords, {
            position: {lat: parseFloat(p.latitude) , lng: parseFloat(p.longtitude)},
            ...p
            }];
        })

        let map = null;
        loader
        .load()
        .then((google) => {
            map = new google.maps.Map(document.createElement("div"), {
                center: {
                  lat: 0,
                  lng: 0
                },
                zoom: 4
            });
            const infoWindow = new google.maps.InfoWindow({
                content: "",
                disableAutoPan: true,
            });
            const markers = pointsWithCoords.map((point, idx) => {
                const marker = new google.maps.Marker({
                    position: point.position,
                    map: map, 
                });
    
                marker.addListener("click", () => {
                infoWindow.setContent(`${point.city} 
                - population ${point.population}`);
                infoWindow.open(map, marker);
                });
                return marker;
            });
    
            const markerCluster = new markerClusterer.MarkerClusterer({ map, markers });
        })
        .catch(e => {
            // do something
        });
        
        return map;
    }

}
main();