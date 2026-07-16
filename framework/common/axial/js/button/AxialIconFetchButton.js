"use strict";

import { AxialIconButton } from "./AxialIconButton.js";
import { AxialProgressIndicator } from "../loader/AxialProgressIndicator.js";
import { StringUtils } from "../utils/StringUtils.js";
import { FetchUtils } from "../utils/FetchUtils.js";
import { PathUtils } from "../utils/PathUtils.js";
import { ObjectUtils } from "../utils/ObjectUtils.js";

class AxialIconFetchButton extends AxialIconButton
{
    /// vars
    /** @type { String } */
    #operationPath;

    /** @type { String } */
    #operationMethod = "POST";

    /** @type { Boolean } */
    #isFetching = false;

    /** @type { String } */
    #query = "";

    /** @type { Object } */
    #body = {};

    /** @type { Object } */
    #fetchedData;

    /// elements
    /** @type { AxialProgressIndicator } */
    #indicator;

    /// events
    /** @type { Function } */
    #boundClickHandler;

    /** @type { Function } */
    #boundEnterHandler;

    /** @type { Function } */
    #boundLeaveHandler;

    constructor()
    {
        super();
        this.template = "axial-icon-fetch-button-template";
        this.#boundClickHandler = this.#clickHandler.bind(this);
        this.#boundEnterHandler = this.#enterHandler.bind(this);
        this.#boundLeaveHandler = this.#leaveHandler.bind(this);
    }

    static get observedAttributes()
    {
        return [ "axial-icon-name", "axial-tooltip-text" ];
    }

    /**
     * @type { Objetct }
     * @readonly
     */
    get fetchedData() { return this.#fetchedData; }

    get query() { return this.#query; }
    set query( value )
    {
        if( StringUtils.isWhite( value ) === true )
        {
            throw new TypeError("No white string here");
        }
        this.#query = value;
    }

    get body() { return this.#body; }
    set body( value )
    {
        if( ObjectUtils.isObject( value ) === false )
        {
            throw new TypeError("Object value required");
        }
        this.#body = value;
    }

    get operationPath() { return this.#operationPath; }
    set operationPath( value )
    {
        if( StringUtils.isWhite( value ) === true )
        {
            throw new TypeError("No white string here");
        }
        
        if( PathUtils.isRelative( value ) )
        {
            this.#operationPath = PathUtils.getPathFromRelative(value);
        }
        else
        {
            this.#operationPath = value;
        }
    }

    _buildComponent()
    {
        super._buildComponent();        
        this.#indicator = this.shadowRoot.getElementById("indicator");
        this.#indicator.style.visibility = "hidden";

        this.addEventListener("click", this.#boundClickHandler);
        this.addEventListener("pointerenter", this.#boundEnterHandler);
        this.addEventListener("pointerleave", this.#boundLeaveHandler);
    }

    /**
     * 
     * @param { PointerEvent } event 
     * @returns 
     */
    #clickHandler( event )
    {
        console.log("progress clicked before");
        if( this.#isFetching === true ) { return; }
        if( this.#operationPath == undefined || this.#operationPath == null ) { return; }
        console.log("progress clicked after");
        console.log(this.#operationPath);
        this.#fetchOperation();
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    #enterHandler( event )
    {
        if( this.#isFetching === true )
        {
            event.stopPropagation();
            event.stopImmediatePropagation();
        }
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    #leaveHandler( event )
    {
        if( this.#isFetching === true )
        {
            event.stopPropagation();
            event.stopImmediatePropagation();
        }
    }

    async #fetchOperation()
    {
        console.log("icon button fetching");
        if( this._onFetching )
        {
            this._onFetching();
        }
        console.log( this.#body );
        try
        {
            this.#isFetching = true;
            
            if( this.icon ) { this.icon.style.visibility = "hidden"; }
            if( this.foreground ) { this.foreground.style.display = "none";  }
            if( this.#indicator )
            {
                this.#indicator.style.visibility = "visible";
                this.#indicator.show();
            }

            let json;
            if( this.#operationMethod === "POST" )
            {
                json = await FetchUtils.POST( this.#operationPath, this.#body );
            }
            else if( this.#operationMethod === "GET" )
            {
                json = await FetchUtils.GET( this.#operationPath, this.#query );
            }
            else
            {
                // just in case
                throw new Error("private field operationMethod wrong value");
            }

            if( json ) { this.#fetchedData = json; }
            
            this._onFetchSuccess();
            const fetchEvent = new CustomEvent("fetchSuccess", { bubbles: true, detail: { data: this.#fetchedData } } );
            this.dispatchEvent(fetchEvent);
            
        }
        catch(err)
        {
            this._onFetchError();
            const fetchEvent = new CustomEvent("fetchError");
            this.dispatchEvent(fetchEvent);
        }
        finally
        {
            this.#isFetching = false;
            if( this.icon ) { this.icon.style.visibility = "visible"; }
            if( this.foreground ) { this.foreground.style.display = "block";  }
            if( this.#indicator )
            {
                this.#indicator.style.visibility = "hidden";
                this.#indicator.hide();
            }
        }
    }

    /**
     * Prepare your data just before the fetch operation
     * @abstract
     */
    _onFetching() {}

    /**
     * @abstract
     */
    _onFetchSuccess() {}

    /**
     * @abstract
     */
    _onFetchError() {}
    
}

window.customElements.define("axial-icon-fetch-button", AxialIconFetchButton);
export { AxialIconFetchButton }