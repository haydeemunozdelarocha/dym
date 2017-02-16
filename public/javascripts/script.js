
var path = "http://locahost:3000/";

function buscarAcarreos(){
  console.log('buscando')
  var proveedor_id= $('#proveedor_id').val();
  var categoria = $('#categoria').val();
  var date1 = $('#date1').val();
  var date2 = $('#date2').val();
  var data = {
      proveedor_id:proveedor_id,
      categoria: categoria,
      date1: date1,
      date2: date2
  };
  var acarreos = $.ajax({
    url: '/api/acarreos/buscar',
    type: 'POST',
    dataType: 'json',
    data: data
  });

  acarreos.done(function(data){
    var ids = [];
    var titles;
    $('#resultados').html('<span class="glyphicon glyphicon-search"></span><div class="panel panel-default" style="visibility:hidden;><div class="panel-body" style="height: 200px; overflow-x:scroll;"><table id ="resultados-table" class="table table-striped"></table></div></div>')
    var table = document.getElementById('resultados-table');
    var row = table.insertRow(row);
    if(categoria === 'flete'){
      titles = ['Total','Precio Unitario','Cantidad','Zona', 'Concepto', 'Camión', 'Fecha','ID'];
    } else if (categoria === 'material') {
      titles = ['Total','Precio Unitario','Cantidad','Zona', 'Concepto', 'Material_id','Fecha','ID'];
    }
      for(var i = 0; i < titles.length; i++) {
        this["cell"+i] = row.insertCell(0);
        this["cell"+i].innerHTML = titles[i];
        if (i == titles.length-1){
          data = data.acarreos;
          for(var j = 0 ; j < data.length; j++){
            ids.push(data[j].acarreo_id);
            this["row"+j] = table.insertRow(this["row"+j])
            var cell1 = this["row"+j].insertCell(0);
            var cell2 = this["row"+j].insertCell(1);
            var cell3 = this["row"+j].insertCell(2);
            var cell4 = this["row"+j].insertCell(3);
            var cell5 = this["row"+j].insertCell(4);
            var cell6 = this["row"+j].insertCell(5);
            var cell7 = this["row"+j].insertCell(6);
            var cell8 = this["row"+j].insertCell(7);
            cell1.innerHTML = data[j].acarreo_id;
            cell2.innerHTML = data[j].hora;
            if (categoria === 'flete'){
              cell3.innerHTML = data[j].numero;
              cell7.innerHTML = data[j].precio_flete;
            } else {
              cell3.innerHTML = data[j].material_id;
              cell7.innerHTML = data[j].precio;
            }
            cell4.innerHTML = data[j].nombre_concepto;
            cell5.innerHTML = data[j].nombre_zona;
            cell6.innerHTML = data[j].cantidad;
            cell8.innerHTML = data[j].total;
            if(j==data.length-1) {
              getTotales(ids,categoria);
            }
         }
        }
      }
    });

  acarreos.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown);
          console.log('error');
  });
}

function clearResultados(){
  $('#resultados').html('');
}

function getTotales(acarreos,categoria,obra,zona) {
  // $('#button').html('')
  // $('#button').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>')
  console.log('sending')
  console.log(acarreos)
  acarreos = acarreos.toString()
var estimacion = $.ajax({
    url: '/api/estimaciones/sumar',
    type: 'POST',
    data: {acarreos: acarreos, categoria:categoria}
  });

  estimacion.done(function(data){
    console.log(data)
    var totales =data.totales;
    var presupuestos = data.presupuestos;
    $('#totales').html('<div class="panel panel-default"><div class="panel-body" style="height: 200px; overflow-x:scroll;"><table id ="totales-table" class="table table-striped"></table></div></div>')
    var totalesTable = document.getElementById('totales-table');
    var row = totalesTable.insertRow(row);
        var cella1 = row.insertCell(0);
        var cella2 = row.insertCell(0);
        var cella3 = row.insertCell(0);
        var cella4 = row.insertCell(0);
        var cella5 = row.insertCell(0);
        var cella6 = row.insertCell(0);
        var cella7 = row.insertCell(0);
        var cella8 = row.insertCell(0);
        cella1.innerHTML = 'Subtotal';
        cella2.innerHTML = 'Acumulado Actual';
        cella3.innerHTML = 'Acumulado Anterior';
        cella4.innerHTML = 'Esta Estimación';
        cella5.innerHTML = 'Cantidad Presupuestada';
        cella6.innerHTML = 'Zona';
        cella7.innerHTML = 'Precio Unitario';
        cella8.innerHTML = 'Concepto';

          for(var j = 0 ; j < totales.length; j++){
            this["row"+j] = totalesTable.insertRow(this["row"+j])
            var cell1 = this["row"+j].insertCell(0);
            var cell2 = this["row"+j].insertCell(1);
            var cell3 = this["row"+j].insertCell(2);
            var cell4 = this["row"+j].insertCell(3);
            var cell5 = this["row"+j].insertCell(4);
            var cell6 = this["row"+j].insertCell(5);
            var cell7 = this["row"+j].insertCell(6);
            var cell8 = this["row"+j].insertCell(7);
            if (categoria === 'flete'){
              cell1.innerHTML = totales[j].concepto_flete;
              cell2.innerHTML = totales[j].precio_flete;
            } else {
              cell1.innerHTML = totales[j].material_id;
            }
            cell3.innerHTML = totales[j].zona_id;
            console.log(presupuestos[j])
            cell5.innerHTML = presupuestos[j].total;
            cell4.innerHTML = totales[j].total_cantidad;
            cell4.innerHTML = presupuestos[j].acumulado;
            cell5.innerHTML = totales[j].total_concepto;
            if(j==totales.length-1) {
              console.log('done')
            }
         }
    });

  estimacion.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown);
          console.log('error');
  });

}

function createArticulos(acarreos, categoria, obra_id, proveedor, periodo_inicial, periodo_final) {
  // $('#button').html('')
  // $('#button').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>')
  console.log('sending')
var estimacion = $.ajax({
    url: '/api/estimaciones/nueva',
    type: 'POST',
    dataType: 'json',
    data: { acarreos : acarreos, categoria: categoria, obra: obra_id, proveedor: proveedor, periodo_inicio: periodo_inicial, periodo_final: periodo_final}
  });

  estimacion.done(function(data){
    console.log(data)
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
    type: 'POST',
    dataType: 'json'
  });

  image.done(function(data){
    if (data === "Camera offline"){
      alert('Cámara desconectada!');
      $('#photo-status').html("")
    } else {
        $('#photo-status').html("")
        $('#photo').val(data);
        allowSubmit()
        $('#photo-button').attr("disabled", true);
    }
    });

  image.fail(function(jqXHR, textStatus, errorThrown){
      alert('Cámara desconectada!');
      $('#photo-status').html("")
  });


}

function getMateriales() {
console.log("getting materiales");
$('#material-status').html("");
$('#material-status').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>');
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
    $('#material-status').html("");
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
  $('#search-status').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>');
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
