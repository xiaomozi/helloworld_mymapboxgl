import MapboxDraw from "mapbox-gl-draw";
import turf from "turf";
import { randomPoint } from "@turf/random";

import { Popup } from "mapbox-gl";
import "mapbox-gl-draw/dist/mapbox-gl-draw.css"
// import turf from "turf";
import "./DrawControInfo.css";
// import { map } from "d3";
// import * as d3 from 'd3';
import myDeckLayer, { hexagonLayer, arcsLayer, tripLayer } from "./plugins/myDeckLayer";
import earthquakedata from "./data/earthquakes.json";
import earthquakeslastyear from './data/earthquackslastyear.json';
import Minimap from "./plugins/mapboxgl-minimapControl";


import provincedata from "./data/chinamap";
import guangdong from "./data/guangdong.json";

import indoorData from "./data/indoor-3d-map.json";

import MyLegend from './plugins/controles/legend';
import { variance } from "d3";


function addBuilding(map) {
  let app = map.VRApp;
  // debugger;
  // let map =  app.map;

  if (map.getLayer("3d-buildings")) {
    map.removeLayer("3d-buildings")
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
    if (layers[i].type === "symbol" && layers[i].layout["text-field"]) {
      app.labelLayerId = layers[i].id;
      break;
    }
  }
  console.log(app.labelLayerId)
  map.addLayer({
    "id": "3d-buildings",
    "source": "composite",
    "source-layer": "building",
    "filter": ["==", "extrude", "true"],
    "type": "fill-extrusion",
    "minzoom": 13,
    "paint": {
      "fill-extrusion-color": [
        "interpolate", ["linear"], ["get", "height"],
        0, "blue",
        20.05, "blue",
        100, "royalblue"
      ],

      // 使用“插值”表达式为
      // 建筑物作为用户放大
      "fill-extrusion-height": [
        "interpolate", ["linear"], ["zoom"],
        15, 100,
        15.05, ["get", "height"]
      ],
      "fill-extrusion-base": [
        "interpolate", ["linear"], ["zoom"],
        15, 0,
        15.05, ["get", "min_height"]
      ],
      "fill-extrusion-opacity": .6
    }
  }, app.labelLayerId);

  map.on("click", "3d-buildings", (e) => {
    e.preventDefault();
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

  })
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

    map.on("draw.create", updateArea);
    map.on("draw.delete", updateArea);
    map.on("draw.update", updateArea);

  }

  function updateArea(e) {

    var data = draw.getAll();
    var answer = document.getElementById("calculated-area");
    var result;
    if (data.features.length > 0) {
      let lastFeature = data.features.pop();
     // console.log(JSON.stringify(lastFeature.geometry.coordinates));

      switch (lastFeature.geometry.type) {
        case "LineString":
          result = turf.lineDistance(lastFeature);
          // result = calculateLength(json);
          answer.innerHTML =
            "<p><strong>" +
            result.toFixed(2) +
            "</strong></p><p>千米</p>";
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
            "<p><strong>" +
            rounded_area +
            "</strong></p><p>平方米</p>";
          break;
        case "Point":
          result = lastFeature.geometry.coordinates;
          answer.innerHTML = "lng: " + result[0].toFixed(5) + ";<br> lat:" + result[1].toFixed(5);

          break;
        default:
          break;

      }

    } else {
      answer.innerHTML = "";
      if (e.type !== "draw.delete")
        alert("Use the draw tools to draw a polygon!");
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
  let data = Object.assign({}, provincedata);


  if (level) {
    provinceid = level;
    resourceid = level;
    data = json;

  }
  if (map.getLayer(provinceid)) {
    map.removeLayer(provinceid).removeSource(resourceid);
    updateMapTitle(map, "中国地图");
    map.VRApp.setState({ tableshow: false });
    let selData = {
      type: "FeatureCollection",
      features: [

      ]
    }
    if (map.getSource("selectedFeature")) {
      map.getSource("selectedFeature").setData(selData);
    }
    return;
  }
  updateMapTitle(map, "中国行省地图");
  var layers = map.getStyle().layers;
  var labelLayerId;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].type === "symbol" && layers[i].layout["text-field"]) {
      labelLayerId = layers[i].id;
      break;
    }
  }

  //add a value field and a default value 0 to geojson
  // add an id to each feature
  data.features.map((feature, index) => {
    // feature.properties.value = 255;
    feature.id = index;

  })

  map.addSource(resourceid, {
    "type": "geojson",
    "data": data
  })

  map.fitBounds(turf.bbox(data));

  map.addLayer({
    id: provinceid,
    "source": resourceid,
    "type": "fill",
    "paint": {
      "fill-outline-color": "rgba(3,3,3,50)",
      // "fill-opacity": 1,
      "fill-color": [
        "rgb",
        255,
        255,
        255
      ],
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.5,
        1
      ]
    },
  }, labelLayerId);
  // var me = this;
  map.VRApp.hoveredStateId = null;
  map.on("mousemove", provinceid, function (e) {
    if (e.features.length > 0) {
      if (map.VRApp.hoveredStateId) {
        map.setFeatureState(
          { source: resourceid, id: map.VRApp.hoveredStateId },
          { hover: false }
        );
      }
      map.VRApp.hoveredStateId = e.features[0].id;
      map.setFeatureState(
        { source: resourceid, id: map.VRApp.hoveredStateId },
        { hover: true }
      );
    }

  });

  map.on("mouseleave", provinceid, function (e) {

    if (map.VRApp.hoveredStateId) {
      map.setFeatureState(
        { source: resourceid, id: map.VRApp.hoveredStateId },
        { hover: false }
      );
    }
    map.VRApp.hoveredStateId = null;

  });

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

    // map.setPaintProperty(provinceid, "fill-outline-color", "cyan");
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
      debugger;
      return bound

    }

    // console.log(bound);


    let bound = turf.bbox(e.features[0]);

    map.fitBounds(bound);
    let selData = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: e.features[0].geometry
        }
      ]
    }
    if (map.getSource("selectedFeature")) {
      map.getSource("selectedFeature").setData(selData);
    }

  })

}

function updateProvinceLayer(map, json) {
  let themedata = json ? json : {};

  try {

    //{}
    if (Object.keys(themedata).length == 0) {

      const resourceid = "province";
      map.getSource(resourceid).setData(JSON.parse(JSON.stringify(provincedata)));

      map.setPaintProperty(resourceid, "fill-color", [
        "rgb",
        255, 255, 255
      ])
      return

    }
    //{'dd':null}
    if (Object.values(themedata).length == 1) {
      if (!Object.values(themedata)[0] ) {
        const resourceid = "province";
        map.getSource(resourceid).setData(JSON.parse(JSON.stringify(provincedata)));

        map.setPaintProperty(resourceid, "fill-color", [
          "rgb",
          255, 255, 255
        ])
        return
      }
    }

    const maxValue = Math.max(...Object.values(themedata));
    const minValue = Math.min(...Object.values(themedata));
    map.legend.update(minValue,maxValue);

    function rescaledata(pre){
      
      const maxExtent = 255;
      const minExtent = 50;
      return Math.ceil((pre-minValue + 1) * (maxExtent-minExtent) / (maxValue + 1 - minValue) + minExtent-1);
    }
    let data = JSON.parse(JSON.stringify(provincedata));
    data.features.map((feature) => {

      Object.keys(themedata).map((key) => {
        if (feature.properties.name.indexOf(key) != -1) {
          feature.properties.value = themedata[key];
          feature.properties.valueColor = rescaledata(themedata[key]);
        }
      })

    })

    const resourceid = "province";
    const provinceid = "province";

    map.setPaintProperty(provinceid, "fill-color", [
      "rgb",
      ["case", ["has", "valueColor"], ["get", "valueColor"], 255],
      ["case", ["has", "valueColor"], 20, 255],
      ["case", ["has", "valueColor"], 20, 255]
    ])
    map.getSource(resourceid).setData(data);

  } catch (error) {
    alert("please add the province layer first")
  }
}
//add province layer 
function addProvince(map) {
  addGeojsonLayer(map);
  if(!map.legend){
    map.legend = MyLegend();
    debugger;
    map.addControl(map.legend,"bottom-left")
    
  }else{
    map.removeControl(map.legend)
    map.legend = null;
  }
  // addGeojsonLayer(map, guangdong, "guangdong");

}

function addHexagonLayer(map) {
  if (map.VRApp.HexagonLayer) {
    map.removeLayer("heatmap")
    map.VRApp.HexagonLayer = false;
    return
  }
  map.VRApp.HexagonLayer = true;
  let nextlayer = map.getLayer('waterway-label')
  if(nextlayer){
    map.addLayer(hexagonLayer(), 'waterway-label')

  }else{
    map.addLayer(hexagonLayer(), nextlayer)

  }
  map.flyTo({
    center: [-2.67, 52.74]
  });
  // debugger;

  updateMapTitle(map, "英国交通事故地图")
}

function addEaseLayer(map) {
  if (map.VRApp.easeLayer) {
    map.removeLayer("scatterplotLayer")
    debugger;
    map.removeLayer("arcs")
    map.VRApp.easeLayer = false;
    return
  }
  map.VRApp.easeLayer = true;
  let nextlayer =  map.getLayer("waterway-label");
  if(nextlayer){
    map.addLayer(arcsLayer(), "waterway-label");
    map.addLayer(myDeckLayer(), "waterway-label");
  }else{
    map.addLayer(arcsLayer(), nextlayer);
    map.addLayer(myDeckLayer(), nextlayer);
  }
  

  map.flyTo({
    center: [-92.67, 35.74]
  });
  updateMapTitle(map, "美国居民迁徙地图")
}

function ODFly(map) {
  updateMapTitle(map, "全国航班飞行地图")

  //Math.ceil(Math.random()*15);   
  //center:【120，30】
  let ODs = [];

  // let center = [121.81, 31.152]
  // for (let i = 0; i < 50; i++) {
  //   ODs.push([[center[0], center[1]], [center[0] - Math.ceil(Math.random() * 20), center[1] + Math.ceil(Math.random() * 20)]])
  // }

  // let center1 = [109.81, 23.152]
  // for (let i = 0; i < 50; i++) {
  //   ODs.push([[center1[0] + Math.ceil(Math.random() * 5), center1[1] + Math.ceil(Math.random() * 25)], [center1[0], center1[1]]])
  // }

//-87.61 ,41.87
// -87.62 ,41.86

// -87.62, 41.865
// -87.62 ,41.87
//-87.61892,41.86457 -87.61921,41.86639
//ODs.push([[-87.61833488428364,41.866675445125225],[-87.61830903398912,41.86576295494416],[-87.61806956313833,41.865760952852725],[-87.61806956313833,41.86578672810654],[-87.61736085940719,41.86579654724807],[-87.6173575631105,41.865675035265525],[-87.61722571125372,41.86567380787088],[-87.61722571125372,41.8655940271494],[-87.61682521123835,41.86559525454555],[-87.61682438991868,41.86567903164422],[-87.61669529225254,41.86568096411628],[-87.61669918464439,41.86581140587799],[-87.61594466569298,41.86582153505054],[-87.61594554374146,41.86579864884524],[-87.61570025541522,41.865799964568936],[-87.61570828938017,41.866136505992614],[-87.61543952612777,41.866138756239366],[-87.61544325057733,41.86636064545911],[-87.61571513537116,41.86636619267975],[-87.61572630871919,41.8667184402035],[-87.61596467346955,41.866715666608286],[-87.61596467346955,41.866685157055855],[-87.61672446111334,41.86667960986284],[-87.61670956331635,41.86679610081359],[-87.61685854128547,41.866798874405305],[-87.61685854128547,41.86685711979848],[-87.6172384351077,41.8668598933871],[-87.6172384351077,41.86679610081359],[-87.61740231087379,41.86679055363024],[-87.61740231087379,41.86667960986284],[-87.61808760953271,41.866662968281105],[-87.61808760953271,41.86669070424833],[-87.61833342318155,41.86668238345962]])
ODs.push([[-87.61816016588162,41.865021643668],[-87.61815838732088,41.86519859953938],[-87.61555868612129,41.865237626881054],[-87.61557903274625,41.865039719715014],[-87.61518323664133,41.865066031467364],[-87.61521043203282,41.865826520267376],[-87.61505966330793,41.8659261985477],[-87.61420976660311,41.86595991918949],[-87.61421155856249,41.86622353094833],[-87.61434162932952,41.866498350430334],[-87.61426954912669,41.86664779109441],[-87.61404299308849,41.86673045173765],[-87.61374229053821,41.86663681228103],[-87.61373765246024,41.86639513149109],[-87.61312117383582,41.86643884427437]])
ODs.push([[-87.61758563971246,41.865521377266674],[-87.61885354153442,41.86549113296806],[-87.61884683720926,41.86635353911021],[-87.61863663668295,41.86636241567146],[-87.61862499560479,41.86443387472747],[-87.61864956948214,41.86403980190266],[-87.61853806981513,41.86345598961353]])
ODs.push([[-87.6183197673746,41.868218250837344],[-87.6189211805531,41.86753923141808],[-87.61933505628886,41.86700949494829],[-87.61953552734836,41.86645085900679],[-87.61954846096513,41.86608003762606],[-87.61934798990563,41.86503979993506],[-87.61935737380884,41.86497460504603],[-87.61396202014927,41.8650496359605],[-87.61392929746317,41.86581536299806],[-87.61375340322198,41.86611700303342],[-87.61095332814362,41.86613937382728]])
ODs.push([[-87.61394669601806,41.86639133441591],[-87.61414339248988,41.86628659256834],[-87.61419005989445,41.866115964750065],[-87.61413076932706,41.86578876091997],[-87.61411855094451,41.86503733560585],[-87.61899348499028,41.86498885026947],[-87.61925555899553,41.866243479270224],[-87.61912375309254,41.866782040025726],[-87.61896090623452,41.86719860958112],[-87.61807483740698,41.86813182871725]])


  ODs.push([[112.0, 23.0], [113.34, 22.04]])
  ODs.push([[113.0, 24.0], [113.34, 22.04]])
  ODs.push([[114.0, 22.0], [113.34, 22.04]])

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

    // var flys = layers.filter((lay) => lay.id.indexOf("fly") == 0)

    // flys.map((layer) => map.removeLayer(layer));
    if(map.getLayer(routeLayerId)) map.removeLayer(routeLayerId);
    if(map.getLayer(pointLayerId)) map.removeLayer(pointLayerId);
    if(map.getSource(routeSource)) map.removeSource(routeSource)
    if(map.getSource(pointSource)) map.removeSource(pointSource)
    // var sources = map.getStyle().sources;
    // // Object.keys(sources)
    // var srcs = Object.keys(sources).filter((src) => src.indexOf("fly") == 0)

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
    "type": "FeatureCollection",
    "features": [
      // {
      //   "type": "Feature",
      //   "geometry": {
      //     "type": "LineString",
      //     "coordinates": [origin, destination]
      //   }
      // }
    ]
  };

  var featureLine = function (coords) {
    return {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [...coords]
      }
    }
  }

  function _addFeatureToRoute(feature) {

    route.features.push(feature)
  }

  function addRoute(coords) {
    _addFeatureToRoute(featureLine(coords));

  }


  ///test[112.98, 22.16], [116.34, 40.04]
  // route.features.pop();
  ODs.map((od) => {
    addRoute(od);

  })
  // addRoute([112.0, 22.0], [115.34, 40.04]);
  // addRoute([111.0, 22.0], [115.34, 40.04]);
  // addRoute([112.0, 21.0], [115.34, 40.04]);

  const initRoute =JSON.parse(JSON.stringify(route))

  // A single point that animates along the route.
  // Coordinates are initially set to origin.
  var point = {
    "type": "FeatureCollection",
    "features": [
      // {
      //   "type": "Feature",
      //   "properties": {},
      //   "geometry": {
      //     "type": "Point",
      //     "coordinates": origin
      //   }
      // }
    ]
  };
  var step = 100;
  let stepDistance = 0.002;//km
  // point.features.pop();
  function _updateroute() {
    // var distances = [],arcs = [];
    route.features.map((feature) => {
      let distance = turf.lineDistance(feature, "kilometers");
      // distances.push(distance);
      let arc = [];
      // const step = 500;
      // let stepDistance = distance / step;

      for (let i = 0; i < distance; i += stepDistance) {
        let segment = turf.along(feature, i, "kilometers");
        arc.push(segment.geometry.coordinates);
      }
      let end = feature.geometry.coordinates.slice(-1)[0];//add the end point
      feature.geometry.coordinates = arc;
      feature.geometry.coordinates.push(end);

      //update point ,add each line start point to point
      point.features.push({
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": arc[0]
        }
      });

    })

  }

  _updateroute();
  // // Calculate the distance in kilometers between route start/end point.
  // var lineDistance = turf.lineDistance(route.features[0], "kilometers");



  map.addSource(routeSource, {
    "type": "geojson",
    lineMetrics: true,
    "data": initRoute
  });



  map.addSource(pointSource, {
    "type": "geojson",
    "data": point
  });

  // add routelayer
  map.addLayer({
    "id": routeLayerId,
    "source": routeSource,
    "type": "line",
    "paint": {
      "line-width": 1,
      // "line-color": "yellow",
      "line-color": "rgb(200,200,50)",
      "line-opacity": 1,
      // "line-blur": 1,
      // "line-gradient": [
      //   "interpolate",
      //   ["linear"],
      //   ["line-progress"],
      //   0,

      //   "cyan",

      //   0.7,
      //   "yellow",
      //   1,
      //   "red"
      // ]
    },
    layout: {
      "line-cap": "round",
      "line-join": "round"
    }
  });
  const pulsingDot = _CoustomPulsingPointControl(15,{r:255,g:255,b:0},{r:200,g:200,b:100});

  map.addImage("fly-dot", pulsingDot, { pixelRatio: 1 });
  // const icon = _PulsingPointControl(200);
  map.addLayer({
    "id": pointLayerId,
    "source": pointSource,
    "type": "symbol",
    "layout": {
      // "icon-image": "airport-15",
      "icon-image": "fly-dot",
      "icon-rotate": ["get", "bearing"],
      "icon-rotation-alignment": "map",
      "icon-allow-overlap": true,
      "icon-ignore-placement": true
    }
  });

  const maxNum = route.features.reduce((me, next) => {
    return me > next.geometry.coordinates.length ? me : next.geometry.coordinates.length
  })
  var counter = 1;
  var moveHandlerId;
  function animate(t) {
    // console.log(counter)
    // console.log(t,"time");

    if (counter > maxNum) {
      // cancelAnimationFrame(app.moveHandlerId);
      // alert("done")
      counter = 1;//整体开启循环
      // return;
    }
    route.features.map((line, index) => {
      let p = point.features[index];
      let length = line.geometry.coordinates.length;
      // console.log(counter, index)
      if (length > counter) {
        p.geometry.coordinates = line.geometry.coordinates[counter];
        p.properties.bearing = turf.bearing(
          turf.point(line.geometry.coordinates[counter-1]),
          turf.point(line.geometry.coordinates[counter])
        )
      } else{
        //单条路线开始重新播放
        p.geometry.coordinates = line.geometry.coordinates[counter%length];
        p.properties.bearing = turf.bearing(
          turf.point(line.geometry.coordinates[0]),
          turf.point(line.geometry.coordinates[1])
        )
      }

    });

    // Update the source with this new data.
    let ps = map.getSource(pointSource);
    if(ps){
      ps.setData(point);
    
    }

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
  // var points = randomPoint(25, {bbox: [-180, -90, 180, 90]})
  let app = map.VRApp;
  if (app.hotLayer) {

    removeEarthquake();
    map.removeLayer("earthquack-tin");
    map.removeSource("tin")
    updateMapTitle(map, "")
    app.hotLayer = false;

  } else {
    earthquakes();

    updateMapTitle(map, "地震热力地图")
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

    const tin = turf.tin(earthquakedata, "mag");
    map.addSource("tin", {
      type: "geojson",
      data: tin
    })

    var nextLayer = map.getLayer("waterway-label")
    if(nextLayer){
      nextLayer = "waterway-label"
    }

    map.addLayer({
      id: "earthquack-tin",
      type: "fill",
      source: "tin",
      paint: {
        "fill-color": "rgba(0,0,0,0)",
        "fill-opacity": 1,
        "fill-outline-color": "gray"
      }
    })

    debugger;

    map.addLayer({
      "id": "earthquakes-heat",
      "type": "heatmap",
      "source": "earthquakes",
      "maxzoom": 9,
      "paint": {
        // Increase the heatmap weight based on frequency and property magnitude
        "heatmap-weight": [
          "interpolate",
          ["linear"],
          ["get", "mag"],
          0,
          0,
          6,
          1
        ],
        // Increase the heatmap color weight weight by zoom level
        // heatmap-intensity is a multiplier on top of heatmap-weight
        "heatmap-intensity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          1,
          9,
          3
        ],
        // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
        // Begin color ramp at 0-stop with a 0-transparancy color
        // to create a blur-like effect.
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(33,102,172,0)",
          0.2,
          "rgb(103,169,207)",
          0.4,
          "rgb(209,229,240)",
          0.6,
          "rgb(253,219,199)",
          0.8,
          "rgb(239,138,98)",
          1,
          "rgb(178,24,43)"
        ],
        // Adjust the heatmap radius by zoom level
        "heatmap-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          2,
          9,
          20
        ],
        // Transition from heatmap to circle layer by zoom level
        "heatmap-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          7,
          1,
          9,
          0
        ]
      }
    },
    nextLayer);

    let pulsingDot = new _PulsingPointControl(100);
    map.addImage("pulsing-dot", pulsingDot, { pixelRatio: 2 });
    map.addLayer({
      id: "earthIcon",
      type: "symbol",
      source: "earthquakes",
      layout: {
        "icon-image": "pulsing-dot"
      },
    });

    map.addLayer(
      {
        "id": "earthquakes-point",
        "type": "circle",
        "source": "earthquakes",
        "minzoom": 7,
        "paint": {
          // Size circle radius by earthquake magnitude and zoom level
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            7,
            ["interpolate", ["linear"], ["get", "mag"], 1, 1, 6, 4],
            16,
            ["interpolate", ["linear"], ["get", "mag"], 1, 5, 6, 50]
          ],
          // Color circle by earthquake magnitude
          "circle-color": [
            "interpolate",
            ["linear"],
            ["get", "mag"],
            1,
            "rgba(33,102,172,0)",
            2,
            "rgb(103,169,207)",
            3,
            "rgb(209,229,240)",
            4,
            "rgb(253,219,199)",
            5,
            "rgb(239,138,98)",
            6,
            "rgb(178,24,43)"
          ],
          "circle-stroke-color": "white",
          "circle-stroke-width": 1,
          // Transition from heatmap to circle layer by zoom level
          "circle-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            7,
            0,
            8,
            1
          ]
        }
      },
      nextLayer
    );
  }
  function removeEarthquake() {


    if (map.getLayer("earthquakes-point") && map.getLayer("earthquakes-heat")) {
      map.removeLayer("earthquakes-point")
      map.removeLayer("earthquakes-heat");
      map.removeLayer("earthIcon")

    }
    if (map.getSource("earthquakes")) {
      map.removeSource("earthquakes");

    }

  }
}



function addCluster(map) {
  let earthquakes = "earthquakesCluster";

  let app = map.VRApp;
  if (app.ClusterLayer) {
    map.removeLayer("clusters");
    map.removeLayer("cluster-count");
    map.removeLayer("unclustered-point");
    map.removeSource(earthquakes)
    app.ClusterLayer = false;
    updateMapTitle(map, "中国地图");
  } else {
    app.ClusterLayer = true;
    updateMapTitle(map, "世界最近地震分布地图");

    if (!map.getSource(earthquakes)) {
      map.addSource(earthquakes, {
        type: "geojson",
        // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
        // from 12/22/15 to 1/21/16 as logged by USGS" Earthquake hazards program.
        data: earthquakeslastyear,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
      });
    }

    // const tin = turf.tin(earthquakeslastyear, "mag");
    // map.addSource("tin-last", {
    //   type: "geojson",
    //   data: tin
    // })

    // map.addLayer({
    //   id: "earthquack-tin-last",
    //   type: "fill",
    //   source: "tin-last",
    //   paint: {
    //     "fill-color": "rgba(0,0,0,0)",
    //     "fill-opacity": 1,
    //     "fill-outline-color": "gray"
    //   }
    // })


    map.addLayer({
      id: "clusters",
      type: "circle",
      source: earthquakes,
      filter: ["has", "point_count"],
      paint: {
        // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
        // with three steps to implement three types of circles:
        //   * Blue, 20px circles when point count is less than 100
        //   * Yellow, 30px circles when point count is between 100 and 750
        //   * Pink, 40px circles when point count is greater than or equal to 750
        "circle-color": [
          "step",
          ["get", "point_count"],
          "#51bbd6",
          100,
          "#f1f075",
          750,
          "#f28cb1"
        ],
        "circle-radius": [
          "step",
          ["get", "point_count"],
          20,
          100,
          30,
          750,
          40
        ]
      }
    });

    map.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: earthquakes,
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 12
      }
    });


    map.addLayer({
      id: "unclustered-point",
      type: "circle",
      source: earthquakes,
      filter: ["!", ["has", "point_count"]],

      paint: {
        "circle-color": "lightblue",
        "circle-radius": 4,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#fff"
      }
    });

    // inspect a cluster on click
    map.on("click", "clusters", function (e) {
      var features = map.queryRenderedFeatures(e.point, {
        layers: ["clusters"]
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
    map.on("click", "unclustered-point", function (e) {
      var coordinates = e.features[0].geometry.coordinates.slice();
      var mag = e.features[0].properties.mag;
      var tsunami;

      if (e.features[0].properties.tsunami === 1) {
        tsunami = "yes";
      } else {
        tsunami = "no";
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
          "magnitude: " + mag + "<br>Was there a tsunami?: " + tsunami
        )
        .addTo(map);
    });

    map.on("mouseenter", "clusters", function () {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "clusters", function () {
      map.getCanvas().style.cursor = "";
    });
  }



}

function updateMapTitle(map, newtitle) {
  map.VRApp.setState({
    mapTitle: newtitle ? newtitle : "地图"
  })
}

function _FlyingTraceIcon(size) {
  var size = size ? size : 200;

  // implementation of CustomLayerInterface to draw a pulsing dot icon on the map
  // see https://docs.mapbox.com/mapbox-gl-js/api/#customlayerinterface for more info
  var pulsingDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),

    // get rendering context for the map canvas when layer is added to the map
    onAdd: function (map) {
      this._map = map;
      var canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;
      this.context = canvas.getContext("2d");
    },

    // called once before every frame where the icon will be used
    render: function () {
      var duration = 1000;
      var t = (performance.now() % duration) / duration;
      var radius = (size / 2) * 0.3;
      var context = this.context;

      context.clearRect(0, 0, this.width, this.height);

      context.beginPath();
      context.arc(
        this.width / 2,
        this.height / 2,
        1.5,
        0,
        Math.PI * 2
      );
      context.strokeStyle = "rgba(255, 255,0,1)";
      // context.fill();
      context.stroke();


      context.beginPath(); //新建一条path
      let grd = context.createLinearGradient(0, 0, 0, this.width);//创建一个渐变色
      grd.addColorStop(0, "yellow");
      grd.addColorStop(1, "rgba(255,255,0,0.1)");
      context.strokeStyle = grd;
      //context.lineWidth = 2;

      context.moveTo(this.width / 2, this.height / 2); //把画笔移动到指定的坐标
      context.lineTo(this.width / 2, this.width);  //绘制一条从当前位置到指定坐标(200, 50)的直线.
      //闭合路径。会拉一条从当前点到path起始点的直线。如果当前点与起始点重合，则什么都不做
      context.closePath();
      context.stroke(); //绘制路径。


      // update this image"s data with data from the canvas
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

function _PulsingPointControl(size) {
  var size = size ? size : 200;

  // implementation of CustomLayerInterface to draw a pulsing dot icon on the map
  // see https://docs.mapbox.com/mapbox-gl-js/api/#customlayerinterface for more info
  var pulsingDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),

    // get rendering context for the map canvas when layer is added to the map
    onAdd: function (map) {
      this._map = map;
      var canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;
      this.context = canvas.getContext("2d");
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
      context.fillStyle = "rgba(255, 200, 200," + (1 - t) + ")";
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
      context.fillStyle = "rgba(255, 100, 100, 1)";
      context.strokeStyle = "white";
      context.lineWidth = 2 + 4 * (1 - t);
      context.fill();
      context.stroke();

      // context.beginPath(); //新建一条path
      // var grd = context.createLinearGradient(0, 0, 10,0);
      // grd.addColorStop(0, "white");
      // grd.addColorStop(1, "yellow");
      // context.strokeStyle = grd;
      // context.lineWidth = 1 + 2 * (1 - t);

      // context.moveTo(this.width / 2, this.height / 2); //把画笔移动到指定的坐标
      // context.lineTo(this.width/2,0);  //绘制一条从当前位置到指定坐标(200, 50)的直线.
      // //闭合路径。会拉一条从当前点到path起始点的直线。如果当前点与起始点重合，则什么都不做
      // context.closePath();
      // context.stroke(); //绘制路径。


      // update this image"s data with data from the canvas
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
function _CoustomPulsingPointControl(size,color1,color2) {
  var size = size ? size : 200;

  // implementation of CustomLayerInterface to draw a pulsing dot icon on the map
  // see https://docs.mapbox.com/mapbox-gl-js/api/#customlayerinterface for more info
  var pulsingDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),

    // get rendering context for the map canvas when layer is added to the map
    onAdd: function (map) {
      this._map = map;
      var canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;
      this.context = canvas.getContext("2d");
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
      context.fillStyle = `rgba(${color1.r}, ${color1.g}, ${color1.b},${1-t} )`;
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
      context.fillStyle = `rgba(${color2.r}, ${color2.g}, ${color2.b}, 1)`;
      context.strokeStyle = "yellow";
      context.lineWidth = 1 + 4 * (1 - t);
      context.fill();
      context.stroke();

      // context.beginPath(); //新建一条path
      // var grd = context.createLinearGradient(0, 0, 10,0);
      // grd.addColorStop(0, "white");
      // grd.addColorStop(1, "yellow");
      // context.strokeStyle = grd;
      // context.lineWidth = 1 + 2 * (1 - t);

      // context.moveTo(this.width / 2, this.height / 2); //把画笔移动到指定的坐标
      // context.lineTo(this.width/2,0);  //绘制一条从当前位置到指定坐标(200, 50)的直线.
      // //闭合路径。会拉一条从当前点到path起始点的直线。如果当前点与起始点重合，则什么都不做
      // context.closePath();
      // context.stroke(); //绘制路径。


      // update this image"s data with data from the canvas
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
  let style = "mapbox://styles/mapbox/light-v10"
  if (app.overview) {
    map.removeControl(app.overview);
    app.overview = undefined;

  } else {
    app.overview = new Minimap({
      center: map.getCenter(),
      zoom: 2,
      style: style,
    });
    map.addControl(app.overview, "bottom-left");

  }


}

function addRenderDem(map) {
  map.addSource("dems", {
    "type": "raster-dem",
    "url": "mapbox://mapbox.terrain-rgb"

  })

  map.addLayer({
    "id": "dem",
    "source": "dems",
    "type": "hillshade",
    "paint": {
      "hillshade-highlight-color": "#0dcae3",
      "hillshade-accent-color": "#0dcae3",
      "hillshade-shadow-color": "black",
      "hillshade-illumination-direction": 90,
      "hillshade-exaggeration": 0.56,
      "hillshade-illumination-anchor": "map"
    }

  })
}

function addTripLayer(map) {
  // debugger;
  // let nextlayer = map.getLayer('waterway-label')
  // if(nextlayer){
  //   map.addLayer(tripLayer,'waterway-label');

  // }else{
  //   map.addLayer(tripLayer);

  // }
  // debugger;
  // if(map.VRApp.showDeck)
  // {
    map.VRApp.setState({showDeck:true})
    // return tripLayer;

  // } 
}

function closeTripLayer(map){
  map.VRApp.setState({showDeck:false})

}

function showTripLayer(map){
  if(map.VRApp.state.showDeck){
    console.log(tripLayer)
    function _animate() {
      const loopLength = 1800, // unit corresponds to the timestamp in source data
        animationSpeed = 30; // unit time per second
      
      const timestamp = Date.now() / 1000;
      const loopTime = loopLength / animationSpeed;
  
     
      tripLayer.time = ((timestamp % loopTime) / loopTime) * loopLength ;
      
        tripLayer._animationFrame = window.requestAnimationFrame(_animate);
    }

    return tripLayer;

  }else{
    return {}
  }

}

function _updateTable(geojson) {
  if (geojson.features.length < 1) {
    return
  };
  const app = geojson.target.VRApp;
  let properties = geojson.features[0].properties;
  //图层过滤器
  //map.setFilter(provinceid,["in","SHENG_ID",properties.SHENG_ID])

  let featureinfo = [];
  Object.keys(properties).map((key) => {
    let data = {};
    data["字段"] = key;
    data["值"] = properties[key];
    featureinfo.push(data);
  });
 

  // geojson.target.setPaintProperty('higiLight',{
    
      
  //     "fill-extrusion-color": 'yellow',

  //     "fill-extrusion-height": ["get", "height"],

  //     "fill-extrusion-base": ["get", "base_height"],

  //     "fill-extrusion-opacity": 0.6
  //   }

  // );
  geojson.target.getSource('higiLight').setData({

      type: "FeatureCollection",
      features: [
        {
          "type":"Featrue",
          "properties": properties,
          "geometry": geojson.features[0].geometry
        }
      ]
    })


  app.setState({ featuredata: featureinfo, tableshow: true });

}


// React.lazy()
function addIndoorLayer(map) {
  const sourceid = "indoordata";
  let app = map.VRApp;
  if (app.indoorLayer) {
    if(map.getLayer(sourceid)){
      map.removeLayer(sourceid).removeSource(sourceid);
      
    }
    app.indoorLayer = false;
      updateMapTitle(map, "地图")
    return
  }
  updateMapTitle(map, "室内地图")
  app.indoorLayer = true;
  if (!map.getSource(sourceid)) {
    map.addSource(sourceid, {
      type: "geojson",
      data: indoorData
    });
  }

  if (!map.getLayer(sourceid)) {
    map.addLayer({
      "id": sourceid,
      "type": "fill-extrusion",
      "source": sourceid,
      "paint": {
        // See the Mapbox Style Specification for details on data expressions.
        // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions

        // Get the fill-extrusion-color from the source "color" property.
        "fill-extrusion-color":'rgb(0,102,255)',

        // Get fill-extrusion-height from the source "height" property.
        "fill-extrusion-height": ["get", "height"],

        // Get fill-extrusion-base from the source "base_height" property.
        "fill-extrusion-base": ["get", "base_height"],

        // Make extrusions slightly opaque for see through indoor walls.
        "fill-extrusion-opacity": 0.5
      }
    })
  }

  const bound = turf.bbox(indoorData);
  map.fitBounds(bound,{
    // linear:true,
    // padding: {top: 100, bottom:250, left: 150, right: 50},
    // easing(t){
    //   return t * 2
    // }
  })

  map.on("click", sourceid, _updateTable);
  // map.on('mouseenter',sourceid,(feature)=>{
  //   map.setFeatureState(
  //     { source: 'states', id: feature.features[0].id },
  //     { hover: true }
  //     );
  // });
  // map.on('mouseleave',sourceid,(feature)=>{
  //   map.setFeatureState(
  //     { source: 'states', id: hoveredStateId },
  //     { hover: false }
  //     );
  // })

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
  closeTripLayer,
  showTripLayer,
  addIndoorLayer,
  updateProvinceLayer,
};