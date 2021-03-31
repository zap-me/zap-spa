// may need to go to https://cors-anywhere.herokuapp.com/corsdemo & click "Request temporary access"


const goToHomePage = function() {


  if (localStorage.getItem("returnedApiData") === null) {

    document.querySelector(".body-container").innerHTML="<img class='loading-img' src='loading.gif'/>";

    fetch("https://cors-anywhere.herokuapp.com/https://content.zap.me/_ps/api/zap/getviewall", 
      {
      headers: 
        {
        'Content-Type': 'application/json'
        } 
      }
    ).then(response => response.json()).then(function(data) {

    document.querySelector(".body-container").innerHTML="<div class='main-navbar'><img class='zap-logo-svg' src='zap-logo.svg'/></div>";
    Object.entries(data).forEach(

    function(element) { 
      console.log(element);
      appendData(element); 
  }

  )
  }
  );

  }

  else {
    document.querySelector(".body-container").innerHTML="<div class='main-navbar'><img class='zap-logo-svg' src='zap-logo.svg'/></div>";
    iterateThruAndAppend(JSON.parse(localStorage.getItem("returnedApiData")));
  }

};

const iterateThruAndAppend = function(items) {
  items.forEach(
  function(element) {
    element_stringified = JSON.stringify(element);
    document.querySelector(".body-container").innerHTML+="<img class='lozad catalog-img' data-src='" + element.image.uri + "' onclick='makePage(" + element_stringified + ");' />";
    const observer = lozad(); // lazy loads elements with default selector as '.lozad'
    observer.observe();
  }
  );
};

const makePage = function(element_string) {
  console.log(element_string.image.uri);
  document.querySelector(".body-container").innerHTML="";
  document.querySelector(".body-container").innerHTML+="<div class='header-navbar'><div class='back-img-container' onclick='goToHomePage();' ><img class='back-img' src='back.svg'  /></div></div>";
  document.querySelector(".body-container").innerHTML+="<img class='page-img' src='" + element_string.image.uri + "' />";
  document.querySelector(".body-container").innerHTML+="<div class='title-holder' ><p class='category-title'>" + element_string.category + "</p></div>";
  document.querySelector(".body-container").innerHTML+="<div class='title-holder' ><p class='retailer-title'>" + element_string.label + "</p></div>";
  if (element_string.description) {
    document.querySelector(".body-container").innerHTML+="<div class='title-holder' ><p class='description'>" + element_string.description + "</p></div>";
  }
};

const appendData = function(jsonItem) {
  localStorage.setItem("returnedApiData", JSON.stringify(jsonItem[1]));
  iterateThruAndAppend(jsonItem[1]);

};



goToHomePage();
