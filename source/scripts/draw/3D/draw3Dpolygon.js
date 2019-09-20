/**
 * 绘制多面体
 * @param viewer
 */
var draw3Dpolygon = function (viewer) {
    const tooltip = document.getElementById("ToolTip");
    let isDrawPolygon = true;
    let polygon = undefined;
    let doubleClick = false;
    let polygonPath = []; // 存放polygon位置
    const handler = viewer.screenSpaceEventHandler; // 创建鼠标操作对象
    handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    const CreatePolygon = (function () {
        function _(positons) {
            if (!Cesium.defined(positons)) {
                throw new Cesium.DeveloperError('positions is required!');
            }
            if (positons.length < 3) {
                throw new Cesium.DeveloperError('positions 的长度必须大于等于2');
            }

            this.options = {
                name: 'polygon',
                polygon: {
                    extrudedHeight: 500000.0,
                    material : Cesium.Color.ORANGE,
                    outline : true
                }
            };
            this.path = positons;
            this._init();
        }

        _.prototype._init = function () {
            const that = this;
            const positionCBP = function () {
                if(polygonPath.length>0){
                    const positions = [];
                    for (let i = 0; i < that.path.length; i++) {
                        const cartographic = Cesium.Cartographic.fromCartesian(that.path[i]);
                        const longitude = Cesium.Math.toDegrees(cartographic.longitude);//经度值
                        const latitude = Cesium.Math.toDegrees(cartographic.latitude);//纬度值
                        // const height = cartographic.height;//高度值
                        // const height = 100000.0
                        positions.push(longitude);
                        positions.push(latitude);
                        // positions.push(height);
                    }
                    return Cesium.Cartesian3.fromDegreesArray(positions);
                }
            };
            this.options.polygon.hierarchy = new Cesium.CallbackProperty(positionCBP, false);
            viewer.entities.add(this.options);
        };

        return _;
    })();

    // 设置鼠标单击事件
    let handlerClick = function(movement)  {
        // 获取鼠标单击点位置
        const ray = viewer.scene.camera.getPickRay(movement.position);
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if(cartesian){
            polygonPath.push(cartesian);
            // 移除鼠标单击事件
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
    }
    handler.setInputAction(handlerClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // 设置鼠标移动事件
    handler.setInputAction(function(movement) {
        tooltip.style.left = movement.endPosition.x + 5 + "px";
        tooltip.style.top = movement.endPosition.y + 10 + "px";
        tooltip.style.display = "block";
        tooltip.innerHTML ='<p>单击开始</p>';
        const ray = viewer.scene.camera.getPickRay(movement.endPosition);
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (cartesian) {
            if (isDrawPolygon) {
                tooltip.style.left = movement.endPosition.x + 5 + "px";
                tooltip.style.top = movement.endPosition.y + 10 + "px";
                tooltip.style.display = "block";

                if (polygonPath.length < 2) {
                    if(polygonPath.length>0){
                        tooltip.innerHTML = '<p>单击增加点，右击删除点</p>';
                        handler.setInputAction(handlerClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                    }
                    return;
                }
                if (!Cesium.defined(polygon)) {
                    polygonPath.push(cartesian);

                    polygon = new CreatePolygon(polygonPath);

                } else {
                    polygon.path.pop();
                    polygon.path.push(cartesian);
                }

                if (polygonPath.length >= 3) {
                    tooltip.innerHTML = '<p>单击增加点，右击删除点，双击确定终点</p>';
                    doubleClick = true;
                    handler.setInputAction(handlerClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                }
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // 设置鼠标右击事件
    handler.setInputAction(function() {
        if(polygonPath.length!==2){
            polygonPath.pop();
        }else{
            handler.setInputAction(handlerClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    // 设置鼠标双击事件
    handler.setInputAction(function(movement) {
        if(polygonPath.length >= 3 && doubleClick){
            handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            var ray = viewer.scene.camera.getPickRay(movement.position);
            var cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            function getPolygonPath(path) {
                const positions = [];
                for (let i = 0; i < path.length; i++) {
                    const cartographic = Cesium.Cartographic.fromCartesian(path[i]);
                    const longitude = Cesium.Math.toDegrees(cartographic.longitude);//经度值
                    const latitude = Cesium.Math.toDegrees(cartographic.latitude);//纬度值
                    // const height = cartographic.height;//高度值
                    // const height = 100000.0
                    positions.push(longitude);
                    positions.push(latitude);
                    // positions.push(height);
                }
                return Cesium.Cartesian3.fromDegreesArray(positions);
            }
            if (cartesian) {
                if (isDrawPolygon) {
                    polygonPath.push(cartesian);
                    const options = {
                        polygon : {
                            hierarchy : getPolygonPath(polygonPath),
                            extrudedHeight: 500000.0,
                            material : Cesium.Color.ORANGE,
                            outline : true
                        }
                    }
                    viewer.entities.add(options);
                }
            }
            isDrawPolygon = false;
            polygonPath = [];
            polygon = undefined;
            doubleClick = false;
            tooltip.style.display = 'none';
        }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
}

export default draw3Dpolygon;
