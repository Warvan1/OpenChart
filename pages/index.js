import Head from 'next/head';
import Image from 'next/image';
import MainNavbar from '../components/MainNavBar';
import { Col, Row, Container, Button } from 'react-bootstrap';
import diagram1 from '../public/diagram1.png';

export default function HomePage() {
  return (
    <div>
      <Head>
          <title>Open Chart</title>
          <meta name='keywords' content='chart, online chart, flow chart, online flow chart' />
      </Head>
      <MainNavbar home={true} />
      <Container>
        <br />
        <Row className="justify-content-md-center">
          <Col md="auto">
            <h3>Open Chart is a free tool for creating diagrams and flow charts.</h3>
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col md="auto">
            <Image src={diagram1} alt="" />
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col md="auto">
            <h5>Using Open Chart you can make diagrams with several differient types of customized nodes and lines.</h5>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
