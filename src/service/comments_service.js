const CircuitBreaker = require('opossum');
const Http = require('../external/http');
const redis = require('../redis');

class CommentsService {

    #client
    #cbListComments

    constructor() {
        this.#client =  new Http('http://localhost:3002');
        this.#cbListComments = new CircuitBreaker(async (postId,limit = 10) => {
            const key = `comments-${postId}-${limit}`
            //stale cache
            const staleKey = `comments-stale-${postId}-${limit}`
            const cached = await redis.get(key);
            if(cached) return JSON.parse(cached);
            
            const data = await this.#client.request({
            path: '/comments',
            method: 'GET',
            query: {
                postId
            }
            
            },{
                    timeout: 100
                },);

            const comments = []

            for (const comment of data) {
                if(comments.length >= limit) continue;
                comments.push({
                    id: comment.id,
                    text: comment.text,
                    userId: comment.userId
                })
            }

            redis.pipeline()
            .set(key, JSON.stringify(comments), 'EX', 60)
            .set(staleKey, JSON.stringify(comments), 'EX', 86400)
            .exec()

        }, {
            errorThresholdPercentage: 10,
            resetTimeout: 10000,
        })
        this.#cbListComments.fallback(async (limit) => {
            const cached = await redis.get(`comments-stale-${limit}`)
            return cached ? JSON.parse(cached) : [];

        })
    }

    async listComments(postId,limit = 10) {
        const { rejects, failures, fallbacks, successes } = this.#cbListComments.stats
        console.log({ rejects, failures, fallbacks, successes })
        
       return await this.#cbListComments.fire(postId,limit); 
    }

}

module.exports = CommentsService;