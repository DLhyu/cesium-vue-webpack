/**
 * 绘制面
 * @param viewer
 * @param handler
 */
var draw2Dpolygon = function (viewer, handler) {
    var tooltip = document.getElementById("ToolTip");
    var isDraw = false;
    var doubleClick = false;
    let polyline = undefined;
    var polygonPath = [];
    var AllEnities = [];
    var pointPso = [];
    var polygon = null;
    var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
        dashLength: 16,
        color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7)
    });
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    var handlerPolygon = handler;
    handlerPolygon.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handlerPolygon.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handlerPolygon.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    handlerPolygon.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    handlerPolygon.setInputAction(function (movement) {
        tooltip.style.left = movement.endPosition.x + 5 + "px";
        tooltip.style.top = movement.endPosition.y + 10 + "px";
        tooltip.style.display = "block";
        tooltip.innerHTML ='<p>单击开始</p>';
        //新增部分
        var position1;
        var cartographic;
        var ray = viewer.scene.camera.getPickRay(movement.endPosition);
        if (ray)
            position1 = viewer.scene.globe.pick(ray, viewer.scene);
        if (position1)
            cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position1);
        if (cartographic) {
            //海拔
            var height = viewer.scene.globe.getHeight(cartographic);
            var point = Cesium.Cartesian3.fromDegrees(cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180, height);
            if (isDraw) {
                tooltip.style.left = movement.endPosition.x + 5 + "px";
                tooltip.style.top = movement.endPosition.y + 10 + "px";
                tooltip.style.display = "block";

                if (polygonPath.length < 3) {
                    if(polygonPath.length>0){
                        tooltip.innerHTML = '<p>单击增加点，右击删除点</p>';
                        handlerPolygon.setInputAction(handlerClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                        if (!Cesium.defined(polyline)) {
                            polygonPath.push(point);

                            polyline = new CreatePolyline(polygonPath);

                        } else {
                            polyline.path.pop();
                            polyline.path.push(point);
                        }
                    }
                    return;
                }
                if (!Cesium.defined(polygon)) {
                    polygonPath.push(point);
                    polygon = new CreatePolygon(polygonPath);
                    // AllEnities.push(polygon);
                } else {
                    polygon.path.pop();
                    polygon.path.push(point);
                    // AllEnities.push(polygon);
                }
                if (polygonPath.length >= 3) {
                    tooltip.innerHTML = '<p>单击增加点，右击删除点，双击确定终点</p>';
                    doubleClick = true;
                    handlerPolygon.setInputAction(handlerClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                }
            }
        }

    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    let handlerClick = function (movement) {
        isDraw = true;
        //新增部分
        var position1;
        var cartographic;
        var ray = viewer.scene.camera.getPickRay(movement.position);
        if (ray)
            position1 = viewer.scene.globe.pick(ray, viewer.scene);
        if (position1)
            cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position1);
        if (cartographic) {
            //海拔
            // postions.push(position1);
            var height = viewer.scene.globe.getHeight(cartographic);
            var point = Cesium.Cartesian3.fromDegrees(cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180, height);
            var pos = Cesium.Cartographic.fromCartesian(position1);
            var longitudeString = Cesium.Math.toDegrees(pos.longitude);
            var latitudeString = Cesium.Math.toDegrees(pos.latitude);
            // var heightString = pos.height;
            pointPso.push({ lon: longitudeString, lat: latitudeString });
            if (isDraw) {
                polygonPath.push(point);
                var p = viewer.entities.add({
                    position: point,
                    point: {
                        show: true,
                        color: Cesium.Color.SKYBLUE,
                        pixelSize: 4,
                        outlineColor: Cesium.Color.YELLOW,
                        outlineWidth: 1
                    },
                });
                AllEnities.push(p);
                handlerPolygon.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            }
        }
    }
    handlerPolygon.setInputAction(handlerClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handlerPolygon.setInputAction(function(movement) {
        if(polygonPath.length!==2){
            polygonPath.pop();
            pointPso.pop();
            viewer.entities.remove(AllEnities[AllEnities.length-1]);
            AllEnities.pop();
            // if(polygonPath.length===1){
            //     polygonPath.pop();
            // }
        }else{
            handlerPolygon.setInputAction(handlerClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    handlerPolygon.setInputAction(function () {
        if(polygonPath.length >= 3 && doubleClick){
            handlerPolygon.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            handlerPolygon.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            handlerPolygon.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
            handlerPolygon.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            // pointPso.pop();
            for(var i=1;i<pointPso.length;i++){
                if(pointPso[i].lon === pointPso[i-1].lon){
                    pointPso.splice(i, 1);
                }
            }
            if (polygonPath.length >= 2) {
                var lastpoint = viewer.entities.add({
                    name: '多边形面积',
                    position: polygon.path[polygon.path.length - 1],
                    point: {
                        pixelSize: 4,
                        color: Cesium.Color.RED,
                        outlineColor: Cesium.Color.WHITE,
                        outlineWidth: 1,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                    },
                    // polyline: {
                    //     positions: polygon.path[1],
                    //     clampToGround: true,
                    //     width: 2,
                    //     material: outlineMaterial
                    // }
                });
            }
            viewer.trackedEntity = undefined;
            isDraw = false;
            tooltip.style.display = 'none';
        }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

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
                    material : outlineMaterial,
                    clampToGround : true,
                }
            };
            this.path = positons;
            this._init();
        }

        _.prototype._init = function() {
            const that = this;
            const positionUpdate = function() {
                // if(polygonPath.length>0) {
                return that.path;
                // }
            };
            this.options.polyline.positions = new Cesium.CallbackProperty(positionUpdate, false);
            viewer.entities.add(this.options);
        };

        return _;
    })();

    var CreatePolygon = (function () {
        function _(positions) {
            if (!Cesium.defined(positions)) {
                throw new Cesium.DeveloperError('positions is required!');
            }
            if (positions.length < 3) {
                throw new Cesium.DeveloperError('positions 的长度必须大于等于3');
            }

            this.options = {
                polyline: {
                    show: true,
                    positions: positions,
                    clampToGround: true,
                    width: 2,
                    material: outlineMaterial
                },
                polygon: {
                    show: true,
                    // asynchronous: false,
                    hierarchy: positions,
                    // height: 0,
                    // outline: true,
                    // outlineColor: Cesium.Color.WHITE,
                    // outlineWidth: 2,
                    material: Cesium.Color.YELLOW.withAlpha(0.5)
                }
            };
            this.path = positions;
            this.hierarchy = positions;
            this._init();
        }

        _.prototype._init = function () {
            var _self = this;
            var _updatePolygon = function () {
                return _self.hierarchy;
            };
            var _updatePolyline = function () {
                if (_self.hierarchy.length > 1) {
                    var arr = [].concat(_self.hierarchy);
                    var first = _self.hierarchy[0];
                    arr.push(first);
                    return arr;
                } else {
                    return null;
                }
                // return _self.hierarchy;
            };
            //实时更新polygon.hierarchy
            this.options.polyline.positions = new Cesium.CallbackProperty(_updatePolyline, false);
            this.options.polygon.hierarchy = new Cesium.CallbackProperty(_updatePolygon, false);
            var oo = viewer.entities.add(this.options);
            // AllEnities.push(oo);
        };

        return _;
    })();

}

export default draw2Dpolygon;
