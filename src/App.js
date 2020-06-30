import React from 'react';
// import logo from './logo.svg';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'
// import { Deck } from '@deck.gl/core';
// import { GeoJsonLayer, ArcLayer } from '@deck.gl/layers';
import myDeckLayer, { hexagonLayer, arcsLayer } from './plugins/myDeckLayer';

import earthquakedata from './data/earthquakes.json';
import './App.css';

import './main.css';
import 'mapbox-gl-controls/theme.css'
import RulerControl from 'mapbox-gl-controls/lib/ruler';
import StylesControl from 'mapbox-gl-controls/lib/styles';
import CompassControl from 'mapbox-gl-controls/lib/compass';
import ZoomControl from 'mapbox-gl-controls/lib/zoom';
import InspectControl from 'mapbox-gl-controls/lib/inspect';
import TooltipControl from 'mapbox-gl-controls/lib/tooltip';

import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';


import MsgBox from './MsgBox';
import Toolbar from './ToolBar';

import Minimap from './plugins/mapboxgl-minimapControl';

// import MapboxDraw from 'mapbox-gl-draw';
// import 'mapbox-gl-draw/dist/mapbox-gl-draw.css'
import turf from 'turf';
// import './DrawControInfo.css';

//echarts
// import echart from 'echarts';
// import 'echarts-gl';
// import '../node_modules/echarts-gl/dist/echarts-gl'
// import data from './buslines.json';
// require('echarts');
// import 'echarts';
// import EchartsLayer from './plugins/EchartsLayer';
// import flights from './data/flights.json'


//table react plugin
import Reactable from 'reactable';
import './table.css'
import air from './ne_10m_airports.json'
import Tools from './Tools';
// mapboxgl.accessToken = 'pk.eyJ1IjoieGlhb21vemkiLCJhIjoiY2tiaDdzbHA0MDJzbjJ5bHM0c2NpbjM4aSJ9.NkU21q7-8zIGmPvo8gqRZA';


function DrawCrtl(props) {

  return (
    <div>
      <p>测量结果</p>
      <div id="calculated-area"></div>
    </div>

  )
}

function MapTitle(props) {
  return (

    <div id="map-title">{props.title}</div>

  )
}

var Table = Reactable.Table;

function TableContainer(props) {

  if (props.tableshow) {
    return <Table className="table" data={props.featuredata} />
  }
  return <br></br>

}

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // app: {},
      featuredata: [
        { "fafa": "fadsfads" },
        { "fadfaf": "fadsfd" }
      ],
      tableshow: false,
      mapTitle: "中国地图"
    }
    // this.hideDrawBox = this.hideDrawBox.bind(this);
    // this.showDrawBox = this.showDrawBox.bind(this);
  }

  render() {
    return (
      <div>
        <div id="map"></div>
        <div id="calculation-box" className="calculation-box" style={{ visibility: "hidden" }}>
          <DrawCrtl />

        </div>
        <TableContainer tableshow={this.state.tableshow} featuredata={this.state.featuredata} />
        <canvas id="deck-canvas" className="trcl"></canvas>
        <MapTitle className='mapTitle' title={this.state.mapTitle} />

      </div>

    )
  }


  componentDidMount() {
    if (!mapboxgl.supported()) {
      alert('Your browser does not support Mapbox GL');
      return;
    }

    const AIR_PORTS = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';
    const INITIAL_VIEW_STATE = {
      latitude: 106,
      longitude: 30,
      zoom: 4,
      bearing: 0,
      pitch: 45
    };


    const style = {
      "streets": 'mapbox://styles/mapbox/streets-v11',
      "light": 'mapbox://styles/mapbox/light-v10',
      "dark": 'mapbox://styles/mapbox/dark-v10',
      "satelite-streets": 'mapbox://styles/mapbox/satellite-streets-v11',
      "navi_day": 'mapbox://styles/mapbox/navigation-guidance-day-v4',
      'hillshading': 'mapbox://styles/mapbox/cjaudgl840gn32rnrepcb9b9g',
      'mymap': 'mapbox://styles/xiaomozi/ckbiw7e9v004y1ip4ookctquy'
    };

    var mytoken = 'pk.eyJ1IjoieGlhb21vemkiLCJhIjoiY2tibTNoeTd1MGhkcjJycG85aW55MzdjeiJ9.yxRH4UcmeNF0HR1VdNMFIQ'
    // mapboxgl.accessToken = 'pk.eyJ1Ijoiemh1d2VubG9uZyIsImEiOiJjazdhNGF6dzIwd3V0M21zNHU1ejZ1a3Q4In0.VkUeaPhu-uMepNBOMc_UdA';
    mapboxgl.accessToken = mytoken;
    const app = {};
    const map = new mapboxgl.Map({
      container: "map",
      style: style.mymap, // stylesheet location
      center: [106, 30.0], // starting position [lng, lat]
      zoom: 4,// starting zoom
      // attributionControl:false,
      // customAttribution:"@map4d",
      // interactive:false,
      // center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
      zoom: INITIAL_VIEW_STATE.zoom,
      bearing: INITIAL_VIEW_STATE.bearing,
      pitch: INITIAL_VIEW_STATE.pitch
    });
    
    map.vRApp =this;


    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl
    });
    map.addControl(geocoder)


    map.on('click', () => {
      this.setState({ tableshow: false })
    })

    map.addControl(new StylesControl({
      styles: [
        {
          label: 'Streets',
          styleName: 'Mapbox Streets',
          styleUrl: 'mapbox://styles/mapbox/streets-v9',
        }, {
          label: 'Satellite',
          styleName: 'Satellites',
          styleUrl: 'mapbox://styles/mapbox/satellite-v9',
        },
        {
          label: "白天模式",
          styleName: "light",
          styleUrl: "mapbox://styles/mapbox/light-v10"
        }, {
          label: "夜间模式",
          styleName: "dark",
          styleUrl: style.dark
        }, {
          label: "渲染",
          styleName: 'render',
          styleUrl: style.hillshading
        }
      ],
      onChange: (style) => {
        // debugger;
        // var layers = map.getStyle();

        // layers = layers.layers;
        // console.log(layers);
        // console.log(style);
        // map.setStyle(style.styleUrl);
        // map.moveLayer()
      },
    }), 'bottom-right');

    // map.addControl(new CompassControl(), 'top-right');
    map.addControl(new mapboxgl.NavigationControl());
    // map.addControl(new ZoomControl(), 'top-right');
    map.addControl(new InspectControl(), 'bottom-right');
    // map.addControl(new TooltipControl({ layer: '$fill' }));
    var scale = new mapboxgl.ScaleControl({
      maxWidth: 80,
      unit: 'imperial'
    });
    map.addControl(scale);

    scale.setUnit('metric');


    const tool = new Toolbar();
    map.addControl(tool);

    map.on('load', () => {
     
      tool.addTool("筑", Tools.addBuilding);
      tool.addTool("量",Tools.drawControl);
      tool.addTool("省",Tools.addProvince);


    })
    // const tool = new Toolbar();
    // map.addControl(tool);

    tool.addTool("热", (m) => {
      debugger;
      if (app.hotLayer) {

        removeEarthquake();
        this.setState({
          mapTitle:""
        })
        app.hotLayer = false;

      } else {
        earthquakes();
        updateMapTitle('地震热力地图')
        app.hotLayer = true;
      }
    });

   



    

    // tool.addTool("聚", (e) => {
    //   cluster();
    // })

    // tool.addTool("飞", (e) => {

    //   ODFly();
    // });

    // tool.addTool('瞰', (e) => {
    //   overView();
    // })

    // tool.addTool('撞',()=>{
    //   map.addLayer(hexagonLayer,'waterway-label')
    //   map.flyTo({
    //     center:[-2.67,52.74]
    //   });
    //   // debugger;

    //   updateMapTitle('英国交通事故地图')

    // })

    // tool.addTool('迁',()=>{
    //   map.addLayer(arcsLayer,'waterway-label');
    //   map.addLayer(myDeckLayer,'waterway-label');

    //   map.flyTo({
    //     center:[-92.67,35.74]
    //   });
    //   updateMapTitle('美国居民迁徙地图')
    // })





    var msgbox = new MsgBox();
    map.addControl(msgbox, 'top-right');

    function updateMapTitle(newtitle) {
      this.setState({
        mapTitle: newtitle ? newtitle : "地图"
      })
    }

    function overView() {

      if (app.overview) {
        map.removeControl(app.overview);
        app.overview = undefined;


      } else {
        app.overview = new Minimap({
          center: map.getCenter(),
          zoom: 2,
          style: style.light,
        });
        map.addControl(app.overview, 'bottom-left');

      }


    }

    
    map.on('load', function () {
      // map.addLayer(myDeckLayer,'waterway-label');
      // map.addLayer(hexagonLayer,'waterway-label');
      // map.addLayer(hexagonLayer(),'waterway-label')

      // let echartslayer = new EchartsLayer(map,option);


      // console.log(map.getStyle().layers)
      // console.log(map.getStyle().sources);//mapbox://mapbox.mapbox-streets-v8
      // map.addSource("dems", {
      //   "type": "raster-dem",
      //   "url": "mapbox://mapbox.terrain-rgb"

      // })

      // map.addLayer({
      //   'id': "dem",
      //   "source": "dems",
      //   'type': 'hillshade',
      //   'paint': {
      //     'hillshade-highlight-color': '#0dcae3',
      //     'hillshade-accent-color':'#0dcae3',
      //     'hillshade-shadow-color':'black',
      //     'hillshade-illumination-direction':90,
      //     'hillshade-exaggeration':0.56,
      //     'hillshade-illumination-anchor':'map'
      //   }

      // })


      var size = 200;

      // implementation of CustomLayerInterface to draw a pulsing dot icon on the map
      // see https://docs.mapbox.com/mapbox-gl-js/api/#customlayerinterface for more info
      var pulsingDot = {
        width: size,
        height: size,
        data: new Uint8Array(size * size * 4),

        // get rendering context for the map canvas when layer is added to the map
        onAdd: function () {
          var canvas = document.createElement('canvas');
          canvas.width = this.width;
          canvas.height = this.height;
          this.context = canvas.getContext('2d');
        },

        // called once before every frame where the icon will be used
        render: function () {
          var duration = 1000;
          var t = (performance.now() % duration) / duration;

          var radius = (size / 2) * 0.3;
          var outerRadius = (size / 2) * 0.7 * t + radius;
          var context = this.context;

          // draw outer circle
          context.clearRect(0, 0, this.width, this.height);
          context.beginPath();
          context.arc(
            this.width / 2,
            this.height / 2,
            outerRadius,
            0,
            Math.PI * 2
          );
          context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
          context.fill();

          // draw inner circle
          context.beginPath();
          context.arc(
            this.width / 2,
            this.height / 2,
            radius,
            0,
            Math.PI * 2
          );
          context.fillStyle = 'rgba(255, 100, 100, 1)';
          context.strokeStyle = 'white';
          context.lineWidth = 2 + 4 * (1 - t);
          context.fill();
          context.stroke();

          // update this image's data with data from the canvas
          this.data = context.getImageData(
            0,
            0,
            this.width,
            this.height
          ).data;

          // continuously repaint the map, resulting in the smooth animation of the dot
          map.triggerRepaint();

          // return `true` to let the map know that the image was updated
          return true;
        }
      };
      map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });




    });

    function ODFly(ods) {
      let ODs = ods ? ods : [];
      ODs.push([[112.0, 22.0], [115.34, 40.04]])
      ODs.push([[113.0, 22.0], [115.34, 40.04]])
      ODs.push([[115.0, 22.0], [115.34, 40.04]])

      if (app.flied) {
        cancelAnimationFrame(app.moveHandlerId);
        // remove layers
        var layers = map.getStyle().layers;

        var flys = layers.filter((lay) => lay.id.indexOf('fly') == 0)

        flys.map((layer) => map.removeLayer(layer));

        var sources = map.getStyle().sources;
        // Object.keys(sources)
        var srcs = Object.keys(sources).filter((src) => src.indexOf('fly') == 0)

        srcs.map((src) => map.removeSource(src));
        app.flied = false;
        return;
      }
      app.flied = true;

      // San Francisco
      var origin = origin ? origin : [-122.414, 37.776];

      // Washington DC
      var destination = destination ? destination : [-77.032, 38.913];

      // A simple line from origin to destination.
      var route = {
        'type': 'FeatureCollection',
        'features': [
          // {
          //   'type': 'Feature',
          //   'geometry': {
          //     'type': 'LineString',
          //     'coordinates': [origin, destination]
          //   }
          // }
        ]
      };

      var featureLine = function (coord1, coord2) {
        return {
          "type": "Feature",
          'geometry': {
            'type': 'LineString',
            'coordinates': [coord1, coord2]
          }
        }
      }

      function _addFeatureToRoute(feature) {

        route.features.push(feature)
      }

      function addRoute(coord1, coord2) {
        _addFeatureToRoute(featureLine(coord1, coord2));

      }


      ///test[112.98, 22.16], [116.34, 40.04]
      // route.features.pop();
      ODs.map((od) => {
        addRoute(od[0], od[1]);

      })
      // addRoute([112.0, 22.0], [115.34, 40.04]);
      // addRoute([111.0, 22.0], [115.34, 40.04]);
      // addRoute([112.0, 21.0], [115.34, 40.04]);



      // A single point that animates along the route.
      // Coordinates are initially set to origin.
      var point = {
        'type': 'FeatureCollection',
        'features': [
          // {
          //   'type': 'Feature',
          //   'properties': {},
          //   'geometry': {
          //     'type': 'Point',
          //     'coordinates': origin
          //   }
          // }
        ]
      };
      var step = 500;
      // point.features.pop();
      function _updateroute() {
        // var distances = [],arcs = [];
        route.features.map((feature) => {
          let distance = turf.lineDistance(feature, 'kilometers');
          // distances.push(distance);
          let arc = [];
          // const step = 500;
          let stepDistance = distance / step;

          for (let i = 0; i < distance; i += stepDistance) {
            let segment = turf.along(feature, i, 'kilometers');
            arc.push(segment.geometry.coordinates);
          }
          // arcs.push(arc);
          feature.geometry.coordinates = arc;
          //update point ,add each line start point to point
          point.features.push({
            'type': 'Feature',
            'properties': {},
            "geometry": {
              'type': 'Point',
              'coordinates': arc[0]
            }
          });

        })

      }

      _updateroute();
      // // Calculate the distance in kilometers between route start/end point.
      // var lineDistance = turf.lineDistance(route.features[0], 'kilometers');

      // var arc = [];

      // // Number of steps to use in the arc and animation, more steps means
      // // a smoother arc and animation, but too many steps will result in a
      // // low frame rate
      // var steps = 500;

      // // Draw an arc between the `origin` & `destination` of the two points
      // for (var i = 0; i < lineDistance; i += lineDistance / steps) {
      //   var segment = turf.along(route.features[0], i, 'kilometers');
      //   arc.push(segment.geometry.coordinates);
      // }

      // // Update the route with calculated arc coordinates
      // route.features[0].geometry.coordinates = arc;

      // Used to increment the value of the point measurement against the route.
      let routeSource = "fly" + (Math.random() + Date.now()).toString();
      let pointSource = "fly" + (Math.random() + Date.now()).toString();
      map.addSource(routeSource, {
        'type': 'geojson',
        'data': route
      });



      map.addSource(pointSource, {
        'type': 'geojson',
        'data': point
      });

      let routeLayerId = routeSource + "Layer";
      let pointLayerId = pointSource + "Layer";
      map.addLayer({
        'id': routeLayerId,
        'source': routeSource,
        'type': 'line',
        'paint': {
          'line-width': 1.5,
          'line-color': 'blue',
          'line-blur': 1
        }
      });

      map.addLayer({
        'id': pointLayerId,
        'source': pointSource,
        'type': 'symbol',
        'layout': {
          'icon-image': 'airport-15',
          'icon-rotate': ['get', 'bearing'],
          'icon-rotation-alignment': 'map',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true
        }
      });


      var counter = 0;
      var moveHandlerId;
      function animate() {

        route.features.map((line, index) => {
          let p = point.features[index];
          console.log(counter, index)

          p.geometry.coordinates = line.geometry.coordinates[counter];
          p.properties.bearing = turf.bearing(
            turf.point(line.geometry.coordinates[0]),
            turf.point(line.geometry.coordinates[1])
          )

        });

        // Update the source with this new data.
        map.getSource(pointSource).setData(point);

        // // Request the next frame of animation so long the end has not been reached.
        if (counter < step) {
          app.moveHandlerId = requestAnimationFrame(animate);
        }
        counter = counter + 1;
      }

      animate();
      // return moveHandlerId;

    }

    function cluster(params) {
      let earthquakes = 'earthquakesCluster'
      if (!map.getSource(earthquakes)) {
        map.addSource(earthquakes, {
          type: 'geojson',
          // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
          // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
          data: earthquakedata,
          cluster: true,
          clusterMaxZoom: 14, // Max zoom to cluster points on
          clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        });
      }


      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: earthquakes,
        filter: ['has', 'point_count'],
        paint: {
          // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
          // with three steps to implement three types of circles:
          //   * Blue, 20px circles when point count is less than 100
          //   * Yellow, 30px circles when point count is between 100 and 750
          //   * Pink, 40px circles when point count is greater than or equal to 750
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            100,
            '#f1f075',
            750,
            '#f28cb1'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40
          ]
        }
      });

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: earthquakes,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        }
      });

      map.addLayer({
        id: 'unclustered-point',
        type: 'symble',
        source: earthquakes,
        filter: ['!', ['has', 'point_count']],

        paint: {
          'circle-color': '#11b4da',
          'circle-radius': 4,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      });

      // inspect a cluster on click
      map.on('click', 'clusters', function (e) {
        var features = map.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        var clusterId = features[0].properties.cluster_id;
        map.getSource(earthquakes).getClusterExpansionZoom(
          clusterId,
          function (err, zoom) {
            if (err) return;

            map.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom
            });
          }
        );
      });

      // When a click event occurs on a feature in
      // the unclustered-point layer, open a popup at
      // the location of the feature, with
      // description HTML from its properties.
      map.on('click', 'unclustered-point', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var mag = e.features[0].properties.mag;
        var tsunami;

        if (e.features[0].properties.tsunami === 1) {
          tsunami = 'yes';
        } else {
          tsunami = 'no';
        }

        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(
            'magnitude: ' + mag + '<br>Was there a tsunami?: ' + tsunami
          )
          .addTo(map);
      });

      map.on('mouseenter', 'clusters', function () {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'clusters', function () {
        map.getCanvas().style.cursor = '';
      });
    }

    function earthquakes() {

      map.addSource("earthquakes", {
        "type": "geojson",
        "data": earthquakedata,
        // cluster: true,
        // clusterMaxZoom: 14, // Max zoom to cluster points on
        // clusterRadius: 50 
      });


      map.addLayer({
        'id': 'earthquakes-heat',
        'type': 'heatmap',
        'source': 'earthquakes',
        'maxzoom': 9,
        'paint': {
          // Increase the heatmap weight based on frequency and property magnitude
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'mag'],
            0,
            0,
            6,
            1
          ],
          // Increase the heatmap color weight weight by zoom level
          // heatmap-intensity is a multiplier on top of heatmap-weight
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0,
            1,
            9,
            3
          ],
          // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
          // Begin color ramp at 0-stop with a 0-transparancy color
          // to create a blur-like effect.
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(33,102,172,0)',
            0.2,
            'rgb(103,169,207)',
            0.4,
            'rgb(209,229,240)',
            0.6,
            'rgb(253,219,199)',
            0.8,
            'rgb(239,138,98)',
            1,
            'rgb(178,24,43)'
          ],
          // Adjust the heatmap radius by zoom level
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0,
            2,
            9,
            20
          ],
          // Transition from heatmap to circle layer by zoom level
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7,
            1,
            9,
            0
          ]
        }
      },
        'waterway-label');

      map.addLayer({
        id: "earthIcon",
        type: "symbol",
        source: 'earthquakes',
        layout: {
          'icon-image': 'pulsing-dot'
        },
      });

      map.addLayer(
        {
          'id': 'earthquakes-point',
          'type': 'circle',
          'source': 'earthquakes',
          'minzoom': 7,
          'paint': {
            // Size circle radius by earthquake magnitude and zoom level
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              7,
              ['interpolate', ['linear'], ['get', 'mag'], 1, 1, 6, 4],
              16,
              ['interpolate', ['linear'], ['get', 'mag'], 1, 5, 6, 50]
            ],
            // Color circle by earthquake magnitude
            'circle-color': [
              'interpolate',
              ['linear'],
              ['get', 'mag'],
              1,
              'rgba(33,102,172,0)',
              2,
              'rgb(103,169,207)',
              3,
              'rgb(209,229,240)',
              4,
              'rgb(253,219,199)',
              5,
              'rgb(239,138,98)',
              6,
              'rgb(178,24,43)'
            ],
            'circle-stroke-color': 'white',
            'circle-stroke-width': 1,
            // Transition from heatmap to circle layer by zoom level
            'circle-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              7,
              0,
              8,
              1
            ]
          }
        },
        'waterway-label'
      );
    }
    function removeEarthquake() {


      if (map.getLayer("earthquakes-point") && map.getLayer("earthquakes-heat")) {
        map.removeLayer('earthquakes-point')
        map.removeLayer("earthquakes-heat");
        map.removeLayer("earthIcon")

      }
      if (map.getSource("earthquakes")) {
        map.removeSource("earthquakes");

      }

    }



  }



}

export default App;
