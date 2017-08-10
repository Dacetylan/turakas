let game = {
  registered: 0,
}


document.getElementById("waiting").innerHTML = game.registered
document.getElementById("login").onclick = () => {
  let email = document.getElementById("email").value
  transmit("?email=" + email)
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
    if (game.registered === 3) {
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
  let request = new XMLHttpRequest()
  request.open("GET", url, true);
  request.onload = function() {
    fireCmd(JSON.parse(request.responseText))
  }
  request.send()
}