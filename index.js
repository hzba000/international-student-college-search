'use strict'

const Url="https://api.data.gov/ed/collegescorecard/v1/schools.json?";
let counter = 0;

//EVENT LISTENER FOR COUNTRY SELECTION -- PROMPT COLLEGE SEARCH FORM
function watchCountrySubmit(){
  $('.country-question-form').submit(function(event){
    event.preventDefault();
    $(`.chosen-result`).html(''); //Clear Previous Selection
    $(`.js-results-holder`).html(''); // Clear Previous Selection
    $('.college-search-container').removeClass('hidden'); //Make College Search Bar Appear  
    watchSubmit();
  })
}

//EVENT LISTENER FOR COLLEGE SEARCH FORM -- When user submits, store their query, and send query to getCollegesAPI() and watchSubmit()
function watchSubmit(){
  $('#js-search-form').submit(function(event) {
    event.preventDefault();
    $(`.chosen-result`).html(''); //Clear Previous Selection
    $(`.js-results-holder`).html(''); // Clear Previous Selection
    $('.results-header').removeClass('hidden');
    const userSubmission = $('.js-search-box').val();
    $('.js-search-box').val('');
      getCollegesApi(userSubmission);
      // forwardButton(userSubmission);
      // backButton(userSubmission);
      $('.navigation-buttons').removeClass('hidden'); //Make Navigation Buttons Appear
      $('.js-results-holder').addClass('fade-in');
      $('.js-results-holder').css("background-color", "lightgray");
      $(`.js-results-holder`).html('');
      $('.js-results-holder').append(`<h2>Choose your result</h2>`)

    });
}
//GET COLLEGES API() makes JSON call for data
//LOAD COLLEGES() takes data and renders it to screen
function getCollegesApi(searchTerm){
  
  const query = {
        "school.name": `${searchTerm}`,
        _fields: "school.name,id,latest.cost.tuition.out_of_state,latest.cost.tuition.in_state,school.school_url",
        api_key: "8P336smWdRHaUwK6gjNbmGzeaoRDEqyIt16jEInQ",
        _page: `${counter}`,
        _per_page: "100"
  }
  $.getJSON(Url, query, loadColleges);


  function loadColleges(data){
    // console.log(data.results);


    for(let i=0; i<data.results.length; i++){
      let college_tuition_out_state = data.results[`${i}`][`latest.cost.tuition.out_of_state`];
      let college_tuition_in_state = data.results[`${i}`][`latest.cost.tuition.in_state`];
      let college_url = data.results[`${i}`][`school.school_url`];

    //Compare in state tuition and out of state tuition to see if returns null --> want to omit results that have no data
      if(college_tuition_out_state === null && college_tuition_in_state === null){
        //Exclude Results
      }

      else if(college_tuition_out_state === null){
        $(`<p class="result_school_name result_school_name${i}"> ${data.results[`${i}`][`school.name`]}</p><p>Out-of-State College Tuition: $${Math.trunc(college_tuition_in_state).toLocaleString()} USD </p>
        <p>Converted tuition is: ${globalSymbol} ${Math.trunc(globalRate * college_tuition_in_state).toLocaleString()} ${globalCurrencyId}</p><p><a href="http://${college_url}" target="_blank">School Website</a></p></br>`).appendTo('.js-results-holder');
        console.log(`Converted tuition is: ${globalSymbol}${Math.trunc(globalRate * college_tuition_in_state)} ${globalCurrencyId}`);
      }


      else{
        $(`<p class="result_school_name result_school_name${i}"> ${data.results[`${i}`][`school.name`]}</p><p>Out-of-State College Tuition: $${Math.trunc(college_tuition_out_state).toLocaleString()} USD </p>
        <p>Converted tuition is: ${globalSymbol} ${Math.trunc(globalRate * college_tuition_out_state).toLocaleString()} ${globalCurrencyId}</p><p><a href="http://${college_url}" target="_blank">School Website</a></p></br>`).appendTo('.js-results-holder');
        console.log(`Converted tuition is: ${globalSymbol}${Math.trunc(globalRate * college_tuition_out_state)} ${globalCurrencyId}`);
        
      }

      //Event Listener for apending school information
      $(`.result_school_name${i}`).on('click', function(){
        $(`.chosen-result`).addClass('fade-in');
        $(`.chosen-result`).html('');
        $(`.chosen-result`).append(`<h2>${data.results[`${i}`][`school.name`]}</h2><div><p>Tuition in USD</p><p> $${Math.trunc(college_tuition_out_state).toLocaleString()}</p></div><span><img src="fast_Forward.png" alt="right-arrow"></span>
        <div><p>Tuition in ${globalCurrencyId}</p><p>${globalSymbol} ${Math.trunc(globalRate * college_tuition_out_state).toLocaleString()} </p></div></br>`)
      })


      // $(`<p> ${data.results[`${i}`][`school.name`]}</p><p>Out-of-State College Tuition: $${Math.trunc(college_tuition).toLocaleString()} USD </p>
      //    <p>Converted tuition is: ${globalSymbol} ${Math.trunc(globalRate * college_tuition).toLocaleString()} ${globalCurrencyId}</p><p><a href="http://${college_url}" target="_blank">School Website</a></p></br>`).appendTo('.js-results-holder');
      // console.log(`Converted tuition is: ${globalSymbol}${Math.trunc(globalRate * college_tuition)} ${globalCurrencyId}`);
      }

 
} 
}

//___________________________________________________________________________
// CURRENCY CONVERTER STARTS HERE

const countryIdArray = [];
const currencyIdArray = [];
const symbolArray = [];
let globalRate = undefined;
let globalCurrencyId = undefined;
let globalSymbol = undefined;

function getCountryApi(){
  const Url="https://free.currencyconverterapi.com/api/v6/countries"
  const query = {}
  $.getJSON(Url, query, loadCountries);
}

function loadCountries(data){
  const results = data.results;
  for(let countryCode in results){
    $(`#country-choices`).append(`<option value="${results[countryCode].name}"> ${results[countryCode].name} </option>`);
    countryIdArray.push(results[countryCode].name);
    currencyIdArray.push(results[countryCode].currencyId);
    symbolArray.push(results[countryCode].currencySymbol);
  }
  watchSubmitCountry(data);
}

function watchSubmitCountry(data){
  $(`.country-question-form`).submit(event => {
    event.preventDefault();
    const userSubmission =  $(`#country-choices`).val();
    const countryChoice = userSubmission;
    $(`#country-choices`).val('');
    console.log(`Country: ${countryChoice}`);
    
    function matchCurrencyId(){
    for(let i=0; i<countryIdArray.length; i++){
      if(userSubmission === countryIdArray[i]){
        globalCurrencyId = currencyIdArray[i];
        globalSymbol = symbolArray[i]; 
        console.log(`The currency Id is: ${globalCurrencyId}`)
        getConverterApi(globalCurrencyId);     
     }
    }}
    matchCurrencyId();
  })
}

//_________________________________________________________________________________________________________________________________________

function getConverterApi(currencyIdValue){
  const Url="https://free.currencyconverterapi.com/api/v6/convert"

  const query = {
    q: `USD_${currencyIdValue}`,
    compact:"ultra"
  }
  $.getJSON(Url, query, testConversion);

  function testConversion(data){
    console.log(data);
    const rate = data[query.q];
    console.log(`The conversion rate is: ${rate}`);
    globalRate = rate;
    getCollegesApi();

  }
}

// $(getConverterApi);

//____________PAGE TURNS START HERE_______________________________

//WHEN BUTTON CLICKED, make JSON call appropriate to page (controlled by counter)
// function forwardButton(searchTerm){
//   $('.btn').click(function(){
//     counter++;
//     getCollegesApi(searchTerm);
//   })
// }

// function backButton(searchTerm){
//   $('.backbtn').click(function(){
//     counter--;
//     counter = Math.max(counter, 0);
//     getCollegesApi(searchTerm);
//   })
// }

//Very similar to loadColleges(), renders it to screen
// function getCollegesByState(data){
//     $('.js-results-holder').html('');
//     for(let i=0; i<data.results.length; i++){
//       $(`<p> ${data.results[`${i}`][`school.name`]} </p>`).appendTo('.js-results-holder');
//       }

//     console.log(data.results);
// }
//___________________________________ANIMATIONS_________________________________________________________________________

// $("country-choices").delay(8000).animate({"opacity": "3"}, 700);
//____________________________________________________________________________________________________________

function handleFunctions(){
  getCountryApi();
  watchCountrySubmit();
  getCollegesApi();

}

$(handleFunctions);


// For when there are no results!
// if(data.results.length < 1){
//   $(`.js-results-holder`).append("<p>No more results!</p>");
// }


