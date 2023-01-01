import React, { useState, useEffect, useContext, useRef } from 'react';
import { Button, Form, Modal, Container, Row, Col } from 'react-bootstrap';
import { StyleContext } from './ProjectEditor';
import { SketchPicker } from 'react-color';
import { BrushIcon, BucketIcon, SquareIcon, ArrowRightIcon } from './Icons';

export default function StyleEditor(props){
    //get styles from page
    const {styles, setStyles} = useContext(StyleContext);
    //object to store temp styles
    const [tempStyles, setTempStyles] = useState(styles);
    //used to keep track of if the window is small or large
    const [windowSmall, setWindowSmall] = useState(false);
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
    //keep track of base object type
    const [objectType, setObjectType] = useState(styles.type.replace("text-","").replace("Up","").replace("Down","").replace("Right","").replace("Left",""));
    //use to keep track of if we are in text object mode or not
    const [textObjectMode, setTextObjectMode] = useState(styles.type.startsWith("text-"));
    //used to keep track of the triangle mode
    const [triangleMode, setTriangleMode] = useState(() => {
        if(styles.type.endsWith("Up")){
            return "Up"
        }
        if(styles.type.endsWith("Down")){
            return "Down";
        }
        if(styles.type.endsWith("Right")){
            return "Right";
        }
        if(styles.type.endsWith("Left")){
            return "Left";
        }
        else{
            return "Up";
        }
    });

    //update the node styles from temp styles and hide modal
    function handleUpdateStyles(){
        var newStyle = tempStyles;

        //handle type formating
        if(textObjectMode){
            newStyle.type = "text-" + objectType;
        }
        else{
            newStyle.type = objectType;
        }
        if(objectType == "triangle"){
            newStyle.type = newStyle.type + triangleMode;
        }

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
        if(xpositionInputRef.current != null && ypositionInputRef.current != null){
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
        if(lineWidthInputRef.current != null){
            lineWidth = parseInt(lineWidthInputRef.current.value);
            if(0 < lineWidth <= 20 && !isNaN(lineWidth)){
                newStyle.lineData.strokeWidth = lineWidth;
                setTempStyles(newStyle);
            }
        }
        
        setStyles(newStyle);
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

    //runs at startup to set initial styles and when we change betwene top and bottom bar
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
    }, [windowSmall]);

    //update the styles when state changes
    useEffect(() => {
        handleUpdateStyles();
    }, [objectType, textObjectMode, triangleMode]);

    //runs 10 times a second keeping the window size variable updated
    useEffect(() => {
        setInterval(() => {
            if(window.innerWidth < 1600){
                setWindowSmall(true);
            }
            else{
                setWindowSmall(false);
            }
        }, 100)
    }, [])

    //use different layout when window width < 1600
    return(
        <>
        {!windowSmall && <Col md={4}>
            <Row>
                <h5>Node Type</h5>
            </Row>
            <Row>
                <Col md="auto">
                    {objectType == "rectangle" && <Button variant="secondary" style={{backgroundColor: "#ff9100", color: "#000000"}}>Rectangle</Button>}
                    {objectType != "rectangle" && <Button variant="secondary" onClick={() => {setObjectType("rectangle")}}>Rectangle</Button>}
                </Col>
                <Col md="auto">
                    {objectType == "triangle" && <Button variant="secondary" style={{backgroundColor: "#ff9100", color: "#000000"}}>Triangle</Button>}
                    {objectType != "triangle" && <Button variant="secondary" onClick={() => {setObjectType("triangle")}}>Triangle</Button>}
                </Col>
                <Col md="auto">
                    {objectType == "ellipse" && <Button variant="secondary" style={{backgroundColor: "#ff9100", color: "#000000"}}>Circle</Button>}
                    {objectType != "ellipse" && <Button variant="secondary" onClick={() => {setObjectType("ellipse")}}>Circle</Button>}
                </Col>
                
            </Row>
            <br />
            <Row>
                <h5>Include Text</h5>
            </Row>
            <Row>
                <Col md="auto">
                    {textObjectMode && <Button variant="secondary" style={{backgroundColor: "#ff9100", color: "#000000"}}>Yes</Button>}
                    {!textObjectMode && <Button variant="secondary" onClick={() => {setTextObjectMode(true)}}>Yes</Button>}
                </Col>
                <Col md="auto">
                    {!textObjectMode && <Button variant="secondary" style={{backgroundColor: "#ff9100", color: "#000000"}}>No</Button>}
                    {textObjectMode && <Button variant="secondary" onClick={() => {setTextObjectMode(false)}}>No</Button>}
                </Col>
            </Row>
            <br />
            {objectType == "triangle" &&<Row>
                <h5>Triangle Direction</h5>
            </Row>}
            <Row>
                {objectType == "triangle" && <Col md="auto">
                    {triangleMode == "Up" && <Button variant="secondary" style={{backgroundColor: "#ff9100", color: "#000000"}}>Up</Button>}
                    {triangleMode != "Up" && <Button variant="secondary" onClick={() => {setTriangleMode("Up")}}>Up</Button>}
                </Col>}
                {objectType == "triangle" && <Col md="auto">
                    {triangleMode == "Down" && <Button variant="secondary" style={{backgroundColor: "#ff9100", color: "#000000"}}>down</Button>}
                    {triangleMode != "Down" && <Button variant="secondary" onClick={() => {setTriangleMode("Down")}}>Down</Button>}
                </Col>}
                {objectType == "triangle" && <Col md="auto">
                    {triangleMode == "Left" && <Button variant="secondary" style={{backgroundColor: "#ff9100", color: "#000000"}}>Left</Button>}
                    {triangleMode != "Left" && <Button variant="secondary" onClick={() => {setTriangleMode("Left")}}>Left</Button>}
                </Col>}
                {objectType == "triangle" && <Col md="auto">
                    {triangleMode == "Right" && <Button variant="secondary" style={{backgroundColor: "#ff9100", color: "#000000"}}>Right</Button>}
                    {triangleMode != "Right" && <Button variant="secondary" onClick={() => {setTriangleMode("Right")}}>Right</Button>}
                </Col>}
            </Row>
            <br />
            <Row>
                <Col md="auto">
                    <Row>
                        <SketchPicker color={color} presetColors={presetColors} onChange={handleColorChange} disableAlpha={true}/>
                    </Row>
                </Col>
                <Col md="auto">
                    <Row>
                        <h5>Color</h5>
                    </Row>
                    <Row>
                        <Col md={5}>
                            <Button variant="secondary" onClick={updateFillColor}>Fill</Button>
                        </Col>
                        <Col md={3}>
                            <Button variant="secondary" onClick={updateFillColor} style={{backgroundColor: tempStyles.pathData.fillColor}}><BucketIcon /></Button>
                        </Col>  
                    </Row>
                    <Row>
                        <Col md={5}>
                            <Button variant="secondary" onClick={updateStrokeColor}>Stroke</Button>
                        </Col>
                        <Col md={3}>
                            <Button variant="secondary" onClick={updateStrokeColor} style={{backgroundColor: tempStyles.pathData.strokeColor}}><SquareIcon /></Button>
                        </Col>
                    </Row>
                    {textObjectMode && <Row>
                        <Col md={5}>
                            <Button variant="secondary" onClick={updateTextColor}>Text</Button>
                        </Col>
                        <Col md={3}>
                            <Button variant="secondary" onClick={updateTextColor} style={{backgroundColor: tempStyles.textData.fillColor}}><BrushIcon /></Button>
                        </Col>
                    </Row>}
                </Col>
            </Row>            
            <br />
            <Row>
                <Col md={5}>
                    <Row>
                        <h5>Details</h5>
                    </Row>
                    <Row>
                        <Col md={7}>
                            <Button variant="secondary">Stroke Width</Button>
                        </Col>
                        <Col md={5}>
                            <Form>
                                <Form.Group>
                                    <Form.Control ref={strokeWidthInputRef} onChange={handleUpdateStyles} maxLength={2}></Form.Control>
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>
                    {textObjectMode && <Row>
                        <Col md={7}>
                            <Button variant="secondary">Font Size</Button>
                        </Col>
                        <Col md={5}>
                            <Form>
                                <Form.Group>
                                    <Form.Control ref={fontSizeInputRef} onChange={handleUpdateStyles} maxLength={2}></Form.Control>
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>}
                </Col>
                <Col md={5}>
                    <Row>
                        <h5>Lines</h5>
                    </Row>
                    <Row>
                        <Col md={5}>
                            <Button variant="secondary">Width</Button>
                        </Col>
                        <Col md={5}>
                            <Form>
                                <Form.Group>
                                    <Form.Control ref={lineWidthInputRef} onChange={handleUpdateStyles} maxLength={2}></Form.Control>
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={5}>
                            <Button variant="secondary" onClick={updateLineColor}>Color</Button>
                        </Col>
                        <Col md={5}>
                            <Button variant="secondary" onClick={updateLineColor} style={{backgroundColor: tempStyles.lineData.strokeColor}}><ArrowRightIcon /></Button>
                        </Col>
                    </Row>
                    
                </Col>
            </Row>
            <br />
            {textObjectMode && <Row>
                <h5>Text Content</h5>
            </Row>}
            {textObjectMode && <Row>
                <Col md={9}>
                    <Form>
                        <Form.Group>
                            <Form.Control as="textarea" rows={3} ref={textContentInputRef} onChange={handleUpdateStyles} maxLength={200}></Form.Control>
                        </Form.Group>
                    </Form>
                </Col>
            </Row>}
            <br />
            <Row>
                <Col md={5}>
                    <Row>
                        <h5>Size</h5>
                    </Row>
                    <Row>
                        <Col md={7}>
                            <Button variant="secondary">Width</Button>
                        </Col>
                        <Col md={5}>
                            <Form>
                                <Form.Group>
                                    <Form.Control ref={widthInputRef} onChange={handleUpdateStyles} maxLength={3}></Form.Control>
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={7}>
                            <Button variant="secondary">Height</Button>
                        </Col>
                        <Col md={5}>
                            <Form>
                                <Form.Group>
                                    <Form.Control ref={heightInputRef} onChange={handleUpdateStyles} maxLength={3}></Form.Control>
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>
                </Col>
                <Col md={5}>
                    <Row>
                        <h5>Position</h5>
                    </Row>
                    <Row>
                        <Col md={5}>
                            <Button variant="secondary">X</Button>
                        </Col>
                        <Col md={5}>
                            <Form>
                                <Form.Group>
                                    <Form.Control ref={xpositionInputRef} onChange={handleUpdateStyles} maxLength={3}></Form.Control>
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={5}>
                            <Button variant="secondary">Y</Button>
                        </Col>
                        <Col md={5}>
                            <Form>
                                <Form.Group>
                                    <Form.Control ref={ypositionInputRef} onChange={handleUpdateStyles} maxLength={3}></Form.Control>
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row>
                <p> All sizes and positions relative to page size: 1000x1000</p>
            </Row>
        </Col>}

        {windowSmall && <Col md={12}>
            <Row>
                <Col md="auto">
                    <Row>
                        <h5>Node Type</h5>
                    </Row>
                    <Row>
                        <Col md="auto">
                            {objectType == "rectangle" && <Button variant="secondary" style={{backgroundColor: "#ff9100", color: "#000000"}}>Rectangle</Button>}
                            {objectType != "rectangle" && <Button variant="secondary" onClick={() => {setObjectType("rectangle")}}>Rectangle</Button>}
                        </Col>
                        <Col md="auto">
                            {objectType == "triangle" && <Button variant="secondary" style={{backgroundColor: "#ff9100", color: "#000000"}}>Triangle</Button>}
                            {objectType != "triangle" && <Button variant="secondary" onClick={() => {setObjectType("triangle")}}>Triangle</Button>}
                        </Col>
                        <Col md="auto">
                            {objectType == "ellipse" && <Button variant="secondary" style={{backgroundColor: "#ff9100", color: "#000000"}}>Circle</Button>}
                            {objectType != "ellipse" && <Button variant="secondary" onClick={() => {setObjectType("ellipse")}}>Circle</Button>}
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <h5>Include Text</h5>
                    </Row>
                    <Row>
                        <Col md="auto">
                            {textObjectMode && <Button variant="secondary" style={{backgroundColor: "#ff9100", color: "#000000"}}>Yes</Button>}
                            {!textObjectMode && <Button variant="secondary" onClick={() => {setTextObjectMode(true)}}>Yes</Button>}
                        </Col>
                        <Col md="auto">
                            {!textObjectMode && <Button variant="secondary" style={{backgroundColor: "#ff9100", color: "#000000"}}>No</Button>}
                            {textObjectMode && <Button variant="secondary" onClick={() => {setTextObjectMode(false)}}>No</Button>}
                        </Col>
                    </Row>
                    <br />
                    {objectType == "triangle" &&<Row>
                        <h5>Triangle Direction</h5>
                    </Row>}
                    <Row>
                        {objectType == "triangle" && <Col md="auto">
                            {triangleMode == "Up" && <Button variant="secondary" style={{backgroundColor: "#ff9100", color: "#000000"}}>Up</Button>}
                            {triangleMode != "Up" && <Button variant="secondary" onClick={() => {setTriangleMode("Up")}}>Up</Button>}
                        </Col>}
                        {objectType == "triangle" && <Col md="auto">
                            {triangleMode == "Down" && <Button variant="secondary" style={{backgroundColor: "#ff9100", color: "#000000"}}>down</Button>}
                            {triangleMode != "Down" && <Button variant="secondary" onClick={() => {setTriangleMode("Down")}}>Down</Button>}
                        </Col>}
                        {objectType == "triangle" && <Col md="auto">
                            {triangleMode == "Left" && <Button variant="secondary" style={{backgroundColor: "#ff9100", color: "#000000"}}>Left</Button>}
                            {triangleMode != "Left" && <Button variant="secondary" onClick={() => {setTriangleMode("Left")}}>Left</Button>}
                        </Col>}
                        {objectType == "triangle" && <Col md="auto">
                            {triangleMode == "Right" && <Button variant="secondary" style={{backgroundColor: "#ff9100", color: "#000000"}}>Right</Button>}
                            {triangleMode != "Right" && <Button variant="secondary" onClick={() => {setTriangleMode("Right")}}>Right</Button>}
                        </Col>}
                    </Row>
                </Col>
                <Col md="auto">
                    <Row>
                        <SketchPicker color={color} presetColors={presetColors} onChange={handleColorChange} disableAlpha={true}/>
                    </Row>
                    <br />
                </Col>
                <Col md={2}>
                    <Row>
                        <h5>Color</h5>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Button variant="secondary" onClick={updateFillColor}>Fill</Button>
                        </Col>
                        <Col md={4}>
                            <Button variant="secondary" onClick={updateFillColor} style={{backgroundColor: tempStyles.pathData.fillColor}}><BucketIcon /></Button>
                        </Col>  
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Button variant="secondary" onClick={updateStrokeColor}>Stroke</Button>
                        </Col>
                        <Col md={4}>
                            <Button variant="secondary" onClick={updateStrokeColor} style={{backgroundColor: tempStyles.pathData.strokeColor}}><SquareIcon /></Button>
                        </Col>
                    </Row>
                    {textObjectMode && <Row>
                        <Col md={6}>
                            <Button variant="secondary" onClick={updateTextColor}>Text</Button>
                        </Col>
                        <Col md={4}>
                            <Button variant="secondary" onClick={updateTextColor} style={{backgroundColor: tempStyles.textData.fillColor}}><BrushIcon /></Button>
                        </Col>
                    </Row>}
                    <br />
                    <Row>
                        <h5>Lines</h5>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Button variant="secondary">Width</Button>
                        </Col>
                        <Col md={6}>
                            <Form>
                                <Form.Group>
                                    <Form.Control ref={lineWidthInputRef} onChange={handleUpdateStyles} maxLength={2}></Form.Control>
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Button variant="secondary" onClick={updateLineColor}>Color</Button>
                        </Col>
                        <Col md={4}>
                            <Button variant="secondary" onClick={updateLineColor} style={{backgroundColor: tempStyles.lineData.strokeColor}}><ArrowRightIcon /></Button>
                        </Col>
                    </Row>
                </Col>
                <Col md={3}>
                    <Row>
                        <h5>Details</h5>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Button variant="secondary">Stroke Width</Button>
                        </Col>
                        <Col md={4}>
                            <Form>
                                <Form.Group>
                                    <Form.Control ref={strokeWidthInputRef} onChange={handleUpdateStyles} maxLength={2}></Form.Control>
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>
                    {textObjectMode && <Row>
                        <Col md={6}>
                            <Button variant="secondary">Font Size</Button>
                        </Col>
                        <Col md={4}>
                            <Form>
                                <Form.Group>
                                    <Form.Control ref={fontSizeInputRef} onChange={handleUpdateStyles} maxLength={2}></Form.Control>
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>}
                    
                </Col>
                <Col md={4}>
                    <br />
                    {textObjectMode && <Row>
                        <h5>Text Content</h5>
                    </Row>}
                    {textObjectMode && <Row>
                        <Col md={12}>
                            <Form>
                                <Form.Group>
                                    <Form.Control as="textarea" rows={3} ref={textContentInputRef} onChange={handleUpdateStyles} maxLength={200}></Form.Control>
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>}
                    <br />
                </Col>
                <Col md={2}>
                    <br />
                    <Row>
                        <h5>Size</h5>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Button variant="secondary">Width</Button>
                        </Col>
                        <Col md={6}>
                            <Form>
                                <Form.Group>
                                    <Form.Control ref={widthInputRef} onChange={handleUpdateStyles} maxLength={3}></Form.Control>
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Button variant="secondary">Height</Button>
                        </Col>
                        <Col md={6}>
                            <Form>
                                <Form.Group>
                                    <Form.Control ref={heightInputRef} onChange={handleUpdateStyles} maxLength={3}></Form.Control>
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>
                    <br />
                </Col>
                <Col md={2}>
                    <br />
                    <Row>
                        <h5>Position</h5>
                    </Row>
                    <Row>
                        <Col md={4}>
                            <Button variant="secondary">X</Button>
                        </Col>
                        <Col md={6}>
                            <Form>
                                <Form.Group>
                                    <Form.Control ref={xpositionInputRef} onChange={handleUpdateStyles} maxLength={3}></Form.Control>
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={4}>
                            <Button variant="secondary">Y</Button>
                        </Col>
                        <Col md={6}>
                            <Form>
                                <Form.Group>
                                    <Form.Control ref={ypositionInputRef} onChange={handleUpdateStyles} maxLength={3}></Form.Control>
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row>
                <p> All sizes and positions relative to page size: 1000x1000</p>
            </Row>
        </Col>}
        </>
    )
}