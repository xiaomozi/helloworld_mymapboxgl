export default class Toolbar{
    constructor(){
        // super();
        // this._map = map;
        this._div = document.createElement('div');
        this._div.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
        // this._div.innerText = '  _i_  ';
        // let btn = document.createElement('button');
        // btn.innerText = "T";
        // btn.onclick = this.handleClick;
        // this._div.appendChild(btn)
    }
    onAdd(map){
        this._map = map;
        return this._div;
    }

    onRemove(){
        this._div.parentNode.removeChild(this._div);
        this._map = undefined;
    }

    handleClick(e){
      
    }

    addTool(name,callback){
        var name = name?name:"tool"
        let btn = document.createElement('button');
        btn.innerText = name;
        btn.onclick = (e) => {callback(this._map,e)};
        this._div.appendChild(btn);
        return this;
    }

}