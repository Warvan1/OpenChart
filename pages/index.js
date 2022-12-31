import Head from 'next/head';
import Image from 'next/image';
import MainNavbar from '../components/MainNavBar';
import { Col, Row, Container, Button } from 'react-bootstrap';
import diagram1 from '../public/diagram1.png';
import lineDiagram1 from '../public/lineDiagram1.png';
import lineDiagram2 from '../public/lineDiagram2.png';
import lineDiagram3 from '../public/lineDiagram3.png';


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
        <br />
        <Row className="justify-content-md-center">
          <Col md="auto">
            <h4> How to add Lines.</h4>
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col md={4}>
            <Row>
              <Button variant="warning"> <h5>Select a node and hold control while clicking on one of the handles.</h5></Button>
            </Row>
            <Row>
              <Image src={lineDiagram1} alt="" />
            </Row>
          </Col>
          <Col md={4}>
            <Row>
              <Button variant="success"> <h5>You can create joints in the line by holding shift while clicking on the background.</h5></Button>
            </Row>
            <Row>
              <Image src={lineDiagram2} alt="" />
            </Row>
          </Col>
          <Col md={4}>
            <Row>
              <Button variant="info"> <h5>To finish the line hold control and click on the handle of a different node.</h5></Button>
            </Row>
            <Row>
              <Image src={lineDiagram3} alt="" />
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
