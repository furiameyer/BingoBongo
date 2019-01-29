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
    var playerDB = firebase.database().ref().child("Players");

    // Global variables
    var randomDraw;
    var drawnNums = new Array(136)
    var drawnArray = [];
    var timer;
    var counter = 0;

    function newRound() {
        newNumber();
		// //Starting loop per available number
		// for(var i=0; i < 134; i++) {  
        //     timer = setTimeout(newNumber, 10000);
        // };
        timer = setInterval(newNumber,10000);
	};
    
    // This function generates random numbers between 1 and 135
    function randomDraw () {
        return Math.floor(Math.random() * 135) + 1;
    };

    // This function generates a new, unrepeated number and saves it to the database
    function newNumber () {
        var newNum;
        
        do {
            newNum = randomDraw ();
        }
        while (drawnNums[newNum]);

        drawnNums[newNum] = true;

        randomPicksDb.push(newNum);

        counter++

        if(counter==135) {
            clearInterval(timer);
        };
	};

    // This function resets round
    function resetRound() {
		for(var i=1; i<drawnNums.length; i++) {
			drawnNums[i] = false;
		};
		randomPicksDb.remove();
		newRound();
	};

    // Kicks off round when kick-off button is pushed
    $("#round-kickoff").on("click", function () {
        event.preventDefault();
        drawnArray = [];
        resetRound();
    });

    // Clears numbers database when button is pushed
    $("#clear-numbers-database").on("click", function () {
        event.preventDefault();
        randomPicksDb.remove();
    });

    
    // Create Firebase event every time there is a change to the database
    // ------------------------------------------------------------------
    randomPicksDb.on("child_added", function(childSnapshot) {

        var numberDrawn = childSnapshot.val()
        drawnArray.push(numberDrawn);
        
        $("#numbers-drawn").empty();
        $("#numbers-drawn").text(drawnArray.join("  .  "));
    });

    randomPicksDb.on("child_removed", function() {
        $("#numbers-drawn").empty();
        drawnArray = [];
    });

});
