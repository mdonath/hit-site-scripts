// Copyright (c) 2012, HIT Scouting Nederland

/**
 * Werkt het datamodel bij met de huidige stand van zaken mbt de inschrijving.
 */
function verwerkDeelnemerAantallen() {
	if (window.inschrijvingen) {
		$.each(hit.hitPlaatsen, function(p, plaats) {
			$.each(plaats.kampen, function(k, kamp) {
				$.each(inschrijvingen.kampen, function(i, inschrijving) {
					if (inschrijving != null && kamp.shantiformuliernummer == inschrijving.formuliernummer) {
						kamp.gereserveerd = inschrijving.gereserveerd;
						kamp.aantalDeelnemers = inschrijving.aantalDeelnemers;
						kamp.maximumAantalDeelnemers = inschrijving.maximumAantalDeelnemers;
					}
				});				
			});
		});
	}
}

/**
 * Geeft een tekst terug waaraan af te lezen is wanneer de gegevens voor het laatst zijn bijgewerkt.
 * @returns {String}
 */
function laatstBijgewerktOp() {
	if (window.inschrijvingen) {
		return "Laatst bijgewerkt op: " + toDateTime(parseDateTime(inschrijvingen.timestamp));
	}
	return "";
}

/**
 * Hoe vol is een kamp?
 * Er zijn 4 mogelijkheden: voldoende plaatsen, bijna vol, alleen nog gereserveerde plaatsen, proppievol.
 * @param kamp
 * @return {String} Met een mooie tekst over hoe vol het kamp is.
 */
function fuzzyIndicatieVol(kamp) {
	var result;
	if (isVol(kamp)) {
		if (kamp.aantalDeelnemers < kamp.gereserveerd) {
			var eenAantal = kamp.gereserveerd - kamp.aantalDeelnemers;
			result = "Vol: alleen nog inschrijven op "+ eenAantal +" gereserveerde " + meervoudPlaats(eenAantal) + ".";
		} else {
			result = "Vol: inschrijven is niet meer mogelijk.";
		}
	} else {
		var watMaaktHetKampVol = Math.max(kamp.maximumAantalDeelnemers/10, kamp.subgroepsamenstellingMinimum);
		var over = kamp.maximumAantalDeelnemers - kamp.gereserveerd;
		if (watMaaktHetKampVol < over) {
			if (kamp.gereserveerd == 0) {
				result = "Nog ruim voldoende plaatsen beschikbaar.";
			} else {
				result = "Nog voldoende plaatsen beschikbaar.";
			}
		} else {
			result = "Bijna vol: Nog "+ over +" "+ meervoudPlaats(over) +" beschikbaar.";
		}
	}
	return result
	// + " ["+kamp.minimumAantalDeelnemers + " (" + kamp.aantalDeelnemers + " | " + kamp.gereserveerd + ") " + kamp.maximumAantalDeelnemers + "]";
	;
}

function meervoudPlaats(eenAantal) {
	return "plaats" + ((eenAantal!=1) ? "en" : "");
}

/**
 * Is een kamp vol?
 * 
 * @param kamp Het kamp.
 * @returns {Boolean} Of een kamp al volgereserveerd is.
 */
function isVol(kamp) {
	return kamp.gereserveerd >= kamp.maximumAantalDeelnemers;
}

/**
 * Past de naam aan op de manier waarop Joomla dat ook gedaan heeft.
 *
 * @param naam De naam van het kamp.
 * @returns {String} De gestripte naam waarmee de directe url gevormd is.
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
 * Geeft een datum met z'n tijd terug in leesbaar formaat.
 * @param datum De datum.
 * @returns {String}
 */
function toDateTime(datum) {
 	return datum.toLocaleDateString() + " " + datum.toLocaleTimeString();
}


/** 
 * Maakt een Date van een string in het formaat: "yyyy-mm-dd".
 * @param datum De datum.
 * @returns {Date}
 */
function parseDate(s) {
	return createDate(s.substring(0,4), s.substring(5,7), s.substring(8,10));
}

/**
 * Maakt een Date van een string.
 * 
 * @param s Een string met een datumtijd in het formaat "yyyy-mm-ddThh:mm:ss";
 * @returns {Date}
 */
function parseDateTime(s) {
	var regex = /([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]+):([0-9]+):([0-9]+)/;
	var match = regex.exec(s);
	return createDateTime(
			match[1], match[2], match[3],
			match[4], match[5], match[6]
	);
}

/**
 * Maakt een Date met tijd 0,0,0 van opgegeven parameters.
 * @param year
 * @param month
 * @param day
 * @returns {Date}
 */
function createDate(year, month, day) {
	return createDateTime(year, month, day, 0,0,0);
}

/**
 * Maakt een Date van opgegeven parameters.
 * @param year
 * @param month
 * @param day
 * @param hour
 * @param min
 * @param sec
 * @returns {Date}
 */
function createDateTime(year, month, day, hour, min, sec) {
	var result = new Date();
	result.setYear(year);
	result.setMonth(month - 1);
	result.setDate(day);
	result.setHours(hour, min, sec, 0);
	return result;
}


/**
 * Voegt methods toe om de parameters van de url van de pagina uit te vragen.
 * 
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

/**
 * Grrr, ontbrekende functies toevoegen.
 */
function fixStupidBrowsers() {
	// div-jes aan en uit zetten
	$(".ifNoJavascriptAvailable").css("display", "none");
	$(".ifJavascriptAvailable").css("display", "block");
	$("SPAN.ifJavascriptAvailable").css("display", "inline");
	
	// Array.indexOf
	if (!Array.indexOf) {
		Array.prototype.indexOf = function (obj, start) {
			for (var i = (start || 0); i < this.length; i++) {
				if (this[i] == obj) {
					return i;
				}
			}
			return -1;
		};
	}
}