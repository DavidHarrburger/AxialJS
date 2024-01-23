"use strict"

import { GlobalPage } from "../../../js/GlobalPage.js";
import { Axial3DViewer } from "../../../../axial/js/3d/Axial3DViewer.js";

import * as THREE from "three";

class LocalPage extends GlobalPage
{
    /** @type { Axial3DViewer } */
    #viewer;

    /** @type { Function } */
    #boundRenderHandler;

    constructor()
    {
        super();
        this.#boundRenderHandler = this.#renderHandler.bind(this);
    }
    _onApplicationDomLoaded( event )
    {
        super._onApplicationDomLoaded( event );

        this.#viewer = document.getElementById("viewer");
        //this.#viewer.addEventListener( "render", this.#boundRenderHandler);
        
        //this.#viewer.renderer.setClearColor( "#262837" );
        //this.#viewer.renderer.shadowMap.enabled = true;
        this.#viewer.gui.hide();
    }

    _onApplicationPageLoaded( event )
    {
        super._onApplicationPageLoaded( event );
        this.#buildPage();
    }

    #renderHandler( event )
    {
        const eTime = event.detail.eTime;
    }

    #buildPage()
    {
        this.#viewer.startRendering();
    }
}
export { LocalPage }