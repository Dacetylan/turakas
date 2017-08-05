let engine = () => {

  let deal = () => {
    return "dealt"
  }
  let testCard = () => {
    return "tested"
  }
  
  return {
    deal: deal,
    testCard: testCard
  }
}

const game = {
  registered: 0,
  players: []
}

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
      let player = {
        "ip": ip,
        "email": email,
      }
      let check = () => {
        if (game.registered === 0) {
          game.players.push(player)
          game.registered += 1
        } 
        if (game.registered === 1) {
            if (game.players[0].ip === ip) {
              console.log("Player already registered")
          } else {
            game.players.push(player)
            game.registered += 1
          }
        }
      }
      check()
      
      return JSON.stringify(game)
    }
    let route = () => {
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
        if ("testCard" in q) {
          send(engine().testCard(command.query.testCard), "json")}
        // if (command.query.ping) {
        //   send(pong(), "json")}
      } else {
        transmitFile(command.path)
      }
    }
    route(req)
  } catch (error) {
    res.statusCode = 400
    return res.end(error.stack)
  }
}).listen(1988)
console.log("listening to 1988")




