import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'

import './main.css';
import 'mapbox-gl-controls/theme.css';

import StylesControl from 'mapbox-gl-controls/lib/styles';
import CompassControl from 'mapbox-gl-controls/lib/compass';
import ZoomControl from 'mapbox-gl-controls/lib/zoom';
import InspectControl from 'mapbox-gl-controls/lib/inspect';
import TooltipControl from 'mapbox-gl-controls/lib/tooltip';

import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';


let defaultOpt = {
    StylesControl:true,
    CompassControl:true,
    ZoomControl:true,
    MapboxGeocoder:true
}

export default class MyMap extends mapboxgl.Map{
    constructor(options){
        super(options)
        options = Object.assign({},options,defaultOpt);

        if(options.StylesControl){
            this.addControl(new StylesControl,'bottom-right')
        }
        if(options.CompassControl){
            this.addControl(new CompassControl,'top-right');
        }
        if(options.ZoomControl){
            this.addControl(new ZoomControl,'top-right');

        }

        if(options.MapboxGeocoder){
            this.addControl(new MapboxGeocoder(({
                accessToken: mapboxgl.accessToken ?mapboxgl.accessToken :options.accessToken,
                mapboxgl: mapboxgl
              }),'top-right'))
        }

    }

   

}