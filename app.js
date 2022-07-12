//jshint esversion:6
require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


// Database Connection
mongoose.pluralize(null);

// const localUri = "mongodb://localhost:27017/";
const dbIntigration = process.env.DB_USERNAME + ":" + process.env.DB_PASSWORD;
const dbName = "TodoListDB";
const uri = "mongodb+srv://" + dbIntigration + "@cluster0.w4izs.mongodb.net/";
mongoose.connect(uri + dbName);

const itemSchema = {
  name: String
}

const Item = mongoose.model("items", itemSchema);

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("lists", listSchema);

const i1 = new Item({
  name: "LeetCode Questions"
});
const i2 = new Item({
  name: "Web Dev"
});

const defaultItems = [i1, i2];

Item.find({}, (err, foundItems) => {
  if (err)
    console.log(err);
  else {

    if (foundItems.length == 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err)
          console.log(err);
        else
          console.log("Successfully Inserted!");
      })
    }

    console.log(foundItems);
  }
});

const today = date.getDate();
app.get("/", function (req, res) {
  Item.find({}, (err, foundItems) => {
    if (err)
      console.log(err);
    else
      res.render("list", { listTitle: today, newListItems: foundItems });
  });
});

app.post("/", function (req, res) {

  const enteredItem = req.body.newItem;
  const listName = req.body.list;

  const tempItem = new Item({
    name: enteredItem
  });

  if (listName == today) {
    tempItem.save();
    res.redirect("/");
  }
  else {
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(tempItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItem = req.body.checkbox;
  const checkedList = req.body.listName;

  if (checkedList == today) {
    Item.findByIdAndDelete(checkedItem, (err) => {
      if (err)
        console.log(err);
      else
        console.log("Successfully deleted!");
    });
    res.redirect("/");
  }
  else {
    List.findOneAndUpdate({ name: checkedList }, { $pull: { items: { _id: checkedItem } } }, (err, foundList) => {
      if (!err) {
        res.redirect("/" + checkedList);
      }
    });
  }


});


app.get("/:customName", (req, res) => {
  const customListName = _.capitalize(req.params.customName);

  List.findOne({ name: customListName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        const newList = new List({
          name: customListName,
          items: defaultItems
        });
        newList.save();
        res.redirect("/" + customListName);
      }
      else {
        res.render("list", { listTitle: customListName, newListItems: foundList.items });
      }
    }
    else
      console.log(err);
  });


});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});



// var https = require("https");
// setInterval(function() {
//     https.get("https://to-do-list-vijay-cpp.herokuapp.com");
// }, 300000); // every 5 minutes (300000)