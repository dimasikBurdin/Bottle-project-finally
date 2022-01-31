let ws = new WebSocket('wss:/localhost:44358/ws')

ws.onopen = function() {
    let options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };
      
    function success(pos) {
        let crd = pos.coords;
        
        ws.send(JSON.stringify({
            lat:crd.latitude,//
            lng: crd.longitude,
            radius: 100//
        }))  
    };
    
    function error(err) {
        ws.send(JSON.stringify({
            lat:56.85,//
            lng: 60.6,
            radius: 100//
        }))   
        console.warn(`ERROR(${err.code}): ${err.message}`);
    };
    
    navigator.geolocation.getCurrentPosition(success, error, options);

    // ws.send(JSON.stringify({
    //     lat:56.85,//
    //     lng: 60.6,
    //     radius: 100//
    // }))    
}

let currentLatLngDist = {
    lat:56.85,//
    lng: 60.6,
    radius: 100//
}

export {
    ws,
    currentLatLngDist
}

