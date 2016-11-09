// function foo(data)
// {
//     // do stuff with JSON
//     data = JSON.stringify(data);
//     var images=JSON.parse(data)

//     console.log(images)
// }

// var script = document.createElement('script');
// script.src = 'http://10.5.5.9/gp/gpMediaList?callback=foo'

// document.getElementsByTagName('head')[0].appendChild(script);

// function getPhotoFront() {
// var xhr = new XMLHttpRequest();
// console.log('snapping')
// xhr.open('GET', 'http://10.5.5.9/gp/gpControl/command/shutter?p=1', true);
// xhr.send();
// setTimeout(getImage,3000);
// console.log('done')

// }

// function photoMode() {
// document.getElementById("loading").innerHTML = "Loading..";
// var xhr = new XMLHttpRequest();
// console.log('changing mode')
// xhr.open('GET', 'http://10.5.5.9/gp/gpControl/command/mode?p=1', true);
// xhr.send();
// xhr.getAllResponseHeaders()
// console.log('done')
// getPhotoFront();
// }


function getImage() {
console.log("getting image");
var image = $.ajax({
    url: '/photo',
    type: 'GET',
    dataType: 'json'
  });

  image.done(function(data){
    console.log(data);
    });

  image.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown);
          console.log('error');
  });


}

function getMateriales() {
console.log("getting materiales");
var proveedor_id = $('#proveedor_id').val();
  var materiales = $.ajax({
    url: '/api/materiales/'+proveedor_id,
    type: 'GET',
    dataType: 'json'
  });

  materiales.done(function(data){
    $('#material_id').removeAttr("disabled")
    $('#material_id').html('');
    $('#material_id').html('<option value="">Material</option>');
    for(var i = 0; i < data.length ; i ++){
          $('#material_id').append('<option value="'+data[i].id+'">'+data[i].nombre+'</option>');
    }
    });

  materiales.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown);
          console.log('no materiales');
  });
}

function getMaterial() {
console.log("getting material");
var material_id = $('#material_id').val();
  var material = $.ajax({
    url: '/api/materiales/material/'+material_id,
    type: 'GET',
    dataType: 'json'
  });

  material.done(function(data){
    $('#precio').val('');
    $('#precio-input').attr('value', ''+data.precio+'');
    });

  material.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown);
          console.log('no material');
  });
}

function getCamion() {
  $('#search-status').html("");
console.log("getting camion");
var camion_id = $('#scanner').val();
  var camion = $.ajax({
    url: '/api/camiones/buscar/'+camion_id,
    type: 'GET',
    dataType: 'json'
  });

  camion.done(function(data){
    if(data[0]){
      $('#search-status').html("");
      $('#search-status').append("Camión encontrado!");
      $('#scanner').attr("readonly", true);
      $('#proveedor_id').removeAttr("disabled");
    } else {
      $('#search-status').html("");
      $('#search-status').append("Camión ID inválido!");
    }

    });

  camion.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown);
      $('#search-status').html("");
      $('#search-status').append("Camión ID inválido!");
  });
}

function getPhoto() {
document.getElementById("loading").innerHTML = "Loading..";
var xhr = new XMLHttpRequest();
console.log('starting get')
xhr.open('GET', "/camera", true);
xhr.send();
console.log('done')
}

function cerrarRecibo(){
  window.location.replace("/captura");
}

function allowPhoto(){
  $('#photo-button').removeAttr("disabled")
}

function allowSubmit(){
  $('#submit-button').removeAttr("disabled")
}

function test () {
  console.log('running ')
  var html=$('#recibo').html();
  print(html)
}

function print(html){
  var encodedHtml = ""+encodeURI(html)+"";
  window.open("starpassprnt://v1/print/nopreview?html="+encodedHtml+"&back=http://evening-bastion-81870.herokuapp.com/captura");
  alert('printing')
}

function getTotals(){

}
