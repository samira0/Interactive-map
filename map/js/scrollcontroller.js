function makescroll(){
shape = document.getElementById("svgmap");//[0];
shape.setAttribute("viewBox", "-250 -250 500 750");

shape = document.getElementsByTagName("h1")[0];
shape.innerHTML = "testing jscript";

var mouseStartPosition = {x: 0, y: 0};
var mousePosition = {x: 0, y: 0};
var viewboxStartPosition = {x: 0, y: 0};
var viewboxPosition = {x: 0, y: 0};
var viewboxSize = {x: 480, y: 480};
var viewboxScale = 1.0;

var mouseDown = false;

shape.addEventListener("mousemove", mousemove);
shape.addEventListener("mousedown", mousedown);
shape.addEventListener("wheel", wheel);

function mousedown(e) {
  mouseStartPosition.x = e.pageX;
  mouseStartPosition.y = e.pageY;

  viewboxStartPosition.x = viewboxPosition.x;
  viewboxStartPosition.y = viewboxPosition.y;

  window.addEventListener("mouseup", mouseup);

  mouseDown = true;
}

function setviewbox()
{
  var vp = {x: 0, y: 0};
  var vs = {x: 0, y: 0};

  vp.x = viewboxPosition.x;
  vp.y = viewboxPosition.y;

  vs.x = viewboxSize.x * viewboxScale;
  vs.y = viewboxSize.y * viewboxScale;

  shape = document.getElementById("svgmap");
  shape.setAttribute("viewBox", vp.x + " " + vp.y + " " + vs.x + " " + vs.y);

}

function mousemove(e)
{
  mousePosition.x = e.offsetX;
  mousePosition.y = e.offsetY;

  if (mouseDown)
  {
    viewboxPosition.x = viewboxStartPosition.x + (mouseStartPosition.x - e.pageX) * viewboxScale;
    viewboxPosition.y = viewboxStartPosition.y + (mouseStartPosition.y - e.pageY) * viewboxScale;

    setviewbox();
  }

  var mpos = {x: mousePosition.x * viewboxScale, y: mousePosition.y * viewboxScale};
  var vpos = {x: viewboxPosition.x, y: viewboxPosition.y};
  var cpos = {x: mpos.x + vpos.x, y: mpos.y + vpos.y}

 // shape = document.getElementsByTagName("h1")[0];
//  shape.innerHTML = mpos.x + " " + mpos.y + " " + cpos.x + " " + cpos.y;
}

function mouseup(e) {
  window.removeEventListener("mouseup", mouseup);

  mouseDown = false;
}

function wheel(e) {
  var scale = (e.deltaY < 0) ? 0.8 : 1.2;

  if ((viewboxScale * scale < 8.) && (viewboxScale * scale > 1./256.))
  {
    var mpos = {x: mousePosition.x * viewboxScale, y: mousePosition.y * viewboxScale};
    var vpos = {x: viewboxPosition.x, y: viewboxPosition.y};
    var cpos = {x: mpos.x + vpos.x, y: mpos.y + vpos.y}

    viewboxPosition.x = (viewboxPosition.x - cpos.x) * scale + cpos.x;
    viewboxPosition.y = (viewboxPosition.y - cpos.y) * scale + cpos.y;
    viewboxScale *= scale;

   // cityData

    setviewbox();
  }
}
};

function doscroll(){

  function zoomFit(paddingPercent, transitionDuration) {
    var bounds = view.node().getBBox();
    var parent = view.node().parentElement;
    var fullWidth = parent.clientWidth,
        fullHeight = parent.clientHeight;
    var width = bounds.width,
        height = bounds.height;
    var midX = bounds.x + width / 2,
        midY = bounds.y + height / 2;
    if (width == 0 || height == 0) return; // nothing to fit
    var scale =
        (0.79 || 0.75) / Math.max(width / fullWidth, height / fullHeight);
    var translate = [
      fullWidth / 2 - scale * midX,
      fullHeight / 2 - scale * midY,
    ];
    svg
        .transition()
        .duration(200 || 0)
        .call(
            zoom.transform,
            d3.zoomIdentity.translate(...translate).scale(scale)
        );
}
}
