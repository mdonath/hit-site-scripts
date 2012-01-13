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
	maakUpdateFooter();
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

function maakUpdateFooter() {
	var laatstBijgewerkt = parseDateTime(inschrijvingen.timestamp);
	var tr = $("<tr>").appendTo($("<tfoot>").appendTo("#overzicht"));
	$("<th>")
	 	.text("Laatst bijgewerkt op: " + toDateTime(laatstBijgewerkt))
		.attr("colspan", "4")
		.appendTo(tr);
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
	  		title: "Inschrijvingen: " + kamp.gereserveerd + " / " + kamp.maximumAantalDeelnemers
	  	})
	  	.appendTo(th);
	$("<td>").text(kamp.minimumLeeftijd + " - " + kamp.maximumLeeftijd).attr("class", "kolom2").appendTo(tr);
	$("<td>").text(kamp.groep).attr("class", "kolom3").appendTo(tr);
	var iconen = $("<td>").attr("class", "kolom4").appendTo(tr);
	bepaalVol(kamp, iconen);
	$.each(kamp.iconen, function(i, icon) {
		$("<img>")
			.attr({
				src: "https://hit.scouting.nl/images/iconen25pix/" + icon.bestandsnaam + ".gif",
				alt: icon.tekst,
				title: icon.tekst
			})
			.appendTo(iconen);
	});
	tr.appendTo(parentElement);
}

function bepaalVol(kamp, iconen) {
	if (kamp.maximumAantalDeelnemers <= kamp.gereserveerd) {
		$("<img>")
		.attr({
			src: "https://hit.scouting.nl/images/iconen25pix/vol.gif",
			alt: "Dit kamp is vol!",
			title: "Dit kamp is vol!"
		})
		.appendTo(iconen);
	}
}
