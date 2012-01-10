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
	}
	var procentVol = Math.round(100 * kamp.gereserveerd / kamp.maximumAantalDeelnemers);
	var tekst = "Dit kamp is " + procentVol + "% vol."
		+ " Gereserveerd: " + kamp.gereserveerd + " pers."
		+ " Maximum: " + kamp.maximumAantalDeelnemers + " pers."
		;
	$("<span>")
		.text(tekst)
		.appendTo($("#vol"));
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