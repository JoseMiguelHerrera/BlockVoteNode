var URLvote = "http://localhost:3000/vote"
var URLquery = "http://localhost:3000/query";
var URLQueryResults = "http://localhost:3000/queryresults";

$(document).ready(function() {

    $('#setButton').click(function() {

        setClicked();

        //Wait for user to click the submit button
        $('form').submit(function(event) {

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
            if(this.id == "queryform"){
                queryFormhandler(); 
            }

            
            // if(this.id == "")

            event.preventDefault();
        });

    })
});


var loadingPageAnimation =`
<div class="mini-loader-content">
  <svg id="mini-loader" xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500.00001 500.00001">
    <g>
      <path id="b0" d="M66.734 66.734v366.533h366.532V66.734H66.734zm15 15h336.532v336.533H81.734V81.734z">
      </path>
      <path id="b2" d="M354.16 2.5v143.34H497.5V2.5H354.16zm10 10H487.5v123.34H364.16V12.5z">
      </path>
      <path id="b1" d="M0 2.5v143.34h143.34V2.5H0zm10 10h123.34v123.34H10V12.5z">
      </path>
      <path id="b3" d="M354.16 356.66V500H497.5V356.66H354.16zm10 10H487.5V490H364.16V366.66z">
      </path>
      <path id="b4" d="M0 356.66V500h143.34V356.66H0zm10 10h123.34V490H10V366.66z">
      </path>
    </g>
  </svg>
</div>
<p>https://codepen.io/elhombretecla/pen/yOpKdr</p>

`
