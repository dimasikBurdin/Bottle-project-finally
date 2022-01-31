export {
    GeoCoder
}

class GeoCoder {
    constructor(data) {
        this._inputValue = data;
    }
    /* helper functions for cordinate extraction */
    _createSearchResult(lat, lon) {
        //creates an position description similar to the result of a Nominatim search
        var diff = 0.005;
        var result = [];
        result[0] = {};
        result[0]["boundingbox"] = [parseFloat(lat)-diff,parseFloat(lat)+diff,parseFloat(lon)-diff,parseFloat(lon)+diff];
        result[0]["class"]="boundary";
        result[0]["display_name"]="Position: "+lat+" "+lon;
        result[0]["lat"] = lat;
        result[0]["lon"] = lon;		
        return result;
    }
    _isLatLon(q) {
        //"lon lat" => xx.xxx x.xxxxx
        var re = /(-?\d+\.\d+)\s(-?\d+\.\d+)/;
        var m = re.exec(q);
        if (m != undefined) return m;		
        //lat...xx.xxx...lon...x.xxxxx
        re = /lat\D*(-?\d+\.\d+)\D*lon\D*(-?\d+\.\d+)/;
        m = re.exec(q);
        //showRegExpResult(m);		
        if (m != undefined) return m;
        else return null;
    }
    _isLatLon_decMin(q) {
        console.log("is LatLon?: "+q);
        //N 53° 13.785' E 010° 23.887'
        //re = /[NS]\s*(\d+)\D*(\d+\.\d+).?\s*[EW]\s*(\d+)\D*(\d+\.\d+)\D*/;
        let re = /([ns])\s*(\d+)\D*(\d+\.\d+).?\s*([ew])\s*(\d+)\D*(\d+\.\d+)/i;
        let m = re.exec(q.toLowerCase());
        //showRegExpResult(m);		
        if ((m != undefined)) return m;
        else return null;
        // +- dec min +- dec min
    }
    
    _geocode(event, add_event=false) {
        L.DomEvent.preventDefault(event);
        var q = this._inputValue;		
        //try to find corrdinates
        if (this._isLatLon(q) != null)
        {			
            var m = this._isLatLon(q);
            console.log("LatLon: "+m[1]+" "+m[2]);
            //m = {lon, lat}
            this.options.callback.call(this, this._createSearchResult(m[1],m[2]));			
            return;
        }
        else if (this._isLatLon_decMin(q) != null)
        {			
            var m = this._isLatLon_decMin(q);
            //m: [ns, lat dec, lat min, ew, lon dec, lon min]
            var temp  = new Array();
            temp['n'] = 1;
            temp['s'] = -1;
            temp['e'] = 1;
            temp['w'] = -1;			
            this.options.callback.call(this,this._createSearchResult(
                temp[m[1]]*(Number(m[2]) + m[3]/60),
                temp[m[4]]*(Number(m[5]) + m[6]/60)
            ));			
            return;
        }
    
        //and now Nominatim
        //http://wiki.openstreetmap.org/wiki/Nominatim

        let params = {
            // Defaults
            q: this._inputValue,
            format: 'json'
        };
        let url = "https://nominatim.openstreetmap.org/search" + L.Util.getParamString(params);
    
        return fetch(url).then(res => res.json()).then(res => {
            // console.log(url)
            return res;			
        })
    }
}