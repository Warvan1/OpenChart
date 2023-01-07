import Link from 'next/link';
import { useRouter } from 'next/router';
import React, {useState, useRef, useEffect} from 'react';
import { Card, Col, Button, Modal, Form } from 'react-bootstrap';
import CreateProject from './CreateProject';
import DownloadProject from './DownloadProject';
import ShareProject from './ShareProject';

export default function ProjectsListCard(props){
    const [show, setShow] = useState(false);
    const titleInputRef = useRef(null);
    const router = useRouter();
    var editLink = `/project-view/${props.project.id}`;
    
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
                        {props.project.projectSVG != null && <Link href={editLink}><img src={"data:image/svg+xml;utf8," + encodeURIComponent(props.project.projectSVG.svg)} width="350" height="350"></img></Link>}
                        {props.project.projectSVG == null && <Link href={editLink}><img src="favicon.ico" width="350" height="350"></img></Link>}
                        <Card.Footer className="card-footer text-muted bg-transparent px-0">
                            {props.project.projectSVG != null && <DownloadProject text="Download" variant="success" svg={props.project.projectSVG.svg} fileName={props.project.title}/>}
                            <CreateProject text="Copy" title={props.project.title + " (copy)"} projectJSON={props.project.projectJSON} projectSVG={props.project.projectSVG}/>
                            <ShareProject id={props.project.id}/>
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