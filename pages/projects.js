import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Head from 'next/head'
import Image from 'next/image'
import MainNavbar from '../components/MainNavBar';
import ProjectsList from '../components/ProjectsList';
import CreateProject from '../components/CreateProject';

export default function ProjectsPage({user}) {
  return (
    <div>
        <Head>
            <title>Open Chart</title>
            <meta name='keywords' content='chart, online chart, flow chart, online flow chart' />
        </Head>
        <MainNavbar projects={true} />
        <br />
        <CreateProject />
        <br />
        <ProjectsList />
    </div>
  )
}

export const getServerSideProps = withPageAuthRequired();