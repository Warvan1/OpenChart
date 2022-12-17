import mysql from 'mysql2';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import mysqlConnection from '../../mysqlConnection.json';
import defaultProject from '../../default-project.json';

//create a connection to the MySQL database
const connection = mysql.createConnection(mysqlConnection);

export default withApiAuthRequired(async function myApiRoute(request, response) {
  const { user } = await getSession(request, response);
  
  const title = request.body.title;

  var sql = "insert into project(email, title, projectJSON) values(?, ?, ?);";
  connection.query(sql, [user.email, title, JSON.stringify(defaultProject)], async function (error, results, fields) {
    if (error) throw error;
  })
  response.send({ success: true })

});