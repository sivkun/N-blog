var marked = require('marked');
var Post = require('../lib/mongo').Post;
var CommentModel = require('./comments');

//将post的content从markdown转化为html
Post.plugin('contentToHtml',{
  afterFind:function(posts){
    return posts.map(function(post){
      post.content = marked(post.content);
     return post;
    })
   
  },
  afterFindOne: function(post){
    if(post){
      post.content = marked(post.content);
    }
    return post;
  }
});

//给post添加留言数commentsCount
Post.plugin('addCommentsCount',{
  afterFind: function(posts){
    return Promise.all(posts.map(function(post){
      return CommentModel.getCommnetsCount(post._id).then(function(commentsCount){
        post.commentsCount = commentsCount;
        return post;
      });
    }));
  },
  afterFindOne: function(post) {
    if (post){
      return CommentModel.getCommnetsCount(post._id).then(function(count){
        post.commentsCount = count;
        return post;
      });
    }
    return post;
  }
})

module.exports = {
  create:function create(post){
    return Post.create(post).exec();
  },
  //通过文章id获取一篇文章
  getPostById: function getPostById(postId){
    return Post
      .findOne({_id: postId})
      .populate({path:'author',model:'User'})
      .addCreatedAt()
      .addCommentsCount()
      .contentToHtml()
      .exec()
  },
  //按创建时间降序获取说有用户文章或者某个特定用户的所有文章
  getPosts: function getPosts(author){
    var query = {};
    if (author){
      query.author = author;
    }
    return Post
      .find(query)
      .populate({ path:'author', model: 'User' })
      .sort({ _id: -1})
      .addCreatedAt()
      .addCommentsCount()
      .contentToHtml()
      .exec();
  },
  //通过文章 id 给pv 加1
  incPv: function incPv(postId){
    return Post
      .update({_id: postId },{ $inc: { pv: 1} })
      .exec();
  },
  getRawPostById: function getRawPostById(postId){
    return Post
      .findOne({_id:postId})
      .populate({path: 'author', model: 'User' })
      .exec();
  },
  //通过用户id和文章id更新一篇文章
  updatePostById: function updatePostById(postId, author, data) {
    return Post.update({author: author , _id: postId},{ $set:data}).exec();
  },
  //通过用户id和文章id删除一篇文章
  delPostId: function delPostId(postId ,author){
    return Post.remove({author: author,_id: postId}).exec()
    .then(function(res){
      //删除文章后，再删除所有留言
      if(res.result.ok&&res.result.n>0){
        return CommentModel.delCommentsByPostId(postId);
      }
    });
  }
};