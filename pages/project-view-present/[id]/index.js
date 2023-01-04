import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import MainNavbar from '../../../components/MainNavBar';
import { Container, Row, Col, Button } from 'react-bootstrap';
import DownloadProject from '../../../components/DownloadProject';

export default function ProjectViewPresentPage({user}) {
    //get the id from the url
    const router = useRouter();
    const {id} = router.query;

    //used to store the link to the editor
    const [editLink, setEditLink] = useState(null);

    //used to store the project data
    const [projectData, setProjectData] = useState({});

    //used to authorize the user to access the project
    const [authorized, setAuthorized] = useState(true); 

    //get project data from backend based on project id on project load
    useEffect(() => {
        fetch(`/api/get-project-data-svg?id=${id}`).then(
            response => response.json()
        ).then((data) => {
            if(data.results.length == 1){
                //set the projectData to the data from the database
                setProjectData(data.results[0]);
                //populate the edit link
                setEditLink(`/project-view/${id}`)
            }
            else{ 
                //if the sql database does not return a project with the id that belongs to the user
                setAuthorized(false);
            }
        })
    }, [user]);

    return (
        <div>
                <Head>
                    <title>Open Chart</title>
                    <meta name='keywords' content='chart, online chart, flow chart, online flow chart' />
                </Head>
                <MainNavbar projectView={true} title={projectData.title}/>
                <br />
                <Container>
                    <Row className="justify-content-md-center">
                        <Col md="auto">
                            <Button variant="info" href={editLink}>Edit Mode</Button>
                        </Col>
                        <Col md="auto">
                            {projectData.projectSVG != null && <DownloadProject text="Download Project" variant="success" svg={projectData.projectSVG.svg} fileName={projectData.title} />}
                        </Col>
                    </Row>
                </Container>
                <br />
                <Container>
                    <Row className="justify-content-md-center">
                        <Col md="auto">
                            {projectData.projectSVG != null && <object data={"data:image/svg+xml;utf8," + encodeURIComponent(projectData.projectSVG.svg)} width="1000" height="1000"></object>}
                        </Col>
                    </Row>
                </Container>
        </div>
    )
}

export const getServerSideProps = withPageAuthRequired();