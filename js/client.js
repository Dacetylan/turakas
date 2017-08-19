const game = {
  status: "setup"
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
poll()

function updateGame(gameIn) {
  Object.keys(gameIn).forEach( (key) => {
    if (game[key] === gameIn[key]) {
      console.log("Key is equal")
    } else {
      console.log(game[key], gameIn[key])
      game[key] = gameIn[key]
      console.log(`${key} updated`)
    }
  })

  if (game.status === "finished") {alert("Game over")}

  update("info", JSON.stringify(game))

  return game
}

function update(element, data) {
  document.getElementById(element).innerHTML = data
}



function refresh(from, to) {
  console.log(from, to);
  args = [from, to]
  args.forEach(function(element) 
  {
    console.log(element)
    switch (element)
    {
      case "p1":
      draw(game.player.hand, "player")
      break
      case "board":
      draw(board, "board")
      break
      case "trump":
      draw(trump, "trump")
      break
    }
    console.log("did not find jackshit")
  })
}

function draw (arr, str) {
  console.log(arr, str);
  document.getElementById(str).innerHTML = "";
  for (var i = 0; i < arr.length; i++) {
    var div = document.createElement("div");

    div.innerHTML = arr[i];
    div.setAttribute('class', 'card');
    div.setAttribute('id', arr[i]);

    switch (arr[i][1]) {
      case "h":
      div.style.background = "red";
      break;
      case "d":
      div.style.background = "blue";
      break;
      case "s":
      div.style.background = "black";
      break;
      case "c":
      div.style.background = "green";
      break;
    }

    document.getElementById(str).appendChild(div);
  }
}