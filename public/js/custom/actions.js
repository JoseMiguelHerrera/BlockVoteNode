var Votingform = `
 <!-- Voting form-->

    <form id="votingform">
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
    <form id="queryform">
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
