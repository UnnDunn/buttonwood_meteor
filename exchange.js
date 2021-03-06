Bids = new Meteor.Collection("bids");
Asks = new Meteor.Collection("asks");
// Add a marker to the map and push to the array.


function getLocation(){
    navigator.geolocation.watchPosition(setLocation, noLocation);
}
function setLocation(position){
    Session.set("location", position.coords);
}
function noLocation()
{
    alert('Could not find location');
    Session.set('location', {longitude: null, latitude: null});
}
function setGox(results){
   Session.set("gox", results);
   data = JSON.parse(Session.get('gox').content);
   Session.set('gox_sell', data.return.buy.display_short);
   Session.set('gox_buy', data.return.sell.display_short);
}
function click_input_add(kind) {
  var user = Meteor.user();
  if (user === null) {
    alert('login to put your order on the book');
    return;
  }
  var name = user.username;
  var email = user.emails[0].address;
  var price = parseInt(document.getElementById(kind + '_price').value);
  console.log(price);
  var size = parseInt(document.getElementById(kind + '_size').value);
  console.log(size);
  //console.log("user.id is " + user._id);
  if (isNaN(price) || isNaN(size)) {
    alert('must have valid price and size');
  }
  else if (price <1 || size < 1 ){
      alert('price or size too small');
  }
  else {
    position = [Session.get("location").latitude, Session.get("location").longitude];
    if (kind == 'ask') {
      Asks.insert({user_id: user._id, name: name, price: price, size: size, location: position});
    }
    if (kind == 'bid') {
      Bids.insert({user_id: user._id, name: name, price: price, size: size, location: position});
    }
  }
  document.getElementById(kind + '_price').value = '';
  document.getElementById(kind + '_size').value = '';
}

if (Meteor.isClient) {

  function getUsername() {
    var user = Meteor.user();
    if (user === null || typeof user === 'undefined') { return ""; }
    return user.username;
  }
  Meteor.http.get('http://data.mtgox.com/api/1/BTCUSD/ticker_fast', {}, function (error, result) {
    if (result.statusCode === 200) setGox(result);
  });
  Accounts.ui.config(
  {passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'}
  );
  getLocation();

  Template.bid_list.username = getUsername;
  Template.ask_list.username = getUsername;
  Template.bid_list.bids = function() {
    return Bids.find({}, {sort: {price: -1}});
  };
  Template.bid_list.is_mine = function() {
      if (this.name === getUsername()) {
          return "mine"
      }
      else {
          return "other"
      }
  };
  Template.bid_list.gox_price = function() {
      return Session.get('gox_sell');
  }
  Template.ask_list.gox_price = function(){
      return Session.get('gox_buy');
  }
  Template.ask_list.is_mine = function() {
      if (this.name === getUsername()) {
          return "mine"
        }
      else {
          return "other"
        }
    };
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
      },
      'click input.up_price': function() {
          Asks.update(this._id, {$inc: {price: 1}})
      },
      'click input.down_price': function() {
          Asks.update(this._id, {$inc: {price: -1}})
      },
      'click input.up_size': function() {
          Asks.update(this._id, {$inc: {size: 1}})
      },
      'click input.down_size': function() {
          Asks.update(this._id, {$inc: {size: -1}})
      }
  });
  Template.body.getAllOrders = function () {
      getAllOrders();
  };
  Template.bid_list.events({
    'click input.remove': function(){
        Bids.remove(this._id);
    },
    'click input.up_price': function() {
        Bids.update(this._id, {$inc: {price: 1}})
    },
    'click input.down_price': function() {
        Bids.update(this._id, {$inc: {price: -1}})
    },
    'click input.up_size': function() {
        Bids.update(this._id, {$inc: {size: 1}})
    },
    'click input.down_size': function() {
        Bids.update(this._id, {$inc: {size: -1}})
    }
  });
}



