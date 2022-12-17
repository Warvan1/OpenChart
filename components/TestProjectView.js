import React, { useRef, useEffect, useState } from "react";
import paper from "paper";
import ServerTest from "./ServerTest";
import webhostName from '../webhost-name.json';

export default function ProjectView() {
  const canvasRef = useRef(null);
  const [projectJSON, setProjectJSON] = useState({project: null});

  useEffect(() => {
    // Get a reference to the canvas object
    const canvas = canvasRef.current;
    // Create an empty project and a view for the canvas:
    paper.setup(canvas);
    // Set the view size to 600 pixels wide and 800 pixels high:
    paper.view.viewSize = [600, 800];
    // Create a new path and set its stroke color to black:
    var path = new paper.Path();
    path.strokeColor = "black";

    // Create a rectangle shaped path at the top left corner of the view:
    var rectangle = new paper.Path.Rectangle({
      point: [0, 0],
      size: [600, 800],
      fillColor: "black" // change the rectangle color to black
    });
    // Add the rectangle to the path:
    path.add(rectangle);

    // Create 100 circle shaped paths at random locations within the view
    for (var i = 0; i < 20; i++) {
      // generate a random color in RGB format
      var randomColor =
        "rgb(" +
        Math.floor(Math.random() * 256) +
        "," +
        Math.floor(Math.random() * 256) +
        "," +
        Math.floor(Math.random() * 256) +
        ")";
      // generate a random radius between 10 and 40
      var radius = Math.random() * 30 + 10;
      var circle = new paper.Path.Circle({
        // generate random x and y coordinates within the view,
        // taking into account the radius of the circle
        center: [
          radius + Math.random() * (600 - 2 * radius),
          radius + Math.random() * (800 - 2 * radius),
        ],
        radius: radius,
        fillColor: randomColor // use the generated random color
      });
      // Add the circle to the path:
      path.add(circle);
    }
    

    // Draw the view now:
    paper.view.draw();

    // Export the project to json and store within a state
    setProjectJSON(paper.project.exportJSON());
  }, []);

  function saveProject(){    
    try {
      fetch(`/api/save-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({projectJSON}),
      });
      // Do something with the result here
    } catch (error) {
      // Handle any errors here
      console.log(error);
    }
  }

  return (
    <div>
      <div>
        <button onClick={saveProject}>Save</button>
      </div>
      <div>
        <canvas ref={canvasRef} width={600} height={800} style={{
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
        }}/>
      </div>
    </div>
  );
}