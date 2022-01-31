import "./stylesheet.css";
import "./pages/registration/style_reg.css";
import "./pages/entrance/style.css";
import "./pages/create_profile/style_prof.css";
import '../../connections/hystModal/hystmodal.min';
import '../../connections/hystModal/hystmodal.min.css';
import { createCommModal } from './pages/registration/comercReg/modalCommercReg';
import screenmap from "../../../dist/img/screenmap.jpg";
import newScreen from '../../../dist/img/screenmapNew.jpg'
import logo from "../../../dist/img/logo.svg";
import defaultAvatar from '../../../dist/img/defaultAvatarNormalPNG.png';
// import { corsImport } from "webpack-external-import";

// corsImport('https://apis.google.com/js/platform.js').then();

const createProfileModal = new HystModal({
    linkAttributeName: "data-hystmodal",
    //настройки, см. API
});

createCommModal();

const nickname = document.getElementById('nickname');
const email = document.getElementById('reg-email');
const password = document.getElementById('reg-password');
const secondPassword = document.getElementById('reg-password-two');

const emailCompany = document.querySelector('.modal-com-reg-login-inField');
const passwordCompany = document.querySelector('.modal-com-reg-pass-inField');

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
let customAvatarButton = document.querySelector('.file-lable-input');
let avatar;

fetch(defaultAvatar).then(res => res.blob().then(x => avatar = x));

customAvatarButton.addEventListener('change', (e) => {
    avatar = e.target.files[0];
});

document.querySelector('.main-content_pic').innerHTML = `<img src=${newScreen} alt="screenmap" class="main-content-picture" />`;
document.querySelector('.page-logo').innerHTML = `<img src=${logo} alt="логотип" class="logo">`;
(function registerModal() {
    document.querySelector('.button-register').addEventListener('click', () => {
        document.querySelector('.validation-reg').textContent = '';
    });

    document.getElementById('reg-submit').addEventListener('click', () => {
        const emailIsValid = emailRegex.test(email.value);
        if (password.value !== secondPassword.value 
            | !emailIsValid | password.value === '' 
            | secondPassword.value === '') {
            setTimeout(() => {
                document.querySelector('.hystmodal__close').click();
                document.querySelector('.button-register').click();
                checkRegisterData(password.value, secondPassword.value, email.value);
            }, 0);
        }
    });

    function checkRegisterData(pass, secondPass, login) {
        const emailIsValid = emailRegex.test(login);
        let result = 'Некорректные данные';
        if (pass== '' && secondPass === '')
            result = 'Напишите пароль';
        if (pass != secondPass && emailIsValid) 
            result = 'Пароли не совпадают';
        if (!emailIsValid && pass === secondPass) 
            result = 'Некорректный email';
        document.querySelector('.validation-reg').textContent = result;
    }
})();

(function profileModal() {
    let gender;
    document.querySelector('.gender-man').addEventListener('click', () => gender = 'male');
    document.querySelector('.gender-women').addEventListener('click', () => gender = 'female');
    document.getElementById('reg-submit').addEventListener('click', () => {
        document.querySelector('.validation-prof').textContent = '';
    });
    document.getElementById('create-prof-submit').addEventListener('click', () => {
        const request = { 
            nickname: nickname.value,
            password: password.value || passwordCompany.value,
            email: email.value || emailCompany.value,
            sex: gender,
            commercialData: getCommercialData()
        };
        console.log(request);
        console.log('click');
        fetch('https://localhost:44358/api/account', {
            method: 'POST',        
            body: JSON.stringify(request),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            if(!res.ok) {
                res.text().then(text => {
                    document.querySelector('.validation-prof').textContent = text;
                });
            }
            else {
                let data = new FormData();
                data.append('file', avatar);
                fetch('https://localhost:44358/api/account/avatar', {
                    method: 'POST',
                    body: data,
                    credentials: 'include',      
                }).then(res => {                    
                    document.querySelector('.hystmodal__close').click();
                    document.location='./MainPage.html';
                    return res.json();
                });
            }    
        })
        .then(res => console.log(res));        
    });
})();

(function entranceModal() {
    document.querySelector('.button-entry').addEventListener('click', () => {
        document.querySelector('.validation-entr').textContent = '';
    });

    document.getElementById('entr-submit').addEventListener('click', () => {
        console.log('click');
        const email = document.getElementById('entr-email');
        const password = document.getElementById('entr-password');
        const request = {
            email: email.value,
            password: password.value
        };
        
        fetch('https://localhost:44358/api/account/login', {
            method: 'POST',        
            body: JSON.stringify(request),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            console.log(res.json);
            if(!res.ok) {
                res.text().then(text => {
                    document.querySelector('.validation-entr').textContent = text;
                });
            }
            else {
                document.querySelector('.hystmodal__close').click();
                document.location='./MainPage.html';
                return res.json();
            } 
        })
        .then(res => {
            console.log(res);
        });
    });
})();


function getCommercialData(){
    const nameCompany = document.querySelector('.modal-com-reg-infoCompany-input-name');
    const personCompany = document.querySelector('.modal-com-reg-infoCompany-input-person');
    const emailCompany = document.querySelector('.modal-com-reg-infoCompany-input-email');
    const phoneCompany = document.querySelector('.modal-com-reg-infoCompany-input-phone');
    const innCompany = document.querySelector('.modal-com-reg-infoCompany-input-inn');
    const ogrnCompany = document.querySelector('.modal-com-reg-infoCompany-input-ogrn');

    const result = {
        fullName: nameCompany.value,
        contactPerson: personCompany.value,
        email: emailCompany.value,
        phoneNumber: phoneCompany.value,
        identificationNumber: innCompany.value,
        psrn: ogrnCompany.value
    };
    console.log(result);
    if (result.fullName && result.contactPerson && result.email &&
        result.phoneNumber && result.identificationNumber && result.psrn) {
        return result;
    } else {
        return null;
    }
}


(function googleRegistration(){
    const google = document.getElementById('google-reg');
    const request = {};
    let email;
    let avatar;
    function sign() {
        const auth2 = gapi.auth2.getAuthInstance();
        auth2.signIn().then(function (user) {
            const profile = user.getBasicProfile();
            fetch('https://localhost:44358/api/account/external-providers')
                .then(r => r.json())
                .then(data => data.Google)
                .then(id => {
                    request.externalLogin = {
                            provider: id,
                            providerId: profile.getId(),
                            accessToken: user.vc.access_token,
                            rememberMe: true
                        };
                    email = profile.getEmail();
                    avatar = profile.getImageUrl();
                    request.nickname = profile.getEmail().split('@')[0];
                    request.sex = 'ne bilo';
                    console.log(request);
                    register(profile, request);
                });

        });
    }

    google.addEventListener('click', () => {
        sign();
    });


    function register(profile, request) {
        fetch('https://localhost:44358/api/account/external-register', {
            method: 'POST',        
            body: JSON.stringify(request),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(r => r.json())
        .then(d => console.log(d))
        .then(() => {
        
        })
        .then(() => document.location='./MainPage.html');       
    }
})();


(function googleEntrance(){
    const google = document.getElementById('google-ent');

    google.addEventListener('click', () => {
        sign();
    });

    function sign() {
        const auth2 = gapi.auth2.getAuthInstance();
        auth2.signIn().then(function (user) {
            const profile = user.getBasicProfile();
            fetch('https://localhost:44358/api/account/external-providers')
                .then(r => r.json())
                .then(data => data.Google)
                .then(id => {
                    console.log(id);
                    executeEntrance(user, id);
                });
        });
    }
    
    function executeEntrance(user, id) {
        fetch('https://localhost:44358/api/account/external-login', {
            method: 'POST',        
            body: JSON.stringify({
                provider: id,
                providerId: user.getBasicProfile().getId(),
                accessToken: user.vc.access_token,
                rememberMe: true
            }),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(r => {
            if (r.ok) {
                // setAvatar();
                document.location='./MainPage.html';
            }
        });
    }

    // function setAvatar(){

    // }
            
})();

import pageIcon from '../../../dist/img/marker_siniy.svg';

let headImage = document.querySelector('head');
let link = document.createElement('link');
link.rel = 'icon';
link.type = 'image/svg';
link.href = pageIcon;
headImage.appendChild(link);