function SpriteInstance(pt, sprite) {
  _.extend(this, pt);
  this.sprite = sprite;
}

SpriteInstance.prototype.draw = function() {
  this.sprite.draw(null, null, this);
};

SpriteInstance.prototype.intersect = function(pt) {
  var points = _.flatten(_.pluck(this.sprite.shapes, 'points'));
  var min_x = _.min(_.pluck(points, 'x')) + this.x;
  var min_y = _.min(_.pluck(points, 'y')) + this.y;
  var max_x = _.max(_.pluck(points, 'x')) + this.x;
  var max_y = _.max(_.pluck(points, 'y')) + this.y;
  
  console.log(min_x, pt.x, max_x, ' / ', min_y, pt.y, max_y);
  return pt.x >= min_x && pt.x <= max_x && pt.y >= min_y && pt.y <= max_y;
};

function Sprite(ctx, sprite_data) {
  if (sprite_data.ctx)
    delete sprite_data.ctx;

  _.extend(this, sprite_data);
  this.shapes.forEach(function(shape_data, ix) {
    this.shapes[ix] = new Shape(ctx, shape_data);
  }.bind(this));
}

Sprite.prototype.draw = function(state_name, pct, offset) {
  this.shapes.forEach(function(shape) {
    shape.draw(state_name, pct, offset);
  });
};

function Shape(ctx, shape_data) {
  this.points = [];
  this.states = {};
  this.ctx = ctx;
  this.lineWidth = 3;
  this.strokeStyle = '#CCCCCC';
  this.is_closed = false;
  this.fillStyle = 'rgba(0, 0, 0, 0)'; // "#FF0000";
  if (shape_data.ctx)
    delete shape_data.ctx;
  _.extend(this, shape_data);
}

Shape.prototype.addPoint = function(pt) {
  this.points.push(pt);
  for (var state_name in this.states)
    this.states[state_name].points.push(_.clone(pt));
};

Shape.prototype.addControlPoint = function(pt) {
  pt.is_control = true;
  this.addPoint(pt);
};

Shape.prototype.addState = function(state_name) {
  this.states[state_name] = {
    points: this.points.map(function(pt) {
      return _.clone(pt);
    })
  };
};

Shape.prototype.draw = function(state_name, pct, offset) {
  if (!offset)
    offset = {x: 0, y: 0};
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
      this.ctx.quadraticCurveTo(prev_pt.x + offset.x, prev_pt.y + offset.y, pt.x + offset.x, pt.y + offset.y);
    }
    else if (ix == 0) {
      this.ctx.moveTo(pt.x + offset.x, pt.y + offset.y);
    }
    else {
      this.ctx.lineTo(pt.x + offset.x, pt.y + offset.y);
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

Shape.prototype.close = function() {
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
