"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialTypingBubble extends AxialComponentBase
{
    /// vars
    /** @type { String } */
    #animationName = "axialTypingBubbleBlink"; //1.4s infinite both

    /// elements
    /** @type { HTMLElement } */
    #holder;

    /** @type { Array.<HTMLElement> } */
    #dots;

    constructor()
    {
        super()
        this.classList.add("axial_typing_bubble");
        this.template = "axial-typing-bubble-template";
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#holder = this.shadowRoot.getElementById("holder");
        this.#dots = Array.from( this.#holder.getElementsByClassName("axial_typing_bubble-dot") );

        let delay = 0;
        for( const dot of this.#dots )
        {
            delay = delay + 0.2;
            dot.style.animationDelay = `${delay}s`;
        }
    }

    start()
    {
        for( const dot of this.#dots )
        {
            dot.style.animationName = this.#animationName;
        }
    }

    stop()
    {
        for( const dot of this.#dots )
        {
            dot.style.animationName = "none";
        }
    }

}

window.customElements.define("axial-typing-bubble", AxialTypingBubble);
export { AxialTypingBubble }