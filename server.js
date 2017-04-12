var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "./static")));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost/message_board_db');
mongoose.Promise = global.Promise;

var Schema = mongoose.Schema;
var PostSchema = new mongoose.Schema({
	name: { type: String, required: true},
	text: { type: String, required: true},
	comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
}, {timestamps: true});

var CommentSchema = new mongoose.Schema({
	name: { type: String, required: true, minlength: 4 },
	text: { type: String, required: true },
	_post: { type: Schema.Types.ObjectId, ref: 'Post'}
}, {timestamps: true});

var Post = mongoose.model('Post', PostSchema);
var Comment = mongoose.model('Comment', CommentSchema);

// load index page
app.get('/', function(req, res) {
	Post.find({}).populate('comments').exec(function(err, posts) {
		res.render('index', {posts: posts});
	});
});

// add a post
app.post('/post', function(req, res) {
	var post = new Post(req.body);

	post.save(function(err) {
		if (err) {
			console.log('error adding a post');
		} else {
			res.redirect('/');
		}
	});
});

app.post('/comment/:id', function(req, res) {
	Post.findOne({_id: req.params.id}, function(err, post) {
		var comment = new Comment(req.body);
		comment._post = post._id;
		post.comments.push(comment);
		comment.save(function(err) {
			post.save(function(err) {
				if(err) {console.log('error saving comment to post');}
				else{ res.redirect('/');}
			});
		});
	});
});


app.listen(8000, function() {
 console.log("listening on port 8000");
});








