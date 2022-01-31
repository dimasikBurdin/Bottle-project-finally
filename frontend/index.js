import '/style.css';
import './hystmodal.min.css';
import 'leaflet';
// import './Control.OSMGeocoder';
import './hystmodal.min';
import blueMarker from './marker_siniy.svg';
import yellowMarker from './marker_zhelty.svg';
import testIcon2 from './test-icon2.jpg';
import docIcon from './faylikonka.svg';
import './customGeocoder'
import { GeoCoder } from './customGeocoder';


let mymap = L.map('mapid').setView([56.85, 60.6], 13);

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

let myIcon = L.icon({
    iconUrl: "./test-icon.png",
    iconSize: [50, 50],    
});

let bottleIdOnMap = [];
let bottleDataOnMap = [];
let markerDataOnMap = new Map();

//поиск по адресам
// let osmGeocoder = new L.Control.OSMGeocoder();
// mymap.addControl(osmGeocoder);

let input = document.querySelector('.search-form');
let input_field = document.querySelector('.search-field');
let submit_button = document.querySelector('.geo-submit');
let geo_input = document.querySelector('.geo-input');

let marker_search;
input.addEventListener('submit', (e) => {
    e.preventDefault();
    // geo_input.value = input_field.value;

    if(marker_search)
        mymap.removeLayer(marker_search);
    
        let geoCoderr = new GeoCoder(input_field.value);
        geoCoderr._geocode(e).then(results => {
        if (results.length == 0) {
            console.log("ERROR: didn't find a result");
            return;
        }

        let bbox = results[0].boundingbox,
            first = new L.LatLng(bbox[0], bbox[2]),
            second = new L.LatLng(bbox[1], bbox[3]),
            bounds = new L.LatLngBounds([first, second]);
        
        mymap.fitBounds(bounds);

        let lat = results[0].lat;
        let lon = results[0].lon;        
                
        marker_search = L.marker(new L.LatLng(lat, lon));
        marker_search.addTo(mymap);
    })
    // submit_button.click();
})

mymap.addEventListener('click', () => {
    if(marker_search)
        mymap.removeLayer(marker_search);
})

//подключение модалки
let myModal = new HystModal({
    linkAttributeName: "data-hystmodal",
    //settings (optional). see Configuration
});

let modal_window = document.querySelector('.modal-window');
let modal_h = document.querySelector('.modal-h');
let modal_categories = document.querySelector('.modal-categories');
let modal_description = document.querySelector('.modal-description');
let modal_create_button = document.querySelector('.modal-window-exit-button');

let marker_create_bottle;

let create_modal_window_button = document.querySelector('.new-bottle');
let profileButton = document.querySelector('.profile');
let chatButton = document.querySelector('.chat');

let userImageList = document.querySelector('.modal-user-image-list');
let divUserImage = document.querySelector('.modal-window-user-image');
let addUserImageInput = document.querySelector('.modal-user-input-image');

create_modal_window_button.addEventListener('click', () => {
    mymap.closePopup();
})

//получение всех бутылок на карте
function getAllBottles() {
    fetch('https://localhost:44358/api/bottles', {   
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'            
        }
    })
    .then(res => res.json())
    .then(res => {
        let newIcon = L.icon({
            iconUrl: blueMarker,
            iconSize: [50, 50],    
        });
        let newIcon2 = L.icon({
            iconUrl: yellowMarker,
            iconSize: [50, 50],    
        });
        for(let e of res){            
            if(!(bottleIdOnMap.includes(e.id))) {
                // console.log(e)
                // new Bottle(e.id, e.category, [e.lat, e.lng], newIcon, e.geoObjectName, e.address, e.title, e.description, false);
                if(e.category == 'Тусовки') {
                    new Bottle(e.id, e.category, [e.lat, e.lng], newIcon2, e.geoObjectName, e.address, e.title, e.description, false);
                } else {
                    new Bottle(e.id, e.category, [e.lat, e.lng], newIcon, e.geoObjectName, e.address, e.title, e.description, false);
                }
                
                bottleIdOnMap.push(e.id);
                bottleDataOnMap.push(e);
            }
        }
    })
}

getAllBottles();

//обновление инфы о бутылках
let ws = new WebSocket('wss:/localhost:44358/ws')

ws.onopen = function() {
    ws.send(JSON.stringify({
        lat:56.85,//
        lng: 60.6,
        radius: 100//
    }))
}

ws.onmessage = function(e) {
    console.log(JSON.parse(e.data))
    if(JSON.parse(e.data).eventNumber == 3) {
        let newIcon = L.icon({
            iconUrl: blueMarker,
            iconSize: [50, 50],    
        });
        let bottleData = JSON.parse(e.data).model;
        if(!(bottleIdOnMap.includes(bottleData.id))) {
            new Bottle(bottleData.id, bottleData.category, [bottleData.lat, bottleData.lng], newIcon, bottleData.geoObjectName, bottleData.address, bottleData.title, bottleData.description, false);
            bottleIdOnMap.push(bottleData.id);
            bottleDataOnMap.push(bottleData);
            console.log("fucj1")
        }
    }
}

//попытка фильтрации
let mainCateg = document.querySelector('.categories');
mainCateg.addEventListener('change', (e) => {
    console.log(mainCateg.options[mainCateg.selectedIndex].textContent)
    switch(mainCateg.options[mainCateg.selectedIndex].textContent) {
        case 'Тусовки':
            bottleFilter('Тусовки');
            break;
        case 'Продажи':
            bottleFilter('Продажи');
            break;
        case '...':
            bottleFilter('...');
            break;
        default:
            bottleFilter();
            break;  
    }
})

function bottleFilter(filter=null) {
    for(let e of bottleDataOnMap) {
        if(e.category != filter && filter != null){
            mymap.removeLayer(markerDataOnMap.get(e.id))
        } else {
            mymap.addLayer(markerDataOnMap.get(e.id))
        }
    }
}



//тест чатов
profileButton.addEventListener('click', () => {
    fetch('https://localhost:44358/api/account', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(res => {
        if(res.id == 1) {
            fetch('https://localhost:44358/api/dialogs/1', {
                method: 'POST',
                credentials: 'include',
                body: "You dick1",
                headers: { 'Content-Type': 'application/json' }
            }).then(res => res.json())
                .then(res => console.log(res))
        } else {
            fetch('https://localhost:44358/api/dialogs/1', {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify("You dick2"),
                headers: { 'Content-Type': 'application/json' }
            }).then(res => res.json())
            .then(res => console.log(res))
        }
    })
})


//логика создания бутылки через модалку
modal_window.addEventListener('submit', (event) => {
    event.preventDefault();

    create_modal_window_button.style.visibility = "hidden";
    profileButton.style.visibility = "hidden";
    chatButton.style.visibility = "hidden";
    
    myModal.close();

    let quest_marker;
    let once_click_on_map_flag = true;

    let back_button = document.querySelector('.back-to-not-create');
    back_button.style.display = "block";

    back_button.addEventListener('click', () => {
        once_click_on_map_flag = false;
        back_button.style.display = "none";
        create_modal_window_button.style.visibility = "visible";
        profileButton.style.visibility = "visible";
        chatButton.style.visibility = "visible";
        modal_h.value = "";
        modal_description.value = "";
        userImageList.innerHTML = "";
        addUserImageInput.value = '';
        modal_categories.selectedIndex = 0;
        if(quest_marker) mymap.removeLayer(quest_marker);
    })

    mymap.addEventListener('click', (e) => {
        if(!once_click_on_map_flag) return;

        var params = {		
            format: 'jsonv2',
            lat: e.latlng.lat,
            lon: e.latlng.lng,			
		};        
        //поиск места по координатам
        let url = 'https://nominatim.openstreetmap.org/reverse'+ L.Util.getParamString(params);
        
        fetch(url)
        .then(res => res.json()).then(result => {            
            let name = result.name;
            let adress = `${result.address.city} ${result.address.road} ${result.address.house_number}`;

            let quest_div = create_quest_div_popup(name, adress);
            
            quest_marker = L.marker(e.latlng);
            quest_marker.addTo(mymap).bindPopup(quest_div).openPopup();            
            once_click_on_map_flag = false;

            let quest_yes_button = document.querySelector('.quest-yes-button');
            let quest_no_button = document.querySelector('.quest-no-button');
            quest_yes_button.addEventListener('click', () => {
                mymap.removeLayer(quest_marker);

                let newIcon = L.icon({
                    iconUrl: blueMarker,
                    iconSize: [50, 50],    
                });
                
                // console.log(event)
                // let index = event.srcElement[0].options.selectedIndex;
                // let currentCateg = event.srcElement[0].options[index].textContent;
                let currentCateg = modal_categories.options[modal_categories.selectedIndex].textContent;
                
                let a = fetch('https://localhost:44358/api/bottles', {
                    method: 'POST',
                    body: JSON.stringify({
                        lat: e.latlng.lat,
                        lng: e.latlng.lng,
                        title: modal_h.value,                
                        geoObjectName: name,
                        address: adress,
                        description: modal_description.value,
                        category: currentCateg,//
                        lifeTime: 10000//    
                    }),
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'            
                    }
                })
                    .then(res => res.json())
                    .then(res => {

                        if(!bottleIdOnMap.includes(res.id)) {
                            new Bottle(res.id, currentCateg, e.latlng, newIcon, name, adress, modal_h.value, modal_description.value);
                            bottleIdOnMap.push(res.id);
                            bottleDataOnMap.push(res)
                        }

                        modal_h.value = "";
                        modal_description.value = "";

                        once_click_on_map_flag = false;

                        create_modal_window_button.style.visibility = "visible";
                        profileButton.style.visibility = "visible";
                        chatButton.style.visibility = "visible";

                        back_button.style.display = "none";

                        userImageList.innerHTML = "";
                        addUserImageInput.value = '';

                        modal_categories.selectedIndex = 0;
                    })
            })

            quest_no_button.addEventListener('click', () => {
                mymap.removeLayer(quest_marker);
                once_click_on_map_flag = true;                
            })
        })
    });
})

class Bottle {    
    constructor(id,category, latlng, icon, name, adress, title, description, focusOnBottle=true) {        
        this.id = id;
        this.category = category;
        this.latlng = latlng;
        this.icon = icon;
        this.name = name;
        this.adress = adress;
        this.div = this._createDiv(name, adress, title, description);

        if(focusOnBottle)
            this.markerBottle = L.marker(latlng, {icon: icon}).addTo(mymap).bindPopup(this.div).openPopup();
        else this.markerBottle = L.marker(latlng, {icon: icon}).addTo(mymap).bindPopup(this.div);
        if(markerDataOnMap.get(this.id) == undefined)
            markerDataOnMap.set(this.id, this.markerBottle);        
    }

    _createDiv(name, adress, title, description) {
        let div = document.createElement('div');
        div.classList = 'marker-info';
    
        let h = document.createElement('h2');
        h.classList = 'marker-info-h2';
        div.appendChild(h);
    
        let p = document.createElement('p');
        p.classList = 'marker-info-street';
        div.appendChild(p);

        let textarea = document.createElement('textarea');
        textarea.classList = 'marker-info-field-des';
        textarea.setAttribute('readonly', 'readonly');
        div.appendChild(textarea);
        
        let listDiv = document.createElement('div');
        listDiv.classList = 'modal-window-user-image-list-popup';
        div.appendChild(listDiv);

        let btn = document.createElement('button');
        btn.classList = 'marker-info-button';
        div.appendChild(btn);
        

        h.textContent = title;
        p.textContent = check_name_adress(name, adress);
        textarea.textContent = description;

        let data = userImageList.cloneNode(true);        
        data.childNodes.forEach(element => {                
            element.childNodes.forEach(e => {
                if(e.nodeName == 'BUTTON') {
                    e.remove();
                }
            })            
        });
        
        listDiv.appendChild(data);
        btn.textContent = 'К диалогу';

        btn.addEventListener('click', () => {
            fetch(`https://localhost:44358/api/bottles/${this.id}/pick-up`, {//запретить подбирать бутылку самому себе
                method: 'POST',
                credentials: 'include',
                body: this.id,
                headers: { 'Content-Type': 'application/json' }
            }).then(res => res.json())
                .then(res => console.log(res))
        })
    
        return div;
    }

    removeMarker() {        
        mymap.removeLayer(this.markerBottle);
        console.log(`bottle id=${this.id}, name=${this.name}, adress=${this.adress} has been removed`);
    }
}

function create_quest_div_popup(name, adress) {
    let quest_div = document.createElement('div');
    quest_div.classList = 'quest-window';

    let quest_p = document.createElement('p');
    quest_p.classList = 'quest-text';
    quest_p.textContent = `Хотите тут создать бутылочку? (${check_name_adress(name, adress)})`;

    let quest_yes_button = document.createElement('button');
    quest_yes_button.classList = 'quest-yes-button';
    quest_yes_button.textContent = "Да";

    let quest_no_button = document.createElement('button');
    quest_no_button.classList = 'quest-no-button';
    quest_no_button.textContent = "Нет";

    quest_div.appendChild(quest_p);
    quest_div.appendChild(quest_yes_button);
    quest_div.appendChild(quest_no_button);

    return quest_div;    
}

function check_name_adress(name, adress) {
    let adress_parts = adress.split(' ').filter(x => x != 'undefined' && x != 'null').join(' ');
    return name && adress ? `${name}, ${adress_parts}` : !name && adress ? adress_parts : name && !adress ? name : "";
}


addUserImageInput = document.querySelector('.modal-user-input-image');

//обработка файлов из модалки создания бутылки
addUserImageInput.addEventListener('change', (evt) => {
    // divUserImage.style.display = 'block';
    let files = evt.target.files; // FileList object

    // Loop through the FileList and render image files as thumbnails.
    for (let i = 0, f; f = files[i]; i++) {

      // Only process image files.
    //   if (!f.type.match('image.*')) {
    //     continue;
    //   }

      let reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
          // Render thumbnail.
            let span = document.createElement('span');
            if (f.type.match('image.*')) {                
                span.innerHTML = ['<img class="user-image" src="', e.target.result,
                                    '" title="', escape(theFile.name), '"/>'].join('');               
            } else {                
                let div = document.createElement('div');
                span.appendChild(div);
                let img = document.createElement('img');
                img.classList = 'user-image';
                img.src = docIcon;
                div.appendChild(img);
            }

            document.querySelector('.modal-user-image-list').insertBefore(span, null);
            let p = document.createElement('p');
        
            if(theFile.name.length > 10)
                p.textContent = theFile.name.substring(0,10)+'...';
            else p.textContent = theFile.name;
            span.appendChild(p)

            let btn = document.createElement('button');
            btn.classList = 'modal-user-image-delete-button';
            btn.type = 'button';
            
            span.appendChild(btn);
            btn.addEventListener('click', () => {
                userImageList.removeChild(span)
            })
            console.log(theFile)
        };
      })(f);

      // Read in the image file as a data URL.
      reader.readAsDataURL(f);
    }
}, false)



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////это уже не надо трогать/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let fuckApi = {
    "nickname": "fuck",
    "password": "string",
    "email": "fuck",
    "sex": "string",
    "commercialData": {
      "fullName": "string",
      "company": "string",
      "identificationNumber": "string",
      "psrn": "string"
    }
  }

let fuckApi2 = {
    nickname: "fuck",
    password: "string",
    email: "fuck",
    sex: "string",
    commercialData: {
        fullName: "string",
        company: "string",
        identificationNumber: "string",
        psrn: "string"
    }
}

let logFuckApi2 = {
    nickname: "fuck",
    email: "fuck",
    password: "string",
}

let fuckApi3 = {
    nickname: "fuck3",
    password: "string",
    email: "fuck3",
    sex: "string",
    commercialData: {
        fullName: "string",
        company: "string",
        identificationNumber: "string",
        psrn: "string"
    }
}

let logFuckApi3 = {
    nickname: "fuck3",
    email: "fuck3",
    password: "string",
}


//#region 
// let obj = {
//     "fullName": "string",
//     "company": "string",
//     "identificationNumber": "string",
//     "psrn": "string"
//   };

// let fuck2 = new FormData();
// fuck2.append('Nickname', 'fuck11');
// fuck2.append('Email', 'fuckYouu');
// fuck2.append('password', '1111');
// fuck2.append('sex', 'вертолет');
// fuck2.append('commercialData.fullname', 'jjj');
// fuck2.append('commercialData.company', 'jjj');
// fuck2.append('commercialData.identificationNumber', 'jjj');
// fuck2.append('commercialData.psrn', 'jjj');

// let fuck3 = new FormData();
// fuck3.append('Nickname', 'fuck11');
// fuck3.append('Email', 'fuckYouu');
// fuck3.append('password', '1111');
//#endregion

//вход в акк, временно на кнопке чата, чтобы зарегаться - убрать login
chatButton.addEventListener('click', () => {
    console.log('click')
    // fetch('https://localhost:44358/api/account/login', {
    //     method: 'POST',        
    //     body: JSON.stringify(logFuckApi3),
    //     credentials: 'include',
    //     headers: {
    //         'Content-Type': 'application/json'
    //         //#region 
    //         // 'Access-Control-Allow-Origin': '*',
    //         // "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
    //         // "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",            
    //         // 'Content-Type': 'multipart/form-data'
    //         //#endregion
    //       }
    // })
    // .then(res => res.json())
    // .then(res => {
    //     console.log(res)
    // })

    fetch('https://localhost:44358/api/account', {
        // method: 'POST',        
        // body: JSON.stringify(fuckApi3),
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
          }
    })
    .then(res => res.json())
    .then(res => {
        console.log(res)
    })
})


    



