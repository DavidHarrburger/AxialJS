"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialCounter } from "../counter/AxialCounter.js";
import { AxialViewer } from "../view/AxialViewer.js";
import { AxialOnboardingView } from "./AxialOnboardingView.js";

import { AxialOnboardingViewStart } from "./views/AxialOnboardingViewStart.js";
import { AxialOnboardingViewMail } from "./views/AxialOnboardingViewMail.js";
import { AxialOnboardingViewMailVerification } from "./views/AxialOnboardingViewMailVerification.js";
import { AxialOnboardingViewPhone } from "./views/AxialOnboardingViewPhone.js";
import { AxialOnboardingViewPhoneVerification } from "./views/AxialOnboardingViewPhoneVerification.js";
import { AxialOnboardingViewProfile } from "./views/AxialOnboardingViewProfile.js";
import { AxialOnboardingViewCompany } from "./views/AxialOnboardingViewCompany.js";

import { AxialOnboardingViewOption } from "./views/AxialOnboardingViewOption.js";

import { AxialOnboardingViewSubscription } from "./views/AxialOnboardingViewSubscription.js";
import { AxialOnboardingViewCheckout } from "./views/AxialOnboardingViewCheckout.js";
import { AxialOnboardingViewFinal } from "./views/AxialOnboardingViewFinal.js";
import { PathUtils } from "../utils/PathUtils.js";
import { FetchUtils } from "../utils/FetchUtils.js";

class AxialOnboarding extends AxialComponentBase
{
    /// vars
    /** @type { String } */
    #onboardingCreationPath = "./api/auth/onboarding/creation";

    /** @type { String } */
    #subscriptionListPath = "./api/subscription/user/list";

    /** @type { Array } */
    #subscriptions = [];

    /** @type { Array } */
    #viewClasses =
    [

        AxialOnboardingViewStart,
        AxialOnboardingViewMail,
        AxialOnboardingViewMailVerification,
        AxialOnboardingViewPhone,
        AxialOnboardingViewPhoneVerification,
        AxialOnboardingViewProfile,
        AxialOnboardingViewCompany,
        AxialOnboardingViewSubscription,
        AxialOnboardingViewCheckout,
        AxialOnboardingViewFinal
    ];

    /** @type { Function } */
    #saveClassEntryPoint = AxialOnboardingViewCompany;

    /** @type { Number } */
    #index = 0;

    /** @type { Object } */
    #onboardingObject = {};

    /// elements
    /** @type { AxialViewer } */
    #viewer;

    /** @type { AxialCounter } */
    #counter;

    /// events
    /** @type { Function } */
    #boundViewSaveHandler;

    /** @type { Function } */
    #boundViewBackHandler;

    /** @type { Function } */
    #boundViewBuiltHandler;

    /** @type { Function } */
    #boundViewerChangedHandler;

    /** @type { Function } */
    #boundTimeoutFetcher;

    constructor()
    {
        super();
        this.classList.add("axial_onboarding");
        this.template = "axial-onboarding-template";

        this.#onboardingCreationPath = PathUtils.getPathFromRelative(this.#onboardingCreationPath);
        this.#subscriptionListPath = PathUtils.getPathFromRelative(this.#subscriptionListPath);

        this.#boundViewSaveHandler = this.#viewSaveHandler.bind(this);
        this.#boundViewBackHandler = this.#viewBackHandler.bind(this);
        this.#boundViewBuiltHandler = this.#viewBuiltHandler.bind(this);
        this.#boundViewerChangedHandler = this.#viewerChangedHandler.bind(this);
        this.#boundTimeoutFetcher = this.#timeoutFetcher.bind(this);

        this.addEventListener("onboardingViewSave", this.#boundViewSaveHandler);
        this.addEventListener("onboardingViewBack", this.#boundViewBackHandler);
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#counter = this.shadowRoot.getElementById("counter");
        this.#counter.max = this.#viewClasses.length;
        this.#viewer = this.shadowRoot.getElementById("viewer");
        this.#viewer.effect = "slide";
        if( this.#viewClasses.length > 0 )
        {
            const viewClass = this.#viewClasses[0]; // ensure it starts at 0
            if( this.#viewer )
            {
                const view = new viewClass();
                this.#viewer.addView(view);
            }
        }
        this.#viewer.addEventListener("viewerChanged", this.#boundViewerChangedHandler);
        this.#getSubscriptions();
    }

    async #getSubscriptions()
    {
        try
        {
            //console.log("Hello Subscriptions");
            const json = await FetchUtils.GET( this.#subscriptionListPath );
            //console.log( json );
            if( json.status !== undefined && json.status === "ok" && json.content !== undefined )
            {
                if( Array.isArray( json.content) )
                {
                    this.#subscriptions = json.content;
                }
                else
                {
                    this.#subscriptions.push( json.content );
                }
                
                //console.log( this.#subscriptions );
            }
        }
        catch(err)
        {
            console.log(err);
        }
    }

    /**
     * 
     * @param { AxialOnboardingView } view 
     */
    async #startSave( view )
    {
        try
        {
            const isOK = this.#viewClasses[ this.#index ] === view.constructor;
            if( isOK === true )
            {
                if( view.constructor === this.#saveClassEntryPoint )
                {
                    this.#createNextView();
                }
                else
                {
                    this.#createNextView();
                }
            }
        }
        catch(err)
        {
            console.log(err);
        }
    }

    #timeoutFetcher()
    {
        this.#createNextView();
    }

    #createNextView()
    {
        this.#index += 1;
        const nextViewClass = this.#viewClasses[this.#index];
        const alreadyBuilt = this.#viewer.views[this.#index] !== undefined;
        console.log("alreadyBuilt", alreadyBuilt);
        if( nextViewClass && alreadyBuilt === false )
        {
            const nextView = new nextViewClass();
            nextView.addEventListener("componentBuilt", this.#boundViewBuiltHandler);
            this.#viewer.addView( nextView );
        }
        else
        {
            const nextViewBuilt = this.#viewer.views[this.#index];
            this.#viewer.next();
        }
    }

    async #fetchData()
    {
        try
        {
            const onboarding = await FetchUtils.POST( this.#onboardingCreationPath, this.#onboardingObject );
            localStorage.setItem( "axial_auth_uuid", onboarding.uuid );
            return onboarding;
        }
        catch(err)
        {
            console.log( err );
        }
    }

    async #viewSaveHandler( event )
    {
        const view = this.#viewer.currentView;
        const data = event.detail.validatedData;
        for( const prop of Object.keys( data ) )
        {
            this.#onboardingObject[prop] = data[prop];
        }
        await this.#startSave( view );
    }

    #viewBackHandler( event )
    {
        console.log("back");
        if( this.#viewer )
        {
            this.#index -= 1;
            this.#viewer.previous();
        }
    }

    #viewBuiltHandler( event )
    {
        console.log( "view built");
        console.log(this.#onboardingObject);
        const viewBuilt = event.target;
        if( viewBuilt instanceof AxialOnboardingViewMailVerification === true )
        {
            /*
            if( this.#onboardingObject.email !== undefined )
            {
                viewBuilt.email = this.#onboardingObject.email;
            }
            */
        }
        else if( viewBuilt instanceof AxialOnboardingViewPhoneVerification === true )
        {
            if( this.#onboardingObject.tel !== undefined )
            {
                viewBuilt.phone = this.#onboardingObject.tel;
            }
        }
        else if( viewBuilt instanceof AxialOnboardingViewSubscription === true )
        {
            viewBuilt.subscriptions = this.#subscriptions;
        }
        
        this.#viewer.next();
    }

    #viewerChangedHandler( event )
    {
        const view = this.#viewer.currentView;
        
        if( view instanceof AxialOnboardingViewMailVerification === true )
        {
            if( this.#onboardingObject.email !== undefined && this.#viewer.currentViewIndex > this.#viewer.previousViewIndex )
            {
                view.email = this.#onboardingObject.email;
            }
        }

        if( view instanceof AxialOnboardingViewSubscription === true )
        {
            this.#viewer.currentView.bar.updateFluid();
        }
        else if( view instanceof AxialOnboardingViewCheckout === true )
        {
            view.indicator.show();
            this.#saveOnboarding();
        }
        else if( view instanceof AxialOnboardingViewFinal === true )
        {
            view.finalize();
        }
        this.#counter.count = this.#viewer.currentViewIndex + 1;
    }

    async #saveOnboarding()
    {
        const result = await this.#fetchData();
        const view = this.#viewer.currentView;
        // still must be !
        if( view instanceof AxialOnboardingViewCheckout === true )
        {
            view.customer = result.scid;
            view.price = this.#onboardingObject.subscription.stripe_price_id;
            await view.initCheckout();
        }
    }
}

window.customElements.define("axial-onboarding", AxialOnboarding);
export { AxialOnboarding }