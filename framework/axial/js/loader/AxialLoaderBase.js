"use strict"

class AxialLoaderBase
{
    #resources = new Array();
    #resourcesLength = 0;
    #currentIndex = -1;
    #boundResourceLoadedHandler;
    #boundImageLoadedHandler;

    constructor()
    {
        this.#boundResourceLoadedHandler = this.#resourceLoadedHandler.bind(this);
        this.#boundImageLoadedHandler = this.#imageLoadedHandler.bind(this);
    }

    #resourceLoadedHandler( event )
    {
        if( event.target.readyState == 4 )
        {
            if( event.target.status == 200 )
            {
                if( this.#currentIndex == (this.#resourcesLength -1) )
                {
                    // hire the latest progress to make a diff with complete
                    this.#onLoaderProgess();
                    let loaderProgressEvent = new Event("loaderprogress");
                    loaderProgressEvent.count = (this.#currentIndex + 1);
                    loaderProgressEvent.max = this.#resourcesLength;
                    window.dispatchEvent(loaderProgressEvent);
                    
                    this.#onLoaderComplete();
                    let loaderCompleteEvent = new Event("loadercomplete");
                    window.dispatchEvent(loaderCompleteEvent);
                }
                else
                {
                    this.#onLoaderProgess();
                    let loaderProgressEvent = new Event("loaderprogress");
                    loaderProgressEvent.count = (this.#currentIndex + 1);
                    loaderProgressEvent.max = this.#resourcesLength;
                    window.dispatchEvent(loaderProgressEvent);
                    this.#loadResource();
                }
            }
        }
    }

    #imageLoadedHandler( event )
    {
        if( this.#currentIndex == (this.#resourcesLength -1) )
        {
            // hire the latest progress to make a diff with complete
            this.#onLoaderProgess();
            let loaderProgressEvent = new Event("loaderprogress");
            loaderProgressEvent.count = (this.#currentIndex + 1);
            loaderProgressEvent.max = this.#resourcesLength;
            window.dispatchEvent(loaderProgressEvent);
            
            this.#onLoaderComplete();
            let loaderCompleteEvent = new Event("loadercomplete");
            window.dispatchEvent(loaderCompleteEvent);
        }
        else
        {
            this.#onLoaderProgess();
            let loaderProgressEvent = new Event("loaderprogress");
            loaderProgressEvent.count = (this.#currentIndex + 1);
            loaderProgressEvent.max = this.#resourcesLength;
            window.dispatchEvent(loaderProgressEvent);
            this.#loadResource();
        }
    }

    get hasResources() { return this.#resources.length > 0; }

    _onLoaderStarted() {}
    #onLoaderStarted()
    {
        this._onLoaderStarted();
    }

    _onLoaderProgess() {}
    #onLoaderProgess()
    {
        this._onLoaderProgess();
    }

    _onLoaderComplete() {}
    #onLoaderComplete()
    {
        this._onLoaderComplete();
    }
    
    addResource( value = "" )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value expected");
        }
        // should check all white strings w/ RegEx
        if( value == "" )
        {
            throw new Error("A non-empty String value is required");
        }
        if( this.#resources.includes(value) == false )
        {
            this.#resources.push(value);
        }
    }

    start()
    {
        this.#resourcesLength = this.#resources.length;
        this.#currentIndex = -1;

        this.#onLoaderStarted();
        let loaderStartedEvent = new Event("loaderstarted");
        window.dispatchEvent(loaderStartedEvent);

        if( this.#resourcesLength > 0 )
        {
            this.#loadResource();
        }
        else
        {
            this.#onLoaderComplete();
            let loaderCompleteEvent = new Event("loadercomplete");
            window.dispatchEvent(loaderCompleteEvent);
        }
    }

    #loadResource()
    {
        this.#currentIndex += 1;
        let resource = this.#resources[this.#currentIndex];
        
        /*
        let request = new XMLHttpRequest()
        request.addEventListener( "readystatechange", this.#boundResourceLoadedHandler, false);
        request.open("GET", resource, true);
        request.send();
        */

        let loader = new Image();
        loader.addEventListener("load", this.#boundImageLoadedHandler);
        loader.src = resource;

        
    }
}

export { AxialLoaderBase }