"use strict";

var canvas;
var gl;

var primitiveType;
var offset = 0;
var count = 108;


var translation = [300, 150, 0]; //top-left-depth of F
var rotation = [0, 0, 0];
var rotationO = [0, 0, 0];
var centerO = [0, 0, 0];
var centerH = [0, 0, 0];
var scale = [1.0, 1.0, 1.0]; //default scale

var angleInRadians = 0;

var matrix;
var matrixLocation;
var positionLocation;
var colorLocation;
var translationMatrix;
var rotationMatrix;
var scaleMatrix;
var projectionMatrix;
var positionBuffers = {};
var colorBuffers = {};

var revolutionH1 = 1;
var revolutionH2 = 1;

var shapeTranslation = {
    1: [300, 190, 0],
    2: [170, 50, 100],
    3: [580, 50, -100],
}

var paramRevolStart = 59;
var paramRevolEnd = 459;


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
    positionBuffers = {
        1: gl.createBuffer(),
        2: gl.createBuffer()
    };

    colorBuffers = {
        1: gl.createBuffer(),
        2: gl.createBuffer()
    };

    setGeometry(gl, 1, positionBuffers[1]);
    setGeometry(gl, 2, positionBuffers[2]);

    setColors(gl, 1, colorBuffers[1]);
    setColors(gl, 2, colorBuffers[2]);

    positionLocation = gl.getAttribLocation(program, "a_position");
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    colorLocation = gl.getAttribLocation(program, "a_color");
    gl.vertexAttribPointer(colorLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);
    gl.enableVertexAttribArray(colorLocation);

    matrixLocation = gl.getUniformLocation(program, "u_matrix");

    rotation = [degToRad(15), degToRad(11), degToRad(12)];

    primitiveType = gl.TRIANGLES;
    requestAnimationFrame(render);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE); //enable depth buffer
    gl.enable(gl.DEPTH_TEST);

    // Update rotationO
    var angleInDegrees = 30;
    var angleInRadians = degToRad(angleInDegrees);
    rotationO[1] += angleInRadians / 10;// Rotate counter-clockwise around the Z-axis
    rotation[1] -= 0.05;

    if(Math.abs(shapeTranslation[3][1]) == paramRevolStart || Math.abs(shapeTranslation[3][1]) == paramRevolEnd ){
        revolutionH2 = -revolutionH2;
        shapeTranslation[3][2] = -shapeTranslation[3][2]
    }
    shapeTranslation[3][0] -= 2 * revolutionH2;
    shapeTranslation[3][1] += 2 * revolutionH2;

    if(Math.abs(shapeTranslation[2][1]) == paramRevolStart || Math.abs(shapeTranslation[2][1]) == paramRevolEnd ){
        revolutionH1 = -revolutionH1;
        shapeTranslation[2][2] = -shapeTranslation[2][2]
    }
    shapeTranslation[2][0] += 2 * revolutionH1;
    shapeTranslation[2][1] += 2 * revolutionH1;


    drawO(); // Draw the 'O' object
    drawH(3); // Draw the 'H' object
    drawH(2); // Draw the 'H' object
    
    requestAnimationFrame(render); //refresh
}



function radToDeg(r) {
    return r * 180 / Math.PI;
}

function degToRad(d) {
    return d * Math.PI / 180;
}

function drawO() {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffers[1]);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffers[1]);
    gl.vertexAttribPointer(colorLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);

    translation = shapeTranslation[1];

    matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);

    // Translate ke titik tengah huruf "O"
    matrix = m4.translate(matrix, translation[0] + centerO[0], translation[1] + centerO[1], translation[2] + centerO[2]);

    // Lakukan rotasi di sekitar sumbu Y
    matrix = m4.zRotate(matrix, 0);
    matrix = m4.xRotate(matrix, 10);
    matrix = m4.yRotate(matrix, rotationO[1]);

    // Translate kembali ke posisi awal
    matrix = m4.translate(matrix, -centerO[0], -centerO[1], -centerO[2]);

    matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

    gl.uniformMatrix4fv(matrixLocation, false, matrix);
    gl.drawArrays(primitiveType, offset, 120); // Update count value
}

function drawH(numH) {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffers[2]);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffers[2]);
    gl.vertexAttribPointer(colorLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);

    translation = shapeTranslation[numH];

    matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
    matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
    matrix = m4.xRotate(matrix, rotation[0]);
    matrix = m4.yRotate(matrix, rotation[1]);
    matrix = m4.zRotate(matrix, rotation[2]);
    matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

    gl.uniformMatrix4fv(matrixLocation, false, matrix);
    gl.drawArrays(primitiveType, offset, 108); // Update count value
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

function setGeometry(gl, shape, positionBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    switch (shape) {
        case 1:
            var verticesO = [
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

                ]
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array(verticesO),
                gl.STATIC_DRAW);
            // Hitung titik tengah huruf "O"
            var minX = Infinity;
            var maxX = -Infinity;
            var minY = Infinity;
            var maxY = -Infinity;

            for (var i = 0; i < verticesO.length; i += 3) {
                var x = verticesO[i];
                var y = verticesO[i + 1];

                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }

            centerO[0] = (minX + maxX) / 2;
            centerO[1] = (minY + maxY) / 2;
            centerO[2] = 0;

            break;
        case 2:
            var verticesH = [
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
                ]
            gl.bufferData( // set the buffer data for the shape to be a letter 'H'
                gl.ARRAY_BUFFER,
                new Float32Array(verticesH),
                gl.STATIC_DRAW);
            
            // Hitung titik tengah huruf "H"
            var minX = Infinity;
            var maxX = -Infinity;
            var minY = Infinity;
            var maxY = -Infinity;
            var minZ = Infinity;
            var maxZ = -Infinity;

            for (var i = 0; i < verticesH.length; i += 3) {
                var x = verticesH[i];
                var y = verticesH[i + 1];
                var z = verticesH[i + 2];

                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                if (z < minZ) minZ = z;
                if (z > maxZ) maxZ = z;
            }

            centerH = [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2];

            break;
    }
}

function setColors(gl, shape, colorBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    switch (shape) {
        case 1:
            gl.bufferData( // set the buffer data for the colors of the letter 'O'
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
                    116, 107, 0,
                ]),
                gl.STATIC_DRAW);
            break;
        case 2:
            gl.bufferData( // set the buffer data for the colors of the letter 'H'
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
                    0, 44, 120,
                ]),
                gl.STATIC_DRAW);
            break;
    }

}