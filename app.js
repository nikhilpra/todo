//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose")
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-nikhil:nikhilpr@cluster0.xbvnu.mongodb.net/todolistDB",{useNewUrlParser: true,useUnifiedTopology: true})
mongoose.set('useFindAndModify', false);
const itemSchema ={
  name: String
};

const Item = mongoose.model("Item",itemSchema)

const item1 = new Item({
  name:"Welcome to your todolist"
})

const item2 = new Item({
  name:"Hit the + button to add a new item."
})

const item3= new Item({
  name:"<--Hit this to delete an item"
})

const defaultItem = [item1,item2,item3]

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List",listSchema)





app.get("/", function(req, res) {
  
  
  Item.find({},function(err,foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItem,function(err){
      if(err){
      console.log(err);
      }
      else{
      console.log("Successful");
      }
    })

    res.redirect("/")
    }

    else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })





});

app.post("/delete",function(req,res){
  const id = req.body.checkbox
  const listName = req.body.listName
  if(listName === "Today"){
    Item.deleteOne({_id:id},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Successfully deleted");
        res.redirect("/")
      }
    })

  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:id}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName)
      }
    })
    

  }

  

  console.log();

})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name:itemName
  })
  if(listName === "Today"){
    item.save();
    res.redirect("/")
  } else {
    List.findOne({name: listName},function(err,found){
      if(!err){
        found.items.push(item);
        found.save();
        res.redirect("/"+listName);
      }
    })
  }
 


});

app.get("/:id",function(req,res){

  const id = _.capitalize(req.params.id)  
  //console.log(req.params.id); 
  List.findOne({name: id},function(err,found){
    if(!err){
      if(!found){
        //create new list
        const listitem = new List({
          name: id,
          items: defaultItem
        })
        listitem.save()
        res.redirect("/"+id)
      }
      else{
        //redirect to existing todo
        res.render("list",{listTitle:id,newListItems:found.items})
      }
    }
  })



})

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
