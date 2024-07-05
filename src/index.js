const fastify = require("fastify");
const Controller = require("./controller/post_controller");

const app = fastify({ logger: true });
const controller = new Controller();


app.get("/posts", async (request, reply) => {
    const posts = await controller.getPosts();
    return reply.send(posts);
});

app.get("/posts/:id", async (request, reply) => {
    const id = request.params.id;
    const post = await controller.getPost(id);
    return reply.send(post);
});

app.listen({ port: 3000 }, (err, address) => {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
    console.log(`Server listening on ${address}`);
});