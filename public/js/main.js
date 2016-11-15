'use strict';

$(document).ready(function () {

    $('#setButton').click(function () {
        var action;
        $('#BlockVoteoptions option').each(function () {
            // console.log('we gettin it ' + $(this).val());
            if ($(this).is(':selected')) {
                action = $(this).val();
            }
        });
        var electionType;
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
    });
});

var brexitElection = '\n\t<div class="row electionChoices">\n            <input type="radio" name="vote" value="yes" checked> Yes\n            <br>\n            <input type="radio" name="vote" value="no"> No</div>\n';

var laptopElection = '\n\t<div>\n\t\t<p> Laptop Election is not available yet.</p>\n\t</div>\n';

var cuisineElection = '\n\t<div>\n\t\t<p> Cuisine Election is not available yet.</p>\n\t</div>\n';

var Votingform = '\n <!-- Voting form  -->\n    <form action="http://localhost:3000/vote" method="post">\n        <div class="row">\n            <div class="three columns">\n                <label for="exampleName">Your Name (no spaces)</label>\n                <input name="enrollmentID" class="u-full-width" placeholder="JohnSnow" id="exampleName">\n            </div>\n        </div>\n        <!-- List the choices of the election -->\n        <div class="electionsChoices">\n\n        </div>\n        <!-- Submit button -->\n        <div class="row">\n            <input class="button-primary" type="submit" value="Vote">\n        </div>\n        <div class="feedback"></div>\n    </form>\n\n';

var Queryform = '\n\t<!-- Query form -->\n    <form action="http://localhost:3000/query" method="post">\n        <div class="row">\n            <div class="six columns">\n                <label for="exampleName">Your Name (no spaces)</label>\n                <input name="enrollmentID" class="u-full-width" placeholder="JohnSnow" id="exampleName">\n            </div>\n        </div>\n        <!-- Submit button -->\n        <input class="button-primary" type="submit" value="Query">\n        <div class="feedback"></div>\n    </form>\n';

var ResultsSection = '\n\t <div class="results">\n        Reviewing of results is not avaible yet.\n        <div class="feedback"></div>\n    </div>\n';