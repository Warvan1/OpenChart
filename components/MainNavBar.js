import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import LoggedIn from './LoggedIn';

export default function MainNavbar(props) {
  return (
    <Navbar bg="dark" expand="lg" style={{padding: '1rem'}}>
      <Navbar.Brand href="/" style={{color: "#ff9100"}}>Open Chart</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          {props.home && <Nav.Link href="/" active style={{backgroundColor: "#ff9100", color: "#000000"}}>Home</Nav.Link>}
          {!props.home && <Nav.Link href="/" style={{color: "#ffffff"}}>Home</Nav.Link>}
          {props.docs && <Nav.Link href="/docs" active style={{backgroundColor: "#ff9100", color: "#000000"}}>Documentation</Nav.Link>}
          {!props.docs && <Nav.Link href="/docs" style={{color: "#ffffff"}}>Documentation</Nav.Link>}
          {props.projects && <Nav.Link href="/projects" active style={{backgroundColor: "#ff9100", color: "#000000"}}>Projects</Nav.Link>}
          {!props.projects && <Nav.Link href="/projects" style={{color: "#ffffff"}}>Projects</Nav.Link>}
          <LoggedIn aClassName="nav-link" aColor="#ffffff"/>
          {props.projectView && <Nav.Link style={{backgroundColor: "#ff9100", color: "#000000"}} >{props.title}</Nav.Link>}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
