import global_ from "../global";

/**
 * 气象专题分析
 * @param viewer
 * @param ele
 * @param region
 */
var meteorologicalTopics = function (viewer, ele, region) {
    const tempArr = ['images/temp/1981/1981_01.png', 'images/temp/1981/1981_02.png', 'images/temp/1981/1981_03.png', 'images/temp/1981/1981_04.png', 'images/temp/1981/1981_05.png', 'images/temp/1981/1981_06.png',
        'images/temp/1981/1981_07.png', 'images/temp/1981/1981_08.png', 'images/temp/1981/1981_09.png', 'images/temp/1981/1981_10.png', 'images/temp/1981/1981_11.png', 'images/temp/1981/1981_12.png'];
    const cloudArr = ['images/cloud/IMK201904120600.png', 'images/cloud/IMK201904120630.png', 'images/cloud/IMK201904120700.png', 'images/cloud/IMK201904120730.png', 'images/cloud/IMK201904120800.png',
        'images/cloud/IMK201904120830.png', 'images/cloud/IMK201904120900.png', 'images/cloud/IMK201904120930.png', 'images/cloud/IMK201904121000.png', 'images/cloud/IMK201904121030.png', 'images/cloud/IMK201904121100.png',
        'images/cloud/IMK201904121130.png', 'images/cloud/IMK201904121200.png']
    const chinaRectangle = Cesium.Rectangle.fromDegrees(73.33, 17.51, 135.05, 53.93)
    const cloudRectangle = Cesium.Rectangle.fromDegrees(74.02, -59.63, -154.1, 59.63)
    const imageryLayers = viewer.imageryLayers;
    let n = 0;
    let imageryProvider;
    let singleImagery;
    for(let i=0; i<imageryLayers.length; i++){
        imageryLayers.remove(imageryLayers.get(1));
    }
    if(ele==='temp'){
        function addTemp(region) {
            singleImagery = new Cesium.SingleTileImageryProvider({
                url: global_.prod+tempArr[n],
            })
            if(region==='china'){
                imageryProvider = new Cesium.ImageryLayer(singleImagery, {
                    rectangle: chinaRectangle
                })
            }else if(region==='globe'){
                imageryProvider = new Cesium.ImageryLayer(singleImagery)
            }
            imageryLayers.add(imageryProvider);
            if(imageryLayers.length>3){
                imageryLayers.remove(imageryLayers.get(1));
            }
            n++;
        }
        addTemp(region);
        global_.idxTimer = window.setInterval(function () {
            if(n===12){
                n=0;
            }
            addTemp(region);
        }, 1000)
    }else if(ele==='cloud'){
        function addCloud(region) {
            singleImagery = new Cesium.SingleTileImageryProvider({
                url: global_.prod+cloudArr[n],
            })
            if(region==='china'){
                imageryProvider = new Cesium.ImageryLayer(singleImagery, {
                    rectangle: cloudRectangle
                })
            }else if(region==='globe'){
                alert("开发中。。。");
                // imageryProvider = new Cesium.ImageryLayer(singleImagery)
            }
            imageryLayers.add(imageryProvider);
            if(imageryLayers.length>3){
                imageryLayers.remove(imageryLayers.get(1));
            }
            n++;
        }
        addCloud(region);
        global_.idxTimer = window.setInterval(function () {
            if(n===13){
                n=0;
            }
            addCloud(region);
        }, 800)
    }
}

export default meteorologicalTopics;
