//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const serveStatic = require('serve-static')
const mongoose =require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Riyaz-atlas:Riyaz123@cluster0.ec3v4.mongodb.net/TodolistDB?retryWrites=true&w=majority");

const itemsSchema = {
  name : String
};
const Item = mongoose.model("Item",itemsSchema);

const item1= new Item({
  name : "Welcome to do list "
});
const item2=new Item({
  name : "Hit the + button to add new items in to do list "
});
const item3 = new Item({
  name : "<-- Hit this to delete the item "
});

const defaultItems= [item1,item2,item3];
const listSchema ={
  name : String,
  items : [itemsSchema]
};
const List = mongoose.model("List",listSchema);

app.get("/", function(req, res){
  Item.find({},function(err , foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          log(err);
        }else{
          console.log("Succesfully added to db");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

app.get("/:CustomListName",function(req, res){
  const customListName = _.capitalize(req.params.CustomListName);
  List.findOne({name : customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name : customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else
      {
        res.render("list",{listTitle : foundList.name , newListItems:foundList.items});
      }
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name : itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name : listName },function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })

  }

});
app.post("/delete" , function(req, res)
{
  const checkedItem = req.body.checkbox;
  const listName=req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItem, function(err){
      if(!err)
      {
        console.log("succesfully deleted the checked item");
        res.redirect("/");
      }
     });
  }else{
    List.findOneAndUpdate({name: listName},{$pull :{items:{_id:checkedItem}}},function(err,foundList){
      if(!err){
        res.redirect("/" +listName);
      }
    });
  }

});



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
// app.listen(port);

app.listen(port, function() {
  console.log("Server started successfully");
});
