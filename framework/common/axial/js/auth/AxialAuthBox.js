"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { ObjectUtils } from "../utils/ObjectUtils.js";
import { AxialProgressIndicator } from "../loader/AxialProgressIndicator.js";
import { PathUtils } from "../utils/PathUtils.js";
import { AxialAuthBoxOverlay } from "./AxialAuthBoxOverlay.js";

class AxialAuthBox extends AxialComponentBase
{
    /// vars
    /** @type { Object } */
    #userObject;

    /// states elements
    /** @type { HTMLElement } */
    #loadingState;

    /** @type { HTMLElement } */
    #connectedState;

    /** @type { HTMLElement } */
    #signState;

    /// elements
    // loading
    /** @type { AxialProgressIndicator } */
    #indicator;
    
    // connected
    /** @type { HTMLElement } */
    #name;

    /** @type { HTMLElement } */
    #role;

    /** @type { HTMLElement } */
    #photo;

    // sign
    /** @type { HTMLAnchorElement } */
    #signup;

    /** @type { HTMLAnchorElement } */
    #signin;

    /** @type { AxialAuthBoxOverlay } */
    #authBoxOverlay = new AxialAuthBoxOverlay();
    
    /// events
    /** @type { Function } */
    #boundConnectedClickedHandler;

    constructor()
    {
        super();
        this.classList.add("axial_auth_box");
        this.template = "axial-auth-box-template";
        this.addState("loading");
        this.addState("connected");
        this.addState("sign");
        this.#boundConnectedClickedHandler = this.#connectedClickHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#loadingState = this.shadowRoot.getElementById("loadingState");
        this.#connectedState = this.shadowRoot.getElementById("connectedState");
        this.#signState = this.shadowRoot.getElementById("signState");

        this.#connectedState.addEventListener("click", this.#boundConnectedClickedHandler);

        // loading state
        this.#indicator = this.shadowRoot.getElementById("indicator");
        
        // connected state
        this.#name = this.shadowRoot.getElementById("name");
        this.#role = this.shadowRoot.getElementById("role");
        this.#photo = this.shadowRoot.getElementById("photo");

        // sign state
        this.#signup = this.shadowRoot.getElementById("signup");
        this.#signin = this.shadowRoot.getElementById("signin");

        if( this.#signup )
        {
            const signupLink = this.#signup.getAttribute("href");
            this.#signup.setAttribute("href", PathUtils.getPathFromRelative(signupLink) );
        }

        if( this.#signin )
        {
            const signinLink = this.#signin.getAttribute("href");
            this.#signin.setAttribute("href", PathUtils.getPathFromRelative(signinLink) );
        }
        
        this.switchToState("loading");
    }

    _onStateChanged()
    {
        switch( this.currentState )
        {
            case "loading":
                this.#loadingState.style.display = "flex";
                this.#connectedState.style.display = "none";
                this.#signState.style.display = "none";

                this.#indicator.show();
            break;

            case "connected":
                this.#indicator.hide();

                this.#loadingState.style.display = "none";
                this.#connectedState.style.display = "flex";
                this.#signState.style.display = "none";
                this.#authBoxOverlay.target = this;
            break;

            case "sign":
                this.#indicator.hide();

                this.#loadingState.style.display = "none";
                this.#connectedState.style.display = "none";
                this.#signState.style.display = "flex";
            break;

            default:
                this.#indicator.hide();

                this.#loadingState.style.display = "none";
                this.#connectedState.style.display = "none";
                this.#signState.style.display = "none";
            break;
        }
    }

    get user() { return this.#userObject; }
    set user( value )
    {
        if( ObjectUtils.isObject( value ) === false )
        {
            throw new TypeError("Plain Object required");
        }
        this.#userObject = value;
        this.#updateBox();
    }

    #updateBox()
    {
        if( this.#userObject !== undefined )
        {
            if( this.#name )
            {
                this.#name.innerHTML = `${this.#userObject?.first_name} ${this.#userObject?.last_name}`;
            }

            if( this.#role )
            {
                this.#role.innerHTML = `${this.#userObject?.role}`;
                if( this.#authBoxOverlay )
                {
                    //console.log("ok authbox overlay ",this.#userObject?.role);
                    this.#authBoxOverlay.dashboardPath = this.#userObject?.role;
                }
            }
        }
    }

    #connectedClickHandler( event )
    {
        /*
        const href = new URL( `./${this.#userObject.role}`, window.location.origin ).href + "/";
        const cref = window.location.href;
        if( cref !== href)
        {
            window.location.href = href;
        }
        */
        
    }
}

window.customElements.define("axial-auth-box", AxialAuthBox);
export { AxialAuthBox }