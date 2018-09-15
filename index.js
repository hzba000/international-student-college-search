const Url="https://api.data.gov/ed/collegescorecard/v1/schools.json?";
let counter = 0;

//EVENT LISTENER FOR COUNTRY SELECTION -- PROMPT COLLEGE SEARCH FORM
function watchCountrySubmit(){
  $('.country-question-form').submit(function(event){
    event.preventDefault();
    $('.college-search-container').removeClass('hidden'); //Make College Search Bar Appear

  
    watchSubmit();
  })
}

//EVENT LISTENER FOR COLLEGE SEARCH FORM -- When user submits, store their query, and send query to getCollegesAPI() and watchSubmit()
function watchSubmit(){
  $('#js-search-form').submit(function(event) {
    event.preventDefault();
    const userSubmission = $('.js-search-box').val();
    $('.js-search-box').val('');
      getCollegesApi(userSubmission);
      forwardButton(userSubmission);
      backButton(userSubmission);
      $('.navigation-buttons').removeClass('hidden'); //Make Navigation Buttons Appear
    });
}
//GET COLLEGES API() makes JSON call for data
//LOAD COLLEGES() takes data and renders it to screen
function getCollegesApi(searchTerm){
  
  query = {
        "school.name": `${searchTerm}`,
        _fields: "school.name,id,latest.cost.tuition.out_of_state,latest.cost.tuition.in_state",
        api_key: "8P336smWdRHaUwK6gjNbmGzeaoRDEqyIt16jEInQ",
        _page: `${counter}`,
        _per_page: "10"
  }
  $.getJSON(Url, query, loadColleges);


  function loadColleges(data){
    // console.log(data.results);
    $(`.js-results-holder`).html('');
    for(i=0; i<data.results.length; i++){
      let college_tuition = data.results[`${i}`][`latest.cost.tuition.out_of_state`];
      $(`<p> ${data.results[`${i}`][`school.name`]}</p><p>Out-of-State College Tuition: $${Math.trunc(college_tuition).toLocaleString()} USD </p><p>Converted tuition is: ${globalSymbol} ${Math.trunc(globalRate * college_tuition).toLocaleString()} ${globalCurrencyId}</p></br>`).appendTo('.js-results-holder');
      console.log(`Converted tuition is: ${globalSymbol}${Math.trunc(globalRate * college_tuition)} ${globalCurrencyId}`);
      }
 
} 
}

//___________________________________________________________________________
// CURRENCY CONVERTER STARTS HERE

const countryIdArray = [];
const currencyIdArray = [];
const symbolArray = [];
let globalRate = 0;
let globalCurrencyId = null;
let globalSymbol = null;

function getCountryApi(){
  const Url="https://free.currencyconverterapi.com/api/v6/countries"
  query = {}
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
    console.log(`Country: ${countryChoice}`);
    
    function matchCurrencyId(){
    for(i=0; i<countryIdArray.length; i++){
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

function getConverterApi(currencyIdValue, globalSymbolValue){
  const Url="https://free.currencyconverterapi.com/api/v6/convert"

  query = {
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
function forwardButton(searchTerm){
  $('.btn').click(function(){
    counter++;
    getCollegesApi(searchTerm);
  })
}

function backButton(searchTerm){
  $('.backbtn').click(function(){
    counter--;
    counter = Math.max(counter, 0);
    getCollegesApi(searchTerm);
  })
}

//Very similar to loadColleges(), renders it to screen
function getCollegesByState(data){
    $('.js-results-holder').html('');
    for(i=0; i<data.results.length; i++){
      $(`<p> ${data.results[`${i}`][`school.name`]} </p>`).appendTo('.js-results-holder');
      }

    console.log(data.results);
}

//____________________________________________________________________________________________________________

function handleFunctions(){
  getCountryApi();
  watchCountrySubmit();
  getCollegesApi();

}

$(handleFunctions);



