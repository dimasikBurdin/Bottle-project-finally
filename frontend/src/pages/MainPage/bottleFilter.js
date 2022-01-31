import { bottleDataOnMap, markerDataOnMap, mymap } from './MainPage';

export function bottleFilterOnMap() {
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
}

function bottleFilter(filter=null) {
    for(let e of bottleDataOnMap) {
        if(e.category != filter && filter != null){
            mymap.removeLayer(markerDataOnMap.get(e.id))
        } else {
            mymap.addLayer(markerDataOnMap.get(e.id))
        }
    }
}

