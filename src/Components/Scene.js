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

        // const mapHeight = new THREE.TextureLoader().load( "road-texture.jpg" );

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

Particle.prototype.explode = function(pos, color, scale, radius = 15){
    var _this = this;
    var _p = this.mesh.parent;
    this.mesh.material.color = new THREE.Color(color);
    this.mesh.material.needsUpdate = true;
    this.mesh.scale.set(scale, scale, scale);
    var targetX = pos.x + (-1 + Math.random()*2)*radius;
    var targetY = pos.y + (-1 + Math.random()*2)*radius;
    var targetZ = pos.z + (-1 + Math.random()*2)*radius;
    // var speed = .6+Math.random()*.2;
    gsap.to(this.mesh.rotation, {x:Math.random()*12, y:Math.random()*12, z:Math.random()*12});
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

    generateTiresSmoke(carPos, density){
        var rearLeftWheel = {x: carPos.x + 1.5, y: carPos.y - 1, z: carPos.z + 3};
        var rearRightWheel = {x: carPos.x - 1.5, y: carPos.y - 1, z: carPos.z + 3};
        this.generateSingleParticlesSource(density, rearLeftWheel, "grey", 0.08, 5);
        this.generateSingleParticlesSource(density, rearRightWheel,"grey" , 0.08, 5);

    }

    arrayRange = (start, stop, step) =>
        Array.from(
            { length: (stop - start) / step + 1 },
            (value, index) => start + index * step
        );

    generateSingleParticlesSource(nPArticles, pos, color, scale, radius = 15) {
        for (var i = 0; i < nPArticles; i++) {
            var particle;
            if (particlesPool.length) {
                particle = particlesPool.pop();
            } else {
                particle = new Particle();
            }
            this.mesh.add(particle.mesh);
            particle.mesh.visible = true;
            // var _this = this;
            particle.mesh.position.y = pos.y;
            particle.mesh.position.x = pos.x;
            particle.mesh.position.z = pos.z;
            particle.explode(pos, color, scale, radius);
        }
    }
}

class GameManager {
    constructor(car, scene) {
        this.playing = false;
        this.car = car;
        this.scene = scene;
        this.maxObstacleSpeed = 1.4;
        this.obstacleSpeed = 0.55;
        // this.obstacleSpeed = 0.15;
        this.obstacles = [];
        this.lane = 0;
        this.turning = false;
        this.laneWidth = 6.1;
        this.probability = 0.02;
        this.maxProbability = 0.08;
        this.obstacleDistance = 120;
        this.maxObstacleDistance = 180;
        this.lastBorder = 20;
        this.acceleration = 1;
        this.streak = 0;
        this.maxStreak = 0;

        this.maxVol = 0;
        this.minVol = 0;

        this.lastOrb = 0;
        this.audioStart = 0;
        this.musicDelay = 2300;


        this.stream = "https://cdn.rawgit.com/ellenprobst/web-audio-api-with-Threejs/57582104/lib/TheWarOnDrugs.m4a";
        // this.stream = "coin.mp3";

        var fftSize = 4096;
        // var listener = new THREE.AudioListener();
        this.audio = new THREE.Audio(new THREE.AudioListener());
        this.audio.crossOrigin = "anonymous";

        var audioLoader = new THREE.AudioLoader();
        var _this = this;
        audioLoader.load(this.stream, function (buffer) {
            _this.audio.setBuffer(buffer);
            _this.audio.setLoop(true);
            _this.audio.setVolume(0.01);
            _this.audio.play();
            _this.audioStart = performance.now();
        });

        this.audio2 = new THREE.Audio(new THREE.AudioListener());


        this.audioLoader2 = new THREE.AudioLoader();

        setTimeout(() => {
            _this.audioLoader2.load(_this.stream, function (buffer) {
                _this.audio2.setBuffer(buffer);
                _this.audio2.setLoop(true);
                _this.audio2.setVolume(0.5);
                // console.log(performance.now() - _this.audioStart);
                // _this.audio2.play()
                _this.playUserAudio();
            });
        }, 1900);


        this.audioData = [];
        this.analyser = new THREE.AudioAnalyser(this.audio, fftSize);

        this.analyser.analyser.maxDecibels = -1;
        this.analyser.analyser.minDecibels = -100;
        this.dataArray = this.analyser.data;
        this.getAudioData(this.dataArray);

    }

    playUserAudio() {
        // console.log(performance.now() - this.audioStart);
        if (performance.now() - this.audioStart >= this.musicDelay && !this.audio2.isPlaying && this.audio) {
            this.audio2.play();
            // console.log(performance.now()," start playing");
        } else {
            setTimeout(() => this.playUserAudio(), 100);
        }
    }

    getAudioData(data) {
        // Split array into 3
        var frequencyArray = this.splitFrenquencyArray(data, 4);

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
        var tab = Object.keys(arr).map(function (key) {
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

        setInterval(() => {
            this.update();
            // this.render();
        }, 16);

    }


    checkCollision(obj1, obj2) {
        if (!obj2.isBarrier) {
            let x1 = obj1.position.x;
            let z1 = obj1.position.z;
            let x2 = obj2.position.x;
            let z2 = obj2.position.z;
            let y1 = this.car.chassis.position.y;
            if (this.isJumping && !obj2.isHigh) {
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
        } else {
            let z1 = obj1.position.z;
            let z2 = obj2.position.z;

            return Math.abs(z1 - z2) < 8.5 && this.car.chassis.position.y < 3;
            // let distance = z2 - z1;
            // return distance < 2;
        }
    }

    update() {

        this.analyser.getFrequencyData();

        if (this.obstacleSpeed < this.maxObstacleSpeed) {
            this.obstacleSpeed += 0.05;
        }

        if (this.probability < this.maxProbability) {
            this.probability += 0.00005;
        }

        console.log("Streak", this.streak, "Max Streak:", this.maxStreak);

        this.handleObstacles();

        const handleKeyDown = e => {
            if (!this.turning) {
                e.preventDefault();
                this.turning = true;
                if (e.key === "ArrowLeft") {
                    if (this.lane === -2) {
                        this.turning = false
                        return;
                    }
                    this.lane = this.lane - 1;
                    console.log("go left", this.lane);
                } else if (e.key === "ArrowRight") {
                    if (this.lane === 2) {
                        this.turning = false
                        return;
                    }
                    this.lane = this.lane + 1;
                    console.log("go right", this.lane);
                }

                this.car.mesh.position.x = this.lane * this.laneWidth;

                setTimeout(() => this.turning = false, 100)
            }
        };

        const handleMoveEvent = event => {
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

            if (!this.isJumping) {
                this.car.mesh.rotation.x = Math.max((this.forward - this.car.mesh.position.z) * -0.5, -0.3);
            }
            // this.car.chassis.position.y = map(forward, -6, 9, 9, -1);

            this.car.mesh.position.x = xPos;

            this.acceleration = this.forward - this.car.mesh.position.z;
            this.car.mesh.position.z = this.forward;
            // this.car.mesh.rotation.z = -this.lane * Math.PI/50;

            this.scene.camera.rotation.x = this.map(event.clientY + 50, 0, window.innerHeight, -0.57, -0.63);
            // this.scene.camera.position.z =  map(this.forward, -20, 12, 19, 21);
        }

        const handleMouseMove = event => {
            handleMoveEvent(event)
        };

        const handleTouchMove = event => {
            event.preventDefault();
            handleMoveEvent(event.touches[0])
        };

        const handleTouchClick = event => {
            event.preventDefault();
            if (event.touches.length > 1) {
                handleMouseClick(event);
            }
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
            window.addEventListener('touchstart', handleTouchClick);
            window.addEventListener('touchmove', handleTouchMove);
        }

        this.handleJump();

        this.playing = true;

        return () => window.removeEventListener('mousemove', handleMouseMove);

    }

    map = (value, inMin, inMax, outMin, outMax) => {
        return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
    }

    handleJump() {
        // const maxJump = 7;
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

            this.car.chassis.rotation.x = Math.PI / 2 - Math.atan(v0 * elapsed / this.car.chassis.position.y);

            // check if the car has reached the minimum height
            if (height <= minJump) {
                // reset the car's position to its original position
                this.car.chassis.position.y = minJump;
                this.isJumping = false;
                // this.scene.particlesHolder.spawnParticles(this.car.mesh.position.clone(), 70, "grey", 0.1, false);
                this.scene.particlesHolder.generateTiresSmoke(this.car.mesh.position.clone(), 200);
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
                    // console.log("Hit a barrier");
                    this.streak = 0;
                } else {
                    this.streak += 1;
                    if (this.streak > this.maxStreak) {
                        this.maxStreak = this.streak;
                    }
                }
                obstacle.position.y = Math.sin(performance.now());
                this.scene.remove(obstacle);
                obstacle.hit = true;
                return;
            }

            obstacle.position.z += this.obstacleSpeed;
        });

        this.obstacles.filter(obstacle => obstacle.position.z >= this.lastBorder && !obstacle.hit).forEach(obstacle => {
            this.scene.remove(obstacle)
            if (!obstacle.isBarrier && !obstacle.isBonus) {
                // console.log("Hit!");
                this.streak = 0;
            }
        });

        this.obstacles = this.obstacles.filter(obstacle => obstacle.position.z < this.lastBorder);

        this.generateObstacles();

    }

    generateObstacles() {
        const minOrbTimeDifferenceInMS = 200;
        const maxOrbTimeDifferenceInMS = 1000;
        const bonusHeight = 8;
        const bonusMovement = 1;
        const minBarrierTimeDifferenceInMS = 800;

        if (Math.random() < this.probability && !this.recentBarrier) {
            let obstacle;
            let lane = Math.floor(Math.random() * 5) - 2;

            if (Math.random() < 0.1 && !this.recentBarrier) {
                this.recentBarrier = true;
                setTimeout(() => this.recentBarrier = false, minBarrierTimeDifferenceInMS)

                obstacle = new THREE.Mesh(
                    new THREE.BoxGeometry(roadWidth, 1.5, 4.5),
                    new THREE.MeshPhongMaterial({color: 0xce0000})
                );
                obstacle.isBarrier = true;
                obstacle.color = "red";
                obstacle.position.y = 2.5
                console.log("barrier:", obstacle);

            } else if (Math.random() < 0.1) { //Dispatch bonus orb
                this.recentBarrier = true;
                setTimeout(() => this.recentBarrier = false, minBarrierTimeDifferenceInMS)

                obstacle = new THREE.Mesh(
                    // new THREE.SphereGeometry(1.5, 10, 10),
                    new THREE.TorusKnotGeometry( 1, 1.7, 30, 6, 11, 5 ),
                    new THREE.MeshPhongMaterial(
                        {
                            color: 0xffd700, // golden color
                            shininess: 100, // high shininess for a shiny effect
                            transparent: true,
                            opacity: 0.9,
                            emissive: 0xffd700,
                            emissiveIntensity: 1
                        })
                );
                obstacle.color = "yellow";
                obstacle.isHigh = true;
                obstacle.isBonus = true;
                obstacle.position.x = lane * this.laneWidth;
                obstacle.position.y = bonusHeight;
                var tl = gsap.timeline({yoyo: true});
                tl.to(obstacle.position, {y: bonusHeight + bonusMovement});

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
            }
            if (obstacle) {
                obstacle.position.z = this.car.mesh.position.z - this.obstacleDistance;
                obstacle.castShadow = true;
                obstacle.receiveShadow = true;

                // console.log("new obstacle in: ", obstacle.position.x, obstacle.position.z, obstacle.isBarrier);
                this.obstacles.push(obstacle);
                this.scene.add(obstacle);
            }
        }

            var timeFromLastOrb = performance.now() - this.lastOrb;
            // console.log("timeFromLastOrb", timeFromLastOrb);
            if (timeFromLastOrb > minOrbTimeDifferenceInMS) {
                let obstacle;
                let multiplier = 100 + (this.maxVol - this.minVol) / 10;

                this.getAudioData(this.dataArray);

                if (this.audioData[0] > 0) {
                    this.audioData[0] *= multiplier;
                }

                if (timeFromLastOrb > maxOrbTimeDifferenceInMS && this.maxVol > 300) {
                    this.maxVol = this.maxVol - 300;
                }

                if (this.audioData[0] > this.maxVol) {
                    this.maxVol = this.audioData[0];
                }
                // let lane = Math.floor(this.map(this.audioData[0], this.maxVol * 0.3, this.maxVol, 0.1, 1) * 4) - 2;
                let lane = Math.floor(this.map(this.audioData[0], Math.min(this.audioData[0], this.maxVol * 0.3), this.maxVol, 0.1, 1) * 4) - 2;
                // console.log(this.audioData[0]);

                if (this.audioData[0] >= this.maxVol * 0.65) {
                    // console.log("Vol:", this.audioData[0] / this.maxVol, "%");
                    // console.log(this.audioData[0], Math.min(this.audioData[0], this.maxVol * 0.3), this.maxVol);
                    // console.log(lane);

                    this.lastOrb = performance.now();
                    // this.recentOrb = true;
                    // setTimeout(() => this.recentOrb = false, minOrbTimeDifferenceInMS)

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

    }
}

export default HomePage;