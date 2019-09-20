/**
 * 点、线、面缓冲分析
 * @param viewer
 * @param type
 * @param radius
 */
var bufferAnalysis = function (viewer, type, radius) {
    viewer.entities.removeAll();
    const tooltip = document.getElementById("ToolTip");
    let isDrawPolylineVolume = true;
    let polylineVolume = undefined;
    let doubleClick = false;
    let polylineVolumePath = []; // 存放管道线位置
    const handler = viewer.screenSpaceEventHandler;
    handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    function cartesian2LonLat(cartesian){
        //将笛卡尔坐标转换为地理坐标
        var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
        //将弧度转为度的十进制度表示
        var pos = {
            lon: Cesium.Math.toDegrees(cartographic.longitude),
            lat: Cesium.Math.toDegrees(cartographic.latitude),
            alt: Math.ceil(cartographic.height)
        };
        return pos;
    }

    function getPositions(feature) {
        const coordinates = feature.geometry.coordinates;
        if (!coordinates || coordinates.length < 1) {
            return null;
        }
        const pnts = coordinates[0];
        if (!pnts || pnts.length < 3) {
            return null;
        }

        const positions = [];
        for (let j = 0; j < pnts.length; j++) {
            const p = pnts[j];
            const c = Cesium.Cartesian3.fromDegrees(p[0], p[1]);
            positions.push(c);
        }

        return positions;
    }

    // 计算线缓冲范围
    function computeBufferLine(positions, radius) {
        const arr = [];
        const first = positions[0];
        const num = positions.length;
        for (let i = 0; i < num; i++) {
            const p = cartesian2LonLat(positions[i]);
            if (i === num - 1 && first === p) {
                break;
            }
            arr.push([p.lon, p.lat]);
        }

        const line = turf.lineString(arr);
        const feature = turf.buffer(line, radius * 1000, { units: 'meters' });
        return getPositions(feature);
    }

    // 计算面缓冲范围
    function computeBufferPolygon(positions, radius) {
        var arr = [];
        var polygonStr = [];
        var first = positions[0];
        var num = positions.length;
        for (var i = 0; i < num; i++) {
            var p = cartesian2LonLat(positions[i]);
            if (i === num - 1 && first === p) {
                break;
            }
            arr.push([p.lon, p.lat]);
        }
        polygonStr.push(arr);

        const polygon = turf.polygon(polygonStr);
        const feature = turf.buffer(polygon, radius * 1000, { units: 'meters' });
        return getPositions(feature);
    }

    if(type==='point'){
        handler.setInputAction(function(click) {
            const ray = viewer.scene.camera.getPickRay(click.position);
            const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            if(cartesian){
                const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                const longitude = Cesium.Math.toDegrees(cartographic.longitude);//经度值
                const latitude = Cesium.Math.toDegrees(cartographic.latitude);//纬度值
                viewer.entities.add({
                    name: 'point',
                    position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
                    point: { //点
                        pixelSize: 12,
                        color: Cesium.Color.YELLOW,
                        outlineColor: Cesium.Color.WHITE,
                        outlineWidth: 5,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                    },
                    ellipse : { // 圆
                        semiMinorAxis : radius*1000,
                        semiMajorAxis : radius*1000,
                        material : Cesium.Color.RED.withAlpha(0.5),
                    }
                });
                handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }else if(type==='polyline'){
        const CreatepolylineVolume = (function () {
            function _(positons) {
                if (!Cesium.defined(positons)) {
                    throw new Cesium.DeveloperError('positions is required!');
                }
                if (positons.length < 2) {
                    throw new Cesium.DeveloperError('positions 的长度必须大于等于2');
                }

                this.options = {
                    name: 'polyline',
                    polyline: {
                        clampToGround: true,
                        width: 2,
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
                            // const height = cartographic.height;//高度值
                            positions.push(longitude);
                            positions.push(latitude);
                            // positions.push(height);
                        }
                        return Cesium.Cartesian3.fromDegreesArray(positions);
                    }
                };
                this.options.polyline.positions = new Cesium.CallbackProperty(positionCBP, false);
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
                        // const height = cartographic.height;//高度值
                        positions.push(longitude);
                        positions.push(latitude);
                        // positions.push(height);
                    }
                    return Cesium.Cartesian3.fromDegreesArray(positions);
                }
                const bufferLine = computeBufferLine(polylineVolumePath, radius);
                if (cartesian) {
                    if (isDrawPolylineVolume) {
                        polylineVolumePath.push(cartesian);
                        const options = {
                            polyline : {
                                positions : getPolylineVolumePath(polylineVolumePath),
                                clampToGround: true,
                                width: 2,
                                material : Cesium.Color.CYAN
                            },
                            polygon: new Cesium.PolygonGraphics({
                                hierarchy: bufferLine,
                                asynchronous: false,
                                material: Cesium.Color.RED.withAlpha(0.5),
                            }),
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
    }else if(type==='polygon'){
        const tooltip = document.getElementById("ToolTip");
        let isDrawPolylineVolume = true;
        let polylineVolume = undefined;
        let doubleClick = false;
        let polylineVolumePath = []; // 存放管道线位置
        let polyline = undefined;

        const CreatePolyline = (function() {
            function _(positons) {
                if (!Cesium.defined(positons)) {
                    throw new Cesium.DeveloperError('positions is required!');
                }
                if (positons.length < 2) {
                    throw new Cesium.DeveloperError('positions 的长度必须大于等于2');
                }
                this.options = {
                    name: 'polyline',
                    polyline : {
                        show : true,
                        width: 2,
                        material : Cesium.Color.BLUE,
                        clampToGround : true,
                    }
                };
                this.path = positons;
                this._init();
            }

            _.prototype._init = function() {
                var that = this;
                var positionCBP = function() {
                    if(polylineVolumePath.length>0) {
                        return that.path;
                    }
                };
                this.options.polyline.positions = new Cesium.CallbackProperty(positionCBP, false);
                viewer.entities.add(this.options);
            };

            return _;
        })();

        const CreatepolylineVolume = (function () {
            function _(positons) {
                if (!Cesium.defined(positons)) {
                    throw new Cesium.DeveloperError('positions is required!');
                }
                if (positons.length < 3) {
                    throw new Cesium.DeveloperError('positions 的长度必须大于等于3');
                }

                this.options = {
                    name: 'polygon',
                    polyline: {
                        show: true,
                        positions: positons,
                        clampToGround: true,
                        width: 2,
                        material: Cesium.Color.BLUE
                    },
                    polygon: {
                        hierarchy: positons,
                        material : Cesium.Color.YELLOW.withAlpha(0.5)
                    }
                };
                this.path = positons;
                this._init();
            }

            _.prototype._init = function () {
                const _self = this;
                const _updatePolygon = function () {
                    if(polylineVolumePath.length>0) {
                        return _self.path;
                    }
                };
                const _updatePolyline = function () {
                    if(polylineVolumePath.length>0) {
                        if (_self.path.length > 1) {
                            const arr = [].concat(_self.path);
                            const first = _self.path[0];
                            arr.push(first);
                            return arr;
                        } else {
                            return null;
                        }
                    }
                };
                this.options.polyline.positions = new Cesium.CallbackProperty(_updatePolyline, false);
                this.options.polygon.hierarchy = new Cesium.CallbackProperty(_updatePolygon, false);
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

                    if (polylineVolumePath.length < 3) {
                        if(polylineVolumePath.length > 0){
                            tooltip.innerHTML = '<p>单击增加点，右击删除点</p>';
                            handler.setInputAction(handlerClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                            if (!Cesium.defined(polyline)) {
                                polylineVolumePath.push(cartesian);

                                polyline = new CreatePolyline(polylineVolumePath);

                            } else {
                                polyline.path.pop();
                                polyline.path.push(cartesian);
                            }
                        }
                        return
                    }
                    if (!Cesium.defined(polylineVolume)) {
                        polylineVolumePath.push(cartesian);

                        polylineVolume = new CreatepolylineVolume(polylineVolumePath);

                    } else {
                        polylineVolume.path.pop();
                        polylineVolume.path.push(cartesian);
                    }

                    if (polylineVolumePath.length >= 3) {
                        tooltip.innerHTML = '<p>单击增加点，右击删除点，双击确定终点</p>';
                        doubleClick = true;
                        handler.setInputAction(handlerClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // 设置鼠标右击事件
        handler.setInputAction(function() {
            if(polylineVolumePath.length!==2){
                polylineVolumePath.pop();
            }else{
                handler.setInputAction(handlerClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
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
                        // const height = cartographic.height;//高度值
                        positions.push(longitude);
                        positions.push(latitude);
                        // positions.push(height);
                    }
                    return Cesium.Cartesian3.fromDegreesArray(positions);
                }
                if (cartesian) {
                    if (isDrawPolylineVolume) {
                        polylineVolumePath.push(cartesian);
                        const polylinePath = [].concat(polylineVolumePath);
                        polylinePath.push(polylineVolumePath[0]);
                        const bufferPolygon = computeBufferPolygon(polylinePath, 2);
                        const options = {
                            polyline : {
                                positions : polylinePath,
                                clampToGround: true,
                                width: 2,
                                material : Cesium.Color.BLUE.withAlpha(0.5),
                                zIndex: 2
                            },
                            polygon: new Cesium.PolygonGraphics({
                                hierarchy: polylineVolumePath,
                                asynchronous: false,
                                material: Cesium.Color.YELLOW.withAlpha(0.5),
                                zIndex: 2
                            }),
                        }
                        viewer.entities.add(options);
                        const options1 = {
                            polygon: new Cesium.PolygonGraphics({
                                hierarchy: bufferPolygon,
                                asynchronous: false,
                                material: Cesium.Color.RED.withAlpha(0.5),
                                zIndex: 1
                            }),
                        }
                        viewer.entities.add(options1);
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
}

export default bufferAnalysis;
