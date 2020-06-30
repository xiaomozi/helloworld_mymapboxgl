import React from 'react';
// import logo from './logo.svg';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'

import './App.css';
import './main.css';
import 'mapbox-gl-controls/theme.css';

import StylesControl from 'mapbox-gl-controls/lib/styles';
import CompassControl from 'mapbox-gl-controls/lib/compass';
import ZoomControl from 'mapbox-gl-controls/lib/zoom';
import InspectControl from 'mapbox-gl-controls/lib/inspect';
import TooltipControl from 'mapbox-gl-controls/lib/tooltip';

import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';


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
    let me = this;
    const app ={
      start:function(){
        this.initMap();
        this.initControls();
      },

      initMap:function(){
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
        // const app = {};
        const map = new mapboxgl.Map({
          container: "map",
          style: style.mymap, // stylesheet location
          center: [106, 30.0], // starting position [lng, lat]
          zoom: 4,// starting zoom
          zoom: INITIAL_VIEW_STATE.zoom,
          bearing: INITIAL_VIEW_STATE.bearing,
          pitch: INITIAL_VIEW_STATE.pitch
        });
        this.map = map;
        this.style = style;
        map.VRApp = me;
    
        map.on('click', () => {
          me.setState({ tableshow: false })
        })
       },

       initControls:function(){
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
              tyleName: "light",
              sstyleUrl: "mapbox://styles/mapbox/light-v10"
            },
               {
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
        tool.addTool("量",Tools.drawControl);
        tool.addTool("省",Tools.addProvince);
        tool.addTool("始", ()=> window.location.href="/")
        tool.addTool("事",Tools.addHexagonLayer);
        tool.addTool('迁',Tools.addEaseLayer);
        tool.addTool('飞',Tools.ODFly);
        tool.addTool('热',Tools.addHotLayer);
        tool.addTool("聚",Tools.addCluster)
        tool.addTool('瞰', Tools.overView);
  
      }
    };

    app.start();

  }

}

export default App;
