document.getElementById("waiting").innerHTML = 0

document.getElementById("login").onclick = () => {
  let email = document.getElementById("email").value
  transmit("?email=" + email)
}

let fireCmd = (obj) => {
  console.log(obj)
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