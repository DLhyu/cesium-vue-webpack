/**
 * 绘制圆
 * @param viewer
 */
var draw2Dcircle = function (viewer) {
    const tooltip = document.getElementById("ToolTip");
    const handler = viewer.screenSpaceEventHandler; // 创建鼠标操作对象
    handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    var polylinePath = []; // 存放线位置
    var circle = undefined;

    var CreateCircle = (function() {
        function _(positons) {
            if (!Cesium.defined(positons)) {
                throw new Cesium.DeveloperError('positions is required!');
            }
            if (positons.length < 2) {
                throw new Cesium.DeveloperError('positions 的长度必须大于等于2');
            }
            function caculDistance() {
                if(polylinePath.length>0){
                    const dis = Cesium.Cartesian3.distance(polylinePath[0], polylinePath[polylinePath.length - 1]);
                    if(dis>1000){
                        return '半径:' + (dis/1000).toFixed(2).toString() + '公里';
                    }else{
                        return '半径:' + dis.toFixed(2).toString() + '米';
                    }
                }
            }
            this.options = {
                position: polylinePath[0],
                polyline : {
                    show : true,
                    width : 4,
                    material : new Cesium.PolylineOutlineMaterialProperty({
                        color : Cesium.Color.YELLOW,
                        outlineWidth : 2,
                        outlineColor : Cesium.Color.YELLOW
                    }),
                    depthFailMaterial : new Cesium.PolylineOutlineMaterialProperty({
                        color : Cesium.Color.RED,
                        outlineWidth : 2,
                        outlineColor : Cesium.Color.RED
                    }),
                    clampToGround : true,
                    followSurface : false
                },
                ellipse : {
                    semiMinorAxis : 0.0,
                    semiMajorAxis : 0.0,
                    material : Cesium.Color.RED.withAlpha(0.5),
                    outline : true
                },
                label: {
                    show: true,
                    showBackground: true,
                    font: '10px monospace',
                    horizontalOrigin: Cesium.HorizontalOrigin.RIGHT,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(-5, -5),
                    text: new Cesium.CallbackProperty(caculDistance, false)
                }
            }

            this.path = positons;

            this._init();
        }

        _.prototype._init = function() {
            const updatePolylinePosition = function () {
                if(polylinePath.length>0){
                    return polylinePath;
                }
            }
            const updateEllipseRadius = function(){
                if(polylinePath.length>0){
                    return Cesium.Cartesian3.distance(polylinePath[0], polylinePath[polylinePath.length-1]);
                }
            }
            this.options.polyline.positions = new Cesium.CallbackProperty(updatePolylinePosition, false);
            this.options.ellipse.semiMinorAxis = new Cesium.CallbackProperty(updateEllipseRadius, false);
            this.options.ellipse.semiMajorAxis = new Cesium.CallbackProperty(updateEllipseRadius, false);
            viewer.entities.add(this.options);
        };

        return _;
    })();

    // 设置鼠标单击事件
    handler.setInputAction(function (movement) {
        // 获取鼠标单击点位置
        const ray = viewer.scene.camera.getPickRay(movement.position);
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if(cartesian){
            polylinePath.push(cartesian);
            const options = {
                name: '起点',
                position: cartesian,
                point: {
                    color: Cesium.Color.RED,
                    pixelSize: 6,
                    outlineColor: Cesium.Color.YELLOW,
                    outlineWidth: 2
                }
            }
            // 添加点实体
            viewer.entities.add(options);
            // 移除鼠标单击事件
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // 设置鼠标移动事件
    handler.setInputAction(function (movement) {
        tooltip.style.left = movement.endPosition.x + 5 + "px";
        tooltip.style.top = movement.endPosition.y + 10 + "px";
        tooltip.style.display = "block";
        tooltip.innerHTML ='<p>单击开始</p>';
        // 获取鼠标移动最后的位置
        var ray = viewer.scene.camera.getPickRay(movement.endPosition);
        var cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if(cartesian){
            if (cartesian) {
                if (polylinePath.length < 1) {
                    return;
                }else{
                    tooltip.innerHTML = '<p>双击确定终点</p>';
                }
                if (!Cesium.defined(circle)) {
                    polylinePath.push(cartesian);

                    circle = new CreateCircle(polylinePath);

                } else {
                    circle.path.pop();
                    circle.path.push(cartesian);
                }
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 设置鼠标双击事件
    handler.setInputAction(function () {
        handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        if (polylinePath.length < 2) {
            throw new Cesium.DeveloperError('positions 的长度必须大于等于2');
        }
        const radius = Cesium.Cartesian3.distance(polylinePath[0], polylinePath[polylinePath.length-1]);
        const options = {
            position: polylinePath[0],
            ellipse : {
                semiMinorAxis : radius,
                semiMajorAxis : radius,
                material : Cesium.Color.RED.withAlpha(0.5),
            }
        }
        polylinePath = [];
        viewer.entities.add(options);
        tooltip.style.display = 'none';
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
}

export default draw2Dcircle;
