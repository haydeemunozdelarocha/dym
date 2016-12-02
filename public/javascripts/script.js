
function createEstimacion(acarreos, categoria, obra_id, proveedor, periodo_inicial, periodo_final) {
  console.log(acarreos, categoria, obra_id, proveedor, periodo_inicial, periodo_final)
  console.log('sending')
var estimacion = $.ajax({
    url: '/api/estimaciones/nueva',
    type: 'POST',
    dataType: 'json',
    data: { acarreos : acarreos, categoria: categoria, obra: obra_id, proveedor: proveedor, periodo_inicio: periodo_inicial, periodo_final: periodo_final}
  });

  estimacion.done(function(data){
    console.log(data);
    });

  estimacion.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown);
          console.log('error');
  });

}

function getImage() {
console.log("getting image");
$('#photo-status').html("Capturando imagen...")
var image = $.ajax({
    url: '/photo',
    type: 'GET',
    dataType: 'json'
  });

  image.done(function(data){
    $('#photo-status').html("")
    $('#photo-status').html("Listo!")
    $('#photo').val(data);
    allowSubmit()
    $('#photo-button').attr("disabled", true);
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
    console.log(data)
     $('#proveedor_id').attr("disabled", true);
    $('#material_id').removeAttr("disabled")
    $('#material_id').html('');
    $('#material_id').html('<option value="">Material</option>');
    for(var i = 0; i < data.length ; i ++){
          $('#material_id').append('<option value="'+data[i].id+'">'+data[i].nombre_concepto+'</option>');
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
    $('#zonas').removeAttr("disabled")
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
      $('#concepto_flete').removeAttr("disabled");
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

function getProveedores(){
  $('#concepto_flete').attr("disabled", true);
  $('#proveedor_id').removeAttr("disabled");
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
  window.open("starpassprnt://v1/print/nopreview?html="+encodedHtml+"&back=http://dymingenieros.herokuapp.com/captura");
}

