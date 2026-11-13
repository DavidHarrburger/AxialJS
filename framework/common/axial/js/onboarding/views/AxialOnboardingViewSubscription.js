"use strict";

import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { AxialOnboardingView } from "../AxialOnboardingView.js";
import { AxialSubscriptionCard } from "../../subscription/AxialSubscriptionCard.js";
import { AxialToggleButtonGroup } from "../../button/AxialToggleButtonGroup.js";
import { AxialSubscriptionBarButton } from "../../subscription/AxialSubscriptionBarButton.js";
import { AxialSubscriptionBar } from "../../subscription/AxialSubscriptionBar.js";

import { PathUtils } from "../../utils/PathUtils.js";
import { FetchUtils } from "../../utils/FetchUtils.js";
import { ColorUtils } from "../../utils/ColorUtils.js";

class AxialOnboardingViewSubscription extends AxialOnboardingView
{
    /// vars
    /** @type { String } */
    #subscriptionListPath = "./api/subscription/user/list";

    /** @type { Array } */
    #subscriptions = [];

    /** @type { AxialToggleButtonGroup } */
    #currentGroup;

    /** @type { Array } */
    #month = [];

    /** @type { Array } */
    #year = [];

    /** @type { Array } */
    #life = [];

    /// elements
    /** @type { AxialSubscriptionBar } */
    #bar;

    /** @type { HTMLElement } */
    #groupsHolder;

    /** @type { AxialToggleButtonGroup } */
    #groupMonth;

    /** @type { AxialToggleButtonGroup } */
    #groupYear;

    /** @type { AxialToggleButtonGroup } */
    #groupLife;

    /// events
    /** @type { Function } */
    #boundBarChangedHandler;

    /** @type { Function } */
    #boundGroupIndexChangedHandler;

    constructor()
    {
        super();
        this.template = "axial-onboarding-view-subscription-template";
        this.#subscriptionListPath = PathUtils.getPathFromRelative(this.#subscriptionListPath);
        this.#boundBarChangedHandler = this.#barChangedHandler.bind(this);
        this.#boundGroupIndexChangedHandler = this.#groupIndexChangedHandler.bind(this);
    }

    _buildComponent()
    {
        this.#bar = this.shadowRoot.getElementById("bar");
        this.#bar.addEventListener( "indexChanged", this.#boundBarChangedHandler );
        this.#groupsHolder= this.shadowRoot.getElementById("groupsHolder");
        this.#groupMonth = this.shadowRoot.getElementById("groupMonth");
        this.#groupYear = this.shadowRoot.getElementById("groupYear");

        super._buildComponent();
    }

    get subscriptions() { return this.#subscriptions; }
    set subscriptions( value )
    {
        this.#subscriptions = value;
        this.#buildSubscriptions();
    }

    /**
     * @type { AxialSubscriptionBar }
     * @readonly
     */
    get bar() { return this.#bar; }

    /*
    async getSubscriptions()
    {
        await this.#getSubscriptions();
    }

    async #getSubscriptions()
    {
        try
        {
            console.log("Hello Subscriptions");
            const json = await FetchUtils.GET( this.#subscriptionListPath );
            console.log( json );
            if( json.status !== undefined && json.status === "ok" && json.content !== undefined && Array.isArray( json.content ) && json.content.length > 0 )
            {
                this.#subscriptions = json.content;
                this.#buildSubscriptions()
            }
        }
        catch(err)
        {
            console.log(err);
        }
    }
    */

    #buildSubscriptions()
    {
        console.log("should build subscription");
        let hasMonth = false;
        let hasYear = false;
        for( const sub of this.#subscriptions )
        {
            const recurrence = sub.recurrence;
            switch( recurrence )
            {
                case "month":
                    hasMonth = true;
                    this.#month.push(sub);
                    const monthCard = new AxialSubscriptionCard();
                    monthCard.data = sub;
                    this.#groupMonth.appendToggle( monthCard );

                break;

                case "year":
                    hasYear = true;
                    this.#year.push(sub);
                    const yearCard = new AxialSubscriptionCard();
                    yearCard.data = sub;
                    this.#groupYear.appendToggle( yearCard );
                break;

                default:
                break;
            }
        }

        if( hasMonth === true )
        {
            const monthBarButton = new AxialSubscriptionBarButton();
            monthBarButton.text = "Mensuel";
            this.#bar.appendToggle(monthBarButton);
            this.#groupMonth.addEventListener("indexChanged", this.#boundGroupIndexChangedHandler);
        }
        else
        {
            this.#groupMonth.remove();
        }
        
        if( hasYear === true )
        {
            const yearBarButton = new AxialSubscriptionBarButton();
            yearBarButton.text = "Annuel";
            this.#bar.appendToggle(yearBarButton);
            this.#groupYear.addEventListener("indexChanged", this.#boundGroupIndexChangedHandler);
        }
        else
        {
            this.#groupYear.remove();
        }
        
        //const lifeBarButton = new AxialSubscriptionBarButton();
        //lifeBarButton.text = "Life time";
        //this.#bar.appendToggle(lifeBarButton);

        this.#bar.selectedIndex = 0;
        const children = this.#groupsHolder.children;
        for( let i = 0; i < children.length; i++ )
        {
            const child = children[i];
            if( i === 0 )
            {
                child.style.display = "block";
                this.#currentGroup = child;

            }
            else
            {
                child.style.display = "none";
            }
        }
        
    }

    #barChangedHandler( event )
    {
        const index = this.#bar.selectedIndex;
        const children = this.#groupsHolder.children;
        for( let i = 0; i < children.length; i++ )
        {
            const child = children[i];
            if( i === index )
            {
                child.style.display = "block";
                this.#currentGroup = child;
            }
            else
            {
                child.style.display = "none";
            }
        }
        const currentToggle = this.#currentGroup.getSelectedToggle();
        let validated = false;
        let data;
        if( currentToggle !== undefined )
        {
            validated = true;
            data = { subscription: currentToggle.data };
        }
        const onboardingEvent = new CustomEvent("onboardingViewValidated", { bubbles: false, detail: { validated: validated, data: data } } );
        this.dispatchEvent(onboardingEvent);
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #groupIndexChangedHandler( event )
    {
        const index = event.detail.selectedIndex;
        let validated = false;
        let data;
        if( index >= 0 )
        {
            validated = true; // avoid thruthy / falsy
            data = { subscription: this.#currentGroup.getSelectedToggle()?.data };
        }

        const onboardingEvent = new CustomEvent("onboardingViewValidated", { bubbles: false, detail: { validated: validated, data: data } } );
        this.dispatchEvent(onboardingEvent);
    }
}

window.customElements.define("axial-onboarding-view-subscription", AxialOnboardingViewSubscription);
export { AxialOnboardingViewSubscription }