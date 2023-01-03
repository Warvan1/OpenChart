import React, {useState, useEffect} from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Container, Row } from 'react-bootstrap';
import ProjectsListCard from './ProjectsListCard';

export default function ProjectsList(props){
    const {user, error, isLoading } = useUser();
    const [projectData, setProjectData] = useState({results: [{title: ""}]})

    //get projects from backend based on user email
    useEffect(() => {
        if(!isLoading && !error){
            fetch(`/api/get-projects`).then(
                response => response.json()
            ).then(
                data => {
                    setProjectData(data);
                }
            )
        }
    }, [user])

    
    //handle user loading and error
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error.message}</div>;

    return (
        <Container>
            <Row className="justify-content-md-center">
                {projectData.results.map((project) => (
                    <ProjectsListCard project={project}/>
                ))}
            </Row>
        </Container>
    );
}