// ============== Always have, associated with packages installed ===========//
var express = require('express');
var session = require('express-session');
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

var MessageSchema = new mongoose.Schema({
    name:{type: String, required: true},
    message: {type: String, required: true},
    comments:[{type: Schema.Types.ObjectId, ref: 'Comment'}]
    },{ timestamps:true }, { usePushEach: true } );




var CommentSchema = new mongoose.Schema({
    _message: {type: Schema.Types.ObjectId, ref: 'Message'},
    name: {type: String, required: true},
    text: {type: String, required: true}
    },{ timestamps: true }, { usePushEach: true } );


// set models by passing the schemas
mongoose.model("Message", MessageSchema);
mongoose.model("Comment", CommentSchema);

// store models in variables
var Message = mongoose.model("Message");
var Comment = mongoose.model("Comment");


// ================================== ROUTES!!! ===============================//



// =======================DISPLAY ALL MESSAGES========================//
app.get('/', function(request, response){
    Message.find({}).populate('comments').exec(function(error, messages){
        if(error){
            console.log('something broke in GET', error);
        } else {
            console.log('Success! All messages DISPLAY');
             response.render('index', {posts: messages, session: request.session});
        }
    })
});
// =======================DISPLAY ALL MESSAGES========================//



// =======================ADD MESSAGE========================//
app.post('/add', function(request, response){
    console.log("ADD: ", request.body);
    var new_message = new Message({
        name: request.body.name,
        message: request.body.message
    });
    new_message.save(function(error, results){
        if(error){
            console.log('something broke in POST SAVE message', error);
            response.redirect('/');
        } else {
            console.log('success from add POST SAVE message', results);
            response.redirect('/');
        }
    })
});
// =======================ADD MESSAGE========================//




// =======================ADD COMMENT========================//
app.post('/comment/:id', function(request,response){
    console.log(request.params.id)
    Message.findOne({_id: request.params.id}, function(error, message){
        var new_comment = new Comment({
            name: request.body.name,
            _message: message._id,
            text: request.body.text});

        new_comment.save(function(error){
            if(error){
                console.log("error adding comment!!", error)
                response.redirect('/');
            } else {
                message.comments.push(new_comment);
                message.save(function(error){
                    if(error){
                        console.log('message DIDNT save', error);
                    } else {
                        console.log('message saved!');
                    }
                console.log("comment added!")
                response.redirect('/');
                });
            }
        });
    });
});



// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("Project Message Board running, listening on port 8000");
});