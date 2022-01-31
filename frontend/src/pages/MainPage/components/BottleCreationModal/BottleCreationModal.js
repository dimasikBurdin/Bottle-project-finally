// import '../../../../../hystmodal.min.css';
// import '../../../../../hystmodal.min';
import '../../../../connections/hystModal/hystmodal.min.css'
import '/hystmodal.min'
import './BottleCreationModal.css';
import { Bottle } from '../Bottle/Bottle';
import { mymap } from '../../MainPage';
import { bottleIdOnMap } from '../../MainPage';
import { bottleDataOnMap } from '../../MainPage';
import { checkNameAdress } from '../../helpers';
import blueMarker from '../../../../../dist/img/marker_siniy.svg';
import yellowMarker from '../../../../../dist/img/marker_zhelty.svg';
import docIcon from '../../../../../dist/img/faylikonka.svg';
import { currentUser } from '../../MainPage';

export {
    CreatioBottlenModal as CreationBottlenModal
}

class CreatioBottlenModal {
    static _userImageList;
    constructor() {
        this.myModal = new HystModal({
            linkAttributeName: "data-hystmodal",
            //settings (optional). see Configuration
        });

        this.modalWindow = document.querySelector('.modal-window');
        this.modalH = document.querySelector('.modal-h');
        this.modalCategories = document.querySelector('.modal-categories');
        this.modalDescription = document.querySelector('.modal-description');
        this.lifeTime = document.querySelector('.modal-time');
        this.pickedCount = document.querySelector('.modal-pick-count');
        this.createModalWindowButton = document.querySelector('.new-bottle');
        this.profileButton = document.querySelector('.profile');
        this.chatButton = document.querySelector('.chat');
        CreatioBottlenModal._userImageList = document.querySelector('.modal-user-image-list');
        this._userImageList = CreatioBottlenModal._userImageList;
        this.addUserImageInput = document.querySelector('.modal-user-input-image');
        this.backButton = document.querySelector('.back-to-not-create');

        this._createModalLogic();
        this._closePopups();
        this._addFilesOnPopup();
    }
   
    static getUserImageList() {
        return CreatioBottlenModal._userImageList;
    }

    _createModalLogic() {
        this.modalWindow.addEventListener('submit', (event) => {
            event.preventDefault();            

            this._setVisibilityButtons('hidden');
            this.myModal.close();

            let questMarker;
            let onceClickOnMapFlag = true;            
        
            this.backButton.addEventListener('click', () => {
                onceClickOnMapFlag = false;
                this._setDefaultValues();
                this._setVisibilityButtons('visible');
                if(questMarker) mymap.removeLayer(questMarker);
            })
        
            mymap.addEventListener('click', (e) => {
                if(!onceClickOnMapFlag) return;
        
                let params = {		
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
        
                    let questDiv = this._create_quest_div_popup(name, adress);
                    
                    questMarker = L.marker(e.latlng);
                    questMarker.addTo(mymap).bindPopup(questDiv).openPopup();            
                    onceClickOnMapFlag = false;
        
                    let questYesButton = document.querySelector('.quest-yes-button');
                    let questNoButton = document.querySelector('.quest-no-button');

                    questYesButton.addEventListener('click', () => {
                        mymap.removeLayer(questMarker);
        
                        let newIcon = L.icon({
                            iconUrl: blueMarker,
                            iconSize: [50, 50],    
                        });
        
                        let currentCateg = this.modalCategories.options[this.modalCategories.selectedIndex].textContent;
                        let currentLifeTime = this.lifeTime.value * 3600;
                        let currentPickCount = this.pickedCount.value;
                        
                        if(!currentUser.commercialData) {
                            fetch('https://localhost:44358/api/bottles', {
                            method: 'POST',
                            body: JSON.stringify({
                                lat: e.latlng.lat,
                                lng: e.latlng.lng,
                                title: this.modalH.value,                
                                geoObjectName: name,
                                address: adress,
                                description: this.modalDescription.value,
                                category: currentCateg,
                                lifeTime: currentLifeTime
                            }),
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json'            
                            }
                        })
                            .then(res => res.json())
                            .then(res => {
        
                                if(!bottleIdOnMap.includes(res.id)) {
                                    new Bottle(res.id, currentCateg, e.latlng, newIcon, name, adress, this.modalH.value, this.modalDescription.value, currentUser.id);
                                    bottleIdOnMap.push(res.id);
                                    bottleDataOnMap.push(res);
                                }

                                onceClickOnMapFlag = false;
                                
                                this._setDefaultValues();
                                this._setVisibilityButtons('visible');
                            })
                        } else {
                            fetch('https://localhost:44358/api/bottles', {
                            method: 'POST',
                            body: JSON.stringify({
                                lat: e.latlng.lat,
                                lng: e.latlng.lng,
                                title: this.modalH.value,                
                                geoObjectName: name,
                                address: adress,
                                description: this.modalDescription.value,
                                category: currentCateg,
                                lifeTime: currentLifeTime,
                                maxPickingUp: currentPickCount
                            }),
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json'            
                            }
                        })
                            .then(res => res.json())
                            .then(res => {
        
                                if(!bottleIdOnMap.includes(res.id)) {
                                    new Bottle(res.id, currentCateg, e.latlng, newIcon, name, adress, this.modalH.value, this.modalDescription.value, currentUser.id);
                                    bottleIdOnMap.push(res.id);
                                    bottleDataOnMap.push(res);
                                }

                                onceClickOnMapFlag = false;
                                
                                this._setDefaultValues();
                                this._setVisibilityButtons('visible');
                            })
                        }

                        
                    })
        
                    questNoButton.addEventListener('click', () => {
                        mymap.removeLayer(questMarker);
                        onceClickOnMapFlag = true;                
                    })
                })
            });
        })
    }

    _setDefaultValues() {
        this.modalH.value = "";
        this.modalDescription.value = "";
        CreatioBottlenModal._userImageList.innerHTML = "";
        this.addUserImageInput.value = '';
        this.modalCategories.selectedIndex = 0;
    }

    _setVisibilityButtons(typeVisible) {
        this.createModalWindowButton.style.visibility = typeVisible;
        this.profileButton.style.visibility = typeVisible;
        this.chatButton.style.visibility = typeVisible;
        if(typeVisible == 'visible')
            this.backButton.style.display = "none";
        else this.backButton.style.display = "block";
    }

    _create_quest_div_popup(name, adress) {
        let quest_div = document.createElement('div');
        quest_div.classList = 'quest-window';
        
        let pDiv = document.createElement('div');
        pDiv.classList.add('div-quest-text');
        let quest_p = document.createElement('p');
        quest_p.classList = 'quest-text';
        quest_p.textContent = `Хотите тут создать бутылочку? (${checkNameAdress(name, adress)})`;
        pDiv.append(quest_p)
        
        let divButtons = document.createElement('div');
        divButtons.classList.add('quset-window-buttons');

        let quest_yes_button = document.createElement('button');
        quest_yes_button.classList = 'quest-yes-button';
        // quest_yes_button.textContent = "Да";
    
        let quest_no_button = document.createElement('button');
        quest_no_button.classList = 'quest-no-button';
        // quest_no_button.textContent = "Нет";

        divButtons.append(quest_yes_button);
        divButtons.append(quest_no_button);
    
        quest_div.appendChild(pDiv);
        quest_div.appendChild(divButtons);
    
        return quest_div;    
    }

    _closePopups() {
        this.createModalWindowButton.addEventListener('click', () => {
            mymap.closePopup();
            console.log(currentUser)
            if(!currentUser.commercialData) {
                document.querySelector('.modal-time').max = 24;
                document.querySelector('.modal-pick-count-area').style.display = 'none';
            } else {
                document.querySelector('.modal-time').max = 48;
                document.querySelector('.modal-pick-count-area').style.display = 'default';
            }
        })
    }

    _addFilesOnPopup() {
        this.addUserImageInput.addEventListener('change', (evt) => {
            // divUserImage.style.display = 'block';
            let files = evt.target.files; // FileList object
        
            // Loop through the FileList and render image files as thumbnails.
            for (let i = 0, f; f = files[i]; i++) {
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
                        CreatioBottlenModal._userImageList.removeChild(span)
                    })
                    console.log(theFile)
                };
              })(f);
        
              // Read in the image file as a data URL.
              reader.readAsDataURL(f);
            }
        }, false)
    }
}