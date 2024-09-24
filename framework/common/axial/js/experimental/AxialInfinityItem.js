"use strict"

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialInfinityItem extends AxialComponentBase
{
    /// vars
    /** @type { Number } */
    #currentX = 0;

    /** @type { Number } */
    #currentY = 0;

    /** @type { Number } */
    #initX = 0;

    /** @type { Number } */
    #initY = 0;

    /** @type { Number } */
    #minX = 0;

    /** @type { Number } */
    #maxX = 0;

    /** @type { Number } */
    #minY = 0;

    /** @type { Number } */
    #maxY = 0;

    /** @type { Number } */
    #x = 0;

    /** @type { Number } */
    #y = 0;

    /** @type { Number } */
    #width = 0;

    /** @type { Number } */
    #height = 0;

    /// elements
    /** @type { HTMLElement } */
    #holder;

    /// test
    /** @type { Number } */
    #worldDX = 0;

    /** @type { Number } */
    #worldDY = 0;

    /// css 3d test
    /** @type { Boolean } */
    #is3D = false;

    /** @type { Number } */
    #z = 0;

    /** @type { Number } */
    #currentZ = 0;

    /** @type { Boolean } */
    #has3DMoved = false;

    constructor()
    {
        super();
        this.classList.add("axial_infinity_item");
        this.template = "axial-infinity-item-template";
        this.#z = Math.round( Math.random() * -300 );
    }

    /** @readonly */
    get x() { return this.#x; }

    /** @readonly */
    get y() { return this.#y; }

    /** @readonly */
    get width() { return this.#width; }

    /** @readonly */
    get height() { return this.#height; }

    static get observedAttributes()
    {
        return [ "axial-template", "axial-width", "axial-height" ];
    }
    
    connectedCallback()
    {
        super.connectedCallback();
        this.#buildComponent();
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        
        if( name === "axial-width" )
        {
            const tempWidth = Number(newValue);
            if( isNaN(tempWidth) === true )
            {
                throw new Error("Number value required on AxialInfinity axial-cell-width attribute");
                
            }
            this.#width = Math.abs(tempWidth);
        }

        if( name === "axial-height" )
        {
            const tempHeight = Number(newValue);
            if( isNaN(tempHeight) === true )
            {
                throw new Error("Number value required on AxialInfinity axial-cell-height attribute");
                
            }
            this.#height = Math.abs(tempHeight);
        }
        
    }

    #buildComponent()
    {
        //console.log(this.offsetParent);
        this.#holder = this.shadowRoot.getElementById("holder");

        const hw = this.#width;
        const hh = this.#height;
        const hx = -hw / 2;
        const hy = -hh / 2;

        this.#holder.style.width = hw + "px";
        this.#holder.style.height = hh + "px";
        this.#holder.style.left = hx + "px";
        this.#holder.style.top = hy + "px";
        
    }

    setSize( width = 0, height = 0 )
    {
        this.#width  = width;
        this.#height = height;

        const hw = this.#width;
        const hh = this.#height;
        const hx = -hw / 2;
        const hy = -hh / 2;

        this.#holder.style.width = hw + "px";
        this.#holder.style.height = hh + "px";
        this.#holder.style.left = hx + "px";
        this.#holder.style.top = hy + "px";
    }

    setPosition( x = 0, y = 0 )
    {
        this.#x = x;
        this.#y = y;

        const parent = this.shadowRoot.host.parentElement;
        const pw = parent.offsetWidth;
        const ph = parent.offsetHeight;

        const pcx = pw / 2;
        const pcy = ph / 2;

        this.#initX = pcx + this.#x;
        this.#initY = pcy + this.#y;

        this.style.left = this.#initX + "px";
        this.style.top = this.#initY + "px";
    }

    getBounds()
    {
        return this.#holder.getBoundingClientRect();
    }

    setWorldDistances( distX, distY )
    {
        this.#worldDX = distX;
        this.#worldDY = distY;

        const parent = this.shadowRoot.host.parentElement;
        const pw = parent.offsetWidth;
        const ph = parent.offsetHeight;

        const pcx = pw / 2;
        const pcy = ph / 2;

        const halfDistX = distX / 2;
        const halfDistY = distY / 2;

        const deltaCenterX = this.#initX - pcx;
        this.#minX = -halfDistX - deltaCenterX;
        this.#maxX = halfDistX - deltaCenterX;

        const deltaCenterY = this.#initY - pcy;
        this.#minY = -halfDistY - deltaCenterY;
        this.#maxY = halfDistY - deltaCenterY;
    }

    /**
     * 
     * @param { Number } onX 
     * @param { Number } onY 
     */
    move( onX = 0, onY = 0 )
    {
        /// X PART
        this.#currentX = onX;
        if( onX > 0 && this.#currentX >= this.#maxX )
        {
            this.#currentX = onX - this.#worldDX;
        }
        else if( onX < 0 && this.#currentX <= this.#minX )
        {
            this.#currentX = onX + this.#worldDX;
        }

        /// Y PART
        this.#currentY = onY;
        if( onY > 0 && this.#currentY >= this.#maxY )
        {
            this.#currentY = onY - this.#worldDY;
        }
        else if( onY < 0 && this.#currentY <= this.#minY )
        {
            this.#currentY = onY + this.#worldDY;
        }

        /// Z PART
        /*
        if( this.#has3DMoved == false )
        {
            this.#currentZ += (this.#z - this.#currentZ) / 60;
            if( Math.round(this.#currentZ) == this.#z )
            {
                this.#has3DMoved = true;
                const infinityEvent = new CustomEvent("3DChanged");
                this.dispatchEvent(infinityEvent);
            }
        }
        */
        //const transform = "translate3d(" + this.#currentX + "px," + this.#currentY + "px," + this.#currentZ + "px)";
        const transform = "translate3d(" + this.#currentX + "px," + this.#currentY + "px,0)";
        this.style.transform = transform;

    }
}
window.customElements.define("axial-infinity-item", AxialInfinityItem);
export { AxialInfinityItem }