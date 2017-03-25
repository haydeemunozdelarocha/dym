
var path = "http://localhost:3000/";
var ids = [];
var popUpWindow;

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
    var titles;
    var container = document.getElementById('table')
    var table = document.createElement('table');
    var panel = document.createElement('div');
    var panel2 = document.createElement('div');
    panel.setAttribute('class','panel panel-default');
    panel2.setAttribute('class','panel-heading');
    panel2.innerHTML += 'Resultados';
    table.setAttribute('id','resultados-table');
    table.setAttribute('class','table');
    container.appendChild(panel);
    panel.appendChild(panel2);
    panel.appendChild(table);
    var row = table.insertRow(row);
    if(categoria === 'flete'){
      titles = ['Foto','Total','Precio Unitario','Cantidad','Zona', 'Concepto', 'Fecha','ID'];
    } else if (categoria === 'material') {
      titles = ['Foto','Total','Precio Unitario','Cantidad','Zona', 'Concepto', 'Fecha','ID'];
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
              cell6.innerHTML = data[j].precio;
            } else {
              cell6.innerHTML = data[j].precio;
            }
            cell3.innerHTML = data[j].nombre_concepto;
            cell4.innerHTML = data[j].nombre_zona;
            cell5.innerHTML = data[j].cantidad;
            cell7.innerHTML = data[j].total;
            cell8.innerHTML = '<a href="'+data[j].foto+'" onclick="window.open(this.href, "mywin","left=20,top=20,width=600,height=340,toolbar=1,resizable=0"); return false;"><span class="glyphicon glyphicon-camera"></span></a>'
         }
        }
      }
      $('#estimacion-button').html('<button type="submit" class="btn btn-primary" style="margin-top:3%; margin-bottom:3%; display:block;float:right" onclick="getTotales()">Crear Estimación</button>')});

  acarreos.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown);
          console.log('error');
  });
}

function filtroAcarreos(){
  console.log('filtro')
  var date1 = $('#date1').val();
  var date2 = $('#date2').val();
  var categoria = $('#categoria').val();
  var obra_id = $('#obra_id').val();
  var zona = $('#zona').val();
  var concepto = $('#concepto').val();
    console.log(date1)
  window.location=path+'acarreos?date1='+date1+'&date2='+date2+'&categoria='+categoria+'&obra_id='+obra_id+'&zona='+zona+'&concepto='+concepto;
}

function clearResultados(){
  $('#resultados').html('');
}

function getTotales() {
  $('#estimacion-button').html('')
  $('#estimacion-button').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>')
  var proveedor_id= $('#proveedor_id').val();
  var categoria = $('#categoria').val();
  var date1 = $('#date1').val();
  var date2 = $('#date2').val();
  var acarreos = ids;
  console.log('sending')
  console.log(acarreos)
  acarreos = acarreos.toString()
var estimacion = $.ajax({
    url: '/api/estimaciones/',
    type: 'POST',
    data: {acarreos: acarreos, categoria:categoria, proveedor_id:proveedor_id,date1:date1,date2:date2}
  });

  estimacion.done(function(data){
    console.log(data)
    window.location.replace('/estimaciones/'+data.estimacion_id);
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

function guardarEstimacion() {
console.log("getting image");
var estimacion_id = $('#estimacion_id').val();
var autorizacion = $.ajax({
    url: '/api/estimaciones/autorizacion/' + estimacion_id,
    type: 'GET',
    dataType: 'json'
  });

  autorizacion.done(function(data){
    console.log(data)
    });

  autorizacion.fail(function(jqXHR, textStatus, errorThrown){
 console.log("error")
  });


}

function getMateriales(categoria) {
if (categoria === "material"){
console.log("getting materiales");
var proveedor_id = $('#proveedor_id').val();
$('#material-status').html("");
$('#material-status').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>');
} else if (categoria === "acarreo"){
  var proveedor_id = $('#fletero').val();
  $('#concepto-status').html("");
  $('#concepto-status').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>');
}
  var materiales = $.ajax({
    url: '/api/materiales/proveedor/'+proveedor_id+'/'+categoria,
    type: 'GET',
    dataType: 'json'
  });

  materiales.done(function(data){
    console.log(data)
    if(data.length < 1){
      alert("No se han registrado los precios de este proveedor.")
    } else if (categoria === "material"){
          $('#material_id').removeAttr("disabled")
          $('#material_id').html('');
          $('#material_id').html('<option value="">Material</option>');
          $('#material-status').html("");
          for(var i = 0; i < data.length ; i ++){
            $('#material_id').append('<option value="'+data[i].id+'">'+data[i].nombre_concepto+'</option>');
          }
    }
    else if (categoria === "acarreo"){
      console.log('acarreo')
          $('#concepto').removeAttr("disabled")
          $('#concepto').html('');
          $('#concepto').html('<option value="">Concepto</option>');
          $('#concepto-status').html("");
          for(var i = 0; i < data.length ; i ++){
            $('#concepto').append('<option value="'+data[i].concepto+'">'+data[i].nombre_concepto+'</option>');
          }
    }
    });

  materiales.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown);
    console.log('no materiales');
  });
}


function getBase64Image(url,id) {
console.log("sending to back");

var photoData = {url:url, id:id}
console.log(photoData);
  var photo = $.ajax({
    url: '/photo/convertir',
    type: 'POST',
    data: photoData
  });

  photo.done(function(data){
    console.log(data)
    document.getElementById(id).src = data;
    });

  photo.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown);
  });
}


function getMaterial(categoria) {
  if (categoria === "acarreo"){
    var material_id = $('#concepto').val();
  } else if (categoria === "material"){
    var material_id = $('#material_id').val();
  }
console.log("getting material");
  var material = $.ajax({
    url: '/api/materiales/'+material_id,
    type: 'GET',
    dataType: 'json'
  });

  material.done(function(data){
    console.log(data.precio)
      if (categoria === "acarreo"){
            $('#precio_flete').val('');
            $('#precio_flete').val(data.precio);
            $('#proveedor_id').removeAttr("disabled")
      } else if (categoria === "material"){
            $('#precio_material').val('');
            $('#precio_material').val(data.precio);
            $('#zonas').removeAttr("disabled")
      }
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
      $('#scanner').attr("readonly", true);
      $('#fletero').val(data[0].proveedor_id)
      getMateriales('acarreo')
      $('#search-status').html("");
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
        window.location=path+'materiales'
        });

      presupuestos.fail(function(jqXHR, textStatus, errorThrown){
        console.log(errorThrown);

      });
}
redirectPresupuestos(obra)
}


function saveMaterial(){
    var concepto = $('#concepto').val();
    var proveedor_id = $('#proveedor_id').val();
    var obra_id = $('#obra_id').val();
    var unidad = $('#unidad').val();
    var precio = $('#precio').val();
    if (!obra_id || !proveedor_id){
      alert('Por favor seleccione la obra y proveedor correspondientes.')
      return
    }
    concepto = Number(concepto);
      var material = $.ajax({
        url: '/api/materiales/',
        type: 'POST',
        dataType: 'json',
        data:{concepto:concepto,proveedor_id:proveedor_id,obra_id:obra_id,unidad:unidad,precio:precio}
      });

      material.done(function(data){
        allMateriales()
        });

      material.fail(function(jqXHR, textStatus, errorThrown){
        console.log(errorThrown);

      });
    $('#concepto').val('');
    $('#unidad').val('');
    $('#precio').val('');
}

function allMateriales() {
  // $('#button').html('')
  // $('#button').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>')
  console.log('sending')
  var proveedor_id = $('#proveedor_id').val();
  var obra_id = $('#obra_id').val();
var materiales = $.ajax({
    url: '/api/materiales/'+proveedor_id+'/'+obra_id,
    type: 'GET'
  });

  materiales.done(function(data){
    console.log(data)
    $('.tabla-materiales').html('');

    var tablaMateriales = document.getElementById('todos-materiales');

          for(var j = 0 ; j < data.length; j++){
            this["row"+j] = tablaMateriales.insertRow(this["row"+j])
            this["row"+j].className = 'tabla-materiales';
            var cella1 = this["row"+j].insertCell(0);
            var cella2 = this["row"+j].insertCell(1);
            var cella3 = this["row"+j].insertCell(2);
            var cella4 = this["row"+j].insertCell(3);
            var cella5 = this["row"+j].insertCell(4);
            var cella6 = this["row"+j].insertCell(5);
            var cella7 = this["row"+j].insertCell(6);
            cella1.innerHTML = data[j].id;
            cella2.innerHTML = data[j].nombre_concepto;
            cella3.innerHTML = data[j].razon_social;
            cella4.innerHTML = data[j].unidad;
            cella5.innerHTML = data[j].precio;
            cella6.innerHTML = '<a href="/materiales/editar/'+data[j].id+'"><span class="glyphicon glyphicon-edit"></span></a>';
            cella7.innerHTML = '<a onclick="deleteMaterial('+data[j].id+')"><span class="glyphicon glyphicon-remove-circle"></span></a>';
            if(j==data.length-1) {
              console.log('done')
            }
         }
    });

  materiales.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown);
          console.log('error');
  });

}

function deleteMaterial(material_id) {
console.log("deleting");
var material = $.ajax({
    url: '/api/materiales/borrar/'+material_id,
    type: 'DELETE'
  });

  material.done(function(data){
    console.log(data)
    if($('#proveedor_id').val() || $('#obra_id').val()){
          allMateriales()
    } else {
      window.location.reload()
    }
    });

  material.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown)
  });
}

function redirectPresupuestos(obra){
        var presupuesto = $.ajax({
        url: '/api/presupuestos/agregar/'+obra,
        type: 'PUT',
        dataType: 'json'
      });

      presupuesto.done(function(data){
        console.log(data);
        window.location.reload()
        });

      presupuesto.fail(function(jqXHR, textStatus, errorThrown){
        console.log(errorThrown);

      });
}

function totalesPresupuesto(id1,id2,id3){
  $("#"+id3+"").val('');
  var cantidad = Number($("#"+id1+"").val());
  var precio = Number($("#"+id2+"").val());
  var total = cantidad * precio;
  $("#"+id3+"").val(total);
}
