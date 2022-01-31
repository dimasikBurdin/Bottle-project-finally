import './MainPage.css';
import 'leaflet';
import { CreationBottlenModal } from './components/BottleCreationModal/BottleCreationModal';
import { bottleFilterOnMap } from './bottleFilter';
import { getAllBottles } from './components/GetAndUpdateBottle/getAndUpdateBottle';
import { searchAddress } from './components/SearchAddress/searchAddress';
import { createAndUpdateProfile } from './components/editProfile/profile/script_profile.js';
import { updateLocateMap } from './components/updateLocateForSearchBottle';

import "regenerator-runtime/runtime";

export{
    markerDataOnMap,
    bottleIdOnMap,
    bottleDataOnMap,
    mymap,
    currentUser
}

let mymap = L.map('mapid').setView([56.85, 60.6], 13);//

let bottleIdOnMap = [];
let bottleDataOnMap = [];
let markerDataOnMap = new Map();

setTimeout(() => {//определение текущей геолокации
    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };
      
    function success(pos) {
        var crd = pos.coords;
    
        mymap.setView([crd.latitude, crd.longitude], 13)
    
        console.log('Ваше текущее местоположение:');
        console.log(`Широта: ${crd.latitude}`);
        console.log(`Долгота: ${crd.longitude}`);
        console.log(`Плюс-минус ${crd.accuracy} метров.`);
    };
    
    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        // mymap.setView([56.85, 60.6], 13);
    };
    
    navigator.geolocation.getCurrentPosition(success, error, options);
}, 100);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    //описание авторских прав и тп
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    //токен, сейчас общедоступный
    accessToken: 'pk.eyJ1IjoiZGltYXNpa2J1cmRpbiIsImEiOiJja3VyNm5vNzEwb2N1Mm5xdnVmY2F2NmZkIn0.m48LWgVP-vrcXmP0r-oiBQ'
}).addTo(mymap);

new CreationBottlenModal();
getAllBottles();
searchAddress();
bottleFilterOnMap();
createAndUpdateProfile();
updateLocateMap();

let currentUser;
getCurrentUser().then(res => currentUser = res)

async function getCurrentUser() {
    return await fetch('https://localhost:44358/api/account', {    
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'            
        }
    }).then(res => res.json())
}

document.querySelector('.chat').addEventListener('click', () => {
    document.location ='./ChatPage.html';
})

//прост пока тут
import pageIcon from '../../../dist/img/marker_siniy.svg'

let headImage = document.querySelector('head');
let link = document.createElement('link');
link.rel = 'icon';
link.type = 'image/svg';
link.href = pageIcon;
headImage.appendChild(link);