var mysql = require('promise-mysql');


var db_config      =    mysql.createPool({
    connectionLimit : 150, //important
    host     : process.env.DYM_DB_HOST,
    user     : process.env.DYM_DB_USER,
    password : process.env.DYM_DB_PSS,
    database : 'heroku_aa5f4bff4de7c3d',
    debug    :  false,
    multipleStatements: true,
    queueLimit: 50,
    acquireTimeout:1000000,
    connectTimeout:0
});

function handle_database() {
  console.log('connecting')
db_config.getConnection().then(function(connection) {
    conn = connection;
    return connection;
  }).catch(function(error) {
    console.log("Connect failed", error);
   setTimeout(handleDisconnect, 2000);
   return
  }).finally(function() {
    if (conn) {
      console.log('done using connection')
      return
    } else {
      handleDisconnect()
    }
  });
  console.log('Conectado');
}

db_config.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
      console.log('reconnecting')
    } else if(err.code === 'ECONNREFUSED'){
      console.log(err.code)
      handleDisconnect();
    } else if(err.code === 'ER_BAD_FIELD_ERROR'){
      console.log(err.code)
      db_config.end();
      handleDisconnect();
    } else if(err.code === 'ER_USER_LIMIT_REACHED'){
      console.log(err.code)
      handleDisconnect();
    }else {
      handleDisconnect();
    }
  });

db_config.on('data', function(){
  console.log('getting data')
});

db_config.on('end', function() {
  console.log('end db config')
  db_config.end();
});

function handleDisconnect(res,req,err) {
console.log('reconnecting...')
db_config.getConnection(function(err){
  if(err){
    console.log('No se pudo conectar a la base de datos');
    handle_database();
    return;
  }
  console.log('Conectado');
});
}

handle_database();

function disconnect() {
  db_config.end(function onEnd(error) {
  console.log('ending connection')
  db.end()
  if (error) throw error;
  // All connections are now closed once they have been returned with connection.release()
  // i.e. this waits for all consumers to finish their use of the connections and ends them.
});
}


module.exports = db_config;
