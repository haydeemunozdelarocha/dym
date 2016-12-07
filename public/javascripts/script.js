
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
    $('#material_id').attr("disabled", true);
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
  $('#concepto').attr("disabled", true);
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
  $('#zonas').attr("disabled", true);
  $('#photo-button').removeAttr("disabled")
}

function allowSubmit(){
  $('#photo-button').attr("disabled", true);
  $('#submit-button').removeAttr("disabled")
  $('#concepto').removeAttr("disabled")
  $('#zonas').removeAttr("disabled")
  $('#material_id').removeAttr("disabled")
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

function getPresupuestos(){
  console.log('getting presupuestos')
  var obra_id = $('#obraselect').val();
  var presupuestos = $.ajax({
    url: '/api/presupuestos/'+obra_id,
    type: 'GET',
    dataType: 'json'
  });

  presupuestos.done(function(data){
    if(data[0]){
      console.log(data)
      $('#presupuestos-table').append('<tr><td>Concepto</td><td>Zona</td><td>Cantidad</td><td>Unidad</td><td>Precio Unitario</td><td>Total</td><td>Acumulado</td><td></td></tr>');
      for(var i = 0; i < data.length ; i ++){
              $('#presupuestos-table').append('<tr><td>'+data[i].concepto+'</td><td>'+data[i].nombre_zona+'</td><td>'+data[i].cantidad+'</td><td>'+data[i].unidad+'</td><td>$'+data[i].precio_unitario+'</td><td>$'+data[i].total+'</td><td>'+data[i].acumulado+'</td><td><a href="/api/presupuestos/borrar/'+data[i].presupuestos_id+'?_method=DELETE"><span class="glyphicon glyphicon-remove-circle"></span></a></td></tr>')
      }
    } else {

    }

    });

  presupuestos.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown);

  });
}
