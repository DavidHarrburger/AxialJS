"use strict";

import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { AxialButton } from "../../button/AxialButton.js";
import { AxialOnboardingView } from "../AxialOnboardingView.js";
import { AxialProgressIndicator } from "../../loader/AxialProgressIndicator.js";
import { AxialFunCheck } from "../../fun/AxialFunCheck.js";


import { PathUtils } from "../../utils/PathUtils.js";
import { FetchUtils } from "../../utils/FetchUtils.js";
import { ColorUtils } from "../../utils/ColorUtils.js";


class AxialOnboardingViewFinal extends AxialOnboardingView
{
    /// vars
    /** @type { String } */
    #onboardingPayementPath = "./api/auth/onboarding/payement"; // check du payement just in case

    /** @type { String } */
    #onboardingDatabasePath = "./api/auth/onboarding/database"; // création de la base de données des produits en fonctions des options choisies

    /** @type { String } */
    #onboardingStoragePath = "./api/auth/onboarding/storage"; // création du dossier pour stockage cloud

    /** @type { String } */
    #onboardingConnectionPath = "./api/auth/onboarding/connection"; // création du dossier pour stockage cloud

    /** @type { Array<Object>} */
    #pathesLogic = [];

    /** @type { Number } */
    #counter = 0;

    /** @type { Number } */
    #delay = 1200;

    /** @type { Boolean } */
    #done = false;

    /** @type { Number } */
    #timeoutId;

    /** @type { Number } */
    #retryTimeoutId;

    /** @type { Number } */
    #timestamp;

    /** @type { Number } */
    #currentRetry = 0;

    /// elements
    /** @type { Array<HTMLElement>} */
    #items;

    /** @type { AxialButton } */
    #goButton;

    /// events
    /** @type { Function } */
    #boundTimeoutHandler;

    /** @type { Function } */
    #boundRetryTimeoutHandler;

    /** @type { Function } */
    #boundGoHandler;
    
    constructor()
    {
        super();
        
        this.template = "axial-onboarding-view-final-template";

        this.#boundTimeoutHandler = this.#timeoutHandler.bind(this);
        this.#boundRetryTimeoutHandler = this.#retryTimeoutHandler.bind(this);
        this.#boundGoHandler = this.#goHandler.bind(this);

        this.#onboardingPayementPath   = PathUtils.getPathFromRelative( this.#onboardingPayementPath );
        this.#onboardingDatabasePath   = PathUtils.getPathFromRelative( this.#onboardingDatabasePath );
        this.#onboardingStoragePath    = PathUtils.getPathFromRelative( this.#onboardingStoragePath );
        this.#onboardingConnectionPath = PathUtils.getPathFromRelative( this.#onboardingConnectionPath );

        this.#pathesLogic =
        [
            { path: this.#onboardingPayementPath,   poll: true,  retry: 5, delay: 1000},
            { path: this.#onboardingDatabasePath,   poll: false, retry: 0, delay: 0},
            { path:  this.#onboardingStoragePath,   poll: false, retry: 0, delay: 0},
            { path: this.#onboardingConnectionPath, poll: false, retry: 0, delay: 0 }
        ];

    }

    _buildComponent()
    {
        super._buildComponent();
        this.#items = Array.from( this.holder.getElementsByClassName("axial_onboarding_final-item") );
        this.#goButton = this.shadowRoot.getElementById("goButton");
    }

    #goHandler( event )
    {
        const dashboardPath = PathUtils.getPathFromRelative("./user");
        window.location.href = dashboardPath;
    }

    async finalize()
    {

        await this.#finalize();
    }

    async #finalize()
    {
        console.log( "ONBOARDING_FINALIZE_ENTRY_POINT" );
        this.#timestamp = Date.now();
        
        const item = this.#items[ this.#counter ];
        const indicator = item.getElementsByTagName("axial-progress-indicator")[0];
        indicator.show();

        const check = item.getElementsByTagName("axial-fun-check")[0];
        const pathLogic = this.#pathesLogic[ this.#counter ];
        const path = pathLogic.path;
        
        item.style.opacity = "1";

        this.#timeoutId = window.setTimeout( this.#boundTimeoutHandler, this.#delay);
        const step = await FetchUtils.POST( path );
        if( step.status && step.status === "ok" )
        {
            this.#done = true;
            const end = Date.now();
            const delta = end - this.#timestamp;
            if( delta > this.#delay )
            {
                indicator.hide();
                check.style.display = "block";
                check.play();
                this.#currentRetry = 0;
                this.#next();
            }
        }
        else
        {
            if( step.error !== undefined )
            {
                console.log( "something is definitively wrong" );
            }
            else
            {
                /// status = "ko" if poll we retry else 
                if( pathLogic.poll === true )
                {
                    this.#currentRetry += 1;
                    if( this.#currentRetry >= pathLogic.retry )
                    {
                        console.log("dead end after retry");
                    }
                    else
                    {
                        this.#retryTimeoutId = window.setTimeout( this.#boundRetryTimeoutHandler, pathLogic.delay);
                    }
                }
                else
                {
                    console.log("dead end without retry");
                }
            }
        }
    }

    async #next()
    {
        this.#counter += 1;
        if( this.#counter < this.#pathesLogic.length )
        {
            await this.#finalize();
        }
        else
        {
            console.log("SHOW START BUTTON WITH CONFETTI");
            this.#goButton.style.display = "block";
            this.#goButton.style.opacity = "1";
            this.#goButton.style.transform = "translateY(0)";
            
        }
    }

    #timeoutHandler()
    {
        console.log("timeout");
        window.clearTimeout( this.#timeoutId );
        if( this.#done === true )
        {
            const item = this.#items[ this.#counter ];
            const indicator = item.getElementsByTagName("axial-progress-indicator")[0];
            const check = item.getElementsByTagName("axial-fun-check")[0];

            indicator.hide();
            check.style.display = "block";
            check.play();

            console.log("go to next timeout");
            this.#next();
        }
    }

    #retryTimeoutHandler()
    {
        console.log("retry timeout");
        this.#counter -= 1;
        this.#next();
    }
}

window.customElements.define("axial-onboarding-view-final", AxialOnboardingViewFinal);
export { AxialOnboardingViewFinal }