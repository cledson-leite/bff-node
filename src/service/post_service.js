const Http = require('../external/http');
const redis = require('../redis');

class PostService {

    #client

    constructor() {
        this.#client = new Http('http://localhost:3001');
    }

    async listPosts(limit = 10) {
        const key = `posts-${limit}`
        //stale cache
        const staleKey = `posts-stale-${limit}`
        const cached = await redis.get(key);
        if(cached) return JSON.parse(cached);

        const data = await this.#client.request({
            path: '/posts',
            method: 'GET'
        }, {timeout: 5000});
        
        const posts = []

        for (const post of data) {
            if(posts.length >= limit) continue;
            posts.push({
                id: post.id,
                title: post.title,
            })
        }

        redis.set(key, JSON.stringify(data), 'EX', 60)
        redis.set(staleKey, JSON.stringify(data), 'EX', 86400)
        return data;
    }

    async showPost(id) {
        const key = `post-${id}`

        const cached = await redis.get(key);
        if(cached) return JSON.parse(cached);
        
        const data = await this.#client.request({
            path: `/posts/${id}`,
            method: 'GET'
        }, { timeout: 5000 });
        const result = {
            id: data.id,
            title: data.title,
            text: data.text,
            authorId: data.authorId
        }

        redis.set(key, JSON.stringify(result), 'EX', 60)

        return result
    }

}

module.exports = PostService;