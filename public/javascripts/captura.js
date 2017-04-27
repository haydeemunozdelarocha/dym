var path = "http://localhost:3000/";

function calcularFlete() {
  console.log('calculando');
  var concepto_flete = $('#categoria').val();
  if(concepto_flete === "92" || concepto_flete === "100"){
    $('#bancoinfo').removeAttr("hidden");
    $('#banco').removeAttr("disabled");
    $('#concepto_flete').val('82');
  } else {
    calcularAcarreoInt();
  }
}

function calcularAcarreoInt() {
  var proveedor_id = $('#fletero').val();
  var capacidad = $('#capacidad').val();
  var precio = $.ajax({
    url: '/api/materiales/acarreoint/'+proveedor_id,
    type: 'GET',
    dataType: 'json'
  });

  precio.done(function(data){
    if(data.length !== 0){
      console.log(data)
        $('#precio_flete').val(data[0].precio*capacidad);
        $('#zonas').removeAttr("disabled");
    } else {
      console.log('no data')
      alert('No se ha registrado el precio de Acarreo Interno para el proveedor de este camión.')
    }
});

    precio.fail(function(jqXHR, textStatus, errorThrown){
 console.log("error")
  });
}

function calcularAcarreoEM() {
  var capacidad = $('#capacidad').val();
  var proveedor_id;
  var concepto_flete = $('#categoria').val();
  var apiURL;
  if(concepto_flete === "92"){
    proveedor_id = $('#banco').val();
    $('#concepto_flete').val('92');
    $('#proveedor_id').val(proveedor_id);
    apiURL = '/api/materiales/acarreoext/'+proveedor_id;
  } else if(concepto_flete === "100"){
    proveedor_id = $('#proveedor_id').val();
    apiURL = '/api/materiales/acarreomat/'+proveedor_id
  }
  var precio = $.ajax({
    url: apiURL,
    type: 'GET',
    dataType: 'json'
  });

  precio.done(function(data){
    console.log(data)
    if(data.length !== 0){
    $('#flete_id').val(data[0].fletes_id);
      if (concepto_flete === "92"){
        $('#precio_material').val(data[0].precio);
        $('#concepto_flete').val(data[0].concepto);
        $('#concepto_material').val(data[0].concepto);
        $('#material_id').val(data[0].material_id);
        totalFlete();

      } else if (concepto_flete === "100"){
         var distancia = $('#distancia').val();
        $('#bancoinfo').removeAttr("hidden");
         $('#precio_flete').val((data[0].precio1*capacidad*1)+(data[0].precio1*capacidad*(distancia-1)));
         $('#banco').removeAttr("disabled");
      }
    } else {
      console.log('no data')
      alert('No se ha registrado el precio de Acarreo Interno para el proveedor de este camión.')
    }
});

    precio.fail(function(jqXHR, textStatus, errorThrown){
 console.log("error")
  });
}

function totalFlete(){
    var concepto_flete = $('#categoria').val();
    var proveedor_id = $('#fletero').val();
    var banco_id = $('#banco').val();
    var capacidad = $('#capacidad').val();
    console.log(proveedor_id)
    console.log(banco_id)

    var precio = $.ajax({
    url: '/api/fletes/precio/',
    type: 'POST',
    dataType: 'json',
    data:{
      proveedor_id:proveedor_id,
      banco_id:banco_id
    }
  });

  precio.done(function(data){
    console.log(data)
    $('#flete_id').val(data[0].fletes_id);
      if (concepto_flete === "92"){
        $('#precio_flete').val(data[0].precio*capacidad);
        console.log(data[0].precio*capacidad)
        $('#zonas').removeAttr("disabled");

      } else if (concepto_flete === "100"){
         var distancia = $('#distancia').val();
        $('#bancoinfo').removeAttr("hidden");
         $('#precio_flete').val((data[0].precio1*capacidad*1)+(data[0].precio1*capacidad*(distancia-1)));
         $('#banco').removeAttr("disabled");
      }
    });

  precio.fail(function(jqXHR, textStatus, errorThrown){
 console.log("error")
  });
}
function getBanco(){
 $('#material-status').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>');
  var banco = $('#banco').val();
  var concepto_flete = $('#categoria').val();
  console.log(concepto_flete)
  var distancia = $.ajax({
    url: '/api/banco/materiales/'+banco,
    type: 'GET',
    dataType: 'json'
  });

  distancia.done(function(data){
    if (concepto_flete === "100"){
          $('#distancia').val(data.banco[0].distancia);
          $('#proveedor_id').val(data.banco[0].proveedor_id);
          $('#material-info').removeAttr('hidden');
          $('#material_id').removeAttr('disabled');
          for(var i = 0 ; i < data.materiales.length; i++){
            $('#material_id').append('<option value="'+data.materiales[i].id+'">'+data.materiales[i].nombre_concepto+'</option>');
          }
          $('#material-status').html("");
          $('#material_id').removeAttr("disabled");

           calcularFlete();
      } else {
        $('#distancia').val(data.banco[0].distancia);
        $('#proveedor_id').val(data.banco[0].proveedor_id);
        $('#zonas').removeAttr("disabled");
      }
    });

  distancia.fail(function(jqXHR, textStatus, errorThrown){
 console.log("error")
  });

}


function getMaterial() {
  var material_id=$('#material_id').val();
    var material = $.ajax({
    url: '/api/materiales/material/'+material_id,
    type: 'GET',
    dataType: 'json'
  });

  material.done(function(data){
    var capacidad = $('#capacidad').val();
    $('#precio_material').val(Number(data.precio)*capacidad);
    $('#concepto_material').val(data.concepto);
    $('#concepto_flete').val(data.concepto);
    });

  material.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown);
          console.log('no material');
  });
  $('#zonas').removeAttr("disabled");
}


function getCamion() {
  $('#search-status').html("");
  $('#search-status').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>');
console.log("getting camion");
var camion_id = $('#scanner').val();
if(camion_id.length >= 10){

console.log(camion_id)
  var camion = $.ajax({
    url: '/api/camiones/buscar/'+camion_id,
    type: 'GET',
    dataType: 'json'
  });

  camion.done(function(data){
    console.log(data)
    if(data[0].camion_id){
      $('#camion_id').val(data[0].camion_id);
      $('#scanner').attr("readonly", true);
      $('#fletero').val(data[0].proveedor_id);
      console.log($('#fletero').val())

      $('#capacidad').val(data[0].capacidad)
      $('#search-status').html("");
      $('#categoria').removeAttr("disabled");
      $('#search-status').append("Camión encontrado!");
    } else {
      $('#search-status').html("");
      $('#search-status').append("Camión ID inválido!");
      $('#scanner').val("");
    }
    });

  camion.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown);
      $('#search-status').html("");
      $('#search-status').append("Camión ID inválido!");
  });
}
}

function getProveedores(){
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
  $('#photo-button').removeAttr("disabled");
    allowSubmit()

}

function allowSubmit(){
  $('#photo-button').attr("disabled", true);
  $('#submit-button').removeAttr("disabled")
  $('#concepto').removeAttr("disabled")
  $('#zonas').removeAttr("disabled")
  $('#material_id').removeAttr("disabled")
  $('#scanner').removeAttr("disabled")
}

document.getElementById("capturaForm").onkeypress = function(e) {
  var key = e.charCode || e.keyCode || 0;
  if (key == 13) {
    e.preventDefault();
  }
}


