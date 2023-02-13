import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';
import { gsap } from "gsap";
import "./Scene.css"


const roadWidth = 35;
const particlesPool = [];
const initialCameraPosition = {
    z : 20,
    y: 15
}

class Scene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = initialCameraPosition.z;
        // this.camera.position.x = 6;
        this.camera.position.y = initialCameraPosition.y;
        this.camera.rotation.x = -0.6;
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        this.renderer.setSize(window.innerWidth*0.95, window.innerHeight*0.95);

        this.renderer.shadowMap.enabled = true;

        this.scene.fog = new THREE.Fog(0xffb100, -100, 800);

        let roadGeometry = new THREE.PlaneBufferGeometry(roadWidth, 700);

        const mapHeight = new THREE.TextureLoader().load( "road-texture.jpg" );

        let roadMaterial = new THREE.MeshPhongMaterial({
            // color:"0xcccccc",
            transparent:true,
            opacity:0.45,
            color: 0x252525,
            // specular: 0x222222,
            // shininess: 2,
            // bumpMap: mapHeight,
            // bumpScale: -0.01
        });

        let road = new THREE.Mesh(roadGeometry, roadMaterial);

        road.receiveShadow = true;
        road.rotation.x = -Math.PI / 2;
        road.position.y = -2;
        this.scene.add(road);

        this.particlesHolder = new ParticlesHolder();
        this.scene.add(this.particlesHolder.mesh)

        // this.light = new THREE.DirectionalLight(0xffffff, 1);
        // this.light.position.set(0, 10, 10);
        // this.scene.add(this.light);
        // this.scene.add(new THREE.AmbientLight(0x404040));this.

        this.createLights();


        // const skyGeometry = new THREE.SphereGeometry(500, 2, 2);
        // const skyMaterial = new THREE.MeshBasicMaterial({
        //     color: 0x87CEEB, // light blue color for the sky
        //     side: THREE.BackSide
        // });
        // const skySphere = new THREE.Mesh(skyGeometry, skyMaterial);
        // this.scene.add(skySphere);
    }

    hitCamera() {
        // var targetX = this.camera.position.x + (-1 + Math.random()*2)*0.;
        var targetY = this.camera.position.y - (Math.random()) * 3 - 2;
        // var targetZ = this.camera.position.z + (-1 + Math.random()*2)*3;
        var targetZ = initialCameraPosition.z - Math.random() * 3 - 2;
        var targetRotationZ = (-1 + Math.random() *2) * 0.2;
        var targetRotationY = (-1 + Math.random() *2) * 0.1;
        let _this = this;
        gsap.to(this.camera.position, {y:targetY, z:targetZ, ease:"bounce.out", onComplete:function(){
                _this.resetCameraPosition();
            }});
        gsap.to(this.camera.rotation, {y: targetRotationY, z:targetRotationZ, ease:"bounce.out", onComplete:function(){
                _this.resetCameraPosition();
            }});
    }

    cameraJump() {
        // let height = Math.random()*2;
        let height = 4;
        // let startHeight = this.camera.position.y;
        var targetY = this.camera.position.y + height;

        let _this = this;
        gsap.to(this.camera.position, {y:targetY, ease:"power2.out", onComplete:function(){
                gsap.to(_this.camera.position, {y:initialCameraPosition.y, ease:"bounce.out",  duration: 0.6});
                // _this.resetCameraPosition();
            }});
    }

    resetCameraPosition()
    {
        gsap.to(this.camera.position, {y:initialCameraPosition.y, z:initialCameraPosition.z, ease:"power1.out"});
        gsap.to(this.camera.rotation, {y:0, z:0, ease:"power1.out"});
    }

    createLights() {
        // A hemisphere light is a gradient colored light;
        // the first parameter is the sky color, the second parameter is the ground color,
        // the third parameter is the intensity of the light
        let hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)

        // A directional light shines from a specific direction.
        // It acts like the sun, that means that all the rays produced are parallel.
        let shadowLight = new THREE.DirectionalLight(0xffffff, 2);
        // Set the direction of the light
        shadowLight.position.set(-5, 20, -35);

        // Allow shadow casting
        shadowLight.castShadow = true;

        // define the visible area of the projected shadow
        shadowLight.shadow.camera.left = -500;
        shadowLight.shadow.camera.right = 50;
        shadowLight.shadow.camera.top = 100;
        shadowLight.shadow.camera.bottom = -700;
        shadowLight.shadow.camera.near = -500;
        shadowLight.shadow.camera.far = 220;

        // define the resolution of the shadow; the higher the better,
        // but also the more expensive and less performant
        shadowLight.shadow.mapSize.width = 8048;
        shadowLight.shadow.mapSize.height = 8048;

        let ambientLight = new THREE.AmbientLight(0xffffff, .5);
        // to activate the lights, just add them to the scene

        let goldLight = new THREE.DirectionalLight(0xffd700, 1.8);
        // Set the direction of the light
        goldLight.position.set(-50, 10, 10);

        // Allow shadow casting
        shadowLight.castShadow = true;
        this.scene.add(hemisphereLight);
        this.scene.add(shadowLight);

        this.scene.add(goldLight);

        this.scene.add(ambientLight);
    }

    lightenFog() {
        this.scene.fog = new THREE.Fog(0x118843, -150, 100);
    }

    add(object) {
        this.scene.add(object);
    }

    remove(object) {
        this.scene.remove(object);
    }

    render(container) {
        container.appendChild(this.renderer.domElement);
        const animate = () => {
            requestAnimationFrame(animate);
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }
}

class Car {
    constructor(x, y, z) {
        this.mesh = new THREE.Object3D();
        this.chassis = new THREE.Object3D();
        // this.up = 1;
        this.wheels = [];
        this.wheelInitialSpeed = 0.2;
        this.wheelSpeedIncrements = 0.01;

        // Create the body of the car
        const bodyGeometry = new THREE.BoxGeometry(3, 2, 6);
        const material = new THREE.MeshPhongMaterial({ color: 0x680707, shininess: 100  });
        const body = new THREE.Mesh(bodyGeometry, material);
        body.position.set(x, y+0.5, z);
        body.rotation.x = -0.05;

        body.castShadow = true;
        body.receiveShadow = true;

        this.body = body;
        this.chassis.add(body);

        const roofGeometry = new THREE.BoxGeometry(2.6, 2, 4);
        const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x2c0907, shininess: 100 });

        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(x, y+1.2, z+2);
        roof.rotation.x = -0.12;

        this.chassis.add(roof);

        const wheelArchGeometry = new THREE.BoxGeometry(4, 2, 2);

        const frontWheelArch = new THREE.Mesh(wheelArchGeometry, roofMaterial);
        frontWheelArch.position.set(x, y, z-1.5);
        this.chassis.add(frontWheelArch);

        const rearWheelArch = new THREE.Mesh(wheelArchGeometry, roofMaterial);
        rearWheelArch.position.set(x, y, z+3);
        this.chassis.add(rearWheelArch);


        const hoodScoopGeometry = new THREE.BoxGeometry(2, 1, 2);
        const hoodScoop = new THREE.Mesh(hoodScoopGeometry, material);
        hoodScoop.position.set(x, 1.2, z-1.5);
        hoodScoop.rotation.x = -0.2;
        this.chassis.add(hoodScoop);

        this.mesh.add(this.chassis);

        // Add 4 wheels
        // const wheelGeometry = new THREE.CylinderGeometry(1, 1, 1, 16);
        const wheelGeometry = new THREE.TorusGeometry( 0.8, 1, 15, 9 );
        const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x151515, shininess: 10 });
        const frontLeftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        frontLeftWheel.position.set(x - 1.5, y - 1, z - 2);
        frontLeftWheel.rotation.z = Math.PI / 2;
        frontLeftWheel.rotation.y = Math.PI / 2;

        this.wheels.push(frontLeftWheel);
        this.mesh.add(frontLeftWheel);

        const frontRightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        frontRightWheel.position.set(x + 1.5, y - 1, z - 2);
        frontRightWheel.rotation.z = Math.PI / 2;
        frontRightWheel.rotation.y = Math.PI / 2;

        this.wheels.push(frontRightWheel);
        this.mesh.add(frontRightWheel);

        const rearLeftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        rearLeftWheel.position.set(x - 1.5, y - 1, z + 3);
        rearLeftWheel.rotation.z = Math.PI / 2;
        rearLeftWheel.rotation.y = Math.PI / 2;

        this.wheels.push(rearLeftWheel);
        this.mesh.add(rearLeftWheel);

        const rearRightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        rearRightWheel.position.set(x + 1.5, y - 1, z + 3);
        rearRightWheel.rotation.z = Math.PI / 2;
        rearRightWheel.rotation.y = Math.PI / 2;

        this.wheels.push(rearRightWheel);
        this.mesh.add(rearRightWheel);

        this.wheels.forEach(wheel =>  wheel.castShadow = true);

        setInterval(()=>this.moveBody(), 60)
    }

    moveBody() {
        this.mesh.position.y = Math.random() * 0.25 -0.15;
        this.wheels.forEach(wheel => {
            wheel.rotation.x -= this.wheelInitialSpeed + this.wheelSpeedIncrements;
            this.wheelSpeedIncrements += 0.0005;
        })
    }

}

const HomePage = () => {
    const containerRef = useRef(null);
    useEffect(() => {
        const scene = new Scene();
        const car = new Car(0, 0.05,0 );
        scene.add(car.mesh);
        scene.render(containerRef.current);
        const manager = new GameManager(car, scene);
        manager.start();
    }, []);

    return (
        <div>
            {/*<h1>REACTion</h1>*/}
            <div className={"world"} ref={containerRef} />
        </div>
    );
};

function Particle (){
    var geom = new THREE.TetrahedronGeometry(2,0);
    var mat = new THREE.MeshPhongMaterial({
        color:0x009999,
        shininess:50,
        specular:0xffffff,
        flatShading :true

    });
    this.mesh = new THREE.Mesh(geom,mat);
}

Particle.prototype.explode = function(pos, color, scale){
    var _this = this;
    var _p = this.mesh.parent;
    this.mesh.material.color = new THREE.Color(color);
    this.mesh.material.needsUpdate = true;
    this.mesh.scale.set(scale, scale, scale);
    var targetX = pos.x + (-1 + Math.random()*2)*15;
    var targetY = pos.y + (-1 + Math.random()*2)*15;
    var targetZ = pos.z + (-1 + Math.random()*2)*15;
    // var speed = .6+Math.random()*.2;
    gsap.to(this.mesh.rotation, {x:Math.random()*12, y:Math.random()*12});
    gsap.to(this.mesh.scale, {x:.05, y:.05, z:.05});
    gsap.to(this.mesh.position, {x:targetX, y:targetY, z:targetZ, delay:Math.random() *.1, ease:"power1.out", onComplete:function(){
            if(_p) _p.remove(_this.mesh);
            _this.mesh.scale.set(1,1,1);
            particlesPool.unshift(_this);
        }});
}

class ParticlesHolder {
    constructor(x, y, z) {
    this.mesh = new THREE.Object3D();
    this.particlesInUse = [];
    this.particlesBarrierDefinition = 2;
    this.xPositions = this.arrayRange(-roadWidth / 2 - 5, roadWidth / 2 + 5, roadWidth / this.particlesBarrierDefinition)
    }

    spawnParticles(pos, density, color, scale, isBarrier){
        var nPArticles = density;
        if (!isBarrier) {
            this.generateSingleParticlesSource(nPArticles, pos, color, scale);
        }
        else{
            var positions = this.xPositions.map(x => {
                return {
                    x: x,
                    y: pos.y,
                    z: pos.z
                }
            });
            positions.forEach(position => {
                this.generateSingleParticlesSource(nPArticles * 2, position, color, scale);
            })
        }
    }

    generateSmoke(pos, density){

    }

    arrayRange = (start, stop, step) =>
        Array.from(
            { length: (stop - start) / step + 1 },
            (value, index) => start + index * step
        );

    generateSingleParticlesSource(nPArticles, pos, color, scale) {
        for (var i = 0; i < nPArticles; i++) {
            var particle;
            if (particlesPool.length) {
                particle = particlesPool.pop();
            } else {
                particle = new Particle();
            }
            this.mesh.add(particle.mesh);
            particle.mesh.visible = true;
            var _this = this;
            particle.mesh.position.y = pos.y;
            particle.mesh.position.x = pos.x;
            particle.mesh.position.z = pos.z;
            particle.explode(pos, color, scale);
        }
    }
}

class GameManager {
    constructor(car, scene) {
        this.playing = false;
        this.car = car;
        this.scene = scene;
        this.maxObstacleSpeed = 1.6;
        this.obstacleSpeed = 0.65;
        // this.obstacleSpeed = 0.15;
        this.obstacles = [];
        this.lane = 0;
        this.turning = false;
        this.laneWidth = 6.1;
        this.probability = 0.02;
        this.maxProbability = 0.08;
        this.obstacleDistance = 70;
        this.maxObstacleDistance = 120;
        this.lastBorder = 20;
        this.acceleration = 1;
        this.streak = 0;
        this.maxStreak = 0;

        this.up = 1;


        // this.audio = new Audio();
        // this.audio.src = "coin.mp3";
        // this.audio.controls = false;
        // this.audio.loop = false;
        // this.audio.autoplay = false;

        var stream = "https://cdn.rawgit.com/ellenprobst/web-audio-api-with-Threejs/57582104/lib/TheWarOnDrugs.m4a";
        var fftSize = 2048;
        // var listener = new THREE.AudioListener();
        var audio = new THREE.Audio(new THREE.AudioListener());
        audio.crossOrigin = "anonymous";

        var audioLoader = new THREE.AudioLoader();
        audioLoader.load(stream, function(buffer) {
            audio.setBuffer(buffer);
            audio.setLoop(true);
            audio.setVolume(0.001);
            audio.play();
        });

        var audio2 = new THREE.Audio(new THREE.AudioListener());

        var audioLoader2 = new THREE.AudioLoader();
        setTimeout(() => {
            audioLoader2.load(stream, function(buffer) {
                audio2.setBuffer(buffer);
                audio2.setLoop(true);
                audio2.setVolume(0.5);
                audio2.play()
            });
        }, 1800);



        this.audioData = [];
        this.analyser = new THREE.AudioAnalyser(audio, fftSize);

        this.analyser.analyser.maxDecibels = -3;
        this.analyser.analyser.minDecibels = -100;
        this.dataArray = this.analyser.data;
        this.getAudioData(this.dataArray);

        // document.body.appendChild(audio);
        //
        // this.audioContext = new (window.AudioContext)();
        // this.source = this.audioContext.createMediaElementSource(this.audio);
        // this.analyser = this.audioContext.createAnalyser();
        // this.source.connect(this.analyser);
        // this.analyser.connect(this.audioContext.destination);
    }


    getAudioData(data) {
        // Split array into 3
        var frequencyArray = this.splitFrenquencyArray(data, 3);

        // Make average of frenquency array entries
        for (var i = 0; i < frequencyArray.length; i++) {
            var average = 0;

            for (var j = 0; j < frequencyArray[i].length; j++) {
                average += frequencyArray[i][j];
            }
            this.audioData[i] = average / frequencyArray[i].length;
        }
        return this.audioData;
    }

    splitFrenquencyArray(arr, n) {
        var tab = Object.keys(arr).map(function(key) {
            return arr[key];
        });
        var len = tab.length,
            result = [],
            i = 0;

        while (i < len) {
            var size = Math.ceil((len - i) / n--);
            result.push(tab.slice(i, i + size));
            i += size;
        }

        return result;
    }

    start() {
        // this.audio = new Audio();
        // this.audio.src = "coin.MP3";
        // this.audio.controls = true;
        // this.audio.loop = false;
        // this.audio.autoplay = false;
        // document.body.appendChild(this.audio);
        setInterval(() => {
            this.update();
            // this.render();
        }, 16);

    }



    checkCollision(obj1, obj2) {
        if(!obj2.isBarrier) {
            let x1 = obj1.position.x;
            let z1 = obj1.position.z;
            let x2 = obj2.position.x;
            let z2 = obj2.position.z;
            let y1 = this.car.chassis.position.y;
            if (this.isJumping && !obj2.isHigh){
                y1 = 0.5;
            }
            let y2 = obj2.position.y;
            let distance = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2 + (y2 - y1) ** 2);
            let hit = distance < 4.5
            // if (hit){
            //     if (this.audio.is){
            //         this.audio.stop();
            //     }
            //     this.audio.play();
            // }
            return hit;
        }
        else{
            let z1 = obj1.position.z;
            let z2 = obj2.position.z;

            return Math.abs(z1-z2) < 8.5 && this.car.chassis.position.y < 3;
            // let distance = z2 - z1;
            // return distance < 2;
        }
    }

    update() {
        this.analyser.getFrequencyData();
        // console.log(this.car);
        // this.car.mesh.position.z -= this.speed;
        // this.scene.camera.position.z-=this.speed;

        if (this.obstacleSpeed < this.maxObstacleSpeed) {
            this.obstacleSpeed += 0.05;
        }

        if (this.probability < this.maxProbability) {
            this.probability += 0.00005;
        }

        // console.log("Streak",this.streak, "Max Streak:", this.maxStreak);

        this.handleObstacles();

        const handleKeyDown = e => {
            if (!this.turning) {
                e.preventDefault();
                this.turning = true;
                if (e.key === "ArrowLeft") {
                    if (this.lane === -2){
                        this.turning=false
                        return;
                    }
                    this.lane = this.lane - 1;
                    console.log("go left", this.lane);
                } else if (e.key === "ArrowRight") {
                    if (this.lane === 2) {
                        this.turning=false
                        return;
                    }
                    this.lane = this.lane + 1;
                    console.log("go right", this.lane);
                }

                this.car.mesh.position.x = this.lane * this.laneWidth;

                setTimeout(()=>this.turning=false, 100)
            }
        };

        const handleMouseMove = event => {
            const maxMoveX = 13.2;
            const minMoveX = -maxMoveX;

            this.lane = this.map(event.clientX + 30, window.innerWidth * 0.3, window.innerWidth * 0.7, -1.2, 1.2);
            // console.log(this.lane)
            this.forward = this.map(event.clientY + 100, 0, window.innerHeight, -20, 12);
            let xPos = this.lane * (this.laneWidth * 1.1)

            if (xPos <= minMoveX) {
                xPos = minMoveX;
            }
            if (xPos >= maxMoveX) {
                xPos = maxMoveX;
            }

            this.car.chassis.rotation.z = (xPos - this.car.mesh.position.x) * -0.4;
            this.car.mesh.rotation.y = Math.min(Math.max(xPos - this.car.mesh.position.x, -0.15), 0.1) * -0.8;

            if (!this.isJumping){
                this.car.mesh.rotation.x = Math.max((this.forward - this.car.mesh.position.z) * -0.5, -0.3);
            }
            // this.car.chassis.position.y = map(forward, -6, 9, 9, -1);

            this.car.mesh.position.x = xPos;

            this.acceleration = this.forward - this.car.mesh.position.z;
            this.car.mesh.position.z = this.forward;
            // this.car.mesh.rotation.z = -this.lane * Math.PI/50;

            this.scene.camera.rotation.x =  this.map(event.clientY + 50, 0, window.innerHeight, -0.57, -0.63);
            // this.scene.camera.position.z =  map(this.forward, -20, 12, 19, 21);


        };

        const handleMouseClick = event => {

            if (!this.isJumping) {
                // console.log("jumping");
                this.scene.cameraJump();
                this.isJumping = true;
                this.jumpStart = performance.now();
                // setTimeout(() => this.isJumping = false, 1000);
            }
        };


        if (!this.playing) {
            window.addEventListener("keydown", handleKeyDown);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mousedown', handleMouseClick);
        }

        this.handleJump();

        this.playing = true;

        return () => window.removeEventListener('mousemove', handleMouseMove);

    }

    map = (value, inMin, inMax, outMin, outMax) => {
        return ((value - inMin) / (inMax - inMin)) * (outMax - outMin)  + outMin ;
    }

    handleJump() {
        const maxJump = 7;
        const minJump = 0;

        // let momentum = Math.max(0, this.acceleration);
        // let momentumBoost = 0;

        if (this.isJumping) {
            let v0 = 47;
            // let v0 = 47 + (momentum * momentumBoost); //
            let g = -109.8;
            let elapsed = (performance.now() - this.jumpStart) / 1000;

            // calculate the current height using the equations of motion
            let height = v0 * elapsed + 0.5 * g * (elapsed ** 2);

            this.car.chassis.rotation.x = Math.PI/2 - Math.atan(v0 * elapsed / this.car.chassis.position.y);

            // check if the car has reached the minimum height
            if (height <= minJump) {
                // reset the car's position to its original position
                this.car.chassis.position.y = minJump;
                this.isJumping = false;
                this.scene.particlesHolder.spawnParticles(this.car.mesh.position.clone(), 70, "grey", 0.1, false);
                // this.scene.particlesHolder.spawnParticles(this.car.mesh.position.clone(), 20, "grey", 0.2, false);

                return;
            }

            // update the car's position with the current height
            this.car.chassis.position.y = height;

        }
    }

    handleObstacles() {
        if (this.obstacleDistance < this.maxObstacleDistance) {
            this.obstacleDistance += 0.1;
        }

        // console.log(this.probability);
        // console.log(this.obstacles.length);

        this.obstacles.forEach((obstacle) => {
            // console.log(this.car.chassis)
            if (!obstacle.hit && obstacle.position.z > -50 && this.checkCollision(this.car.mesh, obstacle)) {
                // console.log("Hit!");
                this.scene.particlesHolder.spawnParticles(obstacle.position.clone(), 40, obstacle.color, 0.6, obstacle.isBarrier);

                if (obstacle.isBarrier) {
                    this.scene.hitCamera();
                    console.log("Hit a barrier");
                    this.streak = 0;
                }
                else{
                    this.streak += 1;
                    if (this.streak > this.maxStreak){
                        this.maxStreak = this.streak;
                    }
                }

                this.scene.remove(obstacle);
                obstacle.hit = true;
                return;
            }

            obstacle.position.z += this.obstacleSpeed;
        });

        this.obstacles.filter(obstacle => obstacle.position.z >= this.lastBorder && !obstacle.hit).forEach(obstacle => {
            this.scene.remove(obstacle)
            if (!obstacle.isBarrier) {
                console.log("Not a barrier");
                this.streak = 0;
            }
        });

        this.obstacles = this.obstacles.filter(obstacle => obstacle.position.z < this.lastBorder);

        this.generateObstacles();

    }

    generateObstacles() {
        const minOrbTimeDifferenceInMS = 200;
        const minBarrierTimeDifferenceInMS = 800;

        if (Math.random() < this.probability && !this.recentBarrier) {
            let obstacle;
            let lane = Math.floor(Math.random() * 5) - 2;

            if (Math.random() < 0.1 && !this.recentBarrier)
            {
                this.recentBarrier = true;
                setTimeout(()=> this.recentBarrier = false, minBarrierTimeDifferenceInMS)

                obstacle = new THREE.Mesh(
                    new THREE.BoxGeometry(roadWidth, 1.5, 4.5),
                    new THREE.MeshPhongMaterial({color: 0xce0000})
                );
                obstacle.isBarrier = true;
                obstacle.color = "red";
                obstacle.position.y = 2.5
            }

            else if (Math.random() < 0.1 )
            {
                this.recentBarrier = true;
                setTimeout(()=> this.recentBarrier = false, minBarrierTimeDifferenceInMS)

                obstacle = new THREE.Mesh(
                    new THREE.SphereGeometry(1.5, 10, 10),
                    new THREE.MeshPhongMaterial(
                        {
                            color: 0xffd700, // golden color
                            shininess: 100, // high shininess for a shiny effect
                            transparent: true,
                            opacity: 0.9
                        })
                );
                obstacle.color = "yellow";
                obstacle.isHigh = true;
                obstacle.position.x = lane * this.laneWidth;
                obstacle.position.y = 8;
            }
            //
            // else{
            //     obstacle = new THREE.Mesh(
            //         new THREE.SphereGeometry(1.5, 10, 10),
            //         new THREE.MeshPhongMaterial({color: 0x00ff00})
            //     );
            //     obstacle.isBarrier = false;
            //     obstacle.color = "green";
            //     obstacle.position.x = lane * this.laneWidth;
            // }
            if (obstacle) {
                obstacle.position.z = this.car.mesh.position.z - this.obstacleDistance;
                obstacle.castShadow = true;
                obstacle.receiveShadow = true;

                // console.log("new obstacle in: ", obstacle.position.x, obstacle.position.z)
                this.obstacles.push(obstacle);
                this.scene.add(obstacle);
            }
        }



        if (!this.recentOrb) {
            this.recentOrb = true;
            setTimeout(() => this.recentOrb = false, minOrbTimeDifferenceInMS)
            let obstacle;
            let lane = Math.floor(this.map(this.audioData[0] ,30, 170, 0.1, 1) * 4) - 2;
            this.getAudioData(this.dataArray);
            this.audioData[0] *= 150
            console.log(this.audioData[0]);

            if (this.audioData[0] >= 90 ) {
                this.recentOrb = true;
                setTimeout(() => this.recentOrb = false, minOrbTimeDifferenceInMS)

                obstacle = new THREE.Mesh(
                    new THREE.SphereGeometry(1.5, 10, 10),
                    new THREE.MeshPhongMaterial({color: 0x00ff00})
                );
                obstacle.isBarrier = false;
                obstacle.color = "green";
                obstacle.position.x = lane * this.laneWidth;

                obstacle.position.z = this.car.mesh.position.z - this.obstacleDistance;
                obstacle.castShadow = true;
                obstacle.receiveShadow = true;
                this.obstacles.push(obstacle);
                this.scene.add(obstacle);
            }
        }

        // create stars
        if (this.audioData[0] >= 100) {
            // console.log("Beat");
        }

    }

//
    // render() {
    //     this.renderer.render(this.scene, this.camera);
    // }
}

export default HomePage;