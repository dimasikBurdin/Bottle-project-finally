console.log('testSuck')
document.querySelector('.rrr').addEventListener('click', () => console.log('FUUUUUUUUCK!'))

import Chart from 'chart.js/auto';
let ctx = document.getElementById("myChart").getContext("2d");
let data = {
    labels: [
      "1",
      "2",
      "3",
      "4",
      "5"
    ],
    
    datasets: [
      {
        data: [1, 2, 1, 1, 1],        
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
          let res = 0,
              count = 0;
          let labels = chart.config.data.labels;
          let values = chart.config.data.datasets[0].data;
          
          for(let i = 0; i < chart.config.data.datasets[0].data.length; i++) {
            res += values[i] * +labels[i];
            count += values[i];
          }

          res /= count;
          res = res.toFixed(1)      
          let oldFill = ctx.fillStyle;
          let fontSize = ((height - chart.chartArea.top) / 100).toFixed(2);
          
          ctx.restore();
          ctx.font = fontSize + "em sans-serif";
          ctx.textBaseline = "middle"
    
          let text = res,
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



// setInterval(() => {
//   chart.config.data.datasets[0].data[(Math.random()*4).toFixed(0)] = Math.random() * 100;
//   chart.update()  
// }, 1000);