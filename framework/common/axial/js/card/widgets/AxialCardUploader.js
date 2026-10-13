"use strict";

import { AxialCard } from "../AxialCard.js";
import { AxialFileUploader } from "../../upload/AxialFileUploader.js";

class AxialCardUploader extends AxialCard
{
    constructor()
    {
        super();
        this.template = "axial-card-uploader-template";
    }

    _buildComponent()
    {
        super._buildComponent();
    }
}

window.customElements.define("axial-card-uploader", AxialCardUploader);
export { AxialCardUploader }