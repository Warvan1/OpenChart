import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';

export default function ShareListEntry(props){

    function editShareListEntry(edit, id){
        //update on frontend
        props.entry.edit = edit;

        //update on backend
        fetch(`/api/edit-share-list-entry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                edit: edit,
            }),
        });
    }

    function deleteShareListEntry(){

        //delete entry
        fetch(`/api/delete-share-list-entry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: props.entry.id,
            }),
        });
    }

    return (
        <>
            <Row>
                <Col md="auto">
                    <Button variant="secondary">{props.entry.email}</Button>
                </Col>
                <Col md="auto">
                    {props.entry.edit == 0 && <Button variant="secondary" onClick={() => {editShareListEntry(1, props.entry.id)}}>can't edit</Button>}
                    {props.entry.edit == 1 && <Button variant="secondary" onClick={() => {editShareListEntry(0, props.entry.id)}} style={{backgroundColor: "#ff9100", color: "#000000"}}>Can edit</Button>}
                </Col>
                <Col>
                    <Button variant="danger" onClick={deleteShareListEntry}>Delete</Button>
                </Col>
            </Row>
        </>
    );
}