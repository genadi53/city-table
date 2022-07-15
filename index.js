import Express from "express";
import mysql from "mysql";
import "dotenv/config";
import * as path from "path"
import * as url from "url";
import cors from "cors";

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
    app.set("views", path.join(url.fileURLToPath(new URL(".", import.meta.url)), "views"))
    app.use(Express.urlencoded({extended: true}))
    app.use(Express.json())
    
    app.get("/", async (req, res) => {
        const points = await getAllPoints();
        const countries = await getAllCountries();
        const cities = await getAllCities()
        res.render("index", { points, count: points.length, countries, cities })
    })

    app.post("/", async (req, res) => {
        let filters = {...req.body};
        // console.log(filters)
        const points = await getWithFilters(filters);
        const countries = await getAllCountries();
        const cities = await getAllCities()
        res.render("index", {points, count: points.length, countries, cities})
    })

    app.get("/cities/:country", async (req, res) => {
        const { country } = req.params;
        const cities = await getCitiesByCountry(country)
        // console.log(cities)
        res.json(cities)
    })

    app.listen(PORT, () => {
        console.log('Server started!')
    })


    const getAllPoints = async () => {
        const pr = await new Promise((resolve, reject) => {
            connection.query(`select * from wp_my_points_v2;`, 
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

    const getWithFilters = async (filters) => {
        
        let query = `select * from wp_my_points_v2 where `;
        let isOther = false;
        const values = [];
        
        if(filters.Country){
            query += `country = ?`;
            values.push(filters.Country)
            isOther = true;
        }
        
        if(filters.from && parseInt(filters.to) !== NaN){
            if(isOther){
                query += ` and population > ?`;
                values.push(parseInt(filters.from))
            } else {
                query += `population > ?`;
                values.push(parseInt(filters.from))
                isOther = true;
            }
        }
        
        if(filters.to && parseInt(filters.to) !== NaN){
            if(isOther){
                query += ` and population < ?`;
                values.push(parseInt(filters.to))
            } else {
                query += `population < ?`;
                values.push(parseInt(filters.to))
                isOther = true;
            }
        }
        
        if(filters.City){
            if(isOther){
                query += ` and city = ?`;
                values.push(filters.City)
            } else {
                query += `city = ?`;
                values.push(filters.City)
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

}
main();