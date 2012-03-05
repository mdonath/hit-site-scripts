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
				appendPlaatsHeaderRowTo($("#geld"));
			}
			$.each(plaats.kampen, function(k, kamp) {
				if (kampParam == null || kampParam == kamp.shantiformuliernummer) {
					appendKampRowTo($("#geld"), kamp, plaats);
					if (kampParam != null) {
						return;
					}
				}
			});
			if (kampParam == null) {
				appendPlaatsFooterRowTo($("#geld"), plaats);
			}
		}
	});
	if (kampParam == null && plaatsParam == null) {
		appendHitFooterRowTo($("#geld"));
	}
}

function appendPlaatsHeaderRowTo(table) {
	var row = $("<tr>").appendTo(table);
	$("<th>")
		.text("Plaats")
		.appendTo(row);
	$("<th>")
		.text("Kamp")
		.appendTo(row);
	$("<th>")
		.text("Prijs")
		.appendTo(row);
	$("<th>")
		.text("#dln")
		.appendTo(row);
	$("<th>")
		.text("Omzet")
		.appendTo(row);
	tripletHeader("2011: -/-5%", row);
	tripletHeader("2012: -/-10%", row);
	tripletHeader("2013A: -/-20%", row);
	tripletHeader("2013B: -/-10%+€4,5", row);
}


function appendKampRowTo(table, kamp, plaats) {
	var row = $("<tr>").appendTo(table);

	$("<th>")
		.text(plaats.naam)
		.appendTo(row);
	$("<th>")
		.text(kamp.naam)
		.appendTo(row);
	$("<td>")
		.text(kamp.deelnamekosten)
		.appendTo(row);
	$("<td>")
		.text(kamp.aantalDeelnemers)
		.appendTo(row);
	
	var omzet = kamp.deelnamekosten * kamp.aantalDeelnemers;
	$("<td>")
		.text(omzet)
		.appendTo(row);
	tripletData(kamp.aantalDeelnemers, omzet, 0.95 * omzet, 0.95 * omzet, row, "y2011");
	tripletData(kamp.aantalDeelnemers, omzet, 0.9 * omzet, 0.95 * omzet, row, "y2012");
	tripletData(kamp.aantalDeelnemers, omzet, 0.8 * omzet, 0.90 * omzet, row, "y2013a");
	tripletData(kamp.aantalDeelnemers, omzet, (0.9 * omzet) - (4.5 * kamp.aantalDeelnemers), 0.8 * omzet, row, "y2013b");
}

function tripletHeader(text, row) {
	$("<th>")
		.text(text)
		.appendTo(row);
	$("<th>")
		.text("budget p.p.")
		.appendTo(row);
	$("<th>")
		.text("onv./cal. kamp")
		.appendTo(row);
	$("<th>")
		.text("onv./cal p.p.")
		.appendTo(row);
	$("<th>")
		.text("delta tov vorige regeling")
		.appendTo(row);
}

function tripletData(aantalDeelnemers, vergelijk, bedrag, vorige, row, clazz) {
	$("<td>")
		.text(EUR(bedrag))
		.addClass(clazz)
		.appendTo(row);
	$("<td>")
		.text(EUR(bedrag / aantalDeelnemers))
		.addClass(clazz)
		.appendTo(row);
	$("<td>")
		.text(EUR(vergelijk - bedrag))
		.addClass(clazz)
		.appendTo(row);
	$("<td>")
		.text(EUR((vergelijk - bedrag)/aantalDeelnemers))
		.addClass(clazz)
		.appendTo(row);
	$("<td>")
		.text(EUR(bedrag - vorige))
		.addClass(clazz)
		.appendTo(row);
}

function appendPlaatsFooterRowTo(table, plaats) {
	var totaalAantalDeelnemers = 0;
	var totaalOmzet = 0;
	var gemiddeldePrijs = 0;
	var aantalKampen = 0;

	$.each(plaats.kampen, function(k, kamp) {
		totaalAantalDeelnemers += kamp.aantalDeelnemers;
		totaalOmzet += kamp.aantalDeelnemers * kamp.deelnamekosten;
		gemiddeldePrijs += kamp.deelnamekosten;
		aantalKampen++;
	});
	gemiddeldePrijs = gemiddeldePrijs / aantalKampen;
	
	var row = $("<tr>").appendTo(table);
	$("<th>")
		.text(plaats.naam)
		.appendTo(row);
	$("<th>")
		.text("TOTAAL")
		.appendTo(row);
	$("<td>")
		.text(EUR(gemiddeldePrijs))
		.appendTo(row);
	$("<td>")
		.text(totaalAantalDeelnemers)
		.appendTo(row);
	$("<td>")
		.text("€" + totaalOmzet)
		.appendTo(row);
	tripletData(totaalAantalDeelnemers, totaalOmzet, 0.95 * totaalOmzet, 0.95 * totaalOmzet, row);
	tripletData(totaalAantalDeelnemers, totaalOmzet, 0.9 * totaalOmzet, 0.95 * totaalOmzet, row);
	tripletData(totaalAantalDeelnemers, totaalOmzet, 0.8 * totaalOmzet, 0.9 * totaalOmzet, row);
	tripletData(totaalAantalDeelnemers, totaalOmzet, (0.9 * totaalOmzet) - (4.5 * totaalAantalDeelnemers), 0.8 * totaalOmzet, row);

}

function EUR(bedrag) {
	return Math.floor(100 * bedrag) / 100;
}

function appendHitFooterRowTo(table) {
	appendPlaatsHeaderRowTo(table);

	var totaalAantalDeelnemers = 0;
	var totaalOmzet = 0;
	var gemiddeldePrijs = 0;
	var aantalKampen = 0;
	$.each(hit.hitPlaatsen, function(p, plaats) {
		$.each(plaats.kampen, function(k, kamp) {
			totaalAantalDeelnemers += kamp.aantalDeelnemers;
			totaalOmzet += kamp.aantalDeelnemers * kamp.deelnamekosten;
			gemiddeldePrijs += kamp.deelnamekosten;
			aantalKampen++;
		});
	});
	gemiddeldePrijs = gemiddeldePrijs / aantalKampen;

	var row = $("<tr>").appendTo(table);
	$("<th>")
		.text("HIT")
		.appendTo(row);
	$("<th>")
		.text("TOTAAL")
		.appendTo(row);
	$("<td>")
		.text(EUR(gemiddeldePrijs))
		.appendTo(row);
	$("<td>")
		.text(totaalAantalDeelnemers)
		.appendTo(row);
	$("<td>")
		.text("€" + totaalOmzet)
		.appendTo(row);
	tripletData(totaalAantalDeelnemers, totaalOmzet, 0.95 * totaalOmzet, 0.95 * totaalOmzet, row);
	tripletData(totaalAantalDeelnemers, totaalOmzet, 0.9 * totaalOmzet, 0.95 * totaalOmzet, row);
	tripletData(totaalAantalDeelnemers, totaalOmzet, 0.8 * totaalOmzet, 0.90 * totaalOmzet, row);
	tripletData(totaalAantalDeelnemers, totaalOmzet, (0.9 * totaalOmzet) - (4.5 * totaalAantalDeelnemers), 0.8 * totaalOmzet, row);
}

function appendLaatstBijgewerkt() {
	var tbl = $("#geld");
	var tfoot = $("<tfoot>");
	var row = $("<tr>");

	$("<th>")
		.attr({colspan: 2})
		.text(laatstBijgewerktOp())
		.appendTo(row);
	row.appendTo(tfoot);
	tfoot.appendTo(tbl);
}
