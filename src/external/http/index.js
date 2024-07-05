const { Client } = require("undici");
const { setTimeout } = require('timers/promises');
const TimeOutException = require("../exception");

class Http {
    #client

    constructor(url) {
        this.#client = new Client(url);
    }

    async request (params, options = {}) {
        const cancelTimeout = new AbortController();
        const cancelRequest = new AbortController();

        try {
            const response = await Promise.race([
                this.#handleRequest(params, {cancelRequest, cancelTimeout}),
                this.#timeout(options.timeout, {cancelRequest, cancelTimeout} )
            ]);

            return response
            
        } catch (error) {
            if(error.name === 'TimeOutException') {
                console.log(error.message)
            }

            throw error
        }

        
    }

    async #handleRequest(params, {cancelRequest, cancelTimeout}) {
        try {
            const response = await this.#client.request({
                ...params,
                throwOnError: true,
                signal: cancelRequest.signal,
            });

            const data = await response.body.json();

            return data
            
        } finally {
            cancelTimeout.abort()
        }
        
    }

    async #timeout(delay, {cancelRequest, cancelTimeout}){
        try {
            await setTimeout(
                delay, undefined, 
                {signal: cancelTimeout.signal}
            )
            cancelRequest.abort()
            
        } catch (error) {
            return
        }

        throw new TimeOutException()
        
    }
}

module.exports = Http