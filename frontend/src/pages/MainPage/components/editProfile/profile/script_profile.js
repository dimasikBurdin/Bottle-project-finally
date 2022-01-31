import '../../../../../connections/hystModal/hystmodal.min'
import '../../../../../connections/hystModal/hystmodal.min.css'
import './style_profile.css'
import Chart from 'chart.js/auto';

export function createAndUpdateProfile() {
  profileInfo();
  initProfileAvatar();
  getProfileData();
  updateAvatar();  
}

function profileInfo() {
  const myModal = new HystModal({
    linkAttributeName: "data-hystmodal",
    // настройки (не обязательно), см. API
  });
  fetch('https://localhost:44358/api/account', {
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json'            
    }
  }).then(res => res.json()).then(res => {
    // let labels = [];    
    let valuesData = [];
    let dataDict = res.rating.dict;
    let averageRating = res.rating.value;
    Object.entries(dataDict).forEach(([key, value]) => {
      // labels.push(key);
      valuesData.push(value);
    })
    let labels = ['😫','🙁','😶', '🙃', '😎'];//кек
    let ctx = document.getElementById("myChart").getContext("2d");
    let data = {
        labels: labels,        
        datasets: [
          {
            data: valuesData,        
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#ff8800",
              "#8800ff"
            ],        
          }]
      };
    
    let chart = new Chart(ctx, {
        type: 'doughnut',
        data: data,    
        options: {
          responsive: false,
          plugins: {
            legend: {
              display: false
            }
          }
        },
        plugins: [{
          beforeDraw: ()=> {
            let width = chart.width,
                height = chart.height,
                ctx = chart.ctx,
                type = chart.config.type;
            
            if (type == 'doughnut')
            {               
              let oldFill = ctx.fillStyle;
              let fontSize = ((height - chart.chartArea.top) / 100).toFixed(2);
              
              ctx.restore();
              ctx.font = fontSize + "em sans-serif";
              ctx.textBaseline = "middle"
        
              let text = averageRating.toFixed(1),
                  textX = Math.round((width - ctx.measureText(text).width) / 2),
                  textY = (height + chart.chartArea.top) / 2;
              ctx.fillStyle = chart.config.data.datasets[0].backgroundColor[0];
              ctx.fillText(text, textX, textY);
              ctx.fillStyle = oldFill;
              ctx.save();          
            }    
          }
        }],    
    })
  })

  document.querySelector('.profile-logout').addEventListener('click', () => {
      
      fetch('https://localhost:44358/api/account/logout', {
        method: 'POST',
        credentials: 'include',      
      }).then(res => {
        myModal.close();
        document.location = './index.html';
      })
    })
}

function initProfileAvatar() {
  fetch('https://localhost:44358/api/account/avatar', {
      credentials: 'include',      
    }).then(res => res.blob().then(blobData => {
      let fr = new FileReader();
      fr.readAsDataURL(blobData);
      fr.onload = function() {
        let profileButton = document.querySelector('.profile');
        profileButton.style.background = `url(${fr.result}) 50% 50% no-repeat`;
        profileButton.style.backgroundSize = `80px 80px`; 
        
        let avatarInProfile = document.querySelector('.photo');
        avatarInProfile.style.background = `url(${fr.result}) 50% 50% no-repeat`;
        avatarInProfile.style.backgroundSize = `100px 100px`;
      }
    }))
}


function getProfileData() {
  let currentNickName = document.querySelector('.modal-editProfile-nickname');
  let currentEmail = document.querySelector('.modal-editProfile-email');
  fetch('https://localhost:44358/api/account', {
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json'            
    }
  }).then(res => res.json())
    .then(res => {
    currentNickName.textContent = res.nickname;
    if (res.email != null) {
      currentEmail.textContent = res.email;
    } else {
      currentEmail.remove();
      document.getElementById('title-email').remove();
    }
  })
}

function updateAvatar() {
  let changeAvatarButton = document.querySelector('.modal-editProfile-load-image');
  changeAvatarButton.addEventListener('change', (e) => {
    let file = e.target.files[0];
  
    let data = new FormData();
    data.append('file', file)
    fetch('https://localhost:44358/api/account/avatar', {
      method: 'POST',
      body: data,
      credentials: 'include',      
    }).then(res => {
      let fr = new FileReader();
      fr.readAsDataURL(file)
      fr.onload = function(event) {
        let profileButton = document.querySelector('.profile');
        profileButton.style.background = `url(${event.target.result}) 50% 50% no-repeat`;
        profileButton.style.backgroundSize = `80px 80px`;

        let avatarInProfile = document.querySelector('.photo');
        avatarInProfile.style.background = `url(${event.target.result}) 50% 50% no-repeat`;
        avatarInProfile.style.backgroundSize = `100px 100px`;
      }    
    })
  })
}