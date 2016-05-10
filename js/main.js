	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
	var container, stats;
	var camera, scene, renderer;
	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;
	var raycaster;
	var mouse;
	var heartPart;
	var heartIsOpen;
	var aortaPin;
	
	// set up the canvas on which to draw the locator line
	// MUST NOT be below init() and animate()
	var lineCanvas = document.createElement( 'canvas' );
	lineCanvas.id = "dotsCanvas";
	lineCanvas.width = window.innerWidth;
	lineCanvas.height = window.innerHeight;
	lineCanvas.style.position = "absolute";
	lineCanvas.style.zIndex = "101";
	lineCanvas.style.display = "inline";
	document.body.appendChild(lineCanvas);
	
	// creating pin vectors
	var allMyPins = [];
	allMyPins.push(
		new THREE.Vector3(-4.044027262032927, 4.219614694564475, -1.2308631918325883),
		new THREE.Vector3(-3.4000000000000004, 7.600000000000003, 2.5999999999999996),
		new THREE.Vector3(-4.200000000000001, 0.7999999999999987, 3.4000000000000004),
		new THREE.Vector3(-5.000000000000002, 3.1999999999999993, 1.3999999999999995),
		new THREE.Vector3(1.0000000000000004, 2.3999999999999986, 6.000000000000002),
		new THREE.Vector3(-2.1999999999999993, 6.000000000000002, -4.800000000000003)
		);

	init();
	animate();
	
	function init() {
		
		// camera
		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
		camera.position.x= -42.54404597864378; camera.position.y= 4.095160583665006; camera.position.z= -1.2896749071128895;

		// controls
		controls = new THREE.TrackballControls( camera );
		controls.rotateSpeed = 1.0;
		controls.zoomSpeed = 1.2;
		controls.panSpeed = 0.8;
		controls.noZoom = false;
		controls.noPan = false;
		controls.staticMoving = true;
		controls.dynamicDampingFactor = 0.3;
		controls.keys = [ 65, 83, 68 ];
		controls.addEventListener( 'change', render ); 
		
		// scene
		scene = new THREE.Scene();
		var ambient = new THREE.AmbientLight( 0x444444 );
		scene.add( ambient );
		var directionalLight1 = new THREE.DirectionalLight( 0xffeedd, 0.7 );
		directionalLight1.position.set( 0, 0, 1 ).normalize();
		var directionalLight2 = new THREE.DirectionalLight( 0xffeedd, 0.7 );
		directionalLight2.position.set( 0, 0, -1 ).normalize();
		var directionalLight3 = new THREE.DirectionalLight( 0xffeedd, 0.7 );
		directionalLight3.position.set( 1, 0, 0).normalize();
		var directionalLight4 = new THREE.DirectionalLight( 0xffeedd, 0.7 );
		directionalLight4.position.set( -1, 0, 0 ).normalize();
		var directionalLight5 = new THREE.DirectionalLight( 0xffeedd, 0.7 );
		directionalLight5.position.set( 0, 1, 0 ).normalize();
		var directionalLight6 = new THREE.DirectionalLight( 0xffeedd, 0.7 );
		directionalLight6.position.set( 0, -1, 0 ).normalize();
		scene.add( directionalLight1 );
		scene.add( directionalLight2 );
		scene.add( directionalLight3 );
		scene.add( directionalLight4 );			
		scene.add( directionalLight5 );
		scene.add( directionalLight6 );
		
		// models
		var onProgress = function ( xhr ) {
			if ( xhr.lengthComputable ) {
				var percentComplete = xhr.loaded / xhr.total * 100;
				console.log( Math.round(percentComplete, 2) + '% downloaded' );
			}
		};
		var onError = function ( xhr ) { };
		
		THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
		var mtlLoader = new THREE.MTLLoader();
		mtlLoader.setBaseUrl( 'models/' );
		mtlLoader.setPath( 'models/' );
		mtlLoader.load( 'openheartLD1.mtl', function( materials ) {
			materials.preload();
			var objLoader = new THREE.OBJLoader();
			objLoader.setMaterials( materials );
			objLoader.setPath( 'models/' );
			objLoader.load( 'openheartLD1.obj', function ( object ) {
				object.position.x = 32;
				object.position.y = -3;
				object.position.z = 3;
				object.rotation.x = -1.6;
				object.name = 'openHeart';
				scene.add( object );
			}, onProgress, onError );
		});
		
		THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
		var mtlLoader2 = new THREE.MTLLoader();
		mtlLoader2.setBaseUrl( 'models/' );
		mtlLoader2.setPath( 'models/' );
		mtlLoader2.load( 'heartpartLD1.mtl', function( materials ) {
			materials.preload();
			var objLoader2 = new THREE.OBJLoader();
			objLoader2.setMaterials( materials );
			objLoader2.setPath( 'models/' );
			objLoader2.load( 'heartpartLD1.obj', function ( object ) {
				object.position.x= -7.600000000000003; object.position.y= -9.399999999999999; object.position.z= 24.199999999999946;
				object.rotation.x= -1.6000000000000008; object.rotation.y= 0.44999999999999996; object.rotation.z= 0.05000000000000002;
				object.scale.x= 3.949999999999994; object.scale.y= 3.949999999999994; object.scale.z= 3.949999999999994;
				object.name = 'heartPart';
				scene.add( object );
			}, onProgress, onError );
		});
		heartPart = scene.getObjectByName('heartPart', true);
		heartIsOpen = false;

		camera.position.z = 5;
		
		// container
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		
		// renderer three.js in canvas
		var threeCanvas = document.getElementById('threeCanvas');
		renderer = new THREE.WebGLRenderer({canvas: threeCanvas});
		threeCanvas.width  = window.innerWidth;
		threeCanvas.height = window.innerHeight;
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		
		// stats
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		stats.domElement.style.zIndex = 100;
		container.appendChild( stats.domElement );
		
		// window resize
		window.addEventListener( 'resize', onWindowResize, false );

		raycaster = new THREE.Raycaster();
		mouse = new THREE.Vector2();
		
	}
	
	function onWindowResize() {
		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
		controls.handleResize();
		animate();
	}

	function animate() {
		requestAnimationFrame( animate );
		controls.update();
		TWEEN.update();
		if (document.getElementById("dotsCanvas").style.display == "inline") {
			checkDots();
		}
		render();
	}
	
	function render() {
		renderer.render( scene, camera );
		stats.update();

	}
	
	function checkDots() {
	// Go back, find 2d point of this 3d object, cast ray from that 2d point, see if hits openheart?
		// Caution: rays cast go right through objects!
		// Can cast a ray from pin straight at camera?
		var vector = new THREE.Vector3();
		var openHeart = scene.getObjectByName('openHeart', true);
		var origin;
		var i;
		var canvas = document.getElementById("dotsCanvas");
		canvas.width = canvas.width;
		vector.set(camera.position.x, camera.position.y, camera.position.z);
		for (i in allMyPins) {
			origin = allMyPins[i].clone();
			// turns vector into a directional vector pointing from origin to camera
			vector.sub(origin).normalize();
			raycaster.set( origin, vector );
			var intersects = raycaster.intersectObject( openHeart, true );
			if (intersects.length > 0) {
				//console.log("marker invisible!");
			}
			else {
				createDots(origin, i);
			}
			vector.set(camera.position.x, camera.position.y, camera.position.z);
		}
	}
	
	function createDots( myVector, i ) {
		var vector = myVector.clone();
		vector.project( camera );
		var canvas = document.getElementById("dotsCanvas");
		vector.x = Math.round( (   vector.x + 1 ) * window.innerWidth  / 2 );
		vector.y = Math.round( ( - vector.y + 1 ) * window.innerHeight / 2 );
		vector.z = 0;
		var ctx = canvas.getContext("2d");
		ctx.beginPath();
		ctx.arc(vector.x,vector.y,15,0,2*Math.PI);
		ctx.fillStyle = "#FF0000";
		ctx.fill();
		// now add the number to the dot
		i++;
		text = i;
		var font = "bold " + 16 + "px monospace";
		ctx.font = font;
		var width = ctx.measureText(text).width;
		var height = ctx.measureText("w").width;
		ctx.fillStyle = "white";
		ctx.fillText(text, vector.x - (width/2), vector.y + (height/2));
	}
	
	function hideDots() {
		var allDots = document.getElementById("dotsCanvas");
		if (allDots.style.display == "inline") {
			allDots.style.display = "none";
		}
		else {
			allDots.style.display = "inline";
		}
	}
	
	function movePart() {
		console.log("on the move!");
		console.log("Heart is open? " + heartIsOpen);
		heartPart = scene.getObjectByName('heartPart', true);
		
		if (heartIsOpen == false){
			var tween1 = new TWEEN.Tween(heartPart.rotation)
			.to({ x: -1.6000000000000008, y: 0.44999999999999996, z: 3.099999999999997 }, 1000)
			.start();
			var tween2 = new TWEEN.Tween(heartPart.position)
			.to({ x: 3.4000000000000026, y: -14.999999999999979, z: -6.200000000000005 }, 1000)
			.onComplete(function(){heartIsOpen = true;})
			.start();
			animate();
		}
		
		if (heartIsOpen == true){
			var tween1 = new TWEEN.Tween(heartPart.rotation)
			.to({ x: -1.6000000000000008, y: 0.44999999999999996, z: 0.05000000000000002 }, 1000)
			.start();
			animate();
			var tween2 = new TWEEN.Tween(heartPart.position)
			.to({ x: -7.600000000000003, y: -9.399999999999999, z: 24.199999999999946 }, 1000)
			.onComplete(function(){heartIsOpen = false;})
			.start();
		}
	}