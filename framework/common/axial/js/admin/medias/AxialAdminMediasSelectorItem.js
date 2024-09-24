"use strict"

import { AxialComponentBase } from "../../core/AxialComponentBase.js";
import { FileUtils } from "../../utils/FileUtils.js";
import { AxialTooltipBase } from "../../tooltip/AxialTooltipBase.js";

class AxialAdminMediasSelectorItem extends AxialComponentBase
{
    /// vars
    #publicMediaPath = "../medias/";

    /** @type { String } */
    #fileSplitter = "_____";

    /// elements
    /** @type { HTMLImageElement } */
    #image;

    /** @type { HTMLVideoElement } */
    #video;

    /** @type { HTMLElement } */
    #infos;

    /** @type { HTMLElement } */
    #name;

    /** @type { AxialTooltipBase } */
    #tooltip;

    constructor()
    {
        super();
        this.classList.add("axial_admin_medias_selector_item");
        this.template = "axial-admin-medias-selector-item-template";
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#buildComponent();
    }

    #buildComponent()
    {
        this.#image = this.shadowRoot.getElementById("image");
        this.#video = this.shadowRoot.getElementById("video");
        this.#name = this.shadowRoot.getElementById("name");
        this.#infos = this.shadowRoot.getElementById("infos");

        this.#tooltip = new AxialTooltipBase();
        this.#tooltip.target = this.#infos;
        this.#tooltip.position = "top-left";
    }

    _onDataChanged()
    {
        super._onDataChanged();
        this.#updateComponent();
    }

    async #updateComponent()
    {
        try
        {
            const fileName = String(this.data);
            const fileDate = new Date( Number( fileName.split( this.#fileSplitter)[0] ) );
            const fileNameBase = fileName.split( this.#fileSplitter)[1];
            const fileExt = fileName.substring( fileName.lastIndexOf(".") );
            const fileType = FileUtils.getFileType(fileExt);
            const filePath = this.#publicMediaPath + String(this.data);

            const response = await fetch(filePath, { method: "GET" } );
            const blob = await response.blob();
            const fileUrl = URL.createObjectURL(blob);
            const fileSize = blob.size;
    
            this.#name.innerHTML = fileNameBase;
    
            if( this.#tooltip )
            {
                
            }
            
            switch( fileType )
            {
                case "image":
                    this.#image.style.display = "block";
                    this.#image.src = fileUrl;
                break;
    
                case "video":
                    this.#video.style.display = "block";
                    const sourceElement = document.createElement("source");
                    this.#video.appendChild(sourceElement);
                    sourceElement.src = fileUrl;
                break;
    
                case "file":
                    
                break;
            
                default:
                break;
            }

        }
        catch(err)
        {
            console.log(err);
        }
    }
}
window.customElements.define("axial-admin-medias-selector-item", AxialAdminMediasSelectorItem);
export { AxialAdminMediasSelectorItem }