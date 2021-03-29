// may need to go to https://cors-anywhere.herokuapp.com/corsdemo & click "Request temporary access"

fetch("https://cors-anywhere.herokuapp.com/https://content.zap.me/_ps/api/zap/getviewall", 
  {
  headers: 
    {
    'Content-Type': 'application/json'
    } 
  }
).then(response => response.json()).then(data => Object.entries(data).forEach(

function(element) { 
  console.log(element);
  appendData(element); 
}

));

const appendData = function(jsonItem) {
jsonItem[1].forEach(

function(element) {

  document.querySelector(".body-container").innerHTML+="<img src='" + element.image.uri + "' />";
}

);

};
