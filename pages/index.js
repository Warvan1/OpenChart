import Head from 'next/head'
import Image from 'next/image'
import MainNavbar from '../components/MainNavBar'

export default function HomePage() {
  return (
    <div>
      <Head>
          <title>Open Chart</title>
          <meta name='keywords' content='chart, online chart, flow chart, online flow chart' />
      </Head>
      <MainNavbar home={true} />
      <p>home page</p>
    </div>
  )
}
