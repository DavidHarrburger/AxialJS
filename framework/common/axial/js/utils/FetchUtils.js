"use strict";

class FetchUtils
{
    static HEADERS = { "Content-Type":"application/json", "Cache-Control":"no-cache" }
    static async GET( path , query )
    {
        try
        {
            const getPath = query == undefined ? path : path + "?" + query;
            const response = await fetch( getPath, { method: "GET", headers: { "Content-Type":"application/json", "Cache-Control":"no-cache" } } );
            const json = await response.json();
            return json;
        }
        catch(err)
        {
            console.log(err);
        }
    }

    static async POST( path , body, headers )
    {
        // control
        try
        {
            if( headers == undefined )
            {
                headers = FetchUtils.HEADERS;
                body = JSON.stringify(body);
            }
            
            const response = await fetch( path, { method: "POST", body: body, headers: headers } );
            const json = await response.json();
            return json;
        }
        catch(err)
        {
            console.log(err);
        }
    }
}

export { FetchUtils }