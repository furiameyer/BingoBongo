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

	// Create a variable to reference the database
    var randomPicksDb = firebase.database().ref().child("randomPicks");
    var activePlayerDb = firebase.database().ref().child("Players");
    var winConditionDb = firebase.database().ref().child("winCondition");
    var KickoffDb = firebase.database().ref().child("Kickoff");
    var database = firebase.database();
    
    
    // PLACEHOLDER CODE in order to delete players
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
    var callNumbersBag = new Array(136)
    var alreadyCalledArray = [];
    var playerArray = [];
    var callTimer;
    var callsCounter = 0;
    var isThereAWinner;
    var livePlayers = 0;


    // Variables for tracking number of simultaneous connections to the database (condition of 3 to play)
	// --------------------------------------------------------------------------------------------------
    
    // connectionsRef references a specific location in our database.
    // All of our connections will be stored in this directory.
    var connectionsRef = database.ref("/Connections");

    // '.info/connected' is a special location provided by Firebase that is updated
    // every time the client's connection state changes.
    // '.info/connected' is a boolean value, true if the client is connected and false if they are not.
    var connectedRef = database.ref(".info/connected");

    // FUNCTIONS ///////////////////////////////////////////////////////////////////////////////////////////
    // /////////////////////////////////////////////////////////////////////////////////////////////////////
    
    function newRound() {
        resetRound();
        newCall();
        callTimer = setInterval(newCall,500);
	};
    
    // Generate a new, unrepeated number and save it to the database
    function newCall () {
        
            var newNum;
            
            do {
                newNum = Math.floor(Math.random() * 135) + 1;
            }
            while (callNumbersBag[newNum]);

            // "true" flag ensures the number is not repeated again
            callNumbersBag[newNum] = true;
            
            // Adds new number to Database
            randomPicksDb.child(`Counter_ ${callsCounter}`).set(newNum);
            
            // Keeps track of the number of calls made
            callsCounter++

            // Stop drawing new numbers at 135 to avoid an error in code
            if(callsCounter==135) {
                clearInterval(callTimer);
            };
	};

    // Reset round
    function resetRound() {
		for(var i=1; i<callNumbersBag.length; i++) {
			callNumbersBag[i] = false;
		};
        randomPicksDb.remove();
        clearInterval(callTimer);
        alreadyCalledArray = [];
        callsCounter=0;
	};

    // BUTTON EVENT TRACKERS ///////////////////////////////////////////////////////////////////////////////
    // /////////////////////////////////////////////////////////////////////////////////////////////////////
    
    // Kicks off round when kick-off button is pushed
    $("#round-kickoff").on("click", function () {
        event.preventDefault();
        alreadyCalledArray = [];
        KickoffDb.child("ready2Play").set(true);
        setTimeout(newRound,27000);
    });

    // Clears numbers database when button is pushed
    $("#clear-numbers-database").on("click", function () {
        event.preventDefault();
        $("#numbers-drawn").empty();
        randomPicksDb.remove();
        clearInterval(callTimer);
        alreadyCalledArray = [];
        callsCounter=0;
    });

    // Clears players database when button is pushed
    $("#clear-players-database").on("click", function () {
        event.preventDefault();
        activePlayerDb.remove();
    });
    
    // FIREBASE EVENT TRACKERS /////////////////////////////////////////////////////////////////////////////
    // /////////////////////////////////////////////////////////////////////////////////////////////////////
    
    randomPicksDb.on("child_added", function(snap) {
        var numberDrawn = snap.val();
        alreadyCalledArray.push(numberDrawn);
        $("#numbers-drawn").empty();
        $("#numbers-drawn").text(alreadyCalledArray.join("  .  "));
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
            clearInterval(callTimer);
            randomPicksDb.remove();
            callsCounter=0;
            $("#numbers-drawn").empty();
        };
    });

    // Keep track of number of live connections and trigger game when number of connections reaches 3
    connectedRef.on("value", function(snap) {

        // If they are connected..
        if (snap.val()) {

            // Add user to the connections list.
            var con = connectionsRef.push(true);
            // Remove user from the connection list when they disconnect.
            con.onDisconnect().remove();
        };
    });

    // When first loaded or when the connections list changes...
    connectionsRef.on("value", function(snap) {

        // Display the viewer count in the html.
        // The number of online users is the number of children in the connections list.
        livePlayers = parseInt(snap.numChildren()-1);
        $("#connected-viewers").text(livePlayers);

        // Kickoff button is enabled when there are three live players or more
        if (livePlayers > 2) {
            console.log("game on!");
            $("#round-kickoff").prop("disabled", false);
        } else {
            $("#round-kickoff").prop("disabled", true);
        };
    });

    // STARTUP PROCESS (if any ) ///////////////////////////////////////////////////////////////////////////
	// /////////////////////////////////////////////////////////////////////////////////////////////////////

});
