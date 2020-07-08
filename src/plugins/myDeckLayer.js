import '@deck.gl/core';
import * as d3 from 'd3';

import { ScatterplotLayer, ArcLayer, LineLayer, PathLayer } from '@deck.gl/layers';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import {TripsLayer} from '@deck.gl/geo-layers';
import { MapboxLayer } from '@deck.gl/mapbox';

import trips from '../data/trips.json';
import coutries from '../data/coutries.json';
import buslines from '../data/heatmap-data.csv'

// d3.csv(buslines).then((data)=>{console.log(data)})
// migrate out
const SOURCE_COLOR = [3, 200, 3, 100];
// migrate in
const TARGET_COLOR = [166, 3, 3, 100];
// const TARGET_COLOR = [35, 181, 184, 100];
const RADIUS_SCALE = d3.scaleSqrt().domain([0, 8000]).range([1000, 20000]);
const WIDTH_SCALE = d3.scaleLinear().domain([0, 1000]).range([1, 4]);


class ArcBrushingLayer extends ArcLayer {
    getShaders() {
        // use customized shaders
        return Object.assign({}, super.getShaders(), {
            inject: {
                'vs:#decl': `
uniform vec2 mousePosition;
uniform float brushRadius;
          `,
                'vs:#main-end': `
float brushRadiusPixels = project_scale(brushRadius);

vec2 sourcePosition = project_position(instancePositions.xy);
bool isSourceInBrush = distance(sourcePosition, mousePosition) <= brushRadiusPixels;

vec2 targetPosition = project_position(instancePositions.zw);
bool isTargetInBrush = distance(targetPosition, mousePosition) <= brushRadiusPixels;

if (!isSourceInBrush && !isTargetInBrush) {
vColor.a = 0.0;
}
          `,
                'fs:#main-start': `
if (vColor.a == 0.0) discard;
          `
            }
        });
    }

    draw(opts) {
        const { brushRadius = 1e6, mousePosition } = this.props;
        // add uniforms
        const uniforms = Object.assign({}, opts.uniforms, {
            brushRadius: brushRadius,
            mousePosition: mousePosition ?
                this.projectPosition(this.unproject(mousePosition)).slice(0, 2) : [0, 0]
        });
        super.draw(Object.assign({}, opts, { uniforms }));
    }
}
// console.log(HexagonLayer)
function loadData(data) {
    const arcs = [];
    const counties = [];
    const pairs = {};

    data.features.forEach((county, i) => {
        const { flows, centroid: targetCentroid } = county.properties;
        const value = { gain: 0, loss: 0 };

        Object.keys(flows).forEach(toId => {
            value[flows[toId] > 0 ? 'gain' : 'loss'] += flows[toId];

            const pairKey = i < toId ? `${i}-${toId}` : `${toId}-${i}`;
            const sourceCentroid = data.features[toId].properties.centroid;
            const gain = Math.sign(flows[toId]);

            // eliminate duplicates arcs
            if (pairs[pairKey]) {
                return;
            }

            pairs[pairKey] = true;

            arcs.push({
                target: gain > 0 ? targetCentroid : sourceCentroid,
                source: gain > 0 ? sourceCentroid : targetCentroid,
                value: Math.abs(flows[toId])
            });
        });

        // add point at arc target
        counties.push({
            ...value,
            position: targetCentroid,
            net: value.gain + value.loss,
            total: value.gain - value.loss,
            name: county.properties.name
        });
    });

    // sort counties by radius large -> small
    counties.sort((a, b) => Math.abs(b.net) - Math.abs(a.net));

    // renderLayers({arcs, counties});
    return [counties, arcs];
}


export default function myDeckLayer(){
    return new MapboxLayer({
        type: ScatterplotLayer,
        id: 'scatterplotLayer',
        data: loadData(coutries)[0],
        opacity: 0.5,
        pickable: true,
        // onHover: this._onHover,
        getRadius: d => RADIUS_SCALE(d.total) * 3,
        getColor: d => (d.net > 0 ? TARGET_COLOR : SOURCE_COLOR)
    
    });
}

export const tripLayer = new MapboxLayer({
    type:TripsLayer,
    id: 'trips',
    data: trips,
    getPath: d => d.path,
    getTimestamps: d => d.timestamps,
    getColor: d => (d.vendor === 0 ? [253, 128, 93] : [23, 184, 190]),
    opacity: 0.3,
    widthMinPixels: 2,
    rounded: true,
    trailLength:180,
    currentTime: (Date.now() / 1000 % 1800) * 30,

    shadowEnabled: false
});

 const tripsLayer = function(){

    function _animate() {
        const loopLength = 1800, // unit corresponds to the timestamp in source data
          animationSpeed = 30; // unit time per second
        
        const timestamp = Date.now() / 1000;
        const loopTime = loopLength / animationSpeed;
    
       
          this.time = ((timestamp % loopTime) / loopTime) * loopLength ;
        
        this._animationFrame = window.requestAnimationFrame(_animate);
      }

    const tripsLayer = new MapboxLayer({
        id: 'trips',
        data: trips,
        getPath: d => d.path,
        getTimestamps: d => d.timestamps,
        getColor: d => (d.vendor === 0 ? [253, 128, 93] : [23, 184, 190]),
        opacity: 0.3,
        widthMinPixels: 2,
        rounded: true,
        trailLength:180,
        currentTime: (Date.now() / 1000 % 1800) * 30,
    
        shadowEnabled: false
    });
}

export const arcsLayer = function(){
    return new MapboxLayer({
        type: ArcLayer,
        id: 'arcs',
        data: loadData(coutries)[1],
        // brushRadius: 100000,
        getStrokeWidth: d => WIDTH_SCALE(d.value),
        opacity: 1,
        pickable: true,
        getWidth: 2,
        getTilt:60,
        autoHighlight:true,
        greatCircle:false,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: SOURCE_COLOR,
        getTargetColor: TARGET_COLOR
    });
}



export const hexagonLayer = function () {
    // const DATA_URL = '../data/heatmap-data.csv';
    // const OPTIONS = ['radius', 'coverage', 'upperPercentile'];
    const COLOR_RANGE = [
        [1, 152, 189],
        [73, 227, 206],
        [216, 254, 181],
        [254, 237, 177],
        [254, 173, 84],
        [209, 55, 78]
    ];
    const LIGHT_SETTINGS = {
        lightsPosition: [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000],
        ambientRatio: 0.4,
        diffuseRatio: 0.6,
        specularRatio: 0.2,
        lightsStrength: [0.8, 0.0, 0.8, 0.0],
        numberOfLights: 2
    };
    return new MapboxLayer({
        type: HexagonLayer,
        id: 'heatmap',
        data: d3.csv(buslines),
        radius: 1000,
        coverage: 1,
        upperPercentile: 100,
        colorRange: COLOR_RANGE,
        elevationRange: [0, 1000],
        elevationScale: 250,
        extruded: true,
        getPosition: d => [Number(d.lng), Number(d.lat)],
        lightSettings: LIGHT_SETTINGS,
        opacity: 1
    })
}

// export const hexagonLayer = _hexagonLayer();
// export default myDeckLayer;