// Create a variable to reference the database.
var database = firebase.database();


// Initial Values
var name = "";
var destination = "";
var firstTime = "";
var frequency = "";

// Capture Button Click
$("#addEmployee").on("click", function(event) {

      event.preventDefault();

      // Grabbed values from text boxes
      name = $("#trainName").val().trim();
      destination = $("#destination").val().trim();
      firstTime = moment($("#firstTime").val().trim(), "HHmm").format("X");
      frequency = $("#frequency").val().trim();

      // Code for handling the push
      database.ref().push({
        name: name,
        destination: destination,
        firstTime: firstTime,
        frequency: frequency,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
      });

	// Alert
	alert("Employee successfully added");

	// Clears all of the text-boxes
	$("#trainName").val("");
	$("#destination").val("");
	$("#firstTime").val("");
	$("#rate").val("");

});


// Firebase watcher + initial loader HINT: This code behaves similarly to .on("value")
setInterval(function(){

  database.ref().on("child_added", function(childSnapshot) {

	console.log(childSnapshot.val());

	// Store everything into a variable.
	var name = childSnapshot.val().name;
	var destination = childSnapshot.val().destination;
	var firstTime = childSnapshot.val().firstTime;
	var frequency = childSnapshot.val().frequency;

	var nextArrival;
	var miutesAway;

	// train Info
	console.log(name);
	console.log(destination);
	console.log(firstTime);
	console.log(frequency);

	// modify the time format
	var firstTimeConverted = moment(firstTime, "hh:mm").subtract(1, "years");
	// console.log(firstTimeConverted);

	// Current Time
    var currentTime = moment();
    // console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));

    // Difference between the times
    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
    // console.log("DIFFERENCE IN TIME: " + diffTime);

    // Time apart (remainder)
    var tRemainder = diffTime % frequency;
    // console.log(tRemainder);

    // Minute Until Train
    var tMinutesTillTrain = frequency - tRemainder;
    // console.log("MINUTES TILL TRAIN: " + tMinutesTillTrain);

    // Next Train
    var nextTrain = moment().add(tMinutesTillTrain, "minutes");
    var nextTrainTime = moment(nextTrain).format("hh:mm");

	// full list of items to the well
	$("#employeeTable").append("<tr><td>" + name + 
		"</td><td>" + destination +
		"</td><td>" + frequency +
		"</td><td>" + nextTrainTime + 
		"</td><td>" + tMinutesTillTrain + 
		"</td>" );

	// Handle the errors
	}, function(errorObject) {
	console.log("Errors handled: " + errorObject.code);

  });

},60000);
