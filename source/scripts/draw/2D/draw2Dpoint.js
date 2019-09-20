/**
 * 绘制二维点
 * @param viewer
 * @param handler
 */
const draw2Dpoint=function (viewer, handler) {
    var dragging = false;
    var isDrawPoint = true;
    var point;

    // viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    // viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    const handlerPoint = handler;
    handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    handlerPoint.setInputAction(function(click) {
        const ray = viewer.scene.camera.getPickRay(click.position);
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if(cartesian&&isDrawPoint){
            viewer.entities.remove(point);
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            const longitude = Cesium.Math.toDegrees(cartographic.longitude);//经度值
            const latitude = Cesium.Math.toDegrees(cartographic.latitude);//纬度值
            point =  viewer.entities.add({
                name: 'point',
                position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
                point: { //点
                    pixelSize: 12,
                    color: Cesium.Color.YELLOW,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 0,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                }
            });
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
                point.position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
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

export default draw2Dpoint;
