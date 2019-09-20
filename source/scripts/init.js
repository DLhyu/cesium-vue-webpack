import initViewer from '../scripts/initViewer';
import eyeViewer from '../scripts/eyeViewer';
import MapConfig from '../scripts/config/layersConfig'
import meaDistance from '../scripts/measure/meaDistance'
import meaArea from '../scripts/measure/meaArea';
import draw2Dpoint from '../scripts/draw/2D/draw2Dpoint'
import draw2Dicon from '../scripts/draw/2D/draw2Dicon'
import global_ from '../scripts/global'
import draw2Dpolyline from '../scripts/draw/2D/draw2Dpolyline'
import draw2Dpolygon from '../scripts/draw/2D/draw2Dpolygon'
import draw2Drectangle from '../scripts/draw/2D/draw2Drectangle'
import draw2Dcircle from '../scripts/draw/2D/draw2Dcircle'
import draw2Dsector from '../scripts/draw/2D/draw2Dsector'
import draw3Dsphere from '../scripts/draw/3D/draw3Dsphere'
import draw3DpolylineVolume from '../scripts/draw/3D/draw3DpolylineVolume'
import draw3Dwall from '../scripts/draw/3D/draw3Dwall'
import draw3Dpolygon from '../scripts/draw/3D/draw3Dpolygon'
import draw3Drectangle from '../scripts/draw/3D/draw3Drectangle'
import draw3Dcylinder from '../scripts/draw/3D/draw3Dcylinder'
import bufferAnalysis from '../scripts/spatialAnalysis/bufferAnalysis'
import meteorologicalTopics from '../scripts/topicsAnalysis/meteorologicalTopics'
import dataBoxSelection from '../scripts/spatialAnalysis/dataBoxSelection'

export default {
    name: "xbsjApp",
    mounted() {
        this.$nextTick(() => {
            const viewer = initViewer(this.$refs.viewer);
            const eye = eyeViewer(this.$refs.eyeViewer);

            this.freezedViewer = Object.freeze({viewer});

            const that = this;
            document.addEventListener(Cesium.Fullscreen.changeEventName, () => {
                that.isFullscreen = Cesium.Fullscreen.fullscreen;
            });

            // 设置鹰眼同步
            let syncViewer = function(){
                eye.camera.flyTo({
                    destination : viewer.camera.position,
                    orientation : {
                        heading : viewer.camera.heading,
                        pitch : viewer.camera.pitch,
                        roll : viewer.camera.roll
                    },
                    duration: 0.0
                });
            }

            // 添加同步监控
            viewer.scene.preRender.addEventListener(syncViewer);

            const scene = viewer.scene;
            const canvas = viewer.canvas;

            // 实时获取鼠标位置
            const mouseHandler = new Cesium.ScreenSpaceEventHandler(canvas);
            mouseHandler.setInputAction(function(movement){
                const ray = viewer.camera.getPickRay(movement.endPosition);
                const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
                // var cartesian = viewer.camera.pickEllipsoid(movement.endPosition, scene.globe.ellipsoid);
                if(cartesian) {
                    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    // var longitudeString=Cesium.Math.toDegrees(cartographic.longitude);//经度值
                    // var latitudeString=Cesium.Math.toDegrees(cartographic.latitude);//纬度值
                    // var height=viewer.scene.globe.getHeight(cartographic);; // 地形高度
                    // var cartographic = scene.globe.ellipsoid.cartesianToCartographic(cartesian);
                    const longitudeString = Cesium.Math.toDegrees(cartographic.longitude);  // 经度
                    const latitudeString = Cesium.Math.toDegrees(cartographic.latitude);  // 纬度
                    const height = scene.globe.getHeight(cartographic);  // 海拔高程
                    // var height = cartographic.height;
                    // var height = Math.ceil(viewer.camera.positionCartographic.height); // 相机高度
                    // console.log(longitudeString.toPrecision(5).toString());
                    // console.log(latitudeString.toPrecision(4).toString());
                    // console.log(height.toFixed(2).toString());
                    if(latitudeString>0){
                        that.$refs.location_lat.innerHTML = latitudeString.toFixed(2).toString()+"° N";
                    }else if(latitudeString<0){
                        that.$refs.location_lat.innerHTML = -latitudeString.toFixed(2).toString()+"° S";
                    }
                    if(longitudeString>0){
                        that.$refs.location_lon.innerHTML = longitudeString.toFixed(2).toString()+"° E";
                    }else if(longitudeString<0){
                        that.$refs.location_lon.innerHTML = -longitudeString.toFixed(2).toString()+"° W";
                    }
                    that.$refs.location_height.innerHTML = height.toFixed(2).toString()+" m";
                }else {
                    that.$refs.location_lat.innerHTML = '';
                    that.$refs.location_lon.innerHTML = '';
                    that.$refs.location_height.innerHTML = '';
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

            // 地球自转
            let lastNow = Date.now();
            that.clockStartListener = function () {
                const now = Date.now();
                const splitRate = 0.1;
                const delta = (now - lastNow) / 1000;
                lastNow = now;
                viewer.camera.rotate(Cesium.Cartesian3.UNIT_Z, splitRate * delta);
            };

            // 设置标绘handler
            global_.handlerPoint = viewer.screenSpaceEventHandler;
            global_.handlerIcon = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
            global_.handlerPolyline = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
            global_.handlerPolygon = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        });
    },
    data() {
        return {
            isFullscreen: false,
            freezedViewer: undefined,
            terrain: true,
            light: false,
            atmosphere: true,
            depthTest: false,
            basemap: 'google',
            eyeViewer: true,
            labelImagery: undefined,
            bufferRadius: 1,
            bufferAnalysis: false,
            point: 'point',
            polyline: 'polyline',
            polygon: 'polygon',
            meList: [
                {
                    value: 'temp',
                    label: '温度'
                },
                {
                    value: 'cloud',
                    label: '云图'
                },
            ],
            regionList: [
                {
                    value: 'china',
                    label: '中国'
                },
                {
                    value: 'globe',
                    label: '全球'
                },
            ],
            m_title: '气象专题',
            meteorologicalTopics: false,
            ele: '',
            region: '',
            dataBoxSelection: false,
            rectangle: 'rectangle',
            circle: 'circle'
        };
    },
    methods: {
        goHome() {
            // 指向中国位置
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            viewer && viewer.camera.flyHome();
        },
        enableFullscreen(enable) {
            if (enable) {
                !Cesium.Fullscreen.fullscreen && Cesium.Fullscreen.requestFullscreen(this.$refs.coreViewer);
            } else {
                Cesium.Fullscreen.fullscreen && Cesium.Fullscreen.exitFullscreen();
            }
        },
        enableTerrain(enable){
            // console.log(enable);
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            var terrainProvider = undefined;
            if(enable){
                terrainProvider = new Cesium.createWorldTerrain({
                    requestWaterMask : true,
                    requestVertexNormals : true
                });
            }else{
                terrainProvider = new Cesium.EllipsoidTerrainProvider({});
            }
            viewer.terrainProvider = terrainProvider;
        },
        enableDepthTest(enable){
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            if(enable){
                viewer.scene.globe.depthTestAgainstTerrain = enable;
            }else{
                viewer.scene.globe.depthTestAgainstTerrain = enable;
            }
        },
        enableAtmosphere(enable){
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            if(enable){
                viewer.scene.globe.showGroundAtmosphere = enable;
            }else{
                viewer.scene.globe.showGroundAtmosphere = enable;
            }
        },
        enableLight(enable){
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            if(enable){
                viewer.scene.globe.enableLighting = enable;
            }else{
                viewer.scene.globe.enableLighting = enable;
            }
        },
        changeLayer(data){
            // console.log(data);
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            for(let i=0; i<MapConfig.Layers.length; i++){
                if(data===MapConfig.Layers[i].label){
                    const imagerLayer = viewer.imageryLayers;
                    const baseMap = imagerLayer.get(0);
                    imagerLayer.remove(baseMap);
                    imagerLayer.addImageryProvider(MapConfig.Layers[i].source);
                    if(imagerLayer.get(1)){
                        imagerLayer.lowerToBottom(imagerLayer.get(1));
                    }
                }
            }
        },
        changeEarthRotation(data){
            // console.log(data);
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            // var cartographic = Cesium.Cartographic.fromDegrees(110, 32);
            // var height=viewer.scene.globe.getHeight(cartographic);
            // console.log(height);

            if(data===true){
                viewer.clock.onTick.addEventListener(this.clockStartListener);
            }else if(data===false){
                viewer.clock.onTick.removeEventListener(this.clockStartListener);
            }
        },
        enableLabelImagery(data){
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            const imagerLayer = viewer.imageryLayers;
            if(data.length>0){
                for(let i=0; i<MapConfig.Layers.length; i++){
                    if(data[0]===MapConfig.Layers[i].label){
                        imagerLayer.addImageryProvider(MapConfig.Layers[i].source);
                        // imagerLayer.raiseToTop(imagerLayer.get(1));
                    }
                }
            }else{
                imagerLayer.remove(imagerLayer.get(1));
            }
        },
        makeDistance(){
            // this.clearMea();
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            meaDistance(viewer);
        },
        makeArea(){
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            meaArea(viewer);
        },
        clearMea(){
            this.bufferAnalysis = false;
            this.meteorologicalTopics = false;
            this.dataBoxSelection = false;
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            viewer.entities.removeAll();
            if(global_.handlerPoint || global_.handlerIcon){
                global_.handlerPoint.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
                global_.handlerPoint.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
                global_.handlerPoint.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                global_.handlerPoint.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
                global_.handlerPoint.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
                global_.handlerPoint.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
                global_.handlerIcon.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
                global_.handlerIcon.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
                global_.handlerIcon.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                global_.handlerIcon.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
                global_.handlerIcon.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
                global_.handlerIcon.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            }
            if(global_.idxTimer){
                window.clearInterval(global_.idxTimer);
                const imagerLayer = viewer.imageryLayers;
                for(let i=0; i<imagerLayer.length; i++){
                    imagerLayer.remove(imagerLayer.get(1));
                }
            }
        },
        draw2point(){
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            draw2Dpoint(viewer, global_.handlerPoint);
        },
        draw2icon(){
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            draw2Dicon(viewer, global_.handlerIcon);
        },
        draw2polyline(){
            // this.clearMea();
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            draw2Dpolyline(viewer, global_.handlerPolyline);
        },
        draw2polygon(){
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            draw2Dpolygon(viewer, global_.handlerPolygon)
        },
        draw2rectangle(){
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            draw2Drectangle(viewer)
        },
        draw2circle(){
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            draw2Dcircle(viewer)
        },
        draw2sector(){
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            draw2Dsector(viewer)
        },
        draw3sphere(){
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            draw3Dsphere(viewer)
        },
        draw3polylineVolume(){
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            draw3DpolylineVolume(viewer)
        },
        draw3wall(){
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            draw3Dwall(viewer)
        },
        draw3polygon(){
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            draw3Dpolygon(viewer)
        },
        draw3rectangle(){
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            draw3Drectangle(viewer)
        },
        draw3cylinder(){
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            draw3Dcylinder(viewer)
        },
        spatialAnalysis(name){
            if(name==="bufferAnalysis"){
                const viewer = this.freezedViewer && this.freezedViewer.viewer;
                viewer.camera.flyTo({
                    destination : Cesium.Cartesian3.fromDegrees(112.95, 28.19, 1500.1),
                    duration : 2, // 旋转速度 数值越大越慢
                    orientation : { // 朝北向下俯视
                        heading : 0.0,
                        pitch : -Cesium.Math.PI_OVER_TWO, // 相机间距
                        roll : 0.0 // 相机滚动
                    }
                });
                this.meteorologicalTopics = false;
                this.dataBoxSelection = false;
                this.bufferAnalysis = true;
                // console.log(name)
            }else if(name==="dataBoxSelection"){
                console.log(name)
                this.meteorologicalTopics = false;
                this.dataBoxSelection = true;
                this.bufferAnalysis = false;
                const viewer = this.freezedViewer && this.freezedViewer.viewer;
                dataBoxSelection.init(viewer);
            }else if(name==="sunshineAnalysis"){
                alert('开发中。。。');
            }
        },
        bufferAnalysisFc(type, radius){
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            bufferAnalysis(viewer, type, radius)
        },
        topicsAnalysis(name){
            if(name==="meteorological"){
                this.bufferAnalysis = false;
                this.dataBoxSelection = false;
                this.meteorologicalTopics = true;
                this.goHome();
                // console.log(name)
            }else if(name==="ocean"){
                alert('开发中。。。');
            }
        },
        meteorologicalTopicsStart(ele, region){
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            if(ele!==''&&region!==''){
                if(global_.idxTimer){
                    window.clearInterval(global_.idxTimer);
                }
                meteorologicalTopics(viewer, ele, region);
            }else{
                alert('参数不能为空，请重新选择！');
            }
        },
        meteorologicalTopicsEnd(){
            if(global_.idxTimer){
                window.clearInterval(global_.idxTimer);
            }
        },
        dataBoxSelectionFc(name){
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            if(name==='rectangle'){
                dataBoxSelection.drawRectangle(viewer);
            }else if(name==='circle'){
                dataBoxSelection.drawCircle(viewer);
            }else if(name==='polygon'){
                dataBoxSelection.drawPolygon(viewer);
            }
        },
        clearDataBoxSelection(){
            const viewer = this.freezedViewer && this.freezedViewer.viewer;
            dataBoxSelection.clear(viewer);
        }
    }
};
