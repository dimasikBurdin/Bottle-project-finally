import { ws } from '../../../../connections/ws';
import { bottleDataOnMap, bottleIdOnMap} from '../../MainPage';
import { Bottle } from '../Bottle/Bottle';
import blueMarker from '../../../../../dist/img/marker_siniy.svg';
import yellowMarker from '../../../../../dist/img/marker_zhelty.svg';

import { currentLatLngDist } from '../../../../connections/ws';

export {
    getAllBottles
}

function getAllBottles() {
    let lat = currentLatLngDist.lat;
    let lng = currentLatLngDist.lng;
    let radius = currentLatLngDist.radius;
    fetch(`https://localhost:44358/api/bottles?radius=${radius}&lat=${lat}&lng=${lng}`, {   
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(res => {
        let blueIcon = L.icon({
            iconUrl: blueMarker,
            iconSize: [50, 50],    
        });
        let yellowIcon2 = L.icon({
            iconUrl: yellowMarker,
            iconSize: [50, 50],    
        });
        for(let e of res){            
            if(!(bottleIdOnMap.includes(e.id))) {
                // console.log(e)
                // new Bottle(e.id, e.category, [e.lat, e.lng], newIcon, e.geoObjectName, e.address, e.title, e.description, false);
                if(e.category == 'Тусовки') {
                    new Bottle(e.id, e.category, [e.lat, e.lng], yellowIcon2, e.geoObjectName, e.address, e.title, e.description, e.userId, false);
                } else {
                    new Bottle(e.id, e.category, [e.lat, e.lng], blueIcon, e.geoObjectName, e.address, e.title, e.description, e.userId,false);
                }
                
                bottleIdOnMap.push(e.id);
                bottleDataOnMap.push(e);
                // console.log(e)
            }
        }
    })
}

import { markerDataOnMap, mymap } from '../../MainPage'

ws.onmessage = function(e) {
    console.log(JSON.parse(e.data))
    if(JSON.parse(e.data).eventNumber == 3) {
        let newIcon = L.icon({
            iconUrl: blueMarker,
            iconSize: [50, 50],    
        });
        let markers = [
            L.icon({
                iconUrl: blueMarker,
                iconSize: [50, 50],    
            }),
            L.icon({
                iconUrl: yellowMarker,
                iconSize: [50, 50],    
            })
        ]
        let randIcon = markers[Math.floor(Math.random()*markers.length)]
        let bottleData = JSON.parse(e.data).model;
        if(!(bottleIdOnMap.includes(bottleData.id))) {
            new Bottle(bottleData.id, bottleData.category, [bottleData.lat, bottleData.lng], randIcon, bottleData.geoObjectName, bottleData.address, bottleData.title, bottleData.description, bottleData.userId, false);
            bottleIdOnMap.push(bottleData.id);
            bottleDataOnMap.push(bottleData);
            console.log("on ws")
        }
    }
    if(JSON.parse(e.data).eventNumber == 5) {//удаление бутылки при поднятии
        let data = JSON.parse(e.data).model;
        console.log(data);
        mymap.removeLayer(markerDataOnMap.get(data.id))
    }
}

