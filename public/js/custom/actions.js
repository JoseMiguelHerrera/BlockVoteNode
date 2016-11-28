var Votingform = `
 <!-- Voting form-->

    <form id="votingform">
        <div class="row">
           
                <label for="exampleName">Enter your name</label>
                <input name="enrollmentID" class="u-full-width" placeholder="John Snow" id="exampleName">
           
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
    <form id="queryform">
        <div class="row">
            <div class="six columns">
                <label for="exampleName">Enter your name</label>
                <input name="enrollmentID" class="u-full-width" placeholder="John Snow" id="exampleName">
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
