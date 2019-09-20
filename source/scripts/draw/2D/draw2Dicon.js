/**
 * 绘制标记点
 * @param viewer
 * @param handler
 */
var draw2Dicon=function (viewer, handler) {
    var dragging = false;
    var isDrawIcon = true;
    var icon;

    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    const handlerIcon = handler;
    handlerIcon.setInputAction(function(click) {
        const ray = viewer.scene.camera.getPickRay(click.position);
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if(cartesian&&isDrawIcon){
            viewer.entities.remove(icon);
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            const longitude = Cesium.Math.toDegrees(cartographic.longitude);//经度值
            const latitude = Cesium.Math.toDegrees(cartographic.latitude);//纬度值
            icon =  viewer.entities.add({
                name: 'billboard',
                position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
                billboard: { //点
                    image: '../static/images/marker/mark1.png',
                    pixelOffset: new Cesium.Cartesian2(0, -20),
                    // verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                }
            });
            isDrawIcon = false;
            handlerIcon.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handlerIcon.setInputAction(
        function(click) {
            const pickedObject = viewer.scene.pick(click.position);
            if (Cesium.defined(pickedObject) && (pickedObject.id === icon)) {
                icon.billboard.scale = 1.2;
                dragging = true;
                viewer.scene.screenSpaceCameraController.enableRotate = false;
                viewer.scene.screenSpaceCameraController.enableZoom = false;
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    handlerIcon.setInputAction(
        function(movement) {
            if (dragging) {
                const ray = viewer.scene.camera.getPickRay(movement.endPosition);
                const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
                const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                const longitude = Cesium.Math.toDegrees(cartographic.longitude);//经度值
                const latitude = Cesium.Math.toDegrees(cartographic.latitude);//纬度值
                icon.position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    handlerIcon.setInputAction(
        function() {
            if(icon){
                icon.billboard.scale = 1;
                dragging = false;
                viewer.scene.screenSpaceCameraController.enableRotate = true;
                viewer.scene.screenSpaceCameraController.enableZoom = true;
            }
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
}

export default draw2Dicon;
