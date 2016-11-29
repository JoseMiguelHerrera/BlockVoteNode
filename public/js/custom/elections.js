var brexitElection = `
    <div class="row electionChoices">
            <p>Should the UK remain a member of the EU or leave the EU?</p>
            <input type="radio" name="vote" value="yes"> Leave EU
            <br>
            <input type="radio" name="vote" value="no"> Remain a member of the EU</div>
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

var queryFormhandler = function() {
    //Error checking 
    if (!$('input[name=enrollmentID]').val()) {
        window.alert("Please enter your name");
    }
    var submitData = {
        'enrollmentID': $('input[name=enrollmentID]').val()
    }

    //Start the querying animation 
    $('.optionCanvas').empty();
    $('.optionCanvas').append(loadingPageAnimation);
    //Submit the vote using JQuery AJAX 
    $.ajax({
        type: 'POST',
        url: URLquery,
        data: submitData
    }).done(function(data) {
        $('.optionCanvas').empty();
        var response = "<p>" + data + "</p>";
        $('.optionCanvas').append(response);
        // console.log('Finished submitting');
        console.log(data);

    });

}

var queryResultsHandler = function() {
    console.log("enter the results handler");
    //Start the querying animation 
    $('.optionCanvas').empty();
    $('.optionCanvas').append(loadingPageAnimation);

    $.ajax({
        type: 'GET',
        url: URLQueryResults
    }).done(function(data) {

        showResultsHandler(data);

        //for debugging 
        console.log(data);

    });
}

var showResultsHandler = function(data) {
    //TODO:Use D3.js on the data     
    var temp = data.split(" ");
    var yesVotes = parseInt(temp[0], 10);
    var noVotes = parseInt(temp[1], 10);
    $('.optionCanvas').empty();
    if (yesVotes >= noVotes) {
        var response1 = '<h3 class="redc">There are ' + yesVotes + " people who want UK to leave the EU</h3>";
        var response2 = '<h5>There are ' + noVotes + " people who want UK to stay in the EU </h5>";
        $('.optionCanvas').append(response1).append(response2);
    } else {
        var response2 = '<h3 class="redc">There are ' + noVotes + " people who want UK to stay in the EU </h3>";
        var response1 = '<h5>There are ' + yesVotes + " people who want UK to leave the EU</h5>";
        $('.optionCanvas').append(response2).append(response1);
    }

    // console.log('Finished submitting');
}


var ResultsSection = `
     <div class="results">
        Reviewing of results is not avaible yet.
        <div class="feedback"></div>
    </div>
`;
