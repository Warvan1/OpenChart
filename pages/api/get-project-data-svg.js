import mysql from 'mysql2';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import mysqlConnection from '../../mysqlConnection.json';

export default withApiAuthRequired(async function myApiRoute(request, response) {
  const { user } = await getSession(request, response);
  const id = request.query.id;

  //create a connection to the MySQL database
  const connection = mysql.createConnection(mysqlConnection);

  //use the user object username with the ID to provide authorization for the project
  var sql = "select id, title, projectSVG from project where id = ? and email = ?;";
  var results = await connection.promise().query(sql, [id, user.email], async function (error, results, fields) {
    if (error) throw error;
  });
  //send data to frontend
  if(results[0].length == 1){
    response.json({"results": results[0]});
  }
  else{
    //check if user has shared access
    sql = "select edit from shared where projectID = ? and email = ?"
    results = await connection.promise().query(sql, [id, user.email], async function (error, results, fields) {
      if (error) throw error;
    });

    // if they have shared edit access
    if(results[0].length == 1){
      //get project data
      sql = "select id, title, projectSVG from project where id = ?;";
      results = await connection.promise().query(sql, [id, user.email], async function (error, results, fields) {
        if (error) throw error;
      });
      //send to frontend
      response.json({"results": results[0]});
    }
    else{
      //if the user doesnt have access return empty array
      response.json({"results": []})
    }
  }
  
  connection.end();
});