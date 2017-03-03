
var canvas = document.createElement("canvas");
canvas.setAttribute("id", "canvasPaper");
canvas.setAttribute("width", "576");
canvas.setAttribute("height", "100");
canvas.style.visibility = "hidden"; // to hide the canvas
canvas.style.display = "none"; // to not ruin the layout of the page
var hidden, visibilityChange;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
  hidden = "hidden";
  visibilityChange = "visibilitychange";
}
else if (typeof document.mozHidden !== "undefined") {
  hidden = "mozHidden";
  visibilityChange = "mozvisibilitychange";
}
else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
}
else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}

var image = ""; // When the page (and only the page) loads, the loadImages function is called.
        // once loadImages exits, the scope level "image" variable will overwrite the global variable.
        // this allows me to pass it as a parameter when I call my drawCanvas function.
        // this is a bit hacky, so hopefully you find a better solution.
        // open the Javascript Console and you'll see my dilemma a bit clearer.

document.addEventListener("DOMContentLoaded", loadImages("/images/dym-logo copy.bmp"));
//document.addEventListener("visibility", onFocusChanged());

function passPRNT() {
  drawCanvas(image);
}

function loadImages(src) {
    image = new Image();
    image.onload = function() {
  }
  image.onerror = function() {
    alert("Failed to load image."); // checking again
  }
  image.src = src;
}

function drawCanvas(image) {
  if(canvas.getContext) {
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);
  }
  var base64URL = canvas.toDataURL();
  createImgElement(base64URL);
}

function createImgElement(base64URL) {
  var imgElement = document.createElement("img");
  imgElement.setAttribute("src", base64URL);
  // imgElement.setAttribute("style", "padding-bottom: 10px;");
  createImgElementBase64(imgElement.outerHTML);
}

function createImgElementBase64(htmlElement) {
  var receipt = encodeURIComponent(htmlElement + document.getElementById("printData").innerHTML); // latter portion retrieves HTML from the DOM
  buildURLScheme(receipt);
}

function buildURLScheme(encodedReceiptBase64) {
  var urlStart = "starpassprnt://v1/print/nopreview?html=";
  //var back = "googlechrome=://"; //Chrome's URL Scheme for iOS/Android
  var back = "http://dymingenieros.herokuapp.com/captura";
  //OR
  //back = window.location.href;

  var urlEnd = "&size=3&back=" + back;

  //var testString = "<body><div><ul><li>test</li><li>test1</li><li>test2</li><li>test3</li><li>test4</li></ul><div></body>";

  var passprntURL = urlStart + encodedReceiptBase64 + urlEnd;
  //window.open(passprntURL, "");
  //OR
  window.location.href = passprntURL;
  //OR
  //document.location.assign(passprntURL);

  //window.setTimeout(function(){alert("delayed url " + window.location.href);}, 20000);
    //this might work to delay the alert long enough to get the URL but only in Safari
}
/*
function onFocusChanged() {
  if(document.hidden) {
    if (document.visibilityState == "hidden") {
      // reserved
      // for now do nothing. We don't care about hidden state
    }
  }
  else if (!document.hidden) {
    if (document.visibilityState == "visible") {
      console.log(window.location.href);
    }
  }
}
*/
