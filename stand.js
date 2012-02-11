// Copyright (c) 2012, HIT Scouting Nederland

$(init);

function init() {
	fixStupidBrowsers();
	extend();
	verwerkDeelnemerAantallen();
	
	var kampParam = $.getUrlVar('kamp');
	var plaatsParam = $.getUrlVar('plaats');
	if (kampParam) {
		geefTussenstand(null, kampParam);
	} else if (plaatsParam) {
		geefTussenstand(plaatsParam, null);
		appendLaatstBijgewerkt();
	} else {
		geefTussenstand(null, null);
		appendLaatstBijgewerkt();
	}
}

function geefTussenstand(plaatsParam, kampParam) {
	$.each(hit.hitPlaatsen, function(p, plaats) {
		if (plaatsParam == null || plaatsParam.toLowerCase() == plaats.naam.toLowerCase()) {
			if (kampParam == null) {
				appendPlaatsHeaderRowTo($("#stand"), plaats);
			}
			$.each(plaats.kampen, function(k, kamp) {
				if (kampParam == null || kampParam == kamp.shantiformuliernummer) {
					appendKampRowTo($("#stand"), kamp);
					if (kampParam != null) {
						return;
					}
				}
			});
		}
	});
}

function appendPlaatsHeaderRowTo(table, plaats) {
	$("<a>")
		.text(plaats.naam)
		.attr({
	  		href: "?plaats=" + plaats.naam,
	  	})
	  	.appendTo(
	  			$("<h1>").appendTo(
	  					$("<th>").appendTo(
	  							$("<tr>").appendTo(table))));
}

function bepaalGevaarClass(kamp) {
	if (kamp.gereserveerd < kamp.minimumAantalDeelnemers) {
		return "gaatnietdoor";
	}
	if (kamp.aantalDeelnemers < kamp.minimumAantalDeelnemers) {
		return "misschiennietdoor";
	}
	return "";
}

function appendKampRowTo(table, kamp) {
	var kampRow = $("<tr>").appendTo(table);
	var addClass = bepaalGevaarClass(kamp);
	$("<a>")
		.text(kamp.naam + ": ")
		.attr({href: "?kamp=" + kamp.shantiformuliernummer})
		.addClass(addClass)
		.appendTo(
				$("<th>")
					.addClass("kampnaam")
					.appendTo(kampRow));

	var dataCell = $("<td>")
		.addClass("dataCell")
		.appendTo(kampRow);
	
	var minMax = $("<div>")
		.addClass("minMax")
		.appendTo(dataCell);
	$("<div>")
		.addClass("minimum")
		.css({"width": units(kamp.minimumAantalDeelnemers)})
		.text(kamp.minimumAantalDeelnemers)
		.attr({title: "Minimum aantal deelnemers: " + kamp.minimumAantalDeelnemers})
		.appendTo(minMax);
	$("<div>")
		.addClass("maximum")
		.css({"width": units(kamp.maximumAantalDeelnemers - kamp.minimumAantalDeelnemers)})
		.text(kamp.maximumAantalDeelnemers)
		.attr({title: "Maximum aantal deelnemers:" + kamp.maximumAantalDeelnemers})
		.appendTo(minMax);

	var actueel = $("<div>")
		.addClass("actueel")
		.appendTo(minMax);

	$("<div>")
		.addClass("ingeschreven")
		.css({"width": units(kamp.aantalDeelnemers)})
		.text(kamp.aantalDeelnemers)
		.attr({title: "Daadwerkelijk ingeschreven aantal deelnemers: " + kamp.aantalDeelnemers})
		.appendTo(actueel);
	if (kamp.gereserveerd > kamp.aantalDeelnemers) {
		var aantal = kamp.gereserveerd - kamp.aantalDeelnemers;
		$("<div>")
			.addClass("gereserveerd")
			.css({"width": units(aantal)})
			.text(aantal)
			.attr({title: "Gereserveerde plekken, maar nog niet ingeschreven: " + aantal})
			.appendTo(actueel);
	}

	if (kamp.gereserveerd < kamp.minimumAantalDeelnemers) {
		var totMinimum = kamp.minimumAantalDeelnemers - kamp.gereserveerd;
		$("<div>")
			.css({"width": units(totMinimum), "left": units(kamp.gereserveerd)})
			.text(totMinimum)
			.attr({title: "Aantal benodigde deelnemers om door te gaan: " + totMinimum})
			.addClass("nognodig")
			.appendTo(minMax);
	}

	if (kamp.gereserveerd < kamp.maximumAantalDeelnemers) {
		var aantal = kamp.maximumAantalDeelnemers - kamp.gereserveerd;
		$("<div>")
			.addClass("over")
			.css({"width": units(aantal)})
			.text(aantal)
			.attr({title: "Plaats die nog over is: " + aantal})
			.appendTo(actueel);
	}
}


function units(amount) {
	return (10 * amount) + "px";
}

function appendLaatstBijgewerkt() {
	var tbl = $("#stand");
	var tfoot = $("<tfoot>");
	var row = $("<tr>");

	$("<th>")
		.attr({colspan: 2})
		.text(laatstBijgewerktOp())
		.appendTo(row);
	row.appendTo(tfoot);
	tfoot.appendTo(tbl);
}
