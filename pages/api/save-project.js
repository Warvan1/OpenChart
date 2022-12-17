import mysql from 'mysql2';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import mysqlConnection from '../../mysqlConnection.json';
//import defaultProject from '../../default-project.json';

//create a connection to the MySQL database
const connection = mysql.createConnection(mysqlConnection);

export default withApiAuthRequired(async function myApiRoute(request, response) {
  const { user } = await getSession(request, response);
  const id = request.query.id;

  var sql = "update project set projectJSON = ? where id = ? and email = ?;"
  connection.query(sql, [JSON.stringify(request.body), id, user.email], async function (error, results, fields) {
    if (error) throw error;
  })

  response.send({ success: true });

});