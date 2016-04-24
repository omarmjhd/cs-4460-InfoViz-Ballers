var button = document.getElementById('button');
//console.log(button);

d3.select(button)
    .append('p')
    .append('button')
    .text('Filter Data')
    .on('click', function() {
        //alert("FILTER BUTTON CLICKED!");

        var years = [];
        $('#years input:checked').each(function() {
            years.push($(this).attr('value'));
        });

        var teams = [];
        $('#teams input:checked').each(function() {
            teams.push($(this).attr('value'));
        });



        //console.log("TEAMS");
        //console.log(teams);
        //console.log("YEARS");
        //console.log(years);
        console.log(teams);
        console.log(years);

        d3.selectAll("svg").remove();

        parallel(teams, years);
        drawAllScatter(200, 150, teams, years);

    });