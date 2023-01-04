import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Head from 'next/head';
import MainNavbar from '../components/MainNavBar';
import ProjectsList from '../components/ProjectsList';
import CreateProject from '../components/CreateProject';
import { Button, Container, Row, Col} from 'react-bootstrap';

export default function ProjectsPage({user}) {
  return (
    <div>
        <Head>
            <title>Open Chart</title>
            <meta name='keywords' content='chart, online chart, flow chart, online flow chart' />
        </Head>
        <MainNavbar projects={true} />
        <br />
        <Container>
          <Row className="justify-content-md-center">
            <Col md="auto">
              <CreateProject />
            </Col>
            <Col md="auto">
              <Button variant="warning" href="/shared-with-me" style={{width: '12rem'}}>Shared With Me</Button>
            </Col>
          </Row>
        </Container>
        <br />
        <ProjectsList />
    </div>
  )
}

export const getServerSideProps = withPageAuthRequired();