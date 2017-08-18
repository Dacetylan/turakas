let game = {
  status: "registering",
  registered: 0,
  players: [],
}


document.getElementById("waiting").innerHTML = game.registered

document.getElementById("login").onclick = () => {
  let email = document.getElementById("email").value

  if (game.registered === 0) {
    game.players.push( {email} )
    game.registered += 1
    console.log()
    transmit("?cmd=" + JSON.stringify(game))
  }
}


let fireCmd = (obj) => {
  // console.log(obj)

  Object.keys(obj).forEach((key) => {
    if (game[key] === obj[key]) {
      console.log("same key")
    } else {
      game[key] = obj[key]
    }
    document.getElementById("info").innerHTML = JSON.stringify(game)
    document.getElementById("waiting").innerHTML = game.registered
    if (game.registered === 2) {
      window.location.href = "/game.html"
    }
  })

}

let poll = () => {
   setTimeout( () => {
      let request = new XMLHttpRequest()
      request.open("GET", "?ping", true);
      request.onload = function() {
        fireCmd(JSON.parse(request.responseText))
         // console.log(request)
         poll()
      }
   request.send()
   }, 2000)
}
poll()

let transmit = (url) => {
  console.log(url)
  let request = new XMLHttpRequest()
  request.open("GET", url, true);
  request.onload = function() {
    fireCmd(JSON.parse(request.responseText))
  }
  request.send()
}