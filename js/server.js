const http = require("http")
const url = require("url")
const fs = require("fs")

const port = 2000

//=================================== Server ===========================================//
                                                                                        //
                                                                                        //
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
        if (path === "/css/login.css") return {address: "./css/login.css",
                                               answerType: "text/css"}
        if (path === "/css/game.css")  return {address: "css/game.css",
                                               answerType: "text/css"}
        if (path === "/js/client.js")  return {address: "./js/client.js",
                                               answerType: "text/javascript"}
        if (path === "/js/login.js")   return {address: "./js/login.js",
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
      console.log("games running:")
      console.log(games.length)

      // Pick the user by matching incoming request ip to existing 
      //  ips in users object.
      let user = users[ip] || queueUser(addUser(ip, client))

      // When client sends a move request, check if move is valid and modify the arrays
      if (client.move) {
        let card = client.move

        if (user.game.isValid( user.hand, card )) {

            user.move(user.hand, card)
                .nextMoves()

          if (!user.deck()) {
            console.log(`deck length: ${user.deck()}`)
            console.log(`game has ended: ${user.game.isEnding()}`)
          }
        }
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

      if (client.action) {

        if (client.action === "pickUp") { //killer remains the same
          user[client.action](user)
            .replenish()
            .nextMoves()

        } else if (client.action === "muck") //killer changes
          user[client.action](user)
            .replenish()
            .nextKiller()
            .nextMoves()
      }

      if (client.new) {

        if (user.game) { user.game.finish() }

        queueUser(user)
      }

      if (client.newMessage) {
        console.log(`message is: ${client.newMessage}`)
        console.log(user.game)
        user.game.messages.push(client.newMessage)
        console.log(user.game)

      }

      console.log("=============================================")


      // following will be dryer. Some day.

      // return this to the client
      if (user.game) {
        if (user.game.finished) {
          console.log(user.game.finished)
          return {
            id: user.id,
            name: user.name,
            cards: {
              hand: user.hand,
              board: user.board,
              trump: user.trump,
            },
            game: {
              finished: user.game.finished,
              moves: user.game.getMoves(),
              killer: user.game.getKiller(),
              deck: user.deck(),
              villain: user.villain(user.id),
              attacker: user.game.getAttacker,
              messages: user.game.messages,
            },
          }
        }
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
            attacker: user.game.getAttacker(),
            messages: user.game.messages,
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
                                                                                      //
                                                                                      //
//----------------------------- /Server ends/ ----------------------------------------//

//=== State ==========//
                      //
const users = {}      //
const queue = []      //
const games = []      //
                      //
//--------------------//


//============================= Constructors ===============================//
                                                                            //
                                                                            //
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
    let ranks = [/*"9", "8", "7", "6", "5", "4",*/ "3", "2", "1"]
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
  const trump = deck.slice(-1)[0]
  const board = []
  const muck = []

  let round = 1
  let moves = 0
  let killer = 1
  let attacker = null

  const messages = []
  
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
      console.log(user.name)
                user.id = ix
      console.log(user.id)          
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
    // get attacking user and replenish it first 
    // (defender is always last 
    //  and we have a two player game, so math is simple)
    let attackingUser = (killer === 1) ? 0 : 1
    let attHand = users[attackingUser].hand
    let defHand = users[killer].hand

    users[attackingUser].hand = topUp(users[attackingUser].hand)
    users[killer].hand        = topUp(users[killer].hand)

    function topUp(hand) {
        if (hand.length < 6 && deck.length) {
          hand = hand.concat(deck.splice(0, 6 - hand.length))
        } else if (!deck.length) {
          console.log("cant replenish, deck empty")
          console.log(`game is ending ${isEnding()}`)
        }
      console.log(`i return a hand`)
      return hand
    }
    console.log("returning the game from replenish")
    return games[id]
  }
  function nextMoves() {
    console.log("next player, plz")
    
    console.log(`moves: ${moves}`)
    if (moves === 1) {
      moves = 0
    } else {
      moves = 1
    }

    return games[id]
  }
  function nextKiller() {
    console.log("next killer, plz")
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
    console.log(`dooooooom and glooooooom`)

    if (!deck.length) {
      let winner = users.findIndex( user => !user.hand.length )
      console.log(winner)
      if (winner > -1) {
        console.log(users[winner].hand)
        console.log(`we have a winner: ${winner}`)
        let loser = winner === 0 ? 1 : 0
        console.log(loser)
        users.map( user => {
                   user.game.finished = {
                        winner: users[winner].name,
                        loser: users[loser].name
                      }
                    })
        return true
      }
      console.log("i get here")
    }
    console.log("i get here but not further")
    return false
  }
  function finish() {
    users.map( user => {
      delete user.id
      delete user.deck
      delete user.trump
      delete user.board
      delete user.game
      delete user.hand
      delete user.move
      delete user.pickUp
      delete user.muck
      delete user.villain
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
    if (board.length && board.length % 2 !== 0) {
      user.hand = user.hand.concat(board.splice(0))
      attacker = null
      return games[id]
    }
  }
  function muckCards() {
    console.log("muckin like its 1995")
    if (board.length && board.length % 2 === 0) {
      muck.push(board.splice(0))
      return games[id]
    }
  }
  
  return {
    messages,
    getMoves,
    getAttacker,
    getKiller,
    isValid,
    replenish,
    nextKiller,
    nextMoves,
    start,
    isEnding,
    finish
  }
}
                                                                            //
//--------------------------------------------------------------------------//

//============== Game handling logic ===================//
                                                        //
                                                        //

function addUser(ip, client) {
  users[ip] = User(client)

  return users[ip]
}
function queueUser(user) {
  console.log("Queued ")
  console.log(queue)

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
                                                        //
//======================================================//