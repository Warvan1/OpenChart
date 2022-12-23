import React, {useState, useEffect, useRef, useContext } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Button, Container, Row } from 'react-bootstrap';
import paper from "paper";
import { Key, Point } from 'paper/dist/paper-core';
import { ProjectDataContext } from '../pages/project-view/[id]';

export default function ProjectEditor(props){
    const {user, error, isLoading } = useUser();
    const canvasRef = useRef(null);
    //retrieve the project Data hooks and the reload hooks from the index.js page
    const {projectData, setProjectData, reload, setReload} = useContext(ProjectDataContext);
    //used to store the currient pathObjects from paper project
    const [pathObjectsReact, setPathObjectsReact] = useState({});
    //used to store the render order of the path objects so that when we save to database that isnt lost
    const [renderOrderReact, setRenderOrderReact] = useState([]);
    //used to make sure we only setup the screen once
    const [updated, setUpdated] = useState(false);

    //used to create a paper project to draw on the canvas
    function updateScreen(){
        //get a reference to the canvas dom object
        const canvas = canvasRef.current;
        //create an empty project and a view for the canvas
        paper.setup(canvas);
        //set the view size
        paper.view.viewSize = [800, 1000];

        //keep track of if an item is focused
        var focused = null;
        //keep track of the render order for use when saving to database.
        var renderOrder = [];

        //keep track of text input state
        var textInputMode = false;
        var catchTextInputChange = null;

        //set up background
        var background = new paper.Path.Rectangle({
            point: [0,0], 
            size:[800,1000],
            fillColor: [0.9,0.9,0.9],
            strokeColor: [0.5,0.5,0.5],
            strokeWidth: 10,
        });

        //focusHighlighting objects
        var highlightObject1 = {center: [0,0], radius: 5, fillColor: [0.2,0.8,0.8]};
        var highlightObject2 = {center: [0,0], radius: 5, fillColor: [0,1,0.2]};
        var topLeft = new paper.Path.Circle(highlightObject1);
        var topRight = new paper.Path.Circle(highlightObject1);
        var bottomLeft = new paper.Path.Circle(highlightObject1);
        var bottomRight = new paper.Path.Circle(highlightObject1);
        var leftCenter = new paper.Path.Circle(highlightObject2);
        var rightCenter = new paper.Path.Circle(highlightObject2);
        var topCenter = new paper.Path.Circle(highlightObject2);
        var bottomCenter = new paper.Path.Circle(highlightObject2);

        //reduce the projectData.objects to paper path objects
        //create array of path objects
        var pathObjects = [];
        
        //use the object array to make path objects and push them into the path object array
        for(var i = 0; i < projectData.projectJSON.objects.length; i++){
            var object = projectData.projectJSON.objects[i];
            //convert each object into a paper path object
            if(object.type == "rectangle"){
                //create a path object
                var pathObject = new paper.Path.Rectangle(object.data);
                pathObjects.push({
                    object: pathObject, 
                    type: "rectangle",
                    index: i,
                });
            }
            if(object.type == "text-textBox"){
                //create a path object
                var pathObject = new paper.Path.Rectangle(object.data);
                var textObject = new paper.PointText(object.textData);
                //set there positions equal
                textObject.position = pathObject.position;
                pathObjects.push({
                    object: pathObject,
                    textObject: textObject,
                    type: "text-textBox",
                    textInputOffset: object.textInputOffset,
                    index: i
                })
            }

            //add index to renderOrder
            renderOrder.push(i);
        }
        //update the pathObjects and renderOrder within react
        setPathObjectsReact(pathObjects);
        setRenderOrderReact(renderOrder);
        
        //handle events for pathObjects
        pathObjects.forEach((data) => {
            //used to keep track of the offset from where you clicked on an object to the objects center position
            var clickOffset = null;

            //handle object onload for first time
            //when adding an object if data.textInputOffset != null
            if(data.textInputOffset != null){
                console.log(data.textInputOffset);
                
                //remove the | from the caught textInput
                var content = data.textObject.content;
                var insertLocation = content.length - data.textInputOffset - 1;
                content = content.slice(0, insertLocation) + content.slice(insertLocation + 1, content.length);
                data.textObject.content = content;

                data.textInputOffset = null;
            }

            data.object.onMouseDrag = function(event){
                // when moving mouse on an object, move the object position to the mouse position
                // use the clickOffset calculated in onMouseDown to adjust the position from the relative click position 
                data.object.position = new Point(event.point.x - clickOffset.x, event.point.y - clickOffset.y);
                //do the same for the text inside text type objects
                if(data.type.startsWith("text-")){
                    data.textObject.position = data.object.position;
                }
                //update the pathObjects within the react state since we have changed an objects location
                setPathObjectsReact(pathObjects);
            }

            data.object.onMouseDown = function(event){
                //calculate the click offset between where we click and the object position
                clickOffset = {x: event.point.x - data.object.position.x, y: event.point.y - data.object.position.y};

                //handle object focus and ordering
                //set this object as the focused object
                focused = data.index;
                //set textInput mode to false since we clicked on a non text object
                textInputMode = false;
                //move the selected object to the forground (only visual)
                this.project.activeLayer.addChild(data.object);
                //make sure the text inside text objects is on top of the object background
                if(data.type.startsWith("text-")){
                    this.project.activeLayer.addChild(data.textObject);
                }
                //handle keeping track of the render order for the backend
                renderOrder.push(renderOrder.splice(renderOrder.indexOf(data.index), 1)[0]);
                setRenderOrderReact(renderOrder);
            }

            //handle text object events
            if(data.type.startsWith("text-")){
                data.textObject.onMouseDown = function(event){
                    //set the object as the focused object
                    focused = data.index;

                    //insert a | at the end of the content
                    if(catchTextInputChange != focused){
                        data.textObject.content += "|";
                    }
                    
                    //only run if we are entering textInput mode not if we are switching between text inputs
                    if(textInputMode == false){
                        //initialize the textInput field change catcher
                        catchTextInputChange = focused;
                        //initialize textInputOffset
                        data.textInputOffset = 0;
                    }
                    //set the textInputMode to true since we clicked on a text Input object
                    textInputMode = true;
                    
                    //handle object ordering frontend and backend and text
                    this.project.activeLayer.addChild(data.object);
                    this.project.activeLayer.addChild(data.textObject);
                    renderOrder.push(renderOrder.splice(renderOrder.indexOf(data.index), 1)[0]);
                    setRenderOrderReact(renderOrder);
                }
            }
        });

        //the following 200 ish lines of code are just for calculating and handling scale when.

        //unfocus when you click on the background
        background.onMouseDown = function(event){
            focused = null;
            //make sure that textInput is set to false when we click on the background
            textInputMode = false;
        }

        //resizing an object using the focus circles.
        var startWidth = null;
        var startHeight = null;

        //topLeft Scale
        var topLeftStart = null;
        
        topLeft.onMouseDown = function(event) {
            //initialize our scale loop with starting values
            startWidth = pathObjects[focused].object.bounds.size.width;
            startHeight = pathObjects[focused].object.bounds.size.height;
            topLeftStart = pathObjects[focused].object.bounds.topLeft;
        }

        topLeft.onMouseDrag = function(event){
            //calculate the new width as a scale of the old width based on the new x coord 
            var additionalWidth = topLeftStart.x - event.point.x;
            var totalWidth = additionalWidth + startWidth;
            var scaleWidth = totalWidth/startWidth;
            //do the same for the height
            var additionalHeight = topLeftStart.y - event.point.y;
            var totalHeight = additionalHeight + startHeight;
            var scaleHeight = totalHeight/startHeight;
            //use the scaled height and width to scale the object
            pathObjects[focused].object.scale(scaleWidth, scaleHeight);
            //set starting width height and location to the currient width height and location
            //we do this so that the next drag event will be applied relative to the most recient one
            startWidth = totalWidth;
            startHeight = totalHeight;
            topLeftStart = event.point;
            //move the active point of the pathObject to the currient location.
            pathObjects[focused].object.bounds.topLeft = event.point;
            //handle position matching of text type objects
            if(pathObjects[focused].type.startsWith("text-")){
                pathObjects[focused].textObject.position = pathObjects[focused].object.position;
            }
        }

        //topRight Scale
        var topRightStart = null;
        
        topRight.onMouseDown = function(event) {
            //initialize our scale loop with starting values
            startWidth = pathObjects[focused].object.bounds.size.width;
            startHeight = pathObjects[focused].object.bounds.size.height;
            topRightStart = pathObjects[focused].object.bounds.topRight;
        }

        topRight.onMouseDrag = function(event){
            //calculate the new width as a scale of the old width based on the new x coord 
            var additionalWidth = -(topRightStart.x - event.point.x);
            var totalWidth = additionalWidth + startWidth;
            var scaleWidth = totalWidth/startWidth;
            //do the same for the height
            var additionalHeight = topRightStart.y - event.point.y;
            var totalHeight = additionalHeight + startHeight;
            var scaleHeight = totalHeight/startHeight;
            //use the scaled height and width to scale the object
            pathObjects[focused].object.scale(scaleWidth, scaleHeight);
            //set starting width height and location to the currient width height and location
            //we do this so that the next drag event will be applied relative to the most recient one
            startWidth = totalWidth;
            startHeight = totalHeight;
            topRightStart = event.point;
            //move the active point of the pathObject to the currient location.
            pathObjects[focused].object.bounds.topRight = event.point;
            //handle position matching of text type objects
            if(pathObjects[focused].type.startsWith("text-")){
                pathObjects[focused].textObject.position = pathObjects[focused].object.position;
            }
        }

        //bottomLeft Scale
        var bottomLeftStart = null;
        
        bottomLeft.onMouseDown = function(event) {
            //initialize our scale loop with starting values
            startWidth = pathObjects[focused].object.bounds.size.width;
            startHeight = pathObjects[focused].object.bounds.size.height;
            bottomLeftStart = pathObjects[focused].object.bounds.bottomLeft;
        }

        bottomLeft.onMouseDrag = function(event){
            //calculate the new width as a scale of the old width based on the new x coord 
            var additionalWidth = bottomLeftStart.x - event.point.x;
            var totalWidth = additionalWidth + startWidth;
            var scaleWidth = totalWidth/startWidth;
            //do the same for the height
            var additionalHeight = -(bottomLeftStart.y - event.point.y);
            var totalHeight = additionalHeight + startHeight;
            var scaleHeight = totalHeight/startHeight;
            //use the scaled height and width to scale the object
            pathObjects[focused].object.scale(scaleWidth, scaleHeight);
            //set starting width height and location to the currient width height and location
            //we do this so that the next drag event will be applied relative to the most recient one
            startWidth = totalWidth;
            startHeight = totalHeight;
            bottomLeftStart = event.point;
            //move the active point of the pathObject to the currient location.
            pathObjects[focused].object.bounds.bottomLeft = event.point;
            //handle position matching of text type objects
            if(pathObjects[focused].type.startsWith("text-")){
                pathObjects[focused].textObject.position = pathObjects[focused].object.position;
            }
        }

        //bottomRight Scale
        var bottomRightStart = null;
        
        bottomRight.onMouseDown = function(event) {
            //initialize our scale loop with starting values
            startWidth = pathObjects[focused].object.bounds.size.width;
            startHeight = pathObjects[focused].object.bounds.size.height;
            bottomRightStart = pathObjects[focused].object.bounds.bottomRight;
        }

        bottomRight.onMouseDrag = function(event){
            //calculate the new width as a scale of the old width based on the new x coord 
            var additionalWidth = -(bottomRightStart.x - event.point.x);
            var totalWidth = additionalWidth + startWidth;
            var scaleWidth = totalWidth/startWidth;
            //do the same for the height
            var additionalHeight = -(bottomRightStart.y - event.point.y);
            var totalHeight = additionalHeight + startHeight;
            var scaleHeight = totalHeight/startHeight;
            //use the scaled height and width to scale the object
            pathObjects[focused].object.scale(scaleWidth, scaleHeight);
            //set starting width height and location to the currient width height and location
            //we do this so that the next drag event will be applied relative to the most recient one
            startWidth = totalWidth;
            startHeight = totalHeight;
            bottomRightStart = event.point;
            //move the active point of the pathObject to the currient location.
            pathObjects[focused].object.bounds.bottomRight = event.point;
            //handle position matching of text type objects
            if(pathObjects[focused].type.startsWith("text-")){
                pathObjects[focused].textObject.position = pathObjects[focused].object.position;
            }
        }

        //leftCenter Scale
        var leftCenterStart = null;

        leftCenter.onMouseDown = function(event) {
            startWidth = pathObjects[focused].object.bounds.size.width;
            leftCenterStart = pathObjects[focused].object.bounds.leftCenter;
        }

        leftCenter.onMouseDrag = function(event){
            var additionalWidth = leftCenterStart.x - event.point.x;
            var totalWidth = additionalWidth + startWidth;
            var scaleWidth = totalWidth/startWidth;
            pathObjects[focused].object.scale(scaleWidth, 1);
            startWidth = totalWidth;
            leftCenterStart = event.point;
            pathObjects[focused].object.bounds.leftCenter.x = event.point.x;
            //handle position matching of text type objects
            if(pathObjects[focused].type.startsWith("text-")){
                pathObjects[focused].textObject.position = pathObjects[focused].object.position;
            }
        }

        //rightCenter Scale
        var rightCenterStart = null;

        rightCenter.onMouseDown = function(event) {
            startWidth = pathObjects[focused].object.bounds.size.width;
            rightCenterStart = pathObjects[focused].object.bounds.rightCenter;
        }

        rightCenter.onMouseDrag = function(event){
            var additionalWidth = -(rightCenterStart.x - event.point.x);
            var totalWidth = additionalWidth + startWidth;
            var scaleWidth = totalWidth/startWidth;
            pathObjects[focused].object.scale(scaleWidth, 1);
            startWidth = totalWidth;
            rightCenterStart = event.point;
            pathObjects[focused].object.bounds.rightCenter.x = event.point.x;
            //handle position matching of text type objects
            if(pathObjects[focused].type.startsWith("text-")){
                pathObjects[focused].textObject.position = pathObjects[focused].object.position;
            }
        }

        //topCenter Scale
        var topCenterStart = null;

        topCenter.onMouseDown = function(event) {
            startHeight = pathObjects[focused].object.bounds.size.height;
            topCenterStart = pathObjects[focused].object.bounds.topCenter;
        }

        topCenter.onMouseDrag = function(event){
            var additionalHeight = topCenterStart.y - event.point.y;
            var totalHeight = additionalHeight + startHeight;
            var scaleHeight = totalHeight/startHeight;
            pathObjects[focused].object.scale(1, scaleHeight);
            startHeight = totalHeight;
            topCenterStart = event.point;
            pathObjects[focused].object.bounds.topCenter.y = event.point.y;
            //handle position matching of text type objects
            if(pathObjects[focused].type.startsWith("text-")){
                pathObjects[focused].textObject.position = pathObjects[focused].object.position;
            }
        }

        //bottomCenter Scale
        var bottomCenterStart = null;

        bottomCenter.onMouseDown = function(event) {
            startHeight = pathObjects[focused].object.bounds.size.height;
            bottomCenterStart = pathObjects[focused].object.bounds.bottomCenter;
        }

        bottomCenter.onMouseDrag = function(event){
            var additionalHeight = -(bottomCenterStart.y - event.point.y);
            var totalHeight = additionalHeight + startHeight;
            var scaleHeight = totalHeight/startHeight;
            pathObjects[focused].object.scale(1, scaleHeight);
            startHeight = totalHeight;
            bottomCenterStart = event.point;
            pathObjects[focused].object.bounds.bottomCenter.y = event.point.y;
            //handle position matching of text type objects
            if(pathObjects[focused].type.startsWith("text-")){
                pathObjects[focused].textObject.position = pathObjects[focused].object.position;
            }
        }

        //handle keyboard events
        const tool = new paper.Tool();

        tool.onKeyUp = function(event){
            console.log(event.key);
            if(textInputMode){
                var textInputOffset = pathObjects[focused].textInputOffset;
                var content = pathObjects[focused].textObject.content;
                var insertLocation = content.length - textInputOffset - 1;
                //edit text content based on key
                if(event.key == "space"){
                    content = content.slice(0, insertLocation) + " " + content.slice(insertLocation, content.length);
                }
                else if(event.key == "backspace"){
                    if(content.length > 0 && insertLocation >= 1){
                        content = content.slice(0, insertLocation - 1) + content.slice(insertLocation, content.length);
                    }
                }
                else if(event.key == "enter"){
                    content = content.slice(0, insertLocation) + "\n" + content.slice(insertLocation, content.length);
                }
                else if(event.key == "left"){
                    if(insertLocation >= 1){
                        textInputOffset++;
                        var tempContent = content.slice(0, insertLocation - 1) + "|" + content[insertLocation - 1];
                        if(textInputOffset >= 2){
                            tempContent += content.slice(-textInputOffset + 1, content.length)
                        }
                        content = tempContent;
                    }
                }
                else if(event.key == "right"){
                    if(textInputOffset >= 1){
                        var tempContent = content.slice(0, insertLocation) + content[insertLocation + 1] + "|";
                        if(textInputOffset >= 2){
                            tempContent += content.slice(-textInputOffset + 1, content.length);
                        }
                        content = tempContent;
                        textInputOffset--;
                    }
                }
                else if(event.key == "shift" || event.key == "control"){
                    //do nothing here
                }
                else{
                    var key = event.key;
                    if(Key.modifiers.shift){
                        key = key.toUpperCase();
                    }
                    content = content.slice(0, insertLocation) + key + content.slice(insertLocation, content.length);
                }
                //update content
                pathObjects[focused].textObject.content = content;
                //update textInputOffset
                pathObjects[focused].textInputOffset = textInputOffset;
            }
            else{
                //handle deleting objects when backspace key pressed
                if(event.key == "backspace"){
                    if(pathObjects[focused] != undefined){
                        pathObjects[focused].object.remove();
                        if(pathObjects[focused].type.startsWith("text-")){
                            pathObjects[focused].textObject.remove();
                        }
                        pathObjects[focused].type = "deleted";
                        focused = null;
                    }
                }
            }
            
        }
        
        //runs every animation frame
        paper.view.onFrame = function(event){
            //handle focus highlighting
            //set the highlight items to invisible when unfocused
            if(focused == null){
                topLeft.visible = false;
                topRight.visible = false;
                bottomLeft.visible = false;
                bottomRight.visible = false;
                leftCenter.visible = false;
                rightCenter.visible = false;
                topCenter.visible = false;
                bottomCenter.visible = false;
            }
            //move the highlicht items to the corners of the highlighted items bounds
            //and make them visible again
            else{
                topLeft.visible = true;
                paper.project.activeLayer.addChild(topLeft);
                topLeft.position = pathObjects[focused].object.bounds.topLeft;
                topRight.visible = true;
                paper.project.activeLayer.addChild(topRight);
                topRight.position = pathObjects[focused].object.bounds.topRight;
                bottomLeft.visible = true;
                paper.project.activeLayer.addChild(bottomLeft);
                bottomLeft.position = pathObjects[focused].object.bounds.bottomLeft;
                bottomRight.visible = true;
                paper.project.activeLayer.addChild(bottomRight);
                bottomRight.position = pathObjects[focused].object.bounds.bottomRight;
                leftCenter.visible = true;
                paper.project.activeLayer.addChild(leftCenter);
                leftCenter.position = pathObjects[focused].object.bounds.leftCenter;
                rightCenter.visible = true;
                paper.project.activeLayer.addChild(rightCenter);
                rightCenter.position = pathObjects[focused].object.bounds.rightCenter;
                topCenter.visible = true;
                paper.project.activeLayer.addChild(topCenter);
                topCenter.position = pathObjects[focused].object.bounds.topCenter;
                bottomCenter.visible = true;
                paper.project.activeLayer.addChild(bottomCenter);
                bottomCenter.position = pathObjects[focused].object.bounds.bottomCenter;
            }

            //handle | removal after we click off a text input
            if(focused != catchTextInputChange && catchTextInputChange != null){
                //remove the | from the caught textInput uppon exiting the textInput
                var content = pathObjects[catchTextInputChange].textObject.content;
                var insertLocation = content.length - pathObjects[catchTextInputChange].textInputOffset - 1;
                content = content.slice(0, insertLocation) + content.slice(insertLocation + 1, content.length);
                pathObjects[catchTextInputChange].textObject.content = content;
                if(textInputMode == true){
                    //if inside textInputMode update the Input change catcher to the new focused object and reset the textInput offset
                    pathObjects[catchTextInputChange].textInputOffset = 0;
                    catchTextInputChange = focused;
                }
                else{
                    //set the text input change catcher to null if we leave textinput mode
                    catchTextInputChange = null;
                }
            }
        }

        //activate the most recient tool inorder to handle tool inputs
        paper.tools[paper.tools.length -1].activate();
        //view the project
        paper.view.draw();
    }

    //update screen on page load after projectData loads
    //using these 2 useEffect hooks we always run updateScreen once per component load.
    useEffect(() => {
        if(projectData.id != undefined && updated != undefined){
            setUpdated(true);
        }
    }, [projectData])
    useEffect(() => {
        if(updated == true){
            updateScreen();
        }
    }, [updated])

    function compileToProjectData(){
        //compile pathObjectsReact into projectJSON type object
        var tempProjectJSON = {objects: []};
        //add pathObjects to projectJSON in the order that they render on the screen
        renderOrderReact.forEach((index) => {
            //retrieve the data from pathObjects and create a dataObject with the same type
            var data = pathObjectsReact[index];
            var dataObject = {type: data.type, data: {}};
            //use the data.type to create a dataObject with the correct configuration
            if(data.type == "rectangle"){
                var width = data.object.bounds.size.width;
                var height = data.object.bounds.size.height;
                var x = data.object.bounds.topLeft.x;
                var y = data.object.bounds.topLeft.y;
                dataObject.data = {
                    size: [width, height],
                    point: [x , y],
                    fillColor: data.object.style.fillColor.components
                }
            }
            if(data.type == "text-textBox"){
                var width = data.object.bounds.size.width;
                var height = data.object.bounds.size.height;
                var x = data.object.bounds.topLeft.x;
                var y = data.object.bounds.topLeft.y;
                dataObject.data = {
                    size: [width, height],
                    point: [x , y],
                    strokeColor: data.object.style.strokeColor.components,
                    fillColor: data.object.style.fillColor.components
                };
                dataObject.textData = {
                    point: [x , y],
                    content: data.textObject.content,
                    fillColor: data.textObject.style.fillColor.components,
                    fontSize: data.textObject.fontSize
                };
                dataObject.textInputOffset = data.textInputOffset;
            }
            //dont save object if it has been deleted
            if(data.type != "deleted"){ 
                //add the dataObject to the projectJSON
                tempProjectJSON.objects.push(dataObject);
            }
        });
        return tempProjectJSON;
    }

    //save the project to the mysql database
    function saveProject(){
        //compile the projectJSON object if not provided
        var tempProjectJSON = compileToProjectData();
        
        //send the projectJson object to the server
        fetch(`/api/save-project?id=${props.id}`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(tempProjectJSON),
        })
    }

    //temporary object adding function
    function addObject(){
        //retrieve the currient backend projectData
        var tempProjectData = projectData;
        //compile the currient frontend projectData into a backend projectJSON object
        var tempProjectJSON = compileToProjectData();

        //add a new backend data object to the projectJSON object
        tempProjectJSON.objects.push({
            data: {
                size: [20,20],
                fillColor: "yellow",
                point: [Math.floor(Math.random() * 500), Math.floor(Math.random() * 500)]
            },
            type: "rectangle"
        }); 
        
        //set the projectJSON in the backend projectJSON to the new projectJSON with the new object
        tempProjectData.projectJSON = tempProjectJSON;
        //update the projectData react object
        setProjectData(tempProjectData);
        //save and reload the page to update the frontend
        //tell the index.js page to reload the component with the new data
        setReload(!reload);
    }

    //textBox adding function
    function addTextBox(){
        //retrieve the currient backend projectData
        var tempProjectData = projectData;
        //compile the currient frontend projectData into a backend projectJSON object
        var tempProjectJSON = compileToProjectData();

        //add a new textbox object to projectJSON object
        tempProjectJSON.objects.push({
            data: {
                point: [100, 100],
                size: [100, 50],
                strokeColor: 'black',
                fillColor: 'white'
            },
            textData: {
                point: [100, 100],
                content: 'Hello, World!',
                fillColor: 'black',
                fontSize: 12
            },
            type: "text-textBox",
            textInputOffset: null
        });

        //set the projectJSON in the backend projectJSON to the new projectJSON with the new object
        tempProjectData.projectJSON = tempProjectJSON;
        //update the projectData react object
        setProjectData(tempProjectData);
        //tell the index.js page to reload the component with the new data
        setReload(!reload);
    }

    function log(){
        console.log(projectData)
        console.log(pathObjectsReact)
        console.log(paper);
    }

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error.message}</div>;

    return (
        <div>
            <Container>
                <Row className="justify-content-md-center">
                    <div style={{width: '18rem'}}>
                        <h3>{projectData.title}</h3>
                        <Button variant="dark" onClick={saveProject}>Save</Button>
                        <Button variant="primary" onClick={addObject}>temp add</Button>
                        <Button variant="primary" onClick={addTextBox}>add text box</Button>
                        <Button variant="info" onClick={log}>log</Button>
                    </div>
                </Row>
            </Container>
            <div>
                <canvas ref={canvasRef} width={800} height={1000} style={{
                    display:"block",
                    marginLeft: "auto",
                    marginRight: "auto",
                }} />
            </div>
        </div>
    );
}