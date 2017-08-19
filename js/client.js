const game = {
  status: "playing"
}

function transmit(url) {
  console.log(url)

  url = "?game=" + JSON.stringify(url)
  let request = new XMLHttpRequest()
  request.open("GET", url, true);
  request.onload = function() {
    updateGame(JSON.parse(request.responseText))
  }
  request.send()
}
let poll = () => {
  setInterval( () => {
      transmit(game)
  }, 5000)
}
poll()

function updateGame(gameIn) {
  Object.keys(gameIn).forEach( (key) => {
    if (game[key] === gameIn[key]) {
      // console.log("Key is equal")
    } else {
      // console.log(game[key], gameIn[key])
      game[key] = gameIn[key]
      // console.log(`${key} updated`)
    }
  })


  if (game.refresh) {
    let args = game.refresh.split(", ")
    refresh(args)
    delete game.refresh
  }
  if (game.status === "finished") {alert("You Win the Game!")}

  update("players", JSON.stringify(game.players))
  
  update("round", game.ref.round)
  update("whoseMove", game.ref.whoseMove)
  update("killer", game.ref.killer)
  update("villain", game.villain)

  return game
}

function update(element, data) {
  document.getElementById(element).innerHTML = data
}


let pickUp = function() {
  if (game.board.length > 0) {
    transmit({
      status: "playing",
      clearBoard: `board,${game.ref.whoseMove},${game.board.length}`})
  }
}
let muck = function() {
  if (game.board.length > 0) {
    transmit({
    status: "playing",
    clearBoard: `board,muck,${game.board.length}`})
  } else return
}

document.getElementById("pickUp").onclick = pickUp
document.getElementById("muck").onclick = muck


function refresh(args) {
  // console.log(args);
  // args = [from, to]
  args.forEach(function(element) 
  {
    // console.log(element)
    switch (element)
    {
      case "hero":
      draw(game.hero, "player")
      break
      case "board":
      draw(game.board, "board")
      break
      case "trump":
      draw(game.trump, "trump")
      break
    }
  })
  addListeners()
}

function draw (arr, str) {
  // console.log(arr, str);
  document.getElementById(str).innerHTML = "";
  for (var i = 0; i < arr.length; i++) {
    var div = document.createElement("div");

    div.innerHTML = arr[i];
    div.setAttribute('class', 'card');
    div.setAttribute('id', arr[i]);

    switch (arr[i][1]) {
      case "h":
      div.style.background = "red";
      break;
      case "d":
      div.style.background = "blue";
      break;
      case "s":
      div.style.background = "black";
      break;
      case "c":
      div.style.background = "green";
      break;
    }

    document.getElementById(str).appendChild(div);
  }
}

function getId() {
   console.log(this.id)
   let id = this.id

   cardSelector(id)
}
//Lets make the game playable. Next is how to select the card with a mouse
function addListeners () {  
   //this var has an array of all the clickable cards
   var selectedCard = document.getElementsByClassName("card");
   // we loop through the cards and add eventlisteners
   for (var i = 0; i < selectedCard.length; i++) {
      selectedCard[i].addEventListener("click", getId, false);
   }
}  
addListeners()

function cardSelector (id) {
  console.log('cardSelector ' + id)
   //checks if given ID exists in the player arrays
  if (game.hero.indexOf(id) !== -1) {
      transmit({
        status: "playing",
        test: `${game.playerId},board,1,${id}`
      })
  } else {
    console.log("Not your card")
  }
}