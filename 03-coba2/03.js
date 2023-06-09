"use strict";

var canvas;
var gl;

var primitiveType;
var offset = 0;
var count = 108;


var translation = [300, 150, 0]; //top-left-depth of F
var rotation = [0, 0, 0];
var scale = [1.0, 1.0, 1.0]; //default scale

var angleInRadians = 0;

var matrix;
var matrixLocation;
var translationMatrix;
var rotationMatrix;
var scaleMatrix;
var projectionMatrix;

// 1 = O, 2 = h1, 3 = h2
var shapeTranslation = {
    1: [300, 150, 0],
    2: [100, 50, 0],
    3: [300, 150, 0],
}

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.83, 0.99, 0.91, 1.0);

    gl.enable(gl.CULL_FACE); //enable depth buffer
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var positionLocation = gl.getAttribLocation(program, "a_position");
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    setGeometry(gl, 2);

    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    // Associate out shader variables with our data buffer

    var colorLocation = gl.getAttribLocation(program, "a_color");
    gl.vertexAttribPointer(colorLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);
    gl.enableVertexAttribArray(colorLocation);

    setColors(gl, 2);

    // var positionBuffer2 = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer2);

    // var positionLocation2 = gl.getAttribLocation(program, "a_position");
    // gl.vertexAttribPointer(positionLocation2, 3, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(positionLocation2);

    // setGeometry(gl, 2);


    // var colorBuffer2 = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer2);

    // // Associate out shader variables with our data buffer

    // var colorLocation2 = gl.getAttribLocation(program, "a_color");
    // gl.vertexAttribPointer(colorLocation2, 3, gl.UNSIGNED_BYTE, true, 0, 0);
    // gl.enableVertexAttribArray(colorLocation2);

    // setColors(gl, 2);

    matrixLocation = gl.getUniformLocation(program, "u_matrix");

    //Update  X according to X slider
    var Xvalue = document.getElementById("Xvalue");
    Xvalue.innerHTML = translation[0];
    document.getElementById("sliderX").onchange = function (event) {
        translation[0] = event.target.value;
        Xvalue.innerHTML = translation[0];
        requestAnimationFrame(render);
    };

    //Update Y according to Y slider
    var Yvalue = document.getElementById("Yvalue");
    Yvalue.innerHTML = translation[1];
    document.getElementById("sliderY").onchange = function (event) {
        translation[1] = event.target.value;
        Yvalue.innerHTML = translation[1];
        requestAnimationFrame(render);
    };

    var Zvalue = document.getElementById("Zvalue");
    Zvalue.innerHTML = translation[2];
    document.getElementById("sliderZ").onchange = function (event) {
        translation[2] = event.target.value;
        Zvalue.innerHTML = translation[2];
        requestAnimationFrame(render);
    };

    //Update rotation angle according to angle slider

    // rotation = [degToRad(40), degToRad(25), degToRad(325)];

    //rotation X
    var angleXValue = document.getElementById("AXvalue");
    angleXValue.innerHTML = radToDeg(rotation[0]);
    document.getElementById("sliderAX").onchange = function (event) {
        var angleInDegrees = 360 - event.target.value;
        angleInRadians = angleInDegrees * Math.PI / 180; //convert degree to radian
        rotation[0] = angleInRadians;
        angleXValue.innerHTML = 360 - angleInDegrees;
        requestAnimationFrame(render);
    };
    //rotation Y
    var angleYValue = document.getElementById("AYvalue");
    angleYValue.innerHTML = radToDeg(rotation[1]);
    document.getElementById("sliderAY").onchange = function (event) {
        var angleInDegrees = 360 - event.target.value;
        angleInRadians = angleInDegrees * Math.PI / 180; //convert degree to radian
        rotation[1] = angleInRadians;
        angleYValue.innerHTML = 360 - angleInDegrees;
        requestAnimationFrame(render);
    };
    //rotation Z
    var angleZValue = document.getElementById("AZvalue");
    angleZValue.innerHTML = radToDeg(rotation[2]);
    document.getElementById("sliderAZ").onchange = function (event) {
        var angleInDegrees = 360 - event.target.value;
        angleInRadians = angleInDegrees * Math.PI / 180; //convert degree to radian
        rotation[2] = angleInRadians;
        angleZValue.innerHTML = 360 - angleInDegrees;
        requestAnimationFrame(render);
    };


    //Update scaleX according to scaleX slider
    var scaleX = document.getElementById("scaleX");
    scaleX.innerHTML = scale[0];
    document.getElementById("sliderscaleX").onchange = function (event) {
        scale[0] = event.target.value;
        scaleX.innerHTML = scale[0];
        requestAnimationFrame(render);
    };


    //Update scaleY according to scaleY slider
    var scaleY = document.getElementById("scaleY");
    scaleY.innerHTML = scale[1];
    document.getElementById("sliderscaleY").onchange = function (event) {
        scale[1] = event.target.value;
        scaleY.innerHTML = scale[1];
        requestAnimationFrame(render);
    };

    //Update scaleZ according to scaleZ slider
    var scaleZ = document.getElementById("scaleZ");
    scaleZ.innerHTML = scale[2];
    document.getElementById("sliderscaleZ").onchange = function (event) {
        scale[2] = event.target.value;
        scaleZ.innerHTML = scale[2];
        requestAnimationFrame(render);
    };

    primitiveType = gl.TRIANGLES;
    requestAnimationFrame(render);
}

function render() {
    // Compute the matrices
    // rotation[1] += 0.05;
    // matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
    // matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
    // matrix = m4.xRotate(matrix, rotation[0]);
    // matrix = m4.yRotate(matrix, rotation[1]);
    // matrix = m4.zRotate(matrix, rotation[2]);
    // matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);
    // // rotation[1] += 1;
    // // Set the matrix.
    // gl.uniformMatrix4fv(matrixLocation, false, matrix);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE); //enable depth buffer
    gl.enable(gl.DEPTH_TEST);
    // gl.drawArrays(primitiveType, offset, count);
    // drawO();
    drawH(2);

    requestAnimationFrame(render); //refresh

}

function radToDeg(r) {
    return r * 180 / Math.PI;
}

function degToRad(d) {
    return d * Math.PI / 180;
}

function drawO() {
    count = 120;
    translation = shapeTranslation[1];

    // gl.useProgram(program);
    // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    setGeometry(gl, 1);

    // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    setColors(gl, 1);

    matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
    matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
    matrix = m4.xRotate(matrix, rotation[0]);
    matrix = m4.yRotate(matrix, rotation[1]);
    matrix = m4.zRotate(matrix, rotation[2]);
    matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

    gl.uniformMatrix4fv(matrixLocation, false, matrix);
    gl.drawArrays(primitiveType, offset, count);
}

function drawH(numH) {
    count = 108;
    translation = shapeTranslation[numH];

    // gl.useProgram(program);
    // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer2);
    setGeometry(gl, 2);

    // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer2);
    setColors(gl, 2);

    matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
    matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
    matrix = m4.xRotate(matrix, rotation[0]);
    matrix = m4.yRotate(matrix, rotation[1]);
    matrix = m4.zRotate(matrix, rotation[2]);
    matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

    gl.uniformMatrix4fv(matrixLocation, false, matrix);
    gl.drawArrays(primitiveType, offset, count);
}

var m4 = {

    projection: function (width, height, depth) {
        // Note: This matrix flips the Y axis so 0 is at the top.
        return [
            2 / width, 0, 0, 0,
            0, -2 / height, 0, 0,
            0, 0, 2 / depth, 0,
            -1, 1, 0, 1,
        ];
    },

    multiply: function (a, b) {
        var a00 = a[0 * 4 + 0];
        var a01 = a[0 * 4 + 1];
        var a02 = a[0 * 4 + 2];
        var a03 = a[0 * 4 + 3];
        var a10 = a[1 * 4 + 0];
        var a11 = a[1 * 4 + 1];
        var a12 = a[1 * 4 + 2];
        var a13 = a[1 * 4 + 3];
        var a20 = a[2 * 4 + 0];
        var a21 = a[2 * 4 + 1];
        var a22 = a[2 * 4 + 2];
        var a23 = a[2 * 4 + 3];
        var a30 = a[3 * 4 + 0];
        var a31 = a[3 * 4 + 1];
        var a32 = a[3 * 4 + 2];
        var a33 = a[3 * 4 + 3];
        var b00 = b[0 * 4 + 0];
        var b01 = b[0 * 4 + 1];
        var b02 = b[0 * 4 + 2];
        var b03 = b[0 * 4 + 3];
        var b10 = b[1 * 4 + 0];
        var b11 = b[1 * 4 + 1];
        var b12 = b[1 * 4 + 2];
        var b13 = b[1 * 4 + 3];
        var b20 = b[2 * 4 + 0];
        var b21 = b[2 * 4 + 1];
        var b22 = b[2 * 4 + 2];
        var b23 = b[2 * 4 + 3];
        var b30 = b[3 * 4 + 0];
        var b31 = b[3 * 4 + 1];
        var b32 = b[3 * 4 + 2];
        var b33 = b[3 * 4 + 3];
        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
    },

    translation: function (tx, ty, tz) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1,
        ];
    },

    xRotation: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1,
        ];
    },

    yRotation: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1,
        ];
    },

    zRotation: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    },

    scaling: function (sx, sy, sz) {
        return [
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1,
        ];
    },

    translate: function (m, tx, ty, tz) {
        return m4.multiply(m, m4.translation(tx, ty, tz));
    },

    xRotate: function (m, angleInRadians) {
        return m4.multiply(m, m4.xRotation(angleInRadians));
    },

    yRotate: function (m, angleInRadians) {
        return m4.multiply(m, m4.yRotation(angleInRadians));
    },

    zRotate: function (m, angleInRadians) {
        return m4.multiply(m, m4.zRotation(angleInRadians));
    },

    scale: function (m, sx, sy, sz) {
        return m4.multiply(m, m4.scaling(sx, sy, sz));
    },

};

// Fill the buffer with the values that define a letter 'F'.
function setGeometry(gl, shape) {
    switch (shape) {
        case 1:
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([
                    //front-left
                    50, 0, 0,
                    0, 40, 0,
                    0, 140, 0,
                    0, 140, 0,
                    50, 180, 0,
                    50, 0, 0,

                    //front-top
                    50, 0, 0,
                    50, 40, 0,
                    100, 0, 0,
                    50, 40, 0,
                    100, 40, 0,
                    100, 0, 0,

                    //front-right
                    100, 0, 0,
                    150, 140, 0,
                    150, 40, 0,
                    150, 140, 0,
                    100, 0, 0,
                    100, 180, 0,

                    //front-bottom
                    100, 180, 0,
                    100, 140, 0,
                    50, 140, 0,
                    50, 140, 0,
                    50, 180, 0,
                    100, 180, 0,

                    //back-left
                    0, 40, 30,
                    50, 0, 30,
                    0, 140, 30,
                    0, 140, 30,
                    50, 0, 30,
                    50, 180, 30,

                    //back-top
                    50, 0, 30,
                    100, 0, 30,
                    50, 40, 30,
                    50, 40, 30,
                    100, 0, 30,
                    100, 40, 30,

                    //back-right
                    100, 0, 30,
                    150, 40, 30,
                    100, 180, 30,
                    100, 180, 30,
                    150, 40, 30,
                    150, 140, 30,

                    //back-bottom
                    50, 140, 30,
                    100, 140, 30,
                    50, 180, 30,
                    50, 180, 30,
                    100, 140, 30,
                    100, 180, 30,

                    //top-left
                    0, 40, 0,
                    50, 0, 0,
                    50, 0, 30,
                    0, 40, 0,
                    50, 0, 30,
                    0, 40, 30,

                    //top-center
                    50, 0, 30,
                    50, 0, 0,
                    100, 0, 0,
                    100, 0, 0,
                    100, 0, 30,
                    50, 0, 30,

                    //top-right
                    100, 0, 30,
                    100, 0, 0,
                    150, 40, 0,
                    150, 40, 0,
                    150, 40, 30,
                    100, 0, 30,

                    //outer-right-side
                    150, 40, 30,
                    150, 40, 0,
                    150, 140, 0,
                    150, 140, 0,
                    150, 140, 30,
                    150, 40, 30,

                    //bottom-right
                    150, 140, 30,
                    150, 140, 0,
                    100, 180, 0,
                    100, 180, 0,
                    100, 180, 30,
                    150, 140, 30,

                    //bottom-center
                    100, 180, 30,
                    100, 180, 0,
                    50, 180, 0,
                    50, 180, 0,
                    50, 180, 30,
                    100, 180, 30,

                    //bottom-left
                    50, 180, 30,
                    50, 180, 0,
                    0, 140, 0,
                    0, 140, 0,
                    0, 140, 30,
                    50, 180, 30,

                    //outer-left-side
                    0, 140, 30,
                    0, 140, 0,
                    0, 40, 0,
                    0, 40, 0,
                    0, 40, 30,
                    0, 140, 30,

                    //inner-bottom
                    50, 140, 30,
                    50, 140, 0,
                    100, 140, 0,
                    100, 140, 0,
                    100, 140, 30,
                    50, 140, 30,

                    //inner-left
                    50, 40, 0,
                    50, 140, 30,
                    50, 40, 30,
                    50, 40, 0,
                    50, 140, 0,
                    50, 140, 30,

                    //inner-top
                    50, 40, 0,
                    50, 40, 30,
                    100, 40, 30,
                    50, 40, 0,
                    100, 40, 30,
                    100, 40, 0,

                    //inner-right
                    100, 40, 30,
                    100, 140, 0,
                    100, 40, 0,
                    100, 40, 30,
                    100, 140, 30,
                    100, 140, 0,

                ]),
                gl.STATIC_DRAW);
            break;
        case 2:
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([
                    //front-left
                    30, 0, 0,
                    0, 0, 0,
                    0, 110, 0,
                    0, 110, 0,
                    30, 110, 0,
                    30, 0, 0,

                    // front-middle
                    30, 40, 0,
                    30, 70, 0,
                    60, 70, 0,
                    60, 70, 0,
                    60, 40, 0,
                    30, 40, 0,

                    //front-right
                    90, 0, 0,
                    60, 0, 0,
                    60, 110, 0,
                    60, 110, 0,
                    90, 110, 0,
                    90, 0, 0,

                    //back-left
                    0, 0, 30,
                    30, 0, 30,
                    0, 110, 30,
                    0, 110, 30,
                    30, 0, 30,
                    30, 110, 30,

                    //back-middle
                    30, 40, 30,
                    60, 40, 30,
                    30, 70, 30,
                    30, 70, 30,
                    60, 40, 30,
                    60, 70, 30,

                    //back-right
                    60, 0, 30,
                    90, 0, 30,
                    60, 110, 30,
                    60, 110, 30,
                    90, 0, 30,
                    90, 110, 30,

                    //top-left
                    0, 0, 0,
                    30, 0, 0,
                    30, 0, 30,
                    0, 0, 0,
                    30, 0, 30,
                    0, 0, 30,

                    //top-middle
                    30, 40, 0,
                    60, 40, 0,
                    60, 40, 30,
                    30, 40, 0,
                    60, 40, 30,
                    30, 40, 30,

                    //top-right
                    60, 0, 0,
                    90, 0, 0,
                    90, 0, 30,
                    60, 0, 0,
                    90, 0, 30,
                    60, 0, 30,

                    //outer-right
                    90, 0, 30,
                    90, 0, 0,
                    90, 110, 0,
                    90, 110, 0,
                    90, 110, 30,
                    90, 0, 30,

                    //bottom-right
                    90, 110, 30,
                    90, 110, 0,
                    60, 110, 0,
                    60, 110, 0,
                    60, 110, 30,
                    90, 110, 30,

                    //bottom-middle
                    60, 70, 30,
                    60, 70, 0,
                    30, 70, 0,
                    30, 70, 0,
                    30, 70, 30,
                    60, 70, 30,

                    //bottom-left
                    30, 110, 30,
                    30, 110, 0,
                    0, 110, 0,
                    0, 110, 0,
                    0, 110, 30,
                    30, 110, 30,

                    //outer-left
                    0, 110, 30,
                    0, 110, 0,
                    0, 0, 0,
                    0, 0, 0,
                    0, 0, 30,
                    0, 110, 30,

                    //inner-top-left
                    30, 0, 0,
                    30, 40, 30,
                    30, 0, 30,
                    30, 0, 0,
                    30, 40, 0,
                    30, 40, 30,

                    //inner-bottom-left
                    30, 70, 0,
                    30, 110, 30,
                    30, 70, 30,
                    30, 70, 0,
                    30, 110, 0,
                    30, 110, 30,

                    //inner-top-right
                    60, 0, 30,
                    60, 40, 0,
                    60, 0, 0,
                    60, 0, 30,
                    60, 40, 30,
                    60, 40, 0,

                    //inner-bottom-right
                    60, 70, 30,
                    60, 110, 0,
                    60, 70, 0,
                    60, 70, 30,
                    60, 110, 30,
                    60, 110, 0,
                ]),
                gl.STATIC_DRAW);
            break;
    }
}

// Fill the buffer with colors for the 'F'.
function setColors(gl, shape) {
    switch (shape) {
        case 1:
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Uint8Array([
                    //front-left
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,

                    //front-top
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,

                    //front-right
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,

                    //front-bottom
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,

                    //back-left
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,

                    //back-top
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,

                    //back-right
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,

                    //back-bottom
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,
                    242, 230, 4,

                    //top-left
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,

                    //top-center
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,

                    //top-right
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,

                    //outer-right-side
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,

                    //bottom-right
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,

                    //bottom-center
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,

                    //bottom-left
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,

                    //outer-left-side
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,
                    174, 163, 2,

                    //inner-bottom
                    116, 107, 0,
                    116, 107, 0,
                    116, 107, 0,
                    116, 107, 0,
                    116, 107, 0,
                    116, 107, 0,

                    //inner-left
                    116, 107, 0,
                    116, 107, 0,
                    116, 107, 0,
                    116, 107, 0,
                    116, 107, 0,
                    116, 107, 0,

                    //inner-top
                    116, 107, 0,
                    116, 107, 0,
                    116, 107, 0,
                    116, 107, 0,
                    116, 107, 0,
                    116, 107, 0,

                    //inner-right
                    116, 107, 0,
                    116, 107, 0,
                    116, 107, 0,
                    116, 107, 0,
                    116, 107, 0,
                    116, 107, 0,]),
                gl.STATIC_DRAW);
            break;
        case 2:
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Uint8Array([
                    //front-left
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,

                    //front-middle
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,

                    //front-right
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,

                    //back-left
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,

                    //back-middle
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,

                    //back-right
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,
                    0, 151, 252,

                    //top-left
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,

                    //top-middle
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,

                    //top-right
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,

                    //outer-right
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,

                    //bottom-right
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,

                    //bottom-middle
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,

                    //bottom-left
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,

                    //outer-left
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,
                    0, 87, 181,

                    //inner-top-left
                    0, 44, 120,
                    0, 44, 120,
                    0, 44, 120,
                    0, 44, 120,
                    0, 44, 120,
                    0, 44, 120,

                    //inner-bottom-left
                    0, 44, 120,
                    0, 44, 120,
                    0, 44, 120,
                    0, 44, 120,
                    0, 44, 120,
                    0, 44, 120,

                    //inner-top-right
                    0, 44, 120,
                    0, 44, 120,
                    0, 44, 120,
                    0, 44, 120,
                    0, 44, 120,
                    0, 44, 120,

                    //inner-bottom-right
                    0, 44, 120,
                    0, 44, 120,
                    0, 44, 120,
                    0, 44, 120,
                    0, 44, 120,
                    0, 44, 120,]),
                gl.STATIC_DRAW);
            break;
    }

}