"use strict";

var canvas;
var gl;

var positions = [];

var positionLoc;
var x0;
var y0;
var x1;
var y1;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.83, 0.99, 0.91, 1);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    positionLoc = gl.getAttribLocation(program, "aPosition");

    document.getElementById("drawLine2Btn").onclick = function () {
        clearCanvas();
        x0 = document.getElementById("x0").value;
        y0 = document.getElementById("y0").value;
        x1 = document.getElementById("x1").value;
        y1 = document.getElementById("y1").value;
        midpointLine(x0, y0, x1, y1);
        initBuffers();
        render();
    }

    var windDirectionSelect = document.getElementById("windDirection");
    windDirectionSelect.onchange = function () {
        var windDirectionValue = windDirectionSelect.value;

        clearCanvas();
        if (windDirectionValue === "0") { // north
            midpointLine(0, 0, 0, 10);
        } else if (windDirectionValue === "1") { // north east
            midpointLine(0, 0, 10, 10);
        } else if (windDirectionValue === "2") { // east
            midpointLine(0, 0, 10, 0);
        } else if (windDirectionValue === "3") { // south east
            midpointLine(0, 0, 10, -10);
        } else if (windDirectionValue === "4") { // south
            midpointLine(0, 0, 0, -10);
        } else if (windDirectionValue === "5") { // south west
            midpointLine(0, 0, -10, -10);
        } else if (windDirectionValue === "6") { // west
            midpointLine(0, 0, -10, 0);
        } else if (windDirectionValue === "7") { // north west
            midpointLine(0, 0, -10, 10);
        }
        initBuffers();
        render();
    }



    render();
}

function clearCanvas() {
    positions = [];
    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINE_STRIP, 0, positions.length);
}

function initBuffers() {
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);
}

function midpointLine(x0, y0, x1, y1) {
    // accomodate for all quadrants
    let xReflect = 1;
    if (x1 < x0) {
        x0 = -x0;
        x1 = -x1;
        xReflect = -1;
    }

    let yReflect = 1;
    if (y1 < y0) {
        y0 = -y0;
        y1 = -y1;
        yReflect = -1;
    }

    let dx = x1 - x0;
    let dy = y1 - y0;
    if (x0 !== x1) {
        let d = dy - dx / 2;

        let x = x0;
        let y = y0;

        positions.push(vec2(x * xReflect / 10, y * yReflect / 10));

        while (x < x1) {
            x++;
            if (d < 0) {
                d += dy;
            } else {
                d += dy - dx;
                y++;
            }
            positions.push(vec2(x * xReflect / 10, y * yReflect / 10));
        }
    } else {
        let d = dx - dy / 2;

        let x = x0;
        let y = y0;

        positions.push(vec2(x * xReflect / 10, y * yReflect / 10));

        while (y < y1) {
            y++;
            if (d < 0) {
                d += dx;
            } else {
                d += dx - dy;
                x++;
            }
            positions.push(vec2(x * xReflect / 10, y * yReflect / 10));
        }
    }
}

// sc:
// https://stackoverflow.com/questions/64830053/javascript-midpoint-line-drawing-algorithm
// https://www.geeksforgeeks.org/mid-point-line-generation-algorithm/