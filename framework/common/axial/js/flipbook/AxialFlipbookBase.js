"use strict"

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialFlipbookPageBase} from "./AxialFlipbookPageBase.js";
import { Point } from "../geom/Point.js";
import { MathUtils } from "../utils/MathUtils.js";

class AxialFlipbookBase extends AxialComponentBase
{

    /** @type { String } */
    #svgNs = "http://www.w3.org/2000/svg";

    /** @type { String } */
    #space = " ";

    /** @type { Number } */
    #currentPage = 0;

    /** @type { Array.<AxialFlipbookPageBase> } */
    #pages = new Array();

    /** @type { Function } */
    #boundPointerDownHandler;

    /** @type { Function } */
    #boundPointerMoveHandler;

    /** @type { Function } */
    #boundPointerUpHandler;

    /** @type { Function } */
    #boundPointerCancelHandler;

    /** @type { PointerEvent } */
    #initPointerEvent;

    /** @type { Number } */
    #cornerAreaSize = 100;

    // vars for animation

    /** @type { Number } */
    #dirX = 0;

    /** @type { Number } */
    #dirY = 0;

    /** @type { Point } */
    #corner;

    /** @type { Point } */
    #mouse;

    /** @type { String } */
    #stylePropY = "";

    /** @type { AxialFlipbookPageBase } */
    #currentFlipPage;

    /** @type { AxialFlipbookPageBase } */
    #nextFlipPage;

    constructor()
    {
        super();
        this.classList.add("axial_flipbook_base");

        this.#boundPointerDownHandler = this.#pointerDownHandler.bind(this);
        this.#boundPointerMoveHandler = this.#pointerMoveHandler.bind(this);
        this.#boundPointerUpHandler = this.#pointerUpHandler.bind(this);
        this.#boundPointerCancelHandler = this.#pointerCancelHandler.bind(this);
    }

    connectedCallback()
    {
        super.connectedCallback();
    }

    _finalizeComponent()
    {
        super._finalizeComponent();
        this._layoutComponent();
    }

    _layoutComponent()
    {
        const children = this.children;
        const childrenLength = children.length;

        if( childrenLength > 0 )
        {
            for( let i = 0; i < childrenLength; i++ )
            {
                const tempPage = children[i];
                if( tempPage instanceof AxialFlipbookPageBase == true )
                {
                    this.#pages.push( tempPage );
                }
                else
                {
                    throw new Error("Elements in a AxialFlipbookBase must be or extends AxialFlipbookPageBase");
                }
            }
        }
        this.#updatePages();
        this.addEventListener("pointerdown", this.#boundPointerDownHandler ); // use capture ??
    }

    #updatePages()
    {
        const fw = this.offsetWidth;
        const hw = fw / 2;
        const pagesLength = this.#pages.length;
        if( pagesLength === 0 ) { return; }
        for( let i = 0; i < pagesLength; i++ )
        {
            const page = this.children[i];
            //page.style.zIndex = pagesLength - i;
            
            if( i == this.#currentPage )
            {
                page.style.left = hw + "px";
                page.style.zIndex = 1;
                page.style.visibility = "visible";
            }
            else if( i == ( this.#currentPage + 1 ) )
            {
                page.style.left = fw + "px";
                page.style.zIndex = 2;
                page.style.visibility = "hidden";
            }
            else if( i == ( this.#currentPage + 2 ) )
            {
                page.style.left = hw + "px";
                page.style.visibility = "visible";
            }
            else if( i > ( this.#currentPage + 2 ) )
            {
                page.style.left = fw + "px";
                page.style.visibility = "hidden";
            }
        }
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    #pointerDownHandler( event )
    {
        console.log(event);

        this.#initPointerEvent = event;

        //this.setPointerCapture( event.pointerId );

        const fw = this.offsetWidth;
        const fh = this.offsetHeight;

        const cx = fw / 2;
        const cy = fh / 2;

        const bounds = this.getBoundingClientRect();
        this.#mouse = new Point()
        this.#mouse.x = event.clientX - bounds.left;
        this.#mouse.y = event.clientY - bounds.top;

        this.#dirX = this.#mouse.x >= cx ? 1 : -1;
        this.#dirY = this.#mouse.y >= cy ? 1 : -1;

        this.#currentFlipPage = this.children[this.#currentPage];
        this.#nextFlipPage = this.children[this.#currentPage + this.#dirX];

        if( this.#nextFlipPage == undefined )
        {
            return;
        }

        this.#corner = new Point();
        this.#corner.x = cx + ( this.#dirX * cx );
        this.#corner.y = cy + ( this.#dirY * cy );

        const transformOriginX = this.#dirX == 1 ? "left" : "right";
        const transformOriginY = this.#dirY == 1 ? "bottom" : "top";
        const transformOrigin = transformOriginX + this.#space + transformOriginY;

        this.#stylePropY = this.#dirY == 1 ? "bottom" : "top";

        this.#nextFlipPage.style.top = "unset";
        this.#nextFlipPage.style.bottom = "unset";

        this.#nextFlipPage.style.visibility = "visible";
        this.#nextFlipPage.style.transformOrigin = transformOrigin;
        
        //

        this.#computeFlip();

        this.addEventListener("pointermove", this.#boundPointerMoveHandler);
        this.addEventListener("pointerup", this.#boundPointerUpHandler);
        this.addEventListener("pointercancel", this.#boundPointerCancelHandler);
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    #pointerMoveHandler( event )
    {
        const bounds = this.getBoundingClientRect();
        this.#mouse = new Point()
        this.#mouse.x = event.clientX - bounds.left;
        this.#mouse.y = event.clientY - bounds.top;

        this.#computeFlip();
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    #pointerUpHandler( event )
    {
        this.removeEventListener("pointermove", this.#boundPointerMoveHandler);

        //this.releasePointerCapture( event.pointerId );

        const bounds = this.getBoundingClientRect();
        this.#mouse = new Point()
        this.#mouse.x = event.clientX - bounds.left;
        this.#mouse.y = event.clientY - bounds.top;

        const cx = this.offsetWidth / 2;
        if( (this.#dirX === 1 && this.#mouse.x >= cx) || (this.#dirX === -1 && this.#mouse.x < cx) )
        {
            console.log( "back to initial state" );
        }
        else
        {
            console.log( "finalize flip" );
        }

        //this.#computeFlip();
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    #pointerCancelHandler( event )
    {

    }

    #computeFlip()
    {
        const middle = Point.middlePoint( this.#mouse, this.#corner );

        const hypotenus = Point.distance( this.#mouse, this.#corner );
        console.log( "hypotenus = " + hypotenus);

        const adjacent = Point.distance( new Point(this.#mouse.x, this.#corner.y), this.#corner  );
        console.log( "adjacent = " + adjacent );

        const opposite = Point.distance( this.#mouse, new Point(this.#mouse.x, this.#corner.y) );
        console.log( "opposite = " + opposite );
        
        const cos = adjacent / hypotenus;
        // const sin = Math.PI / 2 - cos;

        const cosRadians = Math.acos( cos );
        console.log( "cosRadians = " + cosRadians );

        const cosDegrees = MathUtils.radiansToDegrees( cosRadians );
        console.log( "cosDegrees = " + cosDegrees );

        const angle = cosDegrees * 2 * this.#dirY;
        console.log( "angle = " + angle );
        
        // find the 2 next points
        const middleDistance = Point.distance( middle, this.#corner );
        
        // horizontal Point
        const hypotenusH = middleDistance / cos;
        console.log( "hypotenusH = " + hypotenusH );

        //const pointH = new Point( corner.x - hypotenusH, corner.y );
        //console.log( pointH );
        
        // vertical Point
        const hypotenusV = middleDistance / Math.sin(cosRadians);
        console.log( "hypotenusV = " + hypotenusV );

        // const pointV = new Point( corner.x, corner.y - hypotenusV );
        //console.log( pointV );
        
        this.#nextFlipPage.style.left = this.#mouse.x + "px";
        this.#nextFlipPage.style[this.#stylePropY] = opposite + "px";
        this.#nextFlipPage.style.transform = "rotate(" + angle + "deg)";

        // next page orner point for clipPath
        const nextPagePointC = new Point(0, this.#corner.y);
        const nextPagePointV = new Point(0, this.#corner.y - hypotenusV * this.#dirY);
        const nextPagePointH = new Point(hypotenusH, this.#corner.y);

        let nextPagePath = nextPagePointC.x + "px " + nextPagePointC.y +"px, "; 
        nextPagePath = nextPagePath + nextPagePointV.x + "px " + nextPagePointV.y + "px, ";
        nextPagePath = nextPagePath + nextPagePointH.x + "px " + nextPagePointH.y + "px";
        this.#nextFlipPage.style.clipPath = "polygon(" +  nextPagePath + ")";

        const cx = this.offsetWidth / 2;
        const cy = this.offsetHeight / 2;

        let currentPagePath = "0px " + ( cy + cy * -this.#dirY ) + "px, "; 
        currentPagePath = currentPagePath + cx + "px " + ( cy + cy * -this.#dirY ) + "px,";
        currentPagePath = currentPagePath + cx + "px " + (this.#corner.y - hypotenusV * this.#dirY) + "px, ";
        currentPagePath = currentPagePath + (cx - hypotenusH) + "px " + this.#corner.y + "px, ";
        currentPagePath = currentPagePath + "0px " + this.#corner.y + "px";
        
        //console.log(currentPagePath);
        
        this.#currentFlipPage.style.clipPath = "polygon(" +  currentPagePath + ")";
    }
}

window.customElements.define("axial-flipbook-base", AxialFlipbookBase);
export { AxialFlipbookBase }