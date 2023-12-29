"use strict"

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass  } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { BloomPass  } from "three/examples/jsm/postprocessing/BloomPass.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

class Axial3DViewer extends AxialComponentBase
{

    /// THREE
    /** @type { Number } */
    #wi = 0;

    /** @type { Number } */
    #hi = 0;

    /** @type { THREE.Scene } */
    #scene;

    /** @type { THREE.PerspectiveCamera } */
    #camera;

    /** @type { THREE.WebGLRenderer } */
    #renderer;

    /** @type { THREE.AmbientLight } */
    #ambLight;

    /** @type { THREE.AmbientLight } */
    #dirLight;

    /** @type { GLTFLoader } */
    #loader;

    /** @type { THREE.Object3D } */
    #gltf;

    /** @type { THREE.Object3D } */
    #model;

    /** @type { THREE.Mesh } */
    #cube;

    /** @type { THREE.Group } */
    #group;

    /// vars
    /** @type { Number } */
    #rotationY = 0;

    /** @type { Number } */
    #rotationX = 0;

    /** @type { Number } */
    #rotationStep = 0.1;

    // effect composer
    /** @type { EffectComposer } */
    #composer;

    /** @type { Boolean } */
    #useComposer = false;


    /// control
    /** @type { Boolean } */
    #useKeyboard = false;

    /** @type { Boolean } */
    #usePointers = false;


    /** @type { Function } */
    #boundAnimate;

    // handlers
    /** @type { Function } */
    #boundLoadSuccess;

    /** @type { Function } */
    #boundKeyDownHandler;

    /** @type { Function } */
    #boundPointerDown3DHandler;

    /** @type { Function } */
    #boundPointerMove3DHandler;

    /** @type { Function } */
    #boundPointerUp3DHandler;

    constructor()
    {
        super();
        this.classList.add("axial_3d_viewer");

        this.#boundAnimate = this.#animate.bind(this);
        this.#boundLoadSuccess = this.#loadSucces.bind(this);

        this.#boundKeyDownHandler = this.#keyDownHandler.bind(this);

        this.#boundPointerDown3DHandler = this.#pointerDown3DHandler.bind(this);
        this.#boundPointerMove3DHandler = this.#pointerMove3DHandler.bind(this);
        this.#boundPointerUp3DHandler = this.#pointerUp3DHandler.bind(this);
    }

    /**
     * Add or remove Keyboard control
     * @type { Boolean }
     */
    get useKeyboard() { return this.#useKeyboard; }
    set useKeyboard( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( this.#useKeyboard === value ) { return; }
        this.#useKeyboard = value;
        this.#useKeyboard === true ? document.addEventListener("keydown", this.#boundKeyDownHandler) : document.removeEventListener("keydown", this.#boundKeyDownHandler); 
    }

    /**
     * Add or remove Mouse and Touch control
     * @type { Boolean }
     */
    get usePointers() { return this.#usePointers; }
    set usePointers( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( this.#usePointers === value ) { return; }
        this.#usePointers = value;
        if( this.usePointers === true )
        {
            this.addEventListener("pointermove", this.#boundPointerMove3DHandler);
        }
        else
        {
            this.removeEventListener("pointermove", this.#boundPointerMove3DHandler);
        }
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#buildComponent();
    }

    #buildComponent()
    {
        this.#wi = this.clientWidth;
        this.#hi = this.clientHeight;

        this.#scene = new THREE.Scene();

        this.#camera = new THREE.PerspectiveCamera(60, this.#wi / this.#hi, 0.01, 10);
        
        //this.#camera.position.x = 3;
        this.#camera.position.z = 0.3;
        //this.#camera.lookAt(0, 0, 0);

        this.#renderer = new THREE.WebGLRenderer( { alpha: true } );
        this.#renderer.domElement.classList.add("axial_3d_viewer-canvas");
        this.#renderer.setPixelRatio(window.devicePixelRatio);
        this.#renderer.setSize(this.#wi, this.#hi);
        this.appendChild(this.#renderer.domElement);

        // group
        this.#group = new THREE.Group();
        this.#scene.add( this.#group );

        // light
        this.#dirLight = new THREE.DirectionalLight( 0xffffff, 3);
        this.#dirLight.position.set( -2, 2, 4);
        this.#scene.add( this.#dirLight );

        this.#loader = new GLTFLoader();
        this.#loader.load( "../assets/supervision.glb", this.#boundLoadSuccess );

        /*
        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshStandardMaterial();
        this.#cube = new THREE.Mesh( geometry, material );
        this.#scene.add( this.#cube );
        */

        // effects
        const renderPass = new RenderPass( this.#scene, this.#camera );
        //const unrealBloomPass = new UnrealBloomPass(150, 1, 1, 1);
        const bloomPass = new BloomPass(1, 25, 4);
        const filmPass = new FilmPass( 1, 0.5 );
        const outputPass = new OutputPass();
        
        // composer
        this.#composer = new EffectComposer( this.#renderer );
        this.#composer.addPass( renderPass );
        //this.#composer.addPass( unrealBloomPass );
        this.#composer.addPass( bloomPass );
        this.#composer.addPass( filmPass );
        this.#composer.addPass( outputPass );
        
        //this.#start();
        
    }

    #start()
    {
        window.requestAnimationFrame( this.#boundAnimate );
    }

    #animate( ts )
    {
        //console.log(ts);
        const time = ts * 0.001;

        this.#wi = this.clientWidth;
        this.#hi = this.clientHeight;

        this.#renderer.setSize(this.#wi, this.#hi);
        
        this.#camera.aspect = this.#wi / this.#hi;
        this.#camera.updateProjectionMatrix();

        /*
        if( this.#cube )
        {
            this.#cube.rotation.x = time;
            this.#cube.rotation.y = time;
            this.#cube.rotation.z = time;
        }
        */

        
        if( this.#model )
        {
            //this.#group.rotation.y = time;
            this.#group.rotation.y = this.#rotationY;
            this.#group.rotation.x = this.#rotationX;   
        }
        
        
        //this.#renderer.render( this.#scene, this.#camera );
        this.#composer.render();
        
        
        window.requestAnimationFrame( this.#boundAnimate );
    }

    #loadSucces( gltf )
    {
        console.log(gltf);
        this.#gltf = gltf;
        this.#initViewer();
    }

    #initViewer()
    {
        this.#model = this.#gltf.scene || this.#gltf.scenes[0];

        const box = new THREE.Box3().setFromObject( this.#model );
        box.getCenter(this.#model.position);
        this.#model.position.multiplyScalar(-1);
        const size = box.getSize( new THREE.Vector3() );
        console.log(size);
        

        //this.#model.position.x = -1;
        //model.position.y += center.y / 2;
        //model.position.z += -center.z / 2;

        //this.#camera.position.copy(center);
        //console.log(this.#camera.position.z);
        //this.#camera.position.z += size / 1.5;
        //this.#camera.position.z = 1;

        //this.#camera.lookAt(center);

        const cameraZ = size.z * 11;
        console.log(cameraZ);

        //this.#camera.position.z = cameraZ;
        //this.#camera.updateProjectionMatrix();

        this.#group.add(this.#model);

        this.#start();
    }

    /**
     * Manage rotation with the keys
     * @param { KeyboardEvent } event 
     */
    #keyDownHandler( event )
    {
        console.log(event.key);
        const key = event.key;
        switch( key )
        {
            case "ArrowLeft":
                this.#rotationY -= this.#rotationStep;
            break;

            case "ArrowRight":
                this.#rotationY += this.#rotationStep;
            break;

            case "ArrowUp":
                this.#rotationX -= this.#rotationStep;
            break;

            case "ArrowDown":
                this.#rotationX += this.#rotationStep;
            break;

            default:
            break;
        }
    }

    /**
     * Manage the behaviour of the #group with mouse or fingers
     * @param { PointerEvent } event 
     */
    #pointerDown3DHandler( event )
    {
        const pointerType = event.pointerType;
    }

    /**
     * Manage the behaviour of the #group with mouse or fingers
     * @param { PointerEvent } event 
     */
    #pointerMove3DHandler( event )
    {
        const pointerType = event.pointerType;
        
        const ww = window.innerWidth;
        const wh = window.innerHeight;

        const cx = ww / 2;
        const cy = wh / 2;

        switch( pointerType )
        {
            case "mouse":
                //console.log(event);

                const px = event.pageX;
                const dx = px - cx;
                //console.log(dx);
                const percentX = dx / cx;
                console.log(percentX);

                this.#rotationY = (Math.PI / 2) * percentX;
            break;

            default:
            break;
        }
    }

    /**
     * Manage the behaviour of the #group with mouse or fingers
     * @param { PointerEvent } event 
     */
    #pointerUp3DHandler( event )
    {
        const pointerType = event.pointerType;
    }

    

}

window.customElements.define("axial-3d-viewer", Axial3DViewer);
export { Axial3DViewer }