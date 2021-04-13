// may need to go to https://cors-anywhere.herokuapp.com/corsdemo & click "Request temporary access"


const goToHomePage = function() {


  if (localStorage.getItem("bodyContainerInnerHtml") === null) {

    document.querySelector(".body-container").innerHTML="<div class='loader'><div class='inner one'></div><div class='inner two'></div><div class='inner three'></div></div>";

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
    goBack();
  }

};

const addSwiper = function() {
  console.log("called");
  var swiper = new Swiper('.swiper-container', {
    slidesPerView: 2,
    spaceBetween: 35,
    freeMode: true,
  });
};

const scrollToTop = function() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

const iterateThruAndAppend = function(items) {
  items.sort((a, b) => (a.categoryId > b.categoryId) ? 1 : -1);
  categoriesSoFar=[];
  items.forEach(
  function(element) {
    element_stringified = JSON.stringify(element);
    if (categoriesSoFar.includes("category-" + element.categoryId) === false) {
      document.querySelector(".body-container").innerHTML+="<div class='category-name-container'><p>" + element.category  + "</p></div>";
      document.querySelector(".body-container").innerHTML+="<div class='swiper-container'> <div class='swiper-wrapper' id='category-" + element.categoryId + "'></div></div>";
      categoriesSoFar.push("category-" + element.categoryId);
    }
    var lastCategoryArr = document.querySelector("#" + categoriesSoFar[categoriesSoFar.length - 1]);
    console.log(categoriesSoFar[categoriesSoFar.length - 1]);
    console.log(categoriesSoFar);
    lastCategoryArr.innerHTML+="<div class='swiper-slide'><img class='lozad catalog-img' data-src='" + element.image.uri + "' onclick='makePage(" + element_stringified + ");' /></div>";
  }
  );
  
  const observer = lozad(); // lazy loads elements with default selector as '.lozad'
  observer.observe();
  addSwiper();
  localStorage.setItem("bodyContainerInnerHtml", document.querySelector(".body-container").innerHTML);
};

const makePage = function(element_string) {
  console.log(element_string.image.uri);
  document.querySelector(".body-container").innerHTML="";
  scrollToTop();
  document.querySelector(".body-container").innerHTML+="<div class='retailer-page-container'></div>";
  document.querySelector(".retailer-page-container").innerHTML+="<div class='header-navbar'><div class='back-img-container' onclick='goBack();' ><img class='back-img' src='back.svg'  /></div></div>";
  document.querySelector(".retailer-page-container").innerHTML+="<img class='page-img' src='" + element_string.image.uri + "' />";
  document.querySelector(".retailer-page-container").innerHTML+="<dic class='container-card'></div>";
  document.querySelector(".container-card").innerHTML+="<div class='title-holder' ><p class='category-title'>" + element_string.category.toUpperCase() + "</p></div>";
  document.querySelector(".container-card").innerHTML+="<div class='title-holder' ><p class='retailer-title'>" + element_string.label + "</p></div>";
  if (element_string.description) {
    document.querySelector(".container-card").innerHTML+="<div class='title-holder' ><p class='description'>" + element_string.description + "</p></div>";
  }
};

const appendData = function(jsonItem) {
  iterateThruAndAppend(jsonItem[1]);

};

const goBack  = function() {
  document.querySelector(".body-container").innerHTML=localStorage.getItem("bodyContainerInnerHtml");
  const observer = lozad(); // lazy loads elements with default selector as '.lozad'
  observer.observe();
  addSwiper();
};



goToHomePage();
