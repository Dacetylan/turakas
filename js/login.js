const game = {
  status: "registering",
  players: [],
}

let login = function() {
  let email = document.getElementById("email").value

  transmit(updateGame( { "players": [{email}] }))
  if (game.status === "registering") {poll()}
}

function updateGame(gameIn) {
  if (gameIn === undefined) return

  Object.keys(gameIn).forEach( (key) => {
    if (game[key] === gameIn[key]) {
      console.log("Key is equal")
    } else {
      console.log(game[key], gameIn[key])
      game[key] = gameIn[key]
      console.log(`${key} updated`)
    }
  })

  if (game.status === "starting") {window.location = "game.html"}

  update("waiting", game.players.length)
  update("info", JSON.stringify(game))

  return game
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
  }, 2000)
}

//update some DOM element
function update(element, data) {
  document.getElementById(element).innerHTML = data
}



//add listeners for buttons and such
document.getElementById("login").onclick = login