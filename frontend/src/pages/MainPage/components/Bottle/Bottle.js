import './Bottle.css';
import { checkNameAdress } from '../../helpers'
import { markerDataOnMap, mymap } from '../../MainPage';
import { CreationBottlenModal } from '../BottleCreationModal/BottleCreationModal'
import { currentUser } from '../../MainPage';

export{
    Bottle
}

class Bottle {    
    constructor(id,category, latlng, icon, name, adress, title, description, ownerId, focusOnBottle=true) {//время жизни 
        this.id = id;
        this.category = category;
        this.latlng = latlng;
        this.icon = icon;
        this.name = name;
        this.adress = adress;

        this.userImageList = CreationBottlenModal.getUserImageList();

        this.ownerId = ownerId;

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

        
        

        h.textContent = title;
        p.textContent = checkNameAdress(name, adress);
        textarea.textContent = description;

        let data = this.userImageList.cloneNode(true);        
        data.childNodes.forEach(element => {                
            element.childNodes.forEach(e => {
                if(e.nodeName == 'BUTTON') {
                    e.remove();
                }
            })            
        });
        
        listDiv.appendChild(data);

        fetch('https://localhost:44358/api/account', {    
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'            
        }
        }).then(res => res.json()).then(res => {
            let currentUserId = res.id;
            if(currentUserId != this.ownerId) {
                let btn = document.createElement('button');
                btn.classList = 'marker-info-button';
                div.appendChild(btn);
                btn.textContent = 'К диалогу';
        
                btn.addEventListener('click', () => {
                    fetch(`https://localhost:44358/api/bottles/${this.id}/pick-up`, {
                        method: 'POST',
                        credentials: 'include',
                        body: this.id,
                        headers: { 'Content-Type': 'application/json' }
                    }).then(res => res.json())
                    .then(res => {
                        console.log(res.dialogId);
                        localStorage.setItem('openDialog', res.dialogId);
                        document.location ='./ChatPage.html';
                    })
                    // document.location ='./ChatPage.html';
                })
            }
        })
        
        return div;
    }

    removeMarker() {        
        mymap.removeLayer(this.markerBottle);
        console.log(`bottle id=${this.id}, name=${this.name}, adress=${this.adress} has been removed`);
    }
}