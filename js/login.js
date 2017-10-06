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
        console.log(request.responseText)
        updateGame(JSON.parse(request.responseText))
      }
  request.send()
}
                                                       //
                                                       //
//-----------------------------------------------------//


//================= Poll the server ===================//
                                                       //
                                                       //
            function poll( time = 1000 ) {
              setInterval( () => {
                  transmit({name: client.name})
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
  we only use this once
*/
let login = function() {
  let name = document.getElementById("name").value
  client.name = name
  poll()

  //disable the button and display that we are waiting
  this.setAttribute("disabled", "true")
  render("info", "You are registered")
}
document.getElementById("login").onclick = login
                                                          //
                                                          //
//--------------------------------------------------------//
function render(element, data) {
  document.getElementById(element).innerHTML = data
}

//=================== Modify the game ====================//
                                                          //
                                                          //
function updateGame(newClient) {

  client.name = newClient.name

  if (newClient.game) {
    if (!client.game) {
      render("container", gameMarkup)

      client.cards = {
        board: [],
        hand: [],
        trump: {}
      }
    }

    client.id   = newClient.id
    client.game = newClient.game

    updateCards( client.cards, newClient.cards )

    render("playerId",  client.id + 1)
    render("whoseMove", client.game.moves + 1)
    render("killer",    client.game.killer + 1)
    render("deck",      client.game.deck)
    render("villain",   client.game.villain)

  } else {

    delete client.id
    delete client.game
    delete client.cards
  }
}

                                                          //
                                                          //
//--------------------------------------------------------//

function isEqual(one, two) {

  return ( Array.isArray(one)   && 
           Array.isArray(two) ) ?
            JSON.stringify(one) === 
            JSON.stringify(two) :
                            one === 
                            two
}
function updateCards(cards, newCards) {
  Object.keys(newCards).map( key => {

    if (isEqual( cards[key], newCards[key] )) {
      console.log(`${key} is the same`)
      return

    } else {
      cards[key] = newCards[key]
      refresh(key)
    }
  })
}

function refresh(element) {
    console.log(element)

  switch (element) {
  case "hand":
    draw(client.cards.hand, "player")
    break
  case "board":
    draw(client.cards.board, "board")
    break
  case "trump":
    draw(client.cards.trump, "trump")
    break
  }

  addListeners()
}

function draw (arr, str) {
  console.log(arr, str);
  document.getElementById(str).innerHTML = "";
  for (var i = 0; i < arr.length; i++) {
    var div = document.createElement("div");
    let id = arr[i].rank + arr[i].suit
    div.innerHTML = id;
    div.setAttribute('class', 'card');
    div.setAttribute('id', id);
    console.log(arr[i].suit)

    switch (arr[i].suit) {
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
    console.log(div)
    console.log(str)
    console.log(document.getElementById(str))
    document.getElementById(str).appendChild(div);
  }
}

//Lets make the game playable. Next is how to select the card with a mouse
function addListeners() {
  //this var has an array of all the clickable cards
  var selectedCard = Array.from(document.getElementsByClassName("card"))
  selectedCard.map( card => card.addEventListener("click", moveCard, false) )
  // we loop through the cards and add eventlisteners
  // for (var i = 0; i < selectedCard.length; i++) {
  //   selectedCard[i].addEventListener("click", moveCard, false);
  // }

  document.getElementById("pickUp").onclick = endRound
  document.getElementById("muck").onclick = endRound
}
function endRound() {
  if (client.game.moves === client.id) {
    let action = this.id
    transmit({ action })
  }
}

function moveCard() {
  console.log(this.id)
  const idToObj = id => ({ rank: id[0], suit: id[1] })
  let id = idToObj(this.id)

  if ( isValid(id) ) {
    transmit({ move: id })
  } 
}
function isValid(card) {

  let ix = client.cards.hand.findIndex( el => 
                                        el.rank === card.rank && 
                                        el.suit === card.suit )
  card = client.cards.hand[ix]

  if ( client.game.moves === client.id
       && ix > -1
       && canMoveCard(card) ) {

    return true
  } else return false

  function canMoveCard(card) {
    let hand = client.cards.hand
    let attacker = client.game.attacker
    let board = client.cards.board
    let trump = client.cards.trump

    console.log(ix)
    if (attacker) {
      // when there is an attacker check if our card is:
      // -- same suit or trump
      // -- has higher value
      if (card.value > attacker.value && 
          card.suit === attacker.suit || card.suit === trump.suit) {
        console.log("this is true")
        return true
      } else {
        console.log("something aint right")
        return false
      }
      // if there is no attacker, card (new attacker) can go on the board
    } else if (board.length && board.length < 6) {
      if ( board.some( el => el.rank === card.rank )) {
        return true
      } else return false
    } else {
      console.log("here i stand")
      return true
    }
  }
}

const gameMarkup = String(
  `<div class="game">
      <div id="info" class="info">
        <div class="stats">
          <div class="round">You are: p<span id="playerId">1</span></div>
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
    </div>

    <script>

    </script>

    `
)