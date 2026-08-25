"use strict";

import { AxialButtonBase } from "./AxialButtonBase.js";
import { AxialTooltip } from "../tooltip/AxialTooltip.js";
import { AxialTooltipBase } from "../tooltip/AxialTooltipBase.js";
import { AxialTooltipManager } from "../tooltip/AxialTooltipManager.js";

// TODO (super efficient we need them everywhere)
// ICON FROM FONT-AWESOME (FREE)

class AxialIconButton extends AxialButtonBase
{
    /** @type { String } */
    #NS = "http://www.w3.org/2000/svg";


    #ICON_ARCHIVE = "M64 128C64 110.3 78.3 96 96 96L544 96C561.7 96 576 110.3 576 128L576 160C576 177.7 561.7 192 544 192L96 192C78.3 192 64 177.7 64 160L64 128zM96 240L544 240L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 240zM248 304C234.7 304 224 314.7 224 328C224 341.3 234.7 352 248 352L392 352C405.3 352 416 341.3 416 328C416 314.7 405.3 304 392 304L248 304z";
    #ICON_BELL = "M320 64C306.7 64 296 74.7 296 88L296 97.7C214.6 109.3 152 179.4 152 264L152 278.5C152 316.2 142 353.2 123 385.8L101.1 423.2C97.8 429 96 435.5 96 442.2C96 463.1 112.9 480 133.8 480L506.2 480C527.1 480 544 463.1 544 442.2C544 435.5 542.2 428.9 538.9 423.2L517 385.7C498 353.1 488 316.1 488 278.4L488 263.9C488 179.3 425.4 109.2 344 97.6L344 87.9C344 74.6 333.3 63.9 320 63.9zM488.4 432L151.5 432L164.4 409.9C187.7 370 200 324.6 200 278.5L200 264C200 197.7 253.7 144 320 144C386.3 144 440 197.7 440 264L440 278.5C440 324.7 452.3 370 475.5 409.9L488.4 432zM252.1 528C262 556 288.7 576 320 576C351.3 576 378 556 387.9 528L252.1 528z";
    #ICON_CLONE = "M352 512L128 512L128 288L176 288L176 224L128 224C92.7 224 64 252.7 64 288L64 512C64 547.3 92.7 576 128 576L352 576C387.3 576 416 547.3 416 512L416 464L352 464L352 512zM288 416L512 416C547.3 416 576 387.3 576 352L576 128C576 92.7 547.3 64 512 64L288 64C252.7 64 224 92.7 224 128L224 352C224 387.3 252.7 416 288 416z";
    #ICON_COPY = "M480 400L288 400C279.2 400 272 392.8 272 384L272 128C272 119.2 279.2 112 288 112L421.5 112C425.7 112 429.8 113.7 432.8 116.7L491.3 175.2C494.3 178.2 496 182.3 496 186.5L496 384C496 392.8 488.8 400 480 400zM288 448L480 448C515.3 448 544 419.3 544 384L544 186.5C544 169.5 537.3 153.2 525.3 141.2L466.7 82.7C454.7 70.7 438.5 64 421.5 64L288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L368 496L368 512C368 520.8 360.8 528 352 528L160 528C151.2 528 144 520.8 144 512L144 256C144 247.2 151.2 240 160 240L176 240L176 192L160 192z";
    #ICON_EDIT = "M416.9 85.2L372 130.1L509.9 268L554.8 223.1C568.4 209.6 576 191.2 576 172C576 152.8 568.4 134.4 554.8 120.9L519.1 85.2C505.6 71.6 487.2 64 468 64C448.8 64 430.4 71.6 416.9 85.2zM338.1 164L122.9 379.1C112.2 389.8 104.4 403.2 100.3 417.8L64.9 545.6C62.6 553.9 64.9 562.9 71.1 569C77.3 575.1 86.2 577.5 94.5 575.2L222.3 539.7C236.9 535.6 250.2 527.9 261 517.1L476 301.9L338.1 164z";    
    #ICON_ELLIPSIS = "M96 320C96 289.1 121.1 264 152 264C182.9 264 208 289.1 208 320C208 350.9 182.9 376 152 376C121.1 376 96 350.9 96 320zM264 320C264 289.1 289.1 264 320 264C350.9 264 376 289.1 376 320C376 350.9 350.9 376 320 376C289.1 376 264 350.9 264 320zM488 264C518.9 264 544 289.1 544 320C544 350.9 518.9 376 488 376C457.1 376 432 350.9 432 320C432 289.1 457.1 264 488 264z"
    #ICON_EYE = "M320 144C254.8 144 201.2 173.6 160.1 211.7C121.6 247.5 95 290 81.4 320C95 350 121.6 392.5 160.1 428.3C201.2 466.4 254.8 496 320 496C385.2 496 438.8 466.4 479.9 428.3C518.4 392.5 545 350 558.6 320C545 290 518.4 247.5 479.9 211.7C438.8 173.6 385.2 144 320 144zM127.4 176.6C174.5 132.8 239.2 96 320 96C400.8 96 465.5 132.8 512.6 176.6C559.4 220.1 590.7 272 605.6 307.7C608.9 315.6 608.9 324.4 605.6 332.3C590.7 368 559.4 420 512.6 463.4C465.5 507.1 400.8 544 320 544C239.2 544 174.5 507.2 127.4 463.4C80.6 419.9 49.3 368 34.4 332.3C31.1 324.4 31.1 315.6 34.4 307.7C49.3 272 80.6 220 127.4 176.6zM320 400C364.2 400 400 364.2 400 320C400 290.4 383.9 264.5 360 250.7C358.6 310.4 310.4 358.6 250.7 360C264.5 383.9 290.4 400 320 400zM240.4 311.6C242.9 311.9 245.4 312 248 312C283.3 312 312 283.3 312 248C312 245.4 311.8 242.9 311.6 240.4C274.2 244.3 244.4 274.1 240.5 311.5zM286 196.6C296.8 193.6 308.2 192.1 319.9 192.1C328.7 192.1 337.4 193 345.7 194.7C346 194.8 346.2 194.8 346.5 194.9C404.4 207.1 447.9 258.6 447.9 320.1C447.9 390.8 390.6 448.1 319.9 448.1C258.3 448.1 206.9 404.6 194.7 346.7C192.9 338.1 191.9 329.2 191.9 320.1C191.9 309.1 193.3 298.3 195.9 288.1C196.1 287.4 196.2 286.8 196.4 286.2C208.3 242.8 242.5 208.6 285.9 196.7z";
    #ICON_LOCK = "M256 160L256 224L384 224L384 160C384 124.7 355.3 96 320 96C284.7 96 256 124.7 256 160zM192 224L192 160C192 89.3 249.3 32 320 32C390.7 32 448 89.3 448 160L448 224C483.3 224 512 252.7 512 288L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 288C128 252.7 156.7 224 192 224z";
    #ICON_PLUS = "M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z";
    #ICON_PROJECT = "M64 144C64 117.5 85.5 96 112 96L208 96C234.5 96 256 117.5 256 144L256 160L384 160L384 144C384 117.5 405.5 96 432 96L528 96C554.5 96 576 117.5 576 144L576 240C576 266.5 554.5 288 528 288L432 288C405.5 288 384 266.5 384 240L384 224L256 224L256 240C256 247.3 254.3 254.3 251.4 260.5L320 352L400 352C426.5 352 448 373.5 448 400L448 496C448 522.5 426.5 544 400 544L304 544C277.5 544 256 522.5 256 496L256 400C256 392.7 257.7 385.7 260.6 379.5L192 288L112 288C85.5 288 64 266.5 64 240L64 144z";
    #ICON_TRASH = "M262.2 48C248.9 48 236.9 56.3 232.2 68.8L216 112L120 112C106.7 112 96 122.7 96 136C96 149.3 106.7 160 120 160L520 160C533.3 160 544 149.3 544 136C544 122.7 533.3 112 520 112L424 112L407.8 68.8C403.1 56.3 391.2 48 377.8 48L262.2 48zM128 208L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 208L464 208L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 208L128 208zM288 280C288 266.7 277.3 256 264 256C250.7 256 240 266.7 240 280L240 456C240 469.3 250.7 480 264 480C277.3 480 288 469.3 288 456L288 280zM400 280C400 266.7 389.3 256 376 256C362.7 256 352 266.7 352 280L352 456C352 469.3 362.7 480 376 480C389.3 480 400 469.3 400 456L400 280z";
    
    #icons = new Map();
    
    /** @type { String } */
    #iconName;

    /** @type { String } */
    #fill = "#232323";

    /** @type { String } */
    #tooltipText;

    /** @type { String } */
    #defaultForegroundColor = "#dedede";

    /// elements
    /** @type { AxialTooltip } */
    #tooltip;

    /** @type { HTMLElement } */
    #foreground

    /** @type { HTMLElement } */
    #icon;

    /** @type { SVGPathElement } */
    #path;

    /// events
    /** @type { Function } */
    #boundComponentBuiltHandler; // we will see for the tip

    /** @type { Function } */
    #boundPointerEnterHandler;

    /** @type { Function } */
    #boundPointerLeaveHandler;
    
    constructor( iconName )
    {
        super();

        this.classList.add("axial_icon_button")
        this.template = "axial-icon-button-template";

        // we popuplate the map here so we can add more icon later
        this.#icons.set( "archive", this.#ICON_ARCHIVE );
        this.#icons.set( "bell", this.#ICON_BELL );
        this.#icons.set( "clone", this.#ICON_CLONE );
        this.#icons.set( "copy", this.#ICON_COPY );
        this.#icons.set( "edit", this.#ICON_EDIT );
        this.#icons.set( "ellipsis", this.#ICON_ELLIPSIS );
        this.#icons.set( "eye", this.#ICON_EYE );
        this.#icons.set( "lock", this.#ICON_LOCK );
        this.#icons.set( "plus", this.#ICON_PLUS );
        this.#icons.set( "project", this.#ICON_PROJECT );
        this.#icons.set( "trash", this.#ICON_TRASH );

        this.#boundComponentBuiltHandler = this.#componentBuiltHandler.bind(this);
        this.#boundPointerEnterHandler = this.#pointerEnterHandler.bind(this);
        this.#boundPointerLeaveHandler = this.#pointerLeaveHandler.bind(this);

        this.addEventListener("componentBuilt", this.#boundComponentBuiltHandler);
        this.addEventListener("pointerenter", this.#boundPointerEnterHandler );
        this.addEventListener("pointerleave", this.#boundPointerLeaveHandler );
    }

    static get observedAttributes()
    {
        return [ "axial-icon-name", "axial-tooltip-text" ];
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#foreground = this.shadowRoot.getElementById("foreground");
        this.#icon = this.shadowRoot.getElementById("icon");
        
        this.#path = this.shadowRoot.getElementById("path");
        this.#path.setAttribute( "fill", this.#fill );

        if( this.#iconName !== undefined )
        {
            this.#path.setAttribute( "d", this.#icons.get( this.#iconName ) );
        }
        
    }

    /**
     * @type { HTMLElement }
     * @readonly
     */
    get icon() { return this.#icon; }

    /**
     * @type { HTMLElement }
     * @readonly
     */
    get foreground() { return this.#foreground; }

    /**
     * @type { AxialTooltip }
     * @readonly
     */
    get tooltip() { return this.#tooltip; }

    get iconName() { return this.#iconName; }
    set iconName( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        // check empty string

        if( this.#icons.has(value) === true )
        {
            this.#iconName = value;
            if (this.#path )
            {
                this.#path.setAttribute( "d", this.#icons.get( this.#iconName ) );
            }
        }
    }

    get tooltipText() { return this.#tooltipText; }
    set tooltipText( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#tooltipText = value;
        // a lot todo here but ATM we only need a setter in the subclasses constructor
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-icon-name" )
        {
            if(this.#icons.has( newValue) )
            {
                this.#iconName = newValue;
            }
        }

        if( name === "axial-tooltip-text" )
        {
            this.#tooltipText = newValue;
        }
    }

    disconnectedCallback()
    {
        if( this.#tooltip )
        {
            this.#tooltip.remove();
        }
    }

    #componentBuiltHandler( event )
    {
        if( this.#tooltipText )
        {
            this.#tooltip = new AxialTooltip( this.#tooltipText );
            AxialTooltipManager.addTooltip( this.#tooltip );
            this.#tooltip.target = this;
        }
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    #pointerEnterHandler( event )
    {
        if( this.#foreground )
        {
            this.#foreground.style.opacity = "1";
        }
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    #pointerLeaveHandler( event )
    {
        if( this.#foreground )
        {
            this.#foreground.style.opacity = "0";
        }
    }
}

window.customElements.define("axial-icon-button", AxialIconButton);
export { AxialIconButton }