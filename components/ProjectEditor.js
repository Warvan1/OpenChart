import React, {useState, useEffect, useRef, useContext, createContext } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Button, Col, Container, Row } from 'react-bootstrap';
import paper from "paper";
import { Key, Point, Segment } from 'paper/dist/paper-core';
import { ProjectDataContext } from '../pages/project-view/[id]';
import StyleEditor from './StyleEditor';

export const StyleContext = createContext(null);

export default function ProjectEditor(props){
    const {user, error, isLoading } = useUser();
    const canvasRef = useRef(null);
    //retrieve the project Data hooks and the reload hooks from the index.js page
    const {projectData, setProjectData, reload, setReload, saveTime, setSaveTime, styles, setStyles} = useContext(ProjectDataContext);
    //used to store the currient pathObjects from paper project
    const [pathObjectsReact, setPathObjectsReact] = useState([]);
    //used to store the render order of the path objects so that when we save to database that isnt lost
    const [renderOrderReact, setRenderOrderReact] = useState([]);
    //used to keep track of line Objects from paper project
    const [lineObjectsReact, setLineObjectsReact] = useState([]);
    //used to make sure we only setup the screen once
    const [updated, setUpdated] = useState(false);
    //used to update the since last save clock
    const [saveTimeUpdate, setSaveTimeUpdate] = useState({minutes: 0, seconds: 0});

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

        //keep track of lineFocus seperate from pathObjects
        var lineFocused = null;

        //keep track of text input state
        var textInputMode = false;
        var catchTextInputChange = null;

        //object copy buffer
        var pathCopyIndex = null;
        var pathCopyPosition = null;

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
        var lineHighlightObjectEnds = {center: [0,0], radius: 5, fillColor: [1,0,0]};
        var lineHighlightObjectJoints = {center: [0,0], radius: 5, fillColor: [0.5,0,1]};
        var lineHighlight = [];

        //reduce the projectData.objects to paper path objects
        //create array of path objects
        var pathObjects = [];
        
        //use the object array to make path objects and push them into the path object array
        for(var i = 0; i < projectData.projectJSON.objects.length; i++){
            var object = projectData.projectJSON.objects[i];
            //convert each object into a paper path object
            if(object.type.startsWith("text-")){
                var pathObject = null;
                var textObject = null;
                if(object.type == "text-rectangle"){
                    //create a path object
                    pathObject = new paper.Path.Rectangle(object.data);
                    textObject = new paper.PointText(object.textData);
                    //set there positions equal
                    textObject.position = pathObject.position;
                }
                if(object.type == "text-ellipse"){
                    //create a path object
                    var pathObject = new paper.Path.Ellipse(object.data);
                    var textObject = new paper.PointText(object.textData);
                    //set there positions equal
                    textObject.position = pathObject.position;
                }
                pathObjects.push({
                    object: pathObject,
                    textObject: textObject,
                    type: object.type,
                    textInputOffset: object.textInputOffset,
                    index: i,
                    linesConnected: object.linesConnected,
                });
            }
            else{
                var pathObject = null;
                if(object.type == "rectangle"){
                    //create a path object
                    pathObject = new paper.Path.Rectangle(object.data);
                }
                if(object.type == "ellipse"){
                    //create a path object
                    pathObject = new paper.Path.Ellipse(object.data);
                }
                pathObjects.push({
                    object: pathObject, 
                    type: object.type,
                    index: i,
                    linesConnected: object.linesConnected,
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
            pathObjectEvents(data);
        });

        //handle events for pathObjects
        function pathObjectEvents(data){
            //used to keep track of the offset from where you clicked on an object to the objects center position
            var clickOffset = null;

            //handle object onload for first time
            //when adding an object if data.textInputOffset != null
            if(data.textInputOffset != null){
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
                //update line objects connected to this path object
                updateLineEnds(data.index);
            }

            data.object.onMouseDown = function(event){
                //calculate the click offset between where we click and the object position
                clickOffset = {x: event.point.x - data.object.position.x, y: event.point.y - data.object.position.y};

                //handle object focus and ordering
                //set this object as the focused object
                focused = data.index;
                //set textInput mode to false since we clicked on a non text object
                textInputMode = false;
                //unfocus from any lines when we focus on an item
                lineFocused = null;
                //clear the lingHightlight array
                clearLineHighlight();
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
                    //unfocus from any lines when we focus on an item
                    lineFocused = null;
                    //clear the lingHightlight array
                    clearLineHighlight();

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
        }

        //handle lineObjects
        var lineObjects = [];
        var lineBeingMade = null;

        //reduce the projectData.lines to line objects on project load
        projectData.projectJSON.lines.forEach((line) => {
            if(line.type == "normal"){
                var lineObject = new paper.Path(line.line)
                lineObjects.push({
                    line: lineObject,
                    startObjectIndex: null,
                    startObjectHandle: null,
                    endObjectIndex: null,
                    endObjectHandle: null,
                    index: line.index,
                    type: line.type
                })
            }
        })

        //connect the lineObjects to pathObjects based on the pathObjects[].linesConnected array's on project load
        pathObjects.forEach((object) => {
            object.linesConnected.forEach((objectLine) => {
                lineObjects.forEach((line) => {
                    if(objectLine.index == line.index){
                        if(objectLine.side == "start"){
                            line.startObjectIndex = object.index;
                            line.startObjectHandle = objectLine.handle;
                        }
                        if(objectLine.side == "end"){
                            line.endObjectIndex = object.index;
                            line.endObjectHandle = objectLine.handle;
                        }
                    }
                })
            })
        })

        //update LineObjectsReact
        setLineObjectsReact(lineObjects);

        //handle events for lineObjects
        lineObjects.forEach((data) => {
            lineObjectEvents(data);
        })

        //handle events for a specific line object
        function lineObjectEvents(data){

            data.line.onMouseDown = function(event){
                //unfocus from any path objects
                focused = null;
                //set textInputMode to false since we clicked on a non text input object
                textInputMode = false;

                if(lineFocused != data.index){
                    //set lineFocus = to the index key of the line
                    lineFocused = data.index; 
                    //clear the lingHightlight array
                    clearLineHighlight();
                    //populate the lineHighlight array with lineHightlight Objects
                    for(var i = 0; i < data.line.segments.length; i++){
                        var segment = data.line.segments[i];
                        //create a new instace and place it on a line joint
                        var lineHighlightObject = {};
                        var eventType = null;
                        if(i == 0 || i == data.line.segments.length-1){
                            lineHighlightObject = lineHighlightObjectEnds;
                            eventType = "end";
                        }
                        else{
                            lineHighlightObject = lineHighlightObjectJoints;
                            eventType = "joint";
                        }
                        lineHighlightObject.center = [segment.point.x, segment.point.y];
                        var lineHighlightInstance = new paper.Path.Circle(lineHighlightObject);
                        //add instance to array for storage
                        lineHighlight.push(lineHighlightInstance);
                        //handle events from the instance
                        LineHighlightEvents(lineHighlightInstance, data.line, eventType, i);
                    }
                }
            }

        }

        //handle line lightlight events
        function LineHighlightEvents(instance, line, eventType, i){
            
            instance.onMouseDrag = function(event){
                //handle joint moving
                if(eventType == "joint"){
                    line.segments[i].point = event.point;
                    instance.position = event.point;
                }
            }
        }

        //clears all objects from LineHighlight
        function clearLineHighlight(){
            //remove each circle from the view
            lineHighlight.forEach((circle) => {
                circle.remove();
            })
            //empty array
            lineHighlight = [];
        }

        //used to create a line object and control line object manipulation
        function lineDraw(event, handle){
            //start a line
            if(lineBeingMade == null){
                var line = new paper.Path({
                    segments: [[event.point.x, event.point.y]],
                    strokeWidth: styles.lineData.strokeWidth,
                    strokeColor: styles.lineData.strokeColor,
                })
                lineBeingMade = Math.random(); //random id for new line
                var lineObject = {
                    line: line,
                    startObjectIndex: focused,
                    startObjectHandle: handle,
                    endObjectIndex: null,
                    endObjectHandle: null,
                    index: lineBeingMade,
                    type: "normal",
                }
                lineObjects.push(lineObject)

                //add the line to pathObjects[focused] connected lines
                pathObjects[focused].linesConnected.push({index: lineBeingMade, side: "start", handle: handle});

            }
            //end a line
            else{
                //make sure we dont start and stop on the same object
                lineObjects.forEach((line) => {
                    if(line.index == lineBeingMade && line.startObjectIndex != focused){
                        //create a new object with the same data as the old one but with the last segment
                        //we do this so that lineEvents work correctly.
                        //create a new array of segments
                        var segments = []
                        line.line.segments.forEach((segment) => {
                            segments.push([segment.point.x, segment.point.y]);
                        })
                        segments.push([event.point.x, event.point.y]);
                        console.log(segments);

                        //create a new lineObject based on the old one but with the new segments and endObject data
                        var newLine = {
                            line: new paper.Path({
                                segments: segments,
                                strokeWidth: line.line.strokeWidth,
                                strokeColor: line.line.strokeColor,
                            }),
                            startObjectIndex: line.startObjectIndex,
                            startObjectHandle: line.startObjectHandle,
                            endObjectIndex: focused,
                            endObjectHandle: handle,
                            index: line.index,
                            type: line.type,
                        }

                        //remove the old object from view and mark it for deletion
                        line.type = "delete";
                        line.line.remove();

                        //add the line to pathObjects[focused] connected lines
                        pathObjects[focused].linesConnected.push({index: lineBeingMade, side: "end", handle: handle});
                        //finish the line
                        lineBeingMade = null;

                        //add the newly created line to the lineObjects
                        lineObjects.push(newLine);

                        //handle line events for new line
                        lineObjectEvents(newLine);
                    }
                })
            }
            //update the react record of the lineObjects
            setLineObjectsReact(lineObjects);
        }

        function updateLineEnds(index){
            lineObjects.forEach((lineObject) => {
                if(lineObject.startObjectIndex == index){
                    doUpdate(0, index, lineObject.startObjectHandle);
                }
                else if(lineObject.endObjectIndex == index){
                    doUpdate(lineObject.line.segments.length - 1, index, lineObject.endObjectHandle);
                }

                function doUpdate(lineIndex, pathIndex, handle){
                    if(handle == "topLeft"){
                        lineObject.line.segments[lineIndex].point = pathObjects[pathIndex].object.bounds.topLeft;
                    }
                    if(handle == "topRight"){
                        lineObject.line.segments[lineIndex].point = pathObjects[pathIndex].object.bounds.topRight;
                    }
                    if(handle == "bottomLeft"){
                        lineObject.line.segments[lineIndex].point = pathObjects[pathIndex].object.bounds.bottomLeft;
                    }
                    if(handle == "bottomRight"){
                        lineObject.line.segments[lineIndex].point = pathObjects[pathIndex].object.bounds.bottomRight;
                    }
                    if(handle == "leftCenter"){
                        lineObject.line.segments[lineIndex].point = pathObjects[pathIndex].object.bounds.leftCenter;
                    }
                    if(handle == "rightCenter"){
                        lineObject.line.segments[lineIndex].point = pathObjects[pathIndex].object.bounds.rightCenter;
                    }
                    if(handle == "topCenter"){
                        lineObject.line.segments[lineIndex].point = pathObjects[pathIndex].object.bounds.topCenter;
                    }
                    if(handle == "bottomCenter"){
                        lineObject.line.segments[lineIndex].point = pathObjects[pathIndex].object.bounds.bottomCenter;
                    }
                }
            })
            //update the react record of the lineObjects
            setLineObjectsReact(lineObjects);
        }

        //the following 300 ish lines of code are just for calculating and handling scale of pathObjects.

        //handle clicking on the background
        background.onMouseDown = function(event){
            //handle line object middle corners
            if(lineBeingMade != null && event.modifiers.shift == true){
                lineObjects.forEach((line) => {
                    if(line.index == lineBeingMade){
                        line.line.segments.push(new Segment(event.point.x, event.point.y));
                    }
                })
            }
            focused = null;
            //make sure that textInput is set to false when we click on the background
            textInputMode = false;

            //unfocus from any lines when we focus on an item
            lineFocused = null;
            //clear the lingHightlight array
            clearLineHighlight();
        }

        //resizing an object using the focus circles.
        var startWidth = null;
        var startHeight = null;

        //topLeft Scale
        var topLeftStart = null;
        
        topLeft.onMouseDown = function(event) {
            if(event.modifiers.control == true){
                lineDraw(event, "topLeft");
            }
            else{
                //initialize our scale loop with starting values
                startWidth = pathObjects[focused].object.bounds.size.width;
                startHeight = pathObjects[focused].object.bounds.size.height;
                topLeftStart = pathObjects[focused].object.bounds.topLeft;
            }
        }

        topLeft.onMouseDrag = function(event){
            if(event.modifiers.control == false && topLeftStart != null){
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
                updateLineEnds(focused);
            }
        }

        //topRight Scale
        var topRightStart = null;
        
        topRight.onMouseDown = function(event) {
            if(event.modifiers.control == true){
                lineDraw(event, "topRight");
            }
            else{
                //initialize our scale loop with starting values
                startWidth = pathObjects[focused].object.bounds.size.width;
                startHeight = pathObjects[focused].object.bounds.size.height;
                topRightStart = pathObjects[focused].object.bounds.topRight;
            }
        }

        topRight.onMouseDrag = function(event){
            if(event.modifiers.control == false && topRightStart != null){
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
                updateLineEnds(focused);
            }
        }

        //bottomLeft Scale
        var bottomLeftStart = null;
        
        bottomLeft.onMouseDown = function(event) {
            if(event.modifiers.control == true){
                lineDraw(event, "bottomLeft");
            }
            else{
                //initialize our scale loop with starting values
                startWidth = pathObjects[focused].object.bounds.size.width;
                startHeight = pathObjects[focused].object.bounds.size.height;
                bottomLeftStart = pathObjects[focused].object.bounds.bottomLeft;
            }
        }

        bottomLeft.onMouseDrag = function(event){
            if(event.modifiers.control == false && bottomLeftStart != null){
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
                updateLineEnds(focused);
            }
        }

        //bottomRight Scale
        var bottomRightStart = null;
        
        bottomRight.onMouseDown = function(event) {
            if(event.modifiers.control == true){
                lineDraw(event, "bottomRight");
            }
            else{
                //initialize our scale loop with starting values
                startWidth = pathObjects[focused].object.bounds.size.width;
                startHeight = pathObjects[focused].object.bounds.size.height;
                bottomRightStart = pathObjects[focused].object.bounds.bottomRight;
            }
        }

        bottomRight.onMouseDrag = function(event){
            if(event.modifiers.control == false && bottomRightStart != null){
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
                updateLineEnds(focused);
            }
        }

        //leftCenter Scale
        var leftCenterStart = null;

        leftCenter.onMouseDown = function(event) {
            if(event.modifiers.control == true){
                lineDraw(event, "leftCenter");
            }
            else{
                startWidth = pathObjects[focused].object.bounds.size.width;
                leftCenterStart = pathObjects[focused].object.bounds.leftCenter;
            }
        }

        leftCenter.onMouseDrag = function(event){
            if(event.modifiers.control == false && leftCenterStart != null){
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
                updateLineEnds(focused);
            }
        }

        //rightCenter Scale
        var rightCenterStart = null;

        rightCenter.onMouseDown = function(event) {
            if(event.modifiers.control == true){
                lineDraw(event, "rightCenter");
            }
            else{
                startWidth = pathObjects[focused].object.bounds.size.width;
                rightCenterStart = pathObjects[focused].object.bounds.rightCenter;
            }
        }

        rightCenter.onMouseDrag = function(event){
            if(event.modifiers.control == false && rightCenterStart != null){
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
                updateLineEnds(focused);
            }
        }

        //topCenter Scale
        var topCenterStart = null;

        topCenter.onMouseDown = function(event) {
            if(event.modifiers.control == true){
                lineDraw(event, "topCenter");
            }
            else{
                startHeight = pathObjects[focused].object.bounds.size.height;
                topCenterStart = pathObjects[focused].object.bounds.topCenter;
            }
        }

        topCenter.onMouseDrag = function(event){
            if(event.modifiers.control == false && topCenterStart != null){
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
                updateLineEnds(focused);
            }
        }

        //bottomCenter Scale
        var bottomCenterStart = null;

        bottomCenter.onMouseDown = function(event) {
            if(event.modifiers.control == true){
                lineDraw(event, "bottomCenter");
            }
            else{
                startHeight = pathObjects[focused].object.bounds.size.height;
                bottomCenterStart = pathObjects[focused].object.bounds.bottomCenter;
            }
        }

        bottomCenter.onMouseDrag = function(event){
            if(event.modifiers.control == false && bottomCenterStart != null){
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
                updateLineEnds(focused);
            }
        }

        //handle keyboard events
        const tool = new paper.Tool();

        tool.onKeyDown = function(event){
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
                //update position
                pathObjects[focused].textObject.position = pathObjects[focused].object.position;
            }
            else{
                //handle key presses when outside of textInputMode
                //handle deleting objects when backspace key pressed
                if(event.key == "backspace"){
                    //handle pathObject deletion
                    if(pathObjects[focused] != undefined){
                        pathObjects[focused].object.remove();
                        if(pathObjects[focused].type.startsWith("text-")){
                            pathObjects[focused].textObject.remove();
                        }
                        //remove all lines connected to it
                        pathObjects[focused].linesConnected.forEach((objectLine) => {
                            lineObjects.forEach((line) => {
                                if(objectLine.index == line.index){
                                    line.line.remove();
                                    line.type = "deleted";
                                }
                            })
                        })
                        pathObjects[focused].type = "deleted";
                        focused = null;
                    }
                    //handle lineObject deletion
                    if(lineFocused != null){
                        lineObjects.forEach((line) => {
                            if(line.index == lineFocused){
                                line.line.remove();
                                line.type = "deleted";
                                //make sure to remove highlighting
                                clearLineHighlight();
                            }
                        })
                    }
                }
                if((event.key == "c" && Key.modifiers.control) || (event.key == "c" && Key.modifiers.control && Key.modifiers.alt)){
                    if(focused != null){
                        //save focused index for later printing
                        pathCopyIndex = focused;
                        pathCopyPosition = pathObjects[focused].object.position;
                    }
                }
                if((event.key == "v" && Key.modifiers.control) || (event.key == "v" && Key.modifiers.control && Key.modifiers.alt)){
                    //clone paper objects
                    var object = {};
                    var pathObject = pathObjects[pathCopyIndex].object.clone();
                    pathObject.position = pathCopyPosition;
                    var textObject = null;
                    if(pathObjects[pathCopyIndex].type.startsWith("text-")){
                        textObject = pathObjects[pathCopyIndex].textObject.clone();
                        textObject.position = pathObject.position;
                        object = {index: pathObjects.length, type: pathObjects[pathCopyIndex].type, object: pathObject, textObject: textObject, textInputOffset: 0, linesConnected: []}
                    }
                    else{
                        object = {index: pathObjects.length, type: pathObjects[pathCopyIndex].type, object: pathObject}
                    }
                    //create new pathObject within pathObjects
                    pathObjects.push(object);
                    //handle renderOrder entry
                    renderOrder.push(object.index);
                    //update the pathObjects and renderOrder within react
                    setPathObjectsReact(pathObjects);
                    setRenderOrderReact(renderOrder);
                    //handle event listeners
                    pathObjectEvents(pathObjects[object.index]);
                }
            }
            
        }
        
        //runs every animation frame
        paper.view.onFrame = function(event){
            //console.log(`${focused}     ${lineFocused}`);
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

            //make handles more transparent when editing test mode
            if(textInputMode == true){
                topLeft.opacity = 0.5;
                topRight.opacity = 0.5;
                bottomLeft.opacity = 0.5;
                bottomRight.opacity = 0.5;
                leftCenter.opacity = 0.5;
                rightCenter.opacity = 0.5;
                topCenter.opacity = 0.5;
                bottomCenter.opacity = 0.5;
            }
            else{
                topLeft.opacity = 1;
                topRight.opacity = 1;
                bottomLeft.opacity = 1;
                bottomRight.opacity = 1;
                leftCenter.opacity = 1;
                rightCenter.opacity = 1;
                topCenter.opacity = 1;
                bottomCenter.opacity = 1;
            }

            //handle | removal after we click off a text input
            if(focused != catchTextInputChange && catchTextInputChange != null){
                //remove the | from the caught textInput uppon exiting the textInput
                var content = pathObjects[catchTextInputChange].textObject.content;
                var insertLocation = content.length - pathObjects[catchTextInputChange].textInputOffset - 1;
                content = content.slice(0, insertLocation) + content.slice(insertLocation + 1, content.length);
                pathObjects[catchTextInputChange].textObject.content = content;
                pathObjects[catchTextInputChange].textInputOffset = null;
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
        //remove old tools
        if(paper.tools.length == 2){
            paper.tools[0].remove();
        }
        //remove old projects from projects list
        if(paper.projects.length == 2){
            paper.projects[0].remove();
        }
        
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
        var tempProjectJSON = {objects: [], lines: []};
        //add pathObjects to projectJSON in the order that they render on the screen
        renderOrderReact.forEach((index) => {
            //retrieve the data from pathObjects and create a dataObject with the same type
            var data = pathObjectsReact[index];
            var dataObject = {type: data.type, data: {}};
            //use the data.type to create a dataObject with the correct configuration
            var width = data.object.bounds.size.width;
            var height = data.object.bounds.size.height;
            var x = data.object.bounds.topLeft.x;
            var y = data.object.bounds.topLeft.y;
            dataObject.data = {
                size: [width, height],
                point: [x , y],
                strokeColor: data.object.style.strokeColor.components,
                strokeWidth: data.object.strokeWidth,
                fillColor: data.object.style.fillColor.components,
            }
            dataObject.linesConnected = data.linesConnected;
            if(data.type.startsWith("text-")){
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
        //add lineObjects to the projectJSON
        lineObjectsReact.forEach((lineObject) => {
            if(lineObject.type == "normal"){
                var segments = [];
                lineObject.line.segments.forEach((segment) => {
                    segments.push([segment.point.x, segment.point.y]);
                });
                tempProjectJSON.lines.push({
                    line: {
                        segments: segments,
                        strokeWidth: lineObject.line.strokeWidth,
                        strokeColor: lineObject.line.strokeColor.components,
                        visible: lineObject.line.visible,
                    },
                    index: lineObject.index,
                    type: lineObject.type
                })
            }
        })
        return tempProjectJSON;
    }

    //save the project to the mysql database
    function saveProject(){
        //reset time since last save
        setSaveTime(Math.floor(Date.now()));
        //compile the projectJSON object if not provided
        var tempProjectJSON = compileToProjectData();
        console.log(tempProjectJSON);
        //send the projectJson object to the server
        fetch(`/api/save-project?id=${props.id}`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(tempProjectJSON),
        })
    }

    //textBox adding function
    function addNewNode(){
        //retrieve the currient backend projectData
        var tempProjectData = projectData;
        //compile the currient frontend projectData into a backend projectJSON object
        var tempProjectJSON = compileToProjectData();

        //add a new data object to projectJSON object
        tempProjectJSON.objects.push({
            data: {
                point: styles.pathData.point,
                size: styles.pathData.size,
                strokeColor: styles.pathData.strokeColor,
                strokeWidth: styles.pathData.strokeWidth,
                fillColor: styles.pathData.fillColor,
            },
            textData: {
                point: styles.pathData.point,
                content: styles.textData.content,
                fillColor: styles.textData.fillColor,
                fontSize: styles.textData.fontSize,
            },
            type: styles.type,
            textInputOffset: null,
            linesConnected: [],
        });

        //set the projectJSON in the backend projectJSON to the new projectJSON with the new object
        tempProjectData.projectJSON = tempProjectJSON;
        //update the projectData react object
        setProjectData(tempProjectData);
        //tell the index.js page to reload the component with the new data
        setReload(!reload);
    }

    //creates a loop that updates the saveTimeUpdate every second
    useEffect(() => {
        const timerId = setTimeout(() => {
            var minutes = Math.floor((Date.now() - saveTime)/60000);
            var seconds = Math.floor(((Date.now() - saveTime)/1000) - minutes*60);
            setSaveTimeUpdate({minutes: minutes, seconds: seconds});
        }, 1000);
        return function cleanup() {
            clearInterval(timerId);
        }
    }, [saveTimeUpdate, saveTime])

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error.message}</div>;

    return (
        <div>
            <Container>
                <Row className="justify-content-md-center">
                    <div style={{width: '18rem'}}>
                        <h3>{projectData.title}</h3>
                        <p>Time Since Last Save: {saveTimeUpdate.minutes}:{saveTimeUpdate.seconds}</p>
                    </div>
                </Row>
                <Row className="justify-content-md-center">
                    <Button variant="dark" onClick={saveProject} style={{width: '12rem'}}>Save</Button>
                    <Button variant="primary" onClick={addNewNode} style={{width: '12rem'}}>Add New Node</Button>
                    <StyleContext.Provider value = {{styles, setStyles}}>
                        <StyleEditor />
                    </StyleContext.Provider>
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