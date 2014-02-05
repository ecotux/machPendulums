
function Light(scene,x,y,z) {
	this.scene = scene;

	this.light = new THREE.PointLight(0xFFFFFF);
	this.light.position.x = x;
	this.light.position.y = y;
	this.light.position.z = z;
	this.scene.add(this.light);
}

function Camera(scene,x,y,z) {
	this.scene = scene;

	var VIEW_ANGLE = 30;
	var ASPECT = 640 / 480;
	var NEAR = 10;
	var FAR = 10000;
	this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE,ASPECT,NEAR,FAR);
	this.camera.position.x = x;
	this.camera.position.y = y;
	this.camera.position.z = z;

	// if I want to use "OrbitControl", the camera must
	// look at (0,0,0) at the beginning
	this.target = new THREE.Vector3(0,0,0);
	this.camera.lookAt(this.target);
	this.scene.add(this.camera);
}

Camera.prototype.getInstance = function() {
	return this.camera;
}

function Top(scene) {
	this.scene = scene;

	var geometryBar = new THREE.CylinderGeometry(5,5,15*15);
	var materialBar = new THREE.MeshLambertMaterial({
					color : 0xFFFFFF,
				});
	this.meshBar = new THREE.Mesh(geometryBar,materialBar);
	this.meshBar.rotation.x = Math.PI/2;
	this.meshBar.position.x = -300;
	this.meshBar.position.y = -50;
	this.meshBar.position.z = 120-350;

	this.scene.add(this.meshBar);
}

function Pendulum(scene,z,p,theta0,color) {
	this.scene = scene;
	this.z = z;
	this.p = p;		// period
	this.theta0 = theta0;
	this.color = color;

	this.l = 9.81*this.p*this.p/(4*Math.PI*Math.PI);
	this.l = this.l*500;

	var radius = 5;
	var segments = 30;
	var rings = 30;
	
	var geometrySphere = new THREE.SphereGeometry(radius,segments,rings);
	var materialSphere = new THREE.MeshLambertMaterial({
					color : this.color,
				});

	this.meshSphere = new THREE.Mesh(geometrySphere,materialSphere);
	this.meshSphere.position.x = this.l * Math.sin(this.theta0);
	this.meshSphere.position.y = - this.l * Math.cos(this.theta0);
	this.meshSphere.position.z = this.z;

	this.meshSphere.position.x -= 300;
	this.meshSphere.position.y -= 50;
	this.meshSphere.position.z -= 350;

	this.scene.add(this.meshSphere);

	this.startLine = new THREE.Vector3(-300,-50,this.z-350);
	this.endLine = new THREE.Vector3(this.meshSphere.position.x,this.meshSphere.position.y,this.meshSphere.position.z);
	var materialWire = new THREE.LineBasicMaterial({
					color : this.color,
				});
	var geometryWire = new THREE.Geometry();
	geometryWire.vertices.push(this.startLine);
	geometryWire.vertices.push(this.endLine);

	this.wire = new THREE.Line(geometryWire,materialWire);
	this.scene.add(this.wire);

}

Pendulum.prototype.tick = function(time) {
	var theta = this.theta0*Math.cos(2*Math.PI*time/this.p);
	this.meshSphere.position.x = this.l * Math.sin(theta);
	this.meshSphere.position.y = - this.l * Math.cos(theta);
	this.meshSphere.position.z = this.z;

	this.meshSphere.position.x -= 300;
	this.meshSphere.position.y -= 50;
	this.meshSphere.position.z -= 350;

	this.wire.geometry.vertices[1] = new THREE.Vector3(this.meshSphere.position.x,this.meshSphere.position.y,this.meshSphere.position.z);
	this.wire.geometry.verticesNeedUpdate = true;
}


function machPendulums() {
	this.renderer = new THREE.WebGLRenderer();
	this.renderer.setSize(640,480);
	var container = document.getElementById('container');
	container.appendChild(this.renderer.domElement);

	this.scene = new THREE.Scene();

	this.light = new Light(this.scene,1000,-100,100);
//	this.camera = new Camera(this.scene,60,30,50);
	this.camera = new Camera(this.scene,240,120,200);
	this.top = new Top(this.scene);

	this.controls = new THREE.OrbitControls( this.camera.getInstance(), this.renderer.domElement );

	var z = 0;
	var p = 0;
	var theta = -0.6;
	var color = new THREE.Color();

	this.pendulums = [];
	for(var i = 0; i < 15; i++) { 
		z = z + 15;
		color.setHSL((15-i)/20,0.6,0.8);
		p = 60/(51+(15-i));
		this.pendulums.push(new Pendulum(this.scene,z,p,theta,color));
	}

	this.start = Date.now();
}

machPendulums.prototype.mainLoop = function() {
	requestAnimationFrame(this.mainLoop.bind(this));
	this.controls.update();
	for(var i = 0; i < 15; i++) { 
		this.pendulums[i].tick((Date.now()-this.start)/1000);
	}
	this.renderer.render(this.scene,this.camera.getInstance());
}


window.onload = function() {
	var sim = new machPendulums();
	sim.mainLoop();
}

