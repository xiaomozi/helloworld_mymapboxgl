import { Control } from "mapbox-gl";
;

class MsgBox{
  
    
    onAdd(map){
        this._map = map;
        this._div = document.createElement('div');
        this._div.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
        this._div.innerText = '  _i_  ';
        // let btn = document.createElement('button');
        // btn.innerText = "i"
        // this._div.appendChild(btn)
        return this._div;
    }

    onRemove(){
        this._div.parentNode.removeChild(this._div);
        this._map = undefined;
    }

    update(feature){
        this._div.innerText = "";
        let props= feature.properties
        Object.keys(props).forEach((ele)=>{
            this._div.innerText += (ele +":"+ props[ele] + '\n') 

        })
    }
}


export default MsgBox;