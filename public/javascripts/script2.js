
var canvasLogo = document.createElement("canvas");
canvasLogo.setAttribute("id", "canvasPaper");
canvasLogo.setAttribute("width", "576");
canvasLogo.setAttribute("height", "100");
canvasLogo.style.visibility = "hidden"; // to hide the canvasLogo
canvasLogo.style.display = "none"; // to not ruin the layout of the page

// var canvasFirma = document.createElement("canvas");
// canvasFirma.setAttribute("id", "canvasPaper");
// canvasFirma.setAttribute("width", "576");
// canvasFirma.setAttribute("height", "100");
// canvasFirma.style.visibility = "hidden"; // to hide the canvasFirma
// canvasFirma.style.display = "none";

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

var logo = ""; // When the page (and only the page) loads, the loadImages function is called.
        // once loadImages exits, the scope level "image" variable will overwrite the global variable.
        // this allows me to pass it as a parameter when I call my drawCanvas function.
        // this is a bit hacky, so hopefully you find a better solution.
        // open the Javascript Console and you'll see my dilemma a bit clearer.
var signature = "";
document.addEventListener("DOMContentLoaded", loadImages("/images/dym-logo copy.bmp"));
//document.addEventListener("visibility", onFocusChanged());

function passPRNT() {
  console.log('sending to printer')
  drawCanvas(logo);
}

function loadImages(srcLogo) {
    logo = new Image();
    logo.onload = function() {

  }
  logo.onerror = function() {
    alert("Failed to load logo."); // checking again
  }
  logo.src = srcLogo;
}


function drawCanvas(logo) {

  if(canvasLogo.getContext) {
    var context = canvasLogo.getContext("2d");
    context.clearRect(0, 0, canvasLogo.width, canvasLogo.height);
    context.drawImage(logo, 0, 0);
      var base64URLLogo = canvasLogo.toDataURL();
  }

  createImgElement(base64URLLogo);
}

function createImgElement(base64Logo) {
  // var imgFirma = document.createElement("img");
  // imgFirma.setAttribute("src", base64Firma);

    var imgLogo = document.createElement("img");
  imgLogo.setAttribute("src", base64Logo);
  // imgElement.setAttribute("style", "padding-bottom: 10px;");
  createImgElementBase64(imgLogo.outerHTML);
}

function createImgElementBase64(logo) {
  var receipt = encodeURIComponent(logo + document.getElementById("printData").innerHTML);
  console.log(receipt)
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
    console.log(passprntURL)
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
var path = 'http://dymingenieros.herokuapp.com/';

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.SignaturePad = factory());
}(this, (function () { 'use strict';

function Point(x, y, time) {
  this.x = x;
  this.y = y;
  this.time = time || new Date().getTime();
}

Point.prototype.velocityFrom = function (start) {
  return this.time !== start.time ? this.distanceTo(start) / (this.time - start.time) : 1;
};

Point.prototype.distanceTo = function (start) {
  return Math.sqrt(Math.pow(this.x - start.x, 2) + Math.pow(this.y - start.y, 2));
};

function Bezier(startPoint, control1, control2, endPoint) {
  this.startPoint = startPoint;
  this.control1 = control1;
  this.control2 = control2;
  this.endPoint = endPoint;
}

// Returns approximated length.
Bezier.prototype.length = function () {
  var steps = 10;
  var length = 0;
  var px = void 0;
  var py = void 0;

  for (var i = 0; i <= steps; i += 1) {
    var t = i / steps;
    var cx = this._point(t, this.startPoint.x, this.control1.x, this.control2.x, this.endPoint.x);
    var cy = this._point(t, this.startPoint.y, this.control1.y, this.control2.y, this.endPoint.y);
    if (i > 0) {
      var xdiff = cx - px;
      var ydiff = cy - py;
      length += Math.sqrt(xdiff * xdiff + ydiff * ydiff);
    }
    px = cx;
    py = cy;
  }

  return length;
};

/* eslint-disable no-multi-spaces, space-in-parens */
Bezier.prototype._point = function (t, start, c1, c2, end) {
  return start * (1.0 - t) * (1.0 - t) * (1.0 - t) + 3.0 * c1 * (1.0 - t) * (1.0 - t) * t + 3.0 * c2 * (1.0 - t) * t * t + end * t * t * t;
};

function SignaturePad(canvas, options) {
  var self = this;
  var opts = options || {};

  this.velocityFilterWeight = opts.velocityFilterWeight || 0.7;
  this.minWidth = opts.minWidth || 0.5;
  this.maxWidth = opts.maxWidth || 2.5;
  this.dotSize = opts.dotSize || function () {
    return (this.minWidth + this.maxWidth) / 2;
  };
  this.penColor = opts.penColor || 'black';
  this.backgroundColor = opts.backgroundColor || 'rgba(0,0,0,0)';
  this.onBegin = opts.onBegin;
  this.onEnd = opts.onEnd;

  this._canvas = canvas;
  this._ctx = canvas.getContext('2d');
  this.clear();

  // We need add these inline so they are available to unbind while still having
  // access to 'self' we could use _.bind but it's not worth adding a dependency.
  this._handleMouseDown = function (event) {
    if (event.which === 1) {
      self._mouseButtonDown = true;
      self._strokeBegin(event);
    }
  };

  this._handleMouseMove = function (event) {
    if (self._mouseButtonDown) {
      self._strokeUpdate(event);
    }
  };

  this._handleMouseUp = function (event) {
    if (event.which === 1 && self._mouseButtonDown) {
      self._mouseButtonDown = false;
      self._strokeEnd(event);
    }
  };

  this._handleTouchStart = function (event) {
    if (event.targetTouches.length === 1) {
      var touch = event.changedTouches[0];
      self._strokeBegin(touch);
    }
  };

  this._handleTouchMove = function (event) {
    // Prevent scrolling.
    event.preventDefault();

    var touch = event.targetTouches[0];
    self._strokeUpdate(touch);
  };

  this._handleTouchEnd = function (event) {
    var wasCanvasTouched = event.target === self._canvas;
    if (wasCanvasTouched) {
      event.preventDefault();
      self._strokeEnd(event);
    }
  };

  // Enable mouse and touch event handlers
  this.on();
}

// Public methods
SignaturePad.prototype.clear = function () {
  var ctx = this._ctx;
  var canvas = this._canvas;

  ctx.fillStyle = this.backgroundColor;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  this._data = [];
  this._reset();
  this._isEmpty = true;
};

SignaturePad.prototype.fromDataURL = function (dataUrl) {
  var _this = this;

  var image = new Image();
  var ratio = window.devicePixelRatio || 1;
  var width = this._canvas.width / ratio;
  var height = this._canvas.height / ratio;

  this._reset();
  image.src = dataUrl;
  image.onload = function () {
    _this._ctx.drawImage(image, 0, 0, width, height);
  };
  this._isEmpty = false;
};

SignaturePad.prototype.toDataURL = function (type) {
  var _canvas;

  switch (type) {
    case 'image/svg+xml':
      return this._toSVG();
    default:
      for (var _len = arguments.length, options = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        options[_key - 1] = arguments[_key];
      }

      return (_canvas = this._canvas).toDataURL.apply(_canvas, [type].concat(options));
  }
};

SignaturePad.prototype.on = function () {
  this._handleMouseEvents();
  this._handleTouchEvents();
};

SignaturePad.prototype.off = function () {
  this._canvas.removeEventListener('mousedown', this._handleMouseDown);
  this._canvas.removeEventListener('mousemove', this._handleMouseMove);
  document.removeEventListener('mouseup', this._handleMouseUp);

  this._canvas.removeEventListener('touchstart', this._handleTouchStart);
  this._canvas.removeEventListener('touchmove', this._handleTouchMove);
  this._canvas.removeEventListener('touchend', this._handleTouchEnd);
};

SignaturePad.prototype.isEmpty = function () {
  return this._isEmpty;
};

// Private methods
SignaturePad.prototype._strokeBegin = function (event) {
  this._data.push([]);
  this._reset();
  this._strokeUpdate(event);

  if (typeof this.onBegin === 'function') {
    this.onBegin(event);
  }
};

SignaturePad.prototype._strokeUpdate = function (event) {
  var x = event.clientX;
  var y = event.clientY;

  var point = this._createPoint(x, y);

  var _addPoint = this._addPoint(point),
      curve = _addPoint.curve,
      widths = _addPoint.widths;

  if (curve && widths) {
    this._drawCurve(curve, widths.start, widths.end);
  }

  this._data[this._data.length - 1].push({
    x: point.x,
    y: point.y,
    time: point.time
  });
};

SignaturePad.prototype._strokeEnd = function (event) {
  var canDrawCurve = this.points.length > 2;
  var point = this.points[0];

  if (!canDrawCurve && point) {
    this._drawDot(point);
  }

  if (typeof this.onEnd === 'function') {
    this.onEnd(event);
  }
};

SignaturePad.prototype._handleMouseEvents = function () {
  this._mouseButtonDown = false;

  this._canvas.addEventListener('mousedown', this._handleMouseDown);
  this._canvas.addEventListener('mousemove', this._handleMouseMove);
  document.addEventListener('mouseup', this._handleMouseUp);
};

SignaturePad.prototype._handleTouchEvents = function () {
  // Pass touch events to canvas element on mobile IE11 and Edge.
  this._canvas.style.msTouchAction = 'none';
  this._canvas.style.touchAction = 'none';

  this._canvas.addEventListener('touchstart', this._handleTouchStart);
  this._canvas.addEventListener('touchmove', this._handleTouchMove);
  this._canvas.addEventListener('touchend', this._handleTouchEnd);
};

SignaturePad.prototype._reset = function () {
  this.points = [];
  this._lastVelocity = 0;
  this._lastWidth = (this.minWidth + this.maxWidth) / 2;
  this._ctx.fillStyle = this.penColor;
};

SignaturePad.prototype._createPoint = function (x, y, time) {
  var rect = this._canvas.getBoundingClientRect();

  return new Point(x - rect.left, y - rect.top, time || new Date().getTime());
};

SignaturePad.prototype._addPoint = function (point) {
  var points = this.points;
  var tmp = void 0;

  points.push(point);

  if (points.length > 2) {
    // To reduce the initial lag make it work with 3 points
    // by copying the first point to the beginning.
    if (points.length === 3) points.unshift(points[0]);

    tmp = this._calculateCurveControlPoints(points[0], points[1], points[2]);
    var c2 = tmp.c2;
    tmp = this._calculateCurveControlPoints(points[1], points[2], points[3]);
    var c3 = tmp.c1;
    var curve = new Bezier(points[1], c2, c3, points[2]);
    var widths = this._calculateCurveWidths(curve);

    // Remove the first element from the list,
    // so that we always have no more than 4 points in points array.
    points.shift();

    return { curve: curve, widths: widths };
  }

  return {};
};

SignaturePad.prototype._calculateCurveControlPoints = function (s1, s2, s3) {
  var dx1 = s1.x - s2.x;
  var dy1 = s1.y - s2.y;
  var dx2 = s2.x - s3.x;
  var dy2 = s2.y - s3.y;

  var m1 = { x: (s1.x + s2.x) / 2.0, y: (s1.y + s2.y) / 2.0 };
  var m2 = { x: (s2.x + s3.x) / 2.0, y: (s2.y + s3.y) / 2.0 };

  var l1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
  var l2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

  var dxm = m1.x - m2.x;
  var dym = m1.y - m2.y;

  var k = l2 / (l1 + l2);
  var cm = { x: m2.x + dxm * k, y: m2.y + dym * k };

  var tx = s2.x - cm.x;
  var ty = s2.y - cm.y;

  return {
    c1: new Point(m1.x + tx, m1.y + ty),
    c2: new Point(m2.x + tx, m2.y + ty)
  };
};

SignaturePad.prototype._calculateCurveWidths = function (curve) {
  var startPoint = curve.startPoint;
  var endPoint = curve.endPoint;
  var widths = { start: null, end: null };

  var velocity = this.velocityFilterWeight * endPoint.velocityFrom(startPoint) + (1 - this.velocityFilterWeight) * this._lastVelocity;

  var newWidth = this._strokeWidth(velocity);

  widths.start = this._lastWidth;
  widths.end = newWidth;

  this._lastVelocity = velocity;
  this._lastWidth = newWidth;

  return widths;
};

SignaturePad.prototype._strokeWidth = function (velocity) {
  return Math.max(this.maxWidth / (velocity + 1), this.minWidth);
};

SignaturePad.prototype._drawPoint = function (x, y, size) {
  var ctx = this._ctx;

  ctx.moveTo(x, y);
  ctx.arc(x, y, size, 0, 2 * Math.PI, false);
  this._isEmpty = false;
};

SignaturePad.prototype._drawCurve = function (curve, startWidth, endWidth) {
  var ctx = this._ctx;
  var widthDelta = endWidth - startWidth;
  var drawSteps = Math.floor(curve.length());

  ctx.beginPath();

  for (var i = 0; i < drawSteps; i += 1) {
    // Calculate the Bezier (x, y) coordinate for this step.
    var t = i / drawSteps;
    var tt = t * t;
    var ttt = tt * t;
    var u = 1 - t;
    var uu = u * u;
    var uuu = uu * u;

    var x = uuu * curve.startPoint.x;
    x += 3 * uu * t * curve.control1.x;
    x += 3 * u * tt * curve.control2.x;
    x += ttt * curve.endPoint.x;

    var y = uuu * curve.startPoint.y;
    y += 3 * uu * t * curve.control1.y;
    y += 3 * u * tt * curve.control2.y;
    y += ttt * curve.endPoint.y;

    var width = startWidth + ttt * widthDelta;
    this._drawPoint(x, y, width);
  }

  ctx.closePath();
  ctx.fill();
};

SignaturePad.prototype._drawDot = function (point) {
  var ctx = this._ctx;
  var width = typeof this.dotSize === 'function' ? this.dotSize() : this.dotSize;

  ctx.beginPath();
  this._drawPoint(point.x, point.y, width);
  ctx.closePath();
  ctx.fill();
};

SignaturePad.prototype._fromData = function (pointGroups, drawCurve, drawDot) {
  for (var i = 0; i < pointGroups.length; i += 1) {
    var group = pointGroups[i];

    if (group.length > 1) {
      for (var j = 0; j < group.length; j += 1) {
        var rawPoint = group[j];
        var point = new Point(rawPoint.x, rawPoint.y, rawPoint.time);

        if (j === 0) {
          // First point in a group. Nothing to draw yet.
          this._reset();
          this._addPoint(point);
        } else if (j !== group.length - 1) {
          // Middle point in a group.
          var _addPoint2 = this._addPoint(point),
              curve = _addPoint2.curve,
              widths = _addPoint2.widths;

          if (curve && widths) {
            drawCurve(curve, widths);
          }
        } else {
          // Last point in a group. Do nothing.
        }
      }
    } else {
      this._reset();
      var _rawPoint = group[0];
      drawDot(_rawPoint);
    }
  }
};

SignaturePad.prototype._toSVG = function () {
  var _this2 = this;

  var pointGroups = this._data;
  var canvas = this._canvas;
  var minX = 0;
  var minY = 0;
  var maxX = canvas.width;
  var maxY = canvas.height;
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  svg.setAttributeNS(null, 'width', canvas.width);
  svg.setAttributeNS(null, 'height', canvas.height);

  this._fromData(pointGroups, function (curve, widths) {
    var path = document.createElementNS('http;//www.w3.org/2000/svg', 'path');

    // Need to check curve for NaN values, these pop up when drawing
    // lines on the canvas that are not continuous. E.g. Sharp corners
    // or stopping mid-stroke and than continuing without lifting mouse.
    if (!isNaN(curve.control1.x) && !isNaN(curve.control1.y) && !isNaN(curve.control2.x) && !isNaN(curve.control2.y)) {
      var attr = 'M ' + curve.startPoint.x.toFixed(3) + ',' + curve.startPoint.y.toFixed(3) + ' ' + ('C ' + curve.control1.x.toFixed(3) + ',' + curve.control1.y.toFixed(3) + ' ') + (curve.control2.x.toFixed(3) + ',' + curve.control2.y.toFixed(3) + ' ') + (curve.endPoint.x.toFixed(3) + ',' + curve.endPoint.y.toFixed(3));

      path.setAttribute('d', attr);
      path.setAttributeNS(null, 'stroke-width', (widths.end * 2.25).toFixed(3));
      path.setAttributeNS(null, 'stroke', _this2.penColor);
      path.setAttributeNS(null, 'fill', 'none');
      path.setAttributeNS(null, 'stroke-linecap', 'round');

      svg.appendChild(path);
    }
  }, function (rawPoint) {
    var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    var dotSize = typeof _this2.dotSize === 'function' ? _this2.dotSize() : _this2.dotSize;
    circle.setAttributeNS(null, 'r', dotSize);
    circle.setAttributeNS(null, 'cx', rawPoint.x);
    circle.setAttributeNS(null, 'cy', rawPoint.y);
    circle.setAttributeNS(null, 'fill', _this2.penColor);

    svg.appendChild(circle);
  });

  var prefix = 'data:image/svg+xml;base64,';
  var header = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="' + minX + ' ' + minY + ' ' + maxX + ' ' + maxY + '">';
  var body = svg.innerHTML;

  // IE hack for missing innerHTML property on SVGElement
  if (body === undefined) {
    var dummy = document.createElement('dummy');
    var nodes = svg.childNodes;
    dummy.innerHTML = '';

    for (var i = 0; i < nodes.length; i += 1) {
      dummy.appendChild(nodes[i].cloneNode(true));
    }

    body = dummy.innerHTML;
  }

  var footer = '</svg>';
  var data = header + body + footer;

  return prefix + btoa(data);
};

SignaturePad.prototype.fromData = function (pointGroups) {
  var _this3 = this;

  this.clear();

  this._fromData(pointGroups, function (curve, widths) {
    return _this3._drawCurve(curve, widths.start, widths.end);
  }, function (rawPoint) {
    return _this3._drawDot(rawPoint);
  });
};

SignaturePad.prototype.toData = function () {
  return this._data;
};

return SignaturePad;

})));

var wrapper = document.getElementById("signature-pad"),
    clearButton = wrapper.querySelector("[data-action=clear]"),
    savePNGButton = wrapper.querySelector("[data-action=save-png]"),
    saveSVGButton = wrapper.querySelector("[data-action=save-svg]"),
    canvas = wrapper.querySelector("canvas"),
    signaturePad;

// Adjust canvas coordinate space taking into account pixel ratio,
// to make it look crisp on mobile devices.
// This also causes canvas to be cleared.
function resizeCanvas() {
    // When zoomed out to less than 100%, for some very strange reason,
    // some browsers report devicePixelRatio as less than 1
    // and only part of the canvas is cleared then.
    var ratio =  Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
}

window.onresize = resizeCanvas;
resizeCanvas();

signaturePad = new SignaturePad(canvas);

clearButton.addEventListener("click", function (event) {
    signaturePad.clear();
});

savePNGButton.addEventListener("click", function (event) {
    if (signaturePad.isEmpty()) {
        alert("Por favor ingrese su firma.");
    } else if ($('#pin1').val().length != 4 || $('#pin2').val().length != 4){
      alert("Por favor ingrese y confirme un número de pin.");
    } else {
      console.log(signaturePad)
        getImage(signaturePad.toDataURL());
    }
});

function getImage(data) {
console.log("getting image");
  var checkedVals = $('.acarreos:checkbox').map(function() {
    return this.value;
}).get();
  console.log(checkedVals)
  if(checkedVals.length == $('.acarreos:checkbox').length){
    var camion_id = $('#camion_id').val();
    var pin = $('#pin2').val();
    var image = $.ajax({
        url: '/api/acarreos/signature',
        type: 'POST',
        contentType: "application/json",
        data: JSON.stringify({image: data, camion_id:camion_id,pin:pin, acarreos:checkedVals})
      });

      image.done(function(data){
        console.log(data)
        if(data.photo.length>0){
           closePopup();
           var img = $('#firma').attr('src',data.photo);
           passPRNT();
        }

        });

      image.fail(function(jqXHR, textStatus, errorThrown){
          alert('Error');
      });
} else {
  passPRNT();
}

}


function autorizar(){
    var checkedVals = $('.acarreos:checkbox').map(function() {
    return this.value;
    }).get();

    if(checkedVals.length < 1){
          closePopup();
          passPRNT();
    }else {
       if($('#confirm').val() === $('#pin').val()){
            var image = $.ajax({
              url: '/api/acarreos/aprobar',
              type: 'POST',
              contentType: "application/json",
              data: JSON.stringify({acarreos:checkedVals})
            });

            image.done(function(data){
              console.log(data)
              if(data.status === "success"){
                closePopup();
                passPRNT();
              }

              });

            image.fail(function(jqXHR, textStatus, errorThrown){
                alert('Error');
            });
         } else {
          alert('Número de pin inválido.');
          $('#pin').val('');
         }
    }

}



function aprobarPopup(camionId){
  console.log('aprobando');


      $('#popup-loading').css('visibility','visible');
        $('#popup-loading').html('<i id="loading-icon-popup" class="fa fa-spinner fa-spin" style="font-size:63px; color:#8999A8;"></i>');
        console.log(camionId)
        var firma = $.ajax({
            url: '/api/camiones/checkfirma',
            type: 'POST',
            data: {camion_id: camionId}
          });

          firma.done(function(data){
            console.log(data);
            if(!data.pin){
            $('#popup-loading').css('visibility','hidden');
            $('#popup-loading').html('');
            $('#popup-firma').css('visibility','visible');

            } else {
            $('#popup-loading').css('visibility','hidden');
            $('#popup-loading').html('');
            $('#confirm').val(data.pin);
            $('#popup-autorizacion').css('visibility','visible');
            }
            });

          firma.fail(function(jqXHR, textStatus, errorThrown){
            console.log(errorThrown)
              alert('Error');
          });


}


function closePopup(){
  $('.recibo-popup').css('visibility','hidden');
  $('.editar-form').css('visibility','hidden');
  $('.editar-form').css('display','none');
  $('.acarreos').css('visibility','hidden');
  $('.acarreos').css('display','none');
  $('.acarreos').attr('checked', false);
  $('#reportar-boton').html('Reportar Cambios');
  $('#reportar-boton').attr('onclick','checkboxesOn()');
  $('#hora-container').css('visibility','hidden');
  $('#agregar-boton').css('visibility','hidden');
  $('#borrar-boton').css('visibility','hidden');
  $('#aprobar-boton').css('visibility','visible');
    $('#aprobar-boton').css('display','inline-block');
  $('#residente_id').val('');
   $('#residente_pin').val('');
  $('#pipa-cerrar').css('visibility','hidden');
  $('#pipa-cerrar').css('display','none');
    $('#editar-container-pipa').css('visibility','hidden');
  $('#editar-container-pipa').css('display','none');
  $('#editar-container').css('visibility','hidden');
  $('#editar-container').css('display','none');
  $('#pipa-tipo').css('visibility','hidden');
  $('#pipa-tipo').css('display','none');
  $('#pipa-tipo').val('');

}

function checkPin(){
  if($('#pin1').val().length == 4 && $('#pin2').val().length == 4){
    var pin1 = $('#pin1').val();
    var pin2 = $('#pin2').val();
    if(pin1 != pin2){
      $('#pin1').val('');
      $('#pin2').val('');
      alert('El número de pin de la confirmación es diferente al primero. Favor de ingresarlo de nuevo.')
       }
      }
}


// saveSVGButton.addEventListener("click", function (event) {
//     if (signaturePad.isEmpty()) {
//         alert("Please provide signature first.");
//     } else {
//         window.open(signaturePad.toDataURL('image/svg+xml'));
//     }
// });

function checkboxesOn(){
  $('.acarreos').css('visibility','visible');
  $('.acarreos').css('display','block');
  $('#aprobar-boton').css('visibility','hidden');
  $('#aprobar-boton').css('display','none');
  $('#agregar-boton').css('visibility','visible');
  $('#borrar-boton').css('visibility','visible');
  $('#reportar-boton').html('Editar');
  $('#reportar-boton').attr('onclick','editarAcarreos()');
}

function editarAcarreos(){
  console.log('editing')
if($('.acarreos:checkbox:checked').length < 1 || $('.acarreos:checkbox:checked').length > 1 ){
  alert('Por favor seleccione un acarreo para editar.');
} else {
var checkedVals = $('.acarreos:checkbox:checked').map(function() {
    return this.value;
}).get();
  if(checkedVals.length == $('.acarreos:checkbox:checked').length){
      console.log(checkedVals[0])
    $('#acarreo_id').val(checkedVals[0]);
    checarNumeroEdicion('editar');
  }
}
  //send request to show acarreos
}

function popUpResidente(tipo){
  $('#popup-residente').css('visibility','visible');
  $('#popup-residente').css('display','block');
  $('#tipo').val(tipo);
}

function claveResidente(tipo){
  console.log('checking pin');
  $('#popup-residente').css('visibility','hidden');
  $('#popup-loading').css('visibility','visible');
  $('#popup-loading').html('<i id="loading-icon-popup" class="fa fa-spinner fa-spin" style="font-size:63px; color:#8999A8;"></i>');
  var residente_id =   $('#residente_id').val();
  var pin =   $('#residente_pin').val();
  var tipo=$('#tipo').val();
console.log(pin);
console.log(residente_id);
   var pin = $.ajax({
            url: '/users/checkpin',
            type: 'POST',
            data: {id: residente_id,pin:pin}
          });

          pin.done(function(data){
            console.log(data);
            if(data.status === "success"){
                $('#popup-residente').css('visibility','hidden');
                $('#popup-residente').css('display','none');
                  if(tipo === 'editar'){
                  getAcarreo();
                  } else if(tipo ==="borrar"){
                  borrarAcarreo();
                  } else {
                    if($('#categoria-camion').val() === 'pipa'){
                       $('#save-button').removeAttr('disabled');
                    $('#popup-loading').css('visibility','hidden');
                    $('#popup-loading').html('');
                    $('#popup-editar').css('visibility','visible');
                    $('.editar-form').css('visibility','hidden');
                    $('.editar-form').css('display','none');
                    $('#pipa-tipo').css('visibility','visible');
                    $('#pipa-tipo').css('display','block');
                    $('#editar-container-pipa').css('visibility','visible');
                    $('#editar-container-pipa').css('display','block');
                    $('#pipa-tipo-container').css('visibility','visible');
                    $('#pipa-tipo-container').css('display','block');
                    } else {
                      console.log('agregar')
                    getBancos();
                     $('#concepto-original').val('');
                      $('#concepto').val('');
                      $('#zona').val('');
                    $('#popup-loading').css('visibility','hidden');
                    $('#popup-loading').html('');
                    $('#popup-editar').css('visibility','visible');
                    $('#editar-container').css('visibility','visible');
                    $('.editar-form').css('visibility','visible');
                    $('.editar-form').css('display','block');
                    $('#editar-container').css('display','block');
                    $('#hora-container').css('visibility','visible');
                    $('#hora-container').css('display','block');
                    $('#save-button').attr('onclick','addAcarreo()');
                    }
                  }

            } else{
              alert('Contraseña incorrecta');
              $('#popup-loading').css('visibility','hidden');
              $('#popup-loading').html('');
              $('#popup-residente').css('visibility','visible');
            }

            });

          pin.fail(function(jqXHR, textStatus, errorThrown){
            console.log(errorThrown)
              alert('Contraseña incorrecta');
              $('#popup-loading').css('visibility','hidden');
              $('#popup-loading').html('');
              $('#popup-residente').css('visibility','visible');
          });
}

function getAcarreo(){
  var acarreoUrl;
  var recibo_id = $('#acarreo_id').val();
     var acarreo = $.ajax({
            url: '/api/acarreos/recibo/'+recibo_id,
            type: 'GET'
          });

          acarreo.done(function(data){
            console.log(data);
            $('.editar-form').css('visibility','visible');
            $('.editar-form').css('display','block');
            if(data[0].concepto_material){
            $('#concepto').val(data[0].concepto_material);
            $('#concepto-original').val(data[0].concepto_material);
            } else {
            $('#concepto').val(data[0].concepto_flete);
            $('#concepto-original').val(data[0].concepto_flete);
            $('#banco_id').attr('disabled', true);
            $('#banco_id').css('visibility','hidden');
            $('#banco_id').css('display','none');
            $('#banco').css('visibility','hidden');
            $('#banco').css('display','none');
            }
            if(!data[0].flete_id){
            $('#banco_id').val(data[0].proveedor_id);
            } else {
            $('#banco_id').val(data[0].banco_id);
            $('#flete_id').val(data[0].flete_id);
            if(data[0].banco_id){
            getBancos(data[0].banco_id);
            }
            }
            if(data[0].material_id){
            getMateriales(data[0].material_id);
            }
            getZonas(data[0].zona_id);
            });

          acarreo.fail(function(jqXHR, textStatus, errorThrown){
            console.log(errorThrown)
              alert('Error');
          });
}

function getBancos(value){
    var camion_id = $('#camion_id').val();
    $('#banco_id').html('');
    $('#banco_id').append('<option value="">Banco</option>');

   var bancos = $.ajax({
            url: '/api/banco/banco/'+camion_id,
            type: 'GET'
          });

          bancos.done(function(data){
            console.log(data);
             $('#banco').removeAttr('disabled');
            for(var i = 0; i <data.length; i++){
            $('#banco_id').append('<option value="'+data[i].banco+'">'+data[i].razon_social+'</option>');
            if(i == data.length-1){
              if(value){
               $('#banco_id').val(value);
              }
             $('#banco_id').css('display','block');
            $('#banco_id').css('visibility','visible');
             $('#banco').css('display','block');
            $('#banco').css('visibility','visible');
            }
            }
            });

          bancos.fail(function(jqXHR, textStatus, errorThrown){
            console.log(errorThrown)
              alert('Error');
          });
}

function getFlete(){

  var proveedor_id = $('#proveedor_id').val();
  if($('#concepto').val() == 82){
    var banco_id = 0;
  } else {
  var banco_id = $('#banco_id').val();
  }
  var concepto = $('#concepto').val();
   var fletes = $.ajax({
            url: '/api/fletes/precio',
            type: 'POST',
            data: {
              proveedor_id:proveedor_id,
              banco_id:banco_id,
              concepto:concepto
            }
          });

          fletes.done(function(data){
            console.log(data);
            if(data[0].length>0){
            $('#flete_id').val(data[0][0].fletes_id);
            $('#precio-flete').val(data[0][0].precio);
            } else {
            $('#flete_id').val('');
            $('#precio-flete').val('');
            }
            getZonas();
            });

          fletes.fail(function(jqXHR, textStatus, errorThrown){
            console.log(errorThrown)
              alert('Error');
          });

}

function getMateriales(value){
  var banco_id = $('#banco_id').val();
  var concepto = $('#concepto').val();
  if(value){
    $('#material_id').val(value);
  } else if(banco_id && concepto){
       var materiales = $.ajax({
            url: '/api/materiales/banco/'+banco_id+'/'+concepto,
            type: 'GET'
          });

          materiales.done(function(data){
            console.log(data);
            if(data.length > 0){
            getZonas();
            $('#material_id').val(data[0].id);
            $('#precio_material').val(data[0].precio);
            } else {
              alert('No se encontró la entrada de material de el concepto y banco seleccionado. Favor de dar de alta el material indicado.');
            }
            });

          materiales.fail(function(jqXHR, textStatus, errorThrown){
            console.log(errorThrown)
              alert('Error');
          });
  }
}

function getZonas(value){
  checkAcarreo();
  $('#zona').attr('disabled','true');
  $('#editar-button-loading').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>')
  var concepto_id = $('#concepto').val();
  console.log(value)
  if(!value){
    var value = $('#zona').val();
  }
   var zonas = $.ajax({
            url: '/api/zonas/lista/'+concepto_id,
            type: 'GET'
          });

          zonas.done(function(data){
            console.log(data);
            if(data.length > 0){
            $('#zona').html('');
            $('#zona').append('<option value="">Zonas</option>');
            for(var i = 0; i <data.length; i++){
            $('#zona').append('<option value="'+data[i].zona+'">'+data[i].nombre_zona+'</option>');
            if(i == data.length-1){
                $('#zona').removeAttr('disabled');
                $('#zona').append('<option value="122">Extras</option>');
                $('#zona').val(value);
                $('#editar-button-loading').html('')
                $('#zona').removeAttr('readonly');
                $('#popup-editar').css('visibility','visible');
                $('#popup-loading').css('visibility','hidden');
                $('#popup-loading').html('');
            }
            }
            } else {
              $('#zona').append('<option value="122">Extras</option>');
            }
            });

          zonas.fail(function(jqXHR, textStatus, errorThrown){
            console.log(errorThrown)
              alert('Error');
          });

}

function checkAcarreo(){
  if($('#concepto').val() == 82 ){
    $('#material_id').attr('hidden','true');
  }
}

function updateAcarreo(){
  $('#editar-button-loading').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>')

  var recibo_id = $('#acarreo_id').val();
  var concepto = $('#concepto').val();
  var banco_id = $('#banco_id').val();
  var material_id = $('#material_id').val();
  var flete_id = $('#flete_id').val();
  var zona = $('#zona').val();
    var razon = $('#razon').val();
  var categoria = $('#categoria').val();
  console.log('nozona: '+!zona);
  if(concepto != 82){
 if(!zona || !razon || !concepto || !banco_id){
    var send = false;
    alert("Por favor no deje campos en blanco.")
  } else {
    var send = true;
  }
  } else {
    if(!zona || !razon || !concepto){
    var send = false;
    alert("Por favor no deje campos en blanco.")
  } else {
    var send = true;
  }
  }

  console.log(send)
  if(send){
     var update = $.ajax({
            url: '/api/acarreos/update/'+recibo_id,
            type: 'POST',
            data: {concepto:concepto,
                banco_id:banco_id,
                material_id:material_id,
                zona_id:zona,
                categoria:categoria,
                flete_id:flete_id,
                razon:razon
            }
          });

          update.done(function(data){
            console.log(data);
            $('#editar-button-loading').html('')
            location.reload();
            });

          update.fail(function(jqXHR, textStatus, errorThrown){
            console.log(errorThrown)
              alert('Error');
          });
  }
}

function checarNumeroEdicion(tipo){
  var camion_id= $('#camion_id').val();
  var fecha= $('#fecha').val();
 var ediciones = $.ajax({
            url: '/api/acarreos/ediciones',
            type: 'GET',
            data: {camion_id:camion_id,
                fecha:fecha
            }
          });

          ediciones.done(function(data){
            console.log(data[0].ediciones);
            if(data[0].ediciones < 10){
                if(tipo === 'editar'){
                  popUpResidente('editar');
                } else if(tipo ==='agregar'){
                  popUpResidente('agregar');
                }
            } else {
              alert('Se ha alcanzado el máximo de ediciones por camión por día.');
              closePopup();
            }

            });

          ediciones.fail(function(jqXHR, textStatus, errorThrown){
            console.log(errorThrown);
              $('#editar-button-loading').html('');
              alert('No se pudo guardar el acarreo.');
          });
}

function addAcarreo(){
  $('#editar-button-loading').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>')
  var camion_id = $('#camion_id').val();
  var unidad = $('#unidad').val();
  var cantidad = $('#capacidad').val();
  var fletero = $('#proveedor_id').val();
  var categoria_flete = $('#categoria').val();
  var camion_categoria = $('#categoria-camion').val();
  if($('#precio-flete').val()){
    var total_flete = $('#precio-flete').val() * cantidad;
  } else {
    var total_flete=0;
  }
  var zona_id = $('#zona').val();
  var date= $('#fecha').val();
  var hour= $('#hora').val();
  var minutes= $('#minutos').val();
  var meridian= $('#meridiano').val();
  var flete_id = $('#flete_id').val();
  var precio_flete = $('#precio-flete').val();
  var banco_id = $('#banco_id').val();
  var concepto_flete = $('#concepto').val();
  var material_id = $('#material_id').val();
  var concepto_material = $('#concepto').val();
  var precio_material = $('#concepto').val();
  var razon = $('#razon').val();

  if(concepto_flete != 82){
    if(!zona_id || !razon || !concepto_flete || !date || !hour || !minutes || !meridian || !banco_id ){
      alert("Favor de no dejar campos en blanco.");
      $('#editar-button-loading').html('');
      var send = false;
    } else {
      var send = true;
    }
  } else {
    if(!zona_id || !razon || !date || !hour || !minutes || !meridian ){
      alert("Favor de no dejar campos en blanco.");
      $('#editar-button-loading').html('');
      var send = false;
    } else {
      var send = true;
    }
  }
  console.log(send);
    if(send) {
      console.log('sending');

       var acarreo = $.ajax({
            url: '/api/acarreos/',
            type: 'POST',
            data: {camion_id:camion_id,
                unidad:unidad,
                fletero:fletero,
                camion_categoria:camion_categoria,
                fletero_categoria:categoria_flete,
                total_flete:total_flete,
                zona_id: zona_id,
                capacidad:cantidad,
                date:date,
                hour:hour,
                minutes:minutes,
                meridian:meridian,
                flete_id:flete_id,
                banco_id:banco_id,
                concepto_flete:concepto_flete,
                precio_flete:precio_flete,
                material_id:material_id,
                precio_material:precio_material,
                concepto_material:concepto_material,
                razon:razon
            }
          });

          acarreo.done(function(data){
            console.log(data);
            if(data.status === "success"){
            $('#editar-button-loading').html('');
            location.reload();
            }
            });

          acarreo.fail(function(jqXHR, textStatus, errorThrown){
            console.log(errorThrown);
              $('#editar-button-loading').html('');
              alert('No se pudo guardar el acarreo.');
          });
        }
}


function confirmBorrar(){
if($('.acarreos:checkbox:checked').length < 1 || $('.acarreos:checkbox:checked').length > 1 ){
  alert('Por favor seleccione solamente un acarreo para borrar.');
} else {
var checkedVals = $('.acarreos:checkbox:checked').map(function() {
    return this.value;
}).get();
  if(checkedVals.length == $('.acarreos:checkbox:checked').length){
      console.log(checkedVals[0])
    $('#acarreo_id').val(checkedVals[0]);
  if (window.confirm("Seguro que desea borrar este acarreo?")) {
    popUpResidente('borrar');
}
}
}
}

function checkAcarreoInt(){
  var nuevoconcepto = $('#concepto').val();
  var conceptooriginal = $('#concepto-original').val();
  var flete_id = $('#flete_id').val();
    if(nuevoconcepto !=82 && conceptooriginal == 82){
      $('#save-button').attr('disabled','true');
      $('#concepto').val(conceptooriginal);
      alert('Para cambiar a concepto de Acarreo Interno, se requiere eliminar el viaje y agregarlo de nuevo.');
    } else if (nuevoconcepto == 82 && !conceptooriginal){
      $('#banco_id').val(null);
      $('#banco_id').attr('disabled','true');
      $('#banco_id').css('visibility','hidden');
      $('#banco_id').css('display','none');
      $('#banco').css('visibility','hidden');
      $('#banco').css('display','none');
      getFlete();
    } else if(nuevoconcepto == 82 && conceptooriginal != 82){
      $('#save-button').attr('disabled','true');
      $('#concepto').val(conceptooriginal);
      alert('Para cambiar de concepto de Acarreo Interno a otro, se requiere eliminar el viaje y agregarlo de nuevo.');
    } else if(conceptooriginal && !flete_id){
      $('#save-button').attr('disabled','true');
      $('#concepto').val(conceptooriginal);
      alert('Para editar este acarreo, se requiere eliminarlo y volverlo a agregar.');
    }else {
      $('#save-button').removeAttr('disabled');
      $('#banco_id').removeAttr('disabled');
      $('#banco_id').css('visibility','visible');
      $('#banco_id').css('display','block');
      $('#banco').css('visibility','visible');
      $('#banco').css('display','block');
      getBancos();
  }
}

function borrarAcarreo(){

  var recibo_id = $('#acarreo_id').val();;
        var acarreo = $.ajax({
            url: '/api/acarreos/recibo/'+recibo_id,
            type: 'DELETE'
          });

          acarreo.done(function(data){
            console.log(data);
            if(data === "done"){
            location.reload();
            }
            });

          acarreo.fail(function(jqXHR, textStatus, errorThrown){
            console.log(errorThrown)
              alert('Error');
          });
           }

function pipaForm(){
  if($('#pipa-tipo').val() == 0){
      $('#editar-container').css('visibility','hidden');
      $('#editar-container').css('display','none');
       $('#pipa-entrada').css('visibility','hidden');
      $('#pipa-entrada').css('display','none');
       $('#pipa-salida').css('visibility','hidden');
      $('#banco').css('display','none');
      $('#banco').css('visibility','hidden');
      $('#pipa-salida').css('display','none');
      $('.editar-form').css('visibility','hidden');
      $('.editar-form').css('display','none');
      $('#save-button').attr('onclick','addAcarreo()');
      $('#razon').css('visibility','visible');
      $('#razon').css('display','block');
      getViajes();
  } else if($('#pipa-tipo').val() == 1){
    getBancos();
      $('#editar-container').css('visibility','visible');
      $('#editar-container').css('display','block');
       $('#pipa-entrada').css('visibility','visible');
      $('#pipa-entrada').css('display','block');
       $('#pipa-salida').css('visibility','visible');
      $('#banco').css('display','block');
      $('#banco').css('visibility','visible');
      $('#pipa-salida').css('display','block');
      $('.editar-form').css('visibility','visible');
      $('.editar-form').css('display','block');
      $('#save-button').attr('onclick','cerrarViaje()');

  }
}

function getViajes(){
   var camion_id = $('#camion_id').val();
   var fecha = $('#fecha').val();
        var acarreo = $.ajax({
            url: '/api/acarreos/lastviaje/',
            type: 'POST',
            data:{
              camion_id:camion_id,
              fecha:fecha
            }
          });

          acarreo.done(function(data){
            if(data.length >0){
            $('#viaje_id').val(data[0].viaje_id);
            $('#entrada').val(data[0].entrada);
            $('#pipa-cerrar').css('visibility','visible');
            $('#pipa-cerrar').css('display','block');
            $('#editar-container').css('visibility','visible');
            $('#editar-container').css('display','block');
            $('#pipa-salida').css('visibility','visible');
            $('#pipa-salida').css('display','block');
            $('#save-button').css('display','inline-block');
            $('#save-button').css('visibility','visible');
            $('#save-button').attr('onclick','cerrarViaje()');
            } else {
              alert('No hay viajes sin cerrar.');
              closePopup();
            }
            });

          acarreo.fail(function(jqXHR, textStatus, errorThrown){
            console.log(errorThrown)
              alert('Error');
          });
}

function cerrarViaje(){
  $('#editar-button-loading').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>')
  var viaje_id = $('#viaje_id').val();
  var fecha = $('#fecha').val();
  var material_id = $('#material_id').val();
  var camion_id = $('#camion_id').val();
  var zona = $('#zona').val();
  var flete_id = $('#flete_id').val();
   var razon = $('#razon').val();
  var entrada='';
  var salida= fecha+' '+$('#nueva-hora-salida').val()+':'+$('#nueva-minutos-salida').val()+' '+$('#nueva-meridiano-salida').val();
  if($('#nueva-minutos-entrada').val() && $('#nueva-meridiano-entrada').val()){
      entrada= fecha+' '+$('#nueva-hora-entrada').val()+':'+$('#nueva-minutos-entrada').val()+' '+$('#nueva-meridiano-entrada').val();
    }

   var hora= $('#hora-salida').val();
   var minutos= $('#minutos-salida').val();
   var meridiano= $('#meridiano-salida').val();
   console.log(viaje_id)
        var viaje = $.ajax({
            url: '/api/acarreos/cerrarviaje',
            type: 'POST',
         data:{
              viaje_id:viaje_id,
              fecha:fecha,
              hora:hora,
              minutos:minutos,
              meridiano:meridiano,
              zona_id:zona,
              flete_id:flete_id,
              material_id:material_id,
              camion_id:camion_id,
              salida:salida,
              entrada:entrada,
              razon:razon
            }
          });

          viaje.done(function(data){
            if(data.status === 'success'){
              location.reload();
            }
            });

          viaje.fail(function(jqXHR, textStatus, errorThrown){
            console.log(errorThrown)
              alert('Error');
          });
}

function checkDate(){
  console.log('checking date')
  var hora_salida;
  var minutos_salida;
  var hora_entrada;
  var minutos_entrada;
  if($('#nueva-hora-entrada').val() && $('#nueva-minutos-entrada').val() && $('#nueva-meridiano-entrada').val()){

    if($('#nueva-meridiano-entrada').val() == 'PM'){
      hora_entrada = Number($('#nueva-hora-entrada').val())+12;
      minutos_entrada = $('#nueva-minutos-entrada').val();
    } else {
      hora_entrada = Number($('#nueva-hora-entrada').val());
      minutos_entrada = $('#nueva-minutos-entrada').val();
    }
  }
  if($('#nueva-hora-salida').val() && $('#nueva-minutos-salida').val() && $('#nueva-meridiano-salida').val()){
    if($('#nueva-meridiano-salida').val() == 'PM'){
      hora_salida = Number($('#nueva-hora-salida').val())+12;
      minutos_salida = $('#nueva-minutos-salida').val();
    } else {
      hora_salida = Number($('#nueva-hora-salida').val());
      minutos_salida = $('#nueva-minutos-salida').val();
    }
  }
  if(hora_salida && hora_entrada && minutos_entrada && minutos_salida){
    if(hora_salida<=hora_entrada && minutos_salida<=minutos_entrada){
        alert('La hora de salida debe ser después de la hora de entrada.');
        $('#nueva-hora-salida').val('');
        $('#nueva-minutos-salida').val('');
        $('#nueva-meridiano-salida').val('');
        $('#nueva-hora-entrada').val('');
        $('#nueva-minutos-entrada').val('');
        $('#nueva-meridiano-entrada').val('');
    } else {
     console.log(hora_salida-hora_entrada);
      console.log(minutos_salida-minutos_entrada);
    }
  }
}

function checkSalida(){
  console.log('checking salida')
  var hora_salida = Number($('#nueva-hora-salida').val());
  var minutos_salida = Number($('#nueva-minutos-salida').val());
  var meridiano_salida = $('#nueva-meridiano-salida').val();
  var entrada = $('#entrada').val();
  var entrada_hora=entrada.slice(entrada.length-8,entrada.length-6);
  var entrada_minutos=entrada.slice(entrada.length-5,entrada.length-3);

  if(entrada_hora && entrada_minutos && meridiano_salida){
    if(meridiano_salida === 'PM'){
      hora_salida = Number(hora_salida) +12;
    }

  console.log(hora_salida>=Number(entrada_hora) && minutos_salida >= Number(entrada_minutos))
    if(hora_salida<=Number(entrada_hora) && minutos_salida <= Number(entrada_minutos)){
      alert('La hora de salida debe ser después de la hora de entrada.');
       $('#nueva-hora-salida').val('');
        $('#nueva-minutos-salida').val('');
        $('#nueva-meridiano-salida').val('');
    }
  }
}
