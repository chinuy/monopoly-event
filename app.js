// mongoDB
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/local", {native_parser:true});
db.bind('logo');
db.bind('geo');
db.bind('wisdom');
db.bind('team');
db.bind('destiny');


var http = require("http");
var url = require('url');
var fs = require('fs');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
var methodOverride = require('method-override');
//var app = express();
var express = require('express')
  , path = require('path')
  , app = express()
    
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);


var grid_id = {
  1: "start",
  2: "geo",
  3: "logo",
  4: "wisdom",
  5: "destiny",
  6: "opportunity",
  7: "wisdom",
  12: "logo",
  13: "destiny",
  18: "geo",
  19: "geo",
  24: "destiny",
  25: "logo",
  29: "wisdom",
  30: "opportunity",
  31: "logo",
  32: "wisdom",
  33: "destiny",
  34: "geo",
  35: "opportunity"
}
var null_function = function(){};
var score;
var location;
var logoname,logourl,logopriority;
var wisdomname,wisdomtitle,wisdompriority;
var geoname,geotitle,geopriority;
var destinyname,destinytitle,destinypriority;
db.team.find().sort({"name":1}).toArray(function(err, items) {
  score = [];
  items.forEach(function(k, i){
    score.push(k["score"]);
  });
});

db.team.find().sort({"name":1}).toArray(function(err, items) {
  location = [];
  items.forEach(function(k, i){
    location.push(k["location"]);
  });
});



io.set('log level', 1); 


io.on('connection', function (socket) {
  priority_change('logo');
  priority_change('wisdom');
  priority_change('geo');
  priority_change('destiny');


//console.log(wisdomtitle);
console.log("connected");
  socket.emit('scorefirst', {'score': score});
  socket.emit('locationfirst', {'locat': location});
  
  setInterval(function() {
     socket.emit('date', {'date': new Date()});

  }, 1000);

function priority_change(Q_type)
{
if(Q_type=='logo'){
  db.logo.find().sort({"name":1}).toArray(function(err, items) {
  logoname = [];
  logourl = [];
  logopriority=[];
  items.forEach(function(k, i){
    logourl.push(k.Q.url);
    logoname.push(k["name"]);
    logopriority.push(k["priority"]);
     });
    console.log(logopriority);
    socket.emit('event', { 'Type':'logo',
                           'logo': logourl,
                           'name': logoname,
                           'priority':logopriority
                           });
    socket.broadcast.emit('event', {  'Type':'logo',
                                      'logo': logourl,
                                      'name': logoname,
                                      'priority':logopriority
                                   });
    });
  }
  else if(Q_type=='wisdom')
  {
    db.wisdom.find().sort({"name":1}).toArray(function(err, items) {
      wisdomname = [];
      wisdomtitle = [];
      wisdompriority=[];
      items.forEach(function(k, i){
      wisdomtitle.push(k["title"]);
      wisdomname.push(k["name"]);
      wisdompriority.push(k["priority"]);
        });
  
     socket.emit('event', {  'Type': 'wisdom',
                           'title': wisdomtitle,
                           'name': wisdomname,
                           'priority':wisdompriority
                           });
     socket.broadcast.emit('event', {  'Type': 'wisdom',
                           'title': wisdomtitle,
                           'name': wisdomname,
                           'priority':wisdompriority
                           });
    }); 
  }
    else if(Q_type=='geo')
  {
      db.geo.find().sort({"name":1}).toArray(function(err, items) {
      geoname = [];
      geotitle = [];
      geopriority=[];
      items.forEach(function(k, i){
      geotitle.push(k.Q.url);
      geoname.push(k["name"]);
      geopriority.push(k["priority"]);
        });
      console.log(geopriority);
  
     socket.emit('event', {  'Type': 'geo',
                           'title': geotitle,
                           'name': geoname,
                           'priority':geopriority
                           });
     socket.broadcast.emit('event', {  'Type': 'geo',
                           'title': geotitle,
                           'name': geoname,
                           'priority':geopriority
                           });
    }); 
  }
      else if(Q_type=='destiny')
  {
      db.destiny.find().sort({"name":1}).toArray(function(err, items) {
      destinyname = [];
      destinytitle = [];
      destinypriority=[];
      items.forEach(function(k, i){
      destinytitle.push(k.A.text);
      destinyname.push(k["name"]);
      destinypriority.push(k["priority"]);
        });
      //console.log(destinytitle);
  
     socket.emit('event', {  'Type': 'destiny',
                           'title': destinytitle,
                           'name': destinyname,
                           'priority':destinypriority
                           });
     socket.broadcast.emit('event', {  'Type': 'destiny',
                           'title': destinytitle,
                           'name': destinyname,
                           'priority':destinypriority
                           });
    }); 
  }
}




socket.on('priority',function(data){
 
               var priority=data.priority;
               //console.log(priority+data.Name);
            if(data.Type=='logo'){
              db.collection('logo').findAndModify(
                {name:data.Name}, 
                [['_id', 'asc']],
                {$set: {priority: priority}},
                {},
                function(err){console.log(err);}
              );
                priority_change('logo');
              }
             else if(data.Type=='wisdom'){
              db.collection('wisdom').findAndModify(
                {name:data.Name}, 
                [['_id', 'asc']],
                {$set: {priority: priority}},
                {},
                function(err){console.log(err);}
              );
              priority_change('wisdom');
              }
             else if(data.Type=='geo'){
             
             // console.log(priority+data.name);
              db.collection('geo').findAndModify(
                {name:data.Name}, 
                [['_id', 'asc']],
                {$set: {priority: priority}},
                {},
                function(err){console.log(err);}
              );
              priority_change('geo');
              }
             else if(data.Type=='destiny'){
             
              console.log(priority+data.Name);
              db.collection('destiny').findAndModify(
                {name:data.Name}, 
                [['_id', 'asc']],
                {$set: {priority: priority}},
                {},
                function(err){console.log(err);}
              );
              priority_change('destiny');
              }
            });
            


socket.on('Steps', function(data) {
              var t=parseInt(data.team)-1;
              var s=parseInt(data.steps);
              if(s>=0){
                location[t]+=s;
                if(location[t]>=20)
                  location[t]=location[t]-20;
              }
              else
              {
                s=s*(-1);
                for(var i=0;i<s;i++)
                 {location[t]--;
                     if(location[t]==-1)
                        location[t]=19;}

              }

              // Save to DB
              db.collection('team').findAndModify(
                {name:"TEAM" + t}, 
                [['_id', 'asc']],
                {$set: {location: location[t]}},
                {},
                function(err){console.log(err);}
              );

              socket.broadcast.emit('Steps',{
                'team':data.team,
                'steps': data.steps
            });
  });
    socket.on('score', function(data) {
                 console.log(data.team);
              console.log(data.score);
              score[parseInt(data.team)]=parseInt(score[data.team])+parseInt(data.score);

              // Save to DB
              db.collection('team').findAndModify(
                {name:"TEAM" + data.team}, 
                [['_id', 'asc']],
                {$set: {score: score[data.team]}},
                {},
                function(err){console.log(err);}
              );

              socket.broadcast.emit('score', {'score': score});          
  });


    socket.on('evenrich',function(data){
    var total=0;
    for(var i=0;i<6;i++)
      total+=parseInt(score[i]);

    var avage=parseInt(total/6);
    console.log("avg="+avage);
    for(var j=0;j<6;j++)
      {
        score[j]=avage;
         db.collection('team').findAndModify(
                {name:"TEAM" + j}, 
                [['_id', 'asc']],
                {$set: {score: score[j]}},
                {},
                function(err){console.log(err);}
              );
         socket.broadcast.emit('score', {'score': score});  
      }

    })
 
socket.on('gui', function(data) {   
  var url;      
  console.log(data.ID);
  console.log(data.picture);
  var type = "none";
  var type_change = false;
  if(data.hasOwnProperty("ID") && data.ID != undefined && data.ID.length > 0) {
    type = grid_id[data.ID.replace("grid-", "")];
  }
  console.log(type);
  // Arbitarily change type to Destiny
  if(type == "opportunity") {
    type = "destiny";
    type_change = true;
  }
  db.collection(type).find().sort({"priority":-1}).toArray(function(err, items) {
    if(items && Array.isArray(items) && items.length > 0) {
      var question = items[0];
      if(type_change) {
        question.type = "Opportunity";
        type_change = false;
      }
      socket.emit('Question',question);
      console.log(question);

      // Set the priority to -1, so that it will drop to the buttom
      // Chances are all the problems are used, and then the first
      // question will keep showing up
      db.collection(type).findAndModify(
        {name: question.name},
        [['_id', 'asc']],
        {$set: {priority: -1}},
        {},
        function(err){console.log(err);
          
        }
      );
   
      
    }
       console.log("DOHERE");
      priority_change('logo');
      priority_change('wisdom');
      priority_change('geo');
      priority_change('destiny');
  });
});
  
          
      socket.on('next', function () {  
        
              socket.broadcast.emit('next', {
           });
    });
       socket.on('countdown', function () {  
        
              socket.broadcast.emit('countdown', {
           });
    });
      socket.on('flot', function () {  
       
              socket.broadcast.emit('flot', {
           });
    });

      socket.on('disconnect', function () {  
     
      console.log('Disconnect');
    });

  
  
});





  app.use(bodyParser());
   app.use(methodOverride());
   //app.use(app.router);

  app.set('port', process.env.PORT || 3000, "0.0.0.0");


app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);


app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}


app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


