// Copyright (c) 2012, HIT Scouting Nederland

$(init);

/**
 * Filtert/scoort met behulp van pictogrammen. 
 * @param color
 * @returns {IconFilter}
 */
function IconFilter(color) {
	this.color = color;
	this.list = new Array();
	this.contains = function (id) {
		return (this.list.indexOf(id) != -1);
	};
	this.add = function (id) {
		this.list.push(id);
		this.save();
	};
	this.remove = function (id) {
		if (this.contains(id)) {
			this.list.splice(this.list.indexOf(id), 1);
			this.save();
		}
	};
	this.load = function() {
		var unsplit = jaaulde.utils.cookies.get(this.color);
		if (unsplit == null) {
			this.list = new Array();
		} else {
			this.list = unsplit.split('|');
		}
		
	};
	this.save = function() {
		jaaulde.utils.cookies.set(this.color, this.list.join('|'));
	},
	this.clear = function() {
		this.list.length = 0;
		this.save();
	};
	this.isEmpty = function() {
		return this.list.length == 0;
	};
}


var filter = {
		// Leeftijd tijdens de HIT
		"peildatum" : null,
		"geboortedatum": null,
		// Deelnamekosten
		"budget": -1,
		// Icoontjes die positief meetellen
		"groen": new IconFilter('groen'),
		// Icoontjes die negatief meetellen
		"rood": new IconFilter('rood'),

		loadFilters: function() {
			this.groen.load();
			this.rood.load();
		},
		clearFilters: function() {
			this.groen.clear();
			this.rood.clear();
		},
		isGroen: function(id) {
			return this.groen.contains(id);
		},
		isRood: function(id) {
			return this.rood.contains(id);
		},
		naarRood: function(id) {
			this.groen.remove(id);
			this.rood.add(id);
		},
		naarGroen: function(id) {
			this.groen.add(id);
			this.rood.remove(id);
		},
		naarZwart: function(id) {
			this.groen.remove(id);
			this.rood.remove(id);
		},

		bepaalScore: function (kamp) {
			var score = 0.0;
			if (this.filterLeeftijd(kamp) && this.filterBudget(kamp) && this.filterVol(kamp)) {
				if (this.budget != -1) {
					var afstandTotMaxBudget = this.budget - kamp.deelnamekosten;
					var factor = afstandTotMaxBudget / this.budget;
					var invFactor = 1.0 - factor;
					score += invFactor * 2;
				}
				
				for (var idx = 0; idx < kamp.iconen.length; idx++) {
						if (!this.groen.isEmpty()) {
						$.each(this.groen.list, function(j, gfl) {
							if (kamp.iconen[idx].bestandsnaam == gfl) {
								score += 2.0; // elke groene icoon levert 2 punten op
							}
						});
					}
					if (!this.rood.isEmpty()) {
						$.each(this.rood.list, function(j, rfl) {
							if (kamp.iconen[idx].bestandsnaam == rfl) {
								score -= 2.0; // elke rode icoon kost 2 punten
								if (score < 0) {
									score = 0; // maar nooit minder dan 0
								}
							}
						});
					}
				}
			} else {
				score = -1;
			}
			return score;
		},
		leeftijdOpPeildatum: function() {
			var leeftijdInJaren = -1;
			var leeftijdInDagen = this.leeftijdOpPeilDatumInDagen();
			if (leeftijdInDagen != -1) {
				leeftijdInJaren = Math.floor(leeftijdInDagen / 365.25); // in jaren
			}
			return leeftijdInJaren;
		},
		leeftijdOpPeilDatumInDagen: function() {
			var leeftijdInDagen = -1;
			if (this.geboortedatum != null) {
				var verschil = this.peildatum.getTime() - this.geboortedatum.getTime(); // in millis
				leeftijdInDagen = Math.ceil(verschil / (1000 * 60 * 60 * 24)); // in dagen
			}
			return leeftijdInDagen;			
		},
		filterLeeftijd: function (kamp) {
			var geborenNa = createDate(
					this.peildatum.getFullYear() - kamp.maximumLeeftijd - 1, // -1; want hele jaar telt mee 
					this.peildatum.getMonth() + 1, // 0-based
					this.peildatum.getDate() - 90);
			var geborenVoor = createDate(
					this.peildatum.getFullYear() - kamp.minimumLeeftijd, 
					this.peildatum.getMonth() + 1, // 0-based 
					this.peildatum.getDate() + 90);
			return this.geboortedatum == null || this.geboortedatum >= geborenNa && this.geboortedatum <= geborenVoor;
		},
		filterBudget: function (kamp) {
			return this.budget == -1 || kamp.deelnamekosten <= this.budget;
		},
		filterVol: function (kamp) { // het is ok als...
			return kamp.gereserveerd < kamp.maximumAantalDeelnemers;
		}
};

function init() {
	fixStupidBrowsers();
	verwerkDeelnemerAantallen();
	initVelden();
	repaint();
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

function initVelden() {

	// Geboortedag
	for (var i = 1; i < 32; i++) {
		$("<option>")
			.attr("value", i)
			.text(i)
			.appendTo("#geboortedag");
	}
	
	// Geboortemaand
	$.each(['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
			, function(i, maand) {
				$("<option>")
					.attr("value", i+1)
					.text(maand)
					.appendTo("#geboortemaand");
 			}
	);
 	// Geboortejaar; afhankelijk van minimum- en maximumleeftijd.
	var minMax = minMaxJaar();
 	for (var i = minMax.min; i >= minMax.max; i--) {
		$("<option>")
			.attr("value", i)
			.text(i)
			.appendTo("#geboortejaar");
	}
 	
 	// prijzen
 	var prijzen = new Array();
 	$.each(hit.hitPlaatsen, function(i, plaats) {
		 	$.each(plaats.kampen, function(j, kamp) {
		 		var found = false;
	 		 	$.each(prijzen, function(k, prijs) {
		 			found = found || (prijs == kamp.deelnamekosten);
		 		});
		 		if (!found){
		 			prijzen.push(kamp.deelnamekosten);
		 		}
			});
    });
 	
	prijzen.sort(function(a,b){return a - b;}); // sorteer numeriek	 	
 	$.each(prijzen, function(i, prijs) {
 		$("<option>")
			.attr("value", prijs)
			.text(prijs)
			.appendTo("#budget");
	});
	
	$.each(hit.hitPlaatsen, function(i, plaats) {
		$.each(plaats.kampen, function(j, kamp) {
			kamp.score = 0;
			kamp.plaats = plaats.naam;
		});
	});
	
	$('.cookiestore').cookieBind();
	filter.peildatum = parseDate(hit.vrijdag);
	updateGeboorteDatum();
	updateBudget();
	filter.loadFilters();
	toonKampenMetFilter();
}


function repaint() {
	toonKampenMetFilter();
	filterPictogrammen();
}

function toonKampenMetFilter() {
	// kieper huidige lijst leeg
	$('#kampen').empty();

	// verzamel kampen met score >= 0
	var kampen = new Array();
    $.each(hit.hitPlaatsen, function(i, plaats) {
		 	$.each(plaats.kampen, function(j, kamp) {
		 		kamp.score = filter.bepaalScore(kamp);
		 		if (kamp.score >= 0) {
					kampen.push(kamp);
				}
		});
    });

	$("#count").text(kampen.length);
	
	if (kampen.length > 0) {
		$("<ul>").attr("id", "kampList").appendTo("#kampen");

		// sorteren op score		
	    kampen.sort(function(a, b) { return b.score - a.score; });
		// overgebleven kampen tonen
	    $.each(kampen, function(i, kamp) {
			var li = $("<li>");
			$("<a>")
			  	.text(kamp.naam + " in " + kamp.plaats)
			  	.attr({
			  		title: "leeftijd: " + kamp.minimumLeeftijd + "-" + kamp.maximumLeeftijd 
			  			 + ", prijs € " + kamp.deelnamekosten,
			  		href: "https://hit.scouting.nl/hits-in-" + kamp.plaats.toLowerCase() + "/" + urlified(kamp.naam) })
			  	.appendTo(li);
			$("<span>")
				.text("[" + (Math.round(10*kamp.score)/10) + "]")
				.attr({title: "score", 'class': "score"})
				.appendTo(li);
			li.appendTo("#kampList");
	    });
	} else {
		$("<p>").text("Helaas, geen activiteiten gevonden!").appendTo("#kampen");
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
 * Teken de pictogrammen opnieuw en filter op basis van getoonde kampen.
 */
function filterPictogrammen() {
	// Maak pictogrammen op scherm leeg.
	$("#pictos").empty();
	
	// Verzamel de gewenste set iconen.
	var gebruikteIconen = new Array();
	$.each(hit.hitPlaatsen, function(i, plaats) {
		$.each(plaats.kampen, function(j, kamp) {
			if (kamp.score >= 0) {
				// Kijk voor elk kamp met voldoende score of zijn icoontjes al in de gewenste set zit
				$.each(kamp.iconen, function(k, kampIcoon) {
					var found = false;
					$.each(gebruikteIconen, function(l, verzameldIcoon) {
						found = found || (kampIcoon.bestandsnaam == verzameldIcoon.bestandsnaam);
					});						
					if (!found) {
						gebruikteIconen.push(kampIcoon);
					}
				});
			}
		});
	});
	
	// Sorteer op basis van de vaste icoon-volgorde.
	gebruikteIconen.sort(function (a,b) { return a.volgorde - b.volgorde; });
	
	// Druk iconen af.
	$.each(gebruikteIconen, function(i, icoon) {
		var borderColor = filter.isGroen(icoon.bestandsnaam) ? "green"
				: filter.isRood(icoon.bestandsnaam)	? "red"
				: "black";
	 	$("<img>")
			.attr({
				id: icoon.bestandsnaam,
				onclick: "selectIcoonEvent('" + icoon.bestandsnaam + "')",
				src: "https://hit.scouting.nl/images/iconen40pix/" + icoon.bestandsnaam+".gif",
				border: 3,
				alt: icoon.tekst,
				title: icoon.tekst,
				style: "border-color: " + borderColor 
			})
			.appendTo("#pictos");
	});
}


/**
 * Als de geboortedatum aangepast wordt.
 */
function updateGeboorteDatumEvent() {
	updateGeboorteDatum();
	filter.clearFilters();
	repaint();
}

function updateGeboorteDatum() {
	if (validateGeboortedatumForm()) {
		filter.geboortedatum = createDate($('#geboortejaar').val(), $('#geboortemaand').val(), $('#geboortedag').val());
		var leeftijd = filter.leeftijdOpPeildatum();

		$("#leeftijd").text(", dan is je leeftijd tijdens de HIT " + leeftijd + " jaar.");
	} else {
		$("#leeftijd").text('');
		filter.geboortedatum = null;
	}
}

function validateGeboortedatumForm() {
	return !($('#geboortedag').val() == '' || $('#geboortemaand').val() == '' || $('#geboortejaar').val() == '');
}

/**
 * Als het budget aangepast wordt.
 */
function updateBudgetEvent() {
	updateBudget();
	filter.clearFilters();
	repaint();
}

function updateBudget() {
	filter.budget = $('#budget').val();
}

/**
 * Als er op een icoontje geklikt wordt.
 */
function selectIcoonEvent(cellId) {
	var cell = document.getElementById(cellId);
	var style = cell.style;
	if (style.borderColor == 'green') {
		// groen -- rood
		style.borderColor = 'red';
		filter.naarRood(cellId);
	} else if (style.borderColor == 'red') {
		// rood -- zwart
		style.borderColor = 'black';
		filter.naarZwart(cellId);
	} else {
		// zwart -- groen
		style.borderColor = 'green';
		filter.naarGroen(cellId);
	}
	toonKampenMetFilter();
}


function minMaxJaar() {
	var min = 100;
	var max = 0;

  	$.each(hit.hitPlaatsen, function(i, plaats) {
	 	$.each(plaats.kampen, function(j, kamp) {
	 		min = Math.min(min, kamp.minimumLeeftijd);
	 		max = Math.max(max, kamp.maximumLeeftijd);
		 });
	});

 	var hitjaar = parseDate(hit.vrijdag).getFullYear();
	return {min: hitjaar - min, max: hitjaar - max};
}

function createDate(year, month, day) {
	var result = new Date();
	result.setYear(year);
	result.setMonth(month - 1);
	result.setDate(day);
	return result;
}

/** yyyy-mm-dd */
function parseDate(s) {
	return createDate(s.substring(0,4), s.substring(5, 7), s.substring(8,10));
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
