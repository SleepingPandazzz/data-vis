let us_prices;
let modified_us_prices;
async function initChart() {
  us_prices = await d3.csv("/us_price_history.csv");
  build_us_prices_with_date_and_value(us_prices);

  var margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width = 1300 - margin.left - margin.right,
  height = 800 - margin.top - margin.bottom;

  const svg = d3.select("#chart-svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")          
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleTime()
            .domain(d3.extent(modified_us_prices, function(d) { return d.date; }))
            .range([ 0, width ]);

  svg.append("g")
     .attr("transform", "translate(0," + height + ")")
     .call(d3.axisBottom(x));

  var y = d3.scaleLinear()
            .domain([0, d3.max(modified_us_prices, function(d) { return +d.value; })])
            .range([ height, 0 ]);
  svg.append("g").call(d3.axisLeft(y));

  svg.append("path")
     .datum(modified_us_prices)
     .attr('fill', 'none')
     .attr("stroke", "black")
     .attr("stroke-width", 1.5)
     .attr("d", d3.line().x(function(d) { return x(d.date) }).y(function(d) { return y(d.value) }));
  
  svg.selectAll("myline")
     .data(modified_us_prices)
     .enter()
     .append("line")
     .attr("x1", function(d) { return x(d.date); })
     .attr("x2", function(d) { return x(d.date); })
     .attr("y1", function(d) { return y(d.value); })
     .attr("y2", y(0))
     .attr("stroke", "lightgray");

     var tooltip = svg
     .append("div")
       .style("opacity", 0)
       .attr("class", "tooltip")
       .style("background-color", "black")
       .style("border-radius", "5px")
       .style("padding", "10px")
       .style("color", "white");

       var showTooltip = function(d) {
        tooltip
          .transition()
          .duration(200)
        tooltip
          .style("opacity", 1)
          .html("tesing......:")
          .style("left", (d3.pointer(this)[0]+30) + "px")
          .style("top", (d3.pointer(this)[1]+30) + "px")
      }
      var moveTooltip = function(d) {
        tooltip
          .style("left", (d3.pointer(this)[0]+30) + "px")
          .style("top", (d3.pointer(this)[1]+30) + "px")
      }
      var hideTooltip = function(d) {
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0)
      }

  svg.selectAll("myCircles")
     .data(modified_us_prices)
     .enter()
     .append("circle")
     .attr("fill", function(d) {
      if (d.value < 300000) {
        return color_range[0];
      } else if (d.value >= 300000 && d.value < 600000) {
        return color_range[1];
      } else if (d.value >= 600000 && d.value < 800000) {
        return color_range[2];
      } else {
        return color_range[3];
      }
     })
     .attr("stroke", "none")
     .attr("cx", function(d) { return x(d.date) })
     .attr("cy", function(d) { return y(d.value) })
     .attr("r", 6)
     .on("mouseover", showTooltip())
     .on("mousemove", moveTooltip())
     .on("mouseleave", hideTooltip())
}

function build_us_prices_with_date_and_value(us_prices) {
  modified_us_prices = []
  us_prices.forEach(ele => {
    modified_us_prices.push({ date : d3.timeParse("%Y%m")(ele['month_date_yyyymm']), value : ele['median_listing_price'] });
  });
}