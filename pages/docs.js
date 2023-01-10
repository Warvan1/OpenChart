import Head from 'next/head';
import MainNavbar from '../components/MainNavBar';
import { Accordion, Container, Row, Col, Button } from 'react-bootstrap';
import Link from 'next/link';

export default function docs({user}) {

    return (
        <div>
            <Head>
                <title>Open Chart</title>
                <meta name='keywords' content='chart, online chart, flow chart, online flow chart' />
            </Head>
            <MainNavbar docs={true} />
            <br />
            <Container>
                <Row><h4>Projects</h4></Row>
                <Accordion>
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>Create, Edit and View</Accordion.Header>
                        <Accordion.Body>
                            <h5>Create a project:</h5>
                            <p>- Click the "Create Project" button within the "Projects" page.
                            <br/>- Enter a title for your project and click "Create".</p>
                            <h5>Edit a Project:</h5>
                            <p>- Within the "Projects" page click on the icon for the project you want to edit.
                            <br/>- New projects will have the default icon of a white triangle inside a black circle.
                            <br/>- The icon for your project will update to a preview of the project when you save.</p>
                            <h5>Present View:</h5>
                            <p>- To view a project without the editor click the "Present View" button from within the editor.
                            <br/>- If you dont have edit permissions on a project shared with you clicking on a project icon will default to Present View.</p>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                        <Accordion.Header>Sharing</Accordion.Header>
                        <Accordion.Body>
                            <h5>Sharing a project:</h5>
                            <p>- To share a project click the "Share" button for the project you want to share on the "Projects" page.
                            <br/>- Fill out the email of the person you want to share the project with.
                            <br/>- When you share a project, the project will show up in the recipient's "Shared With Me" page.
                            <br/>- To provide a recipient with full edit access to your project click the "Provide Edit Permission" checkbox.
                            <br/>- If you provide edit permissions a recipient they will be able to edit your version of the project so make sure you only give edit permissions to trusted recipients, or make a copy.
                            <br/>- Sharing a project will not send the recipient an email.</p>
                            <h5>Updating Share Permissions:</h5>
                            <p>- Click the "Share" button on a project, A list of people with access to your project will be available at the bottom of the modal.
                            <br/>- To remove someones access to your project, click the "Delete" button next to the person you want to remove access from.
                            <br/>- To change someones edit permissions, click the "___ edit" buton to toggle edit permissions.</p>
                            <h5>Shared With Me Page:</h5>
                            <p>- Click "Shared With Me" at the top of the "Projects" page to access the Shared With Me Page.
                            <br/>- Clicking on an Icon on the Shared with me page will either open the editor or the Present View for a project depending on if you have edit permissions.
                            <br/>- Clicking "Remove" on a project will remove your access to the project, and wont delete it even if you have edit permissions.</p>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="2">
                        <Accordion.Header>Download</Accordion.Header>
                        <Accordion.Body>
                            <p>- To download a project click the "Download" button inside the "Project" page or the Project Editor.
                            <br/>- Select (.svg) or (.png) to download a file of the given type to your browsers default download folder.
                            <br/>- Note when downloading to png: If your project has complicated imported SVG files in it it might not get converted properly to png and you might get a corrupted file.</p>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="3">
                        <Accordion.Header>Copy</Accordion.Header>
                        <Accordion.Body>
                            <p>- To create a copy of a project, click the "Copy" button on the "Projects" page.
                            <br/>- This will create an editable copy of your project.
                            <br/>- You can not create copies of projects shared with you.</p>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="4">
                        <Accordion.Header>Save</Accordion.Header>
                        <Accordion.Body>
                            <p>- To save a project click the "Save" button within the project editor.
                            <br/>- The "Editor showes you how much time has passed since the last save.
                            <br/>- Since the project editor doesnt auto-save it is suggested that you save often to avoid loss of progress.</p>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
                <br />
                <Row><h4>Project Editor</h4></Row>
                <Accordion>
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>Creating a Node</Accordion.Header>
                        <Accordion.Body>
                            <h5>Built in Node:</h5>
                            <p>- When you click on the "Add New Node" button it creates a new node with the styles provided by the style editor.</p>
                            <h5>Custom SVG Node:</h5>
                            <p>- When you click on "Import Custom Node" you can import a (.svg) file as a node into your project.
                            <br/>- To access a library of open licensed SVG vector images visit <Link href="https://www.svgrepo.com/">svgrepo.com</Link>.</p>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                        <Accordion.Header>Moving and Scaling Nodes</Accordion.Header>
                        <Accordion.Body>
                            <h5>Moving a node:</h5>
                            <p>- Click on a node to select it and then drag it where you want it.
                            <br/>- Make sure you dont click on the text area in a node when trying to move it.</p>
                            <h5>Scaling a node:</h5>
                            <p>- When you click on a node you will see green, blue, and orange handles appear around the node.
                            <br/>- Click and drag the green and blue handles to resize the node.</p>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="2">
                        <Accordion.Header>Styling a Node</Accordion.Header>
                        <Accordion.Body>
                            <h5>Adding New Node:</h5>
                            <p>- When you add a new node via the "Add New Node" button the new node will have the styles of the current style state.</p>
                            <h5>Updating Node Styles:</h5>
                            <p>- To update the styles of an existing node double click on it, or hold the "u" key and single click.
                            <br/>- This will update the "Color" and "Details" sections of the nodes styles.
                            <br/>- This will NOT update the "Size", "position", "Node Type", or "Text Content" styles for the node.
                            <br/>- Note: When Updating the Styles of a Custom SVG node it might have unreversable and or unpredictable results with complicated svg images.</p>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="3">
                        <Accordion.Header>Keyboard Shortcuts</Accordion.Header>
                        <Accordion.Body>
                            <h5>Delete:</h5>
                            <p>- Select the node or line you want to delete.
                            <br/>- While your mouse is hovering over the selected Item press the "backspace" key.
                            <br/>- when you delete a node all likes attached to it are also deleted.</p>
                            <h5>Copy:</h5>
                            <p>- Select a node you want to copy and press "ctrl + c" or "cmd + c".
                            <br/>- This will update the copy buffer with the given node's information.</p>
                            <h5>Paste</h5>
                            <p>- press "ctrl + v" or "cmd + v" to paste a node in the copy buffer.
                            <br/>- pasted nodes will show up in the same location the copy'd node was in when it was copied which could cause it to be pasted on top of the copied node.</p>
                            <h5>Undo:</h5>
                            <p>- press "ctrl + z" or "cmd + z" to undo an action.
                            <br/>-The following is a list of actions that can be undone:
                            <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;* Styling a node/line.
                            <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;* Deleting a node/line.
                            <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;* Adding a node/line.
                            <br/>- Note: these actions are stored so that you can undo many of them in a row. However when you add a node the action history is reset.</p>
                            <h5>Style "u":</h5>
                            <p>- As covered in the Previous section of the docs, holding u and clicking on a selected object will update its styles as outlined there.</p>
                            <p><br/>*all keyboard shortcuts are for use inside the Project Editor*</p>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="4">
                        <Accordion.Header>Text Editing</Accordion.Header>
                        <Accordion.Body>
                            <p>- When you create a text node it will create it with the text found in the "Text Content" box within the styles editor.
                            <br/>- You can edit the text by clicking on the text within a node and editing it like normal.
                            <br/>- Click anywhere outside a textBox to stop editing the text.</p>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="5">
                        <Accordion.Header>Line Creation</Accordion.Header>
                        <Accordion.Body>
                            <h5>Create Line:</h5>
                            <p>- All lines MUST connect 2 nodes.
                            <br/>- Click on a Node then Click on an orange handle, This will designate that node as the start node and start the line on that handle.
                            <br/>- When you click on an orange line creation handle you enter line creation mode and the line creation handles turn purple.
                            <br/>- To end the line click on one of the purple handles on a DIFFERENT node this will make you exit line creation mode and draw your completed line.
                            <br/>- While in line creation mode (node line handles are purple) if you click on the background you will add a joint in the line.
                            <br/>- Line ends will stay connected to the Node they are assigned to when you move the nodes around.
                            <br/>- If you select a line by clicking on it you will see purple handles on any joints in the line, you can use thouse handles to drag the joint wherever you want it.</p>
                            <h5>Delete a Line:</h5>
                            <p>- You can delete a line by clicking on it and pressing "backspace".</p>
                            <h5>Style a line:</h5>
                            <p>- You can style lines using the "Lines" section of the style editor.
                            <br/>- When you create a new line it will be created with the styles in the lines editor.
                            <br/>- You can update thouse styles by double clicking on a line, or holding the "u" key and clicking on the line. (This is the same process as updating node styles.)</p>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="6">
                        <Accordion.Header>FireFox Issues</Accordion.Header>
                        <Accordion.Body>
                            <p>- The Copy, Paste, and Undo Keybinds dont work on FireFox since it captures command and ctrl key presses and doesnt send them to the page.</p>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
                <br />
                <Row><h4>User Accounts</h4></Row>
                <Accordion>
                    <Accordion.Item eventKey="1">
                        <Accordion.Header>Account Management</Accordion.Header>
                        <Accordion.Body>
                            <p>- In order to use this Cite you need an account to make projects and access projects shared with you.
                            <br/>- To make an account you need to enter an email, We will never email you, you might get 1 email from Auth0 the 3rd party auth service OpenChart uses.</p>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="2">
                        <Accordion.Header>Auth0 Account Service</Accordion.Header>
                        <Accordion.Body>
                            <p>- OpenChart Uses Auth0 a 3rd party authentication service for user accounts, we do this to ensure that accounts are secure.
                            <br/>- When you log in, we redirect you to Auth0, you log in and then get redirected back to our cite with the proper user authentication.
                            <br/>- The url changing to dev-ohd9-51j.us.auth0.com when loging in is normal since i am not paying for a custom domain from them.
                            <br/>- Check them out at <Link href="https://auth0.com/">auth0.com</Link>.</p>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </Container>
        </div>
    )
}