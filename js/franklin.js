// Funciones mencionadas en el artículo
// "The 'Margin of Error' for Differences in Polls", de Charles Franklin
// https://abcnews.go.com/images/PollingUnit/MOEFranklin.pdf
// Idea de @gmonce implementada en JS por @infrahumano


function ci(p, variance){
	return {"lower": p - 1.96 * variance,
			"upper": p + 1.96 * variance};
}

function var_single(p, n){
	return Math.sqrt(p*(1-p)/n);
}

function ci_single(p, n){
	return ci(p, var_single(p, n));
}

function significative_test(interval){
	var lo = interval.lower;
		up = interval.upper;
	return lo * up > 0;
}

function test_diff_same_question(p1, p2, n){
	var variance = Math.sqrt((p1 + p2 - (p1 - p2) * (p1 - p2))/(n-1)),
		interval = ci(p1 - p2, variance),
		significative = significative_test(interval),
		output = {"difference": p1 - p2, "interval": interval, "significative": significative}
	if(!significative){
		var a = p1 + p2,
			b = p1 - p2,
			c = b * b,
			d = (a - c)/c;
		console.log(a, b, c, d, 1.96 * 1.96 * d);
		output['min_N'] = 1.96 * 1.96 * d + 1;
	}
	return output;
}

function test_diff_two_polls(p1, p2, n1, n2){
	var q1 = 1 - p1,
		q2 = 1 - p2,
		variance = Math.sqrt(p1 * q1 / n1 + p2 * q2 / n2),
		interval = ci(p1 - p2, variance),
		significative = significative_test(interval);
	return {"difference": p1 - p2, "interval": interval, "significative": significative};
}

d3.select("#selecciontests").on('change', show_test);

function show_test(){
	hide_forms();
    var v = this.value;
	console.log(v);
	if(v === "1"){
		d3.select(".unaencuesta").style("display", "inline-block")
	}
	if(v === "2"){
		d3.select(".dosencuestas").style("display", "inline-block")
	}
}

function hide_forms(){
	d3.selectAll(".forma").style("display", "none")
}

function calculate1(){
	console.log("Calculemos el primero!");
	var p1 = Number(d3.select("#aprob1").property("value"))
	var p2 = Number(d3.select("#aprob2").property("value"))
	var N = Number(d3.select("#aN").property("value"))
	var entries = [p1, p2, N];
	if(check_entries_numeric(entries)){
		if(is_a_prob(p1) && is_a_prob(p2)){
			if(is_a_large_integer(N)){
				var test = test_diff_same_question(p1, p2, N);
				show_results(test);
 			}
			else{
				show_warning("N debe ser un entero mayor que uno.")
			}
		}
		else{
			show_warning("Los valores deben ser entre cero y uno.")
		}
	}
	else{
		show_warning("¡No todas las entradas son numéricas!")
	}
}

function calculate2(){
	console.log("Calculemos el segundo!");
	var p1 = Number(d3.select("#bprob1").property("value"))
	var p2 = Number(d3.select("#bprob2").property("value"))
	var N1 = Number(d3.select("#bN1").property("value"))
	var N2 = Number(d3.select("#bN2").property("value"))
	console.log(p1, p2, N1, N2)
	var entries = [p1, p2, N1, N2];
	if(check_entries_numeric(entries)){
		if(is_a_prob(p1) && is_a_prob(p2)){
			if(is_a_large_integer(N1) && is_a_large_integer(N2)){
				var test = test_diff_two_polls(p1, p2, N1, N2);
				show_results(test);
			}
			else{
				show_warning("N debe ser un entero mayor que uno.")
			}
		}
		else{
			show_warning("Los valores deben ser entre cero y uno.")
		}
	}
	else{
		show_warning("¡No todas las entradas son numéricas!")
	}
}


function is_a_prob(p){
	return (0 <= p && p<= 1);
}

function is_a_large_integer(N){
	return (N === parseInt(N) && N > 1)
}

function check_entries_numeric(entries){
	for(var i=0; i< entries.length; i++){
		if(isNaN(entries[i])){
			return false;
		}
	}
	return true;
}

function show_results(test){
	var dif_text = "La diferencia entre los valores es " + test.difference.toFixed(3);
	var interval_text = "El intervalo de confianza al 95% es ";
	interval_text += "(" + test.interval.lower.toFixed(3) + ", " + test.interval.upper.toFixed(3) + ")";
	if(test.significative){
		var significative_text = "La diferencia es significativa.";
	}
	else{
		var significative_text = "La diferencia no es significativa."
	}
	var resultado = "<p>" + dif_text + "</p>";
	resultado += "<p>" + interval_text + "</p>";
	resultado += "<p>" + significative_text + "</p>";
	if('min_N' in test){
		var min_N_int = (test.min_N + 1).toFixed(0);
		var min_N_text = "Para que esa diferencia de valores sea significativa se necesitarían al menos " + min_N_int  + " encuestados.";
		resultado += "<p>" + min_N_text + "</p>";
	}
	console.log(dif_text);
	console.log(interval_text);
	console.log(significative_text);
	d3.select('#resultado').html(resultado);
}

function show_warning(warning){
	d3.select('#resultado').html(warning);
}
