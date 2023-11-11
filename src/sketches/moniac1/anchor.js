export default class anchor {
  constructor(p5, x, y, d=20) {
    this.RED = 166;
    this.GREEN = 177;
    this.BLUE = 225;
    this.position = p5.createVector(x, y);
    this.d = d;
    this.isSelected = false;
  }

  move(p5, point) {
    if (p5.mouseIsPressed && this.isSelected) {
      this.position.x = point.x;
      this.position.y = point.y;
    }
  }

  showSelected(p5) {
    p5.fill(255,255,255,100);
    if (this.isSelected) {
      p5.fill(255);
    }
    p5.noStroke();
    p5.circle(this.position.x, this.position.y, this.d, 100);
  }

  intersects(p5,point) {
    let d = p5.dist(this.position.x, this.position.y, point.x, point.y);
    let perception = this.d
    return d < perception;
  }
}
