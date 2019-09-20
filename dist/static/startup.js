if (typeof require === 'function') {
    define('Cesium', ['CesiumDir/Cesium', 'rcss!CesiumDir/Widgets/widgets.css', 'static/thirdParty/turf/turf'], function (Cesium) {
        window.Cesium = Cesium || window.Cesium;
        Cesium = window.Cesium;
        return Cesium;
    });

    // define(['static/thirdParty/turf/turf'], function (turf) {
    //     window.turf = turf || window.turf;
    //     turf = window.turf;
    //     return turf;
    // });

    require.config({
        baseUrl: '.',
        paths: {
            domReady: './static/thirdParty/requirejs-2.1.20/domReady',
            rcss: './static/thirdParty/require-css/css.min',
            CesiumDir: './static/Cesium',
        },
        waitSeconds : 5000,
    });

    setTimeout(function () {
        require(['./static/app'], function () {
            // do nothing
        });
    }, 1000);
} else {
    alert('万劫不复之地!!!');
}


