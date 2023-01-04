import React, {useState, createContext, useRef} from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Button, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import { useRouter } from 'next/router';
import ShareListEntry from './ShareListEntry';

export const EditShareModalContext = createContext(null);

export default function CreateProject(props){
    const {user, error, isLoading } = useUser();
    const [show, setShow] = useState(false);
    const [editShow, setEditShow] = useState(false);
    const [shareList, setShareList] = useState(null);
    const router = useRouter();
    //handle user Input
    const userInputRef = useRef(null);
    const userEditPermissionRef = useRef(null);

    function handleShow(){
        setShow(true);
    }

    function handleClose(){
        setShow(false);
    }

    function share(){

        fetch(`/api/share-project`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: props.id,
                email: userInputRef.current.value,
                edit: userEditPermissionRef.current.checked,
            })
        })
        setShow(false);
    }

    function editShareShow(){
        setShow(false);
        //get the share list
        fetch(`/api/get-shared-list?id=${props.id}`).then(
            response => response.json()
        ).then(
            data => {
                setShareList(data);
            }
        )
        setEditShow(true);
    }
    
    function editShareClose(){
        setEditShow(false);
    }

    //handle user loading and error
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error.message}</div>;

    return (
        <>
            <Button variant="warning" onClick={handleShow}>Share</Button>
            
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Share</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1" >
                            <Form.Label>Recipient</Form.Label>
                            <Form.Control autoFocus ref={userInputRef} maxLength={128} placeholder="Email of recipient"></Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicCheckbox">
                            <Form.Check type="checkbox" ref={userEditPermissionRef} label="Provide Edit Permission" />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Exit
                    </Button>
                    <Button variant="info" onClick={editShareShow}>
                        Edit Share Permissions
                    </Button>
                    <Button variant="warning" onClick={share}>
                        Share
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={editShow} onHide={editShareClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Share Permissions</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {shareList != null && <Container>
                        <EditShareModalContext.Provider value ={{setEditShow}}>
                            {shareList.results.length == 0 && <p>
                                This project is shared with nobody.
                            </p>}
                            {shareList.results.map((entry) => (
                                <ShareListEntry entry={entry} />
                            ))}
                        </EditShareModalContext.Provider>
                    </Container>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={editShareClose}>
                        Exit
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}