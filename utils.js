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