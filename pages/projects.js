import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Head from 'next/head'
import Image from 'next/image'
import MainNavbar from '../components/MainNavBar';
import ProjectsList from '../components/ProjectsList';

export default function ProjectsPage({user}) {
  return (
    <div>
        <Head>
            <title>Open Chart</title>
            <meta name='keywords' content='chart, online chart, flow chart, online flow chart' />
        </Head>
        <MainNavbar projects={true} />
        <ProjectsList />
        <p>Projects page</p>
    </div>
  )
}

export const getServerSideProps = withPageAuthRequired();