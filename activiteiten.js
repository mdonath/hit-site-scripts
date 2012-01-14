// Copyright (c) 2012, HIT Scouting Nederland

$(init);

function init() {
	fixStupidBrowsers();
	extend();
	verwerkDeelnemerAantallen();
	
	var plaatsParam = $.getUrlVar('plaats');
	if (!plaatsParam) {
		maakAllePlaatsen();
	} else {
		maakEnkelePlaats(plaatsParam);
	}
	maakUpdateFooter(plaatsParam);
}

function maakAllePlaatsen() {
	$(".headerAlgemeen").css("display", "block");
	$.each(hit.hitPlaatsen, function(i, plaats) {
		maakAlgemeenPlaatsHeader(plaats, $("<thead>").appendTo("#overzicht"));
		maakKampen(plaats);
	});
}

function maakEnkelePlaats(plaatsParam) {
	var found = false;
	$.each(hit.hitPlaatsen, function(i, plaats) {
		if (plaats.naam.toLowerCase() == plaatsParam.toLowerCase()) {
			$(".headerPlaats").css("display", "block");
			$(".plaats").text(plaats.naam); // vul plaatsnaam in
			maakEnkelePlaatsHeader();
			maakKampen(plaats);
			found = true;
		}
	});
	// fallback als de parameter niet klopt
	if (!found) {
		maakAllePlaatsen();
	}
}

function maakAlgemeenPlaatsHeader(plaats, parentElement) {
	var tr = $("<tr>");
	 $("<a>")
	  	.text(plaats.naam)
	  	.attr({ href: "/hits-in-" + plaats.naam.toLowerCase() })
	  	.appendTo($("<th>").attr("class", "kolom1").appendTo(tr));
	$("<th>").text("Leeftijd").attr("class", "kolom2").appendTo(tr);
	$("<th>").text("Groep").attr("class", "kolom3").appendTo(tr);
	$("<th>").attr("class", "kolom4").appendTo(tr);
	tr.appendTo(parentElement);
}

function maakEnkelePlaatsHeader() {
	var tr = $("<tr>").appendTo($("<thead>").appendTo("#overzicht"));
	$("<th>").attr("class", "kolom1").appendTo(tr);
	$("<th>").text("Leeftijd").attr("class", "kolom2").appendTo(tr);
	$("<th>").text("Groep").attr("class", "kolom3").appendTo(tr);
	$("<th>").attr("class", "kolom4").appendTo(tr);
}

function maakUpdateFooter(plaats) {
	var totalen = berekenTotaalInschrijvingen(plaats);
	var statistiek = "";
	if (totalen.aantalDeelnemers > 100) {
		statistiek = ", ingeschreven: " + totalen.aantalDeelnemers + ", gereserveerd: " + totalen.gereserveerd + ".";
		//statistiek += " min: " + totalen.minimumCapaciteit + ", max: " + totalen.maximumCapaciteit + ".";
	}
	$("<th>")
	 	.text(laatstBijgewerktOp() + statistiek)
		.attr("colspan", "4")
		.appendTo(
				$("<tr>").appendTo($("<tfoot>").appendTo("#overzicht"))
		);
}

function berekenTotaalInschrijvingen(alleenDezePlaats) {
	var gereserveerd = 0;
	var aantalDeelnemers = 0;
	var minimumCapaciteit = 0;
	var maximumCapaciteit = 0;
	$.each(hit.hitPlaatsen, function(i, plaats) {
		if (!alleenDezePlaats || alleenDezePlaats.toLowerCase() == plaats.naam.toLowerCase()) {
			$.each(plaats.kampen, function(j, kamp) {
				gereserveerd += kamp.gereserveerd;
				aantalDeelnemers += kamp.aantalDeelnemers;
				minimumCapaciteit += kamp.minimumAantalDeelnemers;
				maximumCapaciteit += kamp.maximumAantalDeelnemers;
			});
		}
	});
	return {
		'aantalDeelnemers': aantalDeelnemers,
		'gereserveerd': gereserveerd,
		'minimumCapaciteit': minimumCapaciteit,
		'maximumCapaciteit': maximumCapaciteit
		};
}

function maakKampen(plaats) {
	var tbody = $("<tbody>").appendTo("#overzicht");
 	$.each(plaats.kampen, function(j, kamp) {
 		maakKampOnderdeel(plaats, kamp, tbody);
	});
}

function maakKampOnderdeel(plaats, kamp, parentElement) {
	var tr = $("<tr>");
	var th = $("<td>").attr("class", "kolom1").appendTo(tr);
	$("<a>")
	  	.text(kamp.naam)
	  	.attr({ 
	  		href: "/hits-in-" + plaats.naam.toLowerCase() + "/" + urlified(kamp.naam),
	  		title: fuzzyIndicatieVol(kamp)
	  	})
	  	.appendTo(th);
	$("<td>").text(kamp.minimumLeeftijd + " - " + kamp.maximumLeeftijd).attr("class", "kolom2").appendTo(tr);
	$("<td>").text(kamp.groep).attr("class", "kolom3").appendTo(tr);
	voegIcoontjesToe(kamp, $("<td>").attr("class", "kolom4").appendTo(tr));
	tr.appendTo(parentElement);
}

function voegIcoontjesToe(kamp, iconen) {
	if (isVol(kamp)) {
		$("<img>")
		.attr({
			src: "https://hit.scouting.nl/images/iconen25pix/vol.gif",
			alt: "Dit kamp is vol!",
			title: fuzzyIndicatieVol(kamp)
		})
		.appendTo(iconen);
	}
	$.each(kamp.iconen, function(i, icon) {
		$("<img>")
			.attr({
				src: "https://hit.scouting.nl/images/iconen25pix/" + icon.bestandsnaam + ".gif",
				alt: icon.tekst,
				title: icon.tekst
			})
			.appendTo(iconen);
	});

}
