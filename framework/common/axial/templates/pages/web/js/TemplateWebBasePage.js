"use strict";

import { AxialWebApplicationBase } from "../../../../axial/js/core/AxialWebApplicationBase.js";

class TemplateWebBasePage extends AxialWebApplicationBase
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

    _onApplicationUserReady()
    {
        super._onApplicationUserReady();
        console.log("user ready");
    }
}

export { TemplateWebBasePage }