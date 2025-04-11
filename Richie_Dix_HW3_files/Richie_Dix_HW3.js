"use strict";

var gl;
var theta = 0.0;
var thetaLoc;

var speed = 100;
var direction = true;

var positions = [];
var colors = [];
var numTriangles = 100;


window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    let center = vec2(0, 0);
    let radius = 0.5;
    let numTriangles = 100;
    let angleStep = (2 * Math.PI) / numTriangles;
    let currentColor = vec4(0.0, 0.0, 0.0, 1.0);

    for (let i = 0; i < numTriangles; i++) {
        let angle1 = i * angleStep;
        let angle2 = (i + 1) * angleStep;
    
        let p1 = vec2(center[0] + radius * Math.cos(angle1), center[1] + radius * Math.sin(angle1));
        let p2 = vec2(center[0] + radius * Math.cos(angle2), center[1] + radius * Math.sin(angle2));
    
        positions.push(center, p1, p2);
    
        colors.push(currentColor, currentColor, currentColor);
        triangle(center, p1, p2, currentColor);
    }

    // ---- Load positions ----
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    // ---- Load colors ----
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    thetaLoc = gl.getUniformLocation(program, "uTheta");

    // Input handlers (you can customize these more)
    document.getElementById("red").oninput = function (event) {
        currentColor[0] = parseFloat(event.target.value);
        updateTriangleColor();
    };
    document.getElementById("green").oninput = function (event) {
        currentColor[1] = parseFloat(event.target.value);
        updateTriangleColor();
    };
    document.getElementById("blue").oninput = function (event) {
        currentColor[2] = parseFloat(event.target.value);
        updateTriangleColor();
    };

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

function triangle(a, b, c, color) {
    positions.push(a, b, c);
    colors.push(color, color, color);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    theta += (direction ? 0.1 : -0.1);
    gl.uniform1f(thetaLoc, theta);

    gl.drawArrays(gl.TRIANGLES, 0, positions.length);
    setTimeout(() => requestAnimationFrame(render), speed);
}

function updateTriangleColor() {
    colors = [];
    for (let i = 0; i < positions.length/3; i++){
        colors.push(currentColor, currentColor, currentColor);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    render();
}