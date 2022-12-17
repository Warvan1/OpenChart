import mysql from 'mysql2';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import mysqlConnection from '../../mysqlConnection.json';

//create a connection to the MySQL database
const connection = mysql.createConnection(mysqlConnection);

export default withApiAuthRequired(async function myApiRoute(request, response) {
  const { user } = await getSession(request, response);

  var sql = "select id, title from project where email = ?;";
  connection.query(sql, [user.email], async function (error, results, fields) {
    if (error) throw error;

    //send data to frontend
    response.json({"results": results});
    
  });

});