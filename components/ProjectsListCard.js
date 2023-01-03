import { useRouter } from 'next/router';
import React, {useState, useRef} from 'react';
import { Card, Col, Button, Modal, Form } from 'react-bootstrap';
import DownloadProject from './DownloadProject';

export default function ProjectsListCard(props){
    const [show, setShow] = useState(false);
    const titleInputRef = useRef(null);
    const router = useRouter();
    var viewLink = `/project-view/${props.project.id}`;
    
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
            <Col md="auto">
                <Card className="text-white bg-dark mb-3 text-center">
                    <Card.Body>
                        <Card.Title>{props.project.title}</Card.Title>
                        {props.project.projectSVG != null && <object data={"data:image/svg+xml;utf8," + encodeURIComponent(props.project.projectSVG.svg)} width="300" height="300"></object>}
                        {props.project.projectSVG == null && <object data="defaultProjectIcon.svg" width="300" height="300"></object>}
                        <Card.Footer>
                            <Button variant="info" href={viewLink}>Edit</Button>
                            {props.project.projectSVG != null && <DownloadProject text="Download" variant="success" svg={props.project.projectSVG.svg} fileName={props.project.title}/>}
                            <Button variant="danger" onClick={confirmDeleteShow}>Delete</Button>
                        </Card.Footer>
                    </Card.Body>
                </Card>
            </Col>

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