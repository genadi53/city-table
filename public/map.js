async function initMap(points, google) {

    console.log(points)
    console.log(google)


    const loader = new google.maps.plugins.loader.Loader({
        apiKey: "AIzaSyCKvUyeNfifyLHInxIN1g6lqiu106pp6GQ",
        version: "weekly",
        libraries: ["places"]
    });

    console.log(loader)


   
    let pointsWithCoords = [];
    // const res =  await fetch("http://localhost:3000/points");
    // const data = await res.json();
    
    const data = JSON.parse(points)

    data.forEach(p => {
        pointsWithCoords = [...pointsWithCoords, {
        position: {lat: parseFloat(p.latitude) , lng: parseFloat(p.longtitude)},
        ...p
        }];
    })

    console.log(loader)
    let promise = await new Promise((resolve, reject) => {
        loader
        .load()
        .then(() => {
            console.log(google)
            const map = new google.maps.Map(document.getElementById("map"), {
                zoom: 3,
                center: pointsWithCoords[0].position,
            });
            // const map = new google.maps.Map(document.getElementById("map"), {
                //     zoom: 3,
                //     center: pointsWithCoords[0].position,
                // });
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
            resolve(map)
        })
        .catch(e => {
           console.log("Error")
           console.log(e)
        });
    });  
    
    console.log(promise)
    return promise;
}

window.initMap = initMap;
// console.log(window)