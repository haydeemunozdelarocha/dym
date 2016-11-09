var mysql = require('mysql');


var db_config      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : process.env.DYM_DB_HOST,
    user     : process.env.DYM_DB_USER,
    password : process.env.DYM_DB_PSS,
    database : 'heroku_20b3705599c7d39',
    debug    :  false
});

function handle_database(req,res) {
db_config.getConnection(function(err){
  if(err){
    console.log('No se pudo conectar a la base de datos');
    setTimeout(handleDisconnect, 2000);
    return;
  }
  console.log('Conectado');
});
}

db_config.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();
      console.log('reconnecting')                       // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });

function handleDisconnect() {

db_config.connect(function(err){
  if(err){
    console.log('No se pudo conectar a la base de datos');
    setTimeout(handleDisconnect, 2000);
    return;
  }
  console.log('Conectado');
});
}

handle_database();

module.exports = db_config;
