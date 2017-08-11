let game = {
  registered: 0,
}

document.getElementById("send").onclick = () => {
  let cmd = document.getElementById("cmd").value
  transmit("?deal=" + cmd)
}




let fireCmd = (obj) => {
  // console.log(obj)
  document.getElementById("info").innerHTML = JSON.stringify(obj)

  Object.keys(obj).forEach((key) => {
    if (game[key] === obj[key]) {
      console.log("same key")
    } else {
      game[key] = obj[key]
    }
    document.getElementById("info").innerHTML = JSON.stringify(game)
    if (game.refresh !== undefined) {
      let getArg = () => {
          let argArr = game.refresh.split(", ")

          return {
            from: argArr[0],
              to: argArr[1],
          }
        }
        let from = getArg().from
        let to   = getArg().to
      refresh(from, to)
      delete game.refresh
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
      // case "board":
      // draw(board, "board")
      // break
      // case "muck":
      // draw(muck, "muck")
      // break
      // case "trump":
      // draw(trump, "trump")
      // break
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