import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";

var scene, renderer, camera, controls
var cameraCenter = new THREE.Vector3();
var cameraHorizontalLimit = 50;
var cameraVerticalLimit = 50;
var mouse = new THREE.Vector2();

init();
animate();

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.y = 10;
    camera.position.z = 30;
    camera.position.x = 0;
    camera.lookAt(new THREE.Vector3(0,0,0));

    controls = new OrbitControls( camera, renderer.domElement );

    cameraCenter.x = camera.position.x;
    cameraCenter.y = camera.position.y;
    cameraCenter.z = camera.position.z;

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);

    var color = new THREE.Color(0.2, 0.2, 0.2);
    var ambient = new THREE.AmbientLight(color.getHex());
    scene.add(ambient);

    var geometry = new THREE.SphereGeometry(10, 320, 320);
    var material = new THREE.MeshPhongMaterial({
        color: new THREE.Color('red')
    });
    var sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(0,0,0)
    scene.add(sphere);
    /*
    cubeGeo = new THREE.BoxGeometry(10,10,10);
    cubeMat = new THREE.MeshBasicMaterial({color: 0x00ff00});
    cube = new THREE.Mesh(cubeGeo, cubeMat);
    cube.position.set(0,0,0);
    scene.add(cube);*/

    var pointLight = new THREE.PointLight(0xFFFFFF);
    pointLight.position.x = 50;
    pointLight.position.y = 50;
    scene.add(pointLight);



    var gridXZ = new THREE.GridHelper(100, 10);
    gridXZ.setColors( new THREE.Color(0xff0000), new THREE.Color(0xffffff) );
    scene.add(gridXZ);

    var axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);


}

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateCamera(){
    camera.position.x = cameraCenter.x + (cameraHorizontalLimit * mouse.x);
    camera.position.y = cameraCenter.y + (cameraVerticalLimit * mouse.y);
    camera.position.z = cameraCenter.z;
}


function animate() {
    updateCamera();
    controls.update();
    /*
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;*/
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}