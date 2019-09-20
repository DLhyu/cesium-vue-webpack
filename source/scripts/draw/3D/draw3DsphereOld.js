/**
 * 绘制球体
 * @param viewer
 */
var draw3Dsphere = function (viewer) {
    var positions = new Float64Array([
        0.0, 0.0, 0.0,
        7500000.0, 0.0, 0.0,
        0.0, 7500000.0, 0.0
    ]);

    var geometry = new Cesium.Geometry({
        attributes : {
            position : new Cesium.GeometryAttribute({
                componentDatatype : Cesium.ComponentDatatype.DOUBLE,
                componentsPerAttribute : 3,
                values : positions
            })
        },
        indices : new Uint16Array([0, 1, 1, 2, 2, 0]),
        primitiveType : Cesium.PrimitiveType.LINES,
        boundingSphere : Cesium.BoundingSphere.fromVertices(positions),
        asynchronous : false
    });
    //
    // var geometry1 = new Cesium.EllipseGeometry({
    //     center : Cesium.Cartesian3.fromDegrees(110.0, 30.0, 15000.0),
    //     semiMajorAxis : 500000.0,
    //     semiMinorAxis : 300000.0,
    //     rotation : Cesium.Math.toRadians(60.0)
    //     // rotation : Cesium.Math.PI_OVER_FOUR,
    //     // vertexFormat : Cesium.VertexFormat.POSITION_AND_ST
    // })
    //
    // var sphere = new Cesium.SphereGeometry({
    //     radius : 100.0,
    //     vertexFormat : Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
    // });
    // var geometry2 = Cesium.SphereGeometry.createGeometry(sphere);
    //
    // var instance = new Cesium.GeometryInstance({
    //     geometry : geometry2,
    //     // modelMatrix : Cesium.Matrix4.multiplyByTranslation(Cesium.Transforms.eastNorthUpToFixedFrame(
    //     //     Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883)), new Cesium.Cartesian3(0.0, 0.0, 1000000.0), new Cesium.Matrix4()),
    //     // attributes : {
    //     //     color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.AQUA)
    //     // },
    //     id : 'sphere'
    // });
    //
    // viewer.scene.primitives.add(new Cesium.Primitive({
    //     geometryInstances : instance,
    //     // appearance : new Cesium.EllipsoidSurfaceAppearance({
    //     //     material : Cesium.Material.fromType('Checkerboard')
    //     // })
    // }));
    //
    // viewer.camera.flyTo({
    //     destination: Cesium.Cartesian3.fromDegrees(110.0, 30.0, 15000.0)
    // });

    // viewer.zoomTo(positions);

    var ellipsoidGeometry = new Cesium.EllipsoidGeometry({
        vertexFormat : Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        radii : new Cesium.Cartesian3(300000.0, 200000.0, 150000.0)
    });

    var ellipsoidGeometry1 = new Cesium.EllipsoidGeometry({
        vertexFormat : Cesium.VertexFormat.POSITION_ONLY,
        radii : new Cesium.Cartesian3(1000000.0, 500000.0, 500000.0)
    });

    // viewer.scene.primitives.add(new Cesium.Primitive({
    //     geometryInstances : new Cesium.GeometryInstance({
    //         geometry : geometry,
    //     }),
    //     appearance : new Cesium.PerInstanceColorAppearance({
    //         translucent : false,
    //         closed : true
    //     })
    // }));

    var cyanEllipsoidInstance = new Cesium.GeometryInstance({
        geometry : ellipsoidGeometry,
        modelMatrix : Cesium.Matrix4.multiplyByTranslation(
            Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(110.0, 30.0)),
            new Cesium.Cartesian3(0.0, 0.0, 150000.0),
            new Cesium.Matrix4()
        ),
        attributes : {
            color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.CYAN)
        }
    });

    var orangeEllipsoidInstance = new Cesium.GeometryInstance({
        geometry : ellipsoidGeometry,
        modelMatrix : Cesium.Matrix4.multiplyByTranslation(
            Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(110.0, 30.0)),
            new Cesium.Cartesian3(0.0, 0.0, 450000.0),
            new Cesium.Matrix4()
        ),
        attributes : {
            color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.ORANGE)
        }
    });

    viewer.scene.primitives.add(new Cesium.Primitive({
        geometryInstances : [cyanEllipsoidInstance, orangeEllipsoidInstance],
        appearance : new Cesium.PerInstanceColorAppearance({
            translucent : false,
            closed : true
        })
    }));

    var instances = [];
    var outlineInstances = [];
    var sphereGeometry = new Cesium.SphereGeometry({
        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        radius: 100.0
    });
    var sphereOutlineGeometry = new Cesium.SphereOutlineGeometry({
        radius: 100.0,
        stackPartitions: 6,
        slicePartitions: 5
    });
    var sphereModelMatrix = Cesium.Matrix4.multiplyByUniformScale(Cesium.Matrix4.multiplyByTranslation(Cesium.Transforms.eastNorthUpToFixedFrame(
        Cesium.Cartesian3.fromDegrees(110.0, 45.0)), new Cesium.Cartesian3(0.0, 0.0, 10.0), new Cesium.Matrix4()), 900.0, new Cesium.Matrix4());

    instances.push(new Cesium.GeometryInstance({
        geometry: sphereGeometry,
        modelMatrix: sphereModelMatrix,
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromRandom({
                alpha: 1.0
            }))
        }
    }));
    outlineInstances.push(new Cesium.GeometryInstance({
        geometry: sphereOutlineGeometry,
        modelMatrix: sphereModelMatrix,
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.WHITE)
        }
    }));
    viewer.scene.primitives.add(new Cesium.Primitive({
        geometryInstances : instances,
        appearance : new Cesium.PerInstanceColorAppearance({
            translucent : false,
            closed : true
        })
    }));
    viewer.scene.primitives.add(new Cesium.Primitive({
        geometryInstances : outlineInstances,
        appearance : new Cesium.PerInstanceColorAppearance({
            flat: true,
            translucent: false,
            renderState: {
                lineWidth: Math.min(4.0, viewer.scene.maximumAliasedLineWidth)
            }
        })
    }));
}

export default draw3Dsphere;
