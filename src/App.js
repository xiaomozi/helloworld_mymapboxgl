import React from 'react';
// import logo from './logo.svg';


import { Deck } from '@deck.gl/core';
import { GeoJsonLayer, ArcLayer } from '@deck.gl/layers';

import earthquakedata from './earthquakes.json';
import './App.css';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'
import './main.css';
import 'mapbox-gl-controls/theme.css'
import RulerControl from 'mapbox-gl-controls/lib/ruler';
import StylesControl from 'mapbox-gl-controls/lib/styles';
import CompassControl from 'mapbox-gl-controls/lib/compass';
import ZoomControl from 'mapbox-gl-controls/lib/zoom';
import InspectControl from 'mapbox-gl-controls/lib/inspect';
import TooltipControl from 'mapbox-gl-controls/lib/tooltip';

import MsgBox from './MsgBox';
import Toolbar from './ToolBar';

import MapboxDraw from 'mapbox-gl-draw';
import 'mapbox-gl-draw/dist/mapbox-gl-draw.css'
import turf from 'turf';
import './DrawControInfo.css';
import echarts from 'echarts';

import 'echarts-gl';
// import '../node_modules/echarts-gl/dist/echarts-gl'
import data from './buslines.json';

import Reactable from 'reactable';
import './table.css'
import air from './ne_10m_airports.json'

// mapboxgl.accessToken = 'pk.eyJ1IjoieGlhb21vemkiLCJhIjoiY2tiaDdzbHA0MDJzbjJ5bHM0c2NpbjM4aSJ9.NkU21q7-8zIGmPvo8gqRZA';


function addecharts(data) {
  // mapboxgl.accessToken = 'pk.eyJ1Ijoiemh1d2VubG9uZyIsImEiOiJjazdhNGF6dzIwd3V0M21zNHU1ejZ1a3Q4In0.VkUeaPhu-uMepNBOMc_UdA';


  var myChart = echarts.init(document.getElementById('map'));
  myChart.setOption({
    mapbox3D: {
      center: [104.114129, 37.550339],
      zoom: 2,
      pitch: 50,
      bearing: -10,
      style: 'mapbox://styles/mapbox/light-v9',
      boxHeight: 50,
      // altitudeScale: 1e2,
      postEffect: {
        enable: true,
        screenSpaceAmbientOcclusion: {
          enable: true,
          radius: 2
        }
      },
      light: {
        main: {
          intensity: 2,
          shadow: true,
          shadowQuality: 'high'
        },
        ambient: {
          intensity: 0.3
        }
      }

    },
    series: [{
      type: 'bar3D',
      coordinateSystem: 'mapbox3D',
      shading: 'lambert',
      minHeight: 0.1,
      barSize: 0.1,
      data: data,
      silent: true,
      animationEasingUpdate: 2000
    }]


  });


}

function DrawCrtl(props) {

  return (
    <div>
      <p>测量结果</p>
      <div id="calculated-area"></div>
    </div>

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
      'hillshading': 'mapbox://styles/mapbox/cjaudgl840gn32rnrepcb9b9g'
    };
    mapboxgl.accessToken = 'pk.eyJ1Ijoiemh1d2VubG9uZyIsImEiOiJjazdhNGF6dzIwd3V0M21zNHU1ejZ1a3Q4In0.VkUeaPhu-uMepNBOMc_UdA';
    const app = {};
    // this.app = app;
    const map = new mapboxgl.Map({
      container: "map",
      style: style.light, // stylesheet location
      center: [106, 30.0], // starting position [lng, lat]
      zoom: 4,// starting zoom
      // interactive:false,
      // center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
      zoom: INITIAL_VIEW_STATE.zoom,
      bearing: INITIAL_VIEW_STATE.bearing,
      pitch: INITIAL_VIEW_STATE.pitch
    });


    //  const deck = new Deck({
    //   canvas: 'deck-canvas',
    //   width: '100%',
    //   height: '100%',
    //   initialViewState: INITIAL_VIEW_STATE,
    //   controller: true,
    //   onViewStateChange: ({ viewState }) => {
    //     map.jumpTo({
    //       center: [viewState.longitude, viewState.latitude],
    //       zoom: viewState.zoom,
    //       bearing: viewState.bearing,
    //       pitch: viewState.pitch
    //     });
    //   },
    //   layers: [
    //     new GeoJsonLayer({
    //       id: 'airports',
    //       data: air,
    //       // Styles
    //       filled: true,
    //       pointRadiusMinPixels: 2,
    //       pointRadiusScale: 2000,
    //       getRadius: f => 11 - f.properties.scalerank,
    //       getFillColor: [200, 0, 80, 180],
    //       // Interactive props
    //       pickable: true,
    //       autoHighlight: true,
    //       onClick: info =>
    //         // eslint-disable-next-line
    //         info.object && alert(`${info.object.properties.name} (${info.object.properties.abbrev})`)
    //     }),
    //     // new ArcLayer({
    //     //   id: 'arcs',
    //     //   data: air,
    //     //   dataTransform: d => d.features.filter(f => f.properties.scalerank < 4),
    //     //   // Styles
    //     //   getSourcePosition: f => [112.4531566, 31.4709959], // London
    //     //   getTargetPosition: f => f.geometry.coordinates,
    //     //   getSourceColor: ()=>[0, 128, 200],
    //     //   getTargetColor: ()=>[200, 0, 80],
    //     //   getWidth: ()=>1
    //     // })
    //   ]
    // });




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
    }), 'top-right');

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
    tool.addTool("热", (e) => {
      let btn = e.target;
      if (btn.close) {

        removeEarthquake();
        btn.close = false;

      } else {
        earthquakes();
        btn.close = true;
      }
    });

    tool.addTool('量', (e) => {
      draw();
    })

    tool.addTool("动", (e) => {
      moveSin()
    })

    tool.addTool("省", (e) => {
      var me = this;
      addProvince(me)
    })
    tool.addTool("筑", (e) => {
      addBuilding();
    })

    tool.addTool("聚", (e) => {
      cluster();
    })

    tool.addTool("飞", (e) => {

      ODFly();
    })

    map.addControl(tool)

    var msgbox = new MsgBox();
    map.addControl(msgbox, 'top-right');

    function moveSin() {

      if (app.animation) {
        cancelAnimationFrame(app.animation);
        map.removeLayer("line-animation").removeSource("line");
        app.animation = undefined;
        return;
      }
      var geojson = {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': [[0, 0]]
            }
          }
        ]
      };

      var speedFactor = 30; // number of frames per longitude degree
      // var animation; // to store and cancel the animation
      var startTime = 0;
      var progress = 0; // progress = timestamp - startTime
      var resetTime = false;
      map.addSource('line', {
        'type': 'geojson',
        'data': geojson
      });
      map.addLayer({
        'id': 'line-animation',
        'type': 'line',
        'source': 'line',
        'layout': {
          'line-cap': 'round',
          'line-join': 'round'
        },
        'paint': {
          'line-color': '#ed6498',
          'line-width': 5,
          'line-opacity': 0.8
        }
      });
      startTime = performance.now();
      animateLine();
      function animateLine(timestamp) {
        if (resetTime) {
          // resume previous progress
          startTime = performance.now() - progress;
          resetTime = false;
        } else {
          progress = timestamp - startTime;
        }

        // restart if it finishes a loop
        if (progress > speedFactor * 360) {
          startTime = timestamp;
          geojson.features[0].geometry.coordinates = [];
        } else {
          var x = progress / speedFactor;
          // draw a sine wave with some math.
          var y = Math.sin((x * Math.PI) / 90) * 40;
          // append new coordinates to the lineString
          geojson.features[0].geometry.coordinates.push([x, y]);
          // then update the map
          map.getSource('line').setData(geojson);
        }
        // Request the next frame of the animation.
        app.animation = requestAnimationFrame(animateLine);
      }
    }

    function hideDrawBox() {
      let box = document.getElementById("calculation-box");
      box.setAttribute("style", "visibility:hidden")
      // box.style.visibility = "hidden";
    }
    function showDrawBox() {
      let box = document.getElementById("calculation-box");
      box.style.visibility = "visible";
    }
    function draw() {
      // console.log(turf)
      if (app.draw) {
        map.removeControl(app.draw);
        hideDrawBox();
        app.draw = undefined;
        return;
      } else {
        var draw = new MapboxDraw({
          displayControlsDefault: true,
          // controls: {
          // polygon: true,
          // trash: true
          // }
        });
        map.addControl(draw);
        showDrawBox()
        app.draw = draw;

        map.on('draw.create', updateArea);
        map.on('draw.delete', updateArea);
        map.on('draw.update', updateArea);

      }

      function updateArea(e) {

        var data = draw.getAll();
        var answer = document.getElementById('calculated-area');
        var result;
        if (data.features.length > 0) {
          let lastFeature = data.features.pop();

          switch (lastFeature.geometry.type) {
            case "LineString":
              result = turf.lineDistance(lastFeature);
              // result = calculateLength(json);
              answer.innerHTML =
                '<p><strong>' +
                result.toFixed(2) +
                '</strong></p><p>千米</p>';
              break;
            case "Polygon":
              let json = {}
              json.features = [];
              json.type = "FeatureCollection";
              json.features.push(lastFeature);
              result = turf.area(json);
              // var area = turf.area(data);
              // restrict to area to 2 decimal points
              var rounded_area = Math.round(result * 100) / 100;
              answer.innerHTML =
                '<p><strong>' +
                rounded_area +
                '</strong></p><p>平方米</p>';
              break;
            case "Point":
              result = lastFeature.geometry.coordinates;
              answer.innerHTML = "lng: " + result[0].toFixed(2) + ";<br> lat:" + result[1].toFixed(2);

              break;
            default:
              break;

          }

        } else {
          answer.innerHTML = '';
          if (e.type !== 'draw.delete')
            alert('Use the draw tools to draw a polygon!');
        }
      }


    }



    map.on('load', function () {
      // console.log(map.getStyle().layers)
      // console.log(map.getStyle().sources);//mapbox://mapbox.mapbox-streets-v8
      map.addSource("dems", {
        "type": "raster-dem",
        "url": "mapbox://mapbox.terrain-rgb"

      })

      map.addLayer({
        'id': "dem",
        "source": "dems",
        'type': 'hillshade',
        'paint': {
          'hillshade-highlight-color': 'cyan',
          // 'hillshade-accent-color':'blue',
          'hillshade-shadow-color':'olive',
          'hillshade-illumination-direction':90,
          'hillshade-illumination-anchor':'map'
        }

      })

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
        map.getSource('earthquakes').getClusterExpansionZoom(
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

    function addBuilding() {
      if (map.getLayer("3d-buildings")) {
        return;
      }
      map.flyTo({
        center: [121.50, 31.24],
        zoom: 16,
        speed: 2,
        curve: 1,

      })
      var layers = map.getStyle().layers;

      // var labelLayerId;
      for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
          app.labelLayerId = layers[i].id;
          break;
        }
      }
      map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 13,
        'paint': {
          'fill-extrusion-color': [
            "interpolate", ["linear"], ["get", "height"],
            0, "green",
            10.05, "red",
            100, "yellow"
          ],

          // 使用“插值”表达式为
          // 建筑物作为用户放大
          'fill-extrusion-height': [
            "interpolate", ["linear"], ["zoom"],
            15, 100,
            15.05, ["get", "height"]
          ],
          'fill-extrusion-base': [
            "interpolate", ["linear"], ["zoom"],
            15, 0,
            15.05, ["get", "min_height"]
          ],
          'fill-extrusion-opacity': .6
        }
      }, app.labelLayerId);

    }
    function addProvince(me) {
      const provinceid = "province";

      if (map.getLayer("province")) {
        map.removeLayer('province').removeSource("province");
        return;
      }
      var layers = map.getStyle().layers;
      // var labelLayerId;
      for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
          app.labelLayerId = layers[i].id;
          break;
        }
      }
      map.addSource('province', {
        'type': 'vector',
        'url': 'mapbox://zhuwenlong.bpyitk7f'
      });

      map.addLayer({
        id: 'province',
        'source': 'province',
        'source-layer': 'cn_sheng_polygon',
        'type': 'fill-extrusion',
        'minzoom': 1,
        'maxzoom': 7,
        'paint': {
          'fill-extrusion-base': 0,
          'fill-extrusion-height': ['*', 10000, ["get", 'SHENG_ID']],
          'fill-extrusion-color': [
            "match",
            [
              "get",
              "name"
            ],
            "湖北",
            "rgba(204,30,29,1)",
            "广东",
            "rgba(239,63,63,1)",
            "河南",
            "rgba(239,63,63,1)",
            "浙江",
            "rgba(239,63,63,1)",
            "湖南",
            "rgba(240,64,64,1)",
            "安徽",
            "rgba(240,64,64,1)",
            "江西",
            "rgba(241,69,65,1)",
            "山东",
            "rgba(247,86,71,1)",
            "江苏",
            "rgba(251,98,74,1)",
            "重庆",
            "rgba(252,103,75,1)",
            "四川",
            "rgba(253,107,76,1)",
            "黑龙江",
            "rgba(255,114,80,1)",
            "北京",
            "rgba(255,122,86,1)",
            "上海",
            "rgba(255,134,96,1)",
            "河北",
            "rgba(255,137,99,1)",
            "福建",
            "rgba(255,139,101,1)",
            "广西",
            "rgba(255,145,106,1)",
            "陕西",
            "rgba(255,149,109,1)",
            "云南",
            "rgba(255,157,116,1)",
            "海南",
            "rgba(255,160,119,1)",
            "贵州",
            "rgba(255,162,121,1)",
            "天津",
            "rgba(255,162,121,1)",
            "山西",
            "rgba(255,162,121,1)",
            "辽宁",
            "rgba(255,166,124,1)",
            "香港",
            "rgba(255,168,126,1)",
            "吉林",
            "rgba(255,168,126,1)",
            "甘肃",
            "rgba(255,168,126,1)",
            "新疆",
            "rgba(255,175,132,1)",
            "内蒙古",
            "rgba(255,175,132,1)",
            "宁夏",
            "rgba(255,175,132,1)",
            "台湾",
            "rgba(255,191,149,1)",
            "青海",
            "rgba(255,199,157,1)",
            "澳门",
            "rgba(255,199,157,1)",
            "西藏",
            "rgba(255,208,166,1)",
            "black"
          ]
        }
      }, app.labelLayerId);

      // var me = this;
      map.on("click", "province", (e) => {
        if (e.features.length < 1) {
          return
        };

        let properties = e.features[0].properties;

        //图层过滤器
        //map.setFilter(provinceid,["in","SHENG_ID",properties.SHENG_ID])

        let featureinfo = [];
        Object.keys(properties).map((key) => {
          let data = {};
          data["字段"] = key;
          data["值"] = properties[key];
          featureinfo.push(data);
        });

        me.setState({ featuredata: featureinfo, tableshow: true });

      })

    }

  }



}

export default App;
