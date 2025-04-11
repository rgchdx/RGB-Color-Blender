"use strict";

var gl;
var theta = 0.0;
var thetaLoc;

var speed = 100;
var direction = true;

var positions = [];
var colors = [];
var numTriangles = 100;
var currentColor = vec3(0.0, 0.0, 0.0);
var colorBuffer;

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    thetaLoc = gl.getUniformLocation(program, "theta");

    // Generate circle geometry
    let center = vec2(0, 0);
    let radius = 0.5;
    let angleStep = (2 * Math.PI) / numTriangles;

    for (let i = 0; i < numTriangles; i++) {
        let angle1 = i * angleStep;
        let angle2 = (i + 1) * angleStep;
    
        let p1 = vec2(radius * Math.cos(angle1), radius * Math.sin(angle1));
        let p2 = vec2(radius * Math.cos(angle2), radius * Math.sin(angle2));
    
        positions.push(center, p1, p2);
        colors.push(currentColor, currentColor, currentColor);
    }

    // ---- Load positions ----
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    // ---- Load colors ----
    colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    // ---- Sliders for RGB ----
    document.getElementById("red").addEventListener("input", (event) => {
        currentColor[0] = parseFloat(event.target.value);
        updateTriangleColors();
    });

    document.getElementById("green").addEventListener("input", (event) => {
        currentColor[1] = parseFloat(event.target.value);
        updateTriangleColors();
    });

    document.getElementById("blue").addEventListener("input", (event) => {
        currentColor[2] = parseFloat(event.target.value);
        updateTriangleColors();
    });

    // Keyboard controls
    window.onkeydown = function(event) {
        var key = String.fromCharCode(event.keyCode);
        switch (key) {
            case '1': direction = !direction; break;
            case '2': speed /= 2.0; break;
            case '3': speed *= 2.0; break;
        }
    };

    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    theta += (direction ? 0.01 : -0.01);
    gl.uniform1f(thetaLoc, theta);

    gl.drawArrays(gl.TRIANGLES, 0, positions.length);
    setTimeout(() => requestAnimationFrame(render), speed);
}

function updateTriangleColors() {
    colors = [];
    for (let i = 0; i < positions.length / 3; i++) {
        colors.push(currentColor, currentColor, currentColor);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(gl.getParameter(gl.CURRENT_PROGRAM), "aColor");
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);
}