/*
 This game is a very simple knock off of Monopoly.

 It is set up using an IIFE to create a Game object.

 Then there are two types of ojbects used to create the game:
    Square objects to represent the squares on the board (all known as properties,
	  but I'm mostly calling them Squares to avoid confusion with object properties).
	  These store value, rent, name, etc.
	Player objects, representing the different players in the game. These store name,
	  point, ID, etc.
 These objects are created at the beginning of the game (within the Game object)
 and are updated as the game progresses.

 The players roll the dice and progress around the board. They can buy property when they
 land on an open square. First player to go below $0 loses.

 There are some limitations on what you can do in this game based on the amount of time I have left for this project:
 1. two fixed players
 2. no selling to other player
 3. no auction
 4. no houses or hotels
 5. no mortgages
*/
/*
TODO sessionStorage
TODO remote control --pending
TODO dice
*/

/* helper function */
const timer = ms => new Promise(res => setTimeout(res, ms))

Array.prototype.sample = function(){
  return this[Math.floor(Math.random()*this.length)];
}

const idx = {
  geo: 0,
  chance: 0
}

const geo_problem = [
  { img: "geo/Amazon Rainforest.jpg", title: "地理題", description: "Amazon Rainforest" },
  { img: "geo/Angkor Wat.jpg", title: "地理題", description: "Angkor Wat" },
  { img: "geo/Easter Island.jpg", title: "地理題", description: "Easter Island" },
  { img: "geo/Grand Canyon.jpg", title: "地理題", description: "Grand Canyon" },
  { img: "geo/Great Barrier Reef.jpg", title: "地理題", description: "Great Barrier Reef" },
  { img: "geo/Great Pyramids of Giza.jpg", title: "地理題", description: "Great Pyramids of Giza" },
  { img: "geo/Great Wall.jpg", title: "地理題", description: "Great Wall" },
  { img: "geo/Louvre Museum.jpg", title: "地理題", description: "Louvre Museum" },
  { img: "geo/Machu Picchu.jpg", title: "地理題", description: "Machu Picchu" },
  { img: "geo/Mesa Verde.jpg", title: "地理題", description: "Mesa Verde" },
  { img: "geo/Mount Rushmore Monument.jpg", title: "地理題", description: "Mount Rushmore Monument" },
  { img: "geo/Parthenon.jpg", title: "地理題", description: "Parthenon" },
  { img: "geo/Pompeii.jpg", title: "地理題", description: "Pompeii" },
  { img: "geo/Taj Mahal.jpg", title: "地理題", description: "Taj Mahal" },
  { img: "geo/Tikal.jpg", title: "地理題", description: "Tikal" },
];

const chance_cards = [
  { img: "card/run.jpg", title: "暴走卡", description: "往前6步", fn: async (players, curr) => { await Game.movePlayer(6, curr) }},
  { img: "card/tax.jpg", title: "查稅卡", description: "失去$300分", fn: (players, curr) => {curr.reducepoint(300)}},
  { img: "card/fortune_god.jpg", title: "福神卡", description: "得到$900分", fn: (players, curr) => {curr.incrpoint(900)}},
  { img: "card/Poor God.jpg", title: "窮神卡", description: "失去$900分", fn: (players, curr) => {curr.reducepoint(900)}},
  { img: "card/angel.jpg", title: "天使卡", description: "得到$300分", fn: (players, curr) => {curr.incrpoint(300)}},
  { img: "card/equal_prosperity.jpg", title: "均富卡", description: "所有人點數平分。", fn: (players, curr) => { 
    let new_point = Math.ceil(players.reduce((pSum, a) => pSum + a.point, 0) / players.length); players.forEach(player => new_point > player.point? player.incrpoint(new_point - player.point) : player.reducepoint(player.point - new_point)) }},
  { img: "card/rober.jpg", title: "搶奪卡", description: "搶得最高分玩家$600分", fn: (players, curr) => { 
    const high_point = Math.max(...players.filter(p => p.id != curr.id).map(p => p.point), 0); players.filter(p=> p.point == high_point & (p.id != curr.id)).sample().reducepoint(600); curr.incrpoint(600) } },
]

window.onload = function() {
  //find dice role button and bind takeTurn method
  const rollButton = document.getElementById("rollButton");
  const yesButton = document.getElementById("yesButton");
  const noButton = document.getElementById("noButton");
  yesButton.disabled = noButton.disabled = true

  rollButton.onclick = Game.takeTurn;

  document.getElementById("dice_overlay").style.display = "none";

  //initialize board
  Game.populateBoard();
};

//IIFE function to create game board object
var Game = (function() {
  //create a game object to hold the game board squares, methods, players
  var game = {};

  //build an array of game propreties (calling them squares, as in squares on the game board, so
  //I don't confuse them with object properties
  //there are 11 properties on the game board.
  //each has a unique name and value, so each will probably need to be built individually (not through a loop)

  blocks = [
    {name: "Start", image: "card/start"},
    {name: "Geography", image: "building/geo_3"},
    {name: "Chance", image: "card/question"},
    {name: "Wisdom", image: "building/jimmy"},
    {name: "Geography", image: "building/geo_2"},
    {name: "Wisdom", image: "building/roadhouse"},
    {name: "Chance", image: "card/question"},
    {name: "Logo King", image: "building/canes"},
    {name: "Geography", image: "building/geo_1"},
    {name: "Chance", image: "card/question"},
    {name: "Wisdom", image: "building/whatta"},
    {name: "Chance", image: "card/question"},
    {name: "Logo King", image: "building/ihop"},
    {name: "Wisdom", image: "building/rudys"},
    {name: "Logo King", image: "building/mcalisters"},
    {name: "Geography", image: "building/geo_4"},
  ]
  console.log(blocks.length + " blocks info defined")

  game.squares = blocks.map( (block, i) => new Square(block.name, 100, "square" + (i+1), block.image))

  //build an array of players
  //note: initial version of the game only allows two fixed players
  game.players = [
    new Player("Stan", 1000, "Triangle", "player0"),
    new Player("Nick", 1000, "Triangle", "player1"),
    new Player("Kelly", 1000, "Circle", "player2"),
    new Player("Kevin", 1000, "Circle", "player3")
  ];

  //set the game property for current player. Initially player 1. (Using an index of the game.players array.)
  game.currentPlayer = 0;

  function cell(num) {
    return `
        <div class="cell square" id="square${num}">
          <p id="square${num}-name" class="square-name"></p>
          <p id="square${num}-value"></p>
          <img id="square${num}-image"></img>
          <p id="square${num}-residents"></p>
        </div>
        `
  }

  //set up a method that will add the squares to the game board
  game.populateBoard = function () {
    const gameBoard = document.getElementById("game_board");
    const X = 6;
    const Y = 4;
    let headIdx = 1;
    let tailIdx = 2 * X + 2 * (Y - 2);

    // generate first row
    let rowHtml = "";
    for (let i = 0; i < X; i++) {
      rowHtml += cell(headIdx++);
    }
    gameBoard.innerHTML += `<div class="row">${rowHtml}</div>`;

    // generate middle row
    for (let i = 1; i < Y - 1; i++) {
      let rowHtml = "";
      rowHtml += cell(tailIdx--);
      for (let j = 1; j < X - 1; j++) {
        rowHtml += '<div class="cell middle"></div>';
      }
      rowHtml += cell(headIdx++);
      gameBoard.innerHTML += `<div class="row">${rowHtml}</div>`;
    }

    // generate last row
    rowHtml = "";
    for (let i = 0; i < X; i++) {
      rowHtml += cell(tailIdx--);
    }
    gameBoard.innerHTML += `<div class="row">${rowHtml}</div>`;

    //loop through all the squares in the game board
    for (var i = 0; i < this.squares.length; i++) {
      //get square ID from object and then find its div
      var id = this.squares[i].squareID;

      //add info to squares
      //paragraphs for square info preexist in HTML. That way they just have to be
      //updated here and I can use the same method to create and update
      var squareName = document.getElementById(id + "-name");
      // var squareValue = document.getElementById(id + "-value");
      var squareImage = document.getElementById(id + "-image");

      squareName.innerHTML = this.squares[i].name;
      // squareValue.innerHTML = "$" + this.squares[i].value;
      squareImage.src = "images/" + this.squares[i].image + ".png";
    }

    //find the start square and add all players
    var square1 = document.getElementById("square1-residents");
    for (var i = 0; i < game.players.length; i++) {
      //using private function to create tokens
      game.players[i].createToken(square1);
    }

    const info = document.getElementById("player-info");
    let player_info_html = `<div class="divTable" style="height: 100%;" ><div class="divTableBody">`;
    for (let i = 0; i < game.players.length; i++) {
      if (i % 2 == 0) {
        player_info_html += `<div class="divTableRow">`;
      }
      player_info_html += `
      <div class="divTableCell player-info-each" id="player${i}-info">
        <p>Player ${i + 1}</p>
        <p id="player${i}-info_name">${game.players[i].name}</p>
        <p id="player${i}-info_token"></p>
        <p id="player${i}-info_point">${game.players[i].point}</p>
      </div>
      `;
      if (i % 2 == 1) {
        player_info_html += `</div>`;
      }
    }
    player_info_html += `</div></div>`;
    info.innerHTML = player_info_html;

    document.getElementById("player"+ 0 + "-info").classList.add("current")
  };

  //public function to handle taking of turn. Should:
  //roll the dice
  //advance the player
  //call function to either allow purchase or charge rent
  game.takeTurn = async function () {
    rollButton.disabled = true;
    off();

    //roll dice and advance player
    const move = Math.floor(Math.random() * (6 - 1) + 1)
    await rollDice(move)

    await game.movePlayer(
      move,
      game.players[game.currentPlayer]
    );

    //check the tile the player landed on
    //if the tile is not owned, prompt player to buy
    //if the tile is owned, charge rent and move on
    await checkTile();

    //loss condition:
    //if current player drops below $0, they've lost
    // if (game.players[game.currentPlayer].point < 0) {
    //   alert("Sorry " + game.players[game.currentPlayer].name + ", you lose!");
    // }
  };

  /****                    Game-level private functions                        *****/
  //function to advance to the next player, going back to to player 1 when necessary
  //(leaving this as a private function rather than method of Player because
  //current player is more of a game level property than a player level property)
  function nextPlayer(currentPlayer) {
    const nextPlayer = (currentPlayer + 1) % game.players.length;

    document.getElementById("player"+ currentPlayer + "-info").classList.remove("current")
    document.getElementById("player"+ nextPlayer + "-info").classList.add("current")
    return nextPlayer;
  }

  //function to "roll the dice" and advance the player to the appropriate square
  game.movePlayer = async function(moves, currentPlayer) {
    //"dice roll". Should be between 1 and 4
    //need the total number of squares, adding 1 because start isn't included in the squares array
    var totalSquares = game.squares.length;
    //get the current player and the square he's on

    for(let i = 0; i < moves; i++) {
      await timer(1000)
      const currentSquare = parseInt(currentPlayer.currentSquare.slice(6));
      let nextSquare = currentSquare + 1;

      //figure out if the roll will put player past start. If so, reset and give money for passing start
      if(nextSquare > totalSquares) {
        nextSquare -= totalSquares;
        currentPlayer.incrpoint(1000);
        console.log("$1000 for passing start");
      }

      //update current square in object (the string "square" plus the index of the next square)
      currentPlayer.currentSquare = "square" + nextSquare;

      //find and remove current player token
      var currentToken = document.getElementById(currentPlayer.id);
      currentToken.parentNode.removeChild(currentToken);

      //add player to next location
      currentPlayer.createToken(
        document.getElementById(currentPlayer.currentSquare)
      );
    }
  }

  //function that checks the tile the player landed on and allows the player to act appropriately
  //(buy, pay rent, or move on if owned)
  async function checkTile() {
    var currentPlayer = game.players[game.currentPlayer];
    var currentSquareId = currentPlayer.currentSquare;
    var currentSquareObj = game.squares.filter(function(square) {
      return square.squareID == currentSquareId;
    })[0];

    //check if the player landed on start
    if (currentSquareId == "square1") {
      currentPlayer.incrpoint(1000);
      next()
    }  else if (currentSquareObj.name == "Chance") {
      const card = chance_cards[idx.chance++ % chance_cards.length]
      display(card)
      showAns()
      await timer(3000)
      off();
      await card.fn(game.players, currentPlayer);
      await timer(2000);
      next();
    } else if (currentSquareObj.name == "Geography") {
      const problem = geo_problem[idx.geo++ % geo_problem.length];
      display(problem)
      yesButton.onclick = yes.bind({curr: currentPlayer, amount: 300})
      noButton.onclick = no.bind({curr: currentPlayer, amount: 300})
      yesButton.disabled = noButton.disabled = false
    } else {
      next()
    }
  }

  /****                       Constructor functions                             *****/

  /*constructor function for properties (game board squares)*/
  function Square(name, value, squareID, image) {
    //what is this property called?
    this.name = name;
    //what's the value/initial purchase price?
    this.value = value;
    //how much rent to charge when another player lands here? (30% of square value.)
    this.rent = value * 0.3;
    //where does this appear on the game board?
    this.squareID = squareID;
    //who owns the property? (initially unowned)
    this.owner = "For Sale";

    this.image = image;
  }

  /*constructor function for players*/
  function Player(name, point, token, id) {
    this.name = name;
    this.point = point;
    this.token = token;
    this.id = id;
    this.currentSquare = "square1";
    this.ownedSquares = [];
  }

  //Add a method to create a player token span and add it to appropriate square
  //Adding it as a prototype of the Player constructor function
  Player.prototype.createToken = function(square) {
    var playerSpan = document.createElement("span");
    playerSpan.setAttribute("class", this.token + " " + this.id + "-token");
    playerSpan.setAttribute("id", this.id);
    square.appendChild(playerSpan);
  };


  Player.prototype.incrpoint = function(amount) {
    const this_player = this

    $('<span class="plus"/>', {
        style: 'display:none;'
      })
      .css('animation-name', parseInt(this_player.id.slice(6)) < 2 ?  'fade-in-up-top' :  'fade-in-up-bottom')
      .html('+' + amount)
      .appendTo($('#' + this_player.id + '-info'))
      .fadeIn('1000', function() {
        var el = $(this);
        setTimeout(function() {
          el.remove();
        }, 2000);
        this_player.updatepoint(this_player.point + amount)
      });
  };

  Player.prototype.reducepoint = function(amount) {
    const this_player = this
    const new_point = this.point > amount? this.point - amount : 0;
    $('<span class="negative"/>', {
        style: 'display:none;'
      })
      .css('animation-name', parseInt(this_player.id.slice(6)) < 2 ?  'fade-in-down-top' :  'fade-in-down-bottom')
      .html('-' + amount)
      .appendTo($('#' + this_player.id + '-info'))
      .fadeIn('1000', function() {
        var el = $(this);
        setTimeout(function() {
          el.remove();
        }, 2000);
        this_player.updatepoint(new_point);
      });
  }

  //method to update the amount of point a player has
  Player.prototype.updatepoint = function(amount) {
    document.getElementById(this.id + "-info_point").innerHTML = amount;
    this.point = amount;
  };

  function yes() {
    showAns()
    setTimeout( () => {
      off()
      this.curr.incrpoint(this.amount)
      this.amount = 0 // set amount to 0 to prevent multiple clicks
      next()
    }, 1000)
  }

  function no() {
    showAns()
    setTimeout( () => {
      off()
      this.curr.reducepoint(this.amount)
      next()
    }, 1000)
  }

  function next() {
    yesButton.disabled = true
    noButton.disabled = true
    rollButton.disabled = false
    game.currentPlayer = nextPlayer(game.currentPlayer);
  }

  function display(card) {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("info").style.display = "block";
    document.getElementById("info-title").innerText = card.title;
    document.getElementById("info-img").src = "images/" + card.img;
    document.getElementById("info-ans").innerText = card.description;
  }

  function showAns() {
    document.getElementById("info-ans").style.display = "block";
  }

  function off() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("info").style.display = "none";
    document.getElementById("info-ans").style.display = "none";
  }

  return game;
})();

async function rollDice(result) {
    document.getElementById("dice_overlay").style.removeProperty("display");
    await timer(100)
    dice.dataset.side = result;
    dice.classList.toggle("reRoll");
    await timer(2800)
    document.getElementById("dice_overlay").style.display = "none";
}
