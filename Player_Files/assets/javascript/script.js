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
	var database = firebase.database();


	var drawnNums = new Array(76);

	function newCard() {
		//Starting loop per square
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

	// Trigger card check if changes in drawn numbers database
	database.ref().on("child_added", function(childSnapshot) {

		// numberDrawn captures value of latest drawn number in admin database
		var numberDrawn = childSnapshot.val();
		
		// check for match in current player bingo card
		for (var i =0; i<24; i++){
			var currCellVal = $("#square" + i).attr("data-valueCell");
			if (currCellVal==numberDrawn) {
				$("#square" + i).css("background-color", "#00bfff");
			};
		};
	});

	// Generates first Bingo Card upon launching screen
	anotherCard();

	// Resets game and generates new Bingo Card if player calls "Bingo!"
    $("#player-calls-Bingo").on("click", function () {
		event.preventDefault();

		// clears admin database of drawn numbers
		database.ref().remove();

		// generates new card
		anotherCard();
	});
});
