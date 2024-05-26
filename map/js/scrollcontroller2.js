var root = document.getElementById("svgmap");

    function lapsedZoomFit(ticks, transitionDuration) {
        for (var i = ticks || 100; i > 0; --i) force.tick();
        force.stop();
        zoomFit(transitionDuration);
    }

function zoomFit(transitionDuration) {
    var bounds = root.node().getBBox();
    var parent = root.node().parentElement;
    var fullWidth  = parent.clientWidth  || parent.parentNode.clientWidth,
        fullHeight = parent.clientHeight || parent.parentNode.clientHeight;
    var width  = bounds.width,
        height = bounds.height;
    var midX = bounds.x + width / 2,
        midY = bounds.y + height / 2;
    if (width == 0 || height == 0) return; // nothing to fit
    var scale = 0.85 / Math.max(width / fullWidth, height / fullHeight);
    var translate = [
        fullWidth  / 2 - scale * midX,
        fullHeight / 2 - scale * midY
    ];

    console.trace("zoomFit", translate, scale);

    root
        .transition()
        .duration(transitionDuration || 0) // milliseconds
        .call(zoom.translate(translate).scale(scale).event);
}
