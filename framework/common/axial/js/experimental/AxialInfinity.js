"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialInfinityItem } from "./AxialInfinityItem.js";

class AxialInfinity extends AxialComponentBase
{
    /// vars
    /** @type {Array<AxialInfinityItem>} */
    #items = new Array();

    /** @type { Array.<String> } */
    #directions = ["right", "bottom", "left", "top"];

    /** @type { Set.<String> } */
    #displayModes = new Set( [ "fibonacci", "grid", "row", "column" ] );

    /** @type { String } */
    #displayMode = "grid";

    /** @type { Number } */
    #cellWidth = 400;

    /** @type { Number } */
    #cellHeight = 400;

    /** @type { Number } */
    #cellMarginX = 20;

    /** @type { Number } */
    #cellMarginY = 20;

    /** @type { Number } */
    #xWorldDistance = 0;

    /** @type { Number } */
    #yWorldDistance = 0;

    /** @type { Number } */
    #directionX = 0;

    /** @type { Number } */
    #directionY = 0;

    /// display vars
    /** @type { Number } */
    #gridColumns = 5;

    /** @type { Number } */
    #gridRows = 3;

    /// elements
    /** @type { HTMLElement } */
    #holder;

    /** @type { HTMLSlotElement } */
    #slot;

    /// event
    /** @type { Function } */
    #boundWheelHandler;

    /// animation
    /** @type { Number } */
    #infinityAnimationId = -1;

    /** @type { Function } */
    #boundInfinityAnimation;

    /** @type { Number } */
    #distanceX = 0;

    /** @type { Number } */
    #distanceY = 0;

    /** @type { Number } */
    #infinityX = 0;

    /** @type { Number } */
    #infinityY = 0;

    /** @type { Number } */
    #infinityTimeStart = 0;

    /** @type { Number } */
    #infinityStrength = 18;

    /// css 3d
    /** @type { Boolean } */
    #perspectiveEnabled = false;

    /** @type { Number } */
    #perspectiveDistance = 200;

    /** @type { Number } */
    #event3DCounter = 0;

    /** @type { Function } */
    #boundItem3DChangedHandler;
    
    constructor()
    {
        super();
        this.classList.add("axial_infinity");
        this.template = "axial-infinity-template";
        this.#boundWheelHandler = this.#wheelHandler.bind(this);
        this.#boundInfinityAnimation = this.#infinityAnimation.bind(this);
        this.#boundItem3DChangedHandler = this.#item3DChangedHandler.bind(this);
    }

    static get observedAttributes()
    {
        return [ "axial-cell-width", "axial-cell-height", "axial-margin-x", "axial-margin-y" ];
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        
        // cell width
        if( name === "axial-cell-width" )
        {
            const tempWidth = Number(newValue);
            if( isNaN(tempWidth) === true )
            {
                throw new Error("Number value required on AxialInfinity axial-cell-width attribute");
                
            }
            this.#cellWidth = Math.abs(tempWidth);
        }

        // cell height
        if( name === "axial-cell-height" )
        {
            const tempHeight = Number(newValue);
            if( isNaN(tempHeight) === true )
            {
                throw new Error("Number value required on AxialInfinity axial-cell-height attribute");
                
            }
            this.#cellHeight = Math.abs(tempHeight);
        }

        if( name === "axial-margin-x" )
        {
            const tempMarginX = Number(newValue);
            if( isNaN(tempMarginX) === true )
            {
                throw new Error("Number value required on AxialInfinity axial-margin-x attribute");
                
            }
            this.#cellMarginX = Math.abs(tempMarginX);
        }

        if( name === "axial-margin-y" )
        {
            const tempMarginY = Number(newValue);
            if( isNaN(tempMarginY) === true )
            {
                throw new Error("Number value required on AxialInfinity axial-margin-y attribute");
                
            }
            this.#cellMarginY = Math.abs(tempMarginY);
        }
        
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#holder = this.shadowRoot.getElementById("holder");
        this.#slot = this.shadowRoot.getElementById("slot");
        
        const children = this.#slot.assignedElements( { flatten: false } );
        if( children.length === 0 ) { return; }

        for( const child of children )
        {
            if( child instanceof AxialInfinityItem === true )
            {
                this.#items.push(child);
                child.addEventListener("3DChanged", this.#boundItem3DChangedHandler);
            }
        }

        if( this.#items.length > 0 )
        {
            this.#layoutComponent()
        }
    }

    #layoutComponent()
    {
        switch( this.#displayMode )
        {
            case "fibonacci": this.#layoutFibonacci(); break;
            case "grid":      this.#layoutGrid();      break;
            case "row":       this.#layoutRow();       break;
            case "column":    this.#layoutColumn();    break;
        }
    }

    #layoutFibonacci()
    {
        console.log("LAYOUT FIBONACCI");
        const ww = this.#holder.offsetWidth;
        const wh = this.#holder.offsetHeight;

        const cx = ww / 2;
        const cy = wh / 2;

        let left = 0; let right = 0; let top = 0; let bottom = 0;
        let counter = -1;
        const itemsLength = this.#items.length;

        for( let i = 0; i < itemsLength; i++ )
        {
            const item = this.#items[i];
            let mx = 0; let my = 0;

            /* SUPER IMPORTANT TO KEEP
            const cellNW = Math.ceil(tw / this.#gridCellSize);
            const cellNH = Math.ceil(th / this.#gridCellSize);

            console.log( model.t, tw, th, cellNW, cellNH );

            model.cnw = cellNW;
            model.cnh = cellNH;
            model.cw = cellW;
            model.ch = cellH;
            */
            
            const cellW = item.width  === 0 ? this.#cellWidth  : item.width;
            const cellH = item.height === 0 ? this.#cellHeight : item.height;

            item.setSize( cellW, cellH );

            let adjustCounter = false;
            if( i === 0 )
            {
                mx = 0; my = 0;
                left   = -(cellW / 2) - this.#cellMarginX;
                right  =  (cellW / 2) + this.#cellMarginX;
                top    = -(cellH / 2) - this.#cellMarginY;
                bottom =  (cellH / 2) + this.#cellMarginY;

                adjustCounter = true;
            }
            else
            {
                const dir = this.#directions[counter];
                const previousItem = this.#items[i-1];

                let previousLeft = 0; let previousTop = 0; let previousRight = 0; let previousBottom = 0;

                // we check the limit of the opposite border until it's upon named limit
                // ie if we go on bottom, the limit is reach when the top of the new element has reached the bottom var
                switch( dir )
                {
                    case "right":
                        
                        previousLeft = previousItem.x - (previousItem.width / 2);
                        mx = previousLeft + previousItem.width + (cellW / 2) + this.#cellMarginX;
                        
                        previousBottom = previousItem.y + (previousItem.height / 2);
                        my = previousBottom - (cellH / 2);

                        const itemLeft = mx - (cellW / 2);
                        if( itemLeft >= right )
                        {
                            adjustCounter = true;
                            right = itemLeft + this.#cellMarginX;
                        }
                        
                        const adjustedTop = my - (cellH / 2);
                        if( adjustedTop < top )
                        {
                            top = adjustedTop - this.#cellMarginY;
                        }

                    break;

                    case "bottom":
                        previousTop = previousItem.y - (previousItem.height / 2);
                        my = previousTop + previousItem.height + (cellH / 2) + this.#cellMarginY;

                        previousLeft = previousItem.x - (previousItem.width / 2);
                        mx = previousLeft + (cellW / 2);

                        const itemTop = my - (cellH / 2);
                        if( itemTop >= bottom )
                        {
                            adjustCounter = true;
                            bottom = itemTop + this.#cellMarginY;
                        }

                        const adjustedRight = mx + (cellW / 2);
                        if( adjustedRight > right )
                        {
                            right = adjustedRight + this.#cellMarginX;
                        }
                        
                    break;

                    case "left":
                        previousRight = previousItem.x + (previousItem.width / 2);
                        mx = previousRight - previousItem.width - (cellW / 2) - this.#cellMarginX;

                        previousTop = previousItem.y - (previousItem.height / 2);
                        my = previousTop + (cellH / 2);

                        const itemRight = mx + (cellW / 2);
                        if( itemRight <= left )
                        {
                            adjustCounter = true;
                            left = itemRight - this.#cellMarginX;
                        }

                        const adjustedBottom = my + (cellH / 2);
                        if( adjustedBottom > bottom )
                        {
                            bottom = adjustedBottom + this.#cellMarginY;
                        }
                    break;

                    case "top":
                        previousBottom = previousItem.y + (previousItem.height / 2);
                        my = previousBottom - previousItem.height - (cellH / 2) - this.#cellMarginY;

                        previousRight = previousItem.x + (previousItem.width / 2);
                        mx = previousRight - (cellW / 2);

                        const itemBottom = my + (cellH / 2);
                        if( itemBottom <= top )
                        {
                            adjustCounter = true;
                            top = itemBottom - this.#cellMarginY;
                        }

                        const adjustedLeft = mx - (cellW / 2);
                        if( adjustedLeft < bottom )
                        {
                            left = adjustedLeft - this.#cellMarginX;
                        }
                    break;
                }
            }

            item.setPosition( mx, my );

            if( adjustCounter === true )
            {
                counter = counter + 1 > 3 ?  0 : counter + 1;
            }
        }
        
        /*
        let minBoundX = 0;
        let maxBoundX = ww;
        let minBoundY = 0;
        let maxBoundY = wh;

        let maxElementWidth = 0;
        let maxElementHeight = 0;

        for( const item of this.#items )
        {
            const itemBounds = item.getBounds();
            //console.log(itemBounds);

            if( item.width  > maxElementWidth )  { maxElementWidth = item.width; }
            if( item.height > maxElementHeight ) { maxElementHeight = item.height; }
            

            if( itemBounds.left   < minBoundX )  { minBoundX = itemBounds.left; }
            if( itemBounds.right  > maxBoundX )  { maxBoundX = itemBounds.right; }
            if( itemBounds.top    < minBoundY )  { minBoundY = itemBounds.top; }
            if( itemBounds.bottom > maxBoundY )  { maxBoundY = itemBounds.bottom; }
        }

        console.log("boundsX = " + minBoundX, maxBoundX);
        console.log("boundsY = " + minBoundY, maxBoundY);
            
        this.#xWorldDistance = (maxBoundX - minBoundX) +  this.#cellMarginX;
        this.#yWorldDistance = (maxBoundY - minBoundY) +  this.#cellMarginY;

        console.log("World distance BEFORE corrections")
        console.log(this.#xWorldDistance, this.#yWorldDistance);
        
        if( this.#xWorldDistance <= (ww + maxElementWidth) )
        {
            console.log("bound x correction");
            this.#xWorldDistance = ww + maxElementWidth + this.#cellMarginX;
        }
        
        if( this.#yWorldDistance <= ( wh + maxElementHeight ) )
        {
            console.log("bound y correction");
            this.#yWorldDistance = wh + maxElementHeight + this.#cellMarginY;
        }
        
        // a priori stable 
        console.log("World distance AFTER corrections")
        console.log(this.#xWorldDistance, this.#yWorldDistance);
        */
        
        // update world
        this.#computeWorld();
    }

    #layoutGrid()
    {
        console.log(" LAYOUT GRID");
        const ww = this.#holder.offsetWidth;
        const wh = this.#holder.offsetHeight;

        //const cx = ww / 2;
        //const cy = wh / 2;

        const totalWidth = ((this.#gridColumns - 1) * (this.#cellWidth + this.#cellMarginX )) + this.#cellWidth;
        const totalHeight = ((this.#gridRows - 1) * (this.#cellHeight + this.#cellMarginY )) + this.#cellHeight;

        console.log( totalWidth, totalHeight );

        const startX = -(totalWidth / 2) + this.#cellWidth / 2;
        const startY = -(totalHeight / 2) + this.#cellHeight / 2;

        console.log( startX, startY );

        let gr = -1;
        let gc = -1;

        const itemLength = this.#items.length;

        for( let i = 0; i < itemLength; i++ )
        {
            gc = i % this.#gridColumns;
            if( gc === 0 )
            {
                gr += 1;
            }
            console.log(gr, gc);

            const itemX = startX + ((this.#cellWidth + this.#cellMarginX ) * gc);
            const itemY = startY + ((this.#cellHeight + this.#cellMarginY ) * gr);
            console.log( itemX, itemY);
            
            const item = this.#items[i];
            item.setSize( this.#cellWidth, this.#cellHeight);
            item.setPosition( itemX, itemY );
        }
        this.#computeWorld();
    }

    #layoutRow()
    {

    }

    #layoutColumn()
    {

    }

    #computeWorld()
    {
        this.removeEventListener("wheel", this.#boundWheelHandler, { passive: false } );

        const ww = this.offsetWidth; // warning holder ??? 
        const wh = this.offsetHeight;
        
        let minBoundX = 0;
        let maxBoundX = ww;
        let minBoundY = 0;
        let maxBoundY = wh;

        let maxElementWidth = 0;
        let maxElementHeight = 0;

        for( const item of this.#items )
        {
            const itemBounds = item.getBounds();
            //console.log(itemBounds);

            if( item.width  > maxElementWidth )  { maxElementWidth = item.width; }
            if( item.height > maxElementHeight ) { maxElementHeight = item.height; }

            if( itemBounds.left   < minBoundX )  { minBoundX = itemBounds.left; }
            if( itemBounds.right  > maxBoundX )  { maxBoundX = itemBounds.right; }
            if( itemBounds.top    < minBoundY )  { minBoundY = itemBounds.top; }
            if( itemBounds.bottom > maxBoundY )  { maxBoundY = itemBounds.bottom; }
        }

        console.log("boundsX = " + minBoundX, maxBoundX);
        console.log("boundsY = " + minBoundY, maxBoundY);
            
        this.#xWorldDistance = (maxBoundX - minBoundX) +  this.#cellMarginX;
        this.#yWorldDistance = (maxBoundY - minBoundY) +  this.#cellMarginY;

        console.log("World distance BEFORE corrections")
        console.log(this.#xWorldDistance, this.#yWorldDistance);
        
        if( this.#xWorldDistance <= (ww + maxElementWidth) )
        {
            console.log("bound x correction");
            this.#xWorldDistance = ww + maxElementWidth + this.#cellMarginX;
        }
        
        if( this.#yWorldDistance <= ( wh + maxElementHeight ) )
        {
            console.log("bound y correction");
            this.#yWorldDistance = wh + maxElementHeight + this.#cellMarginY;
        }
        
        // a priori stable 
        console.log("World distance AFTER corrections")
        console.log(this.#xWorldDistance, this.#yWorldDistance);

        for( const item of this.#items )
        {
            item.setWorldDistances( this.#xWorldDistance, this.#yWorldDistance );
        }
        this.addEventListener("wheel", this.#boundWheelHandler, { passive: false } );

        this.startInfinityAnimation();
    }

    #wheelHandler( event )
    {
        //console.log(event);
        event.preventDefault();

        const dx = event.deltaX;
        const dy = event.deltaY;

        this.#distanceX -= dx;
        this.#distanceY -= dy;
        
        if( dx < 0 ) { this.#directionX = 1; } else if( dx > 0 ) { this.#directionX = -1; } else { this.#directionX = 0; }
        if( dy < 0 ) { this.#directionY = 1; } else if( dy > 0 ) { this.#directionY = -1; } else { this.#directionY = 0; }

    }

    ///
    /// ANIMATION PART
    /// 

    /**
     * 
     * @param { Number } ts the timestamp for requestAnimationFrame
     */
    #infinityAnimation( ts )
    {
        this.#infinityX += ( this.#distanceX - this.#infinityX ) / this.#infinityStrength;
        this.#infinityY += ( this.#distanceY - this.#infinityY ) / this.#infinityStrength;
        
        const infinityDX = Math.round(this.#infinityX % this.#xWorldDistance);
        const infinityDY = Math.round(this.#infinityY % this.#yWorldDistance);
        
        for( const item of this.#items )
        {
            item.move( infinityDX, infinityDY );
        }

        this.#infinityAnimationId = window.requestAnimationFrame( this.#boundInfinityAnimation );
    }

    startInfinityAnimation()
    {
        if( this.#infinityAnimationId != -1 )
        {
            window.cancelAnimationFrame( this.#infinityAnimationId );
        }    
        this.#infinityAnimationId = window.requestAnimationFrame( this.#boundInfinityAnimation );
    }

    stopInfinityAnimation()
    {
        window.cancelAnimationFrame( this.#infinityAnimationId );
    }

    /**
     * 
     * @param { AxialInfinityItem } item 
     */
    addItem( item )
    {
        console.log( item instanceof AxialInfinityItem );
    }

    #item3DChangedHandler( event )
    {
        this.#event3DCounter += 1;
        if( this.#event3DCounter === this.#items.length )
        {
            console.log( "3D Transition finished" )
            this.#event3DCounter = 0;
            this.#computeWorld();
        }
    }

}
window.customElements.define("axial-infinity", AxialInfinity);
export { AxialInfinity }