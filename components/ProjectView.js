import React, {useState, useEffect, useRef, useContext} from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import paper from "paper";
import { ProjectDataContext } from './ProjectControler';


export default function ProjectView(props){
    const {user, error, isLoading } = useUser();
    const canvasRef = useRef(null);
    //gets the projectData and update from the project controller
    const {projectData, update, setUpdate} = useContext(ProjectDataContext);

    //update screen whenever update is true
    useEffect(() => {
        if(update == true){
            if(projectData.id != undefined){
                updateScreen();
            }
            setUpdate(false)
        }
    }, [update])

    //update screen on page load
    useEffect(() => {
        if(projectData.id != undefined){
            updateScreen();
        }
    }, [projectData])

    //redraw the canvas
    function updateScreen(){
        //get a reference to the canvas dom object
        const canvas = canvasRef.current;
        //create an empty project and a view for the canvas
        paper.setup(canvas);
        //set the view size
        paper.view.viewSize = [800, 1000]
        //create a path to add objects to
        var path = new paper.Path();

        //set up background
        var background = new paper.Path.Rectangle({
            point: [0,0], 
            size:[800,1000],
            fillColor: [0.9,0.9,0.9],
            strokeColor: [0.5,0.5,0.5],
            strokeWidth: 10,
        });
        path.add(background);

        //handle objects from project controler
        for(var i = 0; i < projectData.projectJSON.objects.length; i++){
            var object = projectData.projectJSON.objects[i];
            var pathObject = null;
            //convert each object into a paper path object
            if(object.type == "rectangle"){
                pathObject = new paper.Path.Rectangle(object.data)
            }

            //add new pathObject to path
            path.add(pathObject);
        }

        //view the project
        paper.view.draw();
    }
    
    
    //handle user loading and error
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error.message}</div>;

    return (
        <div>
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