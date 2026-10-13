"use strcit";

import { FetchUtils } from "../utils/FetchUtils.js";
import { PathUtils } from "../utils/PathUtils.js";

class AxialErrorManager extends EventTarget
{
    /** @type { AxialErrorManager } */
    static #instance = null;

    /** @type { String } */
    #fetchPath = "./api/error/create";

    /// events
    /** @type { Function } */
    #boundScriptErrorHandler;

    /** @type { Function } */
    #boundUnhandledRejectionErrorHandler;

    constructor()
    {
        super();

        if( AxialErrorManager.#instance )
        {
            return AxialErrorManager.#instance;
        }

        AxialErrorManager.#instance = this;

        this.#fetchPath = PathUtils.getPathFromRelative(this.#fetchPath);

        this.#boundScriptErrorHandler          = this.#scriptErrorHandler.bind(this);
        this.#boundUnhandledRejectionErrorHandler = this.#unhandledRejectionErrorHandler.bind(this);

        window.addEventListener("error", this.#boundScriptErrorHandler, { capture: true } );
        window.addEventListener("unhandledrejection", this.#boundUnhandledRejectionErrorHandler );
        
    }

    static getInstance()
    {
        return AxialErrorManager.#instance ?? new AxialErrorManager();
    }

    /**
     * 
     * @param { String } type The message as a string
     * @param { Object } o A complementary object to give some additionnal details
     */
    async #report( type, o )
    {
        console.warn("[ERROR_MANAGER]")
        let hack;
        if( o && o.message && o.stack )
        {
            hack = { message: o.message, stack: o.stack }
        }
        else
        {
            hack = "unknown case";
        }
        const payload = 
        {
            t: type,
            w: "front",
            u: localStorage.getItem("axial_auth_uuid"),
            f: window.location.href,
            r: document.referrer,
            o: hack ?? o,
            d: new Date().toISOString()
        }

        const json = await FetchUtils.POST( this.#fetchPath, payload );
    }

    /**
     * 
     * @param {ErrorEvent} event 
     */
    #scriptErrorHandler( event )
    {
        console.log( event );
        //event.preventDefault();
        this.#report( "script", event.error );
    }

    
    #unhandledRejectionErrorHandler( event )
    {
        console.log( event );
        this.#report( "promise", event?.reason );
    }
}

export { AxialErrorManager }