// Create a variable to reference the database.
var database = firebase.database();

// ------------------------- functions for child_snapshot -------------------------

//if the train if not arriving in 24 hours, display the date of arrival
function ifTrainTime(minutes, nextTime){
	if (minutes >= 1440) {
			return moment(nextTime).format("MM/DD ");
	}
	else {
		return "";
	}
};

function timeConversion(minutes) {

	var hours = Math.floor(minutes/60);

	var minutesRemainderHours = minutes % 60
	
	var days = Math.floor(hours/24);

	var hoursRemainderDays = hours % 24

    if (minutes < 60) {
        return minutes + "m";
    } 
    else if (minutes < 1440 && minutesRemainderHours == 0) {
    	return hours + "h" ;
    } 
    else if (minutes < 1440) {
        return hours + "h " + minutesRemainderHours + "m";
    } 
    else if (hoursRemainderDays == 0) {
        return days + "d";
    } 
    else if (minutesRemainderHours == 0) {
        return days + "d " + hoursRemainderDays + "h";
    }
    else {
        return days + "d " + hoursRemainderDays + "h " + minutesRemainderHours + "m";
    } 
};

//display badges for trains that are close and display the delete button
function almostHere(minutesAway) {

	if (minutesAway <= 5) {
		var almostAlmost = timeConversion(minutesAway) + "<div class='delete'></div><div class='minutesUntilNextAlmostAlmostHere'>Almost Here</div>";
		return almostAlmost;
	}
	else if	(minutesAway < 20) {
		var almost = timeConversion(minutesAway) + "<div class='delete'></div><div class='minutesUntilNextAlmostHere'>In Range</div>";
		return almost;
	} 
	else if (minutesAway >= 20) {
		return timeConversion(minutesAway) + "<div class='delete'></div>";
	}

};

// ------------------------------- function to getData on timeout -------------------

function getData() {
	var query = firebase.database().ref().orderByKey();
	query.once("value")
	  .then(function(snapshot) {
	    snapshot.forEach(function(childSnapshot) {
	      // key will be "ada" the first time and "alan" the second time
	      var key = childSnapshot.key;
	      // childData will be the actual contents of the child
	      var childData = childSnapshot.val();

	// Store everything into a variable.
		var name = childSnapshot.val().name;
		var destination = childSnapshot.val().destination;
		var firstTime = childSnapshot.val().firstTime;
		var frequency = childSnapshot.val().frequency;

		var nextArrival;
		var minutesAway;

		// modify the time format
		var firstTimeConverted = moment(firstTime, "hh:mm").subtract(1, "years");

		// Current Time
	    var currentTime = moment();

	    // Difference between the times
	    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

	    // Time apart (remainder)
	    var tRemainder = diffTime % frequency;

	    // Minute Until Train
	    var tMinutesTillTrain = frequency - tRemainder;

	    // Next Train
	    var nextTrain = moment().add(tMinutesTillTrain, "minutes");
	    var nextTrainTime = moment(nextTrain).format("hh:mm A"); 

	    var dataTrainTime = ifTrainTime(tMinutesTillTrain, nextTrain) + nextTrainTime ;

		$('#myTable').DataTable().row.add([
			name, destination, timeConversion(frequency), dataTrainTime, almostHere(tMinutesTillTrain)
		]).draw();

	  });
	});
}

// ------------------------------- Capture Button Click -----------------------------

$("#addEmployee").on("click", function(event) {

      event.preventDefault();

      // Grabbed values from text boxes
      name = $("#trainName").val().trim();
      destination = $("#destination").val().trim();
      firstTime = $("#firstTime").val().trim();
      frequency = $("#frequency").val().trim();

      // Code for handling the push
      database.ref().push({
        name: name,
        destination: destination,
        firstTime: firstTime,
        frequency: frequency,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
      });

	// Clears all of the text-boxes
	$("#trainName").val("");
	$("#destination").val("");
	$("#firstTime").val("");
	$("#frequency").val("");

});

// -------------------- function for intial firebase loading ------------------

database.ref().on("child_added" , function(childSnapshot) {

	// Store everything into a variable.
	var name = childSnapshot.val().name;
	var destination = childSnapshot.val().destination;
	var firstTime = childSnapshot.val().firstTime;
	var frequency = childSnapshot.val().frequency;

	var nextArrival;
	var miutesAway;

	// modify the time format
	var firstTimeConverted = moment(firstTime, "hh:mm").subtract(1, "years");

	// Current Time
    var currentTime = moment();

    // Difference between the times
    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

    // Time apart (remainder)
    var tRemainder = diffTime % frequency;

    // Minute Until Train
    var tMinutesTillTrain = frequency - tRemainder;

    // Next Train
    var nextTrain = moment().add(tMinutesTillTrain, "minutes");
    var nextTrainTime = moment(nextTrain).format("hh:mm A"); 

    var dataTrainTime = ifTrainTime(tMinutesTillTrain, nextTrain) + nextTrainTime ;

	$('#myTable').DataTable().row.add([
	  name, destination, timeConversion(frequency), dataTrainTime, almostHere(tMinutesTillTrain)
	]).draw();

	// Handle the errors
	}, function(errorObject) {
	console.log("Errors handled: " + errorObject.code);

});


$(document).ready(function(){

    $('#myTable').DataTable();

    var table = $('#myTable').DataTable();

    $('#myTable tbody').on( 'click', '.delete', function () {
	    table
	        .row( $(this).parents('tr') )
	        .remove()
	        .draw();



	    var id = table
	    		.row( $(this).parents('tr') )
	    		.data();

	    console.log(id);
		console.log(id[0]);

	    var deleteName = id[0];

	    // missing something here

	    firebase.database().ref.child('train-time-ed210').orderByChild('name').equalTo(deleteName).remove();

		//database.ref.child(deleteName).remove();

	} );

	var myVar = setInterval(function(){ 

		// remove the existing rows from the datatable, but not firebase
		var table = $('#myTable').DataTable();
 
		var rows = table
		    .rows()
		    .remove()
		    .draw();

		/* firebase remove row
		var $row = $(this).closest('tr');

		var rowId = $row.data('id');
		rootRef.child(rowId).remove()
	    //it should remove the firebase object in here
	    rootRef.child(assetKey).remove()
	    //after firebase confirmation, remove table row */

		getData() 

	}, 60000);

});

