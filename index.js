//Note: Sometimes(Not often) countries are slow to load from API, give it a sec to populate search form
'use strict'

//EVENT LISTENER FOR COUNTRY SELECTION
function watchCountrySubmit(){
  $('.country-question-form').submit(function(event){
    event.preventDefault();
    clearDiv();
    $('.js-results-holder').html('').addClass('hidden'); // Clear Previous Selection
    
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
    clearDiv();
    $('.js-results-holder').removeClass('hidden').html('');
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
  const Url="https://api.data.gov/ed/collegescorecard/v1/schools.json?";
  const query = {
        "school.name": `${searchTerm}`,
        _fields: "school.name,id,latest.cost.tuition.out_of_state,latest.cost.tuition.in_state,school.school_url,latest.student.size,latest.student.demographics.non_resident_aliens_2000,latest.student.demographics.race_ethnicity.white,latest.student.demographics.race_ethnicity.black,latest.student.demographics.race_ethnicity.hispanic,latest.student.demographics.race_ethnicity.asian",
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
      let population = data.results[`${i}`][`latest.student.size`];
      let aliens = data.results[`${i}`][`latest.student.demographics.non_resident_aliens_2000`]
      let white = data.results[`${i}`][`latest.student.demographics.race_ethnicity.white`]
      let black = data.results[`${i}`][`latest.student.demographics.race_ethnicity.black`]
      let hispanic = data.results[`${i}`][`latest.student.demographics.race_ethnicity.hispanic`]
      let asian = data.results[`${i}`][`latest.student.demographics.race_ethnicity.asian`]
      
    //Compare in state tuition and out of state tuition to see if returns null --> want to omit results that have no data
      if(college_tuition_out_state === null && college_tuition_in_state === null){
        //Exclude Results
      }
      else if(college_tuition_out_state === null){
        $(`<a href="#top"><h3 class="result_school_name result_school_name${i}"> ${college_name}</h3></a>`).appendTo('.js-results-holder');
        college_tuition_out_state = college_tuition_in_state;
      }
      else{
        $(`<a href="#top"><h3 class="result_school_name result_school_name${i}"> ${college_name}</h3></a>`).appendTo('.js-results-holder'); 
      }

      //Event Listener for apending CHOSEN school information
      $(`.result_school_name${i}`).on('click', function(){
        removeHidden();
        $('.chosen-result').addClass('fade-in').html('').append(
          `<h2>${college_name}<p>See more at - <a href="http://${college_url}" target="_blank">${college_url}</a></p></h2>
             
           <div>
              <p>Tuition in ${globalCurrencyId}</p>
              <p>${globalSymbol} ${Math.trunc(globalRate * college_tuition_out_state).toLocaleString()}</p><br>
              <p>About $${Math.trunc(college_tuition_out_state).toLocaleString()} USD</p>
           </div></br>`)
           
        $('.js-pop-info').addClass('fade-in').html('').append(
           `  <h2>Degree-Seeking Student Population<h2>
              <h3>${(population).toLocaleString()}</h3>
              <h2>Percentage of Foreign Students</h2>
              <h3>${(aliens * 100).toFixed(2)}%</h3>
              </br>`)

        $('.js-poprace-info').addClass('fade-in').html('').append(
           `<h2> Racial Demographics (Population) <h2>
               <h3>White Students<br> ${(white * 100).toFixed(2)}%</h2>
               <h3>Black Students<br> ${(black * 100).toFixed(2)}%</h2>
               <h3>Hispanic Students<br> ${(hispanic * 100).toFixed(2)}%</h2>
               <h3>Asian Students<br> ${(asian * 100).toFixed(2)}%</h2>
               </br>`)

           window.scrollTo(0,0);
           $('.js-youtube-holder').addClass('fade-in').html('');
           getDataFromYoutubeApi(`${college_name}`, displayYoutubeSearchData); 
      })
    }
      //Handles No Results
      if(data.results.length < 1){
        $('.js-results-holder').append("<p class='no-results'>No results - Try again</p>");
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
let globalCountry = undefined;

//Calls for data from country api and loads them for appending
function getCountryApi(){
  const Url="https://free.currencyconverterapi.com/api/v6/countries"
  const query = {apiKey: "0e88cf8b58cce8accbae"}
  $.getJSON(Url, query, loadCountries);
}

function loadCountries(data){
  const results = data.results;
  console.log("This is results:" + results);
  for(let countryCode in results){
    countryIdArray.push(results[countryCode].name);
    currencyIdArray.push(results[countryCode].currencyId);
    symbolArray.push(results[countryCode].currencySymbol);
  }

  //We clone our countryIdArrayClone so that index order between country, currency, symbol is unchanged when sorted alphabetically
  //Sort to get countries in alphabetical order before appending to our drop down choices
  let countryIdArrayClone = countryIdArray.slice(0, countryIdArray.length).sort();

  //Display drop down menu of countries
  for(let i=0; i<countryIdArray.length; i++){
    $('#country-choices').append(`<option value="${countryIdArrayClone[i]}"> ${countryIdArrayClone[i]} </option>`);
  }
 
    watchSubmitCountry(data);
}

//Saves user country choice
function watchSubmitCountry(){
  $('.country-question-form').submit(event => {
    event.preventDefault();
    const userSubmission =  $(`#country-choices`).val();
    globalCountry = userSubmission;
    $('#country-choices').val('');
    
//Matches country choice to currency    
function matchCurrencyId(){
    for(let i=0; i<countryIdArray.length; i++){
      if(userSubmission === countryIdArray[i]){
        globalCurrencyId = currencyIdArray[i];
        globalSymbol = symbolArray[i]; 
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
      compact:"ultra",
      apiKey: "0e88cf8b58cce8accbae"
    }
     $.getJSON(Url, query, testConversion);

    function testConversion(data){
      const rate = data[query.q];
      globalRate = rate;
      getCollegesApi();
    }
}

//__________________________________________________________________________________________________________________________________________
//Handles Youtube

const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

function getDataFromYoutubeApi(searchTerm, callback) {
  
  const query = {
    key: "AIzaSyDugJKdQUUz5eiD3aWn9_5pL8ybtaKDPno",
    part: "snippet",
    q: `${searchTerm} international students`,
    maxResults: 1
  }
  $.getJSON(YOUTUBE_SEARCH_URL, query, callback);
}

function renderResult(item) {
  return `
    <div class="result-container">
        <div class="pic-container">
            <p> <a href = "https://www.youtube.com/watch?v=${item.id.videoId}" target="_blank" alt="youtube-video"><img src= "${item.snippet.thumbnails.medium.url}" alt="thumbnail"></a> </p>
        </div>
        <div class="description-container">
            <p class="result-title"><a href = "https://www.youtube.com/watch?v=${item.id.videoId}" target="_blank" alt="youtube-video" > ${item.snippet.title}</a> </p>
            <p class="result-description"> ${item.snippet.description} </p>
            <p> Looking for more? Check out this <a href = "https://www.youtube.com/channel/${item.snippet.channelId}" target="_blank" alt="youtube-video">channel</a> 
        </div>
    </div>`
}

function displayYoutubeSearchData(data) {
  const items = data.items.map((item, index) => renderResult(item));
  if(data.items < 1){
      $('.js-youtube-holder').append("<h2 class='no-results'>No results - Try again</h2>");
  }
  else{
      $('.js-youtube-holder').append(items);
  }
}

//_____________________________________________________________________________________________
//Clear Previous Information or Selection
function clearDiv(){
  $('.js-youtube-holder').html('').addClass('hidden'); 
  $('.js-pop-info').html('').addClass('hidden'); 
  $('.js-poprace-info').html('').addClass('hidden'); 
  $('.chosen-result').html('').addClass('hidden'); 
}

function removeHidden(){
  $('.chosen-result').removeClass('hidden');
  $('.js-youtube-holder').removeClass('hidden');
  $('.js-pop-info').removeClass('hidden');
  $('.js-poprace-info').removeClass('hidden');
}

//_____________________________________________________________________________________________
function handleFunctions(){
  getCountryApi();
  watchCountrySubmit();
  watchSubmit();
}

$(handleFunctions);

