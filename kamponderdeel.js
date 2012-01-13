// Copyright (c) 2012, HIT Scouting Nederland

$(init);

function init() {
	fixStupidBrowsers();
	extend();
	verwerkDeelnemerAantallen();
	
	var kampParam = $.getUrlVar('kamp');
	if (kampParam) {
		maakVolIndicatie(kampParam);
	}
}

function maakVolIndicatie(kampParam) {
	$.each(hit.hitPlaatsen, function(p, plaats) {
		$.each(plaats.kampen, function(k, kamp) {
	 		if (kampParam == kamp.shantiformuliernummer) {
	 			tekenIndicatie(kamp);
	 			return;
	 		}
		});			
	});
}

function tekenIndicatie(kamp) {
	$("#vol").empty();

	if (isVol(kamp)) {
		$("<img>")
		.attr({
			src: "https://hit.scouting.nl/images/iconen25pix/vol.gif",
			alt: "Dit kamp is vol!",
			title: "Dit kamp is vol!"
		})
		.appendTo($("#vol"));
	}
	$("<span>")
		.attr({title: laatstBijgewerktOp()})
		.text(fuzzyIndicatieVol(kamp))
		.appendTo($("#vol"));
}
