function addBuilding(map) {
    debugger;
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

  export default {
    addBuilding:addBuilding
  } ;