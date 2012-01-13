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
					}
				});				
			});
		});
	}
}

/**
 * Past de naam aan op de manier waarop Joomla dat ook gedaan heeft.
 *
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
 * Geeft een datum met z'n tijd terug in leesbaar formaat.
 * @param datum De datum.
 * @returns {String}
 */
function toDateTime(datum) {
 	return datum.toLocaleDateString() + " " + datum.toLocaleTimeString();
}


/** 
 * Maakt een Date van een string in het formaat: "yyyy-mm-dd".
 * @param s
 * @returns
 */
function parseDate(s) {
	return createDate(s.substring(0,4), s.substring(5, 7), s.substring(8,10));
}

/**
 * Maakt een Date van een string in het formaat: "yyyy-mm-ddThh:mm:ss".
 * 
 * @param s
 * @returns
 */
function parseDateTime(s) {
	var regex = /([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})/;
	var match = regex.exec(s);
	return createDateTime(
			match[1], match[2], match[3],
			match[4], match[5], match[6]
	);
}


function createDate(year, month, day) {
	return createDateTime(year, month, day, 0,0,0);
}

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