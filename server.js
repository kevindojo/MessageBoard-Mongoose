// ============== Always have, associated with packages installed ===========//
var express = require('express');
var app = express();

// ============== MONGOOSE ===========//
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/MessageBoard'); // name of DataBase!!!!
mongoose.Promise = global.Promise;



var path = require('path');

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
    // to get post data





// ============== use STYLE.CSS ===========//
app.use(express.static(path.join(__dirname, 'static')));

// ============== use static files?? ===========//
app.use(express.static(__dirname + "/static"));


// ============== Setting up ejs and our views folder ===========//
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');


// ============== Setting up MONGOOSE ===========//

var Schema = mongoose.Schema;

var PostSchema = new mongoose.Schema({
    name:{type: String, required: true},
    message: {type: String, required: true},
    comments:[{type: Schema.Types.ObjectId, ref: 'Comment'}]
    },{ timestamps:true }, { usePushEach: true } );

mongoose.model('Post', PostSchema);
var Post = mongoose.model('Post');


var CommentSchema = new mongoose.Schema({
    _post: {type: Schema.Types.ObjectId, ref: 'Post'},
    name: {type: String, required: true},
    message: {type: String, required: true}
    },{ timestamps: true }, { usePushEach: true } );

mongoose.model('Comment', CommentSchema);
var Comment = mongoose.model('Comment');


// ================================== ROUTES!!! ===============================//

// =======================DISPLAY ALL MESSAGES========================//
app.get('/', function(request, response){
    Post.find({}).populate('comments').exec(function(error, results){
        if(error){
            console.log('something broke in GET', error);
        } else {
            console.log('Success! All messages DISPLAY');
             response.render('index', {posts: results});
        }
    })
});


// =======================ADD MESSAGE========================//
app.post('/add', function(request, response){
    console.log("ADD: ", request.body);
    
    var post = new Post({
        name: request.body.name,
        message: request.body.message
    });

    post.save(function(error, results){
        if(error){
            console.log('something broke in POST SAVE message', error);
        } else {
            console.log('success from add POST SAVE message', results);
            response.redirect('/');

        }
    })
});

// =======================ADD COMMENT========================//
app.post('/comment/:id',function(request,repsonse){
    console.log(request.params.id)

    Post.findOne({_id: request.params.id}, function(error, post){
        var comment = new Comment({
            name: request.body.name,
            _post: post._id,
            message: request.body.comment
        });
        comment.save(function(error){
            post.comments.push(comment);
                post.save(function(error){
                    if(error){
                        console.log('something wrong COMMENT SAVE',error)
                    } else {
                        console.log("success COMMENT ADDED");
                        response.redirect('/');
                    }
            });
        });
    });
});




// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("Project Message Board running, listening on port 8000");
});