// may need to go to https://cors-anywhere.herokuapp.com/corsdemo & click "Request temporary access"

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
  document.querySelector(".body-container").innerHTML+="<img class='page-img' src='" + element_string.image.uri + "' />";
  document.querySelector(".body-container").innerHTML+="<p class='retailer-title'>" + element_string.label + "</p>";
};

const appendData = function(jsonItem) {
  localStorage.setItem("returnedApiData", JSON.stringify(jsonItem[1]));
  iterateThruAndAppend(jsonItem[1]);

};


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

  document.querySelector(".body-container").innerHTML="";
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

 
  document.querySelector(".body-container").innerHTML="";
  iterateThruAndAppend(JSON.parse(localStorage.getItem("returnedApiData")));
}

