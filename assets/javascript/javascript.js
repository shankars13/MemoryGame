
// Initialize Firebase
  var config = {
    apiKey: "AIzaSyB2Mk1YBwPBbpvMJWiH03tW_7VOvQgUZRk",
    authDomain: "memorygame-2608f.firebaseapp.com",
    databaseURL: "https://memorygame-2608f.firebaseio.com",
    projectId: "memorygame-2608f",
    storageBucket: "",
    messagingSenderId: "891824068583"
  };
firebase.initializeApp(config);
/*
// Initialize Firebase
var config = {
  apiKey: "AIzaSyAq5SgRcA0ceoK-AoKZ2UdIY9gVuQa7Fc8",
  authDomain: "memorygameadvanced-e394c.firebaseapp.com",
  databaseURL: "https://memorygameadvanced-e394c.firebaseio.com",
  projectId: "memorygameadvanced-e394c",
  storageBucket: "memorygameadvanced-e394c.appspot.com",
  messagingSenderId: "692414453531"
};
firebase.initializeApp(config);
*/
var dataRef = firebase.database(); 

// Initial Values
var name = "";
var comment = "";
var nPlayer = 0;
var yourPlayerId= 0;
var yourPlayerName = "";
var yourClickCount = 0;
var yourMatchCount = 0;
var player1;
var player2;
var displayDiv; // display target div


function doubleArray(array) {

  array = array.concat(array);

  console.log(array);
  return array;
}

function shuffleArray(array) {
  var n = array.length, t, i;

  while (n) {
    i = Math.floor(Math.random() * n--);
    t = array[n];
    array[n] = array[i];
    array[i] = t;
  }

  console.log(array);
  return array;
}


// Clear all data in firebase
var firebaseReset = function () {

  dataRef.ref().set({});

}

/*
// Add player into firebase
var addPlayer = function() {
  // Set players into firebase //
  // and Display message("You are player 1/2") and div(name, wins and loses) //
  var wins = 0;
  var loses = 0;
  var clickCount = 0;
  var matchCount = 0;
  // Read firebase only once to set Players
  dataRef.ref().once("value", function(snapshot) {
    if (!snapshot.child("/players/1").exists()) {
      console.log("player1 doesnt  exists");
      dataRef.ref('/players/1').set({
        name: name,
        wins: wins,
        loses: loses,
        matchCount: matchCount,
        clickCount: clickCount
      });
      player1 = name;
      yourPlayerId = 1;
    }
    else if (!snapshot.child("/players/2").exists()) {
      console.log("player2 doesnt exist");
      dataRef.ref('/players/2').set({
        name: name,
        wins: wins,
        loses: loses,
        matchCount: matchCount,
        clickCount: clickCount
      });
      player2 = name;
      yourPlayerId = 2;
    }
    console.log(yourPlayerId);
  }, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
  
}
*/

// Add countires into firebase
var addCountries = function(array) {
  //*** Set players into firebase ***//
  //*** and Display message("You are player 1/2") and div(name, wins and loses) ***//

  // Read firebase only once to set Players
  dataRef.ref().once("value", function(snapshot) {

    for (var i = 0; i < array.length; i++) {
      var flag = array[i].flag;
      var code = array[i].alpha2Code;
      var name = array[i].name;
      dataRef.ref('/countries/' + i).set({
        name: name,
        flag: flag,
        code: code,
        openFlg: 0,
        matchFlg: 0
      });

    }


  }, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
  
}

var countriesArray = [];

var getAPI = function() {

}

var resetMessages = function() {
  $("#message1").empty();
  $("#message2").empty();
}


var flip = function(i, j) {

  console.log("flip");
  console.log(i);
  console.log(j);

  dataRef.ref('/countries/' + i).update({
    openFlg: 0
  });

  dataRef.ref('/countries/' + j).update({
    openFlg: 0
  });
}


window.onclose = function(event){

  if (yourPlayerId !== 0){
    // Update "turn"
    dataRef.ref().update({
      turn: 0
    });

    dataRef.ref('/players/' + yourPlayerId).set({});
  }

}

var nextGame = function() {

    $("#message1").empty();

    dataRef.ref().update({
      totMatchCount: 0
    });

    dataRef.ref().update({
      turn: 1
    });

    dataRef.ref('/players/1').update({
      matchCount: 0,
      clickCount: 0
    });

    dataRef.ref('/players/2').update({
      matchCount: 0,
      clickCount: 0
    });


    //**** Aligning Cards API *****************************//
    var queryURL = "https://restcountries.eu/rest/v2/all?fields=name;alpha2Code;flag";

    //total number of random picks
    var totPick = 8;
    //Contains fields flag, name, alpha2Code
    var countriesPicked = [];

    // Gathering data from API
    $.ajax({
      url:queryURL,
      method: "GET"
      }).done(function(response) {
      console.log(response.length)

      for (var j=0;countriesPicked.length<totPick;j++) {
          //pick random no. b/w 1 and 250
          var tempValue = Math.floor(Math.random() * response.length);
          //make sure they are not already picked
          if (countriesPicked.includes(tempValue) === false)
            countriesPicked.push(response[tempValue]);

            console.log(countriesPicked[j]);
            console.log(countriesPicked);
      }

      //Double and Shuffle array
      countriesArray = shuffleArray(doubleArray(countriesPicked)) 
      //alignCards(countriesArray); // Aligning Cards on the table
      addCountries(countriesArray); // Insert countries to Firebase

    });// End of ajax

    //**** End of Aligning Cards ******************************//

}


window.onload = function(event) {

  resetMessages();

  //firebaseReset(); // Remove all data from firebase 

  var clickCount = 0;
  var prevObj;
  var prevId = -1;
  var isMatch = 0;
  var totMatchCount = 0;
  var isYourTurn = 0;
  var countriesArray;

  dataRef.ref().update({
    totMatchCount: 0
  });


  yourPlayerName = sessionStorage.getItem("name")
  yourPlayerId = sessionStorage.getItem("id")

  //**** Start Button Click ***//
  $("#add-user").on("click", function(event) {
    event.preventDefault();
    console.log("add-user");

    $("#loginMessage").empty();

    name = $("#name-input").val().trim();
    var wins = 0;
    var loses = 0;
    var clickCount = 0;
    var matchCount = 0;

    if (name === "" || name.match( /[^a-zA-Z0-9\s]/ )){
      $("#loginMessage").html("Input name(number or alphabet)");
    }
    else {
      // Add Player into Firebase and Display user name

      //addPlayer();

      var wins = 0;
      var loses = 0;
      var clickCount = 0;
      var matchCount = 0;

      // Read firebase only once to set Players
      dataRef.ref().once("value", function(snapshot) {

        if (!snapshot.child("/players/1").exists()) {
          console.log("player1 doesnt  exists");
          dataRef.ref('/players/1').set({
            name: name,
            wins: wins,
            loses: loses,
            matchCount: matchCount,
            clickCount: clickCount
          });

          player1 = name;
          yourPlayerId = 1;

          yourPlayerName = name;
        
          // Store all content into sessionStorage
          sessionStorage.clear();
          sessionStorage.setItem("name", name);
          sessionStorage.setItem("id", yourPlayerId);


          window.open('./main.html', '_self'); 

        }
        else if (!snapshot.child("/players/2").exists()) {
          console.log("player2 doesnt exist");
          dataRef.ref('/players/2').set({
            name: name,
            wins: wins,
            loses: loses,
            matchCount: matchCount,
            clickCount: clickCount
          });

          player2 = name;
          yourPlayerId = 2;

          yourPlayerName = name;
        
          // Store all content into sessionStorage
          sessionStorage.clear();
          sessionStorage.setItem("name", name);
          sessionStorage.setItem("id", yourPlayerId);

          window.open('./main.html', '_self'); 
        }
        else {
          $("#loginMessage").html("Someone is already gaming...");
        }
        console.log(yourPlayerId);

      }, function(errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
    }

  }); // End of Start button cliked

  //**** Delete Button Click ***//
  $("#delete-user").on("click", function(event) {
    event.preventDefault();

    dataRef.ref().once("value", function(snapshot) {

        dataRef.ref('/players').set({});

    });

  }); // End of Delete button cliked

  //**** Delete Button Click ***//
  $("#delete-p1").on("click", function(event) {
    event.preventDefault();

    dataRef.ref().once("value", function(snapshot) {

        dataRef.ref('/players/1').set({});

    });

  }); // End of Delete button cliked

  //**** Delete Button Click ***//
  $("#delete-p2").on("click", function(event) {
    event.preventDefault();

    dataRef.ref().once("value", function(snapshot) {

        dataRef.ref('/players/2').set({});

    });

  }); // End of Delete button cliked


  //**** Restart Button Click ***//
  $("#restart").on("click", function(event) {
    event.preventDefault();

    $("#message1").empty();

    dataRef.ref().update({
      totMatchCount: 0
    });

    //**** Aligning Cards API *****************************//
    var queryURL = "https://restcountries.eu/rest/v2/all?fields=name;alpha2Code;flag";

    //total number of random picks
    var totPick = 8;
    //Contains fields flag, name, alpha2Code
    var countriesPicked = [];

    // Gathering data from API
    $.ajax({
      url:queryURL,
      method: "GET"
      }).done(function(response) {
      console.log(response.length)

      for (var j=0;countriesPicked.length<totPick;j++) {
          //pick random no. b/w 1 and 250
          var tempValue = Math.floor(Math.random() * response.length);
          //make sure they are not already picked
          if (countriesPicked.includes(tempValue) === false)
            countriesPicked.push(response[tempValue]);

            console.log(countriesPicked[j]);
            console.log(countriesPicked);
      }

      //Double and Shuffle array
      countriesArray = shuffleArray(doubleArray(countriesPicked)) 
      //alignCards(countriesArray); // Aligning Cards on the table
      addCountries(countriesArray); // Insert countries to Firebase

    });// End of ajax

    //**** End of Aligning Cards ******************************//

  }); // End of Restart button cliked

  //**** Logtout Click ***//
  $("#logout").on("click", function(event) {
    event.preventDefault();
    console.log("logout");

    dataRef.ref().once("value", function(snapshot) {

        dataRef.ref('/players/' + yourPlayerId).set({});

    });
    
    window.open('./index.html', '_self'); 

  }); // End of Logout cliked

  // Watching Firebase. This only takes added child...
  dataRef.ref("/players").on("child_added", function(snapshot) {

    console.log("child_added");
    console.log(snapshot.val());
    console.log(snapshot.child("/1").exists());

    // Watching Firebase ONLY once to Check if both players exist.
    dataRef.ref().once("value", function(snapshot) {
      console.log(snapshot.child("/players/1").exists());
      console.log(snapshot.child("/players/2").exists());

      // When both of player 1 and 2
      if (snapshot.child("/players/1").exists() && snapshot.child("/players/2").exists()) {
        console.log("yourPlayerId:" + yourPlayerId)

        // Update "turn"
        dataRef.ref().update({
          turn: 1
        });


        //**** Aligning Cards API *****************************//
        var queryURL = "https://restcountries.eu/rest/v2/all?fields=name;alpha2Code;flag";

        //total number of random picks
        var totPick = 8;
        //Contains fields flag, name, alpha2Code
        var countriesPicked = [];

        // Gathering data from API
        $.ajax({
          url:queryURL,
          method: "GET"
          }).done(function(response) {
          console.log(response.length)

          for (var j=0;countriesPicked.length<totPick;j++) {
              //pick random no. b/w 1 and 250
              var tempValue = Math.floor(Math.random() * response.length);
              //make sure they are not already picked
              if (countriesPicked.includes(tempValue) === false)
                countriesPicked.push(response[tempValue]);

                console.log(countriesPicked[j]);
                console.log(countriesPicked);
          }

          //Double and Shuffle array
          countriesArray = shuffleArray(doubleArray(countriesPicked)) 
          //alignCards(countriesArray); // Aligning Cards on the table
          addCountries(countriesArray); // Insert countries to Firebase

        });// End of ajax

        //**** End of Aligning Cards ******************************//

        console.log(countriesArray);
      }

    }); // End of dataRef.ref().once("value", function(snapshot)

  }); // End of child_added on players

  // Watching Firebase.  This only takes removed child...
  dataRef.ref("/players").on("child_removed", function(snapshot) {

    console.log("child_removed");
    console.log(snapshot.val());
    console.log(snapshot.child("/1").exists());

    // Update "turn"
    dataRef.ref().update({
      turn: 0
    });

    dataRef.ref().update({
      totMatchCount: 0
    });


  });

  // Watching Firebase
  dataRef.ref().on("value", function(snapshot) {

    // Display Player2 information
    if (snapshot.child("/players/1").exists()) {

      $("#player1").html("<h2>" + snapshot.child("/players/1").val().name + "</h2>");
      $("#player1").append("<br>");
      $("#player1").append("wins:" + snapshot.child("/players/1").val().wins);
      $("#player1").append("<br>");
      $("#player1").append("loses:" + snapshot.child("/players/1").val().loses);
      $("#player1").append("<br>");
      $("#player1").append("click:" + snapshot.child("/players/1").val().clickCount);
      $("#player1").append("<br>");
      $("#player1").append("match:" + snapshot.child("/players/1").val().matchCount);

    }
    else {
      $("#player1").html("Waiting for Player 1");
    }
    
    // Display Player2 information
    if (snapshot.child("/players/2").exists()) {

      $("#player2").html("<h2>" + snapshot.child("/players/2").val().name + "</h2>");
      $("#player2").append("<br>");
      $("#player2").append("wins:" + snapshot.child("/players/2").val().wins);
      $("#player2").append("<br>");
      $("#player2").append("loses:" + snapshot.child("/players/2").val().loses);
      $("#player2").append("<br>");
      $("#player2").append("click:" + snapshot.child("/players/2").val().clickCount);
      $("#player2").append("<br>");
      $("#player2").append("match:" + snapshot.child("/players/2").val().matchCount);

    }
    else {
      $("#player2").html("Waiting for Player 2");
    }

    // Check turn
    if (snapshot.child("/turn").exists()) {

      var currentTurn = snapshot.val().turn;
      console.log("turn:" + currentTurn);
      if (yourPlayerId == currentTurn ) {
        console.log("your turn");
        $("#message2").html("You're turn");
        isYourTurn = 1;
      }
      else {
        $("#message1").html("It's not your turn. Please wait.");
        isYourTurn = 0;
      }

      if (snapshot.val().turn == 1) {

        $("#player1").css({
          'border-style': 'solid',
          'border-color': 'orange',
          'border-width': 'thick'
        });
        $("#player2").css({
          'border': 'none'
        });
      } 
      else if (snapshot.val().turn == 2) {
        $("#player1").css({
          'border': 'none'
        });
        $("#player2").css({
          'border-style': 'solid',
          'border-color': 'orange',
          'border-width': 'thick'
        });
      }
      else {
        $("#player1").css({
          'border': 'none'
        });
        $("#player2").css({
          'border': 'none'
        });

      }

      // Game End. Display result.
      if (currentTurn === 3) {

        console.log("Display result");

        // Call modal
        //$('#gameEnd').modal();

        console.log(totMatchCount);

        // Display result
        var p1name = snapshot.child('/players/1').val().name;
        var p1match = parseFloat(snapshot.child('/players/1').val().matchCount);
        var p2name = snapshot.child('/players/2').val().name;
        var p2match = parseFloat(snapshot.child('/players/2').val().matchCount);

        var p1wins = parseFloat(snapshot.child('/players/1').val().wins);
        var p1loses = parseFloat(snapshot.child('/players/1').val().loses);
        var p2wins = parseFloat(snapshot.child('/players/2').val().wins);
        var p2loses = parseFloat(snapshot.child('/players/2').val().loses);

        var result = "";

        console.log("p1match");
        console.log("p2match");

        if (p1match === p2match) {
          // Tie game
          result = "Tie game";
        }
        else if (p1match > p2match) {
          // Player 1 wins
          result = p1name + " Wins!";
        }
        else if (p1match < p2match) {
          // Player 2 wins
          result = p2name + " Wins!";
        }

        $("#message1").html(result);
        if (totMatchCount === 8) {
          if (p1match > p2match) {
            // Player 1 wins
            wins = p1wins + 1;
            loses = p2loses + 1;
            dataRef.ref('/players/1').update({
              wins: wins
            });
            dataRef.ref('/players/2').update({
              loses: loses
            });
          }
          else if (p1match < p2match) {
            // Player 2 wins
            wins = p2wins + 1;
            loses = p1loses + 1;
            dataRef.ref('/players/1').update({
              loses: loses
            });
            dataRef.ref('/players/2').update({
              wins: wins
            });
          }
        } 

        //$("#message1").html('<br><button id="restart" type="submit" value="Restart">Restart</button>'); 
        //var newDiv = $("<button>")
        //$("#message1").append(newDiv);
        //newDiv.addClass("restart");
        //newDiv.html("restart");

        setTimeout(nextGame, 1000 * 3);

      } // End of Game End

    }

    // Check countries
    console.log(countriesArray);
    //if (snapshot.child("/countries").exists()) {
      var k = 0
      for (var i = 1; i < 5; i++) {
        for (var j = 1; j < 5; j++) {
          //$("#" + i + "_" + j).html("<div class='card' id='" + k + "' data-name='" + countriesArray[k].name + "' flag-img='" + countriesArray[k].flag + "' flg='0'></div>");
          $("#" + i + "_" + j).html("<img class='card' id='" + k + "' data-name='" + snapshot.child("/countries/" + k).val().name + "' flag-img='" + snapshot.child("/countries/" + k).val().flag + "' flg='0' src='assets/images/city.jpg'></div>");
          k++;
        }
      }
    //}

  }); // End of dataRef....


  // Main logic. When the button is clicked...
  $("#panel").on("click", ".card", function(event) {
    console.log("clicked");
    
    // ONLY when your turn, you can click
    if (isYourTurn === 1) {

      console.log($(this).attr("id"));
      
      // Do not count up with either of the following condition...
      // - Same card
      // - Already matched(opened)
      console.log(prevId);
      console.log($(this).attr("flg"));

      var thisId = $(this).attr("id");

      var isOpen;

      dataRef.ref().once("value", function(snapshot) {
        //isClicked = snapshot.child('/countries/' + $(this).attr("id")).val().openFlg;
        //sMatch = snapshot.child('/countries/' + $(this).attr("id")).val().matchFlg;
        isOpen = snapshot.child('/countries/' + thisId).val().openFlg;
        isMatch = snapshot.child('/countries/' + thisId).val().matchFlg;
        totMatchCount = snapshot.val().totMatchCount;

        console.log($(this).attr("id")); // this became "unidentified" here

      });

      console.log($(this).attr("id")); // here is ok
      console.log(isOpen);
      console.log(isMatch);

      if (isOpen === 0 && isMatch === 0) {

        dataRef.ref('/countries/' + thisId).update({
          openFlg: 1
        });

      }

      if (thisId !== prevId && isOpen === 0) { // not same card and not clicked

        clickCount++;
        yourClickCount++; // do not initialize

        // Update click counter
        //clickCount = yourClickCount;
        dataRef.ref('/players/' + yourPlayerId).update({
          clickCount: yourClickCount
        });

        console.log("yourClickCount:" + yourClickCount);

        console.log(this);

        // Show country name
        $(this).html($(this).attr("data-name"));
        $(this).attr("flg","1"); // needed?
        $(this).addClass("picked");
        //$(this).html("<img src='" + $(this).attr("flag-img") + "'>");

        if (clickCount === 1) {
          prevObj = $(this);
          prevId = $(this).attr("id");
        } 

      }

      if (clickCount === 2) {

        console.log($(prevObj).attr("id"));
        console.log($(this).attr("id"));

        if ($(prevObj).attr("data-name") == $(this).attr("data-name")) { // Match

          console.log("match");

          totMatchCount++;
          console.log(totMatchCount)
          dataRef.ref().update({
            totMatchCount: totMatchCount
          });

          $(prevObj).attr("flg","1");
          $(this).attr("flg","1");
          $(this).addClass("matched");

          //isMatch = 1; // Keep playing
          yourMatchCount++;
          console.log("yourMatchCount:" + yourMatchCount);

          dataRef.ref('/countries/' + $(prevObj).attr("id")).update({
            openFlg: 1,
            matchFlg: 1
          });

          dataRef.ref('/countries/' + $(this).attr("id")).update({
            openFlg: 1,
            matchFlg: 1
          });

          //matchCount = yourMatchCount;
          dataRef.ref('/players/' + yourPlayerId).update({
            matchCount: yourMatchCount
          });

        }
        else { // Mismatch
          // Close cards when they didn't match IN 2 seconds
          console.log("Mismatch");
          //setTimeout(flip($(prevObj).attr("id"),$(this).attr("id")), 1000 * 3);
          setTimeout("flip(" + thisId + "," + prevId +")", 1000 * 2);

          $(this).removeClass("picked");
          $(prevObj).removeClass("picked");

          // Move operaiton to another player 
          console.log(yourPlayerId);
          if (yourPlayerId == 1) { // "===" doesn't work...
            console.log("1");
            dataRef.ref().update({
              turn: 2
            });
          }
          else { // yourPlayerId == 2
            dataRef.ref().update({
              turn: 1
            });
          }

        }

        console.log(totMatchCount);

        if (totMatchCount === 8){
          console.log("Game over");

          dataRef.ref().update({
            turn: 3
          });

          dataRef.ref().update({
            totMatchCount: 0
          });

          var p1name = snapshot.child('/players/1').val().name;
          var p1match = parseFloat(snapshot.child('/players/1').val().matchCount);
          var p1wins = parseFloat(snapshot.child('/players/1').val().wins);
          var p1loses = parseFloat(snapshot.child('/players/1').val().loses);
          var p2name = snapshot.child('/players/2').val().name;
          var p2match = parseFloat(snapshot.child('/players/2').val().matchCount);
          var p2wins = parseFloat(snapshot.child('/players/2').val().wins);
          var p2loses = parseFloat(snapshot.child('/players/2').val().loses);

          if (p1match > p2match) {
            // Player 1 wins
            loses = p2loses + 1;
            dataRef.ref('/players/1').update({
              wins: wins
            });
            dataRef.ref('/players/2').update({
              loses: loses
            });
          }
          else if (p1match < p2match) {
            // Player 2 wins
            wins = p2wins + 1;
            loses = p1loses + 1;
            dataRef.ref('/players/1').update({
              loses: loses
            });
            dataRef.ref('/players/2').update({
              wins: wins
            });
          }

        }

        prevId = -1; // Initialize
        clickCount = 0; // initialize
      }
      
    }// End of (isYourTurn === 1)

  }); // End of Main logic (click cards)

  // Watching Firebase and Display coutry name if its openFlg = 1.
  dataRef.ref().on("value", function(snapshot) {
    //  Showing Cards. If flg = 1, display country name.
    for (var i = 0; i < 16; i++) {
      //console.log(this);
      //console.log(i);
      if (snapshot.child('/countries/' + i).val().openFlg == "1") {
        console.log($(this));
        $("#" + i).html(snapshot.child('/countries/' + i).val().name);
        $("#" + i).attr("src", $("#" + i).attr("flag-img"));
      }
      else {
        $("#" + i).html("");
      }

    } // End of for loop

  }); // End of dataRef.ref().......


} // End of window.onload
