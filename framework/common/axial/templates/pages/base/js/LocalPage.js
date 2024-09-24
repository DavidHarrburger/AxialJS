"use strict"

import { GlobalPage } from "../../../js/GlobalPage.js";

class LocalPage extends GlobalPage
{
    constructor()
    {
        super();
    }

    _onApplicationDomLoaded( event )
    {
        super._onApplicationDomLoaded( event );
    }

    _onApplicationPageLoaded( event )
    {
        super._onApplicationPageLoaded( event );
    }
}

export { LocalPage }