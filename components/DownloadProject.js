import React, {useState, useRef} from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Button, Form, Modal } from 'react-bootstrap';
import { useRouter } from 'next/router';


export default function CreateProject(props){
    const {user, error, isLoading } = useUser();
    const [show, setShow] = useState(false);
    const router = useRouter();
    //handle fileName Input
    const fileNameInputRef = useRef(null);
    const [fileNameReact, setFileNameReact] = useState(null);

    function handleShow(){
        setShow(true);
        if(fileNameReact == null){
            setFileNameReact(props.fileName);
        }
    }

    function handleClose(){
        setShow(false);
    }

    //download svg of file
    function downloadSVG(){
        var fileName = fileNameReact;
        if(fileNameInputRef.current != null){
            if(fileNameInputRef.current.value != ""){
                fileName = fileNameInputRef.current.value;
                setFileNameReact(fileName);
            }
        }
        fileName = fileName + ".svg";

        var url = "data:image/svg+xml;utf8," + encodeURIComponent(props.svg);
        const link = document.createElement("a");
        link.download = fileName;
        link.href = url;
        link.click();
        setShow(false);
    }

    //download png of file
    function downloadPNG(){
        var fileName = fileNameReact;
        if(fileNameInputRef.current != null){
            if(fileNameInputRef.current.value != ""){
                fileName = fileNameInputRef.current.value;
                setFileNameReact(fileName);
            }
        }
        fileName = fileName + ".png";

        fetch(`/api/convert-to-png?data=${encodeURIComponent(props.svg)}`).then(
            async (response) => {
                //create an image object from the image returned form the backend
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                window.URL.revokeObjectURL(blobUrl);
            }
        )
        setShow(false);
    }

    //handle user loading and error
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error.message}</div>;

    return (
        <>
            <Button variant={props.variant} onClick={handleShow}>{props.text}</Button>
            
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Download</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1" >
                            <Form.Label>File Name</Form.Label>
                            <Form.Control autoFocus ref={fileNameInputRef} maxLength={32} defaultValue={props.fileName}></Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Exit
                    </Button>
                    <Button variant="info" onClick={downloadSVG}>
                        Download (.svg)
                    </Button>
                    <Button variant="warning" onClick={downloadPNG}>
                        Download (.png)
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}