"use strict"

import { AxialPopupBase } from "./AxialPopupBase.js";

/**
 * @public
 * AxialPopupManager is an helper class that show and hide popups. It's responsible of the lifecycle of the popups.
 */
class AxialPopupManager
{
    // vars
    static #popups = new Set();
    static get popups()
    {
        return AxialPopupManager.#popups;
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

    // move duration and timing function to popup base
    // cubic-bezier(.47,1.64,.41,.8)
    static #animationDuration = 400;
    static get animationDuration() { return AxialPopupManager.#animationDuration; }
    static set animationDuration( value )
    {
        if( isNaN(value) == true ) { throw new Error("Number value expected"); }
        AxialPopupManager.#animationDuration = value;
    }

    static #animationTimingFunction = "ease";
    static get animationTimingFunction() { return AxialPopupManager.#animationTimingFunction; }
    static set animationTimingFunction( value )
    {
        AxialPopupManager.#animationTimingFunction = value;
    }

    static #DISPLAY_MODES = Object.freeze(new Set(["none", "window", "target"]));
    static get DISPLAY_MODES()
    {
        return AxialPopupManager.#DISPLAY_MODES;
    }

    static #ANIMATIONS = Object.freeze( new Set( ["none", "fade", "translate_up", "translate_down", "translate_left", "translate_right", "fade_translate_up", "fade_translate_down", "fade_translate_left", "fade_translate_right"] ) );
    static get ANIMATIONS()
    {
        return AxialPopupManager.#ANIMATIONS;
    }
    
    static #HORIZONTAL_ALIGNMENTS = Object.freeze(new Set(["none", "left", "center", "right"]));
    static get HORIZONTAL_ALIGNMENTS()
    {
        return AxialPopupManager.#HORIZONTAL_ALIGNMENTS;
    }

    static #VERTICAL_ALIGNMENTS = Object.freeze(new Set(["none", "top", "center", "bottom"]));
    static get VERTICAL_ALIGNMENTS()
    {
        return AxialPopupManager.#VERTICAL_ALIGNMENTS;
    }

    static #PRIVILEGED_AXIS = Object.freeze(new Set(["horizontal", "vertical"]));
    static get PRIVILEGED_AXIS()
    {
        return AxialPopupManager.#PRIVILEGED_AXIS;
    }

    // ui
    static get layer()
    {
        const element = document.getElementById("axialPopupLayer");
        return element;
    }

    static get obfuscator()
    {
        const element = document.getElementById("axialPopupObfuscator");
        return element;
    }

    // end new 2022

    static registerPopup( popup )
    {
        if( popup instanceof AxialPopupBase == false )
        {
            throw new TypeError( "AxialPopupBase value expected" );
        }

        if( AxialPopupManager.#popups.has(popup) == true )
        {
            throw new Error( "This instance of popup is already registered" );
        }
        AxialPopupManager.#popups.add( popup );
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
        for( const popup of AxialPopupManager.popups )
        {
            if( popup.id == id )
            {
                popupToReturn = popup;
                break;
            }
        }
        return popupToReturn;
    }

    /**
     * @public
     * @static
     * Show the AxialPopupBase and manage its lifecycle
     * @param { AxialPopupBase } popup - The popup we want to show
     * @returns { void }
     */
    static showPopup( popup )
    {
        if( popup instanceof AxialPopupBase == false )
        {
            throw new TypeError( "AxialPopupBase value expected" );
        }

        if( AxialPopupManager.#currentPopup != undefined )
        {
            if( AxialPopupManager.#currentPopup != popup )
            {
                AxialPopupManager.#nextPopup = popup;
                AxialPopupManager.hidePopup();
            }
            return;
        }

        // we ensure the document will not respond to click (that hides the popup)
        document.removeEventListener("pointerdown", AxialPopupManager.#documentPopupClickHandler, {capture: false} );

        if( AxialPopupManager.#currentPopup == undefined )
        {
            AxialPopupManager.#currentPopup = popup;
            
            const isModal = popup.isModal;
            if( isModal == false )
            {
                document.addEventListener("pointerdown", AxialPopupManager.#documentPopupClickHandler, {capture: false} );
            }

            const duration = String(AxialPopupManager.#animationDuration) + "ms";
            
            const useObfuscator = popup.useObfuscator;
            if( useObfuscator == true )
            {
                AxialPopupManager.obfuscator.style.visibility = "visible";
                AxialPopupManager.obfuscator.addEventListener("animationend", AxialPopupManager.#obfuscatorAnimationEndHandler);
                AxialPopupManager.obfuscator.style.animation = duration + " linear 0ms 1 normal both running axial_obfuscator_fade-in";
            }

            AxialPopupManager.#currentPopup.style.visibility = "visible";
            
            AxialPopupManager.#currentPopup._onShowing();

            let popupShowingEvent = new CustomEvent("popupShowing");
            AxialPopupManager.#currentPopup.dispatchEvent(popupShowingEvent);
            
            if( AxialPopupManager.#currentPopup.animationShow == "none" )
            {
                AxialPopupManager.#currentPopup._onShown();

                let popupShownEvent = new CustomEvent("popupShown");
                AxialPopupManager.#currentPopup.dispatchEvent(popupShownEvent);
            }
            else
            {
                AxialPopupManager.#isPlaying = true;
                const animationName = "axial_popup_" + AxialPopupManager.#currentPopup.animationShow + "-in";
                const atf = AxialPopupManager.#animationTimingFunction;
                const animationIn = duration + " " + atf + " 0ms 1 normal both running " + animationName;
                AxialPopupManager.#currentPopup.addEventListener("animationend", AxialPopupManager.#popupShowAnimationEndHandler);
                AxialPopupManager.#currentPopup.style.animation = animationIn;
            }
        }
        else
        {
            throw new Error("Incorrect call : a popup is already displayed. You have to hide the popup before showing a new one.");
            /// TODO a popup is already displayed and we want to show another one OR we want to show the same popup with different data or target
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
        if( AxialPopupManager.#currentPopup == undefined ) { return; } // no need to hide

        const duration = String(AxialPopupManager.#animationDuration) + "ms";
        
        const useObfuscator = AxialPopupManager.#currentPopup.useObfuscator;
        if( useObfuscator == true )
        {
            AxialPopupManager.obfuscator.addEventListener("animationend", AxialPopupManager.#obfuscatorAnimationEndHandler);
            AxialPopupManager.obfuscator.style.animation = duration + " linear 0ms 1 normal both running axial_obfuscator_fade-out";
        }

        AxialPopupManager.#currentPopup._onHiding();

        let popupHidingEvent = new CustomEvent("popupHiding");
        AxialPopupManager.#currentPopup.dispatchEvent(popupHidingEvent);
        
        if( AxialPopupManager.#currentPopup.animationHide == "none" )
        {
            AxialPopupManager.#currentPopup._onHidden();

            let popupHiddenEvent = new CustomEvent("popupHidden");
            AxialPopupManager.#currentPopup.dispatchEvent(popupHiddenEvent);

            AxialPopupManager.#currentPopup.style.visibility = "hidden";
            if( AxialPopupManager.#nextPopup !== undefined )
            {
                const nextPopup = AxialPopupManager.#nextPopup
                AxialPopupManager.#currentPopup = undefined;
                AxialPopupManager.#nextPopup = undefined;
                AxialPopupManager.showPopup(nextPopup);
            }
            else
            {
                AxialPopupManager.#currentPopup = undefined;
            }
            
        }
        else
        {
            AxialPopupManager.#isPlaying = true;
            const animationName = "axial_popup_" + AxialPopupManager.#currentPopup.animationHide + "-out";
            const atf = AxialPopupManager.#animationTimingFunction;
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
        AxialPopupManager.obfuscator.removeEventListener("animationend", AxialPopupManager.#obfuscatorAnimationEndHandler);

        const styles = window.getComputedStyle(AxialPopupManager.obfuscator);
        const opacity = Number(styles.opacity);
        if( opacity == 0 )
        {
            AxialPopupManager.obfuscator.style.visibility = "hidden";
        }
    }

    static #popupShowAnimationEndHandler( event )
    {
        //console.log("popup show animation end");
        AxialPopupManager.#currentPopup.removeEventListener("animationend", AxialPopupManager.#popupShowAnimationEndHandler);

        AxialPopupManager.#isPlaying = false;

        AxialPopupManager.#currentPopup._onShown();

        let popupShownEvent = new CustomEvent("popupShown");
        AxialPopupManager.#currentPopup.dispatchEvent(popupShownEvent);
    }

    static #popupHideAnimationEndHandler( event )
    {
        //console.log("popup hide animation end");
        const popup = AxialPopupManager.#currentPopup;
        const nextPopup = AxialPopupManager.#nextPopup;
        
        AxialPopupManager.#currentPopup = undefined;
        AxialPopupManager.#nextPopup = undefined;

        popup.removeEventListener("animationend", AxialPopupManager.#popupHideAnimationEndHandler);

        AxialPopupManager.#isPlaying = false;
        popup.style.visibility = "hidden";

        popup._onHidden();
        
        let popupHiddenEvent = new CustomEvent("popupHidden");
        popup.dispatchEvent(popupHiddenEvent);

        if( nextPopup != undefined )
        {
            AxialPopupManager.showPopup(nextPopup);
        }
    }
}

export { AxialPopupManager }