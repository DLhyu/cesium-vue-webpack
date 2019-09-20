/**
 * 绘制矩形
 * @param viewer
 */
var draw2Drectangle = function (viewer) {
    var tooltip = document.getElementById("ToolTip");
    var isRectangle = true;
    var CreateRectangle = (function() {
        function _(positons) {
            if (!Cesium.defined(positons)) {
                throw new Cesium.DeveloperError('positions is required!');
            }
            if (positons.length < 2) {
                throw new Cesium.DeveloperError('positions 的长度必须大于等于2');
            }

            function getCoordinates(){
                return Cesium.Rectangle.fromCartesianArray(positons);
            }

            this.options = {
                rectangle : {
                    show : true,
                    coordinates : new Cesium.CallbackProperty(getCoordinates, false),
                    material : Cesium.Color.fromCssColorString('#00ff00').withAlpha(0.5),
                    // height : 0,
                    // extrudedHeight : new Cesium.CallbackProperty(getExtrudedHeight, false),
                    // outline : true,
                    // outlineColor : Cesium.Color.fromCssColorString('#fff')
                }
            };
            this.path = positons;

            this._init();
        }

        _.prototype._init = function() {
            viewer.entities.add(this.options);
        };

        return _;
    })();

    var polygonPath = [];
    var polygon = undefined;

    var handler = viewer.cesiumWidget.screenSpaceEventHandler;
    handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    handler.setInputAction(function(movement) {
        tooltip.style.left = movement.endPosition.x + 5 + "px";
        tooltip.style.top = movement.endPosition.y + 10 + "px";
        tooltip.style.display = "block";
        tooltip.innerHTML ='<p>单击开始</p>';
        var ray = viewer.scene.camera.getPickRay(movement.endPosition);

        var cartesian = viewer.scene.globe.pick(ray, viewer.scene);

        if (cartesian) {
            if (isRectangle) {
                if (polygonPath.length < 1) {
                    return;
                }else{
                    tooltip.innerHTML = '<p>双击确定终点</p>';
                }
                if (!Cesium.defined(polygon)) {
                    polygonPath.push(cartesian);

                    polygon = new CreateRectangle(polygonPath);

                } else {
                    polygon.path.pop();
                    polygon.path.push(cartesian);
                }
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    handler.setInputAction(function(movement) {
        var ray = viewer.scene.camera.getPickRay(movement.position);

        var cartesian = viewer.scene.globe.pick(ray, viewer.scene);

        if (cartesian) {
            if (isRectangle) {
                polygonPath.push(cartesian);
            }
        }
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction(function() {
        isRectangle = false;
        polygonPath = [];
        polygon = undefined;
        tooltip.style.display = 'none';
        handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
}

export default draw2Drectangle;
