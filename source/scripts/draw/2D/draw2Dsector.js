/**
 * 绘制扇形
 * @param viewer
 */
var draw2Dsector = function (viewer) {
    var tooltip = document.getElementById("ToolTip");
    var isDraw = false;
    var doubleClick = false;
    var polygonPath = [];
    var AllEnities = [];
    var pointPso = [];
    var polygon = null;
    var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
        dashLength: 16,
        color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7)
    });
    // viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    // viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    var handlerPolygon =  viewer.screenSpaceEventHandler;
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

                if (polygonPath.length < 2) {
                    if(polygonPath.length>0){
                        tooltip.innerHTML = '<p>单击增加点，右击删除点</p>';
                        handlerPolygon.setInputAction(handlerClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
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
            doubleClick = false;
            tooltip.style.display = 'none';
            polygonPath = [];
            AllEnities = [];
            pointPso = [];
            polygon = null;
        }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    var CreatePolygon = (function () {
        function _(positions) {
            if (!Cesium.defined(positions)) {
                throw new Cesium.DeveloperError('positions is required!');
            }
            if (positions.length < 3) {
                throw new Cesium.DeveloperError('positions 的长度必须大于等于3');
            }

            // let r = Cesium.Cartesian3.distance(positions[0], positions[1]);
            // let a = Cesium.Cartesian3.distance(positions[1], positions[2]);
            // let b = Cesium.Cartesian3.distance(positions[0], positions[1]);
            // let c = Cesium.Cartesian3.distance(positions[2], positions[0]);
            // let angle = computeAngle(a, b, c);
            // let positionArr = computeCirclularFlight(pointPso[0].lon, pointPso[0].lat, r, 0, angle);

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
                    asynchronous: false,
                    hierarchy: undefined,
                    //height: center.z,
                    //extrudedHeight: center.z+100,
                    outline: true,
                    outlineColor: Cesium.Color.WHITE.withAlpha(1),
                    outlineWidth: 1,
                    material: Cesium.Color.RED.withAlpha(0.5)
                }
            };
            this.path = positions;
            this.hierarchy = positions;
            this._init();
        }

        _.prototype._init = function () {
            var _self = this;
            var _updatePolygon = function () {
                if(polygonPath.length>0){
                    let r = Cesium.Cartesian3.distance(_self.hierarchy[0], _self.hierarchy[1]);
                    let a = Cesium.Cartesian3.distance(_self.hierarchy[1], _self.hierarchy[2]);
                    let b = Cesium.Cartesian3.distance(_self.hierarchy[0], _self.hierarchy[1]);
                    let c = Cesium.Cartesian3.distance(_self.hierarchy[2], _self.hierarchy[0]);
                    let angle = computeAngle(a, b, c);
                    // let angle = Cesium.Math.toDegrees(Cesium.Cartesian3.angleBetween(_self.hierarchy[2], _self.hierarchy[1]))
                    let positionArr = computeCirclularFlight(pointPso[0].lon, pointPso[0].lat, r, 0, angle);
                    return new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(
                        positionArr
                    ));
                }
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


    // let positionArr = computeCirclularFlight(110, 28, 5000,40,120);

    // viewer.entities.add({
    //     polygon: {
    //         hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(
    //             positionArr
    //         )),
    //         //height: center.z,
    //         //extrudedHeight: center.z+100,
    //         outline: true,
    //         outlineColor: Cesium.Color.WHITE.withAlpha(1),
    //         outlineWidth: 1,
    //         material: Cesium.Color.RED.withAlpha(0.5)
    //     }
    // });

    // viewer.zoomTo(viewer.entities);

    // 已知三角形三边a,b,c求内角
    function computeAngle(a, b, c) {
        let angle; // 角度
        let r = Math.pow(b, 2) + Math.pow(c, 2) - Math.pow(a, 2)/(2 * b * c)
        r = r.toFixed(0).toString();
        r = parseInt(r)/(1*Math.pow(10, r.length))
        // console.log(r);
        // if(r<-1)
        //     r=-1
        // else if(r>1)
        //     r=1
        angle = Math.acos(r * Math.PI / 180)
        // console.log(angle);
        // console.log(angle/Math.PI*180);
        // console.log(Math.acos(Math.cos(90)))
        return angle/Math.PI*180;
    }

    // computeAngle(3, 4, 5);

    //经度、纬度、半径、开始角度、夹角度
    function computeCirclularFlight(lon, lat, radius, fx, angle) {
        let Ea = 6378137;      //   赤道半径
        let Eb = 6356725;      // 极半径
        let positionArr = [];
        positionArr.push(lon);
        positionArr.push(lat);
        //需求正北是0° cesium正东是0°
        for (let i = fx; i <= fx + angle; i++) {
            let dx = radius * Math.sin(i * Math.PI / 180.0);
            let dy = radius * Math.cos(i * Math.PI / 180.0);

            let ec = Eb + (Ea - Eb) * (90.0 - lat) / 90.0;
            let ed = ec * Math.cos(lat * Math.PI / 180);

            let BJD = lon + (dx / ed) * 180.0 / Math.PI;
            let BWD = lat + (dy / ec) * 180.0 / Math.PI;

            positionArr.push(BJD);
            positionArr.push(BWD);
        }
        // console.log(positionArr);

        return positionArr;
    }
}

export default draw2Dsector;
