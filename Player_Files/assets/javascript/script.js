// Run this first
$(document).ready(function () {

	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyD_-3-lBIv3PPo6JqTdd_0ujlntX3tmpOo",
		authDomain: "bingobongo.firebaseapp.com",
		databaseURL: "https://bingobongo.firebaseio.com",
		projectId: "bingobongo",
		storageBucket: "bingobongo.appspot.com",
		messagingSenderId: "510658729020"
	};
	firebase.initializeApp(config);

	// Create a variable to reference the database
	var randomPicksDb = firebase.database().ref().child("randomPicks");
	var activePlayerDb = firebase.database().ref().child("Players");

	// Initialize global variables
	var drawnNums = new Array(76);
	var currentPlayer;
	var logged = false;
	var calledArray = [];

	// Define winning combinations. Entries with 4 numbers have a "free" space
	var winners = [
		// horizontal
		[0,1,2,3,4],
		[5,6,7,8,9],
		[10,11,12,13],
		[14,15,16,17,18],
		[19,20,21,22,23],
		// vertical
		[0,5,10,14,19],
		[1,6,11,15,20],
		[2,7,16,21],
		[3,8,12,17,22],
		[4,9,13,18,23],
		// diagonal
		[0,6,17,23],
		[4,8,15,19]
	];


	// Generate numbers for Bingo Cards
	// --------------------------------

	function newCard() {
		// Starting loop per square
		for(var i=0; i < 24; i++) {  
			setSquare(i);
			$("#square"+ i).css("background-color", "#FFFFFF");
		}
	}

	function setSquare(thisSquare) {
		var newNum;
		var colPlace =new Array(0,1,2,3,4,0,1,2,3,4,0,1,3,4,0,1,2,3,4,0,1,2,3,4);
		
		do {
			newNum =(colPlace[thisSquare] * 15) + getNewNum() + 1;
		}
		while (drawnNums[newNum]);
		
		drawnNums[newNum] = true;
		$("#square" + thisSquare).text(newNum);
		$("#square" + thisSquare).attr("data-valueCell",newNum);
	}

	function getNewNum() {
		return Math.floor(Math.random() * 75);
	};

	function anotherCard() {
		for(var i=1; i<drawnNums.length; i++) {
			drawnNums[i] = false;
		};
		newCard();
	};

	function bingoButton () {
		var newButton = $("<a>");
		newButton.attr("href", "#");
		newButton.attr("id", "player-calls-Bingo");
		newButton.attr("data-intro", "Call out Bingo when you believe that you've won!");
		newButton.addClass("btn btn-danger offset-6 mt-4 w-50");
		newButton.text("BINGO!")
		$("#bingo-button").append(newButton);
	};

	// Generates Bingo Button
	bingoButton();

	// Calls Intro.js functions for Onboarding
	introJs().start();

	// Tracks activity in Start Playing button
  	// ---------------------------------------
  	$("#start-playing").on("click", function(event) {
		event.preventDefault();
	
		// Grabs user input
		currentPlayer = $("#new-user-entry").val().trim();

		// Uploads player entry data to the database
		activePlayerDb.child(currentPlayer).set(0);
		
		// Flags that user is logged in
		logged = true;
		
		// Alert - this will be a modal
		// CODE HERE
	
		// Clears login space on screen and welcomes new player
		$("#login-fields").empty();
		var welcome = $("<h3>");
		welcome.text("Welcome to Bingo Bongo, " + currentPlayer + "!");
		$("#login-fields").append(welcome);
		setTimeout(anotherCard,1000);
  	});

	  
	// Player calls BINGO!
	// -------------------
    $("#player-calls-Bingo").on("click", function () {
		event.preventDefault();

		if (logged) {
			// Bingo yell
			var bingoYell = new Audio('./assets/images-sounds/bingo.m4a');
			bingoYell.play();
			
			// removes Bingo button for remainder of round
			$("#bingo-button").empty();

			var goodbingo = false;

			// confirms that there is a condition of winning
			for (var i = 0; i < winners.length; i++) { // i represents each winning condition
				var allcalled = true;
				for (var j = 0; j < winners[i].length; j++) { // j represents the numbers in each winning conditions
					var numberOnCard = parseInt($("#square" + winners[i][j]).attr("data-valueCell"));
					var isInArray = $.inArray(numberOnCard,calledArray);
					if (isInArray == -1) {
						allcalled = false;
						break; // A number in this row has not been called. No Bingo.
					};
				};
				if (allcalled == true) {
					goodbingo = true;
					console.log("Good Bingo!");
					// launch HERE thereIsAWinnerfunction that stops game, adds score to player
					//, informs other players, and launches new round
				};
			};

			if (allcalled == false) {
				console.log("Bad Bingo");
			};

			function thereIsAWinner (){
					// adds to score of current player
				// var dataRef = firebase.database().ref();
				// var currentPlayerRef = dataRef.orderByChild("Players").equalTo(currentPlayer);
				// // var testVariable = currentPlayerRef.val();
				// // currentPlayerScore++;
				// console.log(currentPlayerRef);

				// HELP HERE


				// informs other players that there is a winner for the round
				// CODE HERE

				// clears admin database of drawn numbers to reset game
				// randomPicksDb.remove();

				// generates new card
			anotherCard();
			};
		};
	});

	// Trigger card check whenever there is a new number drawn
	randomPicksDb.on("child_added", function(snap) {

		// numberDrawn captures value of latest drawn number in admin database
		var numberDrawn = snap.val();

		// updates latest draw div
		$("#current-draw").text(numberDrawn);

		// adds number to calledArray
		calledArray.push(numberDrawn);

		// plays sound
		var newball = new Audio('./assets/images-sounds/newball.m4a');
        newball.play();
		
		// check for match in current player bingo card
		for (var i =0; i<24; i++){
			var currCellVal = $("#square" + i).attr("data-valueCell");
			if (currCellVal==numberDrawn) {
				$("#square" + i).css("background-color", "#00bfff");
			};
		};
	});

	// Update leaderboard whenever a change takes place in Player scores
	activePlayerDb.on("child_changed", function(snap) {
		var playerWithNewScore = snap.key;
		$("#score-for-" + playerWithNewScore).text(snap.val());
	});

	// Update leaderboard whenever a new player signs up
	activePlayerDb.on("child_added", function(snap) {

		// newPlayer captures name of player
		var newPlayer = snap.key;

		// newScore capture latest score for player
		var newScore = snap.val();

		// updates Leader Board with player name and score
		var newListItem = $("<li>");
		newListItem.addClass("list-group-item d-flex justify-content-between align-items-center");
		newListItem.attr("id","player-name-" + newPlayer);
		newListItem.text(newPlayer);
		var newSpan = $("<span>");
		newSpan.addClass("badge badge-primary badge-pill");
		newSpan.attr("id","score-for-" + newPlayer);
		newSpan.text(newScore);
		newListItem.append(newSpan);
		$(".list-group").append(newListItem);
	});

});
