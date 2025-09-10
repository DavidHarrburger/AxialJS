"use strict";

import { PathUtils } from "../utils/PathUtils.js";
import { AxialComponentBase } from "./AxialComponentBase.js";

class AxialServiceComponentBase extends AxialComponentBase
{
    /** @type { String } */
    #getPath;

    /** @type { Object } */
    #getData = undefined;

    /** @type { String } */
    #postPath;

    /** @type { Object } */
    #postData = undefined;

    /** @type { Object } */
    #postObject = {};

    /** @type { Boolean } */
    #isFetching = false;

    constructor()
    {
        super();
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#getPath = this.getAttribute("axial-get-path");
        if( this.#getPath && this.#getPath.indexOf("./") === 0 )
        {
            this.#getPath = PathUtils.getPathFromRelative(this.#getPath)
        }
        this.#postPath = this.getAttribute("axial-post-path");
        if( this.#postPath && this.#postPath.indexOf("./") === 0 )
        {
            this.#postPath = PathUtils.getPathFromRelative(this.#postPath)
        }
    }

    get getPath() { return this.#getPath; }
    set getPath( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#getPath = value;
    }

    /**
     * @readonly
     */
    get getData() { return this.#getData; }

    get postPath() { return this.#postPath; }
    set postPath( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#postPath = value;
    }

    /**
     * @readonly
     */
    get postData() { return this.#postData; }

    get postObject() { return this.#postObject; }
    set postObject( value )
    {
        this.#postObject = value;
    }

    /**
     * Start the private 'callService' if servicePath is provided. You can override to provide your own logic
     * @public
     */
    async loadGetData()
    {
        console.log("getdata");
        await this.#loadGetData();
    }

    /**
     * Override to implement your own logic
     * @private
     */
    async #loadGetData()
    {
        //console.log(this.#getPath);
        if( this.#getPath === undefined || this.#getPath === null ) { return; }
        if( this.#isFetching === true ) { return; }
        this.#isFetching = true;
        try
        {
            const path = this._prepareGetData();
            console.log(path);
            const response = await fetch( path, { method: "GET", headers: { "Content-Type":"application/json", "Cache-Control":"no-cache" } } );
            const json = await response.json();
            this.#getData = json;
            const serviceEvent = new CustomEvent( "serviceSuccess", { detail: { data: this.#getData, method:"get" } } );
            this.dispatchEvent( serviceEvent );
        }
        catch(err)
        {
            console.log(err);
            const serviceEvent = new CustomEvent( "serviceError", { detail: { error: err.message, method: "get" } } );
            this.dispatchEvent( serviceEvent );
        }
        finally
        {
            this.#isFetching = false;
            this._onGetResponse();
        }
    }

    async loadPostData()
    {
        await this.#loadPostData();
    }

    async #loadPostData()
    {
        if( this.#postPath === undefined || this.#postPath === null ) { return; }
        if( this.#isFetching === true ) { return; }
        this.#isFetching = true;
        try
        {
            const infos = this._preparePostData();
            const response = await fetch(this.#postPath, { method: "POST", body: JSON.stringify(infos), headers: { "Content-Type":"application/json", "Cache-Control":"no-cache" } } );
            const json = await response.json();
            this.#postData = json;
                
            const serviceEvent = new CustomEvent( "serviceSuccess", { bubbles: true, detail: { data: this.#postData, method: "post" } } );
            this.dispatchEvent( serviceEvent );
        }
        catch(err)
        {
            console.log(err);
            const serviceEvent = new CustomEvent( "serviceError", { detail: { error: err.message, method: "post" } } );
            this.dispatchEvent( serviceEvent );
        }
        finally
        {
            this.#isFetching = false;
            this._onPostResponse();
        }
    }

    /**
     * Update component once data are loaded or not. Use _onGetResponse or _onPostResponse abstract methods
     * @abstract
     * @deprecated
     */
    _updateComponent() {}

    /**
     * Update component once get data are loaded or not
     * @abstract
     */
    _onGetResponse() {}

    /**
     * Update component once post data are loaded or not
     * @abstract
     */
    _onPostResponse() {}

    /**
     * Prepare the data as you want ;)
     * @abstract
     * @returns { Object }
     */
    _prepareGetData() { return this.#getPath; }

    /**
     * Prepare the data as you want ;)
     * @abstract
     * @returns { Object }
     */
    _preparePostData() { return this.#postObject; }
}

window.customElements.define("axial-service-component-base", AxialServiceComponentBase);
export { AxialServiceComponentBase }
