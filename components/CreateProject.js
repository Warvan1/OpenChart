import React, {useState, useRef} from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Button, Form, Modal, Container, Row } from 'react-bootstrap';
import { useRouter } from 'next/router';


export default function CreateProject(props){
    const {user, error, isLoading } = useUser();
    const [show, setShow] = useState(false);
    const titleInputRef = useRef(null);
    const router = useRouter();

    function handleShow(){
        setShow(true);
    }

    function handleClose(){
        setShow(false);
    }

    function handleCreate(){
        setShow(false);

        fetch(`/api/create-project`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: titleInputRef.current.value,
            })
        }).then(() => {
            router.reload(window.location.pathname);
        })

    }

    //handle user loading and error
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error.message}</div>;

    return (
        <div>
            <Button variant="info" onClick={handleShow} style={{width: '12rem'}}>Create Project</Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title> Create A New Project</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1" >
                            <Form.Label>Project Title</Form.Label>
                            <Form.Control autoFocus ref={titleInputRef} maxLength={32}></Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Exit
                    </Button>
                    <Button variant="primary" onClick={handleCreate}>
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}