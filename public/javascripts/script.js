
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
function savePresupuesto(){

}

function getAcarreos(){
var categoria = $('#categoriaselect').val();
if( categoria === "flete"){
  getFletes()
} else if (categoria === "material") {
  getAcarreosMateriales()
}
}

function getFletes() {
console.log("getting acarreps");
var proveedor_id = $('#proveedorselect').val()
var date1 = $('#periodoinicio').val()
var date2 = $('#periodofinal').val()
var acarreos = $.ajax({
    url: '/api/acarreos/flete/'+proveedor_id+'/'+date1+'/'+date2,
    type: 'GET',
    dataType: 'json'
  });

  acarreos.done(function(data){
    $('#acarreos_table').html('');
    console.log(data)
    for (var i = 0; i < data.length;i++){
        $('#acarreos_table').append('<tr><td>'+data[i].hora+'</td><td>'+data[i].cantidad+' ' + data[i].unidad + '</td><td>'+data[i].precio_flete+'</td></tr>')
        $('#concepto').val('Acarreo de Material');
        $('#unidad').val('m3');
    }
    });

  acarreos.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown);
          console.log('error');
  });


}

function getAcarreosMateriales() {
console.log("getting acarreos");
var proveedor_id = $('#proveedorselect').val();
var date1 = $('#periodoinicio').val()
var date2 = $('#periodofinal').val()
var acarreos = $.ajax({
    url: '/api/acarreos/material/'+proveedor_id,
    type: 'GET',
    dataType: 'json'
  });

  acarreos.done(function(data){
    $('#acarreos_table').html('');
    for (var i = 0; i < data.length;i++){
      console.log(data[i])
        $('#acarreos_table').append('<tr><td>'+data[i].hora+'</td><td>'+data[i].cantidad+' ' + data[i].unidad + '</td><td>$'+data[i].precio+'</td><td>'+data[i].nombre_concepto+'</td></tr>');
    }
    });

  acarreos.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown);
          console.log('error');
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
  window.open("starpassprnt://v1/print/nopreview?html="+encodedHtml+"&back=http://dymingenieros.herokuapp.com/captura");
}

function getTotals(){

}
