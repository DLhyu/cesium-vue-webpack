/**
 * 绘制球体
 * @param viewer
 */
import global_ from '../../global'
var draw3Dsphere = function (viewer) {
    var dragging = false;
    var isDrawPoint = true;
    var point;

    const handlerPoint = viewer.screenSpaceEventHandler;
    handlerPoint.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handlerPoint.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handlerPoint.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    handlerPoint.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    handlerPoint.setInputAction(function(click) {
        const ray = viewer.scene.camera.getPickRay(click.position);
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        // var videoElement = document.getElementById('trailer');
        if(cartesian&&isDrawPoint){
            viewer.entities.remove(point);
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            const longitude = Cesium.Math.toDegrees(cartographic.longitude);//经度值
            const latitude = Cesium.Math.toDegrees(cartographic.latitude);//纬度值
            point =  viewer.entities.add({
                name: 'point',
                position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 300000.0),
                point: { //点
                    pixelSize: 12,
                    color: Cesium.Color.YELLOW,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 0,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                },
                ellipsoid : { //球
                    radii : new Cesium.Cartesian3(300000.0, 300000.0, 300000.0),
                    material : global_.prod+'images/earth.jpg',
                    outline : false,
                    outlineColor : Cesium.Color.BLACK,
                }
            });
            // var isRepeating = true;
            // point.ellipsoid.material.repeat = new Cesium.CallbackProperty(function(time, result) {
            //     if (!Cesium.defined(result)) {
            //         result = new Cesium.Cartesian2();
            //     }
            //     if (isRepeating) {
            //         result.x = 2;
            //         result.y = 2;
            //     } else {
            //         result.x = 1;
            //         result.y = 1;
            //     }
            //     return result;
            // }, false);
            isDrawPoint = false;
            handlerPoint.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handlerPoint.setInputAction(
        function(click) {
            const pickedObject = viewer.scene.pick(click.position);
            if (Cesium.defined(pickedObject) && (pickedObject.id === point)) {
                point.point.pixelSize = 15;
                dragging = true;
                viewer.scene.screenSpaceCameraController.enableRotate = false;
                viewer.scene.screenSpaceCameraController.enableZoom = false;
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    handlerPoint.setInputAction(
        function(movement) {
            if (dragging) {
                const ray = viewer.scene.camera.getPickRay(movement.endPosition);
                const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
                const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                const longitude = Cesium.Math.toDegrees(cartographic.longitude);//经度值
                const latitude = Cesium.Math.toDegrees(cartographic.latitude);//纬度值
                point.position = Cesium.Cartesian3.fromDegrees(longitude, latitude, 300000.0);
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    handlerPoint.setInputAction(
        function() {
            if(point){
                point.point.pixelSize = 12;
                dragging = false;
                viewer.scene.screenSpaceCameraController.enableRotate = true;
                viewer.scene.screenSpaceCameraController.enableZoom = true;
            }
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
}

export default draw3Dsphere;
