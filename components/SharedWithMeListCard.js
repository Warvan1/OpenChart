import { useRouter } from 'next/router';
import React, {useState, useRef} from 'react';
import { Card, Col, Button, Modal, Form } from 'react-bootstrap';
import DownloadProject from './DownloadProject';

export default function SharedWithMeListCard(props){
    const [show, setShow] = useState(false);
    const titleInputRef = useRef(null);
    const router = useRouter();
    var editLink = `/project-view/${props.project.id}`;
    var viewLink = `/project-view-present/${props.project.id}`;
    
    function confirmDeleteShow(){
        setShow(true);
    }

    function closeConfirmDelete(){
        setShow(false);
    }

    //removes the shared link entry
    function deleteProject(){
        if(props.project.title == titleInputRef.current.value){
            setShow(false);
            //remove from shared table
            console.log(props.project);
            fetch(`/api/delete-share-list-entry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: props.project.sharedID,
                }),
            }).then(() => {
                router.reload(window.location.pathname);
            })
        }
    }

    return (
        <>
            <Col md="auto">
                <Card className="text-black bg-warning mb-3 text-center">
                    <Card.Body>
                        <Card.Title>{props.project.title}</Card.Title>
                        {props.project.projectSVG != null && <object data={"data:image/svg+xml;utf8," + encodeURIComponent(props.project.projectSVG.svg)} width="350" height="350"></object>}
                        {props.project.projectSVG == null && <object data="favicon.ico" width="350" height="350"></object>}
                        <p>created by: {props.project.email}</p>
                        <Card.Footer>
                            {props.project.edit == 1 && <Button variant="info" href={editLink}>Edit</Button>}
                            {props.project.edit == 0 && <Button variant="dark" href={viewLink}>View</Button>}
                            {props.project.projectSVG != null && <DownloadProject text="Download" variant="success" svg={props.project.projectSVG.svg} fileName={props.project.title}/>}
                            <Button variant="danger" onClick={confirmDeleteShow}>Remove</Button>
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
                            <Form.Label>Type "{props.project.title}" To Remove</Form.Label>
                            <Form.Control autoFocus ref={titleInputRef} maxLength={32}></Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeConfirmDelete}>
                        Exit
                    </Button>
                    <Button variant="danger" onClick={deleteProject}>
                        Remove Shared Link
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}