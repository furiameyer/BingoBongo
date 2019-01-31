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

	// Tracks activity in Start Playing button
  	// ---------------------------------------
  	$("#start-playing").on("click", function(event) {
		event.preventDefault();
	
		// Grabs user input
		var newPlayer = $("#new-user-entry").val().trim();

		// Uploads player entry data to the database
		activePlayerDb.child(newPlayer).set("0");
		
		// Alert - this will be a modal
		// ...
	
		// Clears login space on screen and welcomes new player
		$("#login-fields").empty();
		var welcome = $("<h3>");
		welcome.text("Welcome to Bingo Bongo, " + newPlayer + "!");
		$("#login-fields").append(welcome);
		setTimeout(anotherCard,1000);
  	});

	// Trigger card check if changes in drawn numbers database
	randomPicksDb.on("child_added", function(snap) {

		// numberDrawn captures value of latest drawn number in admin database
		var numberDrawn = snap.val();

		// updates latest draw div
		$("#current-draw").text(numberDrawn);
		
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

	// Update leaderboard whenever a change takes place in Players database
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

	// Resets game and generates new Bingo Card if player calls "Bingo!"
    $("#player-calls-Bingo").on("click", function () {
		event.preventDefault();

		// clears admin database of drawn numbers
		randomPicksDb.remove();

		// generates new card
		anotherCard();
	});
});
