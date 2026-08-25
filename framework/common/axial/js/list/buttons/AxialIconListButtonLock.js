"use strict";

import { AxialIconButton } from "../../button/AxialIconButton.js";
import { ColorUtils } from "../../utils/ColorUtils.js";

class AxialIconListButtonLock extends AxialIconButton
{
    /// events
    /** @type { Function } */
    #boundComponentBuiltHandler;

    constructor()
    {
        super();

        this.#boundComponentBuiltHandler = this.#componentBuiltHandler.bind(this);
        this.addEventListener("componentBuilt", this.#boundComponentBuiltHandler);

        this.style.cursor = "default";
        this.iconName = "lock";
        this.tooltipText = "Cette ligne est verrouillée\nVous pouvez la cloner pour la modifier";


    }

    _buildComponent()
    {
        super._buildComponent();

        this.foreground.style.backgroundColor = "transparent";
        
    }

    #componentBuiltHandler( event )
    {
        this.tooltip.style.backgroundColor = ColorUtils.RED.mid_dark;
        this.tooltip.style.borderColor = ColorUtils.RED.mid_dark;
    }

}

window.customElements.define("axial-icon-list-button-lock", AxialIconListButtonLock);
export { AxialIconListButtonLock }