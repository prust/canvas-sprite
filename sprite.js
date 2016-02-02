function Sprite(ctx, border_color, fill_color) {
  this.points = [];
  this.ctx = ctx;
  this.lineWidth = 3;
  this.strokeStyle = border_color || '#CCCCCC';
  this.is_closed = false;
  this.fillStyle = fill_color || 'rgba(0, 0, 0, 0)'; // "#FF0000";
}

Sprite.prototype.addPoint = function(pt) {
  this.points.push(pt);
};

Sprite.prototype.addControlPoint = function(pt) {
  pt.is_control = true;
  this.points.push(pt);
};

Sprite.prototype.draw = function() {
  this.ctx.beginPath();
  this.points.forEach(function(pt, ix) {
    if (pt.is_control)
      return;

    var prev_pt = this.points[ix - 1];
    if (prev_pt && prev_pt.is_control) {
      this.ctx.quadraticCurveTo(prev_pt.x, prev_pt.y, pt.x, pt.y);
    }
    else if (ix == 0) {
      this.ctx.moveTo(pt.x, pt.y);
    }
    else {
      this.ctx.lineTo(pt.x, pt.y);
    }
  }.bind(this));

  if (this.is_closed)
    this.ctx.closePath();

  this.ctx.fillStyle = this.fillStyle;
  this.ctx.fill();
  this.ctx.lineWidth = this.lineWidth;
  this.ctx.strokeStyle = this.strokeStyle;
  this.ctx.stroke();
};

Sprite.prototype.close = function() {
  this.is_closed = true;
};
