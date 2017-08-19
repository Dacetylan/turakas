const http = require("http")
const url = require("url")
const fs = require("fs")

http.createServer( (req, res) => {
  try {
    console.log("request made")
    let ip = req.connection.remoteAddress

    let send = (data, type) => {
      console.log("sending: " + data)
      res.writeHead(200, {"Content-Type": type})
      res.end(data)
    }
    let transmitFile = (path) => {
      console.log("transmitting file")
      let chooseFile = () => {
        if (path === "/favicon.ico")   return {address: "./img/favicon.ico",
                                               answerType: "image/x-icon"}
        if (path === "/")              return {address: "./index.html",
                                           answerType: "text"}
        if (path === "/index.html")    return {address: "./index.html",
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
    let handleGame = (game) => {
      console.log("game status: " + game.status)

      return JSON.stringify(composeGame(ip, game, game.status))
    }
    (function route() {
          let command = url.parse(req.url, true)

          if (command.search != "") {
            send(handleGame(JSON.parse(command.query.game)), "json")
          } else {
            console.log("routing to file transfer")
            transmitFile(command.path)
          }
    })(req)
  } catch (error) {
    res.statusCode = 400
    return res.end(error.stack)
  }
}).listen(1988)
console.log("listening to 1988")

//===========| Here Is State |===========


const games = [] 
const cards = {
  "deck": engine().deck,
  "trump": [],
  "p1": [],
  "p2": [],
  "board": [],
  "muck": [],
}


// =======================================

let composeGame = (ip, game, status) => {
  console.log("composing game")

  switch (status) {
    case "registering":
      if (games[0]) {composeGame(ip, game, "ready")}
      game.status = "queued"
      game.p1 = ip
      games.push(game)
      return games[0]
    break
    case "queued":
      return games[0]
    break
    case "ready":
      games[0].p2 = ip
      games[0].status = "starting"
      games[0].player.push(game.player[0])
      return games[0]
    break
  }
}

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

  function deal(from, to, nr, id ) {
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
  let canItGo = () => {
    
    //return true or false
  }



  return {
    deck: shuffle(createCards(suits, ranks)),
    deal: deal
  }
}