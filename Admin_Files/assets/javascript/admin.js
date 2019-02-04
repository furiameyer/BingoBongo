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
    
    // THIS IS CODE WE WILL NEED FOR LATER, in order to delete players
    // ----------------------------------------------------------------------------
    // var playerDb2 = firebase.database().ref("Players");
    // playerDb2.child("Albert").remove();

    // removePlayer(name){
    //     var survey=db.ref(‘Players’);
    //     survey.child(name).remove().then(function(){
    //         console.log(’success’);
    //     }).catch(function(error) {
    //        console.log("Remove failed: " + error.message)
    //      });
    // -----------------------------------------------------------------------------

    // Global variables
    var randomDraw;
    var drawnNums = new Array(136)
    var drawnArray = [];
    var playerArray = [];
    var timer;
    var counter = 0;
    var isThereAWinner;
    var livePlayers = 0;

    function newRound() {
        // winConditionDb.child("roundWinner").set(false);
        // winConditionDb.child("nameOfWinner").set("Nobody");
        newNumber();
        timer = setInterval(newNumber,500);
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

            // "true" flag ensures the number is not repeated again
            drawnNums[newNum] = true;
            
            // Adds new number to Database
            randomPicksDb.child(`Counter_ ${counter}`).set(newNum);
            
            counter++

            // Stop drawing new numbers at 135 to avoid an error in code
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
        clearInterval(timer);
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
        clearInterval(timer);
    });

    // Clears players database when button is pushed
    $("#clear-players-database").on("click", function () {
        event.preventDefault();
        activePlayerDb.remove();
    });
    
    // Create Firebase event every time there is a change in the database
    // ------------------------------------------------------------------
    randomPicksDb.on("child_added", function(snap) {
        var numberDrawn = snap.val();
        drawnArray.push(numberDrawn);
        $("#numbers-drawn").empty();
        $("#numbers-drawn").text(drawnArray.join("  .  "));
    });

    randomPicksDb.on("child_removed", function() {
        $("#numbers-drawn").empty();
        drawnArray = [];
        counter=0;
    });

    activePlayerDb.on("child_added", function(snap) {
        var newPlayer = snap.key;
        playerArray.push(newPlayer);
        $("#active-players").empty();
        $("#active-players").text(playerArray.join("  .  "));
    });

    activePlayerDb.on("child_removed", function() {
        $("#active-players").empty();
        playerArray = [];
    });

    winConditionDb.on("child_changed", function(snap) {
        isThereAWinner = snap.val();
        if (isThereAWinner == true || isThereAWinner !== "Nobody") {
            clearInterval(timer);
            randomPicksDb.remove();
            counter=0;
        };
    });

    // Track number of live connections to database
    // --------------------------------------------
    
    // connectionsRef references a specific location in our database.
    // All of our connections will be stored in this directory.
    var connectionsRef = database.ref("/Connections");

    // '.info/connected' is a special location provided by Firebase that is updated
    // every time the client's connection state changes.
    // '.info/connected' is a boolean value, true if the client is connected and false if they are not.
    var connectedRef = database.ref(".info/connected");

    // When the client's connection state changes...
    connectedRef.on("value", function(snap) {

    // If they are connected..
    if (snap.val()) {

        // Add user to the connections list.
        var con = connectionsRef.push(true);
        // Remove user from the connection list when they disconnect.
        con.onDisconnect().remove();
    }
    });

    // When first loaded or when the connections list changes...
    connectionsRef.on("value", function(snap) {

    // Display the viewer count in the html.
    // The number of online users is the number of children in the connections list.
    livePlayers = parseInt(snap.numChildren()-1);
    $("#connected-viewers").text(livePlayers);

    // Game starts automatically when there are three live players or more
    if (livePlayers > 2) {
        console.log("game on!");
        setTimeout(resetRound,30000);
    };
    });
});
