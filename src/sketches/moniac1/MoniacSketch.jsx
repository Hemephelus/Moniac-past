import React from "react";
import { ReactP5Wrapper } from "react-p5-wrapper";
import Box from "./Box";
import Path from "./ComplexPath";
import Vehicle from "./Vehicle";

function MoniacSketch() {
  let debug = false;
  // A path object (series of connected points)
  let paths = [];
  // Two vehicles
  let vehicles = [];
  let boxes = [];
  let mouseLocation;
  let maxVehicles = 100;
  let offset = 30;

  let endAnchors = [];

  function sketch(p5) {
    p5.setup = () => {
      p5.createCanvas(p5.windowWidth - 300, p5.windowHeight);
      // Call a function to generate new Path object
      newPath(p5);
      endAnchors[0] = {
        anchor: paths[0].points[4],
        nextId: 1,
      };
      endAnchors[1] = {
        anchor: paths[1].points[2],
        nextId: null,
      };
      endAnchors[2] = {
        anchor: paths[2].points[1],
        nextId: null,
      };

      // We are now making random vehicles and storing them in an ArrayList
      for (let i = 0; i < 1; i++) {
        newVehicle(p5.width / 2 - offset, p5.height - offset);
      }
      let numberOfBoxes = 2;
      createBoxes(p5, numberOfBoxes, boxes);
    };

    p5.draw = () => {
      p5.background(28, 79, 74);
      mouseLocation = { x: p5.mouseX, y: p5.mouseY };
      if (vehicles.length < maxVehicles) {
        newVehicle(p5.width / 2 - offset, p5.height - offset);
      }

      for (let i = 0; i < paths.length; i++) {
        paths[i].display(p5);
        let pathPoints = paths[i].points;
        for (let point of pathPoints) {
          point.move(p5, mouseLocation);
          point.showSelected(p5);
        }
      }

      for (let i = 0; i < vehicles.length; i++) {
        let v = vehicles[i];
        // Path following and separation are worked on in this function

        v.applyBehaviors(p5, vehicles, paths[v.pathId], debug);
        for (let j = 0; j < endAnchors.length; j++) {
          let endAnchor = endAnchors[j];

          if (endAnchor.anchor.intersects(p5, v.position)) {
            if(endAnchor.nextId === null){
                vehicles.splice(i,1)
            }
            v.pathId = endAnchor.nextId;
          }
        }
        // Call the generic run method (update, borders, display, etc.)
        v.run(p5);
      }
    };

    p5.mousePressed = () => {
      // translate(mouseX, mouseY);
      for (let box of boxes) {
        if (box.contains(mouseLocation)) {
          box.isSelected = true;
        }
      }

      for (let i = 0; i < paths.length; i++) {
        let pathPoints = paths[i].points;
        for (let j = 0; j < pathPoints.length; j++) {
          if (pathPoints[j].intersects(p5, mouseLocation)) {
            pathPoints[j].isSelected = true;
          }
        }
      }
      //   newVehicle(p5.mouseX, p5.mouseY);
    };

    p5.mouseReleased = () => {
      for (let box of boxes) {
        box.isSelected = false;
      }

      for (let i = 0; i < paths.length; i++) {
        let pathPoints = paths[i].points;

        for (let j = 0; j < pathPoints.length; j++) {
          pathPoints[j].isSelected = false;
        }
      }
    };

    p5.keyPressed = () => {
      if (p5.key == "d") {
        debug = !debug;
      }
    };

    function createBoxes(p5, numberOfBoxes, boxes) {
      let box;
      for (let i = 0; i < numberOfBoxes; i++) {
        box = new Box(135, 10);
        boxes.push(box);
      }
    }

    function newPath() {
      // A path is a series of connected points
      // A more sophisticated path might be a curve

      //   paths[0] = new Path();
      //   for (let i = 0; i < 4; i++) {
      //     if (i === 0) {
      //       paths[0].addPoint(p5, p5.width/2,p5.height- offset);
      //       continue
      //     }

      //     if ( i === 3) {
      //         paths[0].addPoint(p5,  p5.width/2, offset);
      //         continue
      //     }

      //     paths[0].addPoint(p5, i * 50 + 10 + offset, 100);
      //   }

      // Income GDP_Y Pipe
      paths[0] = new Path();
      paths[0].addPoint(p5, p5.width / 2 - offset, p5.height - offset);
      paths[0].addPoint(p5, offset, p5.height - offset);
      paths[0].addPoint(p5, offset, offset);
      paths[0].addPoint(p5, p5.width / 2 - offset, offset);
      paths[0].addPoint(p5, p5.width / 2 - offset, p5.height / 5);

      // Taxes
      paths[1] = new Path();
      paths[1].addPoint(p5, p5.width / 2 - offset*2, p5.height / 5 + offset);
      paths[1].addPoint(p5, offset * 5, p5.height / 3.5 + offset);
      paths[1].addPoint(p5, offset * 5, p5.height / 3.5 + offset * 3);

      // Disposable Income
      paths[2] = new Path();
      paths[2].addPoint(p5, p5.width / 2 - offset, p5.height / 5 + offset);
      paths[2].addPoint(p5, p5.width / 2 - offset, p5.height / 5 + offset*3);
    }

    function newVehicle(x, y) {
      let maxspeed = p5.random(2, 4);
      let maxforce = 0.3;
      let pathId = 0
      vehicles.push(new Vehicle(p5, x, y, maxspeed, maxforce, pathId));
    }
  }
  return <ReactP5Wrapper sketch={sketch} />;
}

export default MoniacSketch;
