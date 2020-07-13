
class Legend{
  
    onAdd(map){
        this._map = map;
        this._div = document.createElement('div');
        
        
        const graph = document.createElement('div')
         graph.style='float:left;height:15em;width:3em;background-color:red;background-image:linear-gradient(0deg,black,red)';
        this._div.appendChild(graph);

        const label = document.createElement('div')

        label.style='float:left;padding-left:0.2em; height:15em;min-width:3em;';
        const min = document.createElement('label');
        this._min = min;
        min.innerText = '0';
        min.style="position:relative;top:90%";
        label.appendChild(min);

        const max = document.createElement('label');
        this._max = max;
        max.innerText = '1';
        max.style = "position:relative;";
        label.appendChild(max);

        this._div.appendChild(label);

        this._div.className = 'mapboxgl-ctrl mapboxgl-ctrl-legend';
        this._div.style = 'height:15em;min-width:6em;';
        return this._div;
    }

    onRemove(){
        this._div.parentNode.removeChild(this._div);
        this._map = undefined;
    }
    update(min,max){
        this.min = min;
        this.max = max;
        this._min.innerText = this.min;
        this._max.innerText = this.max;

    }
    
}

const MyLegend = function(){
    return new Legend();
}

export default MyLegend;