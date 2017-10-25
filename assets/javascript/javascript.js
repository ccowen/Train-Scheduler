// Create a variable to reference the database.
var database = firebase.database();

// Initial Values
var name;
var destination;
var firstTime;
var frequency;
var nextArrival;
var miutesAway;

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
        return hours + "h + " + minutesRemainderHours + "m";
    } 
    else if (hoursRemainderDays == 0) {
        return days + " days";
    } 
    else if (minutesRemainderHours == 0) {
        return days + " days + " + hoursRemainderDays + "h";
    }
    else {
        return days + " days + " + hoursRemainderDays + "h + " + minutesRemainderHours + "m";
    } 
};

//display badges for trains that are close
function almostHere(minutesAway) {

	if (minutesAway <= 5) {
		var almostAlmost = timeConversion(minutesAway) + "<div id='delete'></div><div class='minutesUntilNextAlmostAlmostHere'>Almost Here</div>";
		return almostAlmost;
	}
	else if	(minutesAway < 20) {
		var almost = timeConversion(minutesAway) + "<div id='delete'></div><div class='minutesUntilNextAlmostHere'>In Range</div>";
		return almost;
	} 
	else if (minutesAway >= 20) {
		return timeConversion(minutesAway) + "<div id='delete'></div>";
	}

};

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

// function for intial firebase loading
function getData() {

	database.ref().on("child_added" , function(childSnapshot) {

		// Store everything into a variable.
		name = childSnapshot.val().name;
		destination = childSnapshot.val().destination;
		firstTime = childSnapshot.val().firstTime;
		frequency = childSnapshot.val().frequency;

		nextArrival;
		miutesAway;

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

	    /* code before added datatable code
	    function almostHere(time) {

	    	if (time <= 5)
	    		return "<td class='minutesUntilNextAlmostAlmostHere'>" + tMinutesTillTrain + "</td>";
	    	else if	(time < 30) {
				return "<td class='minutesUntilNextAlmostHere'>" + tMinutesTillTrain + "</td>"; 
			} 
			else if (time >= 30) {
				return "<td>" + tMinutesTillTrain + "</td>";
			}

	    };

		 full list of items to the well
		$("#myTableAppendHere").append("<tr><td>" + name + 
			"</td><td>" + destination +
			"</td><td>" + frequency +
			"</td><td>" + nextTrainTime + 
			"</td>" + almostHere(tMinutesTillTrain) + "</tr>"
			); */

		$('#myTable').DataTable().row.add([
		  name, destination, timeConversion(frequency), dataTrainTime, almostHere(tMinutesTillTrain)
		]).draw();

		// Handle the errors
		}, function(errorObject) {
		console.log("Errors handled: " + errorObject.code);

	});

};

$(document).ready(function(){

	getData();

    $('#myTable').DataTable();

    var table = $('#myTable').DataTable();

    $('#myTable tbody').on( 'click', '#delete', function () {
	    table
	        .row( $(this).parents('tr') )
	        .remove()
	        .draw();

	} );

	var myVar = setInterval(function(){ 

		// remove the existing rows from the datatable, but not firebase
		var table = $('#myTable').DataTable();
 
		var rows = table
		    .rows()
		    .remove()
		    .draw();

		getData() 

	}, 5000);

});

