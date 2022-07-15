import mysql from "mysql"
import fetch from "node-fetch"
import 'dotenv/config' 

const connection = mysql.createConnection({
    host     : process.env.host,
    user     : process.env.user,
    password : process.env.password,
    database : process.env.database,
});

const getPoints = async () => {

    const link = "http://geodb-free-service.wirefreethought.com/v1/geo/cities?offset=0&limit=1"

    for(let i = 0; i < 20000; i+=5){
        const res= await fetch(`http://geodb-free-service.wirefreethought.com/v1/geo/cities?offset=${i}&limit=5`);
        const data = await res.json();
        saveMarker(data.data[0])
        saveMarker(data.data[1])
        saveMarker(data.data[2])
        saveMarker(data.data[3])
        saveMarker(data.data[4])
    }
}


const createTables = (connection) => {
    connection.connect();
        connection.query(`
        create table if not exists wp_my_points_v2(id int primary key, 
            city varchar(255), region varchar(255), country varchar(255), 
            latitude double, longtitude double, population int);`, function (error, results, fields) {
            if (error) throw error;
            console.log(results);
        });
    connection.end();
}

     

const saveMarker = (marker) => {

    connection.query(`insert into wp_my_points_v2(id, city, region, country, latitude, longtitude, population) 
        values(
        ${marker.id}, ${marker.city}', 
        '${ marker.region}', '${marker.country}',
        ${marker.latitude}, ${marker.longitude}, 
        ${marker.population});`, 
        function (error, results, fields) {
            if (error) throw error;
            console.log(results);
        });
        
}


const queryPoints = () => {

    connection.query(`select * from wp_my_points_v2;`, 
        function (error, results, fields) {
            if (error) throw error;
            // console.log(results);
            return results;
        });
        
}

// createTables(connection)
// saveMarkers()
const p = queryPoints()
console.log(p)
// queryPoints();