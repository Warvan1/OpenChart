import mysql from 'mysql2';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import mysqlConnection from '../../mysqlConnection.json';

export default withApiAuthRequired(async function myApiRoute(request, response) {
    const { user } = await getSession(request, response);

    //create a connection to the MySQL database
    const connection = mysql.createConnection(mysqlConnection);
    
    const id = request.query.id;

    //retrieve shared list for a given project
    var sql = "select id, email, edit from shared where projectID = ? and owner = ?;";
    connection.query(sql, [id, user.email], async function (error, results, fields) {
        if(error) throw error;
        //send data to frontend
        response.send({ "results": results })
    });

    connection.end();
});