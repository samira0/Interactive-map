
var svgmap;
var last_key;
var kf=1;
  Promise.all([
      d3.json(`${window.location.origin}/map/russia.json`,{}),
      d3.tsv(`${window.location.origin}/data/ctd_full.csv`)
  ]).then((a)=>{svgmap=ready(null,a[0],a[1]); redraw(last_key);})

function getWidth() {
  return Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
  );
}

function getHeight() {
  return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
  );
}
function adaptLabelFontSize(d) {
  let factor=(VISPARAM.map.txtInitialScaleLabel/kf);
  return (factor<VISPARAM.map.txtMinSize?VISPARAM.map.txtMinSize:factor)+ 'em';
}
  function getTextOffset(element_text){
    return element_text.parentNode.getAttribute("transform").split(",").map((e,i)=>{return e.split(/\)|\(/)[(i+1)%2]}).map(parseFloat)
  }
  const areRectanglesOverlap = (rect1, rect2) => {
    let [left1, top1, right1, bottom1] = [rect1.left, rect1.top, rect1.right, rect1.bottom],
        [left2, top2, right2, bottom2] = [rect2.left, rect2.top, rect2.right, rect2.bottom];
    // The first rectangle is under the second or vice versa
    if (top1 < bottom2 || top2 < bottom1) {
      return false;
    }
    // The first rectangle is to the left of the second or vice versa
    if (right1 < left2 || right2 < left1) {
      return false;
    }
    // Rectangles overlap
    return true;
  }
  function checkLabelOverlap(labels,svg) {
    const labelNodes = labels.nodes();
    const labelBoxes = [];
    for (let i = 0; i < labelNodes.length; i++) {
      const xyv=labelNodes[i].getBoundingClientRect();
      let oxy=getTextOffset(labelNodes[i])
      let bbox = {x:oxy[0]+xyv.x,y:oxy[1]+xyv.y,width:xyv.width,height:xyv.height}
      bbox.top=bbox.y+bbox.height;
      bbox.bottom=bbox.y;
      bbox.left=bbox.x;
      bbox.right=bbox.x+bbox.width;
      labelBoxes.push(bbox);
    }
    for (let i = 0; i < labelBoxes.length; i++) {
      for (let j = i + 1; j < labelBoxes.length; j++) {
        const overlap = areRectanglesOverlap(labelBoxes[i],labelBoxes[j]);
        if (overlap) {
          if(parseFloat(labelNodes[i].__data__.population) >parseFloat(labelNodes[j].__data__.population)){
            labelNodes[j].style.display = 'none';}
          if(parseFloat(labelNodes[i].__data__.population)<=parseFloat(labelNodes[j].__data__.population))
             labelNodes[i].style.display = 'none';
        }
      }
    }
  }
  function createIndicatorControls(data) {
    // Получение списка уникальных показателей
    const indicators = new Set();
    var keyset=[];
    for (const key in data[0]) {
      if(
          (key.split('_').length==3)&&
          (_.intersection(key.split('_').map(e=>e.toUpperCase()),['INDEX100','INDEX','TYPE','VALUE']).length>0)
      ) {
        keyset.push(key);
        indicators.add(key.split('_')[0]);
      }
    }
  last_key=keyset[0]
    const container = document.createElement('div');
const opt_label = document.createElement("label")
    opt_label.setAttribute("for","varselect")
    opt_label.innerHTML="показатель"
    // Выбор показателя
    const selectIndicator = document.createElement('select');
    selectIndicator.style="width:300px"
    selectIndicator.id="varselect"
    for (const indicator of indicators) {
      const option = document.createElement('option');
      option.value = indicator;
      option.text = indicator;
      selectIndicator.appendChild(option);}
    container.appendChild(opt_label)
    container.appendChild(selectIndicator);
    const  iv= document.createElement('div');
    iv.id="option_value";
    iv.style="display:inline; padding:30px";
    // Контейнер для ползунков
    container.appendChild(iv);
    const year_label = document.createElement("label")
    year_label.setAttribute("for","yslider")
    year_label.innerHTML="год"
    const yearSlider = document.createElement('input');
    yearSlider.type = 'range';
    yearSlider.min = 2000;
    yearSlider.max = 2021;
    yearSlider.value = 2000;
    yearSlider.style="width:80%"
    yearSlider.setAttribute("id","yslider")
    container.appendChild(document.createElement("br"));
    container.appendChild(year_label);
    container.appendChild(yearSlider);
    // Обработчик выбора показателя и года
    container.addEventListener('change', (event) => {
      const selectedIndicator = selectIndicator.value;
      if(event.target.tagName==="SELECT"){
        let years=keyset.filter(e=>e.includes(selectedIndicator)).map(e=>e.split("_").pop())
        if(/\d\d\d\d/.test(years[0])&&years[0].length===4){
          years=years.map(e=>parseInt(e));
          yearSlider.style="display:inline;"
          yearSlider.max = Math.max(...years);
          yearSlider.min = Math.min(...years);
          yearSlider.value = Math.min(...years);
        } else {
          yearSlider.style="display:none"
        }
      }
      const selectedYear = yearSlider.value;
      updateVisualization(selectedIndicator, selectedYear,data);
    });
    function updateVisualization(indicator, year,data) {
      let k=keyset.filter(e=>e.includes(indicator)&&e.includes(year))[0]
      const indicatorKey = `${indicator}_${year}`; // формирование ключа
      const indicatorValue = data[0][k];

      $("#option_value").html(`${indicator} за ${year}`)
      redraw(k,data)
      console.log(indicatorValue)
    }
    return container;
  }


  function redraw(key,city){
    last_key=key;
    const type=key.split("_")[1].toUpperCase();
    switch (type) {
      case "TYPE":
        svgmap.typeView(key)
        break;
      case "VALUE":
        svgmap.valueView(key)
        break;
      case "INDEX":
        svgmap.indexView(key)
        break;
      case "INDEX100":
        svgmap.index100View(key)
        break;
      default:break;
    }
    svgmap.noData(key)
  }





  function ready(error, map, city) {


    var controls = createIndicatorControls(city);
    document.body.appendChild(controls);
    var width = getWidth()/100*90, // размер svg элемента
        height = getHeight()/100*80;

    var color = d3.scaleLinear()
        .range(["#ffffff", "#f4786b"]) //от какого и до какого цвета
        .domain([0, 100]) // Максимальное и минимальное значение в диапазоне которых будет цветавая растяжка

    var div = d3.select("#my_dataviz") // добавляем div для подсказок (tooltip)
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var svg = d3.select("#my_dataviz") // добавляем svg для картограммы
        .append("svg")
        .attr("width", width)
        .attr("height", height).attr("id","svgmap")
        .style("margin", "10px auto");

    var g=svg.append("g").attr("class", "mgroup")

    var tooltipDiv = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);



      function createTooltip(cityData) {
          tooltipDiv.transition()
              .duration(200)
              .style("opacity", .9);
          tooltipDiv.html(`City: ${cityData.settlement}<br>${last_key.split("_")[0]}: ${cityData[last_key].slice(0,5)}`)
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 28) + "px");

      }

      // Function to hide tooltip
      function hideTooltip() {
        div.transition()
            .duration(500)
            .style("opacity", 0);
      }

      // ... (inside each visualization view function, e.g., typeView) ...

    function handleZoom() {
      const transform = d3.event.transform;
      const k = d3.event.transform.k;
     // g.attr("transform",`translate(${transform.x*k},${transform.y*k})scale(${k})`);
      g.attr("transform",transform);
      kf = k;
      redraw(last_key);
    }

    const zoom = d3.zoom().on("zoom", handleZoom);
    svg.call(zoom)


    var projection = d3.geoAlbers()
        .rotate([-105, 0])
        .center([-10, 65])
        .parallels([52, 64])
        .scale(VISPARAM.map.mapInitialScale) // масштаб картограммы внутри svg элемента
        .translate([width / 2, height / 2]);

    var path = d3.geoPath().projection(projection);

    //Drawing Choropleth
    features = topojson.feature(map, map.objects.name); //  "name" мы берем из russia.json, открыв файл в редакторе в самом начале файла есть "objects":{"name"
    _Global_features = features;

    g.append("g")
      .attr("class", "region")
      .selectAll("path")
      .data(features.features)
      .enter().append("path")
      .attr("d", path)
      .style("fill", function(d) {
        return VISPARAM.map.regioinColor;
      })
      .style("opacity", VISPARAM.map.regionOpacity)
      .style("stroke", VISPARAM.map.borderColor)
       .attr("stroke-width", VISPARAM.map.borderWidth)


    var cm=g.selectAll("g.city");
    cm.data(city.filter(e=>!_.isNaN(e[last_key])))
    .enter()
    .append("g")
    .attr("class", "city")
    .attr("transform", function(d) {
      return "translate(" + projection([parseFloat(d.longitude_dd),parseFloat(d.latitude_dd)]) + ")";
    }).append("text") // Adding city names
      .attr("x", 2)
      .attr("class", "city-label")
      .attr("font-family","Times, serif").attr("font-size",adaptLabelFontSize).attr("font-color","green")// Add a class for styling and selection
      .text(function(d) {
        return d.settlement;
      }).select(function() { return this.parentNode; })
      .append("circle")
      .on("mouseover",(d)=>{return createTooltip(d)})  // Add tooltip on mouseover
      .on("mouseout", hideTooltip)       // Hide tooltip on mouseout // Adding city names.append("circle") // добавление точек
    .attr("r", 1)
    .style("fill", "red");

      // Function to create a legend
      function createLegend(svg, type, title) {
          svg.selectAll("g.legend").remove()

          var legend = svg.append("g")
              .attr("class", "legend")
              .attr("transform", "translate(50, 30)")

          var legendRectSize = 12;
          var legendSpacing = 4;

          // Add legend title
          legend.append("text")
              .attr("class", "legend-title")
              .attr("x", 0)
              .attr("y", -10)
              .text(title)
              .style("font-size", "12px")
              .style("font-weight", "bold");

          var categories, scale, representation;
          switch(type) {
              case 'TYPE':
                  categories = VISPARAM.type.colorSet.map((_, i) => i);
                  scale = d3.scaleOrdinal().domain(categories).range(VISPARAM.type.colorSet);
                  representation = 'color';
                  break;
              case 'VALUE':
                  categories = [1, 2500, 5000, 7500, 10000];
                  scale = d3.scaleLinear().domain([1, 10000]).range(VISPARAM.value.colorScale);
                  representation = 'color';
                  break;
              case 'INDEX':
                  categories = [-4, -2, 0, 2, 4];
                  scale =  d3.scaleLinear().domain([-4, 4]).range(VISPARAM.index.rrange);
                  representation = 'size_color';
                  break;
              case 'INDEX100':
                  categories = [0, 25, 50, 75, 100];
                  scale = d3.scaleLinear().domain([0, 100]).range(VISPARAM.index100.rrange);
                  representation = 'size';
                  break;
              default:
                  categories = [];
                  scale = d3.scaleOrdinal().domain(categories).range([]);
                  representation = 'color';
                  break;
          }

          if (representation === 'color') {
              var legendItems = legend.selectAll('.legend-item')
                  .data(categories)
                  .enter()
                  .append('g')
                  .attr('class', 'legend-item')
                  .attr('transform', function(d, i) {
                      var height = legendRectSize + legendSpacing;
                      var vert = i * height;
                      return 'translate(0,' + vert + ')';
                  });

              legendItems.append('rect')
                  .attr('width', legendRectSize)
                  .attr('height', legendRectSize)
                  .style('fill', function(d) { return scale(d); })
                  .style('stroke', function(d) { return scale(d); });

              legendItems.append('text')
                  .attr('x', legendRectSize + legendSpacing)
                  .attr('y', legendRectSize - legendSpacing)
                  .text(function(d) { return d; })
                  .style("font-size", "10px");

          } else if (representation === 'size') {
              var legendItems = legend.selectAll('.legend-item')
                  .data(categories)
                  .enter()
                  .append('g')
                  .attr('class', 'legend-item')
                  .attr('transform', function(d, i) {
                      var height = legendRectSize + legendSpacing;
                      var vert = i * height;
                      return 'translate(0,' + vert + ')';
                  });

              legendItems.append('circle')

                  .attr("r",(d)=>{let r= (VISPARAM.index100.rRescaleFactor/kf)*scale(parseFloat(d)); return r<VISPARAM.index100.rmin?VISPARAM.index100.rmin:r})
                  .attr('cx', legendRectSize )
                  .attr('cy', legendRectSize)
                  .style('fill', VISPARAM.index100.fillColor)
                  .attr('fill-opacity', (d)=>{let r= (VISPARAM.index100.rRescaleFactor/kf)*scale(parseFloat(d)); return r<VISPARAM.index100.rmin?VISPARAM.index100.runderflowOpacity:VISPARAM.index100.rregularOpacity})


              legendItems.append('text')
                  .attr('x', legendRectSize + legendSpacing)
                  .attr('y', legendRectSize - legendSpacing)
                  .text(function(d) { return d; })
                  .style("font-size", "10px").attr('transform', function(d, i) {
                  var height = legendRectSize + legendSpacing;
                  var vert = i * height;
                  return 'translate(10,10)';
              });

          } else if (representation === 'size_color') {
              var legendItems = legend.selectAll('.legend-item')
                  .data(categories)
                  .enter()
                  .append('g')
                  .attr('class', 'legend-item')
                  .attr('transform', function(d, i) {
                      var height = legendRectSize + legendSpacing;
                      var vert = i * height;
                      return 'translate(0,' + vert + ')';
                  });

              legendItems.append('circle')

                  .attr('r', function(d) {
                      var r;
                      var v=parseFloat(d)
                      if(v<0){r=(VISPARAM.index.rRescaleFactor/kf)*(scale(-v));}
                            else{r=(VISPARAM.index.rRescaleFactor/kf)*(scale(v));}
                      return r<VISPARAM.index.rmin?VISPARAM.index.rmin:r})
                  .attr('cx', legendRectSize )
                  .attr('cy', legendRectSize)
                  .style('fill',(d)=>{return parseFloat(d)<0?VISPARAM.index.lt0Color:VISPARAM.index.gt0Color})
                  .attr('fill-opacity',(d)=>{let r= (VISPARAM.index.rRescaleFactor/kf)*scale(parseFloat(d)); return r<VISPARAM.index.rmin?VISPARAM.index.runderflowOpacity:VISPARAM.index.rregularOpacity})

              legendItems.append('text')
                  .attr('x', legendRectSize + legendSpacing*2)
                  .attr('y', legendRectSize - legendSpacing*2)
                  .text(function(d) { return d; })
                  .style("font-size", "10px")
                  .attr('transform', function(d, i) {
                      var height = legendRectSize + legendSpacing;
                      var vert = i * height;
                      return 'translate(10,10)';
                  });
          }
      }
      function noData(key){

      const color_maps=VISPARAM.nodata.fillColor;
      cm.data(city.filter(e=>_.isNaN(parseFloat(e[key]))))
          .enter()
          .append("g")
          .attr("class", "city")
          .attr("transform", function(d) {
            return "translate(" + projection([parseFloat(d.longitude_dd),parseFloat(d.latitude_dd)]) + ")";
          })
          .append("circle")
          .on("mouseover",(d)=>{return createTooltip(d)})  // Add tooltip on mouseover
          .on("mouseout", hideTooltip)       // Hide tooltip on mouseout// Adding city names.append("circle") // добавление точек
          .attr("r", d=>(VISPARAM.nodata.rRescaleFactor/kf)<VISPARAM.nodata.rmin?VISPARAM.nodata.rmin:(VISPARAM.nodata.rRescaleFactor/kf))
          .style("fill", VISPARAM.nodata.fillColor)
          .attr('fill-opacity',0.9)
          .attr('stroke-color', VISPARAM.nodata.strokeColor)
          .attr('stroke-width', VISPARAM.nodata.strokeWidth)
          .select(function() { return this.parentNode; })
          .append("text") // Adding city names
          .attr("x", 0)
          .attr("class", "city-label")
          .attr("font-family","Times, serif")
          .attr("font-size",adaptLabelFontSize)
          .attr("font-color","green")// Add a class for styling and selection
          .text(function(d) {
            return d.settlement;
          })
      checkLabelOverlap(d3.selectAll(".city-label"),svg);

    }


    function typeView(key){
      svg.selectAll("g.city").remove();
      const color_maps=VISPARAM.type.colorSet;
      cm.data(city.filter(e=>!_.isNaN(parseFloat(e[key]))))
          .enter()
          .append("g")
          .attr("class", "city")
          .attr("transform", function(d) {
            return "translate(" + projection([parseFloat(d.longitude_dd),parseFloat(d.latitude_dd)]) + ")";
          })
          .append("circle")
          .on("mouseover",(d)=>{return createTooltip(d)})  // Add tooltip on mouseover
          .on("mouseout", hideTooltip)       // Hide tooltip on mouseout// Adding city names.append("circle") // добавление точек
          .attr("r", d=>(VISPARAM.type.rRescaleFactor/kf)<VISPARAM.type.rmin?VISPARAM.type.rmin:(VISPARAM.type.rRescaleFactor/kf))
          .style("fill", (d)=>{return color_maps[parseInt(d[key])]})
          .attr('fill-opacity',VISPARAM.type.rregularOpacity)
          .select(function() { return this.parentNode; })
          .append("text") // Adding city names
          .attr("x", 0)
          .attr("class", "city-label")
          .attr("font-family","Times, serif")
          .attr("font-size",adaptLabelFontSize)
          .attr("font-color","green")// Add a class for styling and selection
          .text(function(d) {
            return d.settlement;
          })
          checkLabelOverlap(d3.selectAll(".city-label"),svg);
        var categories = [1, 2,3,4,5,6]
        createLegend(d3.select("svg"), "TYPE", key);

    }

    function index100View(key){
      svg.selectAll("g.city").remove();
      var v2r = d3.scaleLinear() // instead of scaleLinear()
          .domain([0, 100])
          .range(VISPARAM.index100.rrange)

      cm.data(city.filter(e=>!_.isNaN(parseFloat(e[key]))))
          .enter()
          .append("g")
          .attr("class", "city")
          .attr("transform", function(d) {
            return "translate(" + projection([parseFloat(d.longitude_dd),parseFloat(d.latitude_dd)]) + ")";
          })
          .append("circle")
          .on("mouseover",(d)=>{return createTooltip(d)})  // Add tooltip on mouseover
          .on("mouseout", hideTooltip)        // Hide tooltip on mouseout // Adding city names.append("circle") // добавление точек
          .attr("r",(d)=>{let r= (VISPARAM.index100.rRescaleFactor/kf)*v2r(parseFloat(d[key])); return r<VISPARAM.index100.rmin?VISPARAM.index100.rmin:r})
          .attr('fill-opacity', (d)=>{let r= (VISPARAM.index100.rRescaleFactor/kf)*v2r(parseFloat(d[key])); return r<VISPARAM.index100.rmin?VISPARAM.index100.runderflowOpacity:VISPARAM.index100.rregularOpacity})
          .attr('stroke-width', VISPARAM.index100.strokeWidth)
          .style("stroke",VISPARAM.index100.strokeColor)
          .style("fill",VISPARAM.index100.fillColor)
          .select(function() { return this.parentNode; })
          .append("text") // Adding city names
          .attr("x", 0)
          .attr("class", "city-label")
          .attr("font-family","Times, serif").attr("font-size",adaptLabelFontSize).attr("font-color","green")// Add a class for styling and selection
          .text(function(d) {
            return d.settlement;
          })
          checkLabelOverlap(d3.selectAll(".city-label"),svg);
        var categories = [1, 10, 40, 80, 100];
        const colorScale = d3
            .scaleLinear()
            .domain([1, 100])
            .range(VISPARAM.index100.fillColor,VISPARAM.index100.fillColor)
        createLegend(d3.select("svg"), "INDEX100",key);
    }

    function indexView(key){
      svg.selectAll("g.city").remove();
      var v2r = d3.scaleLinear() // instead of scaleLinear()
          .domain([-4, 4])
          .range(VISPARAM.index.rrange)

      cm.data(city.filter(e=>!_.isNaN(parseFloat(e[key]))))
          .enter()
          .append("g")
          .attr("class", "city")
          .attr("transform", function(d) {
            return "translate(" + projection([parseFloat(d.longitude_dd),parseFloat(d.latitude_dd)]) + ")";
          })
          .append("circle")
          .on("mouseover",(d)=>{return createTooltip(d)})  // Add tooltip on mouseover
          .on("mouseout", hideTooltip)      // Hide tooltip on mouseout// Adding city names.append("circle") // добавление точек
          .attr("r",(d)=>{
            var r;
            var v=parseFloat(d[key])
            if(v<0){r=(VISPARAM.index.rRescaleFactor/kf)*(v2r(-v));}else{r=(VISPARAM.index.rRescaleFactor/kf)*(v2r(v));}
            return r<VISPARAM.index.rmin?VISPARAM.index.rmin:r}
          )
          .attr('fill-opacity',(d)=>{let r= (VISPARAM.index.rRescaleFactor/kf)*v2r(parseFloat(d[key])); return r<VISPARAM.index.rmin?VISPARAM.index.runderflowOpacity:VISPARAM.index.rregularOpacity})
          .attr('stroke-width', VISPARAM.index.strokeWidth)
          .style("fill",d=>parseFloat(d[key])<0?VISPARAM.index.lt0Color:VISPARAM.index.gt0Color)
          .select(function() { return this.parentNode; })
          .append("text") // Adding city names
          .attr("x", 0)
          .attr("class", "city-label")
          .attr("font-family","Times, serif").attr("font-size",adaptLabelFontSize).attr("font-color","green")// Add a class for styling and selection
          .text(function(d) {
            return d.settlement;
          })
      checkLabelOverlap(d3.selectAll(".city-label"),svg);
        var categories = [-4, -2, 1, 0,1,2,4];

        createLegend(d3.select("svg"), "INDEX",key);
    }

    function valueView(key){
      svg.selectAll("g.city").remove();
      var v2r = d3.scaleLinear() // instead of scaleLinear()
          .domain([1, 10000])
          .range(VISPARAM.value.rrange)
      const colorScale = d3
          .scaleLinear()
          .domain([1, 10000])
          .range(VISPARAM.value.colorScale)
      cm.data(city.filter(e=>!_.isNaN(parseFloat(e[key]))))
          .enter()
          .append("g")
          .attr("class", "city")
          .attr("transform", function(d) {
            return "translate(" + projection([parseFloat(d.longitude_dd),parseFloat(d.latitude_dd)]) + ")";
          })
          .append("circle")
          .on("mouseover",(d)=>{return createTooltip(d)})  // Add tooltip on mouseover
          .on("mouseout", hideTooltip)        // Hide tooltip on mouseout // Adding city names.append("circle") // добавление точек
          .attr("r",(d)=>{let r= (VISPARAM.value.rRescaleFactor/kf)*v2r(parseFloat(d[key])); return r<VISPARAM.value.rmin?VISPARAM.value.rmin:r})
          .attr('fill-opacity', (d)=>{let r= (VISPARAM.value.rRescaleFactor/kf)*v2r(parseFloat(d[key])); return r<VISPARAM.value.rmin?VISPARAM.value.runderflowOpacity:VISPARAM.value.rregularOpacity})
          .attr('stroke-width', VISPARAM.value.strokeWidth)
          .style("fill",d=>colorScale(parseFloat(d[key])))
          .select(function() { return this.parentNode; })
          .append("text") // Adding city names
          .attr("x", 0)
          .attr("class", "city-label")
          .attr("font-family","Times, serif").attr("font-size",adaptLabelFontSize).attr("font-color","green")// Add a class for styling and selection
          .text(function(d) {
            return d.settlement;
          })

      checkLabelOverlap(d3.selectAll(".city-label"),svg);
        var categories = [1, 2500, 5000, 7500, 10000]; // Adjust categories as needed
        createLegend(d3.select("svg"), "VALUE",key);
    }


      // Function to create a legend


// Call createLegend function within ready function after map is drawn


    return {
      typeView:typeView,
      index100View:index100View,
      indexView:indexView,
      valueView:valueView,
      noData:noData
    }
  }


