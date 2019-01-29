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

    // Global variables
    var randomDraw;
    var drawnNums = new Array(136)

    function newGame() {
		//Starting loop per available number
		for(var i=0; i < 135; i++) {  
			setTimeout(newNumber, 20000);
		};
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

        database.ref().push(newNum);
        console.log(newNum);
	};

	function resetGame() {
		for(var i=1; i<drawnNums.length; i++) {
			drawnNums[i] = false;
		};
		database.ref().remove();
		newGame();
	};

    // Kicks off game when kick-off button is pushed
    $("#game-kickoff").on("click", resetGame);

    // Clears numbers database when button is pushed
    $("#clear-numbers-database").on("click", function () {
        database.ref().remove();
    });

    // Reads numbers from database and populates DOM in Admin Panel

    
});
