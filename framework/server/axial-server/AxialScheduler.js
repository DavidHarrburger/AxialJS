"use strict";

import EventEmitter from "node:events";
import timers from "node:timers";
import { AxialServerUtils } from "./AxialServerUtils.js";
import { AxialSchedulerTask } from "./schedule/AxialSchedulerTask.js";

class AxialScheduler extends EventEmitter
{
    // vars
    /** @type { Number } */
    #timeoutId = undefined;

    /** @type { Number } */
    #delay = 1000 * 60 * 60; // 1 hour in production
    //#delay = 1000 * 60; // 10 seconds for quick check

    /** @type { Array<AxialSchedulerTask } */
    #tasks = new Array();

    /** @type { Number } */
    #count = 0;

    /// events
    /** @type { Function } */
    #boundTimeoutHandler;


    constructor()
    {
        super();
        this.#boundTimeoutHandler = this.#timeoutHandler.bind(this);
    }

    #timeoutHandler()
    {
        console.log( "start running tasks", new Date() );
        this.#count += 1;
        this.#runTasks();
    }

    start()
    {
        console.log( "schedule starts at", new Date() );
        this.#timeoutId = timers.setTimeout( this.#boundTimeoutHandler, this.#delay );
    }

    /**
     * Add a cool task
     * @param { AxialSchedulerTask } task 
     */
    addTask( task )
    {
        if( task instanceof AxialSchedulerTask === false )
        {
            throw new TypeError("arg 'task' must be an instance of AxialSchedulerTask");
        }
        this.#tasks.push(task);
    }

    async #runTasks()
    {
        try
        {
            for( const task of this.#tasks )
            {
                const now = new Date().getTime();
                const taskTime = task.nextSchedule.getTime();

                console.log( now );
                console.log( taskTime );
                console.log( now > taskTime); 

                if( now > taskTime )
                {
                    const possibleTaskResult = await task.run();
                }
                
            }
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            console.log("end schedule");
            timers.clearTimeout( this.#timeoutId );
            this.#timeoutId = timers.setTimeout( this.#boundTimeoutHandler, this.#delay );
        }
    }

}

export { AxialScheduler }