const game = {
  status: "registering",
  player: [],
}

let login = function() {
  let email = document.getElementById("email").value

  transmit(updateGame( { "player": [{email}] }))
  if (game.status === "registering") {poll()}
}

function updateGame(gameIn) {
  if (game == gameIn) {console.log("games are the same")}

  Object.keys(gameIn).forEach( (key) => {
    if (game[key] === gameIn[key]) {
      console.log("Key is equal")
    } else {
      console.log(game[key], gameIn[key])
      game[key] = gameIn[key]
      console.log(`${key} updated`)
    }
  })

  update("waiting", game.player.length)
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






