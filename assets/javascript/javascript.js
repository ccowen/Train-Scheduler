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
	    function ifTrainTime(){
	    	if (tMinutesTillTrain >= 1440) {
	    			return moment(nextTrain).format("MM/DD ");
	    	}
	    	else {
	    		return "";
	    	}
	    };

	    var dataTrainTime = ifTrainTime() + nextTrainTime ;

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

		function almostHere(time) {

	    	if (time <= 5) {
	    		var almostAlmost = tMinutesTillTrain + "<div id='delete'></div><div class='minutesUntilNextAlmostAlmostHere'>Almost Here</div>";
	    		return almostAlmost;
	    	}
	    	else if	(time < 20) {
	    		var almost = tMinutesTillTrain + "<div id='delete'></div><div class='minutesUntilNextAlmostHere'>In Range</div>";
	    		return almost;
			} 
			else if (time >= 20) {
				return tMinutesTillTrain + "<div id='delete'></div>";
			}

	    };

		$('#myTable').DataTable().row.add([
		  name, destination, frequency, dataTrainTime, almostHere(tMinutesTillTrain)
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

		// remove the existing rows from the table
		var table = $('#myTable').DataTable();
 
		var rows = table
		    .rows()
		    .remove()
		    .draw();

		getData() }, 5000);

});

