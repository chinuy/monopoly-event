"use strict";
var async = require('async');
var mongo = require('mongoskin');
var glob = require('glob');
var fs = require('fs');
var db = mongo.db("mongodb://localhost:27017/local", {native_parser:true});
var type = ["logo", "geo", "wisdom", "team", "destiny"];
for (var t in type) {
  db.bind(type[t]);
}

var null_function = function(){};

// Team
for(var i = 0; i < 7; i++) {
  var n = "TEAM" + i
  var value = {name: n, location: 0, score: 10000};
  db.collection('team').ensureIndex( {name: 1}, {unique: true, dropDups: true}, null_function);
  db.collection('team').insert( value, null_function);
}

// wisdom
fs.readFile(__dirname + "/../etc/wisdom.json", 'utf8', function(err, data) {
  if(err) throw err;
  var items = JSON.parse(data).X;
  items.forEach(function(k, i){
    var no = "W" + i;
    var wisdom = {
      name: no,
      title: k.Q,
      score: 3000,
      type: "Cool Wisdom",
      url: "",
      Q: {list: k.list},
      A: {text: k.list[k.A-1]},
      priority: 0
    };
    db.wisdom.ensureIndex({name: 1}, {unique:true, dropDups:true}, function(err){});
    db.wisdom.insert(wisdom, null_function);
  });
});

// Geo
var GEO_PATH = __dirname + "/../public/images/geo/";
var glob = require("glob");
glob(GEO_PATH + "*.jpg", function(err, files){
  files.forEach(function(k, i) {
    var re = /(.*)\/(images.*)$/;
    var k = k.replace(re, "$2");
    re = /images\/geo\/(.*)\.jpg$/;
    var answer = k.replace(re,"$1");
    var no = "G" + i;
    var geo = {
      name: no,
      type: "Geography",
      title: "Where is it?",
      score: 3000,
      url: "",
      Q: {url: k},
      A: {text: answer},
      priority: 0
    };
    db.geo.ensureIndex({name: 1}, {unique:true, dropDups:true}, function(err){});
    db.geo.insert(geo, null_function);
  });
});

// Logo king
var LOGO_KING_PATH = __dirname + "/../public/images/logo_king/";
var glob = require("glob");
glob(LOGO_KING_PATH + "*_answer.jpg", function(err, files){
  files.forEach(function(k, i) {
    var re = /(.*)\/(images.*)$/;
    k = k.replace(re, "$2");
    var no = "L" + i;
    var logo = {
      name: no,
      type: "Logo King",
      title: "Who am I?",
      score: 3000,
      url: "",
      Q: {url: k},
      A: {url: k.replace("_answer", "")},
      priority: 0
    };
    db.logo.ensureIndex({name: 1}, {unique:true, dropDups:true}, function(err){});
    db.logo.insert(logo, null_function);
  });
});

// Destiny
fs.readFile(__dirname + "/../etc/destiny.json", 'utf8', function(err, data) {
  if(err) throw err;
  var items = JSON.parse(data).X;
  items.forEach(function(k, i){
    var no = "D" + i;
    var destiny = {
      name: no,
      title: k.Q,
      score: "???",
      type: "Destiny",
      url: "",
      Q: {url: k.url},
      A: {text: k.A},
      priority: 0
    };
    db.destiny.ensureIndex({name: 1}, {unique:true, dropDups:true}, function(err){});
    db.destiny.insert(destiny, null_function);
  });
});

// Grid id mapping
var grid_id = {
  1: "start",
  2: "geo",
  3: "logo",
  4: "wisdom",
  5: "destiny",
  6: "park",
  7: "geo",
  8: "logo",
  9: "wisdom",
  10: "destiny",
  11: "park",
  12: "geo",
  13: "logo",
  14: "wisdom",
  15: "destiny",
  16: "park",
  17: "geo",
  18: "logo",
  19: "wisdom",
  20: "destiny"
}

