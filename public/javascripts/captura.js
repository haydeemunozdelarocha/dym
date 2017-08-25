// var path = "http://localhost:3000/";
var path = 'http://dymingenieros.herokuapp.com';

function getCamion() {
  $('#search-status').html("");
  $('#search-status').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>');
console.log("getting camion");
var camion_id = $('#scanner').val();
if(camion_id.length > 0){


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
      $('#fletero_categoria').val(data[0].proveedor_categoria);
      $('#camion_categoria').val(data[0].categoria);
      $('#unidad').val(data[0].unidad_camion);
      $('#capacidad').val(data[0].capacidad)
      $('#search-status').html("");
        $('.categoria-info').removeAttr("hidden");
        $('#concepto').removeAttr("disabled");
      $('#search-status').append("Camión encontrado!");
    } else{
      $('#search-status').html("");
      $('#search-status').append("Camión ID no se ha registrado!");
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

function revisarInterno() {
  console.log('calculando');
  var concepto = $('#concepto').val();
  if(concepto == 82){
    console.log('acarreo interno');
    $('#bancoinfo').css("visibility","hidden");
    $('#bancoinfo').css("display","none");
    $('#banco').attr('disabled');
    getMaterial();
  } else{

    getBancos();
  }
}


function getBancos(){
  console.log('getting bancos')
  $('#banco-status').html("");
  $('#banco').attr("disabled",'true');
  $('#bancoinfo').css("visibility","hidden");
  $('#bancoinfo').css("display","none");
  var concepto = $('#concepto').val();
  $('#banco-status').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>');
  $('#banco').html('');
   var camion_id =   $('#camion_id').val();
   var bancos = $.ajax({
    url: '/api/banco/banco/'+camion_id+'/'+concepto,
    type: 'GET',
    dataType: 'json'
  });

  bancos.done(function(data){
    if(data.length !== 0){
      console.log(data)
      $('#banco').removeAttr("disabled");
      $('#banco').html('<option value="">Banco</option>');
      for(var i=0; i<data.length; i++){
        $('#banco').append('<option value='+data[i].banco+'>'+data[i].razon_social+'</option>');
        if(i == data.length-1){
          $('#banco-status').html("");
            $('#bancoinfo').css("visibility","visible");
          $('#bancoinfo').css("display","block");
          $('#banco').removeAttr("hidden");
      }
    }

    } else {
      console.log('no data')
      alert('No se ha registrado el precio de este concepto.')
      $('#banco-status').html("");
       $('#bancoinfo').css("visibility","hidden");
      $('#bancoinfo').css("display","none");
    }
});

    bancos.fail(function(jqXHR, textStatus, errorThrown){
 console.log("error")
  });
}



function getMaterial() {
  console.log('getting material')

   $('#banco-status').html('');
    $('#banco-status').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>');
  var banco_id=$('#banco').val();

  if(!banco_id){
  banco_id = 0;
  }
  var fletero=$('#fletero').val();
  var concepto=$('#concepto').val();

    var material = $.ajax({
    url: '/api/materiales/v2/'+banco_id+'/'+fletero+'/'+concepto,
    type: 'GET',
    dataType: 'json'
  });

  material.done(function(data){
    console.log(data)
    if(data[0]){
      $('#material_id').val(data[0].material_id)
      getZonas();
    }
   $('#banco-status').html('');
    });

  material.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown);
    alert('No se ha dado de alta el material de ese concepto y banco.')
       $('#banco-status').html('');
          console.log('no material');
  });
}

function getZonas() {
  $('#zonas-status').html("");
  $('#zonas').html("");
  $('#zonas-status').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>');
console.log("getting zonas");
var concepto = $('#concepto').val();
console.log(concepto)
  var data = new Object();
    if($('#obra').val()){
      data.obra_id = $('#obra').val();
    }
  var zonas = $.ajax({
    url: '/api/zonas/lista/'+concepto,
    type: 'GET',
    dataType: 'json',
    data: data
  });

  zonas.done(function(data){
    if(data.length > 0){
    $('#zonas').html("<option value=''>Zonas</option>");
    for(var i = 0; i <= data.length ; i++) {
    $('#zonas').append("<option value='"+data[i].zona+"'>"+data[i].nombre_zona+"</option>");
    if(data.length == i+1 ){
    $('#zonas').append("<option value='122'>Extras</option>");
    $('#zonas-status').html("");
    $('#zonas').removeAttr("disabled");
    }
    }
    } else {
    $('#zonas').html("<option value=''>Zonas</option>");
    $('#zonas').append("<option value='122'>Extras</option>");
    $('#zonas-status').html("");
    $('#zonas').removeAttr("disabled");
    }
    });

  zonas.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown);
      $('#zonas-status').html("");
      $('#zonas-status').alert("No existe presupuesto para esa zona y ese concepto.");
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
  $('#photo-button').removeAttr("disabled");
    allowSubmit()

}

function allowSubmit(){
  $('#photo-button').attr("disabled", true);
  $('#submit-button').removeAttr("disabled")
  $('#concepto').removeAttr("disabled")
  $('#zonas').removeAttr("disabled");
  $('#material_id').removeAttr("disabled")
  $('#scanner').removeAttr("disabled")
}


document.getElementById("capturaForm").onkeypress = function(e) {
  var key = e.charCode || e.keyCode || 0;
  if (key == 13) {
    e.preventDefault();
  }
}



