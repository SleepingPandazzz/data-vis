let counties_topojson;
let states_toposjon;
let hotness_by_date;
let max_price;
let color;
let color_range = ['#69b764', '#ffd94a', 'pink', '#f26c64'];
let hotness;
let grouped_hotness;

const date_arr = [
  {"display_date": "2017 Aug", "date": "201708"},
  {"display_date": "2017 Sep", "date": "201709"},
  {"display_date": "2017 Oct", "date": "201710"},
  {"display_date": "2017 Nov", "date": "201711"},
  {"display_date": "2017 Dec", "date": "201712"},
  {"display_date": "2018 Jan", "date": "201801"},
  {"display_date": "2018 Feb", "date": "201802"},
  {"display_date": "2018 Mar", "date": "201803"},
  {"display_date": "2018 Apr", "date": "201804"},
  {"display_date": "2018 May", "date": "201805"},
  {"display_date": "2018 Jun", "date": "201806"},
  {"display_date": "2018 July", "date": "201807"},
  {"display_date": "2018 Aug", "date": "201808"},
  {"display_date": "2018 Sep", "date": "201809"},
  {"display_date": "2018 Oct", "date": "201810"},
  {"display_date": "2018 Nov", "date": "201811"},
  {"display_date": "2018 Dec", "date": "201812"},
  {"display_date": "2019 Jan", "date": "201901"},
  {"display_date": "2019 Feb", "date": "201902"},
  {"display_date": "2019 Mar", "date": "201903"},
  {"display_date": "2019 Apr", "date": "201904"},
  {"display_date": "2019 May", "date": "201905"},
  {"display_date": "2019 Jun", "date": "201906"},
  {"display_date": "2019 July", "date": "201907"},
  {"display_date": "2019 Aug", "date": "201908"},
  {"display_date": "2019 Sep", "date": "201909"},
  {"display_date": "2019 Oct", "date": "201910"},
  {"display_date": "2019 Nov", "date": "201911"},
  {"display_date": "2019 Dec", "date": "201912"},
  {"display_date": "2020 Jan", "date": "202001"},
  {"display_date": "2020 Feb", "date": "202002"},
  {"display_date": "2020 Mar", "date": "202003"},
  {"display_date": "2020 Apr", "date": "202004"},
  {"display_date": "2020 May", "date": "202005"},
  {"display_date": "2020 Jun", "date": "202006"},
  {"display_date": "2020 July", "date": "202007"},
  {"display_date": "2020 Aug", "date": "202008"},
  {"display_date": "2020 Sep", "date": "202009"},
  {"display_date": "2020 Oct", "date": "202010"},
  {"display_date": "2020 Nov", "date": "202011"},
  {"display_date": "2020 Dec", "date": "202012"},
  {"display_date": "2021 Jan", "date": "202101"},
  {"display_date": "2021 Feb", "date": "202102"},
  {"display_date": "2021 Mar", "date": "202103"},
  {"display_date": "2021 Apr", "date": "202104"},
  {"display_date": "2021 May", "date": "202105"},
  {"display_date": "2021 Jun", "date": "202106"},
  {"display_date": "2021 July", "date": "202107"},
  {"display_date": "2021 Aug", "date": "202108"},
  {"display_date": "2021 Sep", "date": "202109"},
  {"display_date": "2021 Oct", "date": "202110"},
  {"display_date": "2021 Nov", "date": "202111"},
  {"display_date": "2021 Dec", "date": "202112"},
  {"display_date": "2022 Jan", "date": "202201"},
  {"display_date": "2022 Feb", "date": "202202"},
  {"display_date": "2022 Mar", "date": "202203"},
  {"display_date": "2022 Apr", "date": "202204"},
  {"display_date": "2022 May", "date": "202205"}
]

async function initMap(date) {
  hotness = await d3.csv("/hotness.csv");
  const counties = await d3.json("/counties-albers-10m.json");
  counties_topojson = topojson.feature(counties, counties.objects.counties);
  // states_topjson = topojson.feature(counties, counties.objects.states);
  grouped_hotness = groupHotnessByDate(hotness);

  // color = d3.scaleThreshold().domain([200000, 300000, 400000, 600000, 1000000])
  //                            .range(['#f3e0c2', '#f0c294', '#fd8938', '#d74401', '#9c0824', '#2e0000']);
  // color = d3.scaleThreshold().domain([400000, 800000, 1000000])
  //                            .range(['#dbdb8d', '#ffd94a', '#ff7f0f', '#b85a0d']);

  color = d3.scaleThreshold().domain([300000, 500000, 800000])
                             .range(color_range);

  render(date);
}

function render(date) {
  d3.select("#map-svg").html("");
  d3.select("#pie-svg").html("");
  const g = d3.select("#map-svg")
              .attr("width", 1000)
              .attr("height", 650)
              .append("g");

  const projection = d3.geoAlbersUsa().scale(1300).translate([500, 325]);
  const geo_path = d3.geoPath();

  const min_date = 201708;
  const max_date = 202206;
  hotness_by_date = buildStateHotnessByDate(grouped_hotness, counties_topojson, date);

  max_price = Math.max(...hotness_by_date.map(hotness => hotness.median_listing_price));

  g.selectAll("path")
   .data(hotness_by_date.map(hotness => hotness.feature))
   .enter()
   .append("path")
   .attr("d", geo_path)
   .attr("stroke", "gray")
   .attr("stroke-width", "1")
   .attr("pointer-events", "path")
   .attr("fill", function(d) {
     let data = hotness_by_date.find(hotness => hotness.feature.id == d.id);
     return color(data.median_listing_price);
   })
   .on("mouseenter", function(d, i) {
      d3.select(this).style("cursor", "pointer").style("stroke", "black");
      let data = hotness_by_date.find(hotness => hotness.feature.id == i.id);
      if (data) {
        let tooltip = d3.select('#tooltip');
        tooltip.classed("hidden", false)
              .style("left", d.clientX + "px")
              .style("top", d.clientY + "px");

        // tooltip.select('#headcounty').text(data.county_name)
        let county_row = '<tr><td>County: </td><td>' + capitialize(data.county_name.split(', ')[0]) + '</td></tr>';
        let state_row = '<tr><td>State: </td><td>' + (data.county_name.split(', ')[1]).toUpperCase() + '</td></tr>';
        let price_row = '<tr><td>Median Price: </td><td>' + moneyFormat(data.median_listing_price) + '</td></tr>';
        tooltip.select("#tooltip-body").html(county_row + state_row + price_row);
      } else {
        tooltip.select("text").text("No data available")
      }
   })
   .on("mouseleave", function(d) {
      d3.select(this).style("cursor", "pointer").style("stroke", "gray");
      d3.select("#tooltip").classed("hidden", true);
   });

  let slider = document.getElementById('date');
  let current_date = document.getElementById('current-date');
  let selected_date = date_arr.find(d => d.date == date.toString());
  current_date.innerHTML = selected_date.display_date;

  slider.oninput = function() {
    current_date.innerHTML = date_arr[this.value]["display_date"];
    render(date_arr[this.value]["date"]);
  }

  var radius = 100;
  const pie_g = d3.select("#pie-svg")
                  .attr("width", radius * 3)
                  .attr("height", radius * 2.6)
                  .append("g")
                  .attr("transform", "translate("+ radius +", " + radius + ")");

  var range_1_count = getCountOfHousePriceRange(hotness_by_date, 0, 300000);
  var range_2_count = getCountOfHousePriceRange(hotness_by_date, 300000, 500000);
  var range_3_count = getCountOfHousePriceRange(hotness_by_date, 500000, 800000);
  var range_4_count = hotness_by_date.length - range_1_count - range_2_count;
  var pie_data = [range_1_count, range_2_count, range_3_count, range_4_count];
    
  var pieColor = d3.scaleOrdinal(color_range);
  var pie = d3.pie();
    
  var arc = d3.arc()
              .innerRadius(radius * 0.5)
              .outerRadius(radius * 0.8);
  var outerArc = d3.arc()
                   .innerRadius(radius * 0.9)
                   .outerRadius(radius * 0.9);
    
  var arcs = pie_g.selectAll("arc")
                  .data(pie(pie_data))
                  .enter()
                  .append("g")
                  .attr("class", "arc")
    
  arcs.append("path")
      .attr("fill", function(d, i) {
        return pieColor(i);
      })
      .attr("d", arc);

  pie_g.selectAll('allPolylines')
       .data(pie(pie_data))
       .enter()
       .append('polyline')
         .attr("stroke", "black")
         .style("fill", "none")
         .attr("stroke-width", 1)
         .attr('points', function(d) {
           var posC = outerArc.centroid(d);
           var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 
           posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1);
           return [arc.centroid(d), outerArc.centroid(d), posC];
         });

  pie_g.selectAll('allLabels')
       .data(pie(pie_data))
       .enter()
       .append('text')
       .text( function(d, i) { return getPercentageoOfHousePriceRange(hotness_by_date.length, pie_data, i); } )
       .attr('transform', function(d) {
          var pos = outerArc.centroid(d);
          var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
          pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
          return 'translate(' + pos + ')';
    })
}

function getCountOfHousePriceRange(hotness_by_date, min, max) {
  return hotness_by_date.filter(el => el.median_listing_price < max && el.median_listing_price >= min).length
}

function getPercentageoOfHousePriceRange(total_count, pie_data, index) {
  return (pie_data[index] * 100 / total_count).toFixed(1) + "%";
}

function getColor(el, hotness_by_date) {
  if (el == undefined || el.id == undefined) return "white";
  let data = hotness_by_date.find(function(hotness) {
    if (hotness.feature == undefined || hotness.feature.id == undefined) return "gray";
    hotness.feature.id == el.id
  })
  return color(data.median_listing_price);
}

function buildStateHotnessByDate(grouped_hotness, counties_topojson, date) {
  grouped_hotness[date].forEach(function(element) {
    feature = counties_topojson.features.find(feature => feature.properties.name.toLowerCase() == element.county_name.split(", ")[0].toLowerCase());
    element.feature = feature
  });
  return grouped_hotness[date].filter(hotness => hotness.feature !== null && hotness.feature != undefined );
}

function groupHotnessByDate(data){
  return groupByKey(data, 'month_date_yyyymm');
}

function groupByKey(array, key) {
  return array.reduce((hash, obj) => {
    if(obj[key] === undefined) return hash; 
    return Object.assign(hash, { [obj[key]]:( hash[obj[key]] || [] ).concat(obj)})
  }, {});
}

function capitialize(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function moneyFormat(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num;
 }

let timeOut = 0;
let playing = false;
let yearIndex = 0;

function playTrace() {
  if (playing) {
    playing = false;
    document.getElementById('play-btn').innerHTML = "Continue";
    return;
  } else {
    document.getElementById('play-btn').innerHTML = "Stop";
    playing = true;
  }

  yearIndex = parseInt(document.getElementById('date').value);

  delay();
}

function delay() {
  setTimeout(() => {
    if (!playing) return;
    if (yearIndex < date_arr.length) {
      document.getElementById('date').value = yearIndex;
      render(date_arr[yearIndex]["date"]);
      delay(yearIndex + 1);
      yearIndex += 1;
    } else if (yearIndex == date_arr.length) {
      document.getElementById('play-btn').innerHTML = "Click to Play";
      document.getElementById('date').value = 0;
      playing = false;
      yearIndex = 0;
    }
  }, 500);
}