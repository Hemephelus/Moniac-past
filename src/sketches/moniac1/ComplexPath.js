// Path Following (Complex Path)
// The Nature of Code
// The Coding Train / Daniel Shiffman
// https://youtu.be/LrnR6dc2IfM
// https://thecodingtrain.com/learning/nature-of-code/5.7-path-following.html

// Path Following: https://editor.p5js.org/codingtrain/sketches/dqM054vBV
// Complex Path: https://editor.p5js.org/codingtrain/sketches/2FFzvxwVt
import anchor from "./anchor";

export default class Path {
    constructor() {
      // Arbitrary radius of 20
      // A path has a radius, i.e how far is it ok for the boid to wander off
      this.radius = 10;
      // A Path is an arraylist of points (PVector objects)
      this.points = [];
      this.isSelected = false
    }
  
    // Add a point to the path
    addPoint(p5,x, y) {
      let point = new anchor(p5,x,y)
      this.points.push(point);
    }
  
    // Draw the path
    display(p5) {
      p5.strokeJoin(p5.ROUND);
  
      // Draw thick line for radius
      p5.stroke(28,74,144);
      p5.strokeWeight(this.radius * 2);
      p5.noFill();
      p5.beginShape();
      for (let v of this.points) {
        p5.vertex(v.position.x, v.position.y);
      }
      p5.endShape(p5.OPEN);
      // Draw thin line for center of path
      p5.stroke(245,243,238);
      p5.strokeWeight(2);
      p5.noFill();
      p5.beginShape();  
      for (let v of this.points) {
        p5.vertex(v.position.x, v.position.y);
      }
      p5.endShape(p5.OPEN);
    }

      
 
  }
  