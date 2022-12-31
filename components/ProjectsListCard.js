import { useRouter } from 'next/router';
import React, {useState, useRef} from 'react';
import { Card, Row, Button, Modal, Form } from 'react-bootstrap';

export default function ProjectsListCard(props){
    const [show, setShow] = useState(false);
    const titleInputRef = useRef(null);
    var viewLink = `/project-view/${props.project.id}`
    const router = useRouter();
    
    function confirmDeleteShow(){
        setShow(true);
    }

    function closeConfirmDelete(){
        setShow(false);
    }

    function deleteProject(){
        if(props.project.title == titleInputRef.current.value){
            setShow(false);
            fetch(`/api/delete-project?id=${props.project.id}`).then(
                response => response.json()
            ).then(() => {
                router.reload(window.location.pathname);
            })
        }
    }

    return (
        <>
            <Row className="justify-content-md-center">
                <Card border="dark" style={{width: '24rem'}}>
                    <Card.Body>
                        <Card.Title>{props.project.title}</Card.Title>
                        <Button variant="dark" href={viewLink}>View</Button>
                        <Button variant="danger" onClick={confirmDeleteShow}>Delete</Button>
                    </Card.Body>
                </Card>
            </Row>

            <Modal show={show} onHide={closeConfirmDelete}>
                <Modal.Header closeButton>
                    <Modal.Title> Delete: {props.project.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1" >
                            <Form.Label>Type "{props.project.title}" To Delete</Form.Label>
                            <Form.Control autoFocus ref={titleInputRef} maxLength={32}></Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeConfirmDelete}>
                        Exit
                    </Button>
                    <Button variant="danger" onClick={deleteProject}>
                        Delete Forever
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}