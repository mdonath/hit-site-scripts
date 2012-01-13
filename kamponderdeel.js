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

	if (kamp.maximumAantalDeelnemers <= kamp.gereserveerd) {
		$("<img>")
		.attr({
			src: "https://hit.scouting.nl/images/iconen25pix/vol.gif",
			alt: "Dit kamp is vol!",
			title: "Dit kamp is vol!"
		})
		.appendTo($("#vol"));
		$("<span>")
			.text("Dit kamp is helemaal vol! Je kunt je alleen nog inschrijven op de gereserveerde plaatsen.")
			.appendTo($("#vol"));
	} else {
		var procentVol = Math.round(100 * kamp.gereserveerd / kamp.maximumAantalDeelnemers);
		var tekst = "Dit kamp is " + procentVol + "% vol."
			+ " Aantal gereserveerde plaatsen: " + kamp.gereserveerd + "."
			;
		$("<span>")
			.text(tekst)
			.appendTo($("#vol"));
	}
}

function verwerkDeelnemerAantallen() {
	if (window.inschrijvingen) {
		$.each(hit.hitPlaatsen, function(p, plaats) {
			$.each(plaats.kampen, function(k, kamp) {
				$.each(inschrijvingen.kampen, function(i, inschrijving) {
					if (inschrijving != null && kamp.shantiformuliernummer == inschrijving.formuliernummer) {
						kamp.gereserveerd = inschrijving.gereserveerd;
					}
				});				
			});
		});
	}
}
