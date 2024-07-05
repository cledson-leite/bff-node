const Http = require('../external/http');

class UsersService {

    #client

    constructor() {
        this.#client =  new Http('http://localhost:3003');
    }

    async listUserIds(ids) {
        const data = await this.#client.request({
            path: '/users',
            method: 'GET',
            query: {
                id: ids
            }
        }, {timeout: 3000});
        const users = new Map()
        for(const user of data) {
            users.set(user.id, user.name)
        }
        return users;
    }
}

module.exports = UsersService;