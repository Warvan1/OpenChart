import mysql from 'mysql2';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import mysqlConnection from '../../mysqlConnection.json';

export default withApiAuthRequired(async function myApiRoute(request, response) {
    const { user } = await getSession(request, response);

    //create a connection to the MySQL database
    const connection = mysql.createConnection(mysqlConnection);
    
    const edit = request.body.edit;
    const id = request.body.id;

    //update the given entry
    var sql = "update shared set edit = ? where id = ? and owner = ?;"
    connection.query(sql, [edit, id, user.email], async function (error, results, fields) {
        if (error) throw error;
    });

    response.send({ "success": true })

    connection.end();
});