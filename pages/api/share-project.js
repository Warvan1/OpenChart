import mysql from 'mysql2';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import mysqlConnection from '../../mysqlConnection.json';

export default withApiAuthRequired(async function myApiRoute(request, response) {
    const { user } = await getSession(request, response);

    //create a connection to the MySQL database
    const connection = mysql.createConnection(mysqlConnection);
    
    const id = request.body.id;
    const email = request.body.email;
    const edit = request.body.edit;

    //if already shared update with new permissions
    var sql = "select id, edit from shared where projectID = ? and email = ?;";
    var editResult = await connection.promise().query(sql, [id, email], async function (error, results, fields) {
        if(error) throw error;
    });

    //add a share record for the first time
    if(editResult[0].length == 0){
        sql = "insert into shared (projectID, owner, email, edit) values(?, ?, ?, ?);";
        connection.query(sql, [id, user.email, email, edit], async function (error, results, fields) {
            if (error) throw error;
        });
    }
    //update share record with new edit permission value if its different
    else if(editResult[0][0].edit != edit){
        sql = "update shared set edit = ? where id = ?;"
        connection.query(sql, [edit, editResult[0][0].id], async function (error, results, fields) {
            if (error) throw error;
        });
    }
    
    response.send({ success: true })

    connection.end();
});