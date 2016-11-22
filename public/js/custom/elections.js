var brexitElection = `
	<div class="row electionChoices">
            <input type="radio" name="vote" value="yes"> Yes
            <br>
            <input type="radio" name="vote" value="no"> No</div>
`;

var laptopElection = `
	<div>
		<p> Laptop Election is not available yet.</p>
	</div>
`;

var cuisineElection = `
	<div>
		<p> Cuisine Election is not available yet.</p>
	</div>
`;


var brexitElectionHandler = function() {
    //Error checking 
    if (!$('input[name=enrollmentID]').val()) {
        window.alert("Please enter your name");
    }
    if (!$('input[name=vote]:checked').val()) {
        window.alert("Please select a vote");
    }
    var submitData = {
        'enrollmentID': $('input[name=enrollmentID]').val(),
        'vote': $('input[name=vote]:checked').val()

    }

     //Start submitting vote animation
     $('.optionCanvas').empty();
     $('.optionCanvas').append(loadingPageAnimation);

    //Submit the vote using JQuery AJAX 
    $.ajax({
        type: 'POST',
        url: URLvote,
        data: submitData,
        dataType: 'text'
    }).done(function(data) {
    	$('.optionCanvas').empty();
    	var response = "<p>" + data + "</p>";
    	$('.optionCanvas').append(response);
        // console.log('Finished submitting');
        console.log(data);



       
    });




}


var laptopElectionHandler = function() {};

var cuisineElectionHandler = function() {};
