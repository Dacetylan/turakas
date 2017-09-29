//======== The Game ========//

const client = {}

// const client = {
//   name: "",
//   status: "new",
//   id: 0,
//   gameId: 0,

//   game: {
//     status: "",
//     id: 0,

//     cards: {
//       board: [],
//       trump: [],
//       hands: [[], 0, 0],
//       deck: 0,
//     }
//   },

//   ref: {
//     killer: 0,
//     moves: 0,
//     round: 0,
//     trumpSuit: "",
//   }
// }


                           //
//-------------------------//



//==================== Transmitter ====================//
                                                       //
                                                       //
function transmit(url) {
  console.log(url)
  url = "?client=" + JSON.stringify(url)

  let request = new XMLHttpRequest()

      request.open("GET", url, true);
      request.onload = function() {
        render("info", request.responseText)
        modifyGame(JSON.parse(request.responseText))
      }
  request.send()
}
                                                       //
                                                       //
//-----------------------------------------------------//


//================= Poll the server ===================//
                                                       //
                                                       //
            function poll( time = 2000 ) {
              setInterval( () => {
                  transmit(client)
              }, time)
            }
                                                       //
                                                       //
//-----------------------------------------------------//



//==================== Login the player ==================//
                                                          //
                                                          //
/* 
  add new player to client side game object
  start polling the server                  
  we only use this once, so no worries about seperation 
*/
let login = function() {
  let name = document.getElementById("name").value
  client.name = name
  poll()

  //disable the button and display that we are waiting
  this.setAttribute("disabled", "true")
  render("info", "You are registered")
}
                                                          //
                                                          //
//--------------------------------------------------------//


//=================== Modify the game ====================//
                                                          //
                                                          //
function modifyGame(newClient) {

  updateClient(newClient)

  if (client.status === "playing") {
    render("container", gameMarkup)
    render("round", client.game.ref.round)
    render("whoseMove", client.game.ref.moves)
    render("killer", client.game.ref.killer)
    render("trump", client.game.cards.trump[0])
    render("deck", client.game.cards.deck)
    render("villain", 6)
  }
  
  if (client.game) {
    refresh(["hero", "board", "trump"])
  }

}
                                                          //
                                                          //
//--------------------------------------------------------//

function isEqual(one, two) {
  return ( Array.isArray(one)   && 
           Array.isArray(two) ) ? 
     JSON.stringify(one.sort()) === JSON.stringify(two.sort()) 
                                :
                            one === two
}

function updateClient(newClient) {
  Object.keys(newClient).map( key => {
    if (typeof client[key] !== "object") {
      
      if ( isEqual( client[key], newClient[key] )) {
        return
      } else {
        client[key] = newClient[key]
      }
    }
  })

  console.log(client)
  
}



//render a DOM element
function render(element, data) {
  document.getElementById(element).innerHTML = data
}

//add listeners for buttons and such
document.getElementById("login").onclick = login



function refresh(args) {
  // console.log(args);
  // args = [from, to]

  args.forEach(function(element) 
  {
    // console.log(element)
    switch (element)
    {
      case "hero":
      draw(client.game.cards.hands[client.id], "player")
      break
      case "board":
      draw(client.game.cards.board, "board")
      break
      case "trump":
      draw(client.game.cards.trump, "trump")
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
  let playerHand = client.game.cards.hands[client.id]

  if (playerHand.indexOf(id) !== -1) {
    let board = client.game.cards.board
      board.push( playerHand.splice( playerHand.indexOf(id), 1 )[0] )
      console.log(board)
      refresh(["hero", "board"])
  } else {
    console.log("Not your card")
  }
}


let gameMarkup = String(
  `<div class="game">
      <div id="info" class="info">
        <div class="stats">
          <div class="round">Round: <span id="round">3</span></div>
          <div class="whoseMove">Moves: p<span id="whoseMove"></span></div>
          <div class="killer">Killer: p<span id="killer"></span></div>
        </div>
        <div class="showCards">
          <div id="villain" class="villain">1</div>
          <div class="trumpDeck">
            <div id="trump" class="trump">
            </div>
            <div id="deck" class="card deck">21</div>
          </div>
        </div>
      </div>
      <div id="board" class="board">
      </div>
      <div class="buttons">
        <div id="pickUp" class="button">Pick up cards</div>
        <div id="muck" class="button">Muck cards</div>    
      </div>
      <div id="player" class="player">
      </div>
    </div>`
)