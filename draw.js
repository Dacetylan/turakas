//==>v3_rewrite.js comes a refresh call with inputs where we get the cards) & where the cards go;

function refresh (from, to) {
	// console.log(from, to);
	args = [from, to]
	args.forEach(function(element) 
	{
		switch (element) 
		{
			case p1:
			draw(p1, "player1")
			break
			case p2:
			draw(p2, "player2")
			break
			case board:
			draw(board, "board")
			break
			case muck:
			draw(muck, "muck")
			break
			case trump:
			draw(trump, "trump")
			break
		}
	})
}

function draw (arr, str) {
	// console.log(arr, str);
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