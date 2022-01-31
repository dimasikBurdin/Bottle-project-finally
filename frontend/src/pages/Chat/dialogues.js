// const dialoguesContainer = document.getElementById('dialogues');
const dialoguesContainer = document.querySelector('.ul-list-dialog');
const topPanelContainer = document.getElementById('top-panel')
const messageContainer = document.getElementById('message-container')

export {
    getDialogues,
    dialoguesContainer
}

let currentAvatar;

async function getDialogues() {
    await fetch(`https://localhost:44358/api/dialogs`, {   
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json()).then(async dialogsData => {
        console.log(dialogsData)        
        dialogsData = dialogsData.reverse()
        await getCurrentUserId().then(async res => {
            let currentUserId = res.id;  
            for(let dialogData of dialogsData) {
                // if(!dialogData.active) continue;//

                let idPartner;//id собеседника
                if(currentUserId == dialogData.bottleOwnerId) {
                    idPartner = dialogData.recipientId;
                } else {
                    idPartner = dialogData.bottleOwnerId;
                }
                // console.log('current id', currentUserId, ' partner id ', idPartner)
                await fetch(`https://localhost:44358/api/user/${idPartner}`, {   
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(res => res.json())
                .then(res => {
                    let namePartner = res.nickname;//
                    ShowDialog(namePartner, idPartner, dialogData, dialogData.active)
                })
            }
        });
    })
}

async function getCurrentUserId() {
    return await fetch('https://localhost:44358/api/account', {    
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json())
}


function ShowDialog (namePartner, idPartner, dialogData, active) {
    let li = document.createElement('li');
    li.className = 'li-list-dialog'
    const oneDialogueBlock = document.createElement('button');
    oneDialogueBlock.classList.add("dialogue-block");
    if(!active) {
        oneDialogueBlock.classList.add("disabled-dialog");
    }
    // oneDialogueBlock.innerText = NamePartner;
    oneDialogueBlock.type = 'button';
    oneDialogueBlock.data = {
        chatId: dialogData.id,
        partnerId: idPartner,
        active: active
    } 
    oneDialogueBlock.onclick = function(){
        GetOneDialogue(namePartner, idPartner, active, dialogData.id);
        console.log(dialogData)
    }

    let infoFileds = document.createElement('div');
    infoFileds.classList.add('dialog-prev-nameAndLastMess')

    let pName = document.createElement('p');
    pName.className = 'dialog-button-name';
    pName.textContent = namePartner;

    let plastMess = document.createElement('p');
    plastMess.className = 'dialog-button-last-mess';

    if(dialogData.lastMessage) {
        if(dialogData.lastMessage.value.length > 10) {
            plastMess.textContent = `${dialogData.lastMessage.value.substring(0, 10)}...`;    
        } else {
            plastMess.textContent = dialogData.lastMessage.value;
        }    
    }

    infoFileds.append(pName);
    infoFileds.append(plastMess);

    let avatarFileds = document.createElement('div');
    avatarFileds.classList.add('dialog-avatar-image-area');

    let avatarImage = document.createElement('img');
    avatarImage.className = 'dialog-avatar-image';
    getAvatar(idPartner).then(blobData => {
        let fr = new FileReader();
        fr.readAsDataURL(blobData);
        fr.onload = function() {
            currentAvatar = fr.result;
            avatarImage.src = currentAvatar;
        }
    })  
    // avatarImage.src = currentAvatar;
    avatarFileds.append(avatarImage);            

    let prevDialogInfo = document.createElement('div');
    prevDialogInfo.classList.add('previewDialogInfo');

    prevDialogInfo.append(avatarFileds);
    prevDialogInfo.append(infoFileds)
    oneDialogueBlock.append(prevDialogInfo);

    li.append(oneDialogueBlock)
    dialoguesContainer.append(li)
}

async function getAvatar(id) {
    return await fetch(`https://localhost:44358/api/user/${id}/avatar`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.blob())
}

function GetOneDialogue(name, idPartner, active, chatId) {//отображение инфы на верхней панели
    topPanelContainer.innerHTML = "";
    messageContainer.innerHTML = "";

    let topPanelInfo = document.createElement('div');
    topPanelInfo.classList.add('topPanel-info');

    let avatarFileds = document.createElement('div');
    avatarFileds.classList.add('topPanel-avatar-image-area');
    let avatarImage = document.createElement('img');
    avatarImage.classList.add('topPanel-avatar-image');

    getAvatar(idPartner).then(blobData => {
        let fr = new FileReader();
        fr.readAsDataURL(blobData);
        fr.onload = function() {
            currentAvatar = fr.result;
            avatarImage.src = currentAvatar;
        }
    })
    // avatarImage.src = currentAvatar;
    avatarFileds.append(avatarImage);
    

    let openedDialogue = document.createElement('div');
    openedDialogue.innerText = name;
    openedDialogue.className = "opened-dialogue";

    topPanelInfo.append(avatarFileds)
    topPanelInfo.append(openedDialogue)    
    // topPanelContainer.append(openedDialogue);
    topPanelContainer.append(topPanelInfo);

    if(!active) {
        let ratePartnerArea = document.createElement('div'); 
        ratePartnerArea.classList.add('rate-partner-area');
        let ratePartnerButton = document.createElement('button');
        ratePartnerButton.classList.add('rate-partner-button');
        ratePartnerButton.textContent = 'Оценить собеседника';
        ratePartnerButton.data = {
            chatId: chatId
        }
        ratePartnerArea.append(ratePartnerButton);
        topPanelContainer.append(ratePartnerArea);
    }
}