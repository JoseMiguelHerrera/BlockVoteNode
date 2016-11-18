$(document).ready(function() {

    $('#setButton').click(function() {
        var action;
        $('#BlockVoteoptions option').each(function() {
            // console.log('we gettin it ' + $(this).val());
            if ($(this).is(':selected')) {
                action = $(this).val();
            }
        });
        var electionType;
        $('#availElections option').each(function() {
            if ($(this).is(':selected')) {
                electionType = $(this).val();
            }
        });
        //Set the appropriate form 
        if (action == "Vote") {

            $('.optionCanvas').empty();
            if (electionType == "Brexit") {
                $('.optionCanvas').append(Votingform);
                $('.electionsChoices').append(brexitElection);
            }
            if (electionType == "Laptop") {
                $('.optionCanvas').append(laptopElection);
            }
            if (electionType == "Cuisine") {
                $('.optionCanvas').append(cuisineElection);
            }

        }

        if (action == "ReviewVote") {

            $('.optionCanvas').empty();
            if (electionType == "Brexit") {
                 $('.optionCanvas').empty();
            $('.optionCanvas').append(Queryform);
            }
            if (electionType == "Laptop") {
                 $('.optionCanvas').append(laptopElection);
            }
            if (electionType == "Cuisine") {
                $('.optionCanvas').append(cuisineElection);
            }
        }

        if (action == "ReviewResults") {
            console.log("Display review results");
            $('.optionCanvas').empty();
            $('.optionCanvas').append(ResultsSection);
        }

    })
});


var brexitElection = `
	<div class="row electionChoices">
            <input type="radio" name="vote" value="yes" checked> Yes
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


var Votingform = `
 <!-- Voting form  -->
    <form action="http://localhost:3000/vote" method="post">
        <div class="row">
            <div class="three columns">
                <label for="exampleName">Your Name (no spaces)</label>
                <input name="enrollmentID" class="u-full-width" placeholder="JohnSnow" id="exampleName">
            </div>
        </div>
        <!-- List the choices of the election -->
        <div class="electionsChoices">

        </div>
        <!-- Submit button -->
        <div class="row">
            <input class="button-primary" type="submit" value="Vote">
        </div>
        <div class="feedback"></div>
    </form>

`;

var Queryform = `
	<!-- Query form -->
    <form action="http://localhost:3000/query" method="post">
        <div class="row">
            <div class="six columns">
                <label for="exampleName">Your Name (no spaces)</label>
                <input name="enrollmentID" class="u-full-width" placeholder="JohnSnow" id="exampleName">
            </div>
        </div>
        <!-- Submit button -->
        <input class="button-primary" type="submit" value="Query">
        <div class="feedback"></div>
    </form>
`;

var ResultsSection = `
	 <div class="results">
        Reviewing of results is not avaible yet.
        <div class="feedback"></div>
    </div>
`;
