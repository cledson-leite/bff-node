const CommentsService = require("../service/comments_service");
const PostService = require("../service/post_service");
const UsersService = require("../service/users_service");

const postService = new PostService()
const commentsService = new CommentsService()
const usersService = new UsersService()

class PostController {
    

    constructor() {}

    async getPosts() {
        const posts = await postService.listPosts();
        const authorIds = new Set()
        for(const post of posts) {
            authorIds.add(post.authorId)
        }
        const users = await usersService.listUserIds([...authorIds])
        for(const post of posts) {
            post.author = users.get(post.authorId)
            post.authorId = undefined
        }
        return posts
    }
    
    async getPost(id) { 
        //paralelismo de chamadas       
        const [post, comments] = await Promise.all([
            postService.showPost(id),
            commentsService.listComments(id)
        ])

        const userIds = new Set([post.authorId])
        for(const comment of comments) {
            userIds.add(comment.userId)
        }

        const users = await usersService.listUserIds([...userIds])

        post.author = users.get(post.authorId)

        for(const comment of comments) {
            comment.user = users.get(comment.userId),
            comment.userId = undefined
        }

        return {...post, authorId: undefined, comments}
    }
}

module.exports = PostController