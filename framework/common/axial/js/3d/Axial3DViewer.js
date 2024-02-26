"use strict"

import { AxialComponentBase } from "../core/AxialComponentBase.js";

import * as THREE from "three";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { Pass } from "three/examples/jsm/postprocessing/Pass.js";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";

//import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

import GUI from "lil-gui";


class Axial3DViewer extends AxialComponentBase
{
    /** @type { Number } */
    #wi;

    /** @type { Number } */
    #hi;

    /** @type { Boolean } */
    #isReady = false;

    /** @type { Boolean } */
    #useComposer = false;

    /** @type { Boolean } */
    #useControls = false;

    /** @type { HTMLCanvasElement } */
    #canvas;

    /** @type { THREE.Scene } */
    #scene;

    /** @type { THREE.PerspectiveCamera } */
    #camera;

    /** @type { THREE.Group } */
    #cameraGroup;

    /** @type { THREE.WebGLRenderer } */
    #renderer;

    /** @type { THREE.LoadingManager } */
    #loadingManager;

    /** @type { THREE.Clock } */
    #clock;

    /** @type { OrbitControls } */
    #controls;

    /** @type { EffectComposer } */
    #composer;

    /** @type { RenderPass } */
    #renderPass;

    /** @type { Array } */
    #composerPasses; // unused but could be later

    /** @type { GUI } */
    #gui;

    // ANIMATION LOOP
    /** @type { Function } */
    #boundAnimate;

    /** @type { Function } */
    #boundLoadStartHandler;

    /** @type { Function } */
    #boundLoadProgressHandler;

    /** @type { Function } */
    #boundLoadCompleteHandler;

    /** @type { Function } */
    #boundLoadErrorHandler;

    /** @type { THREE.TextureLoader } */
    #textureLoader;

    /** @type { RGBELoader } */
    #rgbeLoader;

    /** @type { GLTFLoader } */
    #gltfLoader;

    /** @type { DRACOLoader } */
    #dracoLoader;

    /** @type { String } */
    #dracoDecoderPath;

    /** @type { FontLoader } */
    #fontLoader;

    /** @type { Function } */
    #boundTextureLoadCompleteHandler;

    /** @type { Function } */
    #boundRgbeLoadCompleteHandler;

    /** @type { Function } */
    #boundGltfLoadCompleteHandler;

    /** @type { Function } */
    #boundFontLoadCompleteHandler;

    /// POINTERS
    /** @type { Boolean } */
    #usePointers = false;

    /** @type { Function } */
    #boundPointerMove3DHandler;

    constructor()
    {
        super();

        // axial
        this.classList.add("axial_3d_viewer");
        this.template = "axial-3d-viewer-template";
        this.isResizable = true;

        // three rendering
        this.#boundAnimate = this.#animate.bind(this);

        // pointers
        this.#boundPointerMove3DHandler = this.#pointerMove3DHandler.bind(this);

        // loading manager
        this.#boundLoadStartHandler    = this.#loadStartHandler.bind(this);
        this.#boundLoadProgressHandler = this.#loadProgressHandler.bind(this);
        this.#boundLoadCompleteHandler = this.#loadCompleteHandler.bind(this);
        this.#boundLoadErrorHandler    = this.#loadErrorHandler.bind(this);

        this.#loadingManager = new THREE.LoadingManager();
        this.#loadingManager.onStart    = this.#boundLoadStartHandler;
        this.#loadingManager.onProgress = this.#boundLoadProgressHandler;
        this.#loadingManager.onLoad     = this.#boundLoadCompleteHandler;
        this.#loadingManager.onError    = this.#boundLoadErrorHandler;

        // texture loader
        this.#boundTextureLoadCompleteHandler = this.#textureLoadCompleteHandler.bind(this);
        this.#textureLoader = new THREE.TextureLoader( this.#loadingManager );

        // rgbe loader
        this.#boundRgbeLoadCompleteHandler = this.#rgbeLoadCompleteHandler.bind(this);
        this.#rgbeLoader = new RGBELoader( this.#loadingManager );

        // draco loader
        this.#dracoLoader = new DRACOLoader();

        // gltf loader
        this.#boundGltfLoadCompleteHandler = this.#gltfLoadCompleteHandler.bind(this);
        this.#gltfLoader = new GLTFLoader( this.#loadingManager );

        // font loader
        this.#boundFontLoadCompleteHandler = this.#fontLoadCompleteHandler.bind(this);
        this.#fontLoader = new FontLoader();
    }

    /**
     * @type { Boolean }
     * @readonly
     */
    get isReady() { return this.#isReady; };

    /**
     * @type { THREE.LoadingManager }
     * @readonly
     */
    get loadingManager() { return this.#loadingManager; }

    /**
     * @type { GUI }
     * @readonly
     */
    get gui() { return this.#gui; }

    /**
     * @type { THREE.Scene }
     * @readonly
     */
    get scene() { return this.#scene; }

    /**
     * @type { THREE.Group }
     * @readonly
     */
    get cameraGroup() { return this.#cameraGroup; }

    /**
     * @type { THREE.PerspectiveCamera }
     * @readonly
     */
    get camera() { return this.#camera; }
    
    /**
     * @type { OrbitControls }
     * @readonly
     */
    get controls() { return this.#controls; }

    /**
     * @type { THREE.Clock }
     * @readonly
     */
    get clock() { return this.#clock; }

    /**
     * @type { THREE.WebGLRenderer }
     * @readonly
     */
    get renderer() { return this.#renderer; }

    /**
     * @type { String }
     */
    get dracoDecoderPath() { return this.#dracoDecoderPath; }
    set dracoDecoderPath( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#dracoDecoderPath = value;
        if( this.#dracoLoader !== undefined )
        {
            this.#dracoLoader.setDecoderPath( this.#dracoDecoderPath );
            if( this.#gltfLoader !== undefined )
            {
                this.#gltfLoader.setDRACOLoader( this.#dracoLoader );
            }
        }
    }

    /**
     * @type { Boolean }
     */
    get useControls() { return this.#useControls; }
    set useControls( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value expected");
        }
        this.#useControls = value;

        if( this.#useControls === true && this.#controls == undefined )
        {
            this.#controls = new OrbitControls( this.#camera, this.#canvas );
            this.#controls.enableDamping = true;
        }
    }

    /**
     * @type { Boolean }
     */
    get useComposer() { return this.#useComposer; }
    set useComposer( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value expected");
        }
        this.#useComposer = value;
    }

    connectedCallback()
    {
        super.connectedCallback();
        // get properties
        this.#buildComponent();
    }

    #buildComponent()
    {
        this.#wi = this.clientWidth;
        this.#hi = this.clientHeight;

        this.#canvas = this.shadowRoot.getElementById("canvas");
        // throw here if element not found
        
        this.#scene = new THREE.Scene();

        this.#cameraGroup = new THREE.Group();
        this.#scene.add( this.#cameraGroup );

        this.#camera =  new THREE.PerspectiveCamera(75, this.#wi / this.#hi, 0.1, 100);
        this.#camera.position.x = 0;
        this.#camera.position.y = 0;
        this.#camera.position.z = 4; // 4
        this.#cameraGroup.add( this.#camera );

        this.#renderer = new THREE.WebGLRenderer(
        {
            canvas: this.#canvas,
            alpha: true,
            antialias: true
        });
        this.#renderer.setSize( this.#wi, this.#hi );
        this.#renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );

        this.#composer = new EffectComposer( this.#renderer );
        this.#composer.setSize( this.#wi, this.#hi );
        this.#composer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );

        this.#renderPass = new RenderPass( this.#scene, this.#camera );
        this.#composer.addPass( this.#renderPass );

        // KEEP IMPORTANT
        //this.#controls = new OrbitControls( this.#camera, this.#canvas );
        //this.#controls.enableDamping = true;

        this.#gui = new GUI();

        this.#isReady = true;
        const sceneReadyEvent = new CustomEvent("sceneReady");
        this.dispatchEvent(sceneReadyEvent);
    }

    /**
     * 
     * @param { Number } ts 
     */
    #animate( ts )
    {
        this._onRender();

        if( this.#useControls === true && this.#controls != undefined )
        {
            this.#controls.update();
        }
    
        if( this.#useComposer === false )
        {
            this.#renderer.render( this.#scene, this.#camera );
        }
        else
        {
            this.#composer.render();
        }
        
        window.requestAnimationFrame( this.#boundAnimate );
    }

    /**
     * 
     * @param { THREE.Object3D } object3d 
     */
    add( object3d )
    {
        this.#scene.add( object3d );
    }

    /**
     * 
     * @param { Pass } pass 
     */
    addPass( pass )
    {
        this.#composer.addPass( pass );
    }

    /**
     * @public
     */
    startRendering()
    {
        this.#clock = new THREE.Clock();
        //this.#renderer.render( this.#scene, this.#camera );
        this.#boundAnimate();
    }

    /**
     * 
     * @abstract
     */
    _resize()
    {
        this.#wi = this.clientWidth;
        this.#hi = this.clientHeight;

        if( this.#isReady === false ) { return; }

        this.#camera.aspect = this.#wi / this.#hi;
        this.#camera.updateProjectionMatrix();

        this.#renderer.setSize( this.#wi, this.#hi );
        this.#renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2) );
    }

    /**
     * Compute here all the changes of the 3D Scene (objects, lights, animations etc.)
     * By default the _onRender method comes w/ some special tasks that are more for the example
     * @abstract
     */
    _onRender()
    {
        const elapsedTime = this.#clock.getElapsedTime();

        // temp but keep to not break page
        
        const children = this.#scene.children;
        for( const child of children )
        {
            if( child.isAxial === true )
            {
                if( child.autoRotateX === true ) { child.rotation.x += child.rotateFactorX; }
                if( child.autoRotateY === true ) { child.rotation.y += child.rotateFactorY; }
                if( child.autoRotateZ === true ) { child.rotation.z += child.rotateFactorZ; }
            }
        }
        

        const renderEvent = new CustomEvent( "render", {bubbles: true, detail: { eTime: elapsedTime}});
        this.dispatchEvent( renderEvent );
    }

    ///
    /// LOADING MANAGER
    ///

    #loadStartHandler( url, itemsLoaded, itemsTotal )
    {
        console.log("start");
    }

    #loadProgressHandler( url, itemsLoaded, itemsTotal )
    {
        console.log(`Loading manager progress @ ${url}`);
    }

    #loadCompleteHandler()
    {
        console.log("loadingManager Complete")
    }

    #loadErrorHandler( url )
    {
        console.log(`Error loading file @ url ${url}`);
    }

    ///
    /// TextureLoader
    ///

    #textureLoadCompleteHandler( texture )
    {
        const textureEvent = new CustomEvent( "textureLoaded", { bubbles: true, detail: { type: "texture", texture: texture } } );
        this.dispatchEvent(textureEvent);
    }

    loadTexture( url )
    {
        this.#textureLoader.load( url, this.#boundTextureLoadCompleteHandler );
    }

    /**
     * Directly returns the texture once its loaded without dispatching event like in the loadTexture() method.
     * The instance of the THREE.LoadingManager works normally.
     * @param { String } url 
     * @returns { THREE.Texture }
     */
    getTexture( url )
    {
        return this.#textureLoader.load( url );
    }

    ///
    /// RGBELoader
    ///

    #rgbeLoadCompleteHandler( data, texData )
    {
        //console.log("rgbe loader complete");
        const textureEvent = new CustomEvent( "textureLoaded", { bubbles: true, detail: { type: "rgbe", texture: data, textureData: texData } } );
        this.dispatchEvent(textureEvent);
    }

    loadRGBE( url )
    {
        this.#rgbeLoader.load( url, this.#boundRgbeLoadCompleteHandler );
    }

    async getRGBETextureAsync( url )
    {
        try
        {
            return await this.#rgbeLoader.loadAsync( url );
        }
        catch( err )
        {
            console.log(err);
        }
    }

    ///
    /// GLTFLoader
    ///

    loadGLTF( url )
    {
        this.#gltfLoader.load( url, this.#boundGltfLoadCompleteHandler );
    }

    #gltfLoadCompleteHandler( gltf )
    {
        //console.log(gltf);
        const gltfEvent = new CustomEvent( "gltfLoaded", { bubbles: true, detail: { object: gltf } } );
        this.dispatchEvent(gltfEvent);
    }

    ///
    /// FontLoader
    ///

    #fontLoadCompleteHandler( font )
    {
        console.log("font loaded");
        const fontEvent = new CustomEvent( "fontLoaded", { bubbles: true, detail: { type: "font", font: font } } );
        this.dispatchEvent(fontEvent);
    }

    loadFont( url )
    {
        this.#fontLoader.load(url, this.#boundFontLoadCompleteHandler);
    }

    ///
    /// Pointers
    ///

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
            document.addEventListener("pointermove", this.#boundPointerMove3DHandler);
        }
        else
        {
            document.removeEventListener("pointermove", this.#boundPointerMove3DHandler);
        }
    }

    /**
     * Manage the behaviour of the #group with mouse or fingers
     * @param { PointerEvent } event 
     */
    #pointerMove3DHandler( event )
    {
        //console.log( "pointerMove");
        const pointerType = event.pointerType;
        
        const ww = window.innerWidth;
        const wh = window.innerHeight;

        const cx = ww / 2;
        const cy = wh / 2;

        let percentX = 0;
        let percentY = 0;

        switch( pointerType )
        {
            case "mouse":
                //console.log(event);

                const px = event.pageX;
                const dx = px - cx;
                percentX = dx / cx;

                const py = event.pageY;
                const dy = py - cy;
                percentY = dy / cy;

            break;

            default:
            break;
        }

        const children = this.#scene.children;
        for( const child of children )
        {
            if( child.isAxial === true )
            {
                if( child.moveOnPointers === true )
                {
                    let finalRY = THREE.MathUtils.degToRad( child.pointerInitRotateY );
                    if( percentX >= 0 )
                    {
                        const dax = child.pointerMaxRotateY - child.pointerInitRotateY;
                        finalRY += THREE.MathUtils.degToRad( dax * percentX );
                    }
                    else
                    {
                        const dax = child.pointerInitRotateY - child.pointerMinRotateY;
                        finalRY += THREE.MathUtils.degToRad( dax * percentX );
                    }

                    let finalRX = THREE.MathUtils.degToRad( child.pointerInitRotateX );
                    if( percentY >= 0 )
                    {
                        const day = child.pointerMaxRotateX - child.pointerInitRotateX;
                        finalRX += THREE.MathUtils.degToRad( day * percentY );
                    }
                    else
                    {
                        const day = child.pointerInitRotateX - child.pointerMinRotateX;
                        finalRX += THREE.MathUtils.degToRad( day * percentY );
                    }

                    child.rotation.y = finalRY;
                    child.rotation.x = finalRX;
                }
            }
        }
    }
}

window.customElements.define("axial-3d-viewer", Axial3DViewer);
export { Axial3DViewer }