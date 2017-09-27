//======== The Game ========//
const user = {
  status: "new"
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
        update("info", request.responseText)
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
                  transmit(user)
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
  user.name = name
  poll()

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
  game = gameIn
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