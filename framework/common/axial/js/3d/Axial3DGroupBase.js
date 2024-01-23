"use strict"

import * as THREE from "three";

class Axial3DGroupBase extends THREE.Group
{
    /** @type { Number } */
    #px = 0;

    /** @type { Number } */
    #py = 0;

    /** @type { Number } */
    #pz = 0;

    /** @type { THREE.Material } */
    #material;

    /** @type { Boolean } */
    #isAxial = true;

    /** @type { Boolean } */
    #moveOnPointers = false;

    /** @type { Boolean } */
    #autoRotateX = false;

    /** @type { Boolean } */
    #autoRotateY = false;

    /** @type { Boolean } */
    #autoRotateZ = false;

    /** @type { Number } */
    #rotateFactorX = 0.01;

    /** @type { Number } */
    #rotateFactorY = 0.01;

    /** @type { Number } */
    #rotateFactorZ = 0.01;

    /** @type { Number } */
    #pointerInitRotateY = 0;

    /** @type { Number } */
    #pointerMinRotateY = 0;

    /** @type { Number } */
    #pointerMaxRotateY = 0;

    /** @type { Number } */
    #pointerInitRotateX = 0;

    /** @type { Number } */
    #pointerMinRotateX = 0;

    /** @type { Number } */
    #pointerMaxRotateX = 0;


    constructor()
    {
        super();
    }

    /** 
     * @type { Boolean } 
     * @readonly
    */
    get isAxial() { return this.#isAxial; }

    get material() { return this.#material; }
    set material( value )
    {
        this.#material = value;

        for( const child of this.children )
        {
            if( child.isMesh === true )
            {
                child.material.dispose();
                child.material = this.#material;
                child.material.needsUpdate = true;
            }
        }
    }

    get moveOnPointers() { return this.#moveOnPointers; }
    set moveOnPointers( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        this.#moveOnPointers = value;
    }

    ///
    /// ROTATION PART
    ///

    /// AUTO ROTATION
    get autoRotateX() { return this.#autoRotateX; }
    set autoRotateX( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        this.#autoRotateX = value;
    }

    get autoRotateY() { return this.#autoRotateY; }
    set autoRotateY( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        this.#autoRotateY = value;
    }

    get autoRotateZ() { return this.#autoRotateZ; }
    set autoRotateZ( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        this.#autoRotateZ = value;
    }

    get rotateFactorX() { return this.#rotateFactorX; }
    set rotateFactorX( value )
    {
        if( isNaN( value ) == true )
        {
            throw new TypeError("Number value required");
        }
        this.#rotateFactorX = value;
    }

    get rotateFactorY() { return this.#rotateFactorY; }
    set rotateFactorY( value )
    {
        if( isNaN( value ) == true )
        {
            throw new TypeError("Number value required");
        }
        this.#rotateFactorY = value;
    }

    get rotateFactorZ() { return this.#rotateFactorZ; }
    set rotateFactorZ( value )
    {
        if( isNaN( value ) == true )
        {
            throw new TypeError("Number value required");
        }
        this.#rotateFactorZ = value;
    }

    /// ROTATION WITH POINTERS
    get pointerInitRotateY() { return this.#pointerInitRotateY; }
    set pointerInitRotateY( value )
    {
        if( isNaN( value ) == true )
        {
            throw new TypeError("Number value required");
        }
        this.#pointerInitRotateY = value;
    }

    get pointerMinRotateY() { return this.#pointerMinRotateY; }
    set pointerMinRotateY( value )
    {
        if( isNaN( value ) == true )
        {
            throw new TypeError("Number value required");
        }
        this.#pointerMinRotateY = value;
    }

    get pointerMaxRotateY() { return this.#pointerMaxRotateY; }
    set pointerMaxRotateY( value )
    {
        if( isNaN( value ) == true )
        {
            throw new TypeError("Number value required");
        }
        this.#pointerMaxRotateY = value;
    }

    get pointerInitRotateX() { return this.#pointerInitRotateX; }
    set pointerInitRotateX( value )
    {
        if( isNaN( value ) == true )
        {
            throw new TypeError("Number value required");
        }
        this.#pointerInitRotateX = value;
    }

    get pointerMinRotateX() { return this.#pointerMinRotateX; }
    set pointerMinRotateX( value )
    {
        if( isNaN( value ) == true )
        {
            throw new TypeError("Number value required");
        }
        this.#pointerMinRotateX = value;
    }

    get pointerMaxRotateX() { return this.#pointerMaxRotateX; }
    set pointerMaxRotateX( value )
    {
        if( isNaN( value ) == true )
        {
            throw new TypeError("Number value required");
        }
        this.#pointerMaxRotateX = value;
    }
    
}

export { Axial3DGroupBase }