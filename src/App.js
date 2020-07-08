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
// import InspectControl from 'mapbox-gl-controls/lib/inspect';
// import TooltipControl from 'mapbox-gl-controls/lib/tooltip';

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

class ThemeData extends React.Component{
  constructor(props){
    super(props)
    this.handleOnchange = this.handleOnchange.bind(this);
    this.state={
      value:''
    }
  }

  handleOnchange(e){
  
    const data = e.target.value;
    const seperator = ':';
    const newdata = data.replace(/(，|；|：|,|;|:)/g,seperator)
    this.setState({value:newdata})
    let out = {};
    newdata.split("\n").map((item)=>{
      if(item.trim().length > 0){
        let [key,value] = item.split(seperator);
        out[key] = parseFloat(value);
      }
    })
    const map = this.props.map;
    debugger;
    Tools.updateProvinceLayer(map,out);
    console.log(out);
  }

  render(){
    if(this.props.themeData)
  return(<>
        <textarea id="themedataTextarea" value={this.state.value} style={{height:500,width:500,position:"relative",top:"4em",left:"1em"}} onChange={this.handleOnchange}></textarea>
    </>) 
    else {
      return <></>
    }
  }

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
      themeData:false,
      map:null,
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
        
        <ThemeData className ='themedata' themeData = {this.state.themeData} map={this.state.map}/>
      </div>

    )
  }


  componentDidMount() {
    console.log(this, 'Did Mount')

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
          // zoom: 18,// starting zoom
          // interactive:false,
          zoom: INITIAL_VIEW_STATE.zoom,
          bearing: INITIAL_VIEW_STATE.bearing,
          pitch: INITIAL_VIEW_STATE.pitch
        });
        me.setState({map:map});// 
        this.map= map;
        this.style = style;
        map.VRApp = me;

        // console.log(map);

        map.on('click', (e) => {
          e.preventDefault();
          
          if(map.getLayer("selectedFeature")){
            let data =  {
                type : "FeatureCollection",
                features:[
  
                ]
              };
            map.getSource("selectedFeature").setData(data)
          } 

          if(me.state.tableshow){
            me.setState({ tableshow: false })

          }
        })

        map.on('load', (e) => {

          // map.addLayer({
          //   id: 'three_layer',
          //   type: 'custom',
          //   renderingMode: '3d',
          //   onAdd: function (map, mbxContext) {
          //     this._map = map;

          //     this.tb = {};
          //     this.tb = new window.Threebox(
          //       map,
          //       mbxContext,
          //       { defaultLights: true }
          //     );
          //     //instantiate a red sphere and position it at the origin lnglat
          //     var sphere = this.tb.sphere({ radius: 1000, color: 'red', material: 'MeshStandardMaterial' })
          //       .setCoords([106, 30.0]);
          //     sphere.name = 'redball';
          //     var sphere2 = this.tb.sphere({ radius: 1000, color: 0x0000ff, specular: 0x4488ee, shininess: 120, material: 'MeshPhongMaterial' })
          //       .setCoords([107, 30.0]);

          //     // add sphere to the scene
          //     this.tb.add(sphere);
          //     this.tb.add(sphere2);
          //     // console.log(this,'ddd');

          //     return map;
          //   },
          //   onRemove: function (map, mbxContext) {

          //     this.tb = {};

          //   },
          //   _getcolor: function () {
          //     return '#' + Math.floor(Math.random() * 16777215).toString(16);
          //   },
          //   render: function (gl, matrix) {
          //     // let ball = window.tb.world.children.filter((mesh) => mesh.name == 'redball');
          //     // ball[0].material.color.set(this._getcolor());

          //     this.tb.update();
          //   }
          // });

          // map.on('click', (e) => {
          // e.preventDefault();
          // const tb = map.getLayer('three_layer').implementation.tb;
          // const meshball = tb.world.children[0];

          // })

        })


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
              styleUrl: "mapbox://styles/mapbox/light-v10"
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
            // current style
            // later will change
         
        
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
        tool.addTool("事", Tools.addHexagonLayer);
        tool.addTool('迁', Tools.addEaseLayer);
        tool.addTool('飞', Tools.ODFly);
        tool.addTool('热', Tools.addHotLayer);
        tool.addTool("聚", Tools.addCluster);
        tool.addTool("室", Tools.addIndoorLayer);

        // tool.addTool("trip", Tools.addTripLayer);
        tool.addTool("新", ()=>{
          me.setState({themeData:true})
        });

        tool.addTool("省", Tools.addProvince);
        tool.addTool("量", Tools.drawControl);
        tool.addTool('瞰', Tools.overView);
        tool.addTool("始", () => map.setStyle(this.style.mymap))

      },
      otherOprations: function () {
        let map = this.map;
        map.on('load',()=>{
         
          map.addSource("selectedFeature",{
         
            type: "geojson",
            data: {
              type : "FeatureCollection",
              features:[

              ]
            }
          
        });
        map.addLayer({
          id: "selectedFeature",
          'source': "selectedFeature",
          'type': 'fill-extrusion',
          'paint': {
            "fill-extrusion-color": "rgb(255,255,3)",
            "fill-extrusion-opacity": 0.4,
            "fill-extrusion-height": 8000
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
    // console.log(this, 'Did update')
    // this.setState({mapTitle:"map did update"}) //引发死循环
  }
}

export default App;
