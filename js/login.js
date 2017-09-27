//======== The Game ========//

const game = {
  players: []
}
                           //
//-------------------------//



//==================== Transmitter ====================//
                                                       //
                                                       //
function transmit(url) {
  console.log(url)

  url = "?game=" + JSON.stringify(url)

  let request = new XMLHttpRequest()

      request.open("GET", url, true);
      request.onload = function() {

        modifyGame(JSON.parse(request.responseText))
      }
  request.send()
}
                                                       //
                                                       //
//-----------------------------------------------------//



//================= Poll the server ===================//
                                                       //
                                                       //
            function poll( time = 2000 ) {
              setInterval( () => {
                  transmit(game)
              }, time)
            }
                                                       //
                                                       //
//-----------------------------------------------------//



//==================== Login the player ==================//
                                                          //
                                                          //
/* 
  add new player to client side game object
  start polling the server                  
  we only use this once, so no worries about seperation 
*/

let login = function() {
  let name = document.getElementById("name").value

  game.players = [ {name} ]

  if (!game.status) {
    poll()
  }

  //disable the button and display that we are waiting
  this.setAttribute("disabled", "true")
  update("info", "You are registered")
}
                                                          //
                                                          //
//--------------------------------------------------------//


//=================== Modify the game ====================//
                                                          //
                                                          //
function modifyGame(gameIn) {
  Object.keys(gameIn).map( key => {
    game[key] = gameIn[key]
  })
}


                                                          //
                                                          //
//--------------------------------------------------------//


//update a DOM element
function update(element, data) {
  document.getElementById(element).innerHTML = data
}

//add listeners for buttons and such
document.getElementById("login").onclick = login