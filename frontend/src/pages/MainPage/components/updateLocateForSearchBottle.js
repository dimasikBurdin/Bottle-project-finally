import { ws } from "../../../connections/ws";
import { mymap } from "../MainPage";
import { currentLatLngDist } from "../../../connections/ws";
import { getAllBottles } from "./GetAndUpdateBottle/getAndUpdateBottle";

export function updateLocateMap() {
    mymap.on('moveend', (e) => {        
        let latLng = mymap.getCenter();        
        ws.send(JSON.stringify({
            lat: latLng.lat,
            lng: latLng.lng,
            radius: 100
        }))
        currentLatLngDist.lat = latLng.lat;
        currentLatLngDist.lng = latLng.lng;
        getAllBottles();        
    })
}
