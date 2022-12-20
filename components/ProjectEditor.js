import React, {useState, useEffect, useRef } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Button, Container, Row } from 'react-bootstrap';
import paper from "paper";
import { Key, Point } from 'paper/dist/paper-core';

export default function ProjectEditor(props){
    const {user, error, isLoading } = useUser();
    const canvasRef = useRef(null);
    //used to store the project data for use in database
    const [projectData, setProjectData] = useState({});
    //set to true when we want to add new projectData to the screen and reload paper project
    const [update, setUpdate] = useState(false);
    //used to store the currient pathObjects from paper project
    const [pathObjectsReact, setPathObjectsReact] = useState({});
    //used to store the render order of the path objects so that when we save to database that isnt lost
    const [renderOrderReact, setRenderOrderReact] = useState([]);

    //used to create a paper project to draw on the canvas
    function updateScreen(){
        //get a reference to the canvas dom object
        const canvas = canvasRef.current;
        //create an empty project and a view for the canvas
        paper.setup(canvas);
        //set the view size
        paper.view.viewSize = [800, 1000];
        //create a path to add objects to
        var path = new paper.Path();

        //keep track of if an item is focused
        var focused = null;
        //keep track of the render order for use when saving to database.
        var renderOrder = [];

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
            var pathObject = null;
            if(object.type == "rectangle"){
                //create a path object
                pathObject = new paper.Path.Rectangle(object.data);
                pathObjects.push({
                    object: pathObject, 
                    type: "rectangle",
                    index: i,
                });
            }

            //add index to renderOrder
            renderOrder.push(i);
        }
        //update the pathObjects and renderOrder within react
        setPathObjectsReact(pathObjects);
        setRenderOrderReact(renderOrder);
        
        //handle events for pathObjects
        pathObjects.forEach((data) => {
            var clickOffset = null;

            data.object.onMouseDrag = function(event){
                // when moving mouse on an object, move the object position to the mouse position
                // use the clickOffset calculated in onMouseDown to adjust the position from the relative click position 
                data.object.position = new Point(event.point.x - clickOffset.x, event.point.y - clickOffset.y);
                //update the pathObjects within the react state since we have changed an objects location
                setPathObjectsReact(pathObjects);
            }

            data.object.onMouseDown = function(event){
                //calculate the click offset between where we click and the object position
                clickOffset = {x: event.point.x - data.object.position.x, y: event.point.y - data.object.position.y};

                //handle object focus and ordering
                //set this object as the focused object
                focused = data.index;
                //move the selected object to the forground (only visual)
                this.project.activeLayer.addChild(data.object);
                //handle keeping track of the render order for the backend
                renderOrder.push(renderOrder.splice(renderOrder.indexOf(data.index), 1)[0]);
                setRenderOrderReact(renderOrder);
            }
        });

        //focus events
        var startWidth = null;
        var startHeight = null;

        //topLeft Scale
        var topLeftStart = null;
        
        topLeft.onMouseDown = function(event) {
            startWidth = pathObjects[focused].object.bounds.size.width;
            startHeight = pathObjects[focused].object.bounds.size.height;
            topLeftStart = pathObjects[focused].object.bounds.topLeft;
        }

        topLeft.onMouseDrag = function(event){
            var additionalWidth = topLeftStart.x - event.point.x;
            var totalWidth = additionalWidth + startWidth;
            var scaleWidth = totalWidth/startWidth;

            var additionalHeight = topLeftStart.y - event.point.y;
            var totalHeight = additionalHeight + startHeight;
            var scaleHeight = totalHeight/startHeight;

            pathObjects[focused].object.scale(scaleWidth, scaleHeight);

            startWidth = totalWidth;
            startHeight = totalHeight;
            topLeftStart = event.point;

            pathObjects[focused].object.bounds.topLeft = event.point;
        }

        //leftCenter Scale
        var leftCenterStart = null;
        //var startWidth = null;

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
                topLeft.position = pathObjects[focused].object.bounds.topLeft;
                topRight.visible = true;
                topRight.position = pathObjects[focused].object.bounds.topRight;
                bottomLeft.visible = true;
                bottomLeft.position = pathObjects[focused].object.bounds.bottomLeft;
                bottomRight.visible = true;
                bottomRight.position = pathObjects[focused].object.bounds.bottomRight;
                leftCenter.visible = true;
                leftCenter.position = pathObjects[focused].object.bounds.leftCenter;
                rightCenter.visible = true;
                rightCenter.position = pathObjects[focused].object.bounds.rightCenter;
                topCenter.visible = true;
                topCenter.position = pathObjects[focused].object.bounds.topCenter;
                bottomCenter.visible = true;
                bottomCenter.position = pathObjects[focused].object.bounds.bottomCenter;
            }


            //handle keyboard events
            if(Key.isDown('backspace')){ //delete focused object when delete key pressed
                if(pathObjects[focused] != undefined){
                    pathObjects[focused].object.remove();
                    pathObjects[focused].type = "deleted";
                    focused = null;
                }
            }
        }

        //view the project
        paper.view.draw();
    }

    //update screen whenever update is true ( when there is a change to projectData )
    useEffect(() => {
        if(update == true){
            if(projectData.id != undefined){
                updateScreen();
            }
            setUpdate(false);
        }
    }, [update])

    //update screen on page load after props.projectData loads
    useEffect(() => {
        //set projectData = to the backend data from mysql database retrieved in index.js page
        setProjectData(props.projectData);
        if(projectData.id != undefined){
            //load the paper project
            updateScreen();
        }
    }, [props.projectData])

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
        //compile the projectJSON object
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
        //reload the frontend paper object
        setUpdate(true);
    }

    function log(){
        console.log(projectData)
        console.log(pathObjectsReact)
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