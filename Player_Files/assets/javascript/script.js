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
	var winConditionDb = firebase.database().ref().child("winCondition");
	var database = firebase.database();
	var queryPlayers = firebase.database().ref('Players').orderByChild('score');

	// Variables for tracking number of simultaneous connections to the database (condition of 3 to play)
	// --------------------------------------------------------------------------------------------------

	// connectionsRef references a specific location in our database.
	// All of our connections will be stored in this directory.
	var connectionsRef = database.ref("/Connections");

	// '.info/connected' is a special location provided by Firebase that is updated
	// every time the client's connection state changes.
	// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
	var connectedRef = database.ref(".info/connected");


	// Initialize global variables
	var drawnNums = new Array(76);
	var scoreMultipler = [10, 30, 50, 70, 100];
	var roundWins;
	var currentPlayer;
	var logged = false;
	var calledArray = [];

	// Define winning combinations to check against for Good Bingo. Entries with 4 numbers have a "free" space
	var winners = [
		// horizontal
		[0, 1, 2, 3, 4],
		[5, 6, 7, 8, 9],
		[10, 11, 12, 13],
		[14, 15, 16, 17, 18],
		[19, 20, 21, 22, 23],
		// vertical
		[0, 5, 10, 14, 19],
		[1, 6, 11, 15, 20],
		[2, 7, 16, 21],
		[3, 8, 12, 17, 22],
		[4, 9, 13, 18, 23],
		// diagonal
		[0, 6, 17, 23],
		[4, 8, 15, 19]
	];


	// Generate numbers for Bingo Cards
	function newCard() {
		// Starting loop per square
		for (var i = 0; i < 24; i++) {
			setSquare(i);
			// $("#square"+ i).css("background-color", "#FFFFFF");
		};

		// Toggle Background Colors on user click
		$(document).ready(function () {
			$(".square").click(function () {
				$(this).toggleClass("clicked");
			});
		});
	};

	function setSquare(thisSquare) {
		var newNum;
		var colPlace = new Array(0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4);

		do {
			newNum = (colPlace[thisSquare] * 15) + getNewNum() + 1;
		}
		while (drawnNums[newNum]);

		drawnNums[newNum] = true;
		$("#square" + thisSquare).text(newNum);
		$("#square" + thisSquare).attr("data-valueCell", newNum);
	}

	function getNewNum() {
		return Math.floor(Math.random() * 75);
	};

	function anotherCard() {
		for (var i = 1; i < drawnNums.length; i++) {
			drawnNums[i] = false;
		};
		newCard();
	};

	// Generate BINGO! button
	function bingoButton() {
		var newButton = $("<a>");
		newButton.attr("href", "#");
		newButton.attr("id", "player-calls-Bingo");
		newButton.attr("data-step", "5");
		newButton.attr("data-intro", "Call out Bingo and score 10 on one line, 30 on two, 50 on three, 70 on four, 100 on five, OR LOSE IT ALL!");
		newButton.addClass("btn btn-danger offset-3 offset-md-6 mt-2 mt-lg-4 mb-2 mb-lg-0 w-50");
		newButton.text("BINGO!")
		$("#bingo-button").append(newButton);
	};

	// Calls BINGO! button function
	bingoButton();

	// Calls Intro.js functions for Onboarding
	introJs().start();

	// Tracks activity in Sign In button
	$("#start-playing").on("click", function (event) {
		event.preventDefault();

		// Grabs user input
		currentPlayer = $("#new-user-entry").val().trim();

		// Uploads player entry data to the database
		activePlayerDb.child(currentPlayer).set({ "score": 0, "AvatarURL": "" });

		// Flags that user is logged in
		logged = true;

		// Alert - this will be a modal
		// CODE HERE

		// Clears login space on screen and welcomes new player
		$("#login-fields").empty();
		var welcome = $("<h3>");
		welcome.text("Welcome to Bingo Bongo, " + currentPlayer + "!");
		$("#login-fields").append(welcome);
		setTimeout(anotherCard, 1000);
	});

	// Player calls BINGO!
	$("#player-calls-Bingo").on("click", function () {
		event.preventDefault();

		if (logged) {
			// Bingo yell
			var bingoYell = new Audio('./assets/images-sounds/bingo.m4a');
			bingoYell.play();

			// removes Bingo button for remainder of round
			$("#bingo-button").empty();

			roundWins = 0;

			// confirms that there is a condition of winning
			for (var i = 0; i < winners.length; i++) { // i represents each winning condition
				var allcalled = true;
				for (var j = 0; j < winners[i].length; j++) { // j represents the numbers in each winning conditions
					var numberOnCard = parseInt($("#square" + winners[i][j]).attr("data-valueCell"));
					var isInArray = $.inArray(numberOnCard, calledArray);
					if (isInArray == -1) {
						allcalled = false;
						break; // A number in this row has not been called. No Bingo in this row.
					};
				};
				if (allcalled == true) {
					roundWins++;
					console.log(roundWins + " good Bingo(s)!");
				};
			};

			if (roundWins !== 0) {
				roundWinner();
			} else {
				console.log("Sorry not a right bingo call");
			};

			function roundWinner() {
				// adds to score of current player and updates database

				currentPlayerinDb = activePlayerDb.child(currentPlayer).child("score");

				currentPlayerinDb.once("value", function (snap) {
					currentPlayerScore = parseInt(snap.val());
					var updateScore = currentPlayerScore + scoreMultipler[roundWins - 1];
					snap.ref.set(updateScore);
				});

				winConditionDb.child("roundWinner").set(true);
				winConditionDb.child("nameOfWinner").set(currentPlayer);

				// informs other players that there is a winner for the round
				// CODE HERE

				// clears admin database of drawn numbers to reset game
				randomPicksDb.remove();

				// generates new card
				anotherCard();
			};
		};
	});

	// Firebase events every time there is a change to the database
	// ------------------------------------------------------------
	// Trigger card check whenever there is a new number drawn
	randomPicksDb.on("child_added", function (snap) {

		// numberDrawn captures value of latest drawn number in admin database
		var numberDrawn = snap.val();

		// updates latest draw div
		$("#current-draw").text(numberDrawn);

		// adds number to calledArray
		calledArray.push(numberDrawn);

		// plays sound
		var newBall = new Audio('./assets/images-sounds/newball.m4a');
		newBall.addEventListener('loadeddata', function () {
			newBall.play;
		});

		// check for match in current player bingo card
		for (var i = 0; i < 24; i++) {
			var currCellVal = $("#square" + i).attr("data-valueCell");
			if (currCellVal == numberDrawn) {
				$("#square" + i).css("background-color", "#00bfff");
			};
		};
	});

	// Update leaderboard whenever a new player signs up or the score of an exisitng player changes
	queryPlayers.on("value", function (snap) {
		
		$(".list-group").empty();

		snap.forEach(function(childSnap) {
			// capture name of player
			var newPlayer = childSnap.key;

			// capture latest score for player
			var newScore = childSnap.val().score;

			// ads new player to Leader Board
			var newListItem = $("<li>");
			newListItem.addClass("list-group-item d-flex justify-content-between align-items-center");
			newListItem.attr("id", "player-name-" + newPlayer);
			newListItem.text(newPlayer);
			var newSpan = $("<span>");
			newSpan.addClass("badge badge-primary badge-pill");
			newSpan.attr("id", "score-for-" + newPlayer);
			newSpan.text(newScore);
			newListItem.append(newSpan);
			$(".list-group").prepend(newListItem);
		});
	});

	// Stops round and informs of new Winner!
	winConditionDb.on("child_changed", function (snap) {
		isThereAWinner = snap.val();
		if (isThereAWinner == true || isThereAWinner !== "Nobody") {
			// removes Bingo button from game
			// Informs players there is a winner and mentions name + timeout of 10 seconds
			// generates new card
		};
	});

	// When the client's connection state changes...
	connectedRef.on("value", function (snap) {

		// If they are connected..
		if (snap.val()) {

			// Add user to the connections list.
			var con = connectionsRef.push(true);
			// Remove user from the connection list when they disconnect.
			con.onDisconnect().remove();
		};
	});

	// When first loaded or when the connections list changes...
	connectionsRef.on("value", function (snap) {

		// Display the viewer count in the html.
		// The number of online users is the number of children in the connections list.
		$("#connected-viewers").text(snap.numChildren() - 1);
	});

});
