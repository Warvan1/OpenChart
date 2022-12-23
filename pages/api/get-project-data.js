import mysql from 'mysql2';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import mysqlConnection from '../../mysqlConnection.json';

export default withApiAuthRequired(async function myApiRoute(request, response) {
  const { user } = await getSession(request, response);
  const id = request.query.id;

  //create a connection to the MySQL database
  const connection = mysql.createConnection(mysqlConnection);

  //use the user object username with the ID to provide authorization for the project
  var sql = "select id, title, projectJSON from project where id = ? and email = ?;";
  connection.query(sql, [id, user.email], async function (error, results, fields) {
    if (error) throw error;

    //send data to frontend
    response.json({"results": results});
  });

  connection.end();
});