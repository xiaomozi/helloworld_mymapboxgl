import MapboxDraw from 'mapbox-gl-draw';
import turf from 'turf';
import { Popup } from 'mapbox-gl';
import 'mapbox-gl-draw/dist/mapbox-gl-draw.css'
// import turf from 'turf';
import './DrawControInfo.css';
// import { map } from 'd3';

import myDeckLayer, { hexagonLayer, arcsLayer, tripLayer } from './plugins/myDeckLayer';
import earthquakedata from './data/earthquakes.json';
import Minimap from './plugins/mapboxgl-minimapControl';


import provincedata from './data/chinamap.json';
import guangdong from './data/guangdong.json';

function addBuilding(map) {
  let app = {};
  // debugger;
  // let map =  app.map;

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


function drawControl(map) {
  map.Controls = map.Controls ? map.Controls : {};
  if (map.Controls.draw) {
    map.removeControl(map.Controls.draw);
    hideDrawBox();
    map.Controls.draw = undefined;
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
    map.Controls.draw = draw;

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

  function hideDrawBox() {
    let box = document.getElementById("calculation-box");
    box.setAttribute("style", "visibility:hidden")
    // box.style.visibility = "hidden";
  }
  function showDrawBox() {
    let box = document.getElementById("calculation-box");
    box.style.visibility = "visible";
  }

}

function addGeojsonLayer(map, json, level) {
  //add level parameter to judge the country or province level
  let provinceid = "province";
  let resourceid = "province";
  let data = provincedata;


  if (level) {
    provinceid = level;
    resourceid = level;
    data = json;

  }
  if (map.getLayer(provinceid)) {
    map.removeLayer(provinceid).removeSource(resourceid);
    return;
  }
  var layers = map.getStyle().layers;
  var labelLayerId;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
      labelLayerId = layers[i].id;
      break;
    }
  }


  map.addSource(resourceid, {
    'type': 'geojson',
    'data': data
  })


  map.addLayer({
    id: provinceid,
    'source': resourceid,
    // 'source-layer': 'cn_sheng_polygon',
    'type': 'fill',
    'paint': {
      "fill-outline-color": "rgba(3,3,3,50)",
      "fill-opacity": 0.3,
      "fill-color": "rgba(255,255,255,0)"
    },
  }, labelLayerId);
  // var me = this;
  map.on("click", provinceid, (e) => {
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

    map.VRApp.setState({ featuredata: featureinfo, tableshow: true });

    function getGeoJsonBound(e) {
      // get feature bounds
      let coordinates = e.features[0].geometry.coordinates;
      let type = e.features[0].geometry.type;

      let bounds = coordinates.map((pologon) => {
        let outer = pologon[0]; //strange enough , if type == pologon outring is pologon itself
        if (pologon.length >= 2) {
          outer = pologon
        }
        let outBoundmax = outer.reduce((pre, cur) => {
          let lng = pre[0] > cur[0] ? pre[0] : cur[0];
          let lat = pre[1] > cur[1] ? pre[1] : cur[1];
          return [lng, lat]
        }, [0, 0])

        let outBoundmin = outer.reduce((pre, cur) => {
          let lng = pre[0] < cur[0] ? pre[0] : cur[0];
          let lat = pre[1] < cur[1] ? pre[1] : cur[1];
          return [lng, lat]
        })
        return [outBoundmin, outBoundmax]
      })

      let bound = bounds.reduce((bound, cur) => {
        let minLng = Math.min(cur[0][0], cur[1][0], bound[0][0], bound[1][0]);
        let minLat = Math.min(cur[0][1], cur[1][1], bound[0][1], bound[1][1]);
        let maxLng = Math.max(cur[0][0], cur[1][0], bound[0][0], bound[1][0]);
        let maxLat = Math.max(cur[0][1], cur[1][1], bound[0][1], bound[1][1]);
        return [[minLng, minLat], [maxLng, maxLat]]
      })

      return bound

    }

    // console.log(bound);


    map.fitBounds(getGeoJsonBound(e));

  })

}
//add province layer 
function addProvince(map) {
  addGeojsonLayer(map);
  addGeojsonLayer(map, guangdong, 'guangdong');



}

function addHexagonLayer(map) {
  map.addLayer(hexagonLayer, 'waterway-label')
  map.flyTo({
    center: [-2.67, 52.74]
  });
  // debugger;

  updateMapTitle(map, '英国交通事故地图')
}

function addEaseLayer(map) {
  map.addLayer(arcsLayer, 'waterway-label');
  map.addLayer(myDeckLayer, 'waterway-label');

  map.flyTo({
    center: [-92.67, 35.74]
  });
  updateMapTitle(map, '美国居民迁徙地图')
}

function ODFly(map) {
  updateMapTitle(map, '全国航班飞行地图')

  //Math.ceil(Math.random()*15);   
  //center:【120，30】
  let center = [121.81, 31.152]
  let ODs = [];
  for (let i = 0; i < 100; i++) {
    ODs.push([[center[0], center[1]], [center[0] - Math.ceil(Math.random() * 20), center[1] + Math.ceil(Math.random() * 20)]])
  }


  ODs.push([[112.0, 22.0], [115.34, 40.04]])
  ODs.push([[113.0, 22.0], [115.34, 40.04]])
  ODs.push([[115.0, 22.0], [115.34, 40.04]])

  ODs.push([[121.28, 31.31], [102.47, 18.87]])
  ODs.push([[104.24, 30.716], [102.47, 18.87]])
  ODs.push([[113.64, 23.27], [102.47, 18.87]])
  ODs.push([[114.09, 30.07], [102.47, 18.87]])

  let app = map.VRApp;
  let routeSource = "flyRoute";
  let pointSource = "flyPoint";
  let routeLayerId = routeSource + "Layer";
  let pointLayerId = pointSource + "Layer";
  if (app.flied) {

    cancelAnimationFrame(app.moveHandlerId);
    // remove layers
    // var layers = map.getStyle().layers;

    // var flys = layers.filter((lay) => lay.id.indexOf('fly') == 0)

    // flys.map((layer) => map.removeLayer(layer));
    map.removeLayer(routeLayerId);
    map.removeLayer(pointLayerId);
    map.removeSource(routeSource)
    map.removeSource(pointSource)
    // var sources = map.getStyle().sources;
    // // Object.keys(sources)
    // var srcs = Object.keys(sources).filter((src) => src.indexOf('fly') == 0)

    // srcs.map((src) => map.removeSource(src));
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

  const initRoute = Object.assign({}, route);

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
  var step = 100;
  let stepDistance = 4;
  // point.features.pop();
  function _updateroute() {
    // var distances = [],arcs = [];
    route.features.map((feature) => {
      let distance = turf.lineDistance(feature, 'kilometers');
      // distances.push(distance);
      let arc = [];
      // const step = 500;
      // let stepDistance = distance / step;

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

  // // Used to increment the value of the point measurement against the route.
  // let routeSource = "flyRoute" ;
  // // let routeSource = "fly" + (Math.random() + Date.now()).toString();
  // let pointSource = "flyPoint" ;
  // // let pointSource = "fly" + (Math.random() + Date.now()).toString();
  // let routeLayerId = routeSource + "Layer";
  // let pointLayerId = pointSource + "Layer";


  map.addSource(routeSource, {
    'type': 'geojson',
    'data': initRoute
  });



  map.addSource(pointSource, {
    'type': 'geojson',
    'data': point
  });

  map.addLayer({
    'id': routeLayerId,
    'source': routeSource,
    'type': 'line',
    'paint': {
      'line-width': 1.5,
      'line-color': 'rgba(160, 32, 240, 1)',
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

  const maxNum = route.features.reduce((me, next) => {
    return me > next.geometry.coordinates.length ? me : next.geometry.coordinates.length
  })
  var counter = 0;
  var moveHandlerId;
  function animate(t) {
    console.log(counter)
    // console.log(t,'time');

    if (counter > maxNum) {
      cancelAnimationFrame(app.moveHandlerId);
      alert("done")
      return;
    }
    route.features.map((line, index) => {
      let p = point.features[index];
      // console.log(counter, index)
      if (line.geometry.coordinates.length > counter) {
        p.geometry.coordinates = line.geometry.coordinates[counter];
        p.properties.bearing = turf.bearing(
          turf.point(line.geometry.coordinates[0]),
          turf.point(line.geometry.coordinates[1])
        )
      }

    });

    // Update the source with this new data.
    map.getSource(pointSource).setData(point);

    // // Request the next frame of animation so long the end has not been reached.
    // if (counter < step) {
    app.moveHandlerId = requestAnimationFrame(animate);
    // }
    counter = counter + 1;
  }

  animate();
  // return moveHandlerId;

}

function addHotLayer(map) {
  let app = map.VRApp;
  if (app.hotLayer) {

    removeEarthquake();
    updateMapTitle(map, "")
    app.hotLayer = false;

  } else {
    earthquakes();

    updateMapTitle(map, '地震热力地图')
    app.hotLayer = true;
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
    let pulsingDot = new _PulsingPointControl();
    map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
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



function addCluster(map) {
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

    new Popup()
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

function updateMapTitle(map, newtitle) {
  map.VRApp.setState({
    mapTitle: newtitle ? newtitle : "地图"
  })
}

function _PulsingPointControl() {
  var size = 200;

  // implementation of CustomLayerInterface to draw a pulsing dot icon on the map
  // see https://docs.mapbox.com/mapbox-gl-js/api/#customlayerinterface for more info
  var pulsingDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),

    // get rendering context for the map canvas when layer is added to the map
    onAdd: function (map) {
      this._map = map;
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
      this._map.triggerRepaint();

      // return `true` to let the map know that the image was updated
      return true;
    }
  };

  return pulsingDot;
}

function overView(map) {
  let app = map.VRApp;
  let style = 'mapbox://styles/mapbox/light-v10'
  if (app.overview) {
    map.removeControl(app.overview);
    app.overview = undefined;

  } else {
    app.overview = new Minimap({
      center: map.getCenter(),
      zoom: 2,
      style: style,
    });
    map.addControl(app.overview, 'bottom-left');

  }


}

function addRenderDem(map) {
  map.addSource("dems", {
    "type": "raster-dem",
    "url": "mapbox://mapbox.terrain-rgb"

  })

  map.addLayer({
    'id': "dem",
    "source": "dems",
    'type': 'hillshade',
    'paint': {
      'hillshade-highlight-color': '#0dcae3',
      'hillshade-accent-color': '#0dcae3',
      'hillshade-shadow-color': 'black',
      'hillshade-illumination-direction': 90,
      'hillshade-exaggeration': 0.56,
      'hillshade-illumination-anchor': 'map'
    }

  })
}

function addTripLayer(map) {
  debugger;
  map.addLayer(tripLayer, 'waterway-label');
}

export default {
  addBuilding: addBuilding,
  drawControl,
  addProvince,
  addHexagonLayer,
  addEaseLayer,
  ODFly,
  addHotLayer,
  addCluster,
  overView,
  addRenderDem,
  addTripLayer,
};