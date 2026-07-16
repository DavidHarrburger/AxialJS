"use strict";

class FetchUtils
{
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

    static async POST( path , body )
    {
        // control
        try
        {
            const response = await fetch( path, { method: "POST", body: JSON.stringify(body), headers: { "Content-Type":"application/json", "Cache-Control":"no-cache" } } );
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