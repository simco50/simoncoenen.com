// Dark theme switch
var isDarkTheme = localStorage.getItem('theme') != 'light';
var themeSwitch = $("#theme-switch");
themeSwitch[0].checked = isDarkTheme;

themeSwitch.click('change', function(event) { 
	var mode = event.currentTarget.checked ? 'dark' : 'light';
	document.documentElement.setAttribute('data-theme', mode);
	localStorage.setItem('theme', mode);
});

// Video hover
$(".video-overlay").hover(hoverVideo, hideVideo);

function hoverVideo(e) {
	var vid = $('video', this).get(0);
	try {
		vid.play();
	}
	catch(err) {
		console.log(err);
	}
}

function hideVideo(e) {
	var vid = $('video', this).get(0);
	try {
		vid.pause();
		vid.currentTime = 0;
	}
	catch(err) {
		console.log(err);
	}
}

// Hide navbar when scrolling down
var prevScrollPos = window.pageYOffset;
window.onscroll = function () {
	var currentScrollPos = window.pageYOffset;
	if (prevScrollPos > currentScrollPos) {
		document.getElementById("navbar").style.top = "0px";
	} 
	else 
	{
		document.getElementById("navbar").style.top = "-100px";
	}
	prevScrollPos = currentScrollPos;
};

//Table of content highlighting
$("#table-of-contents a").removeClass("current")
currentAnchor().addClass("current")

$(window).scroll(function() {
	$("#table-of-contents a").removeClass("current")
	currentAnchor().addClass("current")
})
  
function tocItem(anchor) {
return $("[href=\"" + anchor + "\"]")
}

function heading(anchor) {
return $("[id=" + anchor.substr(1) + "]")
}

function anchors() {
	if (!_anchors) {
		_anchors = $("#table-of-contents a").map(function() {
			return $(this).attr("href")
		})
	}
	return _anchors
}

var _anchors = null
function currentAnchor() {
	var winY = window.pageYOffset
	var currAnchor = null

	if (!_anchors) {
		_anchors = $("#table-of-contents a").map(function() {
			return $(this).attr("href")
		})
	}
	_anchors.each(function(index, value) {
		var y = heading(value).position().top
		if (y < winY) {
			currAnchor = value;
			return;
		}
	});
	if(currAnchor == null) {
		currAnchor = _anchors[0];
	}
	return tocItem(currAnchor)
}