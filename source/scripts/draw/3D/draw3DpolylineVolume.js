/**
 * 绘制管道线
 * @param viewer
 */
var draw3DpolylineVolume = function (viewer) {
    const tooltip = document.getElementById("ToolTip");
    let isDrawPolylineVolume = true;
    let polylineVolume = undefined;
    let doubleClick = false;
    let polylineVolumePath = []; // 存放管道线位置
    const handler = viewer.screenSpaceEventHandler; // 创建鼠标操作对象
    handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    function computeKxCircle(e) {
        var i = e / 3,
            r = [], a = 0, t;
        for (a = 0; a <= 360; a++) {
            t = Cesium.Math.toRadians(a);
            r.push(new Cesium.Cartesian2(e * Math.cos(t), e * Math.sin(t)));
        }
        for (a = 360; 0 <= a; a--) {
            t = Cesium.Math.toRadians(a);
            r.push(new Cesium.Cartesian2((e - i) * Math.cos(t), (e - i) * Math.sin(t)));
        }
        return r;
    }

    const CreatepolylineVolume = (function () {
        function _(positons) {
            if (!Cesium.defined(positons)) {
                throw new Cesium.DeveloperError('positions is required!');
            }
            if (positons.length < 2) {
                throw new Cesium.DeveloperError('positions 的长度必须大于等于2');
            }

            this.options = {
                name: 'polylineVolume',
                polylineVolume: {
                    shape : computeKxCircle(6e4),
                    material : Cesium.Color.CYAN
                }
            };
            this.path = positons;
            this._init();
        }

        _.prototype._init = function () {
            const that = this;
            const positionCBP = function () {
                if(polylineVolumePath.length>0){
                    const positions = [];
                    for (let i = 0; i < that.path.length; i++) {
                        const cartographic = Cesium.Cartographic.fromCartesian(that.path[i]);
                        const longitude = Cesium.Math.toDegrees(cartographic.longitude);//经度值
                        const latitude = Cesium.Math.toDegrees(cartographic.latitude);//纬度值
                        const height = cartographic.height;//高度值
                        positions.push(longitude);
                        positions.push(latitude);
                        positions.push(height);
                    }
                    return Cesium.Cartesian3.fromDegreesArrayHeights(positions);
                }
            };
            this.options.polylineVolume.positions = new Cesium.CallbackProperty(positionCBP, false);
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
            polylineVolumePath.push(cartesian);
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
            if (isDrawPolylineVolume) {
                tooltip.style.left = movement.endPosition.x + 5 + "px";
                tooltip.style.top = movement.endPosition.y + 10 + "px";
                tooltip.style.display = "block";

                if (polylineVolumePath.length < 1) {
                    return;
                }
                if (!Cesium.defined(polylineVolume)) {
                    polylineVolumePath.push(cartesian);

                    polylineVolume = new CreatepolylineVolume(polylineVolumePath);

                } else {
                    polylineVolume.path.pop();
                    polylineVolume.path.push(cartesian);
                }

                if (polylineVolumePath.length >= 2) {
                    tooltip.innerHTML = '<p>单击增加点，右击删除点，双击确定终点</p>';
                    doubleClick = true;
                    handler.setInputAction(handlerClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                }else if(polylineVolumePath.length === 1){
                    handler.setInputAction(handlerClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                }
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // 设置鼠标右击事件
    handler.setInputAction(function() {
        if(polylineVolumePath.length!==1){
            polylineVolumePath.pop();
        }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    // 设置鼠标双击事件
    handler.setInputAction(function(movement) {
        if(polylineVolumePath.length >= 3 && doubleClick){
            handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            var ray = viewer.scene.camera.getPickRay(movement.position);
            var cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            function getPolylineVolumePath(path) {
                const positions = [];
                for (let i = 0; i < path.length; i++) {
                    const cartographic = Cesium.Cartographic.fromCartesian(path[i]);
                    const longitude = Cesium.Math.toDegrees(cartographic.longitude);//经度值
                    const latitude = Cesium.Math.toDegrees(cartographic.latitude);//纬度值
                    const height = cartographic.height;//高度值
                    positions.push(longitude);
                    positions.push(latitude);
                    positions.push(height);
                }
                return Cesium.Cartesian3.fromDegreesArrayHeights(positions);
            }
            if (cartesian) {
                if (isDrawPolylineVolume) {
                    polylineVolumePath.push(cartesian);
                    const options = {
                        polylineVolume : {
                            positions : getPolylineVolumePath(polylineVolumePath),
                            shape : computeKxCircle(6e4),
                            material : Cesium.Color.CYAN
                        }
                    }
                    viewer.entities.add(options);
                }
            }
            isDrawPolylineVolume = false;
            polylineVolumePath = [];
            polylineVolume = undefined;
            doubleClick = false;
            tooltip.style.display = 'none';
        }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
}

export default draw3DpolylineVolume;
