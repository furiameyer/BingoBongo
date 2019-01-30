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

    function newRound() {
        newNumber();
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

        // "true" flag ensures the number is not repeated again
        drawnNums[newNum] = true;
        
        randomPicksDb.child(`Counter ${counter}`).set(newNum);
        
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

    
    // Create Firebase event every time there is a change to the database
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
    });

    activePlayerDb.on("child_added", function(snap) {

        var newPlayer = snap.key;
        playerArray.push(newPlayer);
        
        $("#active-players").empty();
        $("#active-players").text(playerArray.join("  .  "));
    });
});
