function drawScatter(x, y, location) {

    var margin = {top: 50, right: 0, bottom: 30, left: 0};
    var width = 400 - margin.left - margin.right;
    var height = 300 - margin.top - margin.bottom;

// pre-cursors
    var sizeForCircle = function(d) {
        // TODO: modify the size
        return 5;
    };

    var color = d3.scale.ordinal()
        .domain(['ATL', 'BOS', 'BRK', 'CHI', 'CLE', 'DAL', 'DEN', 'GSW', 'HOU', 'IND', 'LAC', 'LAL', 'MEM', 'MIA', 'OKC',
            'ORL', 'PHO', 'POR', 'SAS', 'TOR'])
        .range(['#E03A3E', '#008348', '#000000', '#CE1141', '#860038', '#007DC5', '#4FA8FF', '#006BB6', '#CE1141',
            '#FFC633', '#ED174C', '#552582', '#BBD1E4', '#98002E', '#F05133', '#007DC5', '#E56020', '#F0163A',
            '#B6BFBF', '#CE1141']);

// setup x
    var xValue = function(d) { return d[x];}, // data -> value
        xScale = d3.scale.linear().range([0, width]), // value -> display
        xMap = function(d) { return xScale(xValue(d));}, // data -> display
        xAxis = d3.svg.axis().scale(xScale).orient("bottom");

// setup y
    var yValue = function(d) { return d[y];}, // data -> value
        yScale = d3.scale.linear().range([height, 0]), // value -> display
        yMap = function(d) { return yScale(yValue(d));}, // data -> display
        yAxis = d3.svg.axis().scale(yScale).orient("left");


// add the graph canvas to the body of the webpage
    var scatter = d3.select(location).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

// load data
    d3.csv("Results.csv", function(error, data) {
        // change string (from CSV) into number format
        data.forEach(function(d) {
            d[x] = +d[x];
            d[y] = +d[y];
        });

        //console.log(data);
        //manufacturer, EFG, number of cereals

        //SCATTER PLOT START
        // don't want dots overlapping axis, so add in buffer to data domain
        xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
        yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

        // x-axis
        scatter.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .attr("fill", "black")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .attr("fill", "black")
            .style("text-anchor", "end")
            .text(x);

        // y-axis
        scatter.append("g")
            .attr("class", "y axis")
            .attr("fill", "black")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .attr("fill", "black")
            .style("text-anchor", "end")
            .text(y);

        // draw dots
        scatter.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", sizeForCircle)
            .attr("cx", xMap)
            .attr("cy", yMap)
            .style("fill", function(d) { return color(d["Team"]); });
        /*.on("mouseover", function(d) {

         // TODO: show the tool tip
         tooltip.style("opacity", 1);

         // TODO: fill to the tool tip with the appropriate data
         tooltip.html(d["Cereal Name"])
         .style("left", d3.event.pageX + 5 + "px")
         .style("top", d3.event.pageY + 5 + "px");

         // TODO: ADD DELAY
         d3.selectAll(".dot").transition()
         .duration(300)
         .attr("r", function(e) {

         if (d["Cereal Name"] == e["Cereal Name"]) {
         return 10 * e["Serving Size Weight"];
         } else {
         return 5 * e["Serving Size Weight"];
         }

         });

         })
         .on("mouseout", function(d) {
         // TODO: hide the tooltip
         tooltip.style("opacity", 0);

         // TODO: resize the nodes
         d3.selectAll(".dot").transition()
         .duration(500)
         .attr("r", sizeForCircle);

         })
         .on("click", function(d) {

         d3.selectAll(".bar").transition()
         .duration(500)
         .attr("fill", function(e) {

         if (d["EFG"] < e["Average"]) {
         return "black";
         } else {
         return color(cValue(e));;
         }

         });

         });*/

    });

}

drawScatter("Assists", "Turnover Percentage", ".scatter-plot");