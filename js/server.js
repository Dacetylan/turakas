const http = require("http")
const url = require("url")
const fs = require("fs")

const port = 2000

http.createServer( (req, res) => {
  try {
    console.log("request made")

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
      console.log(games)
      console.log(users)

      if (client.command) { execute(client.command) }

      return users[ip] ? users[ip]
                       : tryStarting( queueUser( addUser( ip, client)))
    }
  } catch (error) {
    res.statusCode = 400
    return res.end(error.stack)
  }
}).listen(2000)
console.log(`listening to ${port}`)

//--------------------------------------------------------------------//

function engine() {

  let suits = ["h", "d", "s", "c"]
  let ranks = ["9", "8", "7", "6", "5", "4", "3", "2", "1"]

  let createCards = (suits, ranks) => {
    if (suits.length !== 4) console.log("Error in suits")
    if (ranks.length !== 9) console.log("Error in ranks")
    
    let cards = []
    for (rank of ranks) {
      if (rank.length !== 1) console.log("Error in rank")

      for (suit of suits) {
        if (suit.length !== 1) console.log("Error in suit")

        cards.push(rank + suit)
      }
    }

    return cards
  } //returns unshuffled cards, 1 deck
  let shuffle = (deck) => {
    if (deck.length !=  36)
      console.log("Shuffling error: not full deck")
    
    let lth = deck.length
    let i, j

    while (lth) {
          i = Math.floor(Math.random() * lth--)
          j = deck[lth]
      deck[lth] = deck[i]
        deck[i] = j
    }

    let shuffledDeck = deck
    return shuffledDeck
  } //returns shuffled deck

  function test(from, to, nr, id) {
    let suit = id[1]
    let rank = id[0]
    let board = cards.board
    let moves = referee.whoseMove
    let killer = referee.killer
    //we only want to act if there is one card with specific id
    if (nr == 1 && id !== undefined) {
      //if it is your turn
      if (moves === from) {
        //if you are not the killer and the board is empty
        if (killer !== from && board.length === 0) {
          console.log(`${from} moves first card to board`)
          deal(from, to, nr, id)
          whoseMove()
        } else if (killer !== from && board.length > 0) {
          //test if among all the cards on board is the one u want to add
          for (let i = 0; i < board.length; i++) {
            if (rank === board[i][0]) {
              console.log(`${from} adds attacker to board`)
              deal(from, to, nr, id)
              whoseMove()
              break
            }
          }
        } else if (killer === from && board.length % 2 !== 0) {
          let attacker = board[board.length -1]
          let attackerSuit = attacker[1]
          let attackerRank = attacker[0]
          let trumpSuit = referee.trumpSuit

          if ((suit === attackerSuit && rank > attackerRank) 
            || suit === trumpSuit && attackerSuit !== trumpSuit) {
            
            console.log(`${from} kills attacker`)
            deal(from, to, nr, id)
            whoseMove()
          } else {
            console.log(`${from}, pick a better card`)
          }
        }
      }
    }
  }

  function whoseMove() {
    if (referee.whoseMove === "p1") {
      referee.whoseMove = "p2"
    } else {
      referee.whoseMove = "p1"
    }
  }
  function changeKiller() {
    if (referee.killer === "p1") {
      referee.killer = "p2"
    } else {
      referee.killer = "p1"
    }    
  }

  function deal(from, to, nr, id) {
    console.log("dealing")

    let temp = []
    if (id !== undefined && nr == 1) {
      temp = cards[from].splice(cards[from].indexOf(id), 1);
      cards[to].push(temp[0]);
    } else {
      if (from === "deck" && nr > cards.deck.length) {
        deal("trump", "deck", 1)
      }
      temp = cards[from].splice(0, nr)
      temp.map( (card) => {
        cards[to].push(card)
      })
    }

    return `${from}, ${to}`
  }
  function clearBoard(from, to, nr) {
    deal(from, to, nr)
    endRound(to)
  }
  function endRound(to) {
    if (to === "muck") {
      whoseMove()
      changeKiller()
    } else {
      whoseMove()
    }

    referee.round += 1
    if (cards.p1.length < 6) {deal("deck", "p1", 6 - cards.p1.length)}
    if (cards.p2.length < 6) {deal("deck", "p2", 6 - cards.p2.length)}
    
  }
  return {
    deck: shuffle(createCards(suits, ranks)),
    deal: deal,
    test: test,
    clearBoard: clearBoard,
  }
}

//================== State ===================
                                            //
const users = {}                            //
const queue = []                            //
const games = []                            //
                                            //
//--------------------------------------------

//================================= Constructors =============================//
                                                                              //
                                                                              //
function Cards(players) {
  let deck = engine().deck

  this.deck = deck
  this.trump = deck.splice(0, 1)
  this.hands = players.map( player => deck.splice(0, 6) )
  this.board = []
  this.muck = []
}
function Referee(cards) {

  this.moves = 1
  this.killer = 2
  this.round = 1
  this.trumpSuit = cards.trump[0][1]
}
function Game(players) {
  let cards = new Cards(players)
  let id = games.length

  players.map( (player, ix) => {
                player.gameId = id
                player.id = (ix)
                player.status = "playing"
               }
          )

  this.id = id
  this.status = "active"
  this.cards = cards
  this.ref = new Referee(cards)
}
function Answer(player) {
  console.log(`answering`)
  console.log(player)
  if (player.gameId) {
    let game = games[gameId]
    let gameHands = game.cards.hands
    let id = player.playerId

    this.id = game.id
    this.status = game.status
    this.players = game.players
    this.cards = {
        trump: game.cards.trump,
        board: game.cards.board,
        hands: Object.keys(gameHands)
                     .reduce((hands, player) => {
                        hands[player] = gameHands[player].length

                        return hands
                      }, {}),
    }
    this.cards.hands["p" + id] = gameHands["p" + id]
    this.ref = game.ref
  } else {
    this.players = player
  }
}
                                                                              //
                                                                              //
//----------------------------------------------------------------------------//

function addUser(ip, user) {
  users[ip] = user

  return users[ip]
}
function queueUser(user) {
  queue.push( user )
  user.status = "queued"

  return user
}
function tryStarting(user) {

  if (queue.length > 1) {
    let players = queue.splice(0, 2)
    games.push( new Game( players ))
    players.map( player => 
                 player.game = needToKnow( games[player.gameId], player.id))
  }
  
  return user
}
function needToKnow(game, playerId) {
  let deck = game.cards.deck
  let hands = game.cards.hands.map( (hand, ix) => 
                                           ix === playerId ? hand
                                                           : hand.length )
  console.log("hands: ")
  console.log(hands)
  return {
    id: game.id,
    status: game.status,
    cards: {
            deck: deck.length,
            trump: game.cards.trump,
            board: game.cards.board,
            hands: hands 
           },
    ref: game.ref
  }
}



