var width = window.innerWidth || document.body.clientWidth;
var height = window.innerHeight || document.body.clientHeight;

var sidebar_width = 200;
width -= sidebar_width;

var canvas = document.getElementById('canvas');
canvas.width = width;
canvas.height = height;
canvas.style.width = width + 'px';
canvas.style.height = height + 'px';

window.control_point = false;
window.state_name = null;
window.is_animating = false;
window.animate_start = null;

// the distance between the mouse & any point
// to make the mouse modify the point
window.MOUSE_SNAP = 8;
window.TOUCH_SNAP = 20;
window.anim_duration = 2 * 1000;

var ctx = canvas.getContext("2d");
var sprite, sprites = [];
function createSprite() {
  var border_color = border_input.value;
  var fill_color = fill_input.value;
  sprite = new Sprite(ctx, border_color, fill_color);
  sprites.push(sprite);
  updateShapesList();
}

var dragging_pt = null;
var last_touch_evt;

document.body.addEventListener('mousedown', function(evt) {
  onPointerDown(evt, MOUSE_SNAP);
});

document.body.addEventListener('touchstart', function(evt) {
  onPointerDown(evt, TOUCH_SNAP);
});

function onPointerDown(evt, snap) {
  if (!sprite)
    return;

  last_touch_evt = evt;
  var pt = event2Point(evt);
  if (pt.x < 0)
    return;

  var points;
  if (state_name)
    points = sprite.states[state_name].points;
  else
    points = sprite.points;
  var close_pt = _.find(points, function(sprite_pt) {
    return distance(sprite_pt, pt) < snap;
  });
  if (close_pt)
    dragging_pt = close_pt;
}

document.body.addEventListener('mousemove', function(evt) {
  onPointerMove(evt, MOUSE_SNAP);
});

document.body.addEventListener('touchmove', function(evt) {
  onPointerMove(evt, TOUCH_SNAP);
});

function onPointerMove(evt, snap) {
  if (!sprite)
    return;

  last_touch_evt = evt;
  var pt = event2Point(evt);
  if (pt.x < 0)
    return;

  if (!dragging_pt)
    return;

  // disables annoying page scrolling on iOS
  event.preventDefault();

  dragging_pt.x = pt.x;
  dragging_pt.y = pt.y;
}

document.body.addEventListener('mouseup', function(evt) {
  onPointerUp(evt, MOUSE_SNAP);
});

document.body.addEventListener('touchend', function(evt) {
  onPointerUp(evt, TOUCH_SNAP);
});

function onPointerUp(evt, snap) {
  if (!sprite)
    return;

  var pt = event2Point(evt, last_touch_evt);
  if (pt.x < 0)
    return;

  if (dragging_pt) {
    dragging_pt = null;
  }
  else {  
    if (control_point)
      sprite.addControlPoint(pt);
    else
      sprite.addPoint(pt);
  }
}

var control_pt_btn = document.getElementById('control-point');
control_pt_btn.addEventListener('click', function() {
  control_point = !control_point;
  if (control_point)
    control_pt_btn.innerHTML = 'Normal Point';
  else
    control_pt_btn.innerHTML = 'Control Point';
});

var create_btn = document.getElementById('create-shape');
create_btn.addEventListener('click', function() {
  createSprite();
});

var border_input = document.getElementById('border-color');
border_input.addEventListener('blur', function() {
  if (!sprite)
    return;

  sprite.strokeStyle = border_input.value;
});

var fill_input = document.getElementById('fill-color');
fill_input.addEventListener('blur', function() {
  if (!sprite)
    return;

  sprite.fillStyle = fill_input.value;
});

var close_shape_btn = document.getElementById('close-shape');
close_shape_btn.addEventListener('click', function() {
  if (!sprite)
    return;

  sprite.close();
});

var add_state_btn = document.getElementById('add-state');
add_state_btn.addEventListener('click', function() {
  var first_sprite = sprites[0];
  var num_states = _.values(first_sprite.states).length;
  var name = 'State ' + (num_states + 1);

  // all child shapes should have the same states
  sprites.forEach(function(sprite) {
    sprite.addState(name);
  });
  var new_opt = document.createElement('option');
  new_opt.appendChild(document.createTextNode(name));
  state_sel.appendChild(new_opt);
  state_sel.value = name;
  onStateChange();
});

var state_sel = document.getElementById('anim-state');
state_sel.addEventListener('change', onStateChange);

function onStateChange() {
  if (state_sel.value == 'Default')
    state_name = null;
  else
  state_name = state_sel.value;
}

var animate_btn = document.getElementById('animate');
animate_btn.addEventListener('click', function() {
  
  // get rid of selected item, since selected item dots don't animate
  sprite = null;
  updateShapesList();

  is_animating = !is_animating;
  if (is_animating)
    animate_btn.innerHTML = 'Stop Animating';
  else
    animate_btn.innerHTML = 'Animate';
});

var shapes_ul = document.getElementById('shapes-list');
shapes_ul.addEventListener('click', function(evt) {
  if (evt.target.tagName == 'A') {
    var ix = parseInt(evt.target.getAttribute('data-ix'), 10);
    if (ix > -1) {
      if (sprite == sprites[ix])
        sprite = null;
      else
        sprite = sprites[ix];
      updateShapesList();
    }
  }
})
function updateShapesList() {
  shapes_ul.innerHTML = sprites.map(function(each_sprite, ix) {
    var sel = each_sprite == sprite ? ' class="selected"' : '';
    return '<li' + sel + '><a href=# data-ix="' + ix + '">&nbsp;Shape ' + (ix + 1) + '</li>';
  }).join('\n');
}

function distance(pt1, pt2) {
  return Math.sqrt(square(Math.abs(pt1.x - pt2.x)) + square(Math.abs(pt1.y - pt2.y)));
}

function square(x) {
  return Math.pow(x, 2);
}

// function intersects(max_pt1, min_pt1, max_pt2, min_pt2) {
//   return !(
//     max_pt1.x < min_pt2.x || 
//     max_pt1.y < min_pt2.y || 
//     min_pt1.x > max_pt2.x || 
//     min_pt1.y > max_pt2.y
//   );
// }

function event2Point(evt, last_touch_evt) {
  var x, y;
  if (evt.touches) {
    // the touchend event doesn't send coords, you have to use the last touchmove
    if (!evt.touches.length)
      evt = last_touch_evt;

    var touch = evt.touches[0];
    x = touch.pageX;
    y = touch.pageY;
  }
  else {
    x = evt.clientX;
    y = evt.clientY;
  }

  return {x: x - canvas.offsetLeft, y: y - canvas.offsetTop};
}

createSprite();

requestAnimationFrame(animate);
animate();

function animate() {
  var pct = 1
  if (is_animating) {
    pct = (Date.now() % anim_duration) * 2 / anim_duration;
    if (pct > 1)
      pct = 1 - (pct - 1); // step backwards for 2nd half
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  sprites.forEach(function(sprite) {
    sprite.draw(state_name, pct);
  });

  if (sprite) {
    if (state_name)
      sprite.states[state_name].points.forEach(drawPoint);
    else
      sprite.points.forEach(drawPoint);
  }
  requestAnimationFrame(animate);
}

function drawPoint(pt) {
  ctx.beginPath();
  var radius = 5;
  ctx.arc(pt.x, pt.y, radius, 0, 2 * Math.PI);
  if (pt.is_control)
    ctx.fillStyle = '#F00';
  else
    ctx.fillStyle = '#000';
  ctx.fill();
  ctx.closePath();
}
