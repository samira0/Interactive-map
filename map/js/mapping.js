 svg = d3.select("body").append("svg").attr("id","svgmap").attr('width', 500).attr('height', 500),
    g = svg.append('g'),

    projection = d3.geoMercator().scale(7000).center([-74, 42]),
    path = d3.geoPath().projection(projection),

    // Scale border width and node radius dynamically with zoom
    countyBorderWidth = 0.1,
    nodeRadius = 12, // Max radius if node is free of collision
    radiusStep = 0.01,
    nodes=null,
    zoom = d3.zoom().on("zoom",function() {
        g.attr("transform","translate("+ d3.event.translate.join(",")+")scale("+d3.event.scale+")");
        g.selectAll("circle")
        .attr("r", nodeRadius / d3.event.scale);
        g.selectAll("path")
            .style('stroke-width', countyBorderWidth / d3.event.scale )
            .attr("d", path.projection(projection));
    }),


svg.call(zoom);

function tick() {
    nodes.forEach(collided);

    nodes.forEach(function(n) {
        if (!n.collided) {
            n.r += radiusStep;
            if (n.r > nodeRadius) {
                n.r = nodeRadius;
                n.collided = true;
            }
        }
    });
}

function collided(node, i) {
    if (node.collided) return;

    nodes.forEach(function(n, j) {
        if (n !== node) {
            var dx = node.x - n.x, dy = node.y - n.y,
                l = Math.sqrt(dx*dx+dy*dy);

            if (l < node.r + n.r) {
                node.collided = true;
                n.collided = true;
            }
        }
    });
}



//Начинаем рисовать картограмму

function ready(map, data, city) {
    nodes = city.map(function(n) {
        var pos = projection([parseFloat(n.longitude_dd),parseFloat(n.latitude_dd)]);
        return {
            collided: false,
            x: pos[0],
            y: pos[1],
            r: 0
        };
    });
    function drawRus()
    {
        while (nodes.filter(function (n) {
            return n.collided;
        }).length < nodes.length) {
            tick();
        }
        features = topojson.feature(map, map.objects.name); //  "name" мы берем из russia.json, открыв файл в редакторе в самом начале файла есть "objects":{"name"
        _Global_features = features;

        function drawRegions(map) {
            g.selectAll('path').data(_Global_features.features).enter()
                .append('path')
                .attr('class', 'map-county')
                .attr('d', path)
                .style('stroke-width', countyBorderWidth);
        }

        function drawNodes(city) {
            g.selectAll('circle').data(city).enter().append("circle")
                .attr("cx", function (d) {
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.y;
                })
                .attr("r", function (d, i) {
                    return d.r;
                })
                .attr("class", "map-marker");
        }

        drawRegions(map);
        drawNodes(nodes);

    }

    drawRus();
}
 Promise.all([d3.json(`${window.location.origin}/map/russia.json`,{}),d3.tsv(`${window.location.origin}/data/ctd_full.csv`)]).then((a)=>ready(a[0],null,a[1]))
