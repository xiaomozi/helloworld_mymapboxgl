import React, { useState, useEffect } from 'react';
// import logo from './logo.svg';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'

import './App.css';
import './main.css';
import 'mapbox-gl-controls/theme.css';

import StylesControl from 'mapbox-gl-controls/lib/styles';
import CompassControl from 'mapbox-gl-controls/lib/compass';
import ZoomControl from 'mapbox-gl-controls/lib/zoom';
// import InspectControl from 'mapbox-gl-controls/lib/inspect';
// import TooltipControl from 'mapbox-gl-controls/lib/tooltip';

import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';


import DeckGL from '@deck.gl/react';


import { TripsLayer } from '@deck.gl/geo-layers';
import trips from './data/trips.json';
// import MsgBox from './MsgBox';
import Toolbar from './ToolBar';


//table react plugin
import Reactable from 'reactable';
import './table.css'
// import air from './ne_10m_airports.json'
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


class ListItem extends React.Component {
  // 正确！这里不需要指定 key：
  constructor(props) {
    super(props);
    this.handleChangeChoose = this.handleChangeChoose.bind(this);
    this.order = props.order;

  }

  handleChangeChoose(e) {
    debugger;
    //change the colume

    let data = this.props.data;
    let out = {};
    const row = data.toString();
    const seperator = ':';

    row.split("\n").map((item) => {
      if (item.trim().length > 0) {

        let kvp = item.split(seperator);//[]
        let key = kvp[0];//the first filed --- province
        let value = kvp[this.order];
        if (parseFloat(value.trim())) {
          out[key.trim()] = value ? parseFloat(value.trim()) : null;
        }
      }
    })
    const map = this.props.map;
    debugger;
    Tools.updateProvinceLayer(map, out);
  }

  render() {
    return <li>
      {this.props.value}<input type='radio' value={this.props.value} name='col' onChange={this.handleChangeChoose} />
    </li>;
  }

}


class ChooseBar extends React.Component {
  constructor(props) {
    super(props);
    this.getTitles = this.getTitles.bind(this);


  }

  getTitles(props) {
    let data = props.value;
    let out = {};
    const row = data.toString();
    const seperator = ':';
    const header = row.split('\n')[0];
    debugger;
    if (header.trim().length > 0) {

      return header.split(seperator).slice(1);

    }
    return []
  }

  render() {
    let headers = this.getTitles(this.props);
    let items = headers.map((item, index) =>
      <ListItem key={item} value={item} order={index + 1} data={this.props.value} map={this.props.map}></ListItem>
    )

    return (
      <ol>
        {items}
      </ol>
    )

  }

}

class ThemeData extends React.Component {
  constructor(props) {
    super(props)
    this.handleOnchange = this.handleOnchange.bind(this);
    this.handleChangeChoose = this.handleChangeChoose.bind(this)
    this.state = {
      value: '',
      // index:0,
    }
    this.style = {
      'background-color': 'honeydew',
      'opacity': '0.8',
      'position': 'relative',
      'float': 'right',
      'min-height': '40em',
      'min-width': '30%',
      'top': '7em',
      'right': '4em'
    }
  }

  handleOnchange(e) {

    const data = e.target.value;
    if (data.trim() === "?" | data.trim() === "？") {
      const city = ['北京', '天津', '河北', '山西', '内蒙古', '辽宁',
        '吉林', '黑龙江', '上海', '江苏', '浙江', '安徽', '福建', '江西',
        '山东', '河南', '湖北', '湖南', '广东', '广西', '海南',
        '四川', '贵州', '云南', '重庆', '西藏',
        '陕西', '甘肃', '青海', '宁夏', '新疆', '香港', '澳门', '台湾']
      let newdata = city.reduce((pre, cur) => {
        return pre + cur + ':\n'
      }, '')
      this.setState({ value: newdata })
      return;
    }

    const seperator = ':';
    const newdata = data.replace(/(，|；|：| +|,|;|:+|\t)/g, seperator)
    this.setState({ value: newdata.toString() })


    // by default , show the first colume data
    let out = {};
    const row = newdata.toString();
    // let dataF = row.match(/\d+\.?\d+[^\d+\.?\d+'年''月''日']+/g);
    let dataF = row.match(/\d+\.?\d+/g);
    if(!dataF)return
    if(dataF.length<1)return
    
    const [max,min] = [Math.max(...dataF),Math.min(...dataF)];
    const map = this.props.map;

    map.legend.update(min,max);

    row.split("\n").map((item) => {
      if (item.trim().length > 0) {
        let [key, value] = item.split(seperator);

        if (!value) { return }
        if (parseFloat(value.trim())) {
          out[key.trim()] = value ? parseFloat(value.trim()) : null;

        }
      }
    })
    Tools.updateProvinceLayer(map, out);

  }
  handleChangeChoose(e) {
    // this.setState({index:e.target.value})
    let data = this.state.value;
    let out = {};
    const row = data.toString();
    const seperator = ':';

    row.split("\n").map((item) => {
      if (item.trim().length > 0) {
        // let [key,value] = item.split(seperator);
        // let kvp =item.split(seperator);
        let kvp = item.split(seperator);
        let key = kvp[0];
        let value = kvp[e.target.value];
        out[key.trim()] = value ? parseFloat(value.trim()) : null;
      }
    })
    const map = this.props.map;
    Tools.updateProvinceLayer(map, out);
  }


  render() {

    // const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    // const cols = items.map((item) => {
    //   return (<li key={item.toString()}>{item.toString() + ": "}<input name='col' type="radio" value={item} onChange={this.handleChangeChoose} /></li>)
    // })

    if (this.props.themeData)
      return (<div className='themedatabox'>
        {/* <ol >
          {cols}
        </ol> */}
        <ChooseBar value={this.state.value} map={this.props.map} />
        <textarea id="themedataTextarea" value={this.state.value}
          // style={this.style} 
          // index = {this.state.index}
          onChange={this.handleOnchange}>

        </textarea>
      </div>)
    else {
      return <></>
    }
  }

}

function MpTripsLayer(props) {
  const [time, setTime] = useState(0);
  const [animation] = useState({});
  const animate = () => {
    setTime(t => (t + 1) % 1000);
    animation.id = window.requestAnimationFrame(animate);
  };

  useEffect(
    () => {
      animation.id = window.requestAnimationFrame(animate);
      return () => window.cancelAnimationFrame(animation.id);
    },
    [animation]
  );
  const layers = [

    new TripsLayer({
      id: 'trips',
      data: trips,
      getPath: d => d.path,
      getTimestamps: d => d.timestamps,
      getColor: d => (d.vendor === 0 ? [253, 255, 53] : [23, 184, 190]),
      opacity: 0.9,
      widthMinPixels: 2,
      rounded: true,
      trailLength: 200,
      currentTime: time,

      shadowEnabled: false
    })
  ]

  const INITIAL_VIEW_STATE = {
    longitude: -74,
    latitude: 40.72,
    zoom: 13,
    pitch: 45,
    bearing: 0
  };

  const updateMapView = (stateView) => {
      let map = props.map;
    map.setViewState(stateView.viewState)
  };

  return (
    <DeckGL
      layers={layers}

      initialViewState={props.vstate}
      onViewStateChange = {(stateView)=>{updateMapView(stateView)}}
      controller={true}
    >

    </DeckGL>
  );
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
      themeData: false,
      map: null,
      showDeck: false,
     
      mapTitle: "中国地图"
    }



    // this.hideDrawBox = this.hideDrawBox.bind(this);
    // this.showDrawBox = this.showDrawBox.bind(this);
    // this.updateMapView = this.updateMapView.bind(this)
  }

 
  render() {
    let myTripsLayer;
    if (this.state.showDeck) {

      myTripsLayer = <MpTripsLayer map={this.state.map} vstate = {{
        longitude: -74,
        latitude: 40.72,
        zoom: 13,
        bearing: 0,
        pitch: 45
      }}/>
    }

    return (
      <div>

        <div id="map"></div>
        {myTripsLayer}

        <div id="calculation-box" className="calculation-box" style={{ visibility: "hidden" }}>
          <DrawCrtl />

        </div>
        <TableContainer tableshow={this.state.tableshow} featuredata={this.state.featuredata} />
        {/* <canvas id="deck-canvas" className="trcl"></canvas> */}
        <MapTitle className='mapTitle' title={this.state.mapTitle} />

        <ThemeData className='themedata' themeData={this.state.themeData} map={this.state.map} />
      </div>

    )
  }


  componentDidMount() {
    // console.log(this, 'Did Mount')
    //  window.requestAnimationFrame(this.anim)
    if (!mapboxgl.supported()) {
      alert('Your browser does not support Mapbox GL');
      return;
    }
    let me = this;
    // console.log({...Threebox})    
    const app = {
      start: function () {
        this.initMap();
        this.initControls();
        this.otherOprations();
      },

      initMap: function () {
        const INITIAL_VIEW_STATE = {
          longitude: -74,
          latitude: 40.72,
          zoom: 13,
          bearing: 0,
          pitch: 45
        };

        // me.setState({viewState:Object.assign({},INITIAL_VIEW_STATE)});

        const style = {
          "streets": 'mapbox://styles/mapbox/streets-v11',
          "light": 'mapbox://styles/mapbox/light-v10',
          // "dark": 'mapbox://styles/mapbox/dark-v10',
          "dark": 'mapbox://styles/xiaomozi/ckclpp2vb0voy1ho8txzxyob0',
          "satelite-streets": 'mapbox://styles/mapbox/satellite-streets-v11',
          "navi_day": 'mapbox://styles/mapbox/navigation-guidance-day-v4',
          'hillshading': 'mapbox://styles/mapbox/cjaudgl840gn32rnrepcb9b9g',
          'mymap': 'mapbox://styles/xiaomozi/ckbiw7e9v004y1ip4ookctquy'
        };

        var mytoken = 'pk.eyJ1IjoieGlhb21vemkiLCJhIjoiY2tibTNoeTd1MGhkcjJycG85aW55MzdjeiJ9.yxRH4UcmeNF0HR1VdNMFIQ'
        // mapboxgl.accessToken = 'pk.eyJ1Ijoiemh1d2VubG9uZyIsImEiOiJjazdhNGF6dzIwd3V0M21zNHU1ejZ1a3Q4In0.VkUeaPhu-uMepNBOMc_UdA';
        mapboxgl.accessToken = mytoken;

        // const app = {};
        const map = new mapboxgl.Map({
          container: "map",
          style: style.dark, // stylesheet location
          //center: [106, 30.0], // starting position [lng, lat]
          center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
          // zoom: 18,// starting zoom
          // interactive:false,
          zoom: INITIAL_VIEW_STATE.zoom,
          bearing: INITIAL_VIEW_STATE.bearing,
          pitch: INITIAL_VIEW_STATE.pitch
        });
        me.setState({ map: map });// 
        this.map = map;
        this.style = style;
        map.VRApp = me;

        map.setViewState = (vs)=>{
          map.setBearing(vs.bearing).setCenter([vs.longitude,vs.latitude]).setPitch(vs.pitch).setZoom(vs.zoom);
        }
        // map.on('load', (e) => {

        //   // map.addLayer({
        //   //   id: 'three_layer',
        //   //   type: 'custom',
        //   //   renderingMode: '3d',
        //   //   onAdd: function (map, mbxContext) {
        //   //     this._map = map;

        //   //     this.tb = {};
        //   //     this.tb = new window.Threebox(
        //   //       map,
        //   //       mbxContext,
        //   //       { defaultLights: true }
        //   //     );
        //   //     //instantiate a red sphere and position it at the origin lnglat
        //   //     var sphere = this.tb.sphere({ radius: 1000, color: 'red', material: 'MeshStandardMaterial' })
        //   //       .setCoords([106, 30.0]);
        //   //     sphere.name = 'redball';
        //   //     var sphere2 = this.tb.sphere({ radius: 1000, color: 0x0000ff, specular: 0x4488ee, shininess: 120, material: 'MeshPhongMaterial' })
        //   //       .setCoords([107, 30.0]);

        //   //     // add sphere to the scene
        //   //     this.tb.add(sphere);
        //   //     this.tb.add(sphere2);
        //   //     // console.log(this,'ddd');

        //   //     return map;
        //   //   },
        //   //   onRemove: function (map, mbxContext) {

        //   //     this.tb = {};

        //   //   },
        //   //   _getcolor: function () {
        //   //     return '#' + Math.floor(Math.random() * 16777215).toString(16);
        //   //   },
        //   //   render: function (gl, matrix) {
        //   //     // let ball = window.tb.world.children.filter((mesh) => mesh.name == 'redball');
        //   //     // ball[0].material.color.set(this._getcolor());

        //   //     this.tb.update();
        //   //   }
        //   // });

        //   // map.on('click', (e) => {
        //   // e.preventDefault();
        //   // const tb = map.getLayer('three_layer').implementation.tb;
        //   // const meshball = tb.world.children[0];

        //   // })

        // })


      },

      initControls: function () {
        let map = this.map;
        let style = this.style;
        const geocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl
        });
        map.addControl(geocoder)

        map.addControl(new StylesControl({
          styles: [
            {
              label: '街道',
              styleName: 'Mapbox Streets',
              styleUrl: 'mapbox://styles/mapbox/streets-v9',
            }, {
              label: '卫星',
              styleName: 'Satellites',
              styleUrl: 'mapbox://styles/mapbox/satellite-v9',
            },
            {
              label: "白天",
              tyleName: "light",
              styleUrl: "mapbox://styles/mapbox/light-v10"
            },
            {
              label: "夜间",
              styleName: "dark",
              styleUrl: style.dark
            }, {
              label: "渲染",
              styleName: 'render',
              styleUrl: style.hillshading
            }
          ],
          onChange: (style) => {
            //
          },
        }), 'bottom-right');

        map.addControl(new CompassControl(), 'top-right');
        // // map.addControl(new mapboxgl.NavigationControl());
        map.addControl(new ZoomControl(), 'top-right');

        // map.addControl(new InspectControl(), 'bottom-right');
        // // map.addControl(new TooltipControl({ layer: '$fill' }));

        var scale = new mapboxgl.ScaleControl({
          maxWidth: 80,
          unit: 'imperial'

        });
        map.addControl(scale);
        scale.setUnit('metric');

        const tool = new Toolbar();
        map.addControl(tool);
        tool.addTool("筑", Tools.addBuilding);
        tool.addTool("事", Tools.addHexagonLayer);
        tool.addTool('迁', Tools.addEaseLayer);
        tool.addTool('飞', Tools.ODFly);
        tool.addTool('热', Tools.addHotLayer);
        tool.addTool("聚", Tools.addCluster);
        tool.addTool("迹", Tools.addTripLayer);
        tool.addTool("D", Tools.closeTripLayer);


        tool.addTool("室", Tools.addIndoorLayer);

        // tool.addTool("trip", Tools.addTripLayer);
        tool.addTool("新", () => {
          if (this.map.themeLayer) {
            me.setState({ themeData: false })
            this.map.themeLayer = false;

            return
          }
          this.map.themeLayer = true;
          me.setState({ themeData: true })
        });

        tool.addTool("省", Tools.addProvince);
        tool.addTool("量", Tools.drawControl);
        tool.addTool('瞰', Tools.overView);
        tool.addTool("始", () => {
          //map.setStyle(this.style.mymap);
          map.remove();
          app.start();
        })

      },
      otherOprations: function () {
        let map = this.map;
        map.on('click', (e) => {
          e.preventDefault();

          if (map.getLayer("selectedFeature")) {
            let data = {
              type: "FeatureCollection",
              features: [

              ]
            };
            map.getSource("selectedFeature").setData(data)
          }
          if (map.getLayer("higiLight")) {
            let data = {
              type: "FeatureCollection",
              features: [

              ]
            };
            map.getSource("higiLight").setData(data)
          }

          if (me.state.tableshow) {
            me.setState({ tableshow: false })

          }
        })


        map.on('styledata', () => {

          // me.setState({map:map});
          if (map.getSource("selectedFeature")) return;

          map.addSource("selectedFeature", {
            type: 'geojson',
            data:
            {
              type: "FeatureCollection",
              features: [

              ]
            },
          });

          map.addLayer({
            id: "selectedFeature",
            'source': "selectedFeature",
            'type': 'fill-extrusion',
            'paint': {
              "fill-extrusion-color": "rgb(100,100,203)",
              "fill-extrusion-opacity": 0.8,
              "fill-extrusion-height": 15000
            },
          })

          map.addSource("higiLight", {
            type: 'geojson',
            data:
            {
              type: "FeatureCollection",
              features: [

              ]
            },
          });


          map.addLayer({
            id: "higiLight",
            'source': "higiLight",
            'type': 'fill-extrusion',
            'paint': {

              "fill-extrusion-color": 'rgb(0,102,255)',

              "fill-extrusion-height": ["get", "height"],

              "fill-extrusion-base": ["get", "base_height"],

              "fill-extrusion-opacity": 1
            },
          })


        })


      }
    };

    app.start();

  }

  //  componentWillUnmount(){
  //   console.log(this,'Will unmount')

  //  }

  //  shouldComponentUpdate(){
  //    return false;
  //  }

  //   componentWillUpdate(){
  //     console.log(this,'Will update')
  //     this.setState({mapTitle:"map will update"}) //引发死循环
  //     // this.shouldComponentUpdate()
  //     // return false;

  //   }


  componentDidUpdate() {
    console.log(this, 'Did update')
    // this.setState({mapTitle:"map did update"}) //引发死循环
  }
}

export default App;
