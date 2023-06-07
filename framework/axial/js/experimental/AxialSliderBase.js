"use strict"

import { AxialComponentBase } from "../core/AxialComponentBase";
import { DomUtils } from "../utils/DomUtils";
import { AxialSliderItemBase } from "./AxialSliderItemBase";

class AxialSliderBase extends AxialComponentBase
{
    /** @type { Set } */
    static #DISPLAY_MODES = Object.freeze(new Set(["none", "window", "target"]));

    /** @type { Number } */
    #displayMode = "border";

    /** @type { Array.<AxialSliderItemBase> } */
    #items = new Array();

    /** @type { Number } */
    #index = -1;

    /** @type { Number } */
    #margin = 20;

    /** @type { Function } */
    #boundItemClickHandler;

    /** @type { Function } */
    #boundItemResizedHandler;

    constructor()
    {
        super();
        this.#boundItemClickHandler = this.#itemClickHandler.bind(this);
        this.#boundItemResizedHandler = this.#itemResizedHandler.bind(this);
        this.addEventListener("itemResized", this.#boundItemResizedHandler);
        this.addEventListener("elementResized", this.#boundItemResizedHandler);

        this.classList.add("axial_slider_base");
        
        this.isResizable = true;
        this.useResizeObserver = true;
    }

    static get DISPLAY_MODES() { return AxialSliderBase.#DISPLAY_MODES; }

    /**
     * @type { String }
     */
    get displayMode() { return this.#displayMode; }
    set displayMode( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        if( AxialSliderBase.#DISPLAY_MODES.has(value) === false )
        {
            throw new Error("value can only be 'center' or 'border'");
        }
        if( this.#displayMode == value ) { return; }
        this.#displayMode = value;
        this.#layoutComponent();
    }

    get currentIndex() { return this.#index; }

    /**
     * 
     * @param { Number } index 
     */
    moveAt( index )
    {
        if( index == this.#index ) { return; }
        if( index < 0 ) { index = 0 }
        else if( index >= this.#items.length ) { index = this.#items.length-1; }
        this.#index = index;
        this.#layoutComponent();
    }

    _finalizeComponent()
    {
        const childrenLength = this.children.length;
        for( let i = 0; i < childrenLength; i++ )
        {
            const tempItem = this.children[i];
            if( tempItem instanceof AxialSliderItemBase === true )
            {
                tempItem.addEventListener("click", this.#boundItemClickHandler);
                this.#items.push(tempItem);
            }
            else
            {
                throw new TypeError("AxialSliderItem value expected");
            }
        }
        if( this.#items.length > 0 ) { this.#index = 0; }
        
        this.#buildComponent();
    }

    #buildComponent()
    {
        this.#layoutComponent();
    }

    /**
     * 
     * @param { AxialSliderItemBase } item 
     */
    addItem( item )
    {
        if( item instanceof AxialSliderItemBase === true )
        {
            item.addEventListener("click", this.#boundItemClickHandler);
            this.#items.push(item);
            this.appendChild(item);
            if( this.#index == -1 ) { this.#index = 0; }
            this.#layoutComponent();
        }
        else
        {
            throw new TypeError("AxialSliderItem value expected");
        }
    }

    removeAllItems()
    {
        for( const item of this.#items )
        {
            item.removeEventListener("click", this.#boundItemClickHandler);
            this.removeChild(item);
        }
        //DomUtils.cleanElement(this);
        this.#items = new Array();
        this.#index = -1;
    }

    _observerResize(entries, observer)
    {
        super._observerResize(entries, observer);
        this._resize();
    }

    _resize()
    {
        super._resize();
        this.#layoutComponent();
    }

    _layoutComponent()
    {
        this.#layoutComponent();
    }

    #itemClickHandler(event)
    {
        const currentItem = event.target;
        this.#index = this.#items.indexOf(currentItem);
        this.#layoutComponent();
    }

    #itemResizedHandler( event )
    {
        this.#layoutComponent();
    }

    #layoutComponent()
    {
        if( this.#index == -1 ) { return; }

        const w = this.offsetWidth;
        const cx = w / 2;
        const itemsLength = this.#items.length;

        const centerItem = this.#items[this.#index];
        const centerItemWidth = centerItem.offsetWidth;
        const centerItemX = cx - (centerItemWidth / 2);

        let decay = 0;
        let xPositions = new Array();
        xPositions[this.#index] = centerItemX;

        // left
        let currentLeftX = cx - (centerItemWidth / 2) - this.#margin;
        for( let l = (this.#index-1); l >= 0; l-- )
        {
            const leftItem = this.#items[l];
            const leftItemWidth = leftItem.offsetWidth;

            currentLeftX -= leftItemWidth;
            xPositions[l] = currentLeftX; // important to set HERE
            currentLeftX -= this.#margin;

        }
        
        // right
        let currentRightX = cx + (centerItemWidth / 2) + this.#margin;
        for( let r = (this.#index+1); r < itemsLength; r++ )
        {
            xPositions[r] = currentRightX; // important to set HERE
            
            const rightItem = this.#items[r];
            const rightItemWidth = rightItem.offsetWidth;
            
            currentRightX += ( rightItemWidth + this.#margin );
        }

        if( this.#displayMode == "border" )
        {
            const firstLeft = xPositions[0];
            if( firstLeft > 0 )
            {
                decay = -firstLeft;
            }
    
            const lastLeft = xPositions[itemsLength-1];
            const lastWidth = this.#items[itemsLength-1].offsetWidth;
            if( (lastLeft + lastWidth) < w )
            {
                decay = w - lastLeft - lastWidth;
            }
        }

        for( let i = 0; i < itemsLength; i++ )
        {
            const item = this.#items[i];
            item.style.left = String(xPositions[i] + decay) + "px";
        }
    }
}

window.customElements.define("axial-slider-base", AxialSliderBase);
export { AxialSliderBase }