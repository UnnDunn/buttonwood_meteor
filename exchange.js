Bids = new Meteor.Collection("bids");
Asks = new Meteor.Collection("asks");

function getLocation(){
    navigator.geolocation.watchPosition(setLocation, noLocation);
}
function setLocation(position){
    Session.set("location", position.coords);
}
function noLocation()
{
    alert('Could not find location');
}
function getUserName(){
    return Meteor.user().username;
}
function click_input_add(kind) {
  var user = Meteor.user();
  if (user === null) {
    alert('login to put your order on the book');
    return;
  }
  var name = user.username;
  var email = user.emails[0].address;
  var price = document.getElementById(kind + '_price').value;
  var size = document.getElementById(kind + '_size').value;
  //console.log("user.id is " + user._id);
  if (price === '' || size === '') {
    alert('must have valid price and size');
  }
  else {
    if (kind == 'ask') {
      Asks.insert({user_id: user._id, name: name, price: price, size: size, location: [Session.get("location").latitude, Session.get("location").longitude]});
    }
    if (kind == 'bid') {
      Bids.insert({user_id: user._id, name: name, price: price, size: size, location: [Session.get("location").latitude, Session.get("location").longitude]});
    }
  }
  document.getElementById(kind + '_price').value = '';
  document.getElementById(kind + '_size').value = '';
}

if (Meteor.isClient) {
  Accounts.ui.config(
  {passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'}
  );
  getLocation();
  Template.bid_list.bids = function() {
    return Bids.find({}, {sort: {price: -1}});
  };
  Template.bid_list.name = function() { return getUserName(); };
  Template.ask_list.name = function() { return getUserName(); };
  Template.ask_info.is_mine = function() {
    return (this.user_id === Meteor.userId());
  };
  Template.ask_list.asks = function() {
    return Asks.find({}, {sort: {price: 1}});
  };
 Template.ask_list.events({
    'click input.add': function() { click_input_add("ask");}
  });
  Template.bid_list.events({
    'click input.add': function() { click_input_add("bid");}
  });
  Template.ask_list.events({
    'click input.remove': function(){
        Asks.remove(this._id);
    }
  });
  Template.bid_list.events({
    'click input.remove': function(){
        Bids.remove(this._id);
    }
  });
}



