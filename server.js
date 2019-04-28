var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var EMOTION_STATUS = "emotion";

var app = express();
// app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

var db;

mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
.
  db = database;
  console.log("Database connection ready");

  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

app.get("/status", function(req, res) {
  db.collection(EMOTION_STATUS).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get emotion.");
    } else {
      console.log("DOCS DATA", docs[0].status)
      res.status(200).json(docs);
    }
  });
});

app.post("/status", function(req, res) {
  var newEmotion = req.body;

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
