"use strict"

import { AxialComponentBase } from "../core/AxialComponentBase";
import { AxialPopupManager } from "./AxialPopupManager";

/**
 * @public
 * Base class for all the Axial Popup components. 
 * @extends AxialComponentBase
 */
class AxialPopupBase extends AxialComponentBase
{
    // events
    #boundPopupClickHandler;
    #boundPopupHiddenHandler;

    /** @type { Number } */
    #offset = 0;

    /** @type { Number } */
    #arrowSize = 10;
    
    #arrowColor = "#fff"; // todo

    /** @type { Boolean } */
    #useArrow = false;

    /** @type { Boolean } */
    #useObfuscator = false;

    /** @type { Boolean } */
    #isModal = false;

    /** @type { String } */
    #displayMode = "none";

    #animation = "none";
    #animationShow = "none";
    #animationHide = "none";

    #horizontalAlignment;
    #verticalAlignment;

    #privilegedTargetAxis = "horizontal";

    /** @type { HTMLElement } */
    #arrow;

    /** @type { HTMLElement | undefined} */
    #target = undefined;

    constructor()
    {
        super();
        
        this.#boundPopupClickHandler = this.#popupClickHandler.bind(this);
        this.#boundPopupHiddenHandler = this.#popupHiddenHandler.bind(this);

        this.addEventListener("pointerdown", this.#boundPopupClickHandler);
        this.addEventListener("popupHidden", this.#boundPopupHiddenHandler);

        this.classList.add("axial_popup_base");
        this.isResizable = true;
        
        this.#arrow = document.createElement("div");
        this.#arrow.classList.add("axial_popup_base_arrow");
        this.appendChild(this.#arrow);

        AxialPopupManager.registerPopup( this );        
    }

    /**
     * @public
     * Get or set the size of the arrow in pixels. Default : 10.
     * @type { Number }
     * @param { Number } - The size of the arrow
     * @return { Number }
     * @default 10
     */
    static get arrowSize() { return this.#arrowSize; }
    static set arrowSize( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value expected");
        }
        if( value == this.#arrowSize ) { return; }
        this.#arrowSize = value;
    }

    /**
     * @public
     * Return the arrow HTMLDivElement. 
     * @type { HTMLDivElement }
     * @return { HTMLDivElement }
     */
    get arrow() { return this.#arrow; }

    /**
     * @public
     * Indicate if an arrow is used or not.
     * @type { Boolean }
     * @param { Boolean } value
     * @return { Boolean }
     * @default false
     */
    get useArrow() { return this.#useArrow; }
    set useArrow( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new Error("Boolean value expected");
        }
        if( value == this.#useArrow ) { return; }
        this.#useArrow = value;
        this.#normalizePosition();
    }

    /**
     * @public
     * The distance in pixels we let between the popup and its target if defined
     * @type { Number }
     * @param { Number } value
     * @return { Number }
     * @default 2
     */
    get offset() { return this.#offset; }
    set offset( value )
    {
        if( isNaN(value) == true )
        {
            throw new Error("Number value expected");
        }
        if( value == this.#offset ) { return; }
        this.#offset = value;
        this.#normalizePosition();
    }

    /**
     * @public
     * Get or set if the obfuscator layer is used when the popup is displayed.
     * You can't change this value once the popup is displayed.
     * @type { Boolean }
     * @param { Boolean } value
     * @return { Boolean }
     * @default false
     */
    get useObfuscator() { return this.#useObfuscator; }
    set useObfuscator( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value expected");
        }
        if( AxialPopupManager.currentPopup == this )
        {
            return;
        }
        if( value == this.#useObfuscator ) { return; }
        this.#useObfuscator = value;
    }

    /**
     * @public
     * Get or set the popup modal or non-modal. If modal, the web app can't receive any interaction until the popup was explicity closed. 
     * @type { Boolean }
     * @param { Boolean } value
     * @return { Boolean }
     * @default false
     */
    get isModal() { return this.#isModal; }
    set isModal( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value expected");
        }
        if( value == this.#isModal ) { return; }
        this.#isModal = value;
    }

    /**
     * @public
     * Get or set the target where the popup will be displayed. if setted the displayMode prop automatically switch to 'target'. 
     * @type { HTMLElement }
     * @param { HTMLElement } value
     * @return { HTMLElement }
     * @default undefined
     */
    get target() { return this.#target; }
    set target( value )
    {
        if( value instanceof HTMLElement == false )
        {
            throw new TypeError("HTMLElement value expected");
        }
        // do control here value can be null or undefined or html element
        if( value == this.#target ) { return; }
        
        this.#target = value;
        this.#displayMode = "target";
        this.#normalizePosition();
    }

    /**
     * @public
     * Get or set how the popup is displayed. 
     * Possible value are 'none' | 'window' | 'target'. 
     * @type { String }
     * @param { String } value
     * @return { String }
     * @default none
     */
    get displayMode() { return this.#displayMode; }
    set displayMode( value )
    {
        if( typeof value !== "string" ) { throw new Error("String value expected : 'none', 'window', 'target'"); }
        if( AxialPopupManager.DISPLAY_MODES.has(value) == false ) { throw new Error("String value expected : 'none', 'window', 'target'"); }
        if( value == this.#displayMode ) { return; }
        if( AxialPopupManager.isPlaying == true ) { return; }

        this.#displayMode = value;
        this.#normalizePosition();
    }

    get animation() { return this.#animation; }
    set animation( value )
    {
        if( typeof value !== "string" ) { throw new Error("String value expected : 'none', 'fade', 'translate_up', 'translate_down', 'translate_left', 'translate_right', 'fade_translate_up', 'fade_translate_down', 'fade_translate_left', 'fade_translate_right'"); }
        if( AxialPopupManager.ANIMATIONS .has(value) == false ) { throw new Error("String value expected : 'none', 'fade', 'translate_up', 'translate_down', 'translate_left', 'translate_right', 'fade_translate_up', 'fade_translate_down', 'fade_translate_left', 'fade_translate_right'"); }
        if( value == this.#animationShow ) { return; }
        if( AxialPopupManager.isPlaying == true ) { return; }

        this.#animationShow = value;
        this.#animationHide = value;
    }

    get animationShow() { return this.#animationShow; }
    set animationShow( value )
    {
        if( typeof value !== "string" ) { throw new Error("String value expected : 'none', 'fade', 'translate_up', 'translate_down', 'translate_left', 'translate_right', 'fade_translate_up', 'fade_translate_down', 'fade_translate_left', 'fade_translate_right'"); }
        if( AxialPopupManager.ANIMATIONS .has(value) == false ) { throw new Error("String value expected : 'none', 'fade', 'translate_up', 'translate_down', 'translate_left', 'translate_right', 'fade_translate_up', 'fade_translate_down', 'fade_translate_left', 'fade_translate_right'"); }
        if( value == this.#animationShow ) { return; }
        if( AxialPopupManager.isPlaying == true ) { return; }

        this.#animationShow = value;
    }

    get animationHide() { return this.#animationHide; }
    set animationHide( value )
    {
        if( typeof value !== "string" ) { throw new Error("String value expected : 'none', 'fade', 'translate_up', 'translate_down', 'translate_left', 'translate_right', 'fade_translate_up', 'fade_translate_down', 'fade_translate_left', 'fade_translate_right'"); }
        if( AxialPopupManager.ANIMATIONS .has(value) == false ) { throw new Error("String value expected : 'none', 'fade', 'translate_up', 'translate_down', 'translate_left', 'translate_right', 'fade_translate_up', 'fade_translate_down', 'fade_translate_left', 'fade_translate_right'"); }
        if( value == this.#animationHide ) { return; }
        if( AxialPopupManager.isPlaying == true ) { return; }

        this.#animationHide = value;
    }

    /**
     * @public
     * Get or set the horizontal alignment. This property is ignored if displayMode is setted on 'none'. 
     * Possible values are 'none' | 'left' | 'center' | 'right'. 
     * @type { String }
     * @param { String } value
     * @return { String }
     * @default none
     */
    get horizontalAlignment() { return this.#horizontalAlignment; }
    set horizontalAlignment( value )
    {
        if( typeof value !== "string" ) { throw new Error("String value expected : 'none', 'left', 'center', 'right'"); }
        if( AxialPopupManager.HORIZONTAL_ALIGNMENTS.has( value ) == false ) { throw new Error("String value expected : 'none', 'left', 'center', 'right'"); }
        if( value == this.#horizontalAlignment ) { return; }
        if( AxialPopupManager.isPlaying == true ) { return; }

        this.#horizontalAlignment = value;
        this.#normalizePosition();
    }

    /**
     * @public
     * Get or set the horizontal alignment. This property is ignored if displayMode is setted on 'none'. 
     * Possible value are 'none' | 'top' | 'center' | 'bottom'. 
     * @type { String }
     * @param { String } value
     * @return { String }
     * @default none
     */
    get verticalAlignment() { return this.#verticalAlignment; }
    set verticalAlignment( value )
    {
        if( typeof value !== "string" ) { throw new Error("String value expected : 'none', 'top', 'center', 'bottom'"); }
        if( AxialPopupManager.VERTICAL_ALIGNMENTS.has( value ) == false ) { throw new Error("String value expected : 'none', 'top', 'center', 'bottom'"); }
        if( value == this.#verticalAlignment ) { return; }
        if( AxialPopupManager.isPlaying == true ) { return; }

        this.#verticalAlignment = value;
        this.#normalizePosition();
    }

    /**
     * @public
     * Get or set the privileged axis for displaying the popup when target is setted. This property is ignored if displayMode is setted on 'none' or 'window'. 
     * Possible value are 'horizontal' | 'vertical'. Default is horizontal.
     * @type { String }
     * @param { String } value
     * @return { String }
     * @default horizontal
     */
    get privilegedTargetAxis() { return this.#privilegedTargetAxis; }
    set privilegedTargetAxis( value )
    {
        if( typeof value !== "string" ) { throw new Error("String value expected : 'horizontal' or 'vertical'"); }
        if( AxialPopupManager.PRIVILEGED_AXIS.has( value ) == false ) { throw new Error("String value expected : 'horizontal' or 'vertical'"); }
        if( value == this.#privilegedTargetAxis ) { return; }
        if( AxialPopupManager.isPlaying == true ) { return; }

        this.#privilegedTargetAxis = value;
        this.#normalizePosition();
    }

    /**
     * @private
     * Position the popup
     */
    #normalizePosition()
    {
        // ensure nothing happen if a popup is showhing / hiding
        if( AxialPopupManager.isPlaying == true ) { return; }
        //console.log("AxialPopupBase.#normalizePosition()");

        // get the needed vars
        const pw = this.offsetWidth;
        const ph = this.offsetHeight;
        const ww = window.innerWidth;
        const wh = window.innerHeight;

        switch( this.#displayMode )
        {
            case "none":
                this.style.left = "initial";
                this.style.top = "initial";
            break;

            case "window":
                switch(this.#horizontalAlignment)
                {
                    case "none":
                        this.style.left = "initial";
                    break;

                    case "left":
                        const hxl = 0;
                        this.style.left = String(hxl) + "px";
                    break;

                    case "center":
                        const hxc = (ww - pw) / 2;
                        this.style.left = String(hxc) + "px"; // no offset here

                    break;

                    case "right":
                        const hxr = ww - pw;// - this.offset;
                        this.style.left = String(hxr) + "px";
                    break;

                    default:
                        this.style.left = "initial";
                    break;
                }

                switch(this.#verticalAlignment)
                {
                    case "none":
                        this.style.top = "initial";
                    break;

                    case "top":
                        const hyt = 0;//this.offset;
                        this.style.top = String(hyt) + "px";
                    break;

                    case "center":
                        const hyc = (wh - ph) / 2;
                        this.style.top = String(hyc) + "px";
                    break;

                    case "bottom":
                        const hyb = wh - ph;
                        this.style.top = String(hyb) + "px";
                    break;
                }
            break;

            case "target":
                if( this.#target == undefined ) { return; }

                let popupX; let popupY;

                const targetRect = this.#target.getBoundingClientRect();
                const popupRect = this.getBoundingClientRect();

                let targetHorizontalCenter = targetRect.left + (targetRect.width / 2);
                let targetVerticalCenter = targetRect.top + (targetRect.height / 2);

                let arrowPosition = "right"; // empty string ? // 2022 re intoduce arrow later

                switch( this.#horizontalAlignment )
                {
                    case "none":
                        this.style.left = "initial";
                    break;

                    case "left":
                        if( this.#privilegedTargetAxis == "horizontal" )
                        {
                            popupX = targetRect.left - popupRect.width - this.#offset;
                            
                            if( this.#useArrow == true ) { popupX -= this.#arrowSize; }
                            arrowPosition = "left";
                            
                        }
                        else
                        {
                            popupX = targetRect.left - popupRect.width + targetRect.width;
                        }
                    break;

                    case "center":
                        popupX = targetRect.left + (targetRect.width / 2) - (popupRect.width / 2); // no offset here
                    break;

                    case "right":
                        if( this.#privilegedTargetAxis == "horizontal" )
                        {
                            popupX = targetRect.left + targetRect.width + this.#offset;
                            
                            if( this.#useArrow == true ) { popupX += this.#arrowSize; }
                            arrowPosition = "right";
                            
                        }
                        else
                        {
                            popupX = targetRect.left;
                        }
                    break;
                    
                    default:
                        this.style.left = "initial";
                    break;
                }
                

                switch(this.#verticalAlignment)
                {
                    case "none":
                        this.style.top = "initial";
                    break;

                    case "top":
                        if( this.#privilegedTargetAxis == "vertical" )
                        {
                            popupY = targetRect.top - targetRect.height - this.#offset;
                            
                            if( this.#useArrow == true ) { popupY -= this.#arrowSize; }
                            arrowPosition = "top";
                            
                        }
                        else
                        {
                            popupY = targetRect.top + targetRect.height - popupRect.height;
                        }
                    break;

                    case "center":
                        popupY = targetRect.top + (targetRect.height / 2) - (popupRect.height / 2);
                    break;

                    case "bottom":
                        if( this.#privilegedTargetAxis == "vertical" )
                        {
                            popupY = targetRect.top + targetRect.height + this.#offset;
                            
                            if (this.#useArrow == true) { popupY += this.#arrowSize; }
                            arrowPosition = "bottom";
                            
                        }
                        else
                        {
                            popupY = targetRect.top;
                        }
                    break;
                    
                    default:
                        this.style.top = "initial";
                    break;
                }

                // x boundaries corrections
                /*
                if( popupX != undefined )
                {
                    if( (popupX + popupRect.width ) >= ww ) // popup on right -> display on left
                    {
                        if( this._privilegedTargetAxis == "horizontal" )
                        {
                            popupX = targetRect.left - popupRect.width - this._offset;
                            if( this._useArrow == true ) { popupX -= AxialPopupBase.ARROW_SIZE; }
                            arrowPosition = "left";
                        }
                        else
                        {
                            popupX = targetRect.left - popupRect.width + targetRect.width;
                        }
                    }
                    else if( popupX <= 0 ) // popup on left -> display on right
                    {
                        if( this._privilegedTargetAxis == "horizontal" )
                        {
                            popupX = targetRect.left - popupRect.width - this._offset;
                            if( this._useArrow == true ) { popupX -= AxialPopupBase.ARROW_SIZE; }
                            arrowPosition = "left";
                        }
                        else
                        {
                            popupX = targetRect.left - popupRect.width + targetRect.width;
                        }
                    }
                }
                */
                
                // y boundaries corrections
                /*
                if( popupY != undefined )
                {
                    if( (popupY + popupRect.height) >= wh ) // popup on bottom -> display on top
                    {
                        if( this._privilegedTargetAxis == "vertical" )
                        {
                            popupY = targetRect.top - targetRect.height - this._offset;
                            if( this._useArrow == true ) { popupY -= AxialPopupBase.ARROW_SIZE; }
                            arrowPosition = "top";
                        }
                        else
                        {
                            popupY = targetRect.top + targetRect.height - popupRect.height;
                        }                        
                    }
                    else if( popupY <= 0 ) // popup on top -> display on bottom
                    {
                        
                        if( this._privilegedTargetAxis == "vertical" )
                        {
                            popupY = targetRect.top + targetRect.height + this._offset;
                            if (this._useArrow == true) { popupY += AxialPopupBase.ARROW_SIZE; }
                            arrowPosition = "bottom";
                        }
                        else
                        {
                            popupY = targetRect.top;
                        }
                    }
                }
                */

                // ARROW
                
                this.#arrow.style.display = "none";
                let arrowClasses = this.#arrow.classList;
                let arrowClassesLength = arrowClasses.length;

                for( let c = 0; c < arrowClassesLength; c++ )
                {
                    let css = arrowClasses[c];
                    if (css.indexOf("ax-popup-arrow-") == 0)
                    {
                        this.#arrow.classList.remove(css);
                    }
                }

                if( this.#useArrow == true )
                {
                    let newCss = "ax-popup-arrow-" + arrowPosition;
                    this.#arrow.classList.add(newCss);
                    this.#arrow.style.display = "block";

                    let arrowX; let arrowY;

                    if( arrowPosition == "left" )
                    {
                        arrowX = popupRect.width;
                        arrowY = (targetVerticalCenter - popupY) - this.#arrowSize;
                    }
                    else if( arrowPosition == "right" )
                    {
                        arrowX = -this.#arrowSize;
                        arrowY = (targetVerticalCenter - popupY) - this.#arrowSize;
                    }
                    else if( arrowPosition == "top" )
                    {
                        arrowX = popupRect.width;
                        arrowY = (targetHorizontalCenter - popupX) - this.#arrowSize;
                    }
                    else if( arrowPosition == "bottom" )
                    {
                        arrowX = (targetHorizontalCenter - popupX) - this.#arrowSize;
                        arrowY = -this.#arrowSize;
                    }
                    this.#arrow.style.left = arrowX + "px";
                    this.#arrow.style.top = arrowY + "px";
                }
                

                //console.log("popupX = " + popupX + " / popupY = " + popupY);
                if( popupX != undefined ) { this.style.left = String(popupX) + "px"; }
                if( popupY != undefined ) { this.style.top = String(popupY) + "px"; }
            break;

            default:
                this.style.left = "initial";
                this.style.top = "initial";
            break;
        }
    }

    /**
     * @public
     * Show the popup. You can override this method to perform some action before showing. 
     * You can also override the onShowing and onShown method. 
     */
    show()
    { 
        this.#show();
    }

    #show()
    {
        this.#normalizePosition();
        AxialPopupManager.showPopup(this);
    }

    /**
    * @public
    * Hide the popup. You can override this method to perform some action before hiding. 
    * You can also override the onHiding and onHidden method. 
    */
    hide()
    {
        this.#hide();
    }

    #hide()
    {
        this.#normalizePosition();
        AxialPopupManager.hidePopup();
    }

    /**
     * @private
     * Prevent the popup from being closed if user click outside of its DOMRect
     * @param { Event } event 
     */
    #popupClickHandler( event ) { event.stopImmediatePropagation(); }

    #popupHiddenHandler( event )
    {
        //console.log("coucou popup hidden");
        //console.log(AxialPopupManager.nextPopup);
    }

    /**
     * @override
     * Method that will be called each time the window is resized if the component is registered for.
     * Call the registerForResize() method to indicates the Axial App this component need to be resized.
     */
    _resize()
    {
        super._resize();
        this.#normalizePosition();
    }

    /** @override */
    _onShowing() {}

    /** @override */
    _onShown() {}

    /** @override */
    _onHiding() {}

    /** @override */
    _onHidden() {}
}
window.customElements.define("axial-popup-base", AxialPopupBase);
export { AxialPopupBase }