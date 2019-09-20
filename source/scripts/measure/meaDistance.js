// 测量距离
var meaDistance=function (viewer) {
    var tooltip = document.getElementById("ToolTip");
    var isDrawPolyline = true;
    var doubleClick = false;
    var pos;
    // 生成随机id
    let ids = Number(Math.random().toString().substr(3,3) + Date.now()).toString(36);
    // console.log(ids);
    var CreatePolyline = (function() {
        function _(positons) {
            var positions = positons;
            if (!Cesium.defined(positons)) {
                throw new Cesium.DeveloperError('positions is required!');
            }
            if (positons.length < 2) {
                throw new Cesium.DeveloperError('positions 的长度必须大于等于2');
            }
            function caculDistance() {
                var dis = 0;
                for (var i = 1; i < positions.length; i++) {
                    dis += Cesium.Cartesian3.distance(positions[i], positions[i - 1]);
                }
                if(dis>1000){
                    return '总长:' + (dis/1000).toFixed(2).toString() + '公里';
                }else{
                    return '总长:' + dis.toFixed(2).toString() + '米';
                }
            }
            function getCheckMea(){
                return document.getElementById('CheckMea').checked;
            }
            this.options = {
                polyline : {
                    show : true,
                    width : 2,
                    material : new Cesium.PolylineOutlineMaterialProperty({
                        color : Cesium.Color.YELLOW.withAlpha(0.6),
                        outlineWidth : 0,
                        outlineColor : Cesium.Color.YELLOW
                    }),
                    depthFailMaterial : new Cesium.PolylineOutlineMaterialProperty({
                        color : Cesium.Color.RED,
                        outlineWidth : 0,
                        outlineColor : Cesium.Color.RED
                    }),
                    // clampToGround : new Cesium.CallbackProperty(getCheckMea, false), // 折线固定在地上
                    clampToGround : true,
                    followSurface : false
                }
            };
            var poss = function() {
                return pos;
            };
            this.path = positons;
            this.optionsLabel = {
                id: ids,
                position: new Cesium.CallbackProperty(poss, false),
                point: {
                    color: Cesium.Color.RED,
                    pixelSize: 4,
                    outlineColor: Cesium.Color.YELLOW,
                    outlineWidth: 1
                },
                label: {
                    show: true,
                    showBackground: true,
                    font: '14px monospace',
                    horizontalOrigin: Cesium.HorizontalOrigin.RIGHT,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(-20, -20),
                    text: new Cesium.CallbackProperty(caculDistance, false)
                }
            }

            this._init();
        }

        _.prototype._init = function() {
            var that = this;
            var positionCBP = function() {
                var positions = [];
                for(var i=0; i<that.path.length; i++){
                    var cartographic=Cesium.Cartographic.fromCartesian(that.path[i]);
                    var longitude=Cesium.Math.toDegrees(cartographic.longitude);//经度值
                    var latitude=Cesium.Math.toDegrees(cartographic.latitude);//纬度值
                    var height=cartographic.height;//高度值
                    positions.push(longitude);
                    positions.push(latitude);
                    positions.push(height);
                }
                return Cesium.Cartesian3.fromDegreesArrayHeights(positions);
            };
            this.options.polyline.positions = new Cesium.CallbackProperty(positionCBP, false);
            viewer.entities.add(this.options);
            viewer.entities.add(this.optionsLabel);
        };

        return _;
    })();


    var polylinePath = [];
    var labelPoints = [];
    var polyline = undefined;

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
        pos = cartesian;
        if (cartesian) {
            if (isDrawPolyline) {
                tooltip.style.left = movement.endPosition.x + 5 + "px";
                tooltip.style.top = movement.endPosition.y + 10 + "px";
                tooltip.style.display = "block";

                if (polylinePath.length < 1) {
                    return;
                }
                if (!Cesium.defined(polyline)) {
                    polylinePath.push(cartesian);

                    polyline = new CreatePolyline(polylinePath);

                } else {
                    polyline.path.pop();
                    polyline.path.push(cartesian);
                }

                if (polylinePath.length >= 2) {
                    tooltip.innerHTML = '<p>单击增加点，右击删除点，双击确定终点</p>';
                    doubleClick = true;
                    handler.setInputAction(handlerClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                }else if(polylinePath.length === 1){
                    handler.setInputAction(handlerClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                }
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    let handlerClick = function(movement) {
        if(viewer.entities.getById(ids)){
            viewer.entities.getById(ids).show = true;
        }
        var ray = viewer.scene.camera.getPickRay(movement.position);

        var cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        pos = cartesian;
        if (cartesian) {
            if (isDrawPolyline) {
                polylinePath.push(cartesian);
                var positions = polylinePath;
                function caculDistance() {
                    var dis = 0;
                    if(positions.length===1){
                        return '起点';
                    }else{

                        for (var i = 1; i < positions.length; i++) {
                            dis += Cesium.Cartesian3.distance(positions[i], positions[i - 1]);
                        }
                        if(dis===0){
                            return '起点';
                        }else{
                            if(dis>1000){
                                return (dis/1000).toFixed(2).toString() + '公里';
                            }else{
                                return dis.toFixed(2).toString() + '米';
                            }
                        }
                    }
                }
                var labeltext = caculDistance();
                var optionsLabel = {
                    position: pos,
                    point: {
                        color: Cesium.Color.RED,
                        pixelSize: 4,
                        outlineColor: Cesium.Color.YELLOW,
                        outlineWidth: 1
                    },
                    label: {
                        show: true,
                        showBackground: true,
                        font: '14px monospace',
                        horizontalOrigin: Cesium.HorizontalOrigin.RIGHT,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(-20, -20),
                        text: labeltext
                    }
                }
                var lp = viewer.entities.add(optionsLabel);
                labelPoints.push(lp);
                handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            }
        }
    }
    handler.setInputAction(handlerClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction(function() {
        if(polylinePath.length!==1){
            polylinePath.pop();
            viewer.entities.remove(labelPoints[labelPoints.length-1]);
            labelPoints.pop();
            if(polylinePath.length===1){
                viewer.entities.getById(ids).show = false;
            }
        }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    handler.setInputAction(function(movement) {
        if(polylinePath.length >= 3 && doubleClick){
            handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            viewer.entities.remove(labelPoints[labelPoints.length-1]);
            var ray = viewer.scene.camera.getPickRay(movement.position);

            var cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            pos = cartesian;
            if (cartesian) {
                if (isDrawPolyline) {
                    // polylinePath.push(cartesian);
                    var positions = polylinePath;
                    function caculDistance() {
                        var dis = 0;
                        for (var i = 1; i < positions.length; i++) {
                            dis += Cesium.Cartesian3.distance(positions[i], positions[i - 1]);
                        }
                        if(dis>1000){
                            return '总长:' + (dis/1000).toFixed(2).toString() + '公里';
                        }else{
                            return '总长:' + dis.toFixed(2).toString() + '米';
                        }
                    }
                    var labeltext = caculDistance();
                    var optionsLabel = {
                        position: pos,
                        point: {
                            color: Cesium.Color.RED,
                            pixelSize: 4,
                            outlineColor: Cesium.Color.YELLOW,
                            outlineWidth: 1
                        },
                        label: {
                            show: true,
                            showBackground: true,
                            font: '14px monospace',
                            horizontalOrigin: Cesium.HorizontalOrigin.RIGHT,
                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                            pixelOffset: new Cesium.Cartesian2(-20, -20),
                            text: labeltext
                        }
                    }
                    viewer.entities.add(optionsLabel);
                }
            }

            isDrawPolyline = false;
            polylinePath = [];
            polyline = undefined;
            tooltip.style.display = 'none';
            viewer.entities.getById(ids).show = false;
        }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
}

export default meaDistance;
