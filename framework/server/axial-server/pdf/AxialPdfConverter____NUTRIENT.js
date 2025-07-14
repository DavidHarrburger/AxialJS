"use strict";

import EventEmitter from "node:events";
import axios from "axios";
import FormData from "form-data";
import fs from "node:fs";

class AxialPdfConverter extends EventEmitter
{
    constructor()
    {
        super();
    }

    async convert()
    {
        try
        {
            const parts = { parts: [ { html: "index.html" } ] };
            const form = new FormData();
            form.append("instructions", JSON.stringify(parts));
            form.append("index.html", fs.createReadStream("./private/index.html"));
            const headers = 
            {
                headers: form.getHeaders( { "Authorization": "Bearer pdf_live_iM7ggaEIrAf79ezy1qNEwy8xrUmRkYjYdmQn8pB0kyF" } ),
                responseType: "stream"
            }
            
            const response = await axios.post("https://api.nutrient.io/build", form, headers );
            response.data.pipe( fs.createWriteStream("./private/daven.pdf") );
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {

        }
    }
}

export { AxialPdfConverter }