var allTeams = ['ATL', 'BOS', 'BRK', 'CHI', 'CLE', 'DAL', 'DEN', 'GSW', 'HOU', 'IND', 'LAC', 'LAL', 'MEM', 'MIA',
    'OKC', 'ORL', 'PHO', 'POR', 'SAS', 'TOR'];

var allYears = ['2015', '2014', '2013', '2012', '2011', '2010'];

var missingSA = ['ATL', 'BOS', 'BRK', 'CHI', 'CLE', 'DAL', 'DEN', 'GSW', 'HOU', 'IND', 'LAC', 'LAL', 'MEM', 'MIA',
    'OKC', 'ORL', 'PHO', 'POR', 'TOR'];

function drawScatter(x, y, location, width, height, teamArray, yearArray) {

    var margin = {top: 10, right: 35, bottom: 30, left: 35};
    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

// pre-cursors


    var color = d3.scale.ordinal()
        .domain(['ATL', 'BOS', 'BRK', 'CHI', 'CLE', 'DAL', 'DEN', 'GSW', 'HOU', 'IND', 'LAC', 'LAL', 'MEM', 'MIA',
            'OKC', 'ORL', 'PHO', 'POR', 'SAS', 'TOR'])
        .range(['#E03A3E', '#008348', '#000000', '#CE1141', '#860038', '#007DC5', '#4FA8FF', '#006BB6', '#CE1141',
            '#FFC633', '#ED174C', '#552582', '#BBD1E4', '#98002E', '#F05133', '#007DC5', '#E56020', '#F0163A',
            '#B6BFBF', '#CE1141']);

    // setup x
    var xValue = function(d) { return d[x];}, // data -> value
        xScale = d3.scale.linear().range([0, width]), // value -> display, range should be dataMin -> dataMax
        xMap = function(d) { return xScale(xValue(d));}, // data -> display
        xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    // setup y
    var yValue = function(d) { return d[y];}, // data -> value
        yScale = d3.scale.linear().range([0, height]), // value -> display, range should be dataMin -> dataMax
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
        .style("background-color", "black")
        .style("color", "white")
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
		
		if (x == "Playoff Rank") {
			xScale.domain([0,6]);
			xAxis.tickValues([1,2,3,4,5]);
		} else {
		var xDomain = getBufferValue(d3.min(data, xValue), d3.max(data, xValue));
        xScale.domain([xDomain[0], xDomain[1]]);
		var tickVals = (getTickValues(xDomain[0], xDomain[1], 5));
		xAxis.tickValues(tickVals);
		}
		
		var yDomain = getBufferValue(d3.min(data, yValue), d3.max(data, yValue));
		if (y == "Playoff Rank") {
			yScale.domain([6,0]);
			yAxis.tickValues([5,4,3,2,1,0]);
		} else {
			yScale.domain([yDomain[1], yDomain[0]]);
			yAxis.ticks(5);
		}


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
            .attr("y", 6) //how far the text comes out
            .attr("dy", ".71em")
            .attr("fill", "black")
            .style("text-anchor", "end")
            .text(y);

        // draw dots
        scatter.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .filter(function(d) { return filterFunction(teamArray, yearArray, d["Team"], d["Year"]); })
            .attr("class", "dot")
            .attr("r", 5)
            .attr("cx", xMap)
            .attr("cy", yMap)
            .style("fill", function(d) { return color(d["Team"]); })
            .on("mouseover", function(d) {

                 // TODO: show the tool tip
                 tooltip.style("opacity", 1);
        
                 // TODO: fill to the tool tip with the appropriate data
                 tooltip.html(d["Year"] + " " + teamConversion(d["Team"]))
                 .style("left", d3.event.pageX + 5 + "px")
                 .style("top", d3.event.pageY + 5 + "px");

            })
            .on("mouseout", function(d) {
                // TODO: hide the tooltip
                tooltip.style("opacity", 0);


            })
            .on("click", function(d) {

                // TODO: update text in our custom team label
                d3.select("#team-year-name")
                    .html(d["Year"] + " " + teamConversion(d["Team"]));

                d3.select("#pr")
                    .html(playoffConversion(d["Playoff Rank"]));

                d3.select("#efg")
                    .html(efgConversion(d["EFG"]));

                d3.select("#to")
                    .html(d["Turnover Percentage"] + "%");

                d3.select("#ast")
                    .html(d["Assists"]);

                // TODO: expand all nodes with the same team
                d3.selectAll(".dot").transition()
                    .duration(500)
                    .attr("r", function(e) {

                        if (d["Year"] == e["Year"] && d["Team"] == e["Team"]) {
                            return 10;
                        } else {
                            return 5;
                        }
                    });
            });

        
    });


}

//gets min & max vals for the domain to show on the scatterplot
function getBufferValue(raw_min, raw_max) {
	var output = (raw_max - raw_min) / 10.0
	if (output < 0) {
		output = -1 * output;
	}
	var uMin = raw_min - output;
	var uMax = raw_max + output;
	var output = round(uMin, uMax);
	return output;
}

//rounds the values to nice round numbers if possible
function round(min, max) {
	if (max < 1.0) {
		return [min,max];
	} else if (min > 100.0) {
		var min_out = (Math.floor(min / 100.0)) * 100.0;
		var max_out = (Math.ceil(max / 100.0)) * 100.0;
		return [min_out, max_out]
	} else { 
		var min_out = (Math.floor(min));
		var max_out = (Math.ceil(max));
		return [min_out, max_out];
	}


}

//sets tickvals for the scatter graphs
//currently only using for x-axis
//third parameter changes the number of ticks to show
//currently showing 5 to avoid overlapping
function getTickValues(min, max, numTicks) {
	var tickVals = [];
	var increment = (max - min) / (numTicks - 1);
	console.log(min);
	for (var i = 0; i < numTicks; i++) {
		tickVals.push(min + (i * increment));
	}
	return tickVals;

}

function filterFunction(teamArray, yearArray, team, year) {

    //console.log(array);

    teamValid = false;
    yearValid = false;

    for (var i = 0; i < teamArray.length; i++) {

        if (teamArray[i] === team) {
            //console.log(team);
            teamValid = true;
        }
    }

    for (i = 0; i < yearArray.length; i++) {

        if (yearArray[i] === year) {
            //console.log(year);
            yearValid = true;

        }
    }

    return teamValid && yearValid;
}

//function to fill the whole team name where it is needed
function teamConversion(team) {

    switch(team) {
        case "ATL":
            return "Atlanta Hawks";
        case'BOS':
            return "Boston Celtics";
        case 'BRK':
            return "Brooklyn Nets";
        case 'CHI':
            return "Chicago Bulls";
        case 'CLE':
            return "Cleveland Cavaliers";
        case 'DAL':
            return "Dallas Mavericks";
        case 'DEN':
            return "Denver Nuggets";
        case 'GSW':
            return "Golden State Warriors";
        case 'HOU':
            return "Houston Rockets";
        case 'IND':
            return "Indiana Pacers";
        case 'LAC':
            return "Los Angeles Clippers";
        case 'LAL':
            return "Los Angeles Lakers";
        case 'MEM':
            return "Memphis Grizzlies";
        case 'MIA':
            return "Miami Heat";
        case 'OKC':
            return "Oklahoma City Thunder";
        case 'ORL':
            return "Orlando Magic";
        case 'PHO':
            return "Phoenix Suns";
        case 'POR':
            return "Portland Trailblazers";
        case 'SAS':
            return "San Antonio Spurs";
        case 'TOR':
            return "Toronto Raptors";
    }
}

//function to fill the whole team name where it is needed
function playoffConversion(playoffRank) {

    switch(playoffRank) {
        case "5":
            return "Won NBA Finals";
        case "4":
            return "Lost NBA Finals";
        case "3":
            return "Lost Conference Finals";
        case "2":
            return "Lost Conference Semifinals";
        case "1":
            return "Lost First Round";

    }
}

function efgConversion(efg) {

    var percent = parseFloat(efg).toFixed(4);

    percent = (percent * 100).toFixed(1);

    return percent.toString() + "%";
}

//drawScatter("Assists", "Turnover Percentage", ".scatter-plot", 600, 600);

//Playoff Rank Scatters

function drawAllScatter(width, height, teamArray, yearArray) {

    drawScatter("EFG",                  "Playoff Rank",        ".EFG-PR",   width, height, teamArray, yearArray);
    drawScatter("Assists",              "Playoff Rank",        ".AST-PR",   width, height, teamArray, yearArray);
    drawScatter("Turnover Percentage",  "Playoff Rank",        ".TO-PR",    width, height, teamArray, yearArray);

//EFG Scatters, allTeams

    drawScatter("Playoff Rank",         "EFG",                 ".PR-EFG",   width, height, teamArray, yearArray);
    drawScatter("Assists",              "EFG",                 ".AST-EFG",  width, height, teamArray, yearArray);
    drawScatter("Turnover Percentage",  "EFG",                 ".TO-EFG",   width, height, teamArray, yearArray);

//AST Scatters, allTeams

    drawScatter("Playoff Rank",         "Assists",             ".PR-AST",   width, height, teamArray, yearArray);
    drawScatter("EFG",                  "Assists",             ".EFG-AST",  width, height, teamArray, yearArray);
    drawScatter("Turnover Percentage",  "Assists",             ".TO-AST",   width, height, teamArray, yearArray);

//TO ScattersTO, allTeams

    drawScatter("Playoff Rank",         "Turnover Percentage", ".PR-TO",    width, height, teamArray, yearArray);
    drawScatter("EFG",                  "Turnover Percentage", ".EFG-TO",   width, height, teamArray, yearArray);
    drawScatter("Assists",              "Turnover Percentage", ".AST-TO",   width, height, teamArray, yearArray);

}

drawAllScatter(200, 200, allTeams, allYears);