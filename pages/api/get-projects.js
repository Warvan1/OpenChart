import mysql from 'mysql2';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import mysqlConnection from '../../mysqlConnection.json';

export default withApiAuthRequired(async function myApiRoute(request, response) {
  const { user } = await getSession(request, response);

  //create a connection to the MySQL database
  const connection = mysql.createConnection(mysqlConnection);

  var sql = "select id, title, projectSVG from project where email = ?;";
  connection.query(sql, [user.email], async function (error, results, fields) {
    if (error) throw error;

    //send data to frontend
    response.json({"results": results});
    
  });

  connection.end();
});