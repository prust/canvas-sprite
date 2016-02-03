function Sprite(ctx, border_color, fill_color) {
  this.points = [];
  this.states = {};
  this.ctx = ctx;
  this.lineWidth = 3;
  this.strokeStyle = border_color || '#CCCCCC';
  this.is_closed = false;
  this.fillStyle = fill_color || 'rgba(0, 0, 0, 0)'; // "#FF0000";
}

Sprite.prototype.addPoint = function(pt) {
  this.points.push(pt);
  for (var state_name in this.states)
    this.states[state_name].points.push(pt);
};

Sprite.prototype.addControlPoint = function(pt) {
  pt.is_control = true;
  this.addPoint(pt);
};

Sprite.prototype.addState = function(state_name) {
  this.states[state_name] = {
    points: this.points.map(function(pt) {
      return _.clone(pt);
    })
  };
};

Sprite.prototype.draw = function(state_name, pct) {
  if (state_name)
    var state = this.states[state_name];

  this.ctx.beginPath();
  this.points.forEach(function(pt, ix) {
    if (pt.is_control)
      return;

    if (state)
      pt = interpolate(pt, state.points[ix], pct);

    var prev_pt = this.points[ix - 1];
    if (prev_pt && prev_pt.is_control) {
      if (state)
        prev_pt = interpolate(prev_pt, state.points[ix - 1], pct);
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

// linear interpolation of 2 points
function interpolate(pt1, pt2, pct) {
  var diff_x = pt2.x - pt1.x;
  var diff_y = pt2.y - pt1.y;

  return {
    x: pt1.x + diff_x * pct,
    y: pt1.y + diff_y * pct
  };
}
