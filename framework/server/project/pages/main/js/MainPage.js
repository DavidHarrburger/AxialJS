"use strict"

import { GlobalPage } from "../../../js/GlobalPage.js";

import { AxialButton } from "../../../../axial/js/button/AxialButton.js";

class MainPage extends GlobalPage
{
    /// elements
    /** @type { AxialButton } */
    #infoButton;

    /// events
    /** @type { Function } */
    #boundInfoHandler;

    constructor()
    {
        super();

        this.#boundInfoHandler = this.#infoHandler.bind(this);
    }

    _onApplicationDomLoaded( event )
    {
        super._onApplicationDomLoaded( event );

        this.#infoButton = document.getElementById("infoButton");
        if( this.#infoButton )
        {
            this.#infoButton.addEventListener("click", this.#boundInfoHandler);
        }
    }

    _onApplicationPageLoaded( event )
    {
        super._onApplicationPageLoaded( event );
    }

    #infoHandler( event )
    {
        if( this.informationBar )
        {
            this.informationBar.show();
        }
    }
}
export { MainPage }