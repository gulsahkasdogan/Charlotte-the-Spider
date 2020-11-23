var rotate_toggle = false;
var rotate_isright = true; // t: right, f: left
var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];


var torsoId = 0;
var headId  = 1;
var head1Id = 1;

var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;

//middle 
var leftUpperArm2Id = 10;
var leftLowerArm2Id = 11;
var rightUpperArm2Id = 12;
var rightLowerArm2Id = 13;

var head2Id = 14;

var torsoHeight = 5.0;
var torsoWidth = 1.0;
var upperArmHeight = 3.0;
var lowerArmHeight = 2.0;
var upperArmWidth  = 0.5;
var lowerArmWidth  = 0.5;
var upperLegWidth  = 0.5;
var lowerLegWidth  = 0.5;
var lowerLegHeight = 2.0;
var upperLegHeight = 3.0;
var headHeight = 1.5;
var headWidth = 1.0;

var numNodes = 14; // 10
var numAngles = 15; // 11
var angle = 0;

var theta = [0, 0, 0, 0, 0, 0, 180, 0, 180, 0, 0, 0, 0, 0, 0];

var numVertices = 24;

var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];

//-------------------------------------------

function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();

    switch(Id) {

        case torsoId:

            m = rotate(theta[torsoId], 0, 1, 0 );
            axisrotate = rotate(90, 1,0,0);
            m = mult(m,axisrotate);
            figure[torsoId] = createNode( m, torso, null, headId );
            break;

        case headId:
        case head1Id:
        case head2Id:


            m = translate(0.0, torsoHeight+0.5*headHeight, 0.0);
            m = mult(m, rotate(theta[head1Id], 1, 0, 0))
            m = mult(m, rotate(theta[head2Id], 0, 1, 0));
            m = mult(m, translate(0.0, -0.5*headHeight, 0.0));
            figure[headId] = createNode( m, head, leftUpperArmId, null);
            break;


        case leftUpperArmId:

            m = translate(-(torsoWidth+upperArmWidth), 0.9*torsoHeight, 0.0);
            m = mult(m, rotate(theta[leftUpperArmId], 1, 0, 0));
            figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
            break;

        case rightUpperArmId:

            m = translate(torsoWidth+upperArmWidth, 0.9*torsoHeight, 0.0);
            m = mult(m, rotate(theta[rightUpperArmId], 1, 0, 0));
            figure[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperArm2Id, rightLowerArmId );
            break;

        // upper middle left 
        case leftUpperArm2Id:
            m = translate(-(torsoWidth+upperArmWidth), 0.5*torsoHeight, 0.0);
            m = mult(m, rotate(theta[leftUpperArm2Id], 1, 0, 0));
            figure[leftUpperArm2Id] = createNode( m, leftUpperArm2, rightUpperArm2Id, leftLowerArm2Id);
            break;

        // upper middle right 
        case rightUpperArm2Id:
            m = translate((torsoWidth+upperArmWidth), 0.5*torsoHeight, 0.0);
            m = mult(m, rotate(theta[rightUpperArm2Id], 1, 0, 0));
            figure[rightUpperArm2Id] = createNode( m, rightUpperArm2, leftUpperLegId, rightLowerArm2Id);
            break;

        case leftUpperLegId:

            m = translate(-(torsoWidth+upperLegWidth), 0.1*upperLegHeight, 0.0);
            m = mult(m , rotate(theta[leftUpperLegId], 1, 0, 0));
            figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
            break;

        case rightUpperLegId:

            m = translate(torsoWidth+upperLegWidth, 0.1*upperLegHeight, 0.0);
            m = mult(m, rotate(theta[rightUpperLegId], 1, 0, 0));
            figure[rightUpperLegId] = createNode( m, rightUpperLeg, null, rightLowerLegId );
            break;

        case leftLowerArmId:

            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerArmId], 1, 0, 0));
            figure[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
            break;

        case rightLowerArmId:

            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerArmId], 1, 0, 0));
            figure[rightLowerArmId] = createNode( m, rightLowerArm, null, null );
            break;

        // lower middle arm 
        case leftLowerArm2Id:
            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerArm2Id], 1, 0, 0));
            figure[leftLowerArm2Id] = createNode( m, leftLowerArm2, null, null );
            break;

        // lower middle right 
        case rightLowerArm2Id: 
        m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerArm2Id], 1, 0, 0));
            figure[rightLowerArm2Id] = createNode( m, rightLowerArm2, null, null );
            break;

        case leftLowerLegId:

            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerLegId], 1, 0, 0));
            figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
            break;

        case rightLowerLegId:

            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerLegId], 1, 0, 0));
            figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
            break;


    }

}

function traverse(Id) {

    if(Id == null) return;
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
    figure[Id].render();
    if(figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
    if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function torso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
    instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftUpperArm2(){
    //TODO
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm2(){
    //TODO
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperArm2(){
    //TODO
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm2(){
    //TODO
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function quad(a, b, c, d) {
    pointsArray.push(vertices[a]);
    pointsArray.push(vertices[b]);
    pointsArray.push(vertices[c]);
    pointsArray.push(vertices[d]);
}


function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram( program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-10.0,10.0,-10.0, 10.0,-10.0,10.0);
    modelViewMatrix = mat4();


    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix) );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    cube();

    vBuffer = gl.createBuffer();

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    document.getElementById("slide_torso").onchange = function() {
        theta[torsoId ] = event.srcElement.value;
        initNodes(torsoId);
    };
    document.getElementById("slide_head1").onchange = function() {
        theta[head1Id] = event.srcElement.value;
        initNodes(head1Id);
    };

    document.getElementById("slide_leftupperarm").onchange = function() {
        theta[leftUpperArmId] = this.value;
        initNodes(leftUpperArmId);
    };

    document.getElementById("slide_leftlowerarm").onchange = function() {
        theta[leftLowerArmId] =  this.value;
        initNodes(leftLowerArmId);
    };

    document.getElementById("slide_rightupperarm").onchange = function() {
        theta[rightUpperArmId] = this.value;
        initNodes(rightUpperArmId);
    };
    document.getElementById("slide_rightlowerarm").onchange = function() {
        theta[rightLowerArmId] =  this.value;
        initNodes(rightLowerArmId);
    };

    // middle left up 
    document.getElementById("slide_leftupperarm2").onchange = function() {
        theta[leftUpperArm2Id] =  this.value;
        initNodes(leftUpperArm2Id);
    };

    //middle left low 
    document.getElementById("slide_leftlowerarm2").onchange = function() {
        theta[leftLowerArm2Id] =  this.value;
        initNodes(leftLowerArm2Id);
    };

    // middle right up 
    document.getElementById("slide_rightupperarm2").onchange = function() {
        theta[rightUpperArm2Id] =  this.value;
        initNodes(rightUpperArm2Id);
    };

    //middle right low 
    document.getElementById("slide_rightlowerarm2").onchange = function() {
        theta[rightLowerArm2Id] =  this.value;
        initNodes(rightLowerArm2Id);
    };

    document.getElementById("slide_leftupperleg").onchange = function() {
        theta[leftUpperLegId] = this.value;
        initNodes(leftUpperLegId);
    };
    document.getElementById("slide_leftlowerleg").onchange = function() {
        theta[leftLowerLegId] = this.value;
        initNodes(leftLowerLegId);
    };
    document.getElementById("slide_rightupperleg").onchange = function() {
        theta[rightUpperLegId] =  this.value;
        initNodes(rightUpperLegId);
    };
    document.getElementById("slide_rightlowerleg").onchange = function() {
        theta[rightLowerLegId] = this.value;
        initNodes(rightLowerLegId);
    };
    document.getElementById("slide_head2").onchange = function() {
        theta[head2Id] = this.value;
        initNodes(head2Id);
    };
    document.getElementById("rotate_toggle").onclick = function() {
        rotate_toggle = !rotate_toggle;
    };
    document.getElementById("rotate_left").onclick = function() {
        rotate_isright = false;
    };
    document.getElementById("rotate_right").onclick = function() {
        rotate_isright = true;
    };

    for(i=0; i<numNodes; i++) initNodes(i);

    render();
}


var render = function() {
    rotateUnit();
    gl.clear( gl.COLOR_BUFFER_BIT );
    traverse(torsoId);
    requestAnimFrame(render);
}

var rotateUnit = function(){
    if(rotate_toggle){
        if(rotate_isright){
            theta[torsoId ] = theta[torsoId] + 2;
            if(theta[torsoId ] > 180){
                theta[torsoId] = -180 + (theta[torsoId] % 180);
            }
            initNodes(torsoId);
        } else {
            theta[torsoId ] = theta[torsoId] - 2;
            if(theta[torsoId ] < -180){
                theta[torsoId] = 180 - (theta[torsoId] % -180);
            }
            initNodes(torsoId);
        }
    }
}