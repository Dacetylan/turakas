const http = require("http")
const url = require("url")
const fs = require("fs")

const port = 2000

http.createServer( (req, res) => {
  try {
    // console.log("request made")

    let ip = req.connection.remoteAddress
    let parsedUrl = url.parse(req.url, true)

    if (parsedUrl.search) {
      let clientObj = JSON.parse(parsedUrl.query.client)
      send( JSON.stringify( getAnswer( clientObj )), "json" )

    } else { transmitFile(parsedUrl.path) }

    function send(data, type) {
      // console.log("sending: " + data)
      res.writeHead(200, {"Content-Type": type})
      res.end(data)
    }
    function transmitFile(path) {
      console.log("transmitting file")
      let chooseFile = () => {
        if (path === "/favicon.ico")   return {address: "./img/favicon.ico",
                                               answerType: "image/x-icon"}
        if (path === "/")              return {address: "./login.html",
                                           answerType: "text"}
        if (path === "/index.html")    return {address: "./index.html",
                                           answerType: "text"}
        if (path === "/login.html")    return {address: "./login.html",
                                           answerType: "text"}
        if (path === "/game.html")     return {address: "./game.html",
                                           answerType: "text"}
        if (path === "/css/login.css") return {address: "./css/login.css",
                                           answerType: "text/css"}
        if (path === "/css/game.css")    return {address: "css/game.css",
                                           answerType: "text/css"}
        if (path === "/js/client.js")  return {address: "./js/client.js",
                                           answerType: "text/javascript"}
        if (path === "/js/login.js")  return {address: "./js/login.js",
                                           answerType: "text/javascript"}
      } //returns file address and type

      fs.readFile(chooseFile().address, (err, rawFile) => {
        if (err)     console.log(err)
        if (rawFile) console.log("file load successful")

        send(rawFile, chooseFile().answerType)  
      })
    }
    function getAnswer(client) {
      console.log(client)

      // Pick the user by matching incoming request ip to existing 
      //  ips in users object.
      let user = users[ip] || queueUser(addUser(ip, client))

      // When client sends a move request, check if move is valid and modify arrays
      if (client.move) {
        let card = client.move

        if (user.game
                .isValid( user.hand, card )) {

          user.move(user.hand, card)
              .nextMoves()
        }
      /*============================================================================

        Action from the client is also the end of the round.
        Players with uncomplete hands (<6), get dealt cards until they have six.
        - pickUp() happens when player can't kill the attacker
          and picks up the cards on the board. 
          Player remains the defender (killer)
        - muck() happens when attacker does not attack with more cards.
          Cards on the board go to 'muck' and defender becomes the attacker
  
      ============================================================================*/

      } else if (client.action) {

        if (client.action === "pickUp") { //killer remains the same
          user[client.action](user)
            .replenish()
            .nextMoves()

        } else if (client.action === "muck") //killer changes
          user[client.action](user)
            .replenish()
            .nextKiller()
      }


      console.log("=============================================")

      if (user.game) {
        return {
          id: user.id,
          name: user.name,
          cards: {
            hand: user.hand,
            board: user.board,
            trump: user.trump,
          },
          game: {
            moves: user.game.getMoves(),
            killer: user.game.getKiller(),
            deck: user.deck(),
            villain: user.villain(user.id),
            attacker: user.game.getAttacker()
          }
        }
      } else {
        return user
      }
    }
  } catch (error) {
    res.statusCode = 400
    return res.end(error.stack)
  }
}).listen(2000)
console.log(`listening to ${port}`)

//--------------------------------------------------------------------//

//================== State ===================
                                            //
const users = {}                            //
const queue = []                            //
const games = []                            //
                                            //
//--------------------------------------------
function User(client) {
  const name = client.name || "The Nameless One"
  const hand = []

  return {
    name,
  }
}
function Cards() {

  function makeCards() {

    let suits = ["h", "d", "s", "c"]
    let ranks = ["9", "8", "7", "6", "5", "4", "3", "2", "1"]
    let cards = []

    for (rank of ranks) {
      for (suit of suits) {
        cards.push({ rank, suit, value: +rank })
      }
    }
    
    return cards
  } //returns an unshuffled deck of 36 cards
  function shuffle(deck) {

    let lth = deck.length
    let i
    let j

    while (lth) {
      i = Math.floor(Math.random() * lth--)
      j = deck[lth]
      deck[lth] = deck[i]
      deck[i] = j
    }

    return deck
  } //returns shuffled deck

  return shuffle( makeCards() )
}
function Game(users) {

  const id = games.length
  const deck = Cards()
  const trump = deck.slice(-1)
  const board = []
  const muck = []

  let round = 1
  let moves = 0
  let killer = 1
  let attacker = null
  
  /*
  Methods for game
  */
  function start() {
    deck.map(card => {
         if (card.suit === trump.suit) {
             card.value += 10
         }
        })
    users.map( (user, ix) => {
                user.id = ix
                user.deck = () => deck.length
                user.trump = trump
                user.board = board
                user.game = games[id]
                user.hand = deck.splice(0, 6)
                user.move = moveCard
                user.pickUp = pickUpCards
                user.muck = muckCards
                user.villain = id => (id === 0) ? users[1].hand.length
                                                : users[0].hand.length
    })
  }
  function replenish() {
    console.log("let there be plenty")
    // console.log(users)
    // because trump just looks at the last card of the deck
    // we have to remember its suit in case the deck becomes empty
    let memTrumpSuit = trump.suit
    // get attacking user and replenish it first 
    // (defender is always last and we have a two player game, so math is simple)
    let attackingUser = (killer === 1) ? 0 : 1
    let attHand = users[attackingUser].hand
    let defHand = users[killer].hand

    topUp([attHand, defHand])

    function topUp(hands) {
      hands.map( hand => {
        if (hand.length < 6 && deck.length) {
          console.log(deck.length)
          hand = hand.concat(deck.splice(0, 6 - hand.length))
          console.log(deck.length)
          return hand
        } 
      })
    }

    return games[id]
  }
  function nextMoves() {
    console.log("next player, plz")
    if (moves === 1) {
      moves = 0
    } else {
      moves = 1
    }

    return games[id]
  }
  function nextKiller() {
    console.log("next player, plz")
    if (killer === 1) {
      killer = 0
    } else {
      killer = 1
    }

    return games[id]
  }
  function isValid(hand, card) {

    let ix = hand.findIndex( el => 
                             el.rank === card.rank &&
                             el.suit === card.suit    )
    //our clientside card does not take value prop with him,
    //  so lets get corresponding serverside card
    card = hand[ix]

    if (attacker) {
      // when there is an attacker check if our card is:
      // -- same suit or trump
      // -- has higher value
      if (card.value > attacker.value && 
          card.suit === attacker.suit || card.suit === trump.suit) {
        return true
      } else return false
      // if there is no attacker, card (new attacker) can go on the board
    } else if (board.length && board.length < 6) {
      if (board.some( el => el.rank === card.rank)) {
        return true
      } else return false
    } else return true
  }
  function isEnding() {

  }
  function finish() {
    users.map( user => {
      delete user.moveCard
      delete user.pickUpCards
      delete user.muckCards
      delete user.game
    })
    return games[id]
  }
  function getMoves() { return moves }
  function getKiller() { return killer }
  function getAttacker() { return attacker }
  /*
  Methods for player
  */
  function moveCard(hand, card) {
    let ix = hand.findIndex( el => 
                             el.rank === card.rank && 
                             el.suit === card.suit )

    board.push( hand.splice(ix, 1)[0] )
    // if board is not paired, the single card must be an attacker
    attacker = (board.length % 2 === 0) ? null
                                        : board[board.length - 1]

    console.log(games[id])
    return games[id]
  }
  function pickUpCards(user) {
    console.log("pick up ALLLL the cards")
    console.log(user.hand)
    console.log(board)
    user.hand = user.hand.concat(board.splice(0))


    return games[id]
  }
  function muckCards() {
    console.log("muckin like its 1995")
    muck.push(board.splice(0))

    return games[id]
  }
  
  return {
    round,
    getMoves,
    getAttacker,
    getKiller,
    isValid,
    replenish,
    nextKiller,
    nextMoves,
    start,
    finish
  }
}

//=========================================================================

function addUser(ip, client) {
  users[ip] = User(client)

  return users[ip]
}
function queueUser(user) {
  queue.push(user)

  tryStarting()

  return user
}
function tryStarting() {
  if (queue.length > 1) {
    console.log("we can start")
    let game = Game(queue.splice(0, 2))
    games.push(game)
    game.start()
  }
}