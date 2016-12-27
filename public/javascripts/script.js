
var path = "http://localhost:3000/";

function createArticulos(acarreos, categoria, obra_id, proveedor, periodo_inicial, periodo_final) {
  $('#button').html('')
  $('#button').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>')
  console.log('sending')
var estimacion = $.ajax({
    url: '/api/estimaciones/nueva',
    type: 'POST',
    dataType: 'json',
    data: { acarreos : acarreos, categoria: categoria, obra: obra_id, proveedor: proveedor, periodo_inicio: periodo_inicial, periodo_final: periodo_final}
  });

  estimacion.done(function(data){
    window.location.replace(path+'estimaciones/'+data.estimacion_id);
    });

  estimacion.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown);
          console.log('error');
  });

}

function getImage() {
console.log("getting image");
$('#photo-status').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>')
var image = $.ajax({
    url: '/photo',
    type: 'GET',
    dataType: 'json'
  });

  image.done(function(data){
    $('#photo-status').html("")
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
      $('#concepto').removeAttr("disabled");
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
  $('#photo-button').attr("disabled", true);
  $('#submit-button').removeAttr("disabled")
  $('#concepto').removeAttr("disabled")
  $('#zonas').removeAttr("disabled")
  $('#material_id').removeAttr("disabled")
}


function savePresupuesto(){
  $('#submit').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>');
  var obra = $('#obra_id').val();
  obra = Number(obra);
  for(var i = 1; i < 30 ; i++){
    var concepto = $('#concepto'+i).val();
    var cantidad = $('#cantidad'+i).val();
    var unidad = $('#unidad'+i).val();
    var zona = $('#zona'+i).val();
    var precio_unitario = $('#precio'+i).val();
    var total = $('#total'+i).val();
    concepto = Number(concepto);
      var presupuestos = $.ajax({
        url: '/api/presupuestos/',
        type: 'POST',
        dataType: 'json',
        data:{obra:obra,concepto:concepto,cantidad:cantidad,unidad:unidad,zona:zona,precio_unitario:precio_unitario,total:total}
      });

      presupuestos.done(function(data){
        console.log(data);
        console.log(i)
        });

      presupuestos.fail(function(jqXHR, textStatus, errorThrown){
        console.log(errorThrown);

      });
}
redirectPresupuestos()
}

function saveMaterial(){
    var concepto = $('#concepto'+i).val();
    var proveedor_id = $('#proveedor_id').val();
    var unidad = $('#unidad').val();
    var precio = $('#precio').val();
    concepto = Number(concepto);
      var material = $.ajax({
        url: '/api/materiales/',
        type: 'POST',
        dataType: 'json',
        data:{concepto:concepto,proveedor_id:proveedor_id,unidad:unidad,precio:precio}
      });

      material.done(function(data){
        console.log(data);
        });

      material.fail(function(jqXHR, textStatus, errorThrown){
        console.log(errorThrown);

      });

redirectMateriales()
}

function redirectPresupuestos(){
window.location.replace(path+'/presupuestos');
}

function redirectPresupuestos(){
window.location.replace(path+'/materiales');
}

function totalesPresupuesto(id1,id2,id3){
  $("#"+id3+"").val('');
  var cantidad = Number($("#"+id1+"").val());
  var precio = Number($("#"+id2+"").val());
  var total = cantidad * precio;
  $("#"+id3+"").val(total);
}
