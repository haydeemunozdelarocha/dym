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
      if(data[0].categoria === "camion"){
        $('.categoria-info').removeAttr("hidden");
        $('#categoria').removeAttr("disabled");
      } else {
        getBancos();
      }
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
  var concepto_flete = $('#categoria').val();
  if(concepto_flete == 82){
    $('#concepto_flete').val('82');
    console.log('acarreo interno');
    calcularAcarreoInt();
  } else{
    $('#concepto_flete').val(concepto_flete);
    getBancos();
  }
}


function getBancos(){
  console.log('getting bancos')
  $('#banco-status').html("");
  $('#banco-status').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>');
  $('#banco').html('');
   var camion_id =   $('#camion_id').val();
   var bancos = $.ajax({
    url: '/api/banco/banco/'+camion_id,
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
          $('#bancoinfo').removeAttr("hidden");
          $('#banco-status').html("");
          $('#banco').removeAttr("hidden");
      }
    }

    } else {
      console.log('no data')
      alert('No se ha registrado el precio de flete de acarreo externo.')
    }
});

    bancos.fail(function(jqXHR, textStatus, errorThrown){
 console.log("error")
  });
}



function calcularAcarreoInt() {
  console.log('calculando acarreo interno')
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
        $('#flete_id').val(data[0].fletes_id);
        $('#precio_flete').val(data[0].precio*capacidad);
        $('#concepto_flete').val("82");
        $('#unidad').val(data[0].unidad);
        $('#material_id').removeAttr("required");
        getZonas();
    } else {
      console.log('no data')
      alert('No se ha registrado el precio de flete para el proveedor de este camión.')
    }
});

    precio.fail(function(jqXHR, textStatus, errorThrown){
 console.log("error")
  });
}

function calcularFlete() {

  var proveedor_id= $('#fletero').val();
  var banco_id= $('#banco').val();

  if(proveedor_id != banco_id){
  var precio = $.ajax({
    url: '/api/fletes/captura/'+banco_id+'/'+proveedor_id,
    type: 'GET',
    dataType: 'json'
  });

  precio.done(function(data){
    console.log(data)
    if(data.length !== 0){
        $('#flete_id').val(data[0].fletes_id);
        $('#precio_flete').val(data[0].precio);
        getMateriales();
    } else {
      console.log('no data');
      alert('No se ha registrado el precio de flete para el proveedor de este camión.');
    }
});

    precio.fail(function(jqXHR, textStatus, errorThrown){
 console.log("error")
  });
  } else {
        getMateriales();
  }
}

function getMateriales() {
  $('#material-status').html("");
  $('#material_id').html("");
  $('#material-status').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>');
    var proveedor_id = $('#banco').val();
    var concepto_flete = $('#concepto_flete').val();
    if(concepto_flete == 92){
      var url = '/api/materiales/acarreoext/'+proveedor_id;
    } else {
      var url = '/api/materiales/acarreomat/'+proveedor_id;
    }
  var precio = $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json'
  });

  precio.done(function(data){
    console.log(data)
    if(data.length !== 0){
        $('#material_id').removeAttr("disabled");
        $('#material_id').html('<option value="">Material</option>');
        for(var i = 0; i < data.length; i++){
           $('#material_id').append('<option value='+data[i].id+'>'+data[i].nombre_concepto+'</option>');
           if(i+1 == data.length){
              if(concepto_flete == 92){
                $('#precio_material').val(Number(data[0].precio));
                $('#concepto_material').val(data[0].concepto);
                $('#material_id').val(data[0].id);
                getZonas();
              } else {
                $('#material-info').removeAttr("hidden");
           }
           $('#material-status').html("");
        }
      }
  } else {
      console.log('no data')
      alert('No se han registrado materiales de este proveedor.')
    }
});

    precio.fail(function(jqXHR, textStatus, errorThrown){
 console.log("error")
  });
}



function getMaterial() {
  console.log('getting material')
  var material_id=$('#material_id').val();
    var material = $.ajax({
    url: '/api/materiales/'+material_id,
    type: 'GET',
    dataType: 'json'
  });

  material.done(function(data){
    var capacidad = $('#capacidad').val();
    $('#precio_material').val(Number(data.precio));
    $('#concepto_material').val(data.concepto);
    $('#concepto_flete').val(data.concepto);
      getZonas();

    });

  material.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown);
          console.log('no material');
  });
}

function getZonas() {
  $('#zonas-status').html("");
  $('#zonas').html("");
  $('#zonas-status').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>');
console.log("getting zonas");
var concepto = $('#concepto_flete').val();
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



