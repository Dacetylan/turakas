//======== The Game ========//

const client = {}

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
//global variable to store the timer 
//in case we need to cancel it
var poller 


          function poll( time = 1000 ) {
            poller = setInterval( () => {
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

//=================== Render... things ====================
function render(element, data) {
  document.getElementById(element).innerHTML = data
}

//=================== Modify the client state ============//
                                                          //
                                                          //
function updateGame(newClient) {

  client.name = newClient.name

  //bag of functions
  const display = {
    fadeOut: element => {
      
        document.getElementById(element).style.opacity = 0

    },
    fadeIn: element => {
      document.getElementById(element).style.opacity = 1
    },
    newGame: () => {
      //render the game html markup
      render("container", gameMarkup)
      //Create empty cards obj to have smth to be passed on to evaluate 
      //  against incoming cards obj.
      client.cards = {
        board: [],
        hand: [],
        trump: {}
      }

      client.id = newClient.id
      render("playerId", client.name)

      // add listeners for the muck and pickup buttons
      document.getElementById("pickUp").onclick = endRound
      document.getElementById("muck").onclick = endRound
      document.getElementById("sendMessage").onclick = sendMessage
    },
    game: () => {
      /*=====================================
        Update state 
        - who moves
        - who is defending (killer)
        - who how many cards in the deck
        - how many cards does villain have
      =====================================*/
      client.game = newClient.game
      /*
        UpdateCards() takes existing cards obj and a new, incoming cards obj
        - checks if there is a change ( isEqual() )
        - when the arrays differ, it invokes a refresh of that array
      */
      updateCards( client.cards, newClient.cards )

      render("whoseMove",   client.game.moves + 1)
      render("killer",      client.game.killer + 1)
      render("deck",        client.game.deck)
      render("villainName", client.game.villainName)
      render("villain",     client.game.villain)
      render("messages",    client.game.messages.join("<br>"))

      scrollChatToBottom()

      function scrollChatToBottom() {
        const msgs = document.getElementById("messages")

        msgs.scrollTop = msgs.scrollHeight - msgs.clientHeight
      }
    },
    gameOver: () => {
      //render markup on the board
      render("board", gameOver)

      // if you refresh game after it has ended,
      if (client.game.villain) {
        render("villain", client.game.villain)
      }

      let winnerMsg = `${newClient.game.finished.winner}`
      let loserMsg = `${newClient.game.finished.loser}`

      render("winner", winnerMsg)
      render("turakas", loserMsg)

      delete client.id
      delete client.cards
      delete client.game

      console.log("clear polling")
      clearInterval(poller)

      document.getElementById("rematch").onclick = startNewGame
    },
  }

  if (newClient.game) {

    if (!client.game) {

      display.fadeOut("container")
      setTimeout( () => {
        display.newGame()
      }, 500)
      setTimeout( () => {
        display.fadeIn("container")
      }, 500)
    }
    if (newClient.game.finished) {

      display.gameOver()
    }
    else {

      display.game()
    }
  }
}
                                                          //
                                                          //
//--------------------------------------------------------//

function isEqual(one, two) {

  return ( Array.isArray(one) && Array.isArray(two) ) ?
          JSON.stringify(one) === JSON.stringify(two) :
                          one === two
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

//pass in a string, telling what section of cards should be updated
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
  // put trump in an array to have length
    draw([client.cards.trump], "trump")
    break
  }
  // add listeners to cards.
  // no need to invoce it before we actually have cards :)
  // but still might not be the best place for it
  addListeners()
}
/*
  Draw the cards to the screen
  We update the entire array (board or player)
    instead of moving single cards.

    Later should implement single card updates. 
*/
function draw (arr, str) {
  // pick a suit to draw on a card
  function pickSuit(suit) {
    const suits = {
      's': '&spades;',
      'c': '&clubs;',
      'h': '&hearts;',
      'd': '&diams;'
    }

    return suits[suit]
  }
  function pickRank(rank) {
    const ranks = {
      '1': '6',
      '2': '7',
      '3': '8',
      '4': '9',
      '5': '10',
      '6': 'J',
      '7': 'Q',
      '8': 'K',
      '9': 'A'
    }

    return ranks[rank]
  }
  // console.log(arr, str);
  document.getElementById(str).innerHTML = ""

  // TODO: replace the loop with map
  for (var i = 0; i < arr.length; i++) {
    let div = document.createElement("div")
    let id = arr[i].rank + arr[i].suit

    div.innerHTML = `
      <div class="card-corner">
        ${pickRank(id[0])}
        ${pickSuit(id[1])}
      </div>  
      <span class="rank">
        ${pickRank(id[0])}
      </span>
      `
    div.setAttribute('class', 'card');
    div.setAttribute('id', id);
    // console.log(arr[i].suit)

    switch ( id[1] ) {
      case "h":
      div.style.background = 'rgb(150, 0, 0)';
      div.style.background = 'linear-gradient(to bottom right, rgb(150, 0, 0), rgb(200, 0, 0))';
      break;
      case "d":
      div.style.background = 'rgb(0, 0, 150)';
      div.style.background = 'linear-gradient(to bottom right, rgb(0, 0, 150), rgb(0, 0, 255))';
      break;
      case "s":
      div.style.background = 'rgb(25, 25, 25)';
      div.style.background = 'linear-gradient(to bottom right, rgb(25, 25, 25), rgb(50, 50, 50))';
      break;
      case "c":
      div.style.background = 'rgb(0, 100, 0)';
      div.style.background = 'linear-gradient(to bottom right, rgb(0, 75, 0), rgb(0, 125, 0))';
      break;
    }

    console.log(document.getElementById(str))
    document.getElementById(str).appendChild(div);
  }
}

//Lets make the game playable. Cards are clickable
function addListeners() {
  //make and array of all cards, map over it and add listeners
  const selectedCard = Array.from(document.getElementsByClassName("card"))
  selectedCard.map( card => card.addEventListener("click", moveCard, false) )
}
//gets called when muck or pickup is pressed 
function endRound() {
  let action = this.id
  let board = client.cards.board
  // when it is this players move
  if (client.game.moves === client.id) {
    // check which button is pressed
    // and does the board correlate with the requested action
    if ((  action === "pickUp" 
        && board.length 
        && board.length % 2 !== 0 ) 
      ||
        (  action === "muck" 
        && board.length 
        && board.length % 2 === 0 )) {

      transmit({ action }) 
    }
  }
  console.log(`cant ${action}`)
}
// gets called when player wants to play a card
function moveCard() {
  console.log(`Move: ${this.id}`)

  const idToObj = id => ({ rank: id[0], 
                           suit: id[1] })
  
  let id = idToObj(this.id)

  if ( isValid(id) ) {
    transmit({ move: id })
  } 
}
//check if move can be made
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

  /*
    Check if the move is valid agains the rules of the game.
    Make this client side, not to send request to server when it is pointless
  */
  function canMoveCard(card) {
    let hand = client.cards.hand
    let attacker = client.game.attacker
    let board = client.cards.board
    let trump = client.cards.trump

    console.log(attacker)
    if (attacker) {
      // when there is an attacker check if our card is:
      // -- same suit or trump
      // -- has higher value
      if (card.value > attacker.value && 
          card.suit === attacker.suit || card.suit === trump.suit) {
        console.log(`${card} defends successfully`)
        return true
      } else {
        console.log(`Cant defend with: ${card}`)
        return false
      }
      // if there is no attacker, card (new attacker) can go on the board
    } else if (board.length && board.length < 12) {
      
      if ( board.some( el => el.rank === card.rank )) {
        return true
      } else {
        console.log(`Cant add ${card}. The same rank must be on the table`)
        return false
      }
    } else if (board.length < 12) {
      return true
    } else {
      console.log(`Board is full`)
      return false
    }
  }
}
//start a new game
function startNewGame() {
  console.log("starting new game")
  transmit({new: "game"})
  //start the poll up again
  poll()
}


//================== Chat ======================
function sendMessage() {
  let msg = document.getElementById("message").value

  console.log(msg)

  transmit({newMessage: msg})
  document.getElementById("message").value = ''
}


//=======================  Markup we render  ===========================================

const gameMarkup =
`
<div class="game">
  <div id="info" class="info">
    <div class="stats">
      <div class="hero"><span id="playerId"></span> vs <span id="villainName"></span></div>
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
  <div class="buttonsChatContainer">
    <div class="buttons">
      <div id="pickUp" class="button">Pick
        <br>up</div>
      <div id="muck" class="button">End
        <br>round</div>
    </div>
    <div id="chat" class="chat">
      <div id="messages" class="messages">
      </div>
      <form onsubmit="return false" class="newMessage" id="chatForm">
        <input type="text" id="message" class="message" placeholder="Say something" value="Hello" />
      </form>
    </div>
    <button id="sendMessage" class="sendMessage" value="sendMessage" form="chatForm">&#x1f4ac;</button>
  </div>
  <div id="player" class="player">
  </div>
</div>
`

const gameOver = 
`
<div id="finished" class="finished">
  <h1>Game Over</h1>
  <p>Winner:</p>
  <h3 id="winner"></h3>
  <p>Loser:</p>
  <h2 id="turakas"></h2>
  <div id="lastCard"></div>
  <button id="rematch" class="rematch button">Rematch</button>
</div>
`