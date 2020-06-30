import MapboxDraw from 'mapbox-gl-draw';
import turf from '@turf/turf';

import 'mapbox-gl-draw/dist/mapbox-gl-draw.css'
// import turf from 'turf';
import './DrawControInfo.css';
import { map } from 'd3';

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

function hideDrawBox() {
  let box = document.getElementById("calculation-box");
  box.setAttribute("style", "visibility:hidden")
  // box.style.visibility = "hidden";
}
function showDrawBox() {
  let box = document.getElementById("calculation-box");
  box.style.visibility = "visible";
}

function drawControl(map) {
  map.Controls = map.Controls?map.Controls:{};
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


}

//add province layer
function addProvince(map) {
  const provinceid = "province";

  if (map.getLayer("province")) {
    map.removeLayer('province').removeSource("province");
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
  debugger;
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
  }, labelLayerId);

  
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

    map.VRApp.setState({ featuredata: featureinfo, tableshow: true });

  })

  
}

export default {
  addBuilding: addBuilding,
  drawControl,
  addProvince,
};