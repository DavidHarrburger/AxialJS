"use strict";

import { AxialPopupBase } from "./AxialPopupBase.js";

class AxialPopupManager
{
    /**
     * @static
     * @type { Set<AxialPopupBase }
     */
    static #POPUPS = new Set();

    /**
     * @static
     * @type { Array<AxialPopupBase }
     */
    static #STACK = new Array();

    /**
     * @type { Number }
     * @static
     * @private
     */
    static #Z = 300;
    
    /**
     * @readonly
     */
    static get POPUPS() { return AxialPopupManager.#POPUPS; }

    /**
     * @readonly
     */
    static get STACK() { return AxialPopupManager.#STACK; }

    /**
     * @readonly
     */
    static get Z() { return AxialPopupManager.#Z; }

    static get LAYER() { return document.getElementById("axialPopupLayer"); }


    static get OBFUSCATOR()
    {
        return document.getElementById("axialPopupObfuscator");
    }

    static registerPopup( popup )
    {
        if( popup instanceof AxialPopupBase == false )
        {
            throw new TypeError( "AxialPopupBase value expected" );
        }

        if( AxialPopupManager.#POPUPS.has(popup) == true )
        {
            throw new Error( "This instance of popup is already registered" );
        }
        AxialPopupManager.#POPUPS.add( popup );
    }

    /**
     * @public
     * @static
     * Get a popup, if registered, with the wrapped element id. Returns undefined if the popup is not registered.
     * @param { String } id - The id of the element
     * @returns { AxialPopupBase } The popup, if found, is an instance of AxialPopupBase
     */
    static getPopupById( id )
    {
        if( typeof id !== "string" )
        {
            throw new TypeError("String value expected");
        }
        let popupToReturn = undefined;
        for( const popup of AxialPopupManager.POPUPS )
        {
            if( popup.id === id )
            {
                popupToReturn = popup;
                break;
            }
        }
        return popupToReturn;
    }

    /** @type { AxialPopupBase } */
    static #currentPopup = undefined;
    /**
     * @type { AxialPopupBase }
     */
    static get currentPopup()
    {
        return AxialPopupManager.#currentPopup;
    }

    /** @type { AxialPopupBase } */
    static #nextPopup = undefined;
    /**
     * @type { AxialPopupBase }
     */
    static get nextPopup()
    {
        return AxialPopupManager.#nextPopup;
    }

    static #isPlaying = false;
    static get isPlaying()
    {
        return AxialPopupManager.#isPlaying;
    }

    /**
     * @public
     * @static
     * Show the AxialPopupBase and manage its lifecycle
     * @param { AxialPopupBase } popup - The popup we want to show
     */
    static showPopup( popup )
    {
        if( popup instanceof AxialPopupBase === false )
        {
            throw new TypeError( "AxialPopupBase value expected" );
        }

        if( AxialPopupManager.#STACK.includes(popup) === true ) { return; }

        const popupIndex = AxialPopupManager.#STACK.length + AxialPopupManager.#Z;
        popup.style.zIndex = popupIndex;
        AxialPopupManager.#STACK.push( popup );
        console.log(AxialPopupManager.#STACK);

        // we ensure the document will not respond to click (that hides the popup)
        document.removeEventListener("pointerdown", AxialPopupManager.#documentPopupClickHandler, {capture: false} );
        
        AxialPopupManager.#currentPopup = popup; // change the getter, always the last index

                        
        const isModal = popup.isModal;
        if( isModal === false )
        {
            document.addEventListener("pointerdown", AxialPopupManager.#documentPopupClickHandler, {capture: false} );
        }

        const duration = String(AxialPopupManager.#currentPopup.duration) + "ms";
        
        const useObfuscator = popup.useObfuscator;
        if( useObfuscator == true )
        {
            AxialPopupManager.OBFUSCATOR.style.visibility = "visible";
            AxialPopupManager.OBFUSCATOR.addEventListener("animationend", AxialPopupManager.#obfuscatorAnimationEndHandler);
            AxialPopupManager.OBFUSCATOR.style.animation = duration + " linear 0ms 1 normal both running axial_obfuscator_fade-in";
        }

        AxialPopupManager.#currentPopup.style.visibility = "visible";
        
        AxialPopupManager.#currentPopup._onShowing();

        let popupShowingEvent = new CustomEvent("popupShowing");
        AxialPopupManager.#currentPopup.dispatchEvent(popupShowingEvent);
        
        if( AxialPopupManager.#currentPopup.animation === "none" )
        {
            AxialPopupManager.#currentPopup._onShown();
            let popupShownEvent = new CustomEvent("popupShown");
            AxialPopupManager.#currentPopup.dispatchEvent(popupShownEvent);
        }
        else
        {
            AxialPopupManager.#isPlaying = true;
            const animationName = "axial_popup_" + AxialPopupManager.#currentPopup.animation + "-in";
            const atf = AxialPopupManager.#currentPopup.timingFunction;
            const animationIn = duration + " " + atf + " 0ms 1 normal both running " + animationName;
            AxialPopupManager.#currentPopup.addEventListener("animationend", AxialPopupManager.#popupShowAnimationEndHandler);
            AxialPopupManager.#currentPopup.style.animation = animationIn;
        }
    }

    /**
     * @public
     * @static
     * Hide the current popup (ie if a popup is shown). Silent fail we call this method without a popup already displayed.
     * @returns { void }
     */
    static hidePopup()
    {
        // ensure the document pointer down handler is removed. It should be, but just in case
        document.removeEventListener("pointerdown", AxialPopupManager.#documentPopupClickHandler, {capture: false});
        
        // just in case
        if( AxialPopupManager.#currentPopup === undefined ) { return; } // no need to hide

        const duration = String(AxialPopupManager.#currentPopup.duration) + "ms";
        
        const useObfuscator = AxialPopupManager.#currentPopup.useObfuscator;
        if( useObfuscator == true )
        {
            AxialPopupManager.OBFUSCATOR.addEventListener("animationend", AxialPopupManager.#obfuscatorAnimationEndHandler);
            AxialPopupManager.OBFUSCATOR.style.animation = duration + " linear 0ms 1 normal both running axial_obfuscator_fade-out";
        }

        AxialPopupManager.#currentPopup._onHiding();

        let popupHidingEvent = new CustomEvent("popupHiding");
        AxialPopupManager.#currentPopup.dispatchEvent(popupHidingEvent);
        
        if( AxialPopupManager.#currentPopup.animation == "none" )
        {
            AxialPopupManager.#currentPopup._onHidden();
            let popupHiddenEvent = new CustomEvent("popupHidden");
            AxialPopupManager.#currentPopup.dispatchEvent(popupHiddenEvent);
            AxialPopupManager.#currentPopup.style.visibility = "hidden";

            AxialPopupManager.#STACK.pop();
            const stackLength = AxialPopupManager.#STACK.length;
            if( stackLength === 0 )
            {
                AxialPopupManager.#currentPopup = undefined;
            }
            else
            {
                AxialPopupManager.#currentPopup = AxialPopupManager.#STACK[stackLength-1];
            }
        }
        else
        {
            AxialPopupManager.#isPlaying = true;
            const animationName = "axial_popup_" + AxialPopupManager.#currentPopup.animation + "-out";
            const atf = AxialPopupManager.#currentPopup.timingFunction;
            const animationOut = duration + " " + atf + " 0ms 1 normal both running " + animationName;
            AxialPopupManager.#currentPopup.addEventListener("animationend", AxialPopupManager.#popupHideAnimationEndHandler);
            AxialPopupManager.#currentPopup.style.animation = animationOut;
        }
    }

    static #documentPopupClickHandler( event )
    {
        // avoid double click when showing / hiding
        if( AxialPopupManager.#isPlaying === true) { return; }

        // remove the listener to avoid double click
        document.removeEventListener("pointerdown", AxialPopupManager.#documentPopupClickHandler, {capture: false} );

        // this handler is added only if the popup is non modal. By the way, we expect to hide the popup
        AxialPopupManager.hidePopup();
    }

    static #obfuscatorAnimationEndHandler( event )
    {
        //console.log("obfuscator animation end");
        AxialPopupManager.OBFUSCATOR.removeEventListener("animationend", AxialPopupManager.#obfuscatorAnimationEndHandler);

        const styles = window.getComputedStyle(AxialPopupManager.OBFUSCATOR);
        const opacity = Number(styles.opacity);
        if( opacity == 0 )
        {
            AxialPopupManager.OBFUSCATOR.style.visibility = "hidden";
        }
    }

    static #popupShowAnimationEndHandler( event )
    {
        AxialPopupManager.#currentPopup.removeEventListener("animationend", AxialPopupManager.#popupShowAnimationEndHandler);
        AxialPopupManager.#isPlaying = false;
        AxialPopupManager.#currentPopup._onShown();
        let popupShownEvent = new CustomEvent("popupShown");
        AxialPopupManager.#currentPopup.dispatchEvent(popupShownEvent);
    }

    static #popupHideAnimationEndHandler( event )
    {
        AxialPopupManager.#currentPopup.removeEventListener("animationend", AxialPopupManager.#popupHideAnimationEndHandler);
        AxialPopupManager.#isPlaying = false;
        AxialPopupManager.#currentPopup._onHidden();
        let popupHiddenEvent = new CustomEvent("popupHidden");
        AxialPopupManager.#currentPopup.dispatchEvent(popupHiddenEvent);
        AxialPopupManager.#currentPopup.style.visibility = "hidden";

        AxialPopupManager.#STACK.pop();
        const stackLength = AxialPopupManager.#STACK.length;
        if( stackLength === 0 )
        {
            AxialPopupManager.#currentPopup = undefined;
        }
        else
        {
            AxialPopupManager.#currentPopup = AxialPopupManager.#STACK[stackLength-1];
        }
    }
}

export { AxialPopupManager }