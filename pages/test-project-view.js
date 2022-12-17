import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Head from 'next/head'
import Image from 'next/image'
import MainNavbar from '../components/MainNavBar';
import ProjectView from '../components/TestProjectView';

export default function TestProjectViewPage({user}) {
  return (
    <div>
        <Head>
            <title>Open Chart</title>
            <meta name='keywords' content='chart, online chart, flow chart, online flow chart' />
        </Head>
        <MainNavbar />
        <ProjectView />
        <p>Project view page</p>
    </div>
  )
}

export const getServerSideProps = withPageAuthRequired();