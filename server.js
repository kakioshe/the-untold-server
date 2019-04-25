var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var EMOTION_STATUS = "emotion";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// CONTACTS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/contacts"
 *    GET: finds all contacts
 *    POST: creates a new contact
 */

app.get("/status", function(req, res) {
  db.collection(EMOTION_STATUS).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get emotion.");
    } else {
      console.log("DOCS DATA", docs.status)
      res.status(200).json(docs);
    }
  });
});

app.post("/status", function(req, res) {
  var newEmotion = req.body;
  newEmotion.createDate = new Date();

  if (!(req.body.status)) {
    handleError(res, "Invalid user input", "Must provide Emotion", 400);
  }

  db.collection(EMOTION_STATUS).insertOne(newEmotion, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new emotion.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

app.put("/status/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;
  console.log("request data", updateDoc);

  db.collection(EMOTION_STATUS).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update emotion");
    } else {
      res.status(204).end();
    }
  });
});