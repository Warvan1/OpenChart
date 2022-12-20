import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import MainNavbar from '../../../components/MainNavBar';
import ProjectEditor from '../../../components/ProjectEditor';

export default function ProjectViewPage({user}) {
    //get the id from the url
    const router = useRouter();
    const {id} = router.query;

    //used to store the project data
    const [projectData, setProjectData] = useState({})

    //used to authorize the user to access the project
    const [authorized, setAuthorized] = useState(true); 

    //get project data from backend based on project id on project load
    useEffect(() => {
        fetch(`/api/get-project-data?id=${id}`).then(
            response => response.json()
        ).then((data) => {
            if(data.results.length == 1){
                setProjectData(data.results[0])
            }
            else{ 
                //if the sql database does not return a project with the id that belongs to the user
                setAuthorized(false);
            }
        })
    }, [user])

    return (
        <div>
                <Head>
                    <title>Open Chart</title>
                    <meta name='keywords' content='chart, online chart, flow chart, online flow chart' />
                </Head>
                <MainNavbar />
                {authorized && <ProjectEditor id={id} projectData={projectData}/>}
                {!authorized && <h1>Access Denied/ Does Not Exist</h1>}
        </div>
    )
}

export const getServerSideProps = withPageAuthRequired();