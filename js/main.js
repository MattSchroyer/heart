	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
	var container, stats;
	var camera, scene, renderer;
	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;
	
	// set up the canvas on which to draw the locator line
	var lineCanvas = document.createElement( 'canvas' );
	lineCanvas.id = "lineCanvas";
	lineCanvas.width = window.innerWidth;
	lineCanvas.height = window.innerHeight;
	lineCanvas.style.position = "absolute";
	lineCanvas.style.zIndex = "101";
	document.body.appendChild(lineCanvas);
	
	var raycaster;
	var mouse;
	var objects = [];
	
	init();
	animate();
	
	
	function init() {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
		//camera.position.x = -2.072;
		//camera.position.y = -4.191;
		//camera.position.z = 2.923;

		
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
		var directionalLight = new THREE.DirectionalLight( 0xffeedd );
		directionalLight.position.set( 0, 0, 1 ).normalize();
		scene.add( directionalLight );
		
		// model
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
		mtlLoader.load( 'heart1.mtl', function( materials ) {
			materials.preload();
			var objLoader = new THREE.OBJLoader();
			objLoader.setMaterials( materials );
			objLoader.setPath( 'models/' );
			objLoader.load( 'heart1.obj', function ( object ) {
				object.name = 'myHeart';
				object.position.y = - 5;
				console.log(object);
				console.log('Object name is: ' + object.name);
				scene.add( object );
			}, onProgress, onError );
		});
		scene.getObjectById(2, true).name = 'myHeart';
		
		camera.position.x= 0.08140657541040912; camera.position.y= -6.534570564010448; camera.position.z= 0.5446630749390854;
		// Don't actually need camera rotation, but here are some parameters I experimented with (unsuccessfully)
		//camera.rotation.x= 1.1018754723144317; camera.rotation.y= 0.09926632857527733; camera.rotation.z= -0.18679317164723086;
		
		
		var threeCanvas = document.getElementById('threeCanvas');
		renderer = new THREE.WebGLRenderer({canvas: threeCanvas});
		threeCanvas.style.width  = window.innerWidth + "px";
		threeCanvas.style.height = window.innerHeight + "px";
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		//container.appendChild( renderer.domElement );
		
		//
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		stats.domElement.style.zIndex = 100;
		container.appendChild( stats.domElement );
		//
		window.addEventListener( 'resize', onWindowResize, false );
		//
		
		// creating annotation dom element
		createLabels();
				
		// listens for mousclicks
		document.addEventListener( 'mousedown', onDocumentMouseDown, false );
		raycaster = new THREE.Raycaster();
		mouse = new THREE.Vector2();								
		
		render();
		
	}
	
	function createLabels() {
		var vector = new THREE.Vector3();
		vector.set(0.32439835976926124, 0.4659299449117693, 1.0080319877748256);
		vector.project( camera );
		vector.x = Math.round( (   vector.x + 1 ) * window.innerWidth  / 2 );
		vector.y = Math.round( ( - vector.y + 1 ) * window.innerHeight / 2 );
		var label1 = document.createElement( 'div' );
		label1.id = 'laa';
		label1.class = 'label';
		label1.style.position = 'absolute';
		label1.innerHTML = 'Left auricular appendage';
		label1.style.position = "absolute";
		label1.style.zIndex = "102";
		label1.style.left  = (vector.x * 1.2)+'px';
		label1.style.top   = (vector.y * 1.2)+'px';
		document.body.appendChild( label1 );
		
		vector.set(-0.2490632366203533, 0.3975958775920736, 1.4497165957669103);
		vector.project( camera );
		vector.x = Math.round( (   vector.x + 1 ) * window.innerWidth  / 2 );
		vector.y = Math.round( ( - vector.y + 1 ) * window.innerHeight / 2 );
		var label2 = document.createElement( 'div' );
		label2.id = 'pa';
		label2.class = 'label';
		label2.style.position = 'absolute';
		label2.innerHTML = 'Pulmonary artery';
		label2.style.position = "absolute";
		label2.style.zIndex = "102";
		label2.style.left  = (vector.x * 1.3)+'px';
		label2.style.top   = (vector.y * 0.8)+'px';
		document.body.appendChild( label2 );
		
		vector.set(-0.9782747692948786, 0.5888642911536701, 1.40313434534541);
		vector.project( camera );
		vector.x = Math.round( (   vector.x + 1 ) * window.innerWidth  / 2 );
		vector.y = Math.round( ( - vector.y + 1 ) * window.innerHeight / 2 );
		var label3 = document.createElement( 'div' );
		label3.id = 'a';
		label3.class = 'label';
		label3.style.position = 'absolute';
		label3.innerHTML = 'Aorta';
		label3.style.position = "absolute";
		label3.style.zIndex = "102";
		label3.style.left  = (vector.x * 0.8)+'px';
		label3.style.top   = (vector.y * 0.8)+'px';
		document.body.appendChild( label3 );
		
		vector.set(-1.4269804664219996, 0.8598959397784895, 2.1614441023287947);
		vector.project( camera );
		vector.x = Math.round( (   vector.x + 1 ) * window.innerWidth  / 2 );
		vector.y = Math.round( ( - vector.y + 1 ) * window.innerHeight / 2 );
		var label4 = document.createElement( 'div' );
		label4.id = 'vcs';
		label4.class = 'label';
		label4.style.position = 'absolute';
		label4.innerHTML = 'Vena cava superior';
		label4.style.position = "absolute";
		label4.style.zIndex = "102";
		label4.style.left  = (vector.x * 0.8)+'px';
		label4.style.top   = (vector.y * 0.8)+'px';
		document.body.appendChild( label4 );
		
		vector.set(-0.2360958679351592, 0.8085302215104377, 2.4726643143975773);
		vector.project( camera );
		vector.x = Math.round( (   vector.x + 1 ) * window.innerWidth  / 2 );
		vector.y = Math.round( ( - vector.y + 1 ) * window.innerHeight / 2 );
		var label5 = document.createElement( 'div' );
		label5.id = 'aoa';
		label5.class = 'label';
		label5.style.position = 'absolute';
		label5.innerHTML = 'Arch of the aorta';
		label5.style.position = "absolute";
		label5.style.zIndex = "102";
		label5.style.left  = (vector.x * 1.2)+'px';
		label5.style.top   = (vector.y * 1.2)+'px';
		document.body.appendChild( label5 );
	}
	
	function redrawLabels() {		
		// drawing line for left auricular appendage
		var vector = new THREE.Vector3();
		vector.set(0.32439835976926124, 0.4659299449117693, 1.0080319877748256);
		vector.project( camera );
		canvas = document.getElementById("lineCanvas");
		// canvas.width resets the canvas
		canvas.width = canvas.width;
		vector.x = Math.round( (   vector.x + 1 ) * window.innerWidth  / 2 );
		vector.y = Math.round( ( - vector.y + 1 ) * window.innerHeight / 2 );
		vector.z = 0;
		var ctx=canvas.getContext("2d");
		ctx.beginPath();
		ctx.moveTo(vector.x,vector.y);
		ctx.lineTo((vector.x * 1.2),(vector.y * 1.2) + 20);
		ctx.strokeStyle="#FF0000";
		ctx.stroke();
		// relocate laa label
		var label1 = document.getElementById('laa');
		label1.style.left  = (vector.x * 1.2)+'px';
		label1.style.top   = (vector.y * 1.2)+'px';
		
		vector.set(-0.2490632366203533, 0.3975958775920736, 1.4497165957669103);
		vector.project( camera );
		vector.x = Math.round( (   vector.x + 1 ) * window.innerWidth  / 2 );
		vector.y = Math.round( ( - vector.y + 1 ) * window.innerHeight / 2 );
		var ctx=canvas.getContext("2d");
		ctx.beginPath();
		ctx.moveTo(vector.x,vector.y);
		ctx.lineTo((vector.x * 1.3),(vector.y * 0.8) + 20);
		ctx.strokeStyle="#FF0000";
		ctx.stroke();
		var label2 = document.getElementById('pa');
		label2.style.left  = (vector.x * 1.3)+'px';
		label2.style.top   = (vector.y * 0.8)+'px';
		
		vector.set(-0.9782747692948786, 0.5888642911536701, 1.40313434534541);
		vector.project( camera );
		vector.x = Math.round( (   vector.x + 1 ) * window.innerWidth  / 2 );
		vector.y = Math.round( ( - vector.y + 1 ) * window.innerHeight / 2 );
		var ctx=canvas.getContext("2d");
		ctx.beginPath();
		ctx.moveTo(vector.x,vector.y);
		ctx.lineTo((vector.x * 0.8),(vector.y * 0.8) + 20);
		ctx.strokeStyle="#FF0000";
		ctx.stroke();
		var label3 = document.getElementById('a');
		label3.style.left  = (vector.x * 0.8)+'px';
		label3.style.top   = (vector.y * 0.8)+'px';
		
		vector.set(-1.4269804664219996, 0.8598959397784895, 2.1614441023287947);
		vector.project( camera );
		vector.x = Math.round( (   vector.x + 1 ) * window.innerWidth  / 2 );
		vector.y = Math.round( ( - vector.y + 1 ) * window.innerHeight / 2 );
		var ctx=canvas.getContext("2d");
		ctx.beginPath();
		ctx.moveTo(vector.x,vector.y);
		ctx.lineTo((vector.x * 0.8),(vector.y * 0.8) + 20);
		ctx.strokeStyle="#FF0000";
		ctx.stroke();
		var label4 = document.getElementById('vcs');
		label4.style.left  = (vector.x * 0.8)+'px';
		label4.style.top   = (vector.y * 0.8)+'px';
		
		vector.set(-0.2360958679351592, 0.8085302215104377, 2.4726643143975773);
		vector.project( camera );
		vector.x = Math.round( (   vector.x + 1 ) * window.innerWidth  / 2 );
		vector.y = Math.round( ( - vector.y + 1 ) * window.innerHeight / 2 );
		var ctx=canvas.getContext("2d");
		ctx.beginPath();
		ctx.moveTo(vector.x,vector.y);
		ctx.lineTo((vector.x * 1.2),(vector.y * 1.2) + 20);
		ctx.strokeStyle="#FF0000";
		ctx.stroke();
		var label5 = document.getElementById('aoa');
		label5.style.left  = (vector.x * 1.2)+'px';
		label5.style.top   = (vector.y * 1.2)+'px';
	}

	function onWindowResize() {
		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
		controls.handleResize();
		render();
	}
	//
	function animate() {
		requestAnimationFrame( animate );
		// remove render from final version
		//render();
		controls.update();
	}
	//
	function render() {
		renderer.render( scene, camera );
		stats.update();
		redrawLabels();
	}
	
	function onDocumentMouseDown( event ){
		event.preventDefault();
		mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
		raycaster.setFromCamera( mouse, camera );
		var myHeart = scene.getObjectByName('myHeart', true);
		var intersects = raycaster.intersectObject( myHeart, true );
		// raycaster returns an array of intersections [ { distance, point, face, faceIndex, indices, object }, ... ]
		console.log( intersects );
	}