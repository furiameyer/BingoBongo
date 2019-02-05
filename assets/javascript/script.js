// Run this first
$(document).ready(function () {

	// VARIABLES ///////////////////////////////////////////////////////////////////////////////////////////
	// /////////////////////////////////////////////////////////////////////////////////////////////////////

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

	// Variables to reference the database
	var randomPicksDb = firebase.database().ref().child("randomPicks");
	var activePlayerDb = firebase.database().ref().child("Players");
	var winConditionDb = firebase.database().ref().child("winCondition");
	var database = firebase.database();
	var queryPlayers = firebase.database().ref('Players').orderByChild('score').limitToLast(5);
	var KickoffDb = firebase.database().ref().child("Kickoff");

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
	var roundWins = 0;
	var currentPlayer;
	var logged = false;
	var calledArray = [];
	var countdown = 11;
	var countdownInt;
	var nameOfWinner;
	var livePlayers;

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

	// FUNCTIONS ///////////////////////////////////////////////////////////////////////////////////////////
	// /////////////////////////////////////////////////////////////////////////////////////////////////////

	// Generate numbers for Bingo Cards
	function newCard() {

		// Reset possible number options for Bingo card
		for (var i = 1; i < drawnNums.length; i++) {
			drawnNums[i] = false;
		};

		// Start loop to fill in each square on Bingo card and restore to white background
		for (var i = 0; i < 24; i++) {
			setSquare(i);
			$("#square"+ i).css("background-color", "transparent");
		};

		// Toggle Background Colors on user click
		$(document).ready(function () {
			$(".square").click(function () {
				$(this).toggleClass("clicked");
			});
		});
	};

	// Generate random number for the Bingo card square
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

	//API Calls for Dog CEO & Cat API

	// Dog CEO API call
	function callDog() {
		var queryURL = "https://dog.ceo/api/breeds/image/random";

		$.ajax({
			url: queryURL,
			method: "GET"
		}).then(function (response) {
			var dogPicture = response.message;
			$("#bingotable").css("background-image", "url(" + dogPicture + ")");
		});
	};

	// Cat API call
	function callCat() {
		var queryURL = "https://api.thecatapi.com/v1/images/search?mime_types=jpg,png&size=large";

		$.ajax({
			url: queryURL,
			method: "GET"
		}).then(function (response) {
			var catPicture = response[0].url;
			$("#bingotable").css("background-image", "url(" + catPicture + ")");

		});
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

	// Display standby spinner
	function launchSpinner() {
		$("#countdown-spinner-header").text("Standby...");
		$("#countdown-spinner").empty();
		var spinnerDOM = $("<div>");
		spinnerDOM.addClass("spinner-grow text-light mt-5");
		spinnerDOM.attr("style", "width: 6rem; height: 6rem;");
		$("#countdown-spinner").append(spinnerDOM);
	};

	// Display countdown to start round
	function displayCountdown() {
		$("#countdown-spinner-header").text("Countdown to Round");
		$("#countdown-spinner").empty();
		$("#bingo-button").empty();
		var timerDOM = $("<h2>");
		timerDOM.addClass("text-light mt-5");
		timerDOM.text(countdown);
		$("#countdown-spinner").append(timerDOM);
	};

	function countdownToRound() {
		countdown--;
		if (countdown <= 0) {
			clearInterval(countdownInt);
			displayNumberCalls();
		} else {
			displayCountdown();
		};
	};

	// Display Numbers Called
	function displayNumberCalls() {
		$("#countdown-spinner-header").text("New Ball");
		$("#countdown-spinner").empty();
		var spinnerDOM = $("<div>");
		spinnerDOM.addClass("spinner-border text-light text-center mt-5");
		spinnerDOM.attr("style", "width: 6rem; height: 6rem;");
		var currentNumberDOM = $("<h2>");
		currentNumberDOM.attr("id", "current-draw");
		spinnerDOM.append(currentNumberDOM);
		$("#countdown-spinner").append(spinnerDOM);
		bingoButton();
	};

	// Announce Winner for round
	function announceWinner() {
		$("#countdown-spinner-header").text("Round Winner!");
		$("#countdown-spinner").empty();

		winConditionDb.child("nameOfWinner").once("value", function (snap) {
			nameOfWinner = snap.val();
		});

		var winnerDOM = $("<h2>");
		winnerDOM.text(nameOfWinner);
		$("#countdown-spinner").append(winnerDOM);
	};

	// No Bingo Announcement
	function noBingo() {
		$("#countdown-spinner-header").text("Sorry!");
		$("#countdown-spinner").empty();
		var noBingoDOM = $("<h2>");
		noBingoDOM.addClass("text-light mt-5");
		noBingoDOM.text("No BINGO");
		$("#countdown-spinner").append(noBingoDOM);
	};

	// Generate New Round
	function newRound() {
		roundWins=0;
		calledArray=[];
		countdown=11;
		winConditionDb.child("roundWinner").set(false);
		winConditionDb.child("nameOfWinner").set("Nobody");
		newCard();
		launchSpinner();
	};

	// BUTTON EVENT TRACKERS ///////////////////////////////////////////////////////////////////////////////
	// /////////////////////////////////////////////////////////////////////////////////////////////////////

	// Tracks activity in Sign In button
	$(document).on("click", "#sign-in", function (event) {
		event.preventDefault();

		// Grabs user input
		currentPlayer = $("#new-user-entry").val().trim();

		// Uploads player entry data to the database
		activePlayerDb.child(currentPlayer).set({ "score": 0, "AvatarURL": "", "ready2Play": "N" });

		// Flags that user is logged in
		logged = true;

		// Clears login space on screen and welcomes new player
		$("#login-fields").empty();
		var welcome = $("<h3>");
		welcome.text("Welcome to Bingo Bongo, " + currentPlayer + "!");
		$("#login-fields").append(welcome);
		$("#bingo-button").empty();
		setTimeout(newCard, 1000);
	});

	// Dog & Cat Buttons click listeners
	$("#dogButton").click(function () {
		callDog();
	})

	$("#catButton").click(function () {
		callCat();
	})

	// Player calls BINGO!
	$(document).on("click", "#player-calls-Bingo", function () {
		event.preventDefault();

		if (logged) {
			// Bingo yell
			var bingoYell = new Audio('./assets/images-sounds/bingo.m4a');
			bingoYell.play();

			// removes Bingo button for remainder of round
			$("#bingo-button").empty();

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
				};
			};

			// run roundWinner if there is a condition of winning
			if (roundWins !== 0) {
				roundWinner();
			} else {
				noBingo();
			};

			// adds to score of current player and updates database
			function roundWinner() {
				
				var currentPlayerinDb = activePlayerDb.child(currentPlayer).child("score");

				currentPlayerinDb.once("value", function (snap) {
					currentPlayerScore = parseInt(snap.val());
					var updateScore = currentPlayerScore + scoreMultipler[roundWins - 1];
					snap.ref.set(updateScore);
				});

				winConditionDb.child("roundWinner").set(true);
				winConditionDb.child("nameOfWinner").set(currentPlayer);
			};
		};
	});

	// FIREBASE EVENT TRACKERS /////////////////////////////////////////////////////////////////////////////
	// /////////////////////////////////////////////////////////////////////////////////////////////////////

	// Trigger card check whenever there is a new number drawn
	randomPicksDb.on("child_added", function (snap) {

		// numberDrawn captures value of latest drawn number in admin database
		var numberDrawn = snap.val();

		// updates latest draw div
		$("#current-draw").text(numberDrawn);

		// adds number to calledArray
		calledArray.push(numberDrawn);

		// plays sound (disabled for demo)
		// var newBall = new Audio('./assets/images-sounds/newball.m4a');
		// 	newBall.play();

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

		snap.forEach(function (childSnap) {
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

	// Update number of connection when the client's connection state changes
	connectedRef.on("value", function (snap) {

		// If they are connected..
		if (snap.val()) {

			// Add user to the connections list.
			var con = connectionsRef.push(true);
			// Remove user from the connection list when they disconnect.
			con.onDisconnect().remove();
		};
	});

	// Keep track of number of live connections
	connectionsRef.on("value", function (snap) {

		// Display the viewer count in the html.
		// The number of online users is the number of children in the connections list.
		livePlayers = parseInt(snap.numChildren() - 1);
		$("#connected-viewers").text(livePlayers);
	});

	// Check for Admin to start round and kickoff game
	KickoffDb.on("child_changed", function (snap) {

		var order2Kickoff = snap.val();

		// Countdown starts automatically when there are three live players or more
		if (order2Kickoff == true) {
			countdownInt = setInterval(countdownToRound, 1000);
		};
	});

	// Check for Bingo winners and if so, stop round and announce
	winConditionDb.on("child_changed", function (snap) {
		var isThereAWinner = snap.val();
		if (isThereAWinner == true || isThereAWinner !== "Nobody") {

			// removes Bingo button for all players
			$("#bingo-button").empty();

			// announces winner
			announceWinner();

			// kicks off another round
			setTimeout(newRound,10000);
			// };
		};
	});

	// STARTUP PROCESS /////////////////////////////////////////////////////////////////////////////////////
	// /////////////////////////////////////////////////////////////////////////////////////////////////////

	// Calls startup screen functions
	bingoButton();
	launchSpinner();
	introJs().start(); // Onboarding guide

});
