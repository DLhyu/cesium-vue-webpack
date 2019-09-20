/*地图图层菜单目录构造*/
/*
 *name-图层名称
 *layerurl-图层服务配置
 *type代表地图服务类型:
 1 代表UrlTemplateImageryProvider;
 2 代表ArcGisMapServerImageryProvider;
 3 代表WebMapTileServiceImageryProvider;
 4 代表SingleTileImageryProvider
 5 代表createOpenStreetMapImageryProvider;
 6 代表createTileMapServiceImageryProvider;
 7 代表WebMapServiceImageryProviderr(WMS);
 8 代表kml,kmz;
 9 代表geoJson;
 *layerid-图层id
 */
import global_ from '../global'
var MapConfig = window.MapConfig || {};
MapConfig.Layers = [
    { id: 0, pId: 0, name: "基础图层",checked:false },
    {
        id: 1,
        pId: 1,
        name: "谷歌地图",
        label: 'google',
        source: new Cesium.UrlTemplateImageryProvider({
            // url: 'http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali'
            url: '//www.google.cn/maps/vt?lyrs=s,h&gl=CN&x={x}&y={y}&z={z}'
        })
    },
    {
        id: 2,
        pId: 2,
        name: "ESRI地图",
        label: 'esri',
        source: new Cesium.ArcGisMapServerImageryProvider({
            url : 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
        })
    },
    {
        id: 3,
        pId: 3,
        name: "天地图地图",
        label: 'tianditu',
        source: new Cesium.WebMapTileServiceImageryProvider({
            url: 'http://{s}.tianditu.com/img_w/wmts?service=WMTS&version=1.0.0&request=GetTile&tilematrix={TileMatrix}&layer=img&style={style}&tilerow={TileRow}&tilecol={TileCol}&tilematrixset={TileMatrixSet}&format=tiles&tk=fb0dd2b4158b2f9d4bec0aaaf9722801',
            layer: 'img',
            style: 'default',
            format: 'tiles',
            tileMatrixSetID: 'w',
            credit: new Cesium.Credit('天地图全球影像服务'),
            subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
            maximumLevel: 18
        })
    },
    {
        id: 4,
        pId: 4,
        name: "单张图片",
        label: 'single',
        source: new Cesium.SingleTileImageryProvider({
            url : global_.prod+'images/earth.jpg'
        })
    },
    {
        id: 5,
        pId: 5,
        name: "Bing地图",
        label: 'bing',
        source: new Cesium.BingMapsImageryProvider({
            url : 'https://dev.virtualearth.net',
            key : 'Ajh5oWmNGxckTvkM296pJYquJsiAGACelNOxVlRBhLnTrpfTh8p3sYYcdEIJ9nbm',
            mapStyle : Cesium.BingMapsStyle.AERIAL
        })
    },
    {
        id: 6,
        pId: 6,
        name: "天地图注记",
        label: 'labelTianditu',
        source: new Cesium.WebMapTileServiceImageryProvider({
            url: 'http://{s}.tianditu.com/cia_w/wmts?service=WMTS&version=1.0.0&request=GetTile&tilematrix={TileMatrix}&layer=cia&style={style}&tilerow={TileRow}&tilecol={TileCol}&tilematrixset={TileMatrixSet}&format=tiles&tk=fb0dd2b4158b2f9d4bec0aaaf9722801',
            layer: 'cia',
            style: 'default',
            format: 'tiles',
            tileMatrixSetID: 'w',
            credit: new Cesium.Credit('天地图全球影像中文注记服务'),
            subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7']
        })
    }
];

export default MapConfig;
