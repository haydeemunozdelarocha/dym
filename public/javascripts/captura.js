// var path = "http://localhost:3000/";
var path = 'http://dymingenieros.herokuapp.com';

function calcularFlete() {
  console.log('calculando');
  var concepto_flete = $('#categoria').val();
  var categoria_fletero =  $('#fletero_categoria').val();
  if(concepto_flete === "92"){
    console.log('92')
    $('#material-info').attr("hidden",true);
    $('#material_id').removeAttr("disabled");
    getBancos('acarreo');
    $('#concepto_flete').val(concepto_flete);
  } else if (concepto_flete === "100"){
    if(categoria_fletero !== "flete/banco") {
      console.log('no es flete/banco');
      $('#bancoinfo').attr("hidden",true);
      $('#banco').attr("disabled");
      getBancos('material');
    } else {
    console.log(concepto_flete);
    $('#bancoinfo').attr("hidden",true);
    $('#banco').removeAttr("disabled");
    $('#concepto_flete').val(concepto_flete);
    getBancos("todos");
    }
  } else {
    $('#bancoinfo').attr("hidden",true);
    $('#banco').attr("disabled");
    $('#material-info').attr("hidden",true);
    $('#material_id').attr("disabled");
    calcularAcarreoInt();
  }
}


function getBancos(categoria){
  console.log('getting bancos')
  $('#banco-status').html("");
  $('#banco-status').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>');
  $('#banco').html('');
   var proveedor_id =   $('#fletero').val();
  if(categoria === "acarreo") {
    var url = '/api/banco/acarreoext/'+proveedor_id;
  } else if (categoria === "todos"){
    var url = '/api/banco/todos';
  } else {
    var url = '/api/banco/materiales/'+proveedor_id;
  }

   var bancos = $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json'
  });

  bancos.done(function(data){
    if(data.length !== 0){
      console.log(data)
      for(var i =0; i <= data.length;i++){
              if(data[i]){
              $('#banco').html('<option value="">Banco</option>');
              $('#banco').append('<option value='+data[i].banco+'>'+data[i].razon_social+'</option>');
              }
            if(i == data.length-1){
            if(categoria === "todos"){
                  var proveedor_id = $('#fletero').val();
                  console.log(proveedor_id)
                  $('#banco').val(proveedor_id);
                  console.log($('#banco').val())
                  if($('#banco').val()){
                  $('#banco-status').html("");
                  getMateriales();
                  }
            } else {
                $('#bancoinfo').removeAttr("hidden");
                console.log('done')
                $('#banco-status').html("");
                $('#banco').removeAttr("disabled");
                $('#banco').removeAttr("hidden");
            }
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

function calcularAcarreoEM() {
  var capacidad = $('#capacidad').val();
  var proveedor_id;
  var concepto_flete = $('#categoria').val();
  var camion_categoria = $('#camion_categoria').val();
  var apiURL;
  if(concepto_flete === "92"){
    proveedor_id = $('#banco').val();
    $('#concepto_flete').val('92');
    $('#proveedor_id').val(proveedor_id);
    apiURL = '/api/materiales/acarreoext/'+proveedor_id;
      var data = new Object();
    if($('#obra').val()){
      data.obra_id = $('#obra').val();
    }
  } else if (camion_categoria === "pipa"){
    getMateriales();
  } else if (concepto_flete === "100"){
    if ($('#fletero_categoria').val() === "flete/banco"){
      $('#banco-info').attr("hidden");
       $('#banco').attr("disabled");
       getMateriales();
    } else {
    proveedor_id = $('#banco').val();
    apiURL = '/api/materiales/acarreomat/'+proveedor_id;
  var data = new Object();
    if($('#obra').val()){
      data.obra_id = $('#obra').val();
    }
    }
  }
  var precio = $.ajax({
    url: apiURL,
    type: 'GET',
    dataType: 'json',
    data: data
  });

  precio.done(function(data){
    console.log(data)
    if(data.length !== 0){
    $('#flete_id').val(data[0].fletes_id);
        $('#precio_material').val(data[0].precio);
        $('#concepto_flete').val(data[0].concepto);
        $('#concepto_material').val(data[0].concepto);
        $('#material_id').val(data[0].material_id);
        totalFlete();
    } else {
      console.log('no data');
      alert('No se ha registrado el precio de flete para el proveedor de este camión.');
    }
});

    precio.fail(function(jqXHR, textStatus, errorThrown){
 console.log("error")
  });
}

function getMateriales() {
  $('#material-status').html("");
  $('#material_id').html("");
  $('#material-status').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>');
    var proveedor_id = $('#banco').val();
    console.log(proveedor_id);
  var data = new Object();
    if($('#obra').val()){
      data.obra_id = $('#obra').val();
    }
    console.log(data)
  var precio = $.ajax({
    url: '/api/materiales/acarreomat/'+proveedor_id,
    type: 'GET',
    dataType: 'json',
    data: data
  });

  precio.done(function(data){
    console.log(data)
    if(data.length !== 0){
        $('#material-info').removeAttr("hidden");
        $('#material_id').html('<option value="">Material</option>');
        for(var i = 0; i < data.length; i++){
           $('#material_id').append('<option value='+data[i].id+'>'+data[i].nombre_concepto+'</option>');
           if(i+1 == data.length){
            $('#material_id').removeAttr("disabled");
              $('#material-status').html("");
           }
        }
      }
     else {
      console.log('no data')
      alert('No se han registrado materiales de este proveedor.')
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


    var precio = $.ajax({
    url: '/api/fletes/precio/',
    type: 'POST',
    dataType: 'json',
    data:{
      proveedor_id:proveedor_id,
      banco_id:banco_id,
      concepto:concepto_flete
    }
  });

  precio.done(function(data){
    console.log(data)
    $('#flete_id').val(data[0][0].fletes_id);
    $('#precio_flete').val(data[0][0].precio*capacidad);
    $('#unidad').val(data[0][0].unidad);
      if (concepto_flete === "92"){
        $('#material_id').append('<option value="'+data[1][0].id+'">'+data[1][0].concepto+'</option>');
        $('#material_id').removeAttr("disabled");
        $('#material_id').val(data[1][0].id);
        getZonas();
      } else if (concepto_flete === "100"){
        getMateriales();
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
    $('#precio_material').val(Number(data.precio)*capacidad);
    $('#concepto_material').val(data.concepto);
    $('#concepto_flete').val(data.concepto);
      getZonas();

    });

  material.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown);
          console.log('no material');
  });
}


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
      if(data[0].categoria === "pipa"){
        checkProveedor();
      } else {
        $('.categoria-info').removeAttr("hidden");
        $('#categoria').removeAttr("disabled");
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

function checkProveedor(){
if( $('#fletero_categoria').val() !== "flete/banco"){
  console.log('no es flete/banco');
  $('#bancoinfo').removeAttr("hidden");
  console.log('not hidden');
  $('#banco').removeAttr("disabled");
} else {
    console.log('flete/banco')
    var proveedor_id = $('#fletero').val();
    $('#banco').val(proveedor_id);
    getMateriales();
 }
}

