// most important first. lets have cards.

var suits = ["h", "d", "s", "c"];
var ranks = ["9", "8", "7", "6", "5", "4", "3", "2", "1"]

var deck = [];

var board = [];
var muck = [];
var trump = [];
var dealer = [];

var p1 = [],
	p2 = [],
	p3 = [],
	p4 = [];

players = [p1, p2]

var referee = {round: 1,
			   killer: 2,
			   whosMove: 1,
			   cardsOnBoard: 0,
			   trumpSuit: ""};

function whosMove()
{
	referee.whosMove++;
	if (referee.whosMove > players.length)
	{
		referee.whosMove = 1;
	}
}

function endRound(arg)
{
	referee.killer += arg;
	if (referee.killer > players.length)
	{
		referee.killer = 1;
	}
}

//put together suits and ranks
function createCards() 
{
	for (var i = 0; i < ranks.length; i++) 
	{
		for (var j = 0; j < suits.length; j++) 
		{
			deck.push(ranks[i] + suits[j]);
		}
	}
};


//shuffle the deck using Fisher-Yates
function shuffle(deck) 
{
	var lth = deck.length, 
		i,
		j;

	while (lth) 
	{
		i = Math.floor(Math.random() * lth--);
		j = deck[lth];
		deck[lth] = deck[i];
		deck[i] = j;
	}
	return deck;
};

// so lets do this shit!

//let there be cards!
createCards();
//let there be chaos among the cards
shuffle(deck);


//now lets give players whats theirs

function deal (from, to, nr, id) 
{
	var temp = []; //temporary array not to modify the original
	if (id !== undefined && nr === 1) 
	{
		temp = from.splice(from.indexOf(id), 1);
		to.push(temp[0]);
	} 
	else 
	{	
		if (from === deck && nr > deck.length) //if deck is empty, put trump there as the last card
		{
			deal(trump, deck, 1);
		}
		temp = from.splice(0, nr);
		temp.map(function(element)
		{
			to.push(element);
		});
	}
	refresh(from, to); //===========================================================> draw.js
}



function dealPlayers () 
{
	deal(deck, p1, 6 - p1.length);
	deal(deck, p2, 6 - p2.length);
	// deal(deck, p3, 6);
	// deal(deck, p4, 6);
	addListeners();
}
deal(deck, trump, 1); //Make Turakas Great Again!
referee.trumpSuit = trump[0][1];
dealPlayers(); //deal the players some visual cards



//Lets make the game playable. Next is how to select the card with a mouse


function addListeners () 
{	
	//this var has an array of all the cards
	var selectedCard = document.getElementsByClassName("card");
	// we loop through the cards and add eventlisteners
	for (var i = 0; i < selectedCard.length; i++) 
	{
		selectedCard[i].addEventListener("click", cardSelector, false);
	}
}	
addListeners()



function cardSelector ()
{	console.log('woot')
	id = this.id
	//checks if given ID exists in the player arrays
	for (var i = 0; i < players.length; i++) {
		if (players[i].indexOf(id) !== -1) 
		{
			switch (i) 
			{	
				case 0:
				testCard(p1, board, 1, id);
				break;
				case 1:
				testCard(p2, board, 1, id);
				break;
				case 2:
				testCard(p3, board, 1, id);
				break;
				case 3:
				testCard(p4, board, 1, id);
				break;

			}
		}
	}
	// refreshes eventlisteners, because smth happened with them !BUG!
	addListeners()
}

//this tests if card can go on the board
function testCard(arr, whereTo, howMany, id)
{	
	var memberBerry;
	var	suit = id[1];
	var	rank = id[0];
	var trumpSuit = referee.trumpSuit;

	switch (arr) 
	{	
		case p1:
			memberBerry = 1;
		break;
		case p2:
			memberBerry = 2;
		break;
		case p3:
			memberBerry = 3;
		break;
		case p4:
			memberBerry = 4;
		break;
	}

	if (referee.whosMove === memberBerry) //first of all, is it that players turn
	{
		if (referee.killer !== memberBerry && board.length === 0)
		{
			console.log("P" + memberBerry + " moves first attacker on board");
			deal(arr, whereTo, 1, id);
			whosMove();
		}
		else if (referee.killer !== memberBerry && board.length > 0)
		{	
			for (var i = 0; i < board.length; i++) {
				if (rank === board[i][0])
				{
					console.log("P" + memberBerry + " adds attacker to board")
					deal(arr, whereTo, 1, id);
					whosMove();
					break;
				}
			}
		}
		else if (referee.killer === memberBerry && board.length % 2 !== 0)
		{
			var attacker = board[board.length -1];
			var attackerSuit = attacker[1];
			var attackerRank = attacker[0];

			if ((suit === attackerSuit && rank > attackerRank) || suit === trumpSuit && attackerSuit !== trumpSuit)
			{
				console.log("P" + memberBerry + " kills attacker");
				deal(arr, whereTo, 1, id);
				whosMove();
			}
			else
			{
				console.log("Pick a better card!");
			}
		}
	}
}


document.getElementById("pickUp").onclick = function(){pickUpCards(referee.whosMove)};
document.getElementById("muckCards").onclick = function(){muckCards(referee.whosMove)};


function pickUpCards(who)
{	
	if (board.length > 0) {
		switch (who)
		{
			case 1:
			deal(board, p1, board.length);
			break;
			case 2:
			deal(board, p2, board.length);
			break;
			case 3:
			deal(board, p3, board.length);
			break;
			case 4:
			deal(board, p4, board.length);
			break;
		}	
	endRound(0);
	whosMove();
	dealPlayers();	
	}
}

function muckCards()
{	
	if (board.length > 0 && board.length % 2 === 0)
	{
		deal(board, muck, board.length);
		whosMove();
		endRound(+1);		
		dealPlayers();
	}
}