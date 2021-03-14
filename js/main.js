$('.video-overlay').on({
	mouseenter: function () {
		$(this).find('video').get(0).pause();
		$(this).find('video').get(0).currentTime = 0;
		$(this).find('video').get(0).play();
	},
	mouseleave: function () {
		$(this).find('video').get(0).pause();
	}
});

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

$(document).ready(function() {
	$(window).scroll(function() {
	  $("#table-of-contents a").removeClass("current")
	  currentAnchor().addClass("current")
	})
  });
  
  function tocItem(anchor) {
	return $("[href=\"" + anchor + "\"]")
  }
  
  function heading(anchor) {
	return $("[id=" + anchor.substr(1) + "]")
  }
  
  var _anchors = null
  function anchors() {
	if (!_anchors) {
	  _anchors = $("#table-of-contents a").map(function() {
		return $(this).attr("href")
	  })
	}
	return _anchors
  }
  
  function currentAnchor() {
	var winY = window.pageYOffset
	var currAnchor = null
	anchors().each(function() {
	  var y = heading(this).position().top
	  if (y < winY + window.innerHeight * 0.1) {
		currAnchor = this
		return
	  }
	})
	return tocItem(currAnchor)
  }