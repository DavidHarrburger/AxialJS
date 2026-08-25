"use strict";

import { AxialOverlayBase } from "../overlay/AxialOverlayBase.js";
import { AxialListOverlayButton } from "../overlay/AxialListOverlayButton.js";
import { PathUtils } from "../utils/PathUtils.js";
import { FetchUtils } from "../utils/FetchUtils.js";
import { StringUtils } from "../utils/StringUtils.js";

class AxialAuthBoxOverlay extends AxialOverlayBase
{
    /// vars
    /** @type { String } */
    #signoutPath = "./api/auth/signout";

    /** @type { String } */
    #dashboardPath;

    /** @type { AxialListOverlayButton } */
    #dashboardButton;

    /** @type { AxialListOverlayButton } */
    #signoutButton;

    /// event
    /** @type { Function } */
    #boundSignoutHandler;

    /** @type { Function } */
    #boundDashboardHandler;
    
    constructor()
    {
        super();
        this.classList.add("axial_auth_box_overlay");
        this.template = "axial-auth-box-overlay-template";
        this.#signoutPath = PathUtils.getPathFromRelative( this.#signoutPath );
        
        this.#boundDashboardHandler = this.#dashboardHandler.bind(this);
        this.#boundSignoutHandler = this.#signoutHandler.bind(this);
    }

    get dashboardPath() { return this.#dashboardPath; }
    set dashboardPath( value )
    {
        if( StringUtils.isWhite(value) === true ) { throw new TypeError("String required"); }
        
        try
        {
            const testPath = new URL(value, window.location.origin);
            this.#dashboardPath = testPath.href;
            //console.log(this.#dashboardPath);
        }
        catch(err) { console.log( err ); }
        
    }

    _buildComponent()
    {
        super._buildComponent();
        
        this.#dashboardButton = this.shadowRoot.getElementById("dashboardButton");
        if( this.#dashboardButton )
        {
            this.#dashboardButton.addEventListener("click", this.#boundDashboardHandler);
        }
        
        this.#signoutButton = this.shadowRoot.getElementById("signoutButton");
        if( this.#signoutButton )
        {
            this.#signoutButton.addEventListener("click", this.#boundSignoutHandler);
        }
    }

    #dashboardHandler( event )
    {
        if( this.#dashboardPath )
        {
            window.location.href = this.#dashboardPath;
        }
    }
    
    #signoutHandler( event )
    {
        this.#signout();
    }

    async #signout()
    {
        try
        {
            localStorage.removeItem("axial_auth_uuid");
            const json = FetchUtils.POST( this.#signoutPath, {} );

            if( json )
            {
                const url = new URL(window.location.href);
                window.location.href = url.origin;
            }
        }
        catch(err)
        {

        }
    }
}

window.customElements.define("axial-auth-box-overlay", AxialAuthBoxOverlay);
export { AxialAuthBoxOverlay }