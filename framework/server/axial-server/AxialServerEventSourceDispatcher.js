"use strict";

import EventEmitter from "node:events";


class AxialServerEventSourceDispatcher extends EventEmitter
{
    /** @type { Set<Express.Response> } */
    #clients = new Set();

    /** @type { Function } */
    #boundIntervalHandler;

    /** @type { Number } */
    #intervalDelay = 30000;

    /** @type { Number } */
    #intervalId;

    constructor()
    {
        super();
        this.#boundIntervalHandler = this.#heartBeat.bind(this);
        this.#startHearBeat();
    }

    /**
     * 
     * @param { Express.Request } req 
     * @param { Express.Response } res 
     */
    register( req, res )
    {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        res.flushHeaders?.();

        this.#clients.add(res);

        this.broadcast( "connected", { ip: req.ip, num: this.#clients.size } );

        req.on( "close", () => 
        {
            this.#clients.delete( res );
            this.broadcast( "disconnected", { ip: req.ip, num: this.#clients.size } );
        });
    }

    broadcast( name, data )
    {
        const json = JSON.stringify( data );
        let stream = `event: ${name}\n`;
        stream += `data: ${json}\n\n`;

        for( const client of this.#clients )
        {
            client.write( stream );
        }
    }

    #heartBeat()
    {
        for( const client of this.#clients )
        {
            client.write(": ping\n\n");
        }
    }

    #startHearBeat()
    {
        this.#intervalId = setInterval( this.#boundIntervalHandler, this.#intervalDelay );
    }

    #stopHearBeat()
    {
        clearInterval(this.#intervalId);
    }

}

export { AxialServerEventSourceDispatcher }
