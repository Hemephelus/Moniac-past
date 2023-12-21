import React from "react";
import Sketch from "react-p5";
import Box from "./Box";
import Path from "./ComplexPath";
import Vehicle from "./Vehicle";

function MoniacSketch() {
  // Economics
  let TAX_RATE = 0.5;
  let TRANSACTION_BALANCE = 1000;
  let GOVERNMENT_EXPENDITURE_RATE = 0.5;
  let AVERAGE_PROPENSITY_TO_CONSUME = 0.5;
  let INVESTMENT_RATE = 0.5;
  let AVERAGE_PROPENSITY_IMPORT = 0.5;
  //   let AUTONOMOUS_GOVERNMENT_EXPENDITURE = 0;
  //   let GDP_Y = TRANSACTION_BALANCE;
  //   let AUTONOMOUS_EXPORT = 0;
  //   let GOVERNMENT_SURPLUS = 0;
  //   let IDLE_BALANCE = 0;
  //   let IMPORT_AMOUNT = 0;
  //   let EXPORT_AMOUNT = 0;
  // Economics

  let debug = false;
  let isPlay = true;
  // A path object (series of connected points)
  let paths = [];
  // Two vehicles
  let vehicles = [];
  let boxes = [];
  let mouseLocation;
  let offset = 30;

  let endAnchors = [];

  const setup = (p5, canvasParentRef) => {
    // use parent to render the canvas in this ref
    // (without that p5 will render the canvas outside of your component)
    p5.createCanvas(p5.windowWidth - 300, p5.windowHeight).parent(
      canvasParentRef
    );
    // Call a function to generate new Path object
    newPath(p5);

    // Income GDP_Y Pipe
    endAnchors.push(
      {
        pipe: "GDP",
        anchor: paths[0].points[4],
        nextIds: [1, 2],
        probabilities: [TAX_RATE, 1 - TAX_RATE],
      },

      {
        pipe: "Taxes_1",
        anchor: paths[1].points[1],
        nextIds: [3],
        probabilities: [1],
      },

      {
        pipe: "Disposable Income",
        anchor: paths[2].points[1],
        nextIds: [6, 7],
        probabilities: [
          AVERAGE_PROPENSITY_TO_CONSUME,
          1 - AVERAGE_PROPENSITY_TO_CONSUME,
        ],
      },

      {
        pipe: "Taxes_2",
        anchor: paths[3].points[1],
        nextIds: [4, 5],
        probabilities: [
          GOVERNMENT_EXPENDITURE_RATE,
          1 - GOVERNMENT_EXPENDITURE_RATE,
        ],
      },

      {
        pipe: "Government_Expenditure",
        anchor: paths[4].points[1],
        nextIds: [11],
        probabilities: [1],
      },

      {
        pipe: "Government_Surplus",
        anchor: paths[5].points[1],
        nextIds: [null],
        probabilities: [1],
      },

      {
        pipe: "Consumption",
        anchor: paths[6].points[1],
        nextIds: [11],
        probabilities: [1],
      },

      {
        pipe: "Savings",
        anchor: paths[7].points[1],
        nextIds: [8],
        probabilities: [1],
      },

      {
        pipe: "Savings_1",
        anchor: paths[7].points[1],
        nextIds: [8],
        probabilities: [1],
      },

      {
        pipe: "Savings_2",
        anchor: paths[8].points[1],
        nextIds: [9, 10],
        probabilities: [INVESTMENT_RATE, 1 - INVESTMENT_RATE],
      },

      {
        pipe: "Investment",
        anchor: paths[9].points[1],
        nextIds: [11],
        probabilities: [1],
      },

      {
        pipe: "Idle_Reserves",
        anchor: paths[10].points[1],
        nextIds: [null],
        probabilities: [1],
      },

      {
        pipe: "Total_Expenditure",
        anchor: paths[11].points[1],
        nextIds: [13, 12],
        probabilities: [
          AVERAGE_PROPENSITY_IMPORT,
          1 - AVERAGE_PROPENSITY_IMPORT,
        ],
      },

      {
        pipe: "Domestic_Expenditure",
        anchor: paths[12].points[1],
        nextIds: [0],
        probabilities: [1],
      },

      {
        pipe: "Import",
        anchor: paths[13].points[1],
        nextIds: [null],
        probabilities: [1],
      }
    );

    // We are now making random vehicles and storing them in an ArrayList
    for (let i = 0; i < TRANSACTION_BALANCE; i++) {
      newVehicle(p5, p5.width / 2 - offset, p5.height - offset);
    }
    let numberOfBoxes = 2;
    createBoxes(p5, numberOfBoxes, boxes);
  };

  const draw = (p5) => {
    p5.background(28, 79, 74);
    p5.fill(200);
    p5.text("ted", 100, 100);
    mouseLocation = { x: p5.mouseX, y: p5.mouseY };
    if (vehicles.length < TRANSACTION_BALANCE + 200) {
      newVehicle(p5, p5.width / 2 - offset, p5.height - offset);
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

  const mousePressed = (p5) => {
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

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth - 300, p5.windowHeight);
  };

  const keyPressed = (p5) => {
    if (p5.keyCode === 32) {
      isPlay = !isPlay;
      console.log(isPlay);
    }

    isPlay ? p5.loop() : p5.noLoop();
  };

  const mouseReleased = (p5) => {
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

  function createBoxes(numberOfBoxes, boxes) {
    let box;
    for (let i = 0; i < numberOfBoxes; i++) {
      box = new Box(135, 10);
      boxes.push(box);
    }
  }

  function newPath(p5) {
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
    paths[5].addPoint(p5, p5.width / 3 - offset * 2, p5.height / 1.7 + offset);

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

  function newVehicle(p5, x, y) {
    let maxspeed = p5.random(2, 4);
    let maxforce = 0.3;
    let pathId = 0;
    vehicles.push(new Vehicle(p5, x, y, maxspeed, maxforce, pathId));
  }

  return (
    <Sketch
      setup={setup}
      draw={draw}
      mousePressed={mousePressed}
      keyPressed={keyPressed}
      mouseReleased={mouseReleased}
      windowResized={windowResized}
    />
  );
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
