const http = require("http")
const url = require("url")
const fs = require("fs")

http.createServer( (req, res) => {
  try {
    console.log("request made")
    let ip = req.connection.remoteAddress

    let pong = () => {
      return JSON.stringify(game)
    }
    let send = (data, type) => {
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
        if (path === "/css/v1.css")    return {address: "./css/v1.css",
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
    let handleEmail = (email) => {
      console.log("handling email")

      return JSON.stringify(composeGame(ip, email))
    }
    (function route() {
          let command = url.parse(req.url, true)
          console.log(command)
    
          if (command.search != "") {
            let q = command.query
            if ("ping" in q) {
              send(pong(), "json")
            }
            if ("email" in q) {
              send(handleEmail(command.query.email), "json")
            }
            if ("deal" in q) {
              send(engine().deal(command.query.deal, game), "json")}
          } else {
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

const game = {
registered: 0,
}
const players = []
const cards = {
  "deck": engine().deck,
  "trump": "",
  "p1": [],
  "p2": [],
  "board": [],
  "muck": [],
}

// =======================================

let composeGame = (ip, email) => {
  let player = {
    "ip": ip,
    "email": email,
    "hand": []
  }
  let checkCanPlayerRegister = () => {
    if (game.registered === 0) {
      players.push(player)
      game.registered += 1
    } 
    if (game.registered === 1) {
        if (players[0].ip === ip) {
          console.log("Player already registered")
      } else {
        players.push(player)
        game.registered += 1
      }
    }
  }
  if (email !== undefined) {checkCanPlayerRegister()}


  console.log(game)
  return game
}




function engine() {

  let suits = ["h", "d", "s", "c"]
  let ranks = ["9", "8", "7", "6", "5", "4", "3", "2", "1"]

  let createCards = (suits, ranks) => {
    if (suits.length !== 4) console.log("Error in suits")
    if (ranks.length !== 9) console.log("Error in suits")
    
    let cards = []
    for (rank of ranks) {
      if (rank.length !== 1) console.log("Error in rank")

      for (suit of suits) {
        if (suit.length != 1) console.log("Error in suit")

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

  let deal = () => {
    return "dealt"
  }
  let testCard = () => {
    return "tested"
  }
  
  return {
    deck: shuffle(createCards(suits, ranks)),
    deal: deal()
  }
}