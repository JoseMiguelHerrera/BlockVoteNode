'use strict';

var Votingform = '\n <!-- Voting form-->\n\n    <form id="votingform">\n        <div class="row">\n           \n                <label for="exampleName">Enter your name</label>\n                <input name="enrollmentID" class="u-full-width" placeholder="John Snow" id="exampleName">\n           \n        </div>\n        <!-- List the choices of the election -->\n        <div class="electionsChoices">\n\n        </div>\n        <!-- Submit button -->\n        <div class="row">\n            <input class="button-primary" type="submit" value="Vote">\n        </div>\n        <div class="feedback"></div>\n    </form>\n\n';

var Queryform = '\n    <!-- Query form -->\n    <form id="queryform">\n        <div class="row">\n            <div class="six columns">\n                <label for="exampleName">Enter your name</label>\n                <input name="enrollmentID" class="u-full-width" placeholder="John Snow" id="exampleName">\n            </div>\n        </div>\n        <!-- Submit button -->\n        <input class="button-primary" type="submit" value="Query">\n        <div class="feedback"></div>\n    </form>\n';

var ResultsSection = '\n     <div class="results">\n        Reviewing of results is not avaible yet.\n        <div class="feedback"></div>\n    </div>\n';

var queryFormhandler = function queryFormhandler() {
    //Error checking 
    if (!$('input[name=enrollmentID]').val()) {
        window.alert("Please enter your name");
    }
    var submitData = {
        'enrollmentID': $('input[name=enrollmentID]').val()
    };

    //Start the querying animation 
    $('.optionCanvas').empty();
    $('.optionCanvas').append(loadingPageAnimation);
    //Submit the vote using JQuery AJAX 
    $.ajax({
        type: 'POST',
        url: URLquery,
        data: submitData
    }).done(function (data) {
        $('.optionCanvas').empty();
        var response = "<p>" + data + "</p>";
        $('.optionCanvas').append(response);
        // console.log('Finished submitting');
        console.log(data);
    });
};

var brexitElection = '\n    <div class="row electionChoices">\n            <p>Should the UK remain a member of the EU or leave the EU?</p>\n            <input type="radio" name="vote" value="yes"> Leave EU\n            <br>\n            <input type="radio" name="vote" value="no"> Remain a member of the EU</div>\n';

var laptopElection = '\n    <div>\n        <p> Laptop Election is not available yet.</p>\n    </div>\n';

var cuisineElection = '\n    <div>\n        <p> Cuisine Election is not available yet.</p>\n    </div>\n';

var brexitElectionHandler = function brexitElectionHandler() {
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

    };

    //Start submitting vote animation
    $('.optionCanvas').empty();
    $('.optionCanvas').append(loadingPageAnimation);

    //Submit the vote using JQuery AJAX 
    $.ajax({
        type: 'POST',
        url: URLvote,
        data: submitData,
        dataType: 'text'
    }).done(function (data) {
        $('.optionCanvas').empty();
        var response = "<p>" + data + "</p>";
        $('.optionCanvas').append(response);
        // console.log('Finished submitting');
        console.log(data);
    });
};

var laptopElectionHandler = function laptopElectionHandler() {};

var cuisineElectionHandler = function cuisineElectionHandler() {};

var URLvote = "http://localhost:3000/vote";
var URLquery = "http://localhost:3000/query";

$(document).ready(function () {

    $('#setButton').click(function () {

        setClicked();

        //Wait for user to click the submit button
        $('form').submit(function (event) {

            if (this.id == "votingform") {
                //use the correct handler for the election  
                switch (electionType) {
                    case "Brexit":
                        brexitElectionHandler();
                        break;
                    case "Laptop":
                        laptopElectionHandler();
                        break;
                    case "Cuisine":
                        cuisineElectionHandler();
                        break;
                }
            }
            if (this.id == "queryform") {
                queryFormhandler();
            }

            event.preventDefault();
        });
    });
});

var loadingPageAnimation = '\n<div class="mini-loader-content">\n  <svg id="mini-loader" xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500.00001 500.00001">\n    <g>\n      <path id="b0" d="M66.734 66.734v366.533h366.532V66.734H66.734zm15 15h336.532v336.533H81.734V81.734z">\n      </path>\n      <path id="b2" d="M354.16 2.5v143.34H497.5V2.5H354.16zm10 10H487.5v123.34H364.16V12.5z">\n      </path>\n      <path id="b1" d="M0 2.5v143.34h143.34V2.5H0zm10 10h123.34v123.34H10V12.5z">\n      </path>\n      <path id="b3" d="M354.16 356.66V500H497.5V356.66H354.16zm10 10H487.5V490H364.16V366.66z">\n      </path>\n      <path id="b4" d="M0 356.66V500h143.34V356.66H0zm10 10h123.34V490H10V366.66z">\n      </path>\n    </g>\n  </svg>\n</div>\n<p>https://codepen.io/elhombretecla/pen/yOpKdr</p>\n\n';

var action;
var electionType;
var setClicked = function setClicked() {

    $('#BlockVoteoptions option').each(function () {
        if ($(this).is(':selected')) {
            action = $(this).val();
        }
    });

    $('#availElections option').each(function () {
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
};