import React, { useState, useEffect, useContext, useRef } from 'react';
import { Button, Form, Modal, Container, Row, Col } from 'react-bootstrap';
import { StyleContext } from './ProjectEditor';
import { SketchPicker } from 'react-color';
import { BrushIcon, BucketIcon, SquareIcon } from './Icons';

export default function StyleEditor(props){
    //get styles from page
    const {styles, setStyles} = useContext(StyleContext);
    //object to store temp styles
    const [tempStyles, setTempStyles] = useState(styles);
    //used to show and hide the editor
    const [show, setShow] = useState(false);
    //used to hold the currient color picker color
    const [color, setColor] = useState('#ffffff');
    //used to hold the currient present colors
    const [presetColors, setpresetColors] = useState(['#D0021B', '#F5A623', '#F8E71C', '#8B572A', '#7ED321', '#417505', '#BD10E0', '#9013FE', '#0C0AF3', '#4A90E2', '#50E3C2', '#B8E986', '#000000', '#4A4A4A', '#9B9B9B', '#FFFFFF']);
    //recieve strokeWidthInput
    const strokeWidthInputRef = useRef(null);
    //recieve fontSizeInput
    const fontSizeInputRef = useRef(null);
    //recieve width imput
    const widthInputRef = useRef(null);
    //recieve height input
    const heightInputRef = useRef(null);
    //recieve x location
    const xpositionInputRef = useRef(null);
    //recieve y location
    const ypositionInputRef = useRef(null);
    //recieve text content
    const textContentInputRef = useRef(null);
    //recieve line width
    const lineWidthInputRef = useRef(null);

    //show the modal
    function handleShow(){
        setShow(true);
    }

    //hide the modal
    function handleClose(){
        setShow(false);
    }

    //update the node styles from temp styles and hide modal
    function handleUpdateStyles(){
        var newStyle = tempStyles;

        //handle strokeWidthInput making sure its valid and updating style
        var strokeWidth = 0;
        if(strokeWidthInputRef.current != null){
            strokeWidth = parseInt(strokeWidthInputRef.current.value);
            if(0 < strokeWidth <= 20 && !isNaN(strokeWidth)){
                newStyle.pathData.strokeWidth = strokeWidth;
                setTempStyles(newStyle);
            }
        }
        //handle fontSizeInput making sure its valid and updating style
        var fontSize = 12;
        if(fontSizeInputRef.current != null){
            fontSize = parseInt(fontSizeInputRef.current.value);
            if(8 < fontSize <= 48 && !isNaN(fontSize)){
                newStyle.textData.fontSize = fontSize;
                setTempStyles(newStyle);
            }
        }
        var width = 100;
        var height = 100;
        if(widthInputRef.current != null && heightInputRef.current != null){
            width = parseInt(widthInputRef.current.value);
            height = parseInt(heightInputRef.current.value);
            if(10 < width <= 800 && !isNaN(width) && 10 < height <= 1000 && !isNaN(height)){
                newStyle.pathData.size = [width, height];
                setTempStyles(newStyle);
            }
        }
        var x = 0;
        var y = 0;
        if(xpositionInputRef != null && ypositionInputRef != null){
            x = parseInt(xpositionInputRef.current.value);
            y = parseInt(ypositionInputRef.current.value);
            if(0 < x <= 790 && !isNaN(x) && 0 < y <= 990 && !isNaN(height)){
                newStyle.pathData.point = [x,y];
                setTempStyles(newStyle);
            }
        }
        if(textContentInputRef.current != null){
            newStyle.textData.content = textContentInputRef.current.value;
        }
        var lineWidth = 5;
        if(lineWidthInputRef != null){
            lineWidth = parseInt(lineWidthInputRef.current.value);
            if(0 < lineWidth <= 20 && !isNaN(lineWidth)){
                newStyle.lineData.strokeWidth = lineWidth;
                setTempStyles(newStyle);
            }
        }
        
        setStyles(newStyle);
        setShow(false);
    }

    //set the tempStyles type to the given type
    function setType(type){
        var newStyle = tempStyles;
        newStyle.type = type;
        setTempStyles(newStyle);
    }

    //update tempStyles fillcolor
    function updateFillColor(){
        var newStyle = tempStyles;
        newStyle.pathData.fillColor = color.hex;
        setTempStyles(newStyle);
        updatePresetColors();
    }

    //update tempStyles strokecolor
    function updateStrokeColor(){
        var newStyle = tempStyles;
        newStyle.pathData.strokeColor = color.hex;
        setTempStyles(newStyle);
        updatePresetColors();
    }

    //update tempStyles textcolor
    function updateTextColor(){
        var newStyle = tempStyles;
        newStyle.textData.fillColor = color.hex;
        setTempStyles(newStyle);
        updatePresetColors();
    }

    //update tempStyles linecolor
    function updateLineColor(){
        var newStyle = tempStyles;
        newStyle.lineData.strokeColor = color.hex;
        setTempStyles(newStyle);
        updatePresetColors();
    }

    //used to update the present colors with the new color
    function updatePresetColors(){
        var exit = false;
        var oldPresetColors = presetColors;
        //check to make sure new color doesnt match any already in array
        oldPresetColors.forEach((pcolor) => {
            if(pcolor == color.hex){
                exit = true;
            }
        })
        if(!exit && color.hex != undefined){
            //add to front of array and delete from the end
            var newPresetColors = [color.hex];
            console.log(color.hex);
            for(var i = 0; i < oldPresetColors.length -1; i++){
                newPresetColors.push(oldPresetColors[i]);
            }
            setpresetColors(newPresetColors);
        }
    }

    //used to update the color from the color picker
    function handleColorChange(color){
        setColor(color);
    }

    //runs whenever styles changes to keep tempStyles updated
    useEffect(() => {
        setTempStyles(styles);
    }, [styles]);

    //runs whenever show changes to make sure that our default values are set in the modal
    useEffect(() => {
        if(strokeWidthInputRef.current != null){
            strokeWidthInputRef.current.value = tempStyles.pathData.strokeWidth;
        }
        if(fontSizeInputRef.current != null){
            fontSizeInputRef.current.value = tempStyles.textData.fontSize;
        }
        if(widthInputRef.current != null){
            widthInputRef.current.value = tempStyles.pathData.size[0];
        }
        if(heightInputRef.current != null){
            heightInputRef.current.value = tempStyles.pathData.size[1];
        }
        if(xpositionInputRef.current != null){
            xpositionInputRef.current.value = tempStyles.pathData.point[0];
        }
        if(ypositionInputRef.current != null){
            ypositionInputRef.current.value = tempStyles.pathData.point[1];
        }
        if(textContentInputRef.current != null){
            textContentInputRef.current.value = tempStyles.textData.content;
        }
        if(lineWidthInputRef.current != null){
            lineWidthInputRef.current.value = tempStyles.lineData.strokeWidth;
        }
    }, [show]);

    return(
        <>
            <Button variant='info' onClick={handleShow} style={{width: '12rem'}}>Edit Styles</Button>

            <Modal show={show} onHide={handleClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title> Edit Styles</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        <Row>
                            <h5>Node Type</h5>
                        </Row>
                        <Row>
                            <Col md={3}>
                                {tempStyles.type == "text-rectangle" && <Button variant="secondary" style={{backgroundColor: "#ff9100", color: "#000000"}}>Text Rectangle</Button>}
                                {tempStyles.type != "text-rectangle" && <Button variant="secondary" onClick={() => {setType("text-rectangle")}}>Text Rectangle</Button>}
                            </Col>
                            <Col md={3}>
                                {tempStyles.type == "rectangle" && <Button variant="secondary" style={{backgroundColor: "#ff9100", color: "#000000"}}>Empty Rectangle</Button>}
                                {tempStyles.type != "rectangle" && <Button variant="secondary" onClick={() => {setType("rectangle")}}>Empty Rectangle</Button>}
                            </Col>
                            <Col md={3}>
                                {tempStyles.type == "ellipse" && <Button variant="secondary" style={{backgroundColor: "#ff9100", color: "#000000"}}>Empty Circle</Button>}
                                {tempStyles.type != "ellipse" && <Button variant="secondary" onClick={() => {setType("ellipse")}}>Empty Circle</Button>}
                            </Col>
                            <Col md={3}>
                                {tempStyles.type == "text-ellipse" && <Button variant="secondary" style={{backgroundColor: "#ff9100", color: "#000000"}}>Text Circle</Button>}
                                {tempStyles.type != "text-ellipse" && <Button variant="secondary" onClick={() => {setType("text-ellipse")}}>Text Circle</Button>}
                            </Col>
                        </Row>
                        <br />
                        <Row>
                            <Col md={4}>
                                <Row>
                                    <h5>Size</h5>
                                </Row>
                                <Row>
                                    <Col md={4}>
                                        <Button variant="secondary">Width</Button>
                                    </Col>
                                    <Col md={4}>
                                        <Form>
                                            <Form.Group>
                                                <Form.Control ref={widthInputRef} maxLength={3}></Form.Control>
                                            </Form.Group>
                                        </Form>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={4}>
                                        <Button variant="secondary">Height</Button>
                                    </Col>
                                    <Col md={4}>
                                        <Form>
                                            <Form.Group>
                                                <Form.Control ref={heightInputRef} maxLength={3}></Form.Control>
                                            </Form.Group>
                                        </Form>
                                    </Col>
                                </Row>
                                <br />
                                <Row>
                                    <h5>Position</h5>
                                </Row>
                                <Row>
                                    <Col md={3}>
                                        <Button variant="secondary">X</Button>
                                    </Col>
                                    <Col md={4}>
                                        <Form>
                                            <Form.Group>
                                                <Form.Control ref={xpositionInputRef} maxLength={3}></Form.Control>
                                            </Form.Group>
                                        </Form>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={3}>
                                        <Button variant="secondary">Y</Button>
                                    </Col>
                                    <Col md={4}>
                                        <Form>
                                            <Form.Group>
                                                <Form.Control ref={ypositionInputRef} maxLength={3}></Form.Control>
                                            </Form.Group>
                                        </Form>
                                    </Col>
                                </Row>
                                <br />
                                <Row>
                                    <p> All sizes and positions relative to page size: 800x1000</p>
                                </Row>
                            </Col>
                            <Col md={4}>
                                <Row>
                                    <h5>Color</h5>
                                </Row>
                                <Row>
                                    <Col md={4}>
                                        <Button variant="secondary" onClick={updateFillColor}>Fill</Button>
                                    </Col>
                                    <Col md={4}>
                                        <Button variant="secondary" onClick={updateFillColor} style={{backgroundColor: tempStyles.pathData.fillColor}}><BucketIcon /></Button>
                                    </Col>  
                                </Row>
                                <Row>
                                    <Col md={4}>
                                        <Button variant="secondary" onClick={updateStrokeColor}>Stroke</Button>
                                    </Col>
                                    <Col md={4}>
                                        <Button variant="secondary" onClick={updateStrokeColor} style={{backgroundColor: tempStyles.pathData.strokeColor}}><SquareIcon /></Button>
                                    </Col>
                                </Row>
                                {tempStyles.type.startsWith("text-") && <Row>
                                    <Col md={4}>
                                        <Button variant="secondary" onClick={updateTextColor}>Text</Button>
                                    </Col>
                                    <Col md={4}>
                                        <Button variant="secondary" onClick={updateTextColor} style={{backgroundColor: tempStyles.textData.fillColor}}><BrushIcon /></Button>
                                    </Col>
                                </Row>}
                                <br />
                                <Row>
                                    <h5>Details</h5>
                                </Row>
                                <Row>
                                    <Col md={7}>
                                        <Button variant="secondary">Stroke Width</Button>
                                    </Col>
                                    <Col md={4}>
                                        <Form>
                                            <Form.Group>
                                                <Form.Control ref={strokeWidthInputRef} maxLength={2}></Form.Control>
                                            </Form.Group>
                                        </Form>
                                    </Col>
                                </Row>
                                {tempStyles.type.startsWith("text-") && <Row>
                                    <Col md={7}>
                                        <Button variant="secondary">Font Size</Button>
                                    </Col>
                                    <Col md={4}>
                                        <Form>
                                            <Form.Group>
                                                <Form.Control ref={fontSizeInputRef} maxLength={2}></Form.Control>
                                            </Form.Group>
                                        </Form>
                                    </Col>
                                </Row>}
                            </Col>
                            <Col md={4}>
                                <SketchPicker color={color} presetColors={presetColors} onChange={handleColorChange} disableAlpha={true}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <Row>
                                    <h5>Lines</h5>
                                </Row>
                                <Row>
                                    <Col md={4}>
                                        <Button variant="secondary">Width</Button>
                                    </Col>
                                    <Col md={4}>
                                        <Form>
                                            <Form.Group>
                                                <Form.Control ref={lineWidthInputRef} maxLength={2}></Form.Control>
                                            </Form.Group>
                                        </Form>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={4}>
                                        <Button variant="secondary" onClick={updateLineColor}>Color</Button>
                                    </Col>
                                    <Col md={4}>
                                        <Button variant="secondary" onClick={updateLineColor} style={{backgroundColor: tempStyles.lineData.strokeColor}}><BucketIcon /></Button>
                                    </Col>
                                </Row>
                            </Col>
                            {tempStyles.type.startsWith("text-") && <Col md={8}>
                                <Row>
                                    <h5>Text Content</h5>
                                </Row>
                                <Row>
                                    <Form>
                                        <Form.Group>
                                            <Form.Control as="textArea" rows={3} ref={textContentInputRef} maxLength={200}></Form.Control>
                                        </Form.Group>
                                    </Form>
                                </Row>
                            </Col>}
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer className="justify-content-md-center">
                    <Button variant="secondary" onClick={handleClose}>Exit</Button>
                    <Button variant="primary" onClick={handleUpdateStyles}>Update Styles</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}