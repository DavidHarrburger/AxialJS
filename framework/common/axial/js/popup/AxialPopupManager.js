"use strict"

import { AxialPopupBase } from "./AxialPopupBase.js";

class AxialPopupManager
{
    static #POPUPS = new Set();
    static get POPUPS() { return AxialPopupManager.#POPUPS; }

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
            if( popup.id == id )
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
            
            if( AxialPopupManager.#currentPopup.animation == "none" )
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