"use strict";

import { AxialOverlayBase } from "../overlay/AxialOverlayBase.js";

class AxialEditorContextOverlay extends AxialOverlayBase
{
    constructor()
    {
        super();
    }
    
}

window.customElements.define("axial-editor-context-overlay", AxialEditorContextOverlay);
export { AxialEditorContextOverlay }