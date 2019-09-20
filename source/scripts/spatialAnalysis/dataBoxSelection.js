/**
 * 数据框选
 * @type {{boxEntity: Array, init(*)}}
 */
import global_ from '../global'
const dataBoxSelection = {
    boxEntity : [],
    randomEntity : [],
    selectEntity : [],
    init(viewer){
        if(dataBoxSelection.randomEntity.length>0){
            for(let i=0; i<dataBoxSelection.randomEntity.length; i++){
                viewer.entities.remove(dataBoxSelection.randomEntity[i])
            }
            dataBoxSelection.randomEntity.length = 0;
        }
        for(let i=0; i<50; i++){
            const position = dataBoxSelection.randomLonLat(112, 118, 25, 29);
            const point = viewer.entities.add({
                name: 'billboard',
                position: position,
                billboard: {
                    image: global_.prod+'images/marker/mark3.png',
                    scale: .8,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
                }
            })
            dataBoxSelection.randomEntity.push(point)
        }
        viewer.camera.flyTo({
            destination: Cesium.Rectangle.fromDegrees(112, 25, 118, 29)
        })
    },
    randomLonLat(MinLon, MaxLon, MinLat, MaxLat){
        const lon = Math.random() * (MaxLon - MinLon) + MinLon;
        const lat = Math.random() * (MaxLat - MinLat) + MinLat;
        return Cesium.Cartesian3.fromDegrees(lon, lat);
    },
    clear(viewer){
        if(dataBoxSelection.boxEntity.length>0){
            for(let i=0; i<dataBoxSelection.boxEntity.length; i++){
                viewer.entities.remove(dataBoxSelection.boxEntity[i])
            }
            dataBoxSelection.boxEntity.length = 0;
        }
        if(dataBoxSelection.selectEntity.length>0){
            for(let i=0; i<dataBoxSelection.selectEntity.length; i++){
                dataBoxSelection.selectEntity[i].billboard.image = global_.prod+'images/marker/mark3.png';
            }
            dataBoxSelection.selectEntity.length = 0;
        }
    },
    drawRectangle(viewer){
        dataBoxSelection.clear(viewer);
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
                    }
                };
                this.path = positons;

                this._init();
            }

            _.prototype._init = function() {
                const rectangle = viewer.entities.add(this.options);
                dataBoxSelection.boxEntity.push(rectangle);
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
            if(dataBoxSelection.boxEntity.length>0){
                if(dataBoxSelection.randomEntity.length>0){
                    for(let i=0; i<dataBoxSelection.randomEntity.length; i++){
                        const cartesian = dataBoxSelection.randomEntity[i].position;
                        // console.log(cartesian._value)
                        const cartographic = Cesium.Cartographic.fromCartesian(cartesian._value);
                        const rectangle = dataBoxSelection.boxEntity[0].rectangle.coordinates.getValue();
                        // console.log(rectangle)
                        if(Cesium.Rectangle.contains(rectangle,cartographic)){
                            dataBoxSelection.randomEntity[i].billboard.image = global_.prod+'images/marker/mark2.png';
                            dataBoxSelection.selectEntity.push(dataBoxSelection.randomEntity[i]);
                        }
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    },
    drawCircle(viewer){
        dataBoxSelection.clear(viewer);
        const tooltip = document.getElementById("ToolTip");
        const handler = viewer.screenSpaceEventHandler; // 创建鼠标操作对象
        handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        var polylinePath = [];
        var circle = undefined;

        var CreateCircle = (function() {
            function _(positons) {
                if (!Cesium.defined(positons)) {
                    throw new Cesium.DeveloperError('positions is required!');
                }
                if (positons.length < 2) {
                    throw new Cesium.DeveloperError('positions 的长度必须大于等于2');
                }

                function getPositions(){
                    return Cesium.Cartesian3.distance(polylinePath[0], polylinePath[polylinePath.length-1]);
                }

                this.options = {
                    position: polylinePath[0],
                    ellipse : {
                        semiMinorAxis : new Cesium.CallbackProperty(getPositions, false),
                        semiMajorAxis : new Cesium.CallbackProperty(getPositions, false),
                        material : Cesium.Color.RED.withAlpha(0.5),
                        outline : true
                    },
                };
                this.path = positons;

                this._init();
            }

            _.prototype._init = function() {
                const circle = viewer.entities.add(this.options);
                dataBoxSelection.boxEntity.push(circle);
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
            tooltip.style.display = 'none';
            const circlePos = dataBoxSelection.boxEntity[0].position._value;
            // const radius = Cesium.Cartesian3.distance(polylinePath[0], polylinePath[polylinePath.length-1]);
            if(dataBoxSelection.boxEntity.length>0) {
                if (dataBoxSelection.randomEntity.length > 0) {
                    for(let i=0; i<dataBoxSelection.randomEntity.length; i++) {
                        const cartesian = dataBoxSelection.randomEntity[i].position._value;
                        const radius = dataBoxSelection.boxEntity[0].ellipse.semiMajorAxis.getValue();
                        if(Cesium.Cartesian3.distance(circlePos, cartesian)<radius){
                            dataBoxSelection.randomEntity[i].billboard.image = global_.prod+'images/marker/mark2.png';
                            dataBoxSelection.selectEntity.push(dataBoxSelection.randomEntity[i]);
                        }
                    }
                }
            }
            // polylinePath = [];
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    },
    drawPolygon(viewer){
        dataBoxSelection.clear(viewer);
        const tooltip = document.getElementById("ToolTip");
        const handler = viewer.screenSpaceEventHandler; // 创建鼠标操作对象
        handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        let isDrawPolylineVolume = true;
        let polylineVolume = undefined;
        let doubleClick = false;
        let polylineVolumePath = [];
        let polyline = undefined;
        let polylineEtity = undefined;

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
                        material : Cesium.Color.YELLOW,
                        clampToGround : true,
                    }
                };
                this.path = positons;
                this._init();
            }

            _.prototype._init = function() {
                const that = this;
                const positionUpdate = function () {
                    // if(polylineVolumePath.length>0) {
                    return that.path;
                    // }
                };
                this.options.polyline.positions = new Cesium.CallbackProperty(positionUpdate, false);
                polylineEtity = viewer.entities.add(this.options);
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
                    // if(polylineVolumePath.length>0) {
                        return _self.path;
                    // }
                };
                this.options.polygon.hierarchy = new Cesium.CallbackProperty(_updatePolygon, false);
                const polygon = viewer.entities.add(this.options);
                dataBoxSelection.boxEntity.push(polygon);
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

                        if(polylineEtity){
                            viewer.entities.remove(polylineEtity)
                        }
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
                if (cartesian) {
                    if (isDrawPolylineVolume) {
                        polylineVolumePath.push(cartesian);
                        const polygonPos = dataBoxSelection.boxEntity[0].polygon.hierarchy.getValue();
                        const polygon = [].concat(polygonPos);
                        polygon.push(polygonPos[0]);
                        const poly = turf.polygon(dataBoxSelection.getPolygonPos(polygon, viewer));
                        if(dataBoxSelection.boxEntity.length>0) {
                            if (dataBoxSelection.randomEntity.length > 0) {
                                for(let i=0; i<dataBoxSelection.randomEntity.length; i++) {
                                    const cartesian = dataBoxSelection.randomEntity[i].position._value;
                                    const pt = turf.point(dataBoxSelection.getPointsPos(cartesian, viewer));
                                    if(turf.booleanPointInPolygon(pt, poly)){
                                        dataBoxSelection.randomEntity[i].billboard.image = global_.prod+'images/marker/mark2.png';
                                        dataBoxSelection.selectEntity.push(dataBoxSelection.randomEntity[i]);
                                    }
                                }
                            }
                        }
                    }
                }
                isDrawPolylineVolume = false;
                // polylineVolumePath = [];
                polylineVolume = undefined;
                doubleClick = false;
                tooltip.style.display = 'none';
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    },
    cartesian2LonLat(cartesian, viewer){
        //将笛卡尔坐标转换为地理坐标
        var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
        //将弧度转为度的十进制度表示
        var pos = {
            lon: Cesium.Math.toDegrees(cartographic.longitude),
            lat: Cesium.Math.toDegrees(cartographic.latitude),
            alt: Math.ceil(cartographic.height)
        };
        return pos;
    },
    getPointsPos(positions, viewer){
        const arr = [];
        const p = dataBoxSelection.cartesian2LonLat(positions, viewer);
        arr.push(p.lon);
        arr.push(p.lat);
        return arr;
    },
    getPolygonPos(positions, viewer){
        var arr = [];
        var polygonStr = [];
        var first = positions[0];
        var num = positions.length;
        for (var i = 0; i < num; i++) {
            var p = dataBoxSelection.cartesian2LonLat(positions[i], viewer);
            if (i === num - 1 && first === p) {
                break;
            }
            arr.push([p.lon, p.lat]);
        }
        polygonStr.push(arr);
        return polygonStr;
    }
}

export default dataBoxSelection;
