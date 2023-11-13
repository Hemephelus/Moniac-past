import React from "react";
import { ReactP5Wrapper } from "react-p5-wrapper";
import Box from "./Box";
import Path from "./ComplexPath";
import Vehicle from "./Vehicle";

function MoniacSketch() {
  // Economics
  let TAX_RATE = 0.5;
  let TRANSACTION_BALANCE = 10//1024;
  let GOVERNMENT_EXPENDITURE_RATE = 1.0;
  let AVERAGE_PROPENSITY_TO_CONSUME = 0.5;
  let INVESTMENT_RATE = 1.0;
  let AVERAGE_PROPENSITY_IMPORT = 0.0;
  //   let AUTONOMOUS_GOVERNMENT_EXPENDITURE = 0;
  //   let GDP_Y = TRANSACTION_BALANCE;
  //   let AUTONOMOUS_EXPORT = 0;
  //   let GOVERNMENT_SURPLUS = 0;
  //   let IDLE_BALANCE = 0;
  //   let IMPORT_AMOUNT = 0;
  //   let EXPORT_AMOUNT = 0;
  // Economics

  let debug = false;
  // A path object (series of connected points)
  let paths = [];
  // Two vehicles
  let vehicles = [];
  let boxes = [];
  let mouseLocation;
  let offset = 30;

  let endAnchors = [];

  function sketch(p5) {
    p5.setup = () => {
      p5.createCanvas(p5.windowWidth - 300, p5.windowHeight);

      // Call a function to generate new Path object
      newPath(p5);

      // Income GDP_Y Pipe
      endAnchors.push({
        anchor: paths[0].points[4],
        nextIds: [1, 2],
        probabilities: [TAX_RATE, 1 - TAX_RATE],
      });

      // Taxes Pipe
      endAnchors.push({
        anchor: paths[1].points[1],
        nextIds: [3],
        probabilities: [1],
      });

      // Disposable Income
      endAnchors.push({
        anchor: paths[2].points[1],
        nextIds: [6, 7],
        probabilities: [
          AVERAGE_PROPENSITY_TO_CONSUME,
          1 - AVERAGE_PROPENSITY_TO_CONSUME,
        ],
      });

      //  Taxes Pipe 2
      endAnchors.push({
        anchor: paths[3].points[1],
        nextIds: [4, 5],
        probabilities: [
          GOVERNMENT_EXPENDITURE_RATE,
          1 - GOVERNMENT_EXPENDITURE_RATE,
        ],
      });

      // Government expenditure
      endAnchors.push({
        anchor: paths[4].points[1],
        nextIds: [11],
        probabilities: [1],
      });

      // Government Surplus
      endAnchors.push({
        anchor: paths[5].points[1],
        nextIds: [null],
        probabilities: [1],
      });

      // Consumption
      endAnchors.push({
        anchor: paths[6].points[1],
        nextIds: [11],
        probabilities: [1],
      });

      // Savings
      endAnchors.push({
        anchor: paths[7].points[1],
        nextIds: [8],
        probabilities: [1],
      });

      // Savings 2
      endAnchors.push({
        anchor: paths[8].points[1],
        nextIds: [9, 10],
        probabilities: [INVESTMENT_RATE, 1 - INVESTMENT_RATE],
      });

      // Investment
      endAnchors.push({
        anchor: paths[9].points[1],
        nextIds: [11],
        probabilities: [1],
      });

      // Idle Reserves
      endAnchors.push({
        anchor: paths[10].points[1],
        nextIds: [null],
        probabilities: [1],
      });

      // Total Expenditure
      endAnchors.push({
        anchor: paths[11].points[1],
        nextIds: [13, 12],
        probabilities: [AVERAGE_PROPENSITY_IMPORT, 1-AVERAGE_PROPENSITY_IMPORT],
      });

      // Domestic Expenditure
      endAnchors.push({
        anchor: paths[12].points[1],
        nextIds: [0],
        probabilities: [1],
      });

      // Import
      endAnchors.push({
        anchor: paths[13].points[1],
        nextIds: [null],
        probabilities: [1],
      });

      // We are now making random vehicles and storing them in an ArrayList
      for (let i = 0; i < TRANSACTION_BALANCE; i++) {
        newVehicle(p5.width / 2 - offset, p5.height - offset);
      }
      let numberOfBoxes = 2;
      createBoxes(p5, numberOfBoxes, boxes);
    };
    let k = 0
    p5.draw = () => {
      p5.background(28, 79, 74);
      mouseLocation = { x: p5.mouseX, y: p5.mouseY };
        // if (vehicles.length < TRANSACTION_BALANCE+200) {
        //   newVehicle(p5.width / 2 - offset, p5.height - offset);
        // }

        if (k % 100 === 0) {
          console.log(vehicles.length);
        }

        k++


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
        // Call the generic run method (update, borders, display, etc.)
        v.run(p5);

        for (let j = 0; j < endAnchors.length; j++) {
          let endAnchor = endAnchors[j];

          if (endAnchor.anchor.intersects(p5, v.position)) {
            v.pathId = selectNumber(endAnchor.nextIds, endAnchor.probabilities);
            if (v.pathId === null) {
              vehicles.splice(i, 1);
            }
          }
        }
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

      // Income GDP_Y Pipe
      paths[0] = new Path();
      paths[0].addPoint(p5, p5.width / 2 - offset, p5.height - offset);
      paths[0].addPoint(p5, offset, p5.height - offset);
      paths[0].addPoint(p5, offset, offset);
      paths[0].addPoint(p5, p5.width / 2 - offset, offset);
      paths[0].addPoint(p5, p5.width / 2 - offset, p5.height / 5);

      // Taxes Pipe
      paths[1] = new Path();
      paths[1].addPoint(p5, p5.width / 2 - offset, p5.height / 5);
      paths[1].addPoint(
        p5,
        p5.width / 3 - offset * 2,
        p5.height / 5 + offset * 3
      );

      // Disposable Income
      paths[2] = new Path();
      paths[2].addPoint(p5, p5.width / 2 - offset, p5.height / 5);
      paths[2].addPoint(p5, p5.width / 2 - offset, p5.height / 5 + offset * 3);

      // Taxes Pipe 2
      paths[3] = new Path();
      paths[3].addPoint(
        p5,
        p5.width / 3 - offset * 2,
        p5.height / 5 + offset * 3
      );
      paths[3].addPoint(
        p5,
        p5.width / 3 - offset * 2,
        p5.height / 3 + offset * 3
      );

      // Government expenditure
      paths[4] = new Path();
      paths[4].addPoint(
        p5,
        p5.width / 3 - offset * 2,
        p5.height / 3 + offset * 3
      );
      paths[4].addPoint(p5, p5.width / 2 - offset, p5.height / 2 + offset);

      //  Government Surplus
      paths[5] = new Path();
      paths[5].addPoint(
        p5,
        p5.width / 3 - offset * 2,
        p5.height / 3 + offset * 3
      );
      paths[5].addPoint(
        p5,
        p5.width / 3 - offset * 2,
        p5.height / 1.7 + offset
      );

      //  Consumption
      paths[6] = new Path();
      paths[6].addPoint(p5, p5.width / 2 - offset, p5.height / 5 + offset * 3);
      paths[6].addPoint(p5, p5.width / 2 - offset, p5.height / 2 + offset);

      //  Savings
      paths[7] = new Path();
      paths[7].addPoint(p5, p5.width / 2 - offset, p5.height / 5 + offset * 3);
      paths[7].addPoint(p5, p5.width / 1.5, p5.height / 4 + offset * 3);

      //  Savings 2
      paths[8] = new Path();
      paths[8].addPoint(p5, p5.width / 1.5, p5.height / 4 + offset * 3);
      paths[8].addPoint(p5, p5.width / 1.5, p5.height / 3 + offset * 3);

      //  Investments
      paths[9] = new Path();
      paths[9].addPoint(p5, p5.width / 1.5, p5.height / 3 + offset * 3);
      paths[9].addPoint(p5, p5.width / 2 - offset, p5.height / 2 + offset);

      //    Idle Reserves
      paths[10] = new Path();
      paths[10].addPoint(p5, p5.width / 1.5, p5.height / 3 + offset * 3);
      paths[10].addPoint(p5, p5.width / 1.5, p5.height / 2 + offset * 3);

      // Total Expenditure
      paths[11] = new Path();
      paths[11].addPoint(p5, p5.width / 2 - offset, p5.height / 2 + offset);
      paths[11].addPoint(p5, p5.width / 2 - offset, p5.height / 2 + offset * 3);

      //  Domestic Expenditure
      paths[12] = new Path();
      paths[12].addPoint(p5, p5.width / 2 - offset, p5.height / 2 + offset * 3);
      paths[12].addPoint(p5, p5.width / 2 - offset, p5.height - offset);

      //  Import
      paths[13] = new Path();
      paths[13].addPoint(p5, p5.width / 2 - offset, p5.height / 2 + offset * 3);
      paths[13].addPoint(p5, p5.width / 1.5, p5.height / 1.7 + offset * 3);

      //  Export
      paths[14] = new Path();
      paths[14].addPoint(p5, p5.width / 1.5, p5.height / 1.5 + offset * 3);
      paths[14].addPoint(p5, p5.width / 2 - offset, p5.height - offset);
    }

    function newVehicle(x, y) {
      let maxspeed = p5.random(2, 4);
      let maxforce = 0.3;
      let pathId = 0;
      vehicles.push(new Vehicle(p5, x, y, maxspeed, maxforce, pathId));
    }
  }
  return <ReactP5Wrapper sketch={sketch} />;
}

export default MoniacSketch;

function selectNumber(numbers = [], probabilities = []) {
  var num = Math.random(),
    s = 0,
    lastIndex = probabilities.length - 1;

  for (var i = 0; i < lastIndex; ++i) {
    s += probabilities[i];

    if (num < s) {
      return numbers[i];
    }
  }

  return numbers[lastIndex];
}
