import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Head from 'next/head'
import Image from 'next/image'
import MainNavbar from '../components/MainNavBar';

export default function ProfilePage({user}) {

  return (
    <div>
        <Head>
            <title>Open Chart</title>
            <meta name='keywords' content='chart, online chart, flow chart, online flow chart' />
        </Head>
        <MainNavbar profile={true} />
        <p>Profile page</p>
    </div>
  )
}

export const getServerSideProps = withPageAuthRequired();