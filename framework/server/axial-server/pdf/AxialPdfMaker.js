"use strict";

import EventEmitter from "node:events";
import fsp from "node:fs/promises";
import { PDFDocument, PageSizes, rgb } from "pdf-lib";

class AxialPdfMaker extends EventEmitter
{
    /** @type { Number } */
    #wi = 595;

    /** @type { Number } */
    #hi = 840;

    /** @type { Number } */
    #margin = 40;

    /** @type { Number } */
    #maxWidth = this.#wi - 2 * this.#margin;

    /** @type {String } */
    #lorem = "Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."

    constructor()
    {
        super();
    }

    async create()
    {
        try
        {
            const pdf = await PDFDocument.create();
            const page = pdf.addPage( PageSizes.A4 );
            const sizes = page.getSize();
            console.log(sizes);
            const initX = this.#margin;
            const initY = sizes.height - this.#margin;
            page.moveTo(initX,initY);
            page.drawText(this.#lorem, { size: 12, lineHeight: 14, color:rgb(1, 0, 0), maxWidth:this.#maxWidth } );
            const pdfBytes = await pdf.save();
            const pdfFile = await fsp.writeFile( "./private/test1.pdf", pdfBytes );
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            console.log("youpi tralala");
        }
    }
}

export { AxialPdfMaker }