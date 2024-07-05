const { Redis } = require("ioredis");

const redis = new Redis({
    host: 'rediss://red-cq42cbjqf0us73dqkan0:rawSuN3pGY1QznZvqGlaVzIvAIrfgvXr@oregon-redis.render.com',
    port: 6379
});

module.exports = redis