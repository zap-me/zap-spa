const SWIPER_SLIDE_MARGIN_RIGHT = 0;
const SWIPER_CONTAINER_MARGIN = '5vw';

var promoPromises = [];
var isFlutterInAppWebViewReady = false;
var latitude;
var longitude;
var mapBtnPressed;

const promoIsRelevant = async function(retailerId, bannerUrl, logoUrl) {	
  return await fetchData("getdetail/" + retailerId, function(data) {	
    data.allStores.forEach(	
      function(store) {	
	var d = findProximity(latitude, longitude, parseFloat(store.lat), parseFloat(store.lng));	
        //if promoted retailer has a store 15km
	if (d <= 15000) {	
	  document.querySelector(".swiper-wrapper").innerHTML+="<div class='swiper-slide'><div class='promo-box' onclick='makePageById(" + store.retailerId + ");'><img class='lozad catalog-img' style='width:90vw; height: 40vw; border-radius: 0;' src='" + bannerUrl + "'/><img src='" + logoUrl + "' class='promo-box-logo'/></div></div>";	
          return true;	
	}	
      	
      }	
    );	
    return false;	
  }	
  );	
}


const lastElement = function(selector) {
    var eles = document.querySelectorAll(selector);
    return Array.from(eles).pop();
}

const searchItems = function() {

  var searchString = lastElement(".search-bar").value;
  if (/^\s*$/.test(searchString)) {
    lastElement(".search-bar").focus();
  }
  else {
    var layer = currentLayer();
    if (layer !== null && layer.name == 'search')
      goBack();
    layer = makeLayer('search');
    layer.innerHTML = `
  <div class="search-container">
    <a id="back" href="#" onclick="goBack()" class="float-bl float-btn">
      <i class="fa fa-angle-left float-icon"></i>
    </a>
	<input class="search-bar" type="text" placeholder="${searchString}">
	<div class="search-btn-div" onclick="searchItems();">
	  <i class="fa fa-search"></i>
	</div>
  </div>
    `;
    searchString = searchString.toLowerCase();
    console.log(`search term is ${searchString}`);
    var resultsArray = JSON.parse(localStorage.getItem("sortedCategories")).filter(
      element => element.description?.toLowerCase().includes(searchString) 
      || element.category?.toLowerCase().includes(searchString) 
      || element.retailer?.toLowerCase().includes(searchString)
    );
    layer.innerHTML += `
      <div class="search-results-container">
      </div>
    `;
    resultsArray.forEach(
      function(element) {
	document.querySelector(".search-results-container").innerHTML+=`
	  <div class="search-result-item">
	    <div class="image-holder">
	      <img class="search-result-img" src="${element.image.uri}" onerror="this.src='placeholder-square.png'" />
	    </div>
	    <div class="text-holder-result">
	      <p class="title-result">${element.retailer}</p>
	      <a target='_blank' class='shop-link-${element.retailerId}' onclick='makePageById(${element.retailerId});'/>
		<div class='shop-now-btn results-shop-btn'>
		  <div class='circle-div circle-div-hidden'></div>
		  <p class='shop-now-text'>show details</p>
		  <div class='circle-div'>
		    <i class="fa fa-arrow-right fa-button"></i>
		  </div>
		</div>
	      </a>
	    </div>
	  </div>
	`;
      }
    );

    console.log(resultsArray);
  }
}

const createMaps = function() {
  var layer = makeLayer('map');
  layer.innerHTML = `<div id="mapid"></div>`;
  layer.innerHTML += `
     <div class="maps-popup-card" style="display: none;">
       <img class="maps-popup-img" src=""/>
       <div class="location-content-container">
         <p class="location-shop-name"></p> 
         <div class="locations-card-buttons-row">
           <a target="_blank" class="directions-btn-wrapper" href="#">
	     <div class="circle-div circle-div-blue circle-div-big">
	       <i class="fa fa-map"></i>
	     </div>
           </a>
	   <div class='circle-div circle-div-blue circle-div-big' id="go-to-page-results">
	     <i class="fa fa-arrow-right fa-button"></i>
	   </div>
         </div>
       </div>
     </div>
    `;
 layer.innerHTML += `
  <a id="back" href="#" onclick="goBack()" class="float-bl float-btn">
    <i class="fa fa-angle-left float-icon"></i>
  </a>
  `;
  layer.innerHTML += `<div class='loading-container' style='display: flex;'><div class='loader'><div class='inner one'></div><div class='inner two'></div><div class='inner three'></div></div></div>`;
  grabUserLocation();

};

const scrollToBottom = function() {
  console.log("called scrollToBottom");
  setTimeout(function() {
    var layer = currentLayer();
    layer.scrollTop = layer.scrollHeight
  }, 200);
}

const fetchWebsite = async function(retailerId) {
  fetchData("getdetail/" + retailerId, function(data) {
      document.querySelector(".shop-link-" + retailerId).setAttribute("href",data.details.website);
      if (data.store.address) {
        var formattedAddress= data.store.address.replace(" ", "+");
	document.querySelector(".info-div-holder").innerHTML+=`
	  <p class='info-title'>STREET ADDRESS</p>
	  <a target="_blank" href="https://www.google.co.nz/maps/place/${formattedAddress}/">
	    <p class='info-para'>${data.store.address}</p>
	  </a>
	`;
      }
      if (data.store.phone || data.store.email) {
      document.querySelector(".info-div-holder").innerHTML+=`
        <p class='info-title'>CONTACT DETAILS</p>
        <a href="tel:${data.store.phone}">
          <p class='info-para'>${data.store.phone}</p>
        </a>
        <a href="mailto:${data.store.email}">
          <p class='info-para'>${data.store.email}</p>
        </a>
      `;
      }
      var hoursTitleAdded;
      data.store.hours.forEach(
        function(item) {
          if(item.hours != "") {
            if (!hoursTitleAdded) {
              document.querySelector(".info-div-holder").innerHTML+=`
                <div class="wrap-collabsible" onclick="scrollToBottom();">
		  <input id="collapsible" class="toggle" type="checkbox">
		  <label for="collapsible" class="lbl-toggle info-title">Hours</label>
		  <div class="collapsible-content">
		    <div class="content-inner">
		    </div>
		  </div>
		</div>
              `;
              hoursTitleAdded = true;
            }
            document.querySelector(".content-inner").innerHTML+=`<p class='hours-title info-title'>${item.day}: ${item.hours}</p>`;

          }
        }
      );
  });
};

const makePage = function(element_string, promoClicked) {
  var layer = makeLayer('shop');
  console.log(`element string is ${element_string}`);
  if(promoClicked) {
    element_string = JSON.parse(element_string);
  }
  layer.innerHTML = `
<div class='retailer-page-container'>
  <a id="back" href="#" onclick="goBack()" class="float-btn float-bl">
    <i class="fa fa-angle-left float-icon"></i>
  </a>
  <img class='page-img' src='${element_string.image.uri}' onerror="this.src='placeholder-retailer.png'" />
  <div class='container-card'>
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
<a target='_blank' class='shop-link-${element_string.retailerId}'/>
  <div class='shop-now-container'>
    <div class='shop-now-btn'>
      <div class='circle-div circle-div-hidden'></div>
      <p class='shop-now-text'>shop now</p>
      <div class='circle-div'>
        <i class="fa fa-arrow-right fa-button"></i>
      </div>
    </div>
  </div>
</a>
<div class='info-div-holder'></div>
`;
  fetchWebsite(element_string.retailerId);
};

const makePageById = function(retailerId) {
  var elementsArray = JSON.parse(localStorage.getItem("sortedCategories"));
  elementsArray.forEach(
    function(element) {
      if(element.retailerId == retailerId) {
        console.log("making near me");
        makePage(JSON.stringify(element), true);
      } 
    }
  );
};

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
  if(mapBtnPressed) {
  storesWithinXMeters(10000, latitude, longitude);
  }
  
};
//builds "Near Me" div
const storesWithinXMeters= function(maxDistance, latitude, longitude) {
  mapBtnPressed = false;
  var mymap = L.map('mapid').on("load", function(){
    document.querySelector(".loading-container").setAttribute("style", "display: none;");
  }).setView([parseFloat(latitude), parseFloat(longitude)], 13);  
  console.log(`latitude and longitude are ${parseFloat(latitude)} , ${parseFloat(longitude)}`);
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: '<a href="https://www.openstreetmap.org/copyright">Map data &copy;</a>, <a href="https://www.mapbox.com/">Imagery ©</a>',
      maxZoom: 20,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: 'pk.eyJ1IjoiZGpwbmV3dG9uIiwiYSI6ImNrbGhnNTBvcjI3dzEybnBjdXUxZzJzOGgifQ.CPseZC330Gi2_sZIBbUSDg',
  }).addTo(mymap);
  mymap.removeControl(mymap.zoomControl);
  L.control.zoom(
    {
      position: 'topright'
    }
  ).addTo(mymap);
  mymap.on("click", function(){document.querySelector(".maps-popup-card").setAttribute("style", "display: none");});
  L.marker([parseFloat(latitude), parseFloat(longitude)]).addTo(mymap);
  fetchData('getstores/', function(response) {
      console.log(response.data);
       response.data.forEach(
	 (element) => {
           if (element.image && element.latitude && element.longitude) {
	     var imageMarker = L.divIcon(
	       {
		 className: "maps-div-icon", html: `<div class="div-icon-maps"><img class="div-icon-img" src="${element.image.uri}" /></div>`,
	       }
	     );
	     L.marker([element.latitude, element.longitude], {icon: imageMarker}).addTo(mymap).on('click', function(e) {
	       console.log(`pressed ${this.name}`);
	       console.log(`index of results in ${this.name.indexOf("-")}`);
	       var formattedAddress= this.address.replace(" ", "+");
	       var name = this.name;
	       var formattedName = name.substring(0, name.indexOf("-") != -1 ? name.indexOf("-") : name.length);
	       document.querySelector(".maps-popup-card").setAttribute("style", "display: flex;");
	       document.querySelector(".maps-popup-img").setAttribute("src", this.image.uri);
	       document.querySelector(".location-shop-name").innerText= formattedName;
	       document.querySelector("#go-to-page-results").setAttribute("onclick", `makePageById(${this.retailerid});`);
	       document.querySelector(".directions-btn-wrapper").setAttribute("href", `https://www.google.co.nz/maps/place/${formattedAddress}/@${this.latitude},${this.longitude},15z/`);
	     }, element);
           }
	 }
       );
    }
  );
};

//asks for permission to grab user location
const grabUserLocation = function() {
  if (typeof window.flutter_inappwebview !== "undefined") {
    if (!isFlutterInAppWebViewReady) {
      window.setTimeout(grabUserLocation, 1000);
      return;
    }
    window.flutter_inappwebview.callHandler('getLocation').then(function(loc) {
      geoSuccess({coords: { latitude: loc.lat, longitude: loc.long }});
    });
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
  } else {
    console.log("not met");
  }
};

//requests function
const fetchData = async function(endpoint, callback) {
    await fetch("https://zap-spa-cors-anywhere.caprover.acuerdo.dev/https://content.zap.me/_ps/api/zap/" + endpoint,
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
        // backup if location.reload does not work
        setTimeout(function() {
            location.href = location.href.split('#')[0];
        }, 200);
    };
}

const openMapsBtn = function() {
    document.getElementById("open-maps").onclick = function() {
      mapBtnPressed = true;
      createMaps();
    };
}

const initBaseLayer = function() {
    var layer = makeLayer('base');
    var current = new Date();
    if ((localStorage.getItem("base-layer-content") === null)  || current.getHours() == localStorage.getItem("timeSet") - 1 ) {
        localStorage.setItem("timeSet", current.getHours());
        layer.innerHTML = "<div class='loader'><div class='inner one'></div><div class='inner two'></div><div class='inner three'></div></div>";
        fetchData("getviewall", function(data) {
            layer.innerHTML = "<div class='main-navbar'></div>";
            layer.innerHTML += `
              <div class="search-container">
                <input class="search-bar" type="text">
                <div class="search-btn-div" onclick="searchItems();">
                  <i class="fa fa-search"></i>
                </div>
              </div>
            `;
            //adds promos slider
            addPromos(layer);
            Object.entries(data).forEach(function(element) {
                appendData(layer, element);
            });
            window.setTimeout(function() {
              localStorage.setItem("base-layer-content", layer.innerHTML);
            }, 1000);
        });
    }
    else {
      layer.innerHTML = localStorage.getItem("base-layer-content");
      const observer = lozad(); // lazy loads elements with default selector as '.lozad'
      observer.observe();
      addShopsSwiper();
      addPromosSwiper();
    }
};

const addShopsSwiper = function() {
  var marginLR = (window.innerWidth * 5) / 100; // ~5vw
  var swiper = new Swiper('.swiper-container', {
    slidesPerView: 2.2,
    slidesOffsetAfter: marginLR,
    slidesOffsetBefore: marginLR,
  });
}

const addPromosSwiper = function() {
  var marginLR = (window.innerWidth * 5) / 100; // ~5vw
  var swiper = new Swiper('.swiper-promos-container', {
    slidesOffsetAfter: marginLR,
    slidesOffsetBefore: marginLR,
    autoplay: true,
  });
}

const addSwiper = function(className, numSlides, numSpace, autoPlay) {
  console.log("called");
  var swiper = new Swiper(className, {
    slidesPerView: numSlides,
    spaceBetween: numSpace,
    autoplay: autoPlay,
  });
  console.log(`added ${className}`);
};

//returns URL string

const addPromos = function(layer) {
  layer.innerHTML+=`<div class='svg-holder'><img class='svg-holder-svg' src='places.svg'/></div>`;
  layer.innerHTML+="<div class='promos-container' style='display: none;'></div>";
  document.querySelector(".promos-container").innerHTML+="<p class='tall-size'>Latest Promotions</p>";
  document.querySelector(".promos-container").innerHTML+=`<div class='swiper-promos-container'><div class='swiper-wrapper' id='promos-wrapper'></div></div>`;
  fetchData('getpromotions/', function(response) {
       response.data.content.forEach(
         (element) => {	
	   promoPromises.push(promoIsRelevant(element.retailerId, element.banner.uri, element.logo.uri));
         }
       );
    Promise.all(promoPromises).then(	
      function(results) {
        if (document.querySelector("#promos-wrapper").childElementCount !== 0) {
          addPromosSwiper();
          document.querySelector(".promos-container").setAttribute("style", "display: flex;"); 
        }
      }	
    );
    });
};

const iterateThruAndAppend = function(layer, items) {
  items.sort((a, b) => (a.categoryId > b.categoryId) ? 1 : -1);
  localStorage.setItem("sortedCategories",JSON.stringify(items));
  categoriesSoFar=[];
  items.forEach(
  function(element) {
    element_stringified = JSON.stringify(element);
    if (categoriesSoFar.includes("category-" + element.categoryId) === false) {
      layer.innerHTML+="<div class='category-name-container'><p class='category-para tall-size'>" + element.category  + "</p><p onclick='viewAll(" + element.categoryId + ");' class='view-all-btn'>View all</p></div>";
      layer.innerHTML+=`
<div class='swiper-container'>
  <div class='swiper-wrapper' id='category-${element.categoryId}'></div>
</div>
<div class='grey-space-div'></div>`;
      categoriesSoFar.push("category-" + element.categoryId);
    }
    var lastCategoryArr = document.querySelector("#" + categoriesSoFar[categoriesSoFar.length - 1]);
    lastCategoryArr.innerHTML+="<div class='swiper-slide'><img class='lozad catalog-img' data-placeholder-background='#EEEEEE' data-src='" + element.image.uri + "' onclick='makePageById(" + element.retailerId + ");' /></div>";
  }
  );
  
  const observer = lozad(); // lazy loads elements with default selector as '.lozad'
  observer.observe();
  addShopsSwiper();
};


const appendData = function(layer, jsonItem) {
  iterateThruAndAppend(layer, jsonItem[1]);

};

const currentLayer = function() {
  return document.getElementById('layers').lastChild;
}

const makeLayer = function(name) {
  var layers = document.getElementById('layers');
  var count = layers.childElementCount;
  var layer = document.createElement('div');
  layer.name = name;
  layer.className = 'layer-container';
  layer.style.zIndex = count + 10;
  layers.appendChild(layer);
  // hide map button
  if (name == 'map')
    document.getElementById('open-maps').style.display = 'none';
  return layer;
}

const goBack = function() {
  var layers = document.getElementById('layers');
  if (layers.lastChild) {
    layers.removeChild(layers.lastChild);
    // show map button
    if (layers.lastChild === null || layers.lastChild.name !== 'map')
      document.getElementById('open-maps').style.display = 'block';
  }
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
  console.log("called removeAndUpdateSlider");
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
  document.querySelector(".grid-holder").innerHTML+=`<div class='svg-holder category-svg'><img class='svg-holder-svg' src='${findSvg(newId)}'/></div>`;
  sortedCategories.forEach(
    function(retailer) {
      var retailerDesc = retailer.description ? `<div class='viewall-text-container'><p class='viewall-retailer-description'>${retailer.description}</p></div>` : "";
      document.querySelector(".grid-holder").innerHTML+=`
<div class='viewall-retailer-card'>
    <img class='retailer-card-img' src='${retailer.image.uri}'/>
    <div class='viewall-text-container'>
        <p class='category-viewall-title'>${retailer.category.toUpperCase()}</p>
    </div>
    <div class='viewall-text-container'>
        <p class='viewall-retailer-name'>${retailer.retailer}<p>
    </div>
    ${retailerDesc}
    <div class='viewall-text-container'>
      <a target='_blank' class='shop-link-${retailer.retailerId}' onclick='makePageById(${retailer.retailerId});'/>
        <div class='shop-now-btn'>
          <div class='circle-div circle-div-hidden'></div>
          <p class='shop-now-text'>show details</p>
          <div class='circle-div'>
            <i class="fa fa-arrow-right fa-button"></i>
          </div>
        </div>
      </a>
    </div>
  </a>
</div>`;
    }
  );
  localStorage.setItem("lastPressed", newId);

  addCategorySwiper();
};

const findSvg = function(categoryId) {
  console.log("called findSvg");
  switch(categoryId) {
    case 13:
      return "food.svg";
      break;
    
    case 20: 
      return "grocery.svg";
      break;

    case 2:
      return "hair.svg";
      break;

    case 16:
      return "gifts.svg";
      break;

    case 19:
      return "fitness.svg";
      break;

    case 22:
      return "services.svg";
      break;

    case 21:
      return "tattoo.svg";
      break;

    case 23:
      return "outdoors.svg";
      break;

    case 18:
      return "mobile.svg";
      break;

    default:
      return "places.svg";
      break;

  }
};

const viewAll = function(categoryId) {
  var categoriesInBar = [];
  var allCategoryItems = JSON.parse(localStorage.getItem("sortedCategories"));
  var sortedCategories = allCategoryItems.filter(element => element.categoryId == categoryId);
  localStorage.setItem("lastPressed", categoryId);
  var layer = makeLayer('category');
  layer.innerHTML = `
<div class='viewall-page-container'>
  <div class='viewall-categories-bar'>
    <a id="back" href="#" onclick="goBack()" class="float-bl float-btn">
      <i class="fa fa-angle-left float-icon"></i>
    </a>
    <div id="viewall-swiper-wrapper" class='swiper-wrapper'></div>
  </div>
</div>
`;
  allCategoryItems.forEach(
    function(retailer) {
      if ( categoriesInBar.includes(retailer.category) !== true ) {
	    document.querySelector("#viewall-swiper-wrapper").innerHTML+="<div class='swiper-slide'><div class='slider-text-holder' id='slider-id-" + retailer.categoryId + "' onclick='removeAndUpdateSlider(" + retailer.categoryId + ");'><p class='slider-text'>" + retailer.category + "</p></div></div>";
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


window.addEventListener("flutterInAppWebViewPlatformReady", function(event) {
 isFlutterInAppWebViewReady = true;
});

initBaseLayer();
grabUserLocation();
clearCacheBtn();
openMapsBtn();
window.addEventListener("keydown", function (e) { if (13 == e.keyCode) {searchItems();} })
