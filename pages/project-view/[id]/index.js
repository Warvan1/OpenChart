import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router';
import MainNavbar from '../../../components/MainNavBar';
import ProjectControler from '../../../components/ProjectControler';

export default function ProjectViewPage({user}) {
    //get the id from the url
    const router = useRouter();
    const {id} = router.query;

    return (
        <div>
                <Head>
                    <title>Open Chart</title>
                    <meta name='keywords' content='chart, online chart, flow chart, online flow chart' />
                </Head>
                <MainNavbar />
                <ProjectControler id={id}/>
        </div>
    )
}

export const getServerSideProps = withPageAuthRequired();