var action;
var electionType;
var setClicked = function() {
    
    $('#BlockVoteoptions option').each(function() {
        if ($(this).is(':selected')) {
            action = $(this).val();
        }
    });
    
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
}
