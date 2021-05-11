var latitude;
var longitude;

//function to assess distance between locations
const findProximity = function(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const delta1  = lat1 * Math.PI/180; // φ, λ in radians
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
	    Math.cos(delta1) * Math.cos(φ2) *
	    Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // in metres
  return d;
}

const geoError = function() {
  console.log("geolocation error'd");
}

//function called when user has enabled location
const geoSuccess = function(position) {
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;
  storesWithinXMeters(10000, latitude, longitude);
  
};
//builds "Near Me" div
const storesWithinXMeters= function(maxDistance, latitude, longitude) {
  document.querySelector(".body-container").innerHTML+=`
    <div class='swiper-near-me-container' style='margin: 5vw; overflow-x: hidden;'> <div class='swiper-wrapper' id='near-me-wrapper'></div></div>
  `;
  fetchData('getstores/', function(response) {
      console.log(response.data);
       response.data.forEach(
         (element) => {
           if (findProximity(parseFloat(latitude), parseFloat(longitude), parseFloat(element.latitude), parseFloat(element.longitude)) <= maxDistance) {
             document.querySelector("#near-me-wrapper").innerHTML+=`
               <div class='swiper-slide'><img class='catalog-img' src="${element.image.uri}" alt="${element.name}" /></div>
             `;
           };
         }
       );
      const observer = lozad(); // lazy loads elements with default selector as '.lozad'
      observer.observe();
      addSwiper('.swiper-container', 2, 35, false);
      addSwiper('.swiper-promos-container', 1, 35, true);
      addSwiper('.swiper-near-me-container', 2, 35, false);
    }
  );
};

//asks for permission to grab user location
const grabUserLocation = function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
  } else {
    console.log("not met");
  }
};

//requests function
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

//manual clear localStorage button
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
            //adds promos slider
            addPromos();
            Object.entries(data).forEach(function(element) {
                appendData(element);
            });
        });
    }
    else {
        goBack();
    }
};

const addSwiper = function(className, numSlides, numSpace, autoPlay) {
  console.log("called");
  var swiper = new Swiper(className, {
    slidesPerView: numSlides,
    spaceBetween: numSpace,
    freeMode: true,
  });
  console.log(`added ${className}`);
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
      document.querySelector(".info-div-holder").innerHTML+="<button type='button' class='collapsible'><p class='info-title hours-title'>STORE HOURS</p></button> <div class='content'></div>";
      data.store.hours.forEach(
        function(item) {
          document.querySelector(".content").innerHTML+=`<p class='hours-title'>${item.day}: ${item.hours}</p>`;
        }
      );
      var coll = document.getElementsByClassName("collapsible");
      var i;
      for (i = 0; i < coll.length; i++) {
	coll[i].addEventListener("click", function() {
	  this.classList.toggle("active");
	  var content = this.nextElementSibling;
	  if (content.style.display === "flex") {
	    content.style.display = "none";
	  } else {
	    content.style.display = "flex";
	  }
	});
      }
  });
};

const scrollToTop = function() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
};

const addPromos = function() {
  document.querySelector(".body-container").innerHTML+="<div class='promos-container'></div>";
  document.querySelector(".promos-container").innerHTML+="<p>Latest Promotions</p>";
  document.querySelector(".promos-container").innerHTML+="<div class='swiper-promos-container' style='margin: 5vw;'><div class='swiper-wrapper' id='promos-wrapper'></div></div>";
  fetchData('getpromotions/', function(response) {
       response.data.content.forEach(
         (element) => {
           console.log(element.desc);
           document.querySelector(".swiper-wrapper").innerHTML+="<div class='swiper-slide'><div class='promo-box' onclick='makePage(getElementFromId(" + element.retailerId + "), true);'><img class='lozad catalog-img' style='width:90vw; height: 20vh; border-radius: 0;' src='" + element.banner.uri + "'/><img src='" + element.logo.uri + "' class='promo-box-logo'/></div></div>";
         }
       );
    addSwiper('.swiper-promos-container' ,1 ,35, true);
    localStorage.setItem("bodyContainerInnerHtml", document.querySelector(".body-container").innerHTML);
    });
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
      document.querySelector(".body-container").innerHTML+="<div class='swiper-container' style='margin-left: 5vw; margin-right: 5vw; width: 100vw;'> <div class='swiper-wrapper' id='category-" + element.categoryId + "'></div></div>";
      categoriesSoFar.push("category-" + element.categoryId);
    }
    var lastCategoryArr = document.querySelector("#" + categoriesSoFar[categoriesSoFar.length - 1]);
    lastCategoryArr.innerHTML+="<div class='swiper-slide'><img class='lozad catalog-img' data-src='" + element.image.uri + "' onclick='makePage(" + element_stringified + ", false);' /></div>";
  }
  );
  
  const observer = lozad(); // lazy loads elements with default selector as '.lozad'
  observer.observe();
  addSwiper('.swiper-container', 2, 35, false);
  localStorage.setItem("bodyContainerInnerHtml", document.querySelector(".body-container").innerHTML);
};

const makePage = function(element_string, promoClicked) {
  if(promoClicked) {
    element_string = JSON.parse(element_string);
  }
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
    document.querySelector(".container-card").innerHTML+=`
<div class='title-holder'>
  <p class='description'>${element_string.description}</p>
</div>
`;
  }
  document.querySelector(".retailer-page-container").innerHTML+=`
<div class='shop-now-container'>
  <a target='_blank' class='shop-link-${element_string.retailerId}'/>
    <div class='shop-now-div'>
      <p>shop now</p>
      <div class='circle-div'>
        <i class="fa fa-arrow-right fa-button"></i>
      </div>
    </div>
  </a>
</div>
<div class='info-div-holder'></div>
`;
  fetchWebsite(element_string.retailerId);
};

const appendData = function(jsonItem) {
  iterateThruAndAppend(jsonItem[1]);

};

const goBack  = function() {
  document.querySelector(".body-container").innerHTML=localStorage.getItem("bodyContainerInnerHtml");
  const observer = lozad(); // lazy loads elements with default selector as '.lozad'
  observer.observe();
  addSwiper('.swiper-container', 2, 35, false);
  addSwiper('.swiper-promos-container', 1, 35, true);
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
  if (newId != lastPressed) { var oldCategoryDiv = document.querySelector("#slider-id-" + lastPressed);
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

const getElementFromId = function(retailerId) {
  var arrayPosition = 0;
  var foundElement = false;
  var elementsArray = JSON.parse(localStorage.getItem("sortedCategories"));
  console.log("elements Array is ",elementsArray);
  var elementToBeReturned;
  while(!foundElement) {
    if (elementsArray[arrayPosition].retailerId == retailerId) {
      foundElement = true;
      return JSON.stringify(elementsArray[arrayPosition]);
    } else {
      arrayPosition++;
    }
  };
};


goToHomePage();
clearCacheBtn();
//grabs user location then builds "Near Me"
grabUserLocation();
