//Note: Sometimes(Not often) countries are slow to load from API, give it a sec to populate search form
'use strict'

const Url="https://api.data.gov/ed/collegescorecard/v1/schools.json?";
let globalCountry = undefined;

//EVENT LISTENER FOR COUNTRY SELECTION
function watchCountrySubmit(){
  $('.country-question-form').submit(function(event){
    event.preventDefault();
    $('.chosen-result').html(''); //Clear Previous Selection
    $('.js-results-holder').html(''); // Clear Previous Selection
    watchSubmit();

    //Handles Orange Check Mark for Search Forms
    $('.orange-check-school').html('');
    $('.orange-check-country').html('').append("<img src=orange_mark.png alt='orange-check-country'>");
    $('.school-search-container').addClass('fade-in').removeClass('hidden');
  })
}

//EVENT LISTENER FOR COLLEGE SEARCH FORM
function watchSubmit(){
  $('#js-search-form').submit(function(event) {
    event.preventDefault();
    $('.chosen-result').html(''); //Clear Previous Selection
    $('.js-results-holder').html('')//Clear Previous Selection
    $('.results-header').removeClass('hidden'); //Reveal Header for Results
    const userSubmission = $('#js-search-box').val(); //Save user search term to userSubmission
    $('#js-search-box').val(''); //Clear Value after saving search term
    getCollegesApi(userSubmission);
    //Sets up Results Holder
    $('.js-results-holder').addClass('fade-in').css("background-color", "peachpuff").html('').append(
          `<h2>Select a college to view tuition in currency of ${globalCountry}</h2>`)  
    //Coordinates Orange Check Mark for Search Forms
    $('.orange-check-country').html('');
    $('.orange-check-school').html('').append("<img src=orange_mark.png alt='orange-check-school'>");
  });
}

//GET COLLEGES API() makes JSON call for data
function getCollegesApi(searchTerm){
  const query = {
        "school.name": `${searchTerm}`,
        _fields: "school.name,id,latest.cost.tuition.out_of_state,latest.cost.tuition.in_state,school.school_url,school.city,school.state,school.zip",
        api_key: "8P336smWdRHaUwK6gjNbmGzeaoRDEqyIt16jEInQ",
        _per_page: "100"
  }
  
  $.getJSON(Url, query, loadColleges);

//Loads College Data
function loadColleges(data){
    for(let i=0; i<data.results.length; i++){
      //Shortens Typing when appending
      let college_tuition_out_state = data.results[`${i}`][`latest.cost.tuition.out_of_state`];
      let college_tuition_in_state = data.results[`${i}`][`latest.cost.tuition.in_state`];
      let college_url = data.results[`${i}`][`school.school_url`];
      let college_name = data.results[`${i}`][`school.name`];


    //Compare in state tuition and out of state tuition to see if returns null --> want to omit results that have no data
      if(college_tuition_out_state === null && college_tuition_in_state === null){
        //Exclude Results
      }
      else if(college_tuition_out_state === null){
        $(`<a href="#top"><h3 class="result_school_name result_school_name${i}"> ${college_name}</h3></a>`).appendTo('.js-results-holder');
        //IF NVDA is on, you can tab through results and open them with enter...if it is off, it only tabs through results and takes you to top
      }

      else{
        $(`<a href="#top"><h3 class="result_school_name result_school_name${i}"> ${college_name}</h3></a>`).appendTo('.js-results-holder'); 
      }

      //Event Listener for apending CHOSEN school information
      $(`.result_school_name${i}`).on('click', function(){
        $(`.chosen-result`).addClass('fade-in').html('').append(
          `<h2>${college_name}<p>See more at - <a href="http://${college_url}" target="_blank">${college_url}</a></p></h2>
           
           <div>
              <p>Tuition in USD</p>
              <p> $${Math.trunc(college_tuition_out_state).toLocaleString()}</p>
           </div>
           
           <span><img src="fast_Forward.png" alt="right-arrow"></span>
           
           <div>
              <p>Tuition in ${globalCurrencyId}</p>
              <p>${globalSymbol} ${Math.trunc(globalRate * college_tuition_out_state).toLocaleString()} </p>
           </div></br>`)
           window.scrollTo(0,0);
      })
    }
  } 
}

//___________________________________________________________________________
// CURRENCY CONVERTER STARTS HERE - Takes in country, matches currency, converts tuition

const countryIdArray = [];
const currencyIdArray = [];
const symbolArray = [];
let globalRate = undefined;
let globalCurrencyId = undefined;
let globalSymbol = undefined;

//Calls for data from country api and loads them for appending
function getCountryApi(){
  const Url="https://free.currencyconverterapi.com/api/v6/countries"
  const query = {}
  $.getJSON(Url, query, loadCountries);
}

function loadCountries(data){
  const results = data.results;
  for(let countryCode in results){
    $('#country-choices').append(`<option value="${results[countryCode].name}"> ${results[countryCode].name} </option>`);
    countryIdArray.push(results[countryCode].name);
    currencyIdArray.push(results[countryCode].currencyId);
    symbolArray.push(results[countryCode].currencySymbol);
  }
    watchSubmitCountry(data);
}

//Saves user country choice
function watchSubmitCountry(){
  $('.country-question-form').submit(event => {
    event.preventDefault();
    const userSubmission =  $(`#country-choices`).val();
    const countryChoice = userSubmission;
    globalCountry = userSubmission;
    $('#country-choices').val('');
    console.log(`Country: ${countryChoice}`);
    
//Matches country choice to currency    
function matchCurrencyId(){
    for(let i=0; i<countryIdArray.length; i++){
      if(userSubmission === countryIdArray[i]){
        globalCurrencyId = currencyIdArray[i];
        globalSymbol = symbolArray[i]; 
        console.log(`The currency Id is: ${globalCurrencyId}`)
        getConverterApi(globalCurrencyId);     
     }
    }
  }
    matchCurrencyId();
  })
}

//_________________________________________________________________________________________________________________________________________
//Call conversion data from converter api
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

//__________________________________________________________________________________________________________________________________________

function handleFunctions(){
  getCountryApi();
  watchCountrySubmit();
}

$(handleFunctions);

