import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Head from 'next/head';
import MainNavbar from '../components/MainNavBar';
import { Container, Row, Col, Button } from 'react-bootstrap';
import SharedWithMeList from '../components/SharedWithMeList';

export default function SharedWithMePage({user}) {

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
                        <Button variant="info" href="/projects" style={{width: '12rem'}}>Back To My Projects</Button>
                    </Col>
                </Row>
            </Container>
            <br />
            <SharedWithMeList />
        </div>
    )
}

export const getServerSideProps = withPageAuthRequired();