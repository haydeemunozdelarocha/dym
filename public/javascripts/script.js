
var path = "http://localhost:3000/";
var ids = [];


function buscarAcarreos(){
  console.log('buscando')
  var proveedor_id= $('#proveedor_id').val();
  var categoria = $('#categoria').val();
  var date1 = $('#date1').val();
  var date2 = $('#date2').val();
  var obra_id = $('#obra_id').val();
  var data = {
      proveedor_id:proveedor_id,
      categoria: categoria,
      date1: date1,
      date2: date2,
      obra_id:obra_id
  };
  var acarreos = $.ajax({
    url: '/api/acarreos/buscar',
    type: 'POST',
    dataType: 'json',
    data: data
  });

  acarreos.done(function(data){
    console.log(data)
    if(!data.acarreos){
      $('.message').append(data.message)
    }
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
            if(categoria === "flete"){
              console.log(data[j].acarreo_id)
               ids.push(data[j].acarreo_id);
            } else {
              ids.push(data[j].acarreos_mat_id);
            }
            this["row"+j] = table.insertRow(this["row"+j])
            var cell1 = this["row"+j].insertCell(0);
            var cell2 = this["row"+j].insertCell(1);
            var cell3 = this["row"+j].insertCell(2);
            var cell4 = this["row"+j].insertCell(3);
            var cell5 = this["row"+j].insertCell(4);
            var cell6 = this["row"+j].insertCell(5);
            var cell7 = this["row"+j].insertCell(6);
             var cell8 = this["row"+j].insertCell(7);
            cell2.innerHTML = data[j].hora;
            if (categoria === 'flete'){
              cell1.innerHTML = data[j].acarreo_id;
              cell6.innerHTML = data[j].precio;
              cell7.innerHTML = data[j].total_flete;
            } else {
              cell1.innerHTML = data[j].acarreos_mat_id;
              cell6.innerHTML = data[j].precio;
              cell7.innerHTML = data[j].total_material;
            }
            cell3.innerHTML = data[j].nombre_concepto;
            cell4.innerHTML = data[j].nombre_zona;
            cell5.innerHTML = data[j].cantidad + ' ' + data[j].unidad;
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
  var recibo = $('#recibo').val();
  var proveedor = $('#proveedor').val();
  var estimacion = $('#estimacion').val();
  var query = '';
  if(date1 && date2){
    query = query+'date1='+date1+'&date2='+date2+'&';
  }
  if(categoria){
    query= query + 'categoria='+categoria+'&';
  }
  if(obra_id){
    query = query +'obra_id='+obra_id+'&';
  }
  if(zona){
    query = query +'zona='+zona+'&';
  }
  if(concepto){
    query = query +'concepto='+concepto+'&';
  }
  if(estimacion){
    query = query + 'estimacion='+estimacion+'&';
  }
  console.log(proveedor)
  if(proveedor){
    query = query + 'proveedor='+proveedor+'&';
  }
  if(recibo){
    query = query + 'recibo_id='+recibo+'&';
  }
  console.log(query)
  window.location=path+'acarreos?'+query;
}

function filtroEstimaciones(){
  console.log('filtro')
  var date1 = $('#date1').val();
  var date2 = $('#date2').val();
  var obra_id = $('#obra_id').val();
  var proveedor = $('#proveedor').val();
  var numero = $('#numero').val();
   var pagada = $('#pagada').val();
  var query = '';
  if(date1 && date2){
    query = query +'date1='+date1+'&date2='+date2+'&';
  }
  if(obra_id){
    query = query +'obra_id='+obra_id+'&';
  }
  if(proveedor){
    query = query + 'proveedor='+proveedor+'&';
  }
  if(numero){
    query = query + 'numero='+numero+'&';
  }
  if(pagada){
    query = query + 'pagada='+pagada+'&';
  }
  console.log(query)
  window.location=path+'estimaciones?'+query;
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




function savePresupuesto(zonas){
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
  console.log('saving')
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
        allMateriales();
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

function totalesPresupuesto(row){
  console.log(row)
  $("#total"+row+"").val('');
  var cantidad = Number($("#cantidad"+row+"").val());
  var precio = Number($("#precio"+row+"").val());
  var total = cantidad * precio;
  $("#total"+row+"").val(total.toFixed(2));
}

function saveFlete(){
  console.log('saving')
    var proveedor_id = $('#proveedor_id').val();
    var obra_id = $('#obra_id').val();
    var unidad = $('#unidad').val();
    var precio = $('#precio').val();
    var banco = $('#banco_id').val();
    console.log(precio)
    if (!obra_id || !proveedor_id){
      alert('Por favor seleccione la obra y proveedor correspondientes.')
      return
    }
      var fletes = $.ajax({
        url: '/api/fletes/',
        type: 'POST',
        dataType: 'json',
        data:{proveedor_id:proveedor_id,obra_id:obra_id,unidad:unidad,precio:precio,banco:banco}
      });

      fletes.done(function(data){
        allFletes();
        });

      fletes.fail(function(jqXHR, textStatus, errorThrown){
        console.log(errorThrown);

      });
    $('#unidad').val('');
    $('#precio1').val('');
    $('#precio2').val('');
}

function allFletes() {
  // $('#button').html('')
  // $('#button').html('<i class="fa fa-spinner fa-spin" style="font-size:24px; color:#8999A8;"></i>')
  console.log('sending')
  var proveedor_id = $('#proveedor_id').val();
  var obra_id = $('#obra_id').val();
  var fletes = $.ajax({
      url: '/api/fletes/'+proveedor_id+'/'+obra_id,
      type: 'GET'
    });

  fletes.done(function(data){
    console.log(data)
    $('.tabla-fletes').html('');

    var tablaFletes = document.getElementById('todos-fletes');

          for(var j = 0 ; j < data.length; j++){
            this["row"+j] = tablaFletes.insertRow(this["row"+j])
            this["row"+j].className = 'tabla-fletes';
            var cella1 = this["row"+j].insertCell(0);
            var cella2 = this["row"+j].insertCell(1);
            var cella3 = this["row"+j].insertCell(2);
            var cella4 = this["row"+j].insertCell(3);
            var cella5 = this["row"+j].insertCell(4);
            var cella6 = this["row"+j].insertCell(5);
            var cella7 = this["row"+j].insertCell(6);
            cella1.innerHTML = data[j].fletes_id;
            cella2.innerHTML = data[j].nombre_proveedor;
            cella3.innerHTML = data[j].nombre_banco;
            cella4.innerHTML = data[j].unidad;
            cella5.innerHTML = data[j].precio;
            cella6.innerHTML = '<a href="/fletes/editar/'+data[j].fletes_id+'"><span class="glyphicon glyphicon-edit"></span></a>';
            cella7.innerHTML = '<a onclick="deleteFlete('+data[j].fletes_id+')"><span class="glyphicon glyphicon-remove-circle"></span></a>';
            if(j==data.length-1) {
              console.log('done')
            }
         }
    });

  fletes.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown);
          console.log('error');
  });

}

function deleteFlete(flete_id) {
console.log("deleting");
var fletes = $.ajax({
    url: '/api/fletes/borrar/'+flete_id,
    type: 'DELETE'
  });

  fletes.done(function(data){
    console.log(data)
    if($('#proveedor_id').val() || $('#obra_id').val()){
          allFletes()
    } else {
      window.location.reload()
    }
    });

  fletes.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown)
  });
}

function zonaNueva(){
var zona = $('#zonaNueva').val();

var zonas = $.ajax({
    url: '/api/zonas/',
    type: 'POST',
    data:{
      nombre_zona: zona
    }
  });

  zonas.done(function(data){
    console.log(data)
      allZonas()
    });

  zonas.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown)
  });
}

function allZonas(){
  var zonas = $.ajax({
    url: '/api/zonas/',
    type: 'GET'
  });

  zonas.done(function(data){
    var zona = data[data.length-1];
    $('#zonas-checkbox').prepend('<div class="zonas"><input type="checkbox" name="zonas" value="'+zona.zonas_id+'">'+zona.nombre_zona+'</div>');
    $('#zonaNueva').val('');
    });

  zonas.fail(function(jqXHR, textStatus, errorThrown){
    console.log(errorThrown)
  });
}
