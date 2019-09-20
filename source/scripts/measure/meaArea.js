// 测量面积
var meaArea=function (viewer) {
    var tooltip = document.getElementById("ToolTip");
    var isDraw = false;
    var doubleClick = false;
    var polygonPath = [];
    var postions = [];
    var AllEnities = [];
    var pointPso = [];
    var polygon = null;
    var handler = viewer.screenSpaceEventHandler;
    handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    handler.setInputAction(function (movement) {
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
                        handler.setInputAction(handlerClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
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
                    handler.setInputAction(handlerClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
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
                        pixelSize: 3,
                        outlineColor: Cesium.Color.YELLOW,
                        outlineWidth: 1
                    },
                });
                AllEnities.push(p);
                handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            }
        }
    }
    handler.setInputAction(handlerClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction(function() {
        if(polygonPath.length!==2){
            polygonPath.pop();
            pointPso.pop();
            viewer.entities.remove(AllEnities[AllEnities.length-1]);
            AllEnities.pop();
            // if(polygonPath.length===1){
            //     polygonPath.pop();
            // }
        }else{
            handler.setInputAction(handlerClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    handler.setInputAction(function () {
        if(polygonPath.length >= 3 && doubleClick){
            handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            // pointPso.pop();
            for(var i=1;i<pointPso.length;i++){
                if(pointPso[i].lon === pointPso[i-1].lon){
                    pointPso.splice(i, 1);
                }
            }
            if (polygonPath.length >= 2) {
                // var label = String(countAreaInCartesian3(polygon.path));
                var label = String(SphericalPolygonAreaMeters(pointPso));
                label = label.substr(0, label.indexOf(".", 0));
                var text;
                if (label.length < 6)
                    text = label + "平方米";
                else {
                    label = String(label / 1000000);
                    label = label.substr(0, label.indexOf(".", 0) + 3);
                    text = label + "平方公里"
                }
                // text = getArea(pointPso) + "平方公里";
                var textArea = text;
                var lastpoint = viewer.entities.add({
                    name: '多边形面积',
                    position: polygon.path[polygon.path.length - 1],
                    // point: {
                    //     pixelSize: 5,
                    //     color: Cesium.Color.RED,
                    //     outlineColor: Cesium.Color.WHITE,
                    //     outlineWidth: 2,
                    //     heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                    // },
                    label: {
                        text: textArea,
                        showBackground: false,
                        font: '14px sans-serif',
                        fillColor: Cesium.Color.GOLD,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        outlineWidth: 2,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                        // pixelOffset: new Cesium.Cartesian2(20, -40)
                        // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                    }
                });

                // AllEnities.push(lastpoint);

            }

            viewer.trackedEntity = undefined;
            isDraw = false;
            tooltip.style.display = 'none';
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

            this.options = {
                polygon: {
                    show: true,
                    hierarchy: undefined,
                    // height: 0,
                    // outline: true,
                    // outlineColor: Cesium.Color.WHITE,
                    // outlineWidth: 2,
                    material: Cesium.Color.YELLOW.withAlpha(0.5),
                    extrudedHeightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
                }
            };
            this.path = positions;
            this.hierarchy = positions;
            this._init();
        }

        _.prototype._init = function () {
            var _self = this;
            var _update = function () {
                return _self.hierarchy;
            };
            //实时更新polygon.hierarchy
            this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update, false);
            var oo = viewer.entities.add(this.options);
            // AllEnities.push(oo);
        };

        return _;
    })();

    //微元法求面积
    var countAreaInCartesian3 = function (ps) {
        var s = 0;
        for (var i = 0; i < ps.length; i++) {
            var p1 = ps[i];
            var p2;
            if (i < ps.length - 1)
                p2 = ps[i + 1];
            else
                p2 = ps[0];
            s += p1.x * p2.y - p2.x * p1.y;
        }
        return Math.abs(s / 2);
    }

    //计算多边形面积
    var earthRadiusMeters = 6371000.0;
    var radiansPerDegree = Math.PI / 180.0;//角度转化为弧度(rad)
    var degreesPerRadian = 180.0 / Math.PI;//弧度转化为角度
    function SphericalPolygonAreaMeters(points) {
        var totalAngle = 0;
        for (var i = 0; i < points.length; i++) {
            var j = (i + 1) % points.length;
            var k = (i + 2) % points.length;
            totalAngle += Angle(points[i], points[j], points[k]);
        }
        var planarTotalAngle = (points.length - 2) * 180.0;
        var sphericalExcess = totalAngle - planarTotalAngle;
        if (sphericalExcess > 420.0) {
            totalAngle = points.length * 360.0 - totalAngle;
            sphericalExcess = totalAngle - planarTotalAngle;
        } else if (sphericalExcess > 300.0 && sphericalExcess < 420.0) {
            sphericalExcess = Math.abs(360.0 - sphericalExcess);
        }
        return sphericalExcess * radiansPerDegree * earthRadiusMeters * earthRadiusMeters;
    }

    /*角度*/
    function Angle(p1, p2, p3) {
        var bearing21 = Bearing(p2, p1);
        var bearing23 = Bearing(p2, p3);
        var angle = bearing21 - bearing23;
        if (angle < 0) {
            angle += 360;
        }
        return angle;
    }
    /*方向*/
    function Bearing(from, to) {
        var lat1 = from.lat * radiansPerDegree;
        var lon1 = from.lon * radiansPerDegree;
        var lat2 = to.lat * radiansPerDegree;
        var lon2 = to.lon * radiansPerDegree;
        var angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2));
        if (angle < 0) {
            angle += Math.PI * 2.0;
        }
        angle = angle * degreesPerRadian;
        return angle;
    }
}

export default meaArea;
