// Copyright (c) 2012, HIT Scouting Nederland

function init() {
	extend();
	verwerkDeelnemerAantallen();
	var plaatsParam = $.getUrlVar('plaats');
	if (!plaatsParam) {
		maakAllePlaatsen();
	} else {
		maakEnkelePlaats(plaatsParam);
	}	
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
/**
 * Past de naam aan op de manier waarop Joomla dat ook gedaan heeft.
 * @param naam De naam van het kamp.
 * @returns de gestripte naam waarmee de directe url gevormd is.
 */
function urlified(naam) {
	return naam
		.replace(/ - /g, "-")
		.replace(/ /g, "-")
		.replace(/°/g, "d")
		.replace(/º/g, "o")
		.replace(/&/g, "a")
		.toLowerCase()
		.replace(/[^a-z0-9\-]/g, "")
		.replace(/-+/g, "-")
		;
}

/**
 * http://jquery-howto.blogspot.com/2009/09/get-url-parameters-values-with-jquery.html
 */
function extend() {
	$.extend({
		getUrlVars: function() {
			var vars = [], hash;
			var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
			for(var i = 0; i < hashes.length; i++) {
				hash = hashes[i].split('=');
				vars.push(hash[0]);
				vars[hash[0]] = hash[1];
			}
			return vars;
		},
		getUrlVar: function(name) {
			return $.getUrlVars()[name];
		}
	});
}

function verwerkDeelnemerAantallen() {
	if (window.inschrijvingen) {
		$.each(hit.hitPlaatsen, function(p, plaats) {
			$.each(plaats.kampen, function(k, kamp) {
				$.each(inschrijvingen.kampen, function(i, inschrijving) {
					if (kamp.shantiformuliernummer == inschrijving.formuliernummer) {
						kamp.gereserveerd = inschrijving.gereserveerd;
					}
				});				
			});
		});
	}
}
