var teamList = document.getElementById('teamList');
var teams = document.getElementById('teams');

teamList.getElementsByClassName('anchor')[0].onclick = function (evt) {
    if (teams.classList.contains('visible')){
        teams.classList.remove('visible');
        teams.style.display = "none";
    }

    else{
        teams.classList.add('visible');
        teams.style.display = "block";
    }


};

teams.onblur = function(evt) {
    teams.classList.remove('visible');
};

var yearList = document.getElementById('yearList');
var years = document.getElementById('years');

yearList.getElementsByClassName('anchor')[0].onclick = function (evt) {
    if (years.classList.contains('visible')){
        years.classList.remove('visible');
        years.style.display = "none";
    }

    else{
        years.classList.add('visible');
        years.style.display = "block";
    }


};

teams.onblur = function(evt) {
    teams.classList.remove('visible');
};