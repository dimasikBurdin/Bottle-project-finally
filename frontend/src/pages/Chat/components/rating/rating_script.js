import '../../../../connections/hystModal/hystmodal.min';
import '../../../../connections/hystModal/hystmodal.min.css';
import './rating_style.css';

import { dialoguesContainer } from '../../dialogues';
import { getAllMessageInDialog } from '../../chat';
import { getDialogues } from '../../dialogues';

let myModal = new HystModal({
    linkAttributeName: "data-hystmodal",
    // настройки (не обязательно), см. API
});

let ratingButtons = document.querySelectorAll('.emoji');

const messageContainer = document.getElementById('message-container');
let topPanel = document.querySelector('.top-panel');
let messageInput = document.getElementById('message-input');

export function sendRate(dialogId, partnerId) {
    fetch(`https://localhost:44358/api/user/${partnerId}`, {                 
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json()).then(partnerData => {
        myModal.open('#endChatRatingPartner');    
        document.querySelector('.rating-modal-title').textContent = `Оцените адекватность ${partnerData.nickname}`
        for(let button of ratingButtons) {
            let eventFunc = function eventClickFunc(e) {
                console.log(dialogId);            
                fetch(`https://localhost:44358/api/dialogs/${dialogId}/rating`, { 
                    method: 'POST',        
                    credentials: 'include',
                    body: button.value,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(res => {
                    myModal.close();

                    dialoguesContainer.textContent = '';
                    messageContainer.textContent = '';
                    getDialogues().then(() => getAllMessageInDialog());
                    messageInput.disabled = true;
                    topPanel.textContent = '';

                    for(let element of ratingButtons) {
                        console.log(element.eventData, 'delete eventFunc')
                        element.removeEventListener('click', element.eventData);
                    }
                })
            }

            button.eventData = eventFunc;
            button.addEventListener('click', eventFunc);
        }
    })
}