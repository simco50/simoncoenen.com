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
		document.getElementById("footer-content").style.bottom = "0px";
	} 
	else 
	{
		document.getElementById("navbar").style.top = "-100px";
		
		if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) 
		{
        	document.getElementById("footer-content").style.bottom = "0px";
		}
		else
		{
			document.getElementById("footer-content").style.bottom = "-50px";
		}
	}
	prevScrollPos = currentScrollPos;
};