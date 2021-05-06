const fetchData = function(endpoint, callback) {
    fetch("https://zap-spa-cors-anywhere.caprover.acuerdo.dev/https://content.zap.me/_ps/api/zap/" + endpoint,
        {
            headers:
            {
                'Content-Type': 'application/json'
            }
        }
    ).then(response => response.json()).then(callback);
}

const clearCacheBtn = function() {
    document.getElementById("clear-cache").onclick = function() {
        localStorage.clear();
        location.reload(true);
    };
}

const goToHomePage = function() {
    if (localStorage.getItem("bodyContainerInnerHtml") === null) {
        document.querySelector(".body-container").innerHTML="<div class='loader'><div class='inner one'></div><div class='inner two'></div><div class='inner three'></div></div>";
        fetchData("getviewall", function(data) {
            document.querySelector(".body-container").innerHTML="<div class='main-navbar'></div>";
            Object.entries(data).forEach(function(element) {
                appendData(element);
            });
        });
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

//returns URL string
const fetchWebsite = async function(retailerId) {
  fetchData("getdetail/" + retailerId, function(data) {
      document.querySelector(".shop-link-" + retailerId).setAttribute("href",data.details.website);
      if (data.store.address) {
      document.querySelector(".info-div-holder").innerHTML+="<p class='info-title'>STREET ADDRESS</p><p class='info-para'>" + data.store.address + "</p>";
      }
      if (data.store.phone || data.store.email) {
      document.querySelector(".info-div-holder").innerHTML+="<p class='info-title'>CONTACT DETAILS</p><p class='info-para'>" + data.store.phone + "</p><p class='info-para'>" + data.store.email + "</p>";
      }
  });
};

const scrollToTop = function() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
};

const iterateThruAndAppend = function(items) {
  items.sort((a, b) => (a.categoryId > b.categoryId) ? 1 : -1);
  localStorage.setItem("sortedCategories",JSON.stringify(items));
  categoriesSoFar=[];
  items.forEach(
  function(element) {
    element_stringified = JSON.stringify(element);
    if (categoriesSoFar.includes("category-" + element.categoryId) === false) {
      document.querySelector(".body-container").innerHTML+="<div class='category-name-container'><p class='category-para'>" + element.category  + "</p><p onclick='viewAll(" + element.categoryId + ");' class='view-all-btn'>View all</p></div>";
      document.querySelector(".body-container").innerHTML+="<div class='swiper-container' style='margin: 5vw;'> <div class='swiper-wrapper' id='category-" + element.categoryId + "'></div></div>";
      categoriesSoFar.push("category-" + element.categoryId);
    }
    var lastCategoryArr = document.querySelector("#" + categoriesSoFar[categoriesSoFar.length - 1]);
    lastCategoryArr.innerHTML+="<div class='swiper-slide'><img class='lozad catalog-img' data-src='" + element.image.uri + "' onclick='makePage(" + element_stringified + ");' /></div>";
  }
  );
  
  const observer = lozad(); // lazy loads elements with default selector as '.lozad'
  observer.observe();
  addSwiper();
  localStorage.setItem("bodyContainerInnerHtml", document.querySelector(".body-container").innerHTML);
};

const makePage = function(element_string) {
  document.querySelector(".body-container").innerHTML="";
  scrollToTop();
  document.querySelector(".body-container").innerHTML+=`
<div class='retailer-page-container'>
  <a id="back" href="#" onclick="goBack()" class="float-btn float-tl">
    <i class="fa fa-angle-left float-icon"></i>
  </a>
  <img class='page-img' src='${element_string.image.uri}' />
  <dic class='container-card'>
    <div class='title-holder'><p class='category-title' onclick='viewAll(${element_string.categoryId});'>${element_string.category.toUpperCase()}</p></div>
    <div class='title-holder' ><p class='retailer-title'>${element_string.label}</p></div>
  </div>
</div>
`;  
  if (element_string.description) {
    document.querySelector(".container-card").innerHTML+="<div class='title-holder' ><p class='description'>" + element_string.description + "</p></div>";
  }
  document.querySelector(".retailer-page-container").innerHTML+="<a target='_blank' class='shop-link-" + element_string.retailerId + "'/><div class='shop-now-container'><div class='shop-now-div'><p>shop</p><div class='circle-div'><img class='fwd-btn' src='back.svg'/></div></div></div></a>";
  document.querySelector(".retailer-page-container").innerHTML+="<div class='info-div-holder'></div>";
  fetchWebsite(element_string.retailerId);
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

const addCategorySwiper = function() {
  console.log("called");
  var categorySwiper = new Swiper('.viewall-categories-bar', {
    slidesPerView: 3,
    spaceBetween: 15,
    freeMode: true,
  });
};

//WIP
const removeAndUpdateSlider = function(newId) {
  //updates which category is selected
  var lastPressed=localStorage.getItem("lastPressed");
  document.querySelector(".grid-holder").innerHTML="";
  var allCategoryItems = JSON.parse(localStorage.getItem("sortedCategories"));
  var sortedCategories = allCategoryItems.filter(element => element.categoryId == newId);
  if (newId != lastPressed) {
    var oldCategoryDiv = document.querySelector("#slider-id-" + lastPressed);
    oldCategoryDiv.style.borderColor="grey";
    oldCategoryDiv.childNodes[0].style.color= "grey";
  }
  var selectedCategoryDiv = document.querySelector("#slider-id-" + newId);
  selectedCategoryDiv.style.borderColor= "#3e6fc1";
  selectedCategoryDiv.childNodes[0].style.color= "#3e6fc1";
  sortedCategories.forEach(
    function(retailer) {
      //document.querySelector(".viewall-categories-bar").innerHTML+="";
      document.querySelector(".grid-holder").innerHTML+="<div class='viewall-retailer-card'><img class='retailer-card-img' src='" + retailer.image.uri + "'/><div class='viewall-text-container'><p class='category-viewall-title'>" + retailer.category.toUpperCase() + "</p></div><div class='viewall-text-container'><p class='viewall-retailer-name'>" + retailer.retailer + "<p></div>" + (retailer.description ? "<div class='viewall-text-container'><p class='viewall-retailer-description'>" + retailer.description  + "</p></div>" : "") + "<div class='viewall-text-container'><div class='shop-now-btn'><p class='shop-now-text'>Shop now</p></div></div></div>";
    }
  );
  localStorage.setItem("lastPressed", newId);

  addCategorySwiper();
};

const viewAll = function(categoryId) {
  var categoriesInBar = [];
  var allCategoryItems = JSON.parse(localStorage.getItem("sortedCategories"));
  var sortedCategories = allCategoryItems.filter(element => element.categoryId == categoryId);
  localStorage.setItem("lastPressed", categoryId);
  document.querySelector(".body-container").innerHTML="";
  scrollToTop();
  document.querySelector(".body-container").innerHTML+=`
<div class='viewall-page-container'>
  <div class='viewall-categories-bar'>
    <a id="back" href="#" onclick="goBack()" class="float-btn inline-tl">
        <i class="fa fa-angle-left float-icon"></i>
    </a>
    <div class='swiper-wrapper'></div>
  </div>
</div>
`;
  allCategoryItems.forEach(
    function(retailer) {
      if ( categoriesInBar.includes(retailer.category) !== true ) {
	document.querySelector(".swiper-wrapper").innerHTML+="<div class='swiper-slide'><div class='slider-text-holder' id='slider-id-" + retailer.categoryId + "' onclick='removeAndUpdateSlider(" + retailer.categoryId + ");'><p class='slider-text'>" + retailer.category + "</p></div></div>";
	categoriesInBar.push(retailer.category);
      }
    }

  );
  document.querySelector(".viewall-page-container").innerHTML+="<div class='grid-holder'></div>";
  removeAndUpdateSlider(categoryId);
};



goToHomePage();
clearCacheBtn();
