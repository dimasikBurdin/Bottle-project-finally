import { mymap } from '../../MainPage';
import { GeoCoder } from '../customGeocoder';

let searchFormInput = document.querySelector('.search-form');
let inputField = document.querySelector('.search-field');
let markerSearch;
 
export function searchAddress() {
    searchFormInput.addEventListener('submit', (e) => {
        e.preventDefault();
    
        if(markerSearch)
            mymap.removeLayer(markerSearch);
        
        let geoCoder = new GeoCoder(inputField.value);
        geoCoder._geocode(e).then(results => {
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
                    
            markerSearch = L.marker(new L.LatLng(lat, lon));
            markerSearch.addTo(mymap);
        })
        // submit_button.click();
    })
    
    mymap.addEventListener('click', () => {
        if(markerSearch)
            mymap.removeLayer(markerSearch);
    })
}

