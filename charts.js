function parallel(teamArray, yearArray) {
    var margin = {top: 30, right: 10, bottom: 10, left: 10},
        width = 960 - margin.left - margin.right,
        height = 550 - margin.top - margin.bottom;

    var x = d3.scale.ordinal().rangePoints([0, width], 1),
        y = {},
        dragging = {};
	var forScatter;

    var color = d3.scale.ordinal()
        .domain(['ATL', 'BOS', 'BRK', 'CHI', 'CLE', 'DAL', 'DEN', 'GSW', 'HOU', 'IND', 'LAC', 'LAL', 'MEM', 'MIA', 'OKC',
            'ORL', 'PHO', 'POR', 'SAS', 'TOR'])
        .range(['#E03A3E', '#008348', '#000000', '#CE1141', '#860038', '#007DC5', '#4FA8FF', '#006BB6', '#CE1141',
            '#FFC633', '#ED174C', '#552582', '#BBD1E4', '#98002E', '#F05133', '#007DC5', '#E56020', '#F0163A',
            '#B6BFBF', '#CE1141']);

    var line = d3.svg.line(),
        axis = d3.svg.axis().orient("left"),
        background,
        foreground;

    //console.log(d3.select(".parallel-coordinate"));

    var svg = d3.select(".parallel-coordinate").append("svg")
        .attr("width", width     + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    //console.log("SVG Parallel" + svg);

    d3.csv("Results.csv", function(error, results) {

        //console.log("Beginning chart for parallel");
        // Extract the list of dimensions and create a scale for each.
        x.domain(dimensions = d3.keys(results[0]).filter(function(d) {

            return d != "Year" && d != "Team" && (y[d] = d3.scale.linear()
                    .domain(d3.extent(results, function(p) { return +p[d]; }))
                    .range([height, 0]));
        }));

        // Add grey background lines for context.
        background = svg.append("g")
            .attr("class", "background")
            .selectAll("path")
            .data(results)
            .enter().append("path")
            .attr("d", path);

        // Add colored foreground lines for focus.
        foreground = svg.append("g")
            .attr("class", "foreground")
            .selectAll("path")
            .data(results)
            .enter().append("path")
            .filter(function(d) {
                return filterFunction(teamArray, yearArray, d["Team"], d["Year"]); }) //need to create an array that has strings of teams based on user dropdown selection
            .attr("d", path)
            .attr('stroke', function(d) { return color(d["Team"]); });

        // Add a group element for each dimension.
        var g = svg.selectAll(".dimension")
            .data(dimensions)
            .enter().append("g")
            .attr("class", "dimension")
            .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
            .call(d3.behavior.drag()
                .origin(function(d) { return {x: x(d)}; })
                .on("dragstart", function(d) {
                    dragging[d] = x(d);
                    background.attr("visibility", "hidden");
                })
                .on("drag", function(d) {
                    dragging[d] = Math.min(width, Math.max(0, d3.event.x));
                    foreground.attr("d", path);
                    dimensions.sort(function(a, b) { return position(a) - position(b); });
                    x.domain(dimensions);
                    g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
                })
                .on("dragend", function(d) {
                    delete dragging[d];
                    transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                    transition(foreground).attr("d", path);
                    background
                        .attr("d", path)
                        .transition()
                        .delay(500)
                        .duration(0)
                        .attr("visibility", null);
                }));

        // Add an axis and title.
        g.append("g")
            .attr("class", "axis")
            .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function(d) { return d; });

        // Add and store a brush for each axis.
        g.append("g")
            .attr("class", "brush")
            .each(function(d) {
                d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush).on("brushend", brushend));
            })
            .selectAll("rect")
            .attr("x", -8)
            .attr("width", 16);


        //console.log("Done chart for parallel");
    });

    function position(d) {
        var v = dragging[d];
        return v == null ? x(d) : v;
    }

    function transition(g) {
        return g.transition().duration(500);
    }

// Returns the path for a given data point.
    function path(d) {
        //console.log(d["Team"]);
        //console.log(d["Year"]);
        return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
    }

    function brushstart() {
        d3.event.sourceEvent.stopPropagation();
    }

// Handles a brush event, toggling the display of foreground lines.
    function brush() {
        var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); });
        //console.log("actives");
        //console.log(actives);
        var extents = actives.map(function(p) { return y[p].brush.extent(); });
        //console.log("extents");
        //console.log(extents);
        // extents gives range drawn by brush, actives shows which chart is being filtered on
        //need a filter function based on extents
        //both drawScatter and parallel take a team and year array, so a filtering function would need to filter 
        // all the data to get the correct teams and years

        //condition ? value-if-true : value-if-false
        //currently teamsBrush needs to be emptied before next brushing is done
        teamsBrush = [];
        yearsBrush = [];
		forScatter = [];
		for (var x = 0; x < actives.length; x++) {
			forScatter.push([]);
		}
        foreground.style("display", function(d) {
            return actives.every(
                function(p, i) {
					
                    if (extents[i][0] <= d[p] && d[p] <= extents[i][1]) {
						forScatter[i].push(d["Team"] + "," + d["Year"]);
                        teamsBrush.push(d["Team"]);
                        yearsBrush.push(d["Year"]);
						
                    }
                    return extents[i][0] <= d[p] && d[p] <= extents[i][1];

                }) ? null : "none";
        });
		
		//console.log(forScatter);
        //console.log("Teams");
        //console.log(teams);
        //console.log("Years");
        //console.log(years);

        //haves teams and years, now need to place the redraw functions somewhere they'll only be called once
        //console.log("BRUSHING END");
    }

    function brushend() {
		if (forScatter.length == 0) {
			//no filter
		} else if (forScatter.length == 1) {
			var teamsAndYears = split(forScatter[0]);
			d3.selectAll(".dot")
			.transition()
			.duration(1000)
			.attr('opacity', function(d) {
				for (var i = 0; i < forScatter[0].length; i++) {
					if (teamsAndYears[0][i] == d["Team"] && teamsAndYears[1][i] == d["Year"]) {
						return 1;
					}
				}
				return 0;
				});	
		} else if (forScatter.length < 0) {
			//please god no
		} else {
			var toDraw = forScatter[0];
			var updated = []
			for (var i = 1; i < forScatter.length; i++) {
				updated = []
				var currentTest = forScatter[i];
				for (var j = 0; j < toDraw.length; j++) {
					for (var k = 0; k < forScatter[i].length; k++) {
						if (toDraw[j] == currentTest[k]) {
							updated.push(toDraw[j]);
						}
					}
				}
				toDraw = updated;
				console.log(toDraw);
			}
			console.log(toDraw);
			var teamsAndYears = split(toDraw);
			d3.selectAll(".dot")
			.transition()
			.duration(1000)
			.attr('opacity', function(d) {
				for (var i = 0; i < toDraw.length; i++) {
					if (teamsAndYears[0][i] == d["Team"] && teamsAndYears[1][i] == d["Year"]) {
						return 1;
					}
				}
				return 0;
				});						
		}
    }
	
	//For || coords filtering - splits TEAM, YEAR into two arrays [TEAM] and [YEAR]
	function split(array) {
		var teams = [];
		var years = [];
		
		for (var i = 0; i < array.length; i++) {
			curr = "";
			for (var j = 0; j < array[i].length; j++) {
				if(array[i][j] == ",") {
					teams.push(curr);
					curr = "";
				} else {
					curr = curr + array[i][j];
				}
			}
			years.push(curr);
		}
		var output = [teams, years];
		console.log(output);
		return output;
	}

    function filterFunction(teamArray, yearArray, team, year) {

        teamValid = false;
        yearValid = false;

        for (var i = 0; i < teamArray.length; i++) {

            if (teamArray[i] === team) {
                teamValid = true;
            }
        }

        for (var i = 0; i < yearArray.length; i++) {

            if (yearArray[i] === year) {
                yearValid = true;

            }
        }

        return teamValid && yearValid;
    }

}

var brush_filter_teams = [[], [], [], []];
var brush_filter_years = [];

var allTeams = ['ATL', 'BOS', 'BRK', 'CHI', 'CLE', 'DAL', 'DEN', 'GSW', 'HOU', 'IND', 'LAC', 'LAL', 'MEM', 'MIA',
    'OKC', 'ORL', 'PHO', 'POR', 'SAS', 'TOR'];

var missingSA = ['ATL', 'BOS', 'BRK', 'CHI', 'CLE', 'DAL', 'DEN', 'GSW', 'HOU', 'IND', 'LAC', 'LAL', 'MEM', 'MIA',
    'OKC', 'ORL', 'POR', 'SAS', 'TOR'];

var redTeams = ['ATL', 'CHI', 'CLE', 'HOU', 'MIA', 'POR'];

var allYears = ['2015', '2014', '2013', '2012', '2011', '2010'];

parallel(allTeams, allYears);

var allTeams = ['ATL', 'BOS', 'BRK', 'CHI', 'CLE', 'DAL', 'DEN', 'GSW', 'HOU', 'IND', 'LAC', 'LAL', 'MEM', 'MIA',
    'OKC', 'ORL', 'PHO', 'POR', 'SAS', 'TOR'];

var allYears = ['2015', '2014', '2013', '2012', '2011', '2010'];

var missingSA = ['ATL', 'BOS', 'BRK', 'CHI', 'CLE', 'DAL', 'DEN', 'GSW', 'HOU', 'IND', 'LAC', 'LAL', 'MEM', 'MIA',
    'OKC', 'ORL', 'PHO', 'POR', 'TOR'];
	
var hold_filter = ["", "", false];

var RADIUS = 4;

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
            .attr("r", RADIUS)
            .attr("cx", xMap)
            .attr("cy", yMap)
            .style("fill", function(d) { return color(d["Team"]); })
            .on("mouseover", function(d) {
				hold_filter[0] = d["Year"]
				hold_filter[1] = d["Team"]
				hold_filter[2] = false;
				d3.select("#team-year-name")
                    .html("No Team Selected");

                d3.select("#pr")
                    .html("0");

                d3.select("#efg")
                    .html("0");

                d3.select("#to")
                    .html("0");

                d3.select("#ast")
                    .html("0");
				d3.select(".foreground").selectAll("path").transition()
					.duration(1000)
					.attr("stroke-opacity", function(e) {
                        if (d["Year"] == e["Year"] && d["Team"] == e["Team"]) {
							return 1
                        } else {
                            return 0;
                        }
                    });
					
                // TODO: show the tool tip
                tooltip.style("opacity", 1);
				

                // TODO: fill to the tool tip with the appropriate data
                tooltip.html(d["Year"] + " " + teamConversion(d["Team"]))
                    .style("left", d3.event.pageX + 5 + "px")
                    .style("top", d3.event.pageY + 5 + "px");

                // TODO: expand all nodes with the same team
                d3.selectAll(".dot").transition()
                    .duration(500)
                    .attr("r", function(e) {

                        if (d["Year"] == e["Year"] && d["Team"] == e["Team"]) {
                            return 2 * RADIUS;
                        } else {
                            return RADIUS;
                        }
                    });

            })
            .on("mouseout", function(d) {
			
				if (!(hold_filter[2])) {
					d3.select(".foreground").selectAll("path")
						.attr('stroke-opacity', 0)
						.attr('stroke', function(d) { return color(d["Team"]); })
						.transition()
						.duration(1000)
						.attr('stroke-opacity', 1);
				}
                // TODO: hide the tooltip
                tooltip.style("opacity", 0);

				if(!(hold_filter[2])) {
					d3.selectAll(".dot").transition()
						.duration(500)
						.attr("r", RADIUS);
				}


            })
            .on("click", function(d) {
				hold_filter[2] = true;
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
                            return 2 * RADIUS;
                        } else {
                            return RADIUS;
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
    //console.log(min);
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

    if (playoffRank == "5") {
        return "Won NBA Finals";
    } else if (playoffRank == "4") {
        return "Lost NBA Finals";
    } else if (playoffRank == "3") {
        return "Lost Conference Finals";
    } else if (playoffRank == "2") {
        return "Lost Conference Semifinals";
    } else {
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

drawAllScatter(200, 150, allTeams, allYears);