"use strict";

import { AxialWebModuleApplicationBase } from "../../../../axial/js/core/AxialWebModuleApplicationBase.js";

class AdminPage extends AxialWebModuleApplicationBase
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

    /**
     * 
     * @param { AxialViewBase } view 
     */
    _onApplicationViewChanged( view )
    {
        
    }

    /**
     * 
     * @param { AxialPopupBase } popup 
     */
    _onApplicationPopupHidden( popup )
    {
        
    }
}

export { AdminPage }