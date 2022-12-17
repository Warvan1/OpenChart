import React, {useState, useEffect, createContext} from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import ProjectView from './ProjectView';
import { Button, Container, Row } from 'react-bootstrap';

export const ProjectDataContext = createContext(null);

export default function ProjectControler(props){
    const {user, error, isLoading } = useUser();
    //used to store the project data
    const [projectData, setProjectData] = useState({});
    //set to true when we want to update the screen
    const [update, setUpdate] = useState(false);

    //get project data from backend based on project id
    useEffect(() => {
        if(!isLoading && !error){
            fetch(`/api/get-project-data?id=${props.id}`).then(
                response => response.json()
            ).then((data) => {
                setProjectData(data.results[0])
            })
        }
    }, [user])

    //save the project to the mysql database
    function saveProject(){
        fetch(`/api/save-project?id=${props.id}`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(projectData.projectJSON),
        })
    }

    //temporary object adding function
    function addObject(){
        var tempProjectData = projectData;
        
        tempProjectData.projectJSON.objects.push({
            data: {
                size: [20,20],
                fillColor: "yellow",
                point: [Math.floor(Math.random() * 500), Math.floor(Math.random() * 500)]
            },
            type: "rectangle"
        }) 
        setProjectData(tempProjectData);
        setUpdate(true);
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
                    </div>
                </Row>
            </Container>
            <ProjectDataContext.Provider value={{projectData, update, setUpdate}}>
                <ProjectView />
            </ProjectDataContext.Provider>
        </div>
    );
}