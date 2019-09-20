/**
 * 绘制长方体
 * @param viewer
 */
var draw3Drectangle = function (viewer) {
    const tooltip = document.getElementById("ToolTip");
    let isDrawRectangle = true;
    let rectangle = undefined;
    let doubleClick = false;
    let rectanglePath = []; // 存放wall位置
    const handler = viewer.screenSpaceEventHandler; // 创建鼠标操作对象
    handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    const CreateRectangle = (function () {
        function _(positons) {
            if (!Cesium.defined(positons)) {
                throw new Cesium.DeveloperError('positions is required!');
            }
            if (positons.length < 2) {
                throw new Cesium.DeveloperError('positions 的长度必须大于等于2');
            }

            this.options = {
                name: 'wall',
                rectangle: {
                    material : Cesium.Color.GREEN,
                    extrudedHeight : 300000.0,
                    outline : true
                }
            };
            this.path = positons;
            this._init();
        }

        _.prototype._init = function () {
            const that = this;
            const positionCBP = function () {
                if(rectanglePath.length>0){
                    return Cesium.Rectangle.fromCartesianArray(that.path);
                }
            };
            this.options.rectangle.coordinates = new Cesium.CallbackProperty(positionCBP, false);
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
            rectanglePath.push(cartesian);
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
            if (isDrawRectangle) {
                tooltip.style.left = movement.endPosition.x + 5 + "px";
                tooltip.style.top = movement.endPosition.y + 10 + "px";
                tooltip.style.display = "block";

                if (rectanglePath.length < 1) {
                    return;
                }else{
                    tooltip.innerHTML = '<p>双击确定终点</p>';
                    doubleClick = true;
                }
                if (!Cesium.defined(rectangle)) {
                    rectanglePath.push(cartesian);

                    rectangle = new CreateRectangle(rectanglePath);

                } else {
                    rectangle.path.pop();
                    rectangle.path.push(cartesian);
                }
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // 设置鼠标双击事件
    handler.setInputAction(function(movement) {
        if(rectanglePath.length >= 2 && doubleClick){
            handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            var ray = viewer.scene.camera.getPickRay(movement.position);
            var cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            function getRectanglePath(path) {
                return Cesium.Rectangle.fromCartesianArray(path);
            }
            if (cartesian) {
                if (isDrawRectangle) {
                    rectanglePath.push(cartesian);
                    const options = {
                        rectangle : {
                            coordinates : getRectanglePath(rectanglePath),
                            material : Cesium.Color.GREEN,
                            extrudedHeight : 300000.0,
                            outline : true
                        }
                    }
                    viewer.entities.add(options);
                }
            }
            isDrawRectangle = false;
            rectanglePath = [];
            rectangle = undefined;
            doubleClick = false;
            tooltip.style.display = 'none';
        }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
}

export default draw3Drectangle;
