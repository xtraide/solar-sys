import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as TWEEN from '@tweenjs/tween.js';
import { getFresnelMat } from '../../../assets/src/getFresnelMat';
import getStarfield from '../../../assets/src/getStarfield';


const Intro = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const textureLoader = new THREE.TextureLoader();
        const detail = 12;

        // Échelle : 1 unité = 1 000 km
        /* const scale = 1000;
         const reducedScale = 10;*/

        const earthDiameter = 12.742; // Diamètre de la Terre en unités
        const earthRotationSpeed = 0.001 // Rotation sur elle-même
        const earthGeometry = new THREE.IcosahedronGeometry(earthDiameter / 2, detail);

        const moonDiameter = 3.474;
        const moonRotationSpeed = -0.004;
        const moonGeometry = new THREE.IcosahedronGeometry(moonDiameter / 2, detail);
        const moonOrbitSpeed = 0.001;
        const moonOrbitRadius = 38.4;

        let aspect = window.innerWidth / window.innerHeight;
        let insetWidth = 0, insetHeight = 0;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        const renderer = new THREE.WebGLRenderer({ canvas });
        renderer.setSize(window.innerWidth, window.innerHeight);

        const ambientLight = new THREE.AmbientLight(0xffffff);
        scene.add(ambientLight);


        /* const gridHelper = new THREE.GridHelper(200, 50);
        scene.add(gridHelper);*/

        const stars = getStarfield({ numStars: 2000 });
        scene.add(stars);

        /**
         * Terre
         */
        const earthGroup = new THREE.Group();
        earthGroup.scale.set(1, 1, 1);
        earthGroup.position.set(0, 0, 0);
        scene.add(earthGroup);

        const materialearth = new THREE.MeshPhongMaterial({
            map: textureLoader.load("./textures/earth/earth_10k.jpg"),
            bumpMap: textureLoader.load("./textures/earth/earth_topo_10k.jpg"),
            bumpScale: 0.04,
        });

        const earth = new THREE.Mesh(earthGeometry, materialearth);
        earthGroup.add(earth);

        const cloudsMat = new THREE.MeshBasicMaterial({
            map: textureLoader.load("/textures/earth/earth_clouds_active2.png"),
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const cloudsMesh = new THREE.Mesh(earthGeometry, cloudsMat);
        cloudsMesh.scale.setScalar(1.006);
        earthGroup.add(cloudsMesh);

        const fresnelMat = getFresnelMat();
        const glowMesh = new THREE.Mesh(earthGeometry, fresnelMat);
        glowMesh.scale.setScalar(1.008);
        earthGroup.add(glowMesh);

        /**
         * Lune
         */

        const moonGroup = new THREE.Group();
        scene.add(moonGroup);

        const moon = new THREE.Mesh(
            moonGeometry,
            new THREE.MeshPhongMaterial({
                map: textureLoader.load("./textures/earth/moon/moon_4k.jpg"),
                bumpMap: textureLoader.load("./textures/earth/moon/moon_topo_4k.jpg"),
                bumpScale: 0.002,
            })
        );
        moonGroup.add(moon);




        const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        camera.position.z = 15;
        camera.position.y = 7;
        camera.position.x = 9;
        camera.lookAt(earthGroup.position.x, earthGroup.position.y, earthGroup.position.z);
        scene.add(camera);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0.5, 0);
        controls.update();



        function animate() {
            requestAnimationFrame(animate);
            TWEEN.update();

            // Rotation de la Terre sur elle-même
            earthGroup.rotation.y += earthRotationSpeed;

            moonGroup.rotation.y += moonRotationSpeed;

            // Orbite de la Lune autour de la Terre

            const moonX = moonOrbitRadius * Math.cos(moonOrbitSpeed * Date.now());
            const moonZ = moonOrbitRadius * Math.sin(moonOrbitSpeed * Date.now());
            moonGroup.position.set(earthGroup.position.x + moonX, 0, earthGroup.position.z + moonZ);
            moonGroup.rotation.y += moonOrbitSpeed;

            renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
            renderer.render(scene, camera);
            renderer.clearDepth();
            renderer.setScissorTest(true);
            renderer.setScissor(
                window.innerWidth - insetWidth - 16,
                window.innerHeight - insetHeight - 16,
                insetWidth,
                insetHeight
            );
            renderer.setViewport(
                window.innerWidth - insetWidth - 16,
                window.innerHeight - insetHeight - 16,
                insetWidth,
                insetHeight
            );
            renderer.setScissorTest(false);
        }

        function resize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        window.addEventListener("resize", resize);
        resize();
        animate();

        return () => {
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <div>
            <h1>Nicolas thieblemont</h1>
            <canvas ref={canvasRef} />
        </div>
    );
}
export default Intro;
