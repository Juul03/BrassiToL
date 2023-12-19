<script>
	import { redirect } from '@sveltejs/kit';
	import * as d3 from 'd3';
	import { onMount } from 'svelte';

    // variabelen aanmaken die in een array geplaatst worden
	let metaData = [];

    // // variabelen aanmaken die een begin/standaard aangeven voor de grafiek
	// let selectedOption = 'Happiness Score';
	// let selectedYear = '2015';

    // asynschronische functie die kan lopen terwijl je met wat anders bezig bent. Deze functie fetcht de data van de url in de array van happiness data.
    // de eerste regel vraagt een asynschroon verzoek naar de url dmv fetch. await betekent dat fetch een Promise teruggeeft en daarop wacht
    // als de response.ok is, dan is het verzoek gelukt. Hierna wordt de data omgezet naar json en await wordt gebruikt voor het wachten op de Promise.
    // de data wordt 'gepusht' in de array van happinessData. hierna is de array gelogt in de console.
    // als de response niet wordt goedgekeurd, krijg je via de console een bericht dat het fetchen niet is gelukt.  
	async function fetchJSONData(url, metadataArray) {
		const response = await fetch(url);
		if (response.ok) {
			const data = await response.json();
			metadataArray.push(...data); 
			console.log(metadataArray);
		} else {
			console.error('Failed to fetch the data');
		}
	}

    // onMount betekent dat alles in deze functie wordt uitgevoerd als de pagina wordt herladen.
    // De asynschronische functie fetchDataAndUpdateChart wordt uitgevoerd, hier worden de datasets gefetcht in een array van dat jaar, dus url2015 wordt gefetcht in een array voor Happiness2015Data. 
    // Dit kan doordat de promise wordt uitgevoerd en zo de data in een bestaande array geplaatst kan worden.

    // bij het herladen van de pagina wil ik dat 2015 oranje blijft, want dat laat de grafiek als eerste zien, en ik geef het jaar waar je bent een oranje kleur, zodat je weet welke data je ziet. 
    // je voegt de class met selectedbutton toe aan 2015, zodat die oranje blijft aan het begin. daarna zeg je tegen alle buttons dat als je erop klikt, dat die class wordt toegevoegd, dus dat je oranje wordt als jaar. de rest van de jaartallen moeten dan niet meer oranje zijn, dus daar verwijder je de class.

	onMount(() => {
		fetchDataAndUpdateChart();

		const button2015 = document.querySelector('div button:first-of-type');
		button2015.classList.add('selectedbutton');
		
		const alleButtons = document.querySelectorAll('div button');

		alleButtons.forEach((button) => {
			button.addEventListener('click', () => {
				const clickedValue = button.value; 

				alleButtons.forEach((otherButton) => {
					if (otherButton.value === clickedValue) {
						otherButton.classList.add('selectedbutton');
					} else {
						otherButton.classList.remove('selectedbutton');
					}
				});
			});
		});
	});

    // deze asynchronische functie zorgt ervoor dat de data wordt gefetcht in een bestaande array. 
    // eerst maak je variabelen aan met het pad naar de datasets en daarna voer je de promise uit om die variabelen in de arrays te plaatsen van dat jaar/die dataset.
    // eerst moet de data gefetcht worden in een array voordat je uberhaupt iets kunt zien

	async function fetchDataAndUpdateChart() {
		const urlmeta = '/data/metadataBrassiToL.json';

		await Promise.all([
			fetchJSONData(urlmeta, metaData),
		]);

		console.log('hoi', metaData);


    // generateChart is een functie met twee parameters: selectedData en selectedOption, dus het jaar en de factor
    // bij de eerste console.log check ik of hij van het eerste land de happiness score laat zien
    // bij de tweede console.log check ik hoe lang de selectedData is, dus de array, hoeveel landen er dus in zitten
	const generateChart = (selectedData, selectedOption) => {
		console.log('generate Chart' + selectedData[0][selectedOption]);
		console.log(selectedData.length);

        // hiermee zorg ik ervoor dat hij de oude grafiek van een ander jaar eerst verwijderd, de data, voordat hij een nieuwe laat zien, anders verandert er niks
		d3.select('#chartContainer svg').remove();

        // lengte en breedte aan grafiek meegeven
		const chartWidth = 1500;
		const chartHeight = 3000;

        // x-as maken met een lineare schaal en met als domein vanaf 0 tot aan het maximum van de selecteddata voor de specifieke selectedoption
        // de range is de breedte van de schaal en -155 is dat ik ruimte aan de linkerkant heb overgehouden voor de landen
		const xScale = d3
			.scaleLinear()
			.domain([0, d3.max(selectedData, (d) => d[selectedOption])])
			.range([0, chartWidth - 155]);

        // y-as maken met een band scale voor discrete data zoals categorieën
        // het domein is voor elk land elke selecteddata langsgaan
        // range is lengte van de schaal tot aan de chartheight, dus de hoogte van de grafiek
        // paddinginner is dat ik ruimte tussen de bars heb gegeven, een klein beetje, zodat ze niet op elkaar gedrukt zitten
		const yScale = d3
			.scaleBand()
			.domain(selectedData.map((d) => d.Country))
			.range([0, chartHeight])
			.paddingInner(0.1);

        // ticks zijn de streepjes bij de y-as, die aan de linkerkant komt 
		const yaxis = d3.axisLeft(yScale);
		yaxis.ticks(5).tickSize(5);

        // select uit de html de div met id chartcontainer en maak een nieuw element svg in de id chartcontainer met als lengte en breedte deze van de chart
		const svg = d3
			.select('#chartContainer')
			.append('svg')
			.attr('width', chartWidth)
			.attr('height', chartHeight);

        // zorgt ervoor dat de landen worden laten zien aan de linkerkant als g in de svg
		const yAxisGroup = svg
			.append('g')
			.attr('id', 'yAxis')
			.attr('transform', 'translate(145, 0)')
			.call(yaxis);

		// const colorScaleQuant = d3
		// 	.scaleQuantize()
		// 	.domain([0, d3.max(selectedData, (d) => d[selectedOption])])
		// 	.range(['purple', 'blue', 'green', 'yellow', 'orange', 'red']);

        // smileys toevoegen in de bars als svg
		const smileyWidth = 17;
		const smileyHeight = 17;

        // defs variabelen aanmaken voor svg die ik kan hergebruiken
		const defs = svg.append('defs');

        // id van svg toevoegen en hiermee de bars vullen met de svg. een pattern maken met de lengte en breedte van de smiley
        // patternUnits en userSpaceOnUse zorgen voor de coordinaten van de pattern, dit zorgt ervoor dat deze gebaseerd zijn op die van de svg
        // toevoegen van image pattern en hiermee de smiley svg
        // lengte en breedte van image toevoegen in de pattern zelf
		defs
			.append('pattern')
			.attr('id', 'smileyPattern')
			.attr('width', smileyWidth)
			.attr('height', smileyHeight)
			.attr('patternUnits', 'userSpaceOnUse')
			.append('image')
			.attr('xlink:href', '/images/Smiley.svg')
			.attr('width', smileyWidth)
			.attr('height', smileyHeight);

        // bars maken met daarin de selecteddata.
        // maakt g elementen aan voor elk datapunt in de selecteddata en verbindt deze samen
        // wordt een verticale bar chart met de country op de y-as
		const bars = svg
			.selectAll('.bar')
			.data(selectedData)
			.join('g')
			.attr('class', 'bar')
			.attr('transform', (d) => `translate(145, ${yScale(d.Country)})`);

        // voegt de rect samen met de eerder gemaakte g elementen
        // hoogte is de y-as en de totale hoeveelheid ruimte daarbij naar aanleiding van het aantal landen
        // de transition zorgt ervoor dat de x-as breedte groter wordt naar rechts door het groter worden/optellen van de data van de selectedoption
        // je krijgt door math floor even smileys en niet half afgesneden smileys en dit doe je vermenigvuldigen met de smileywidth, zodat de smileys passen in de barchart
        // zwarte border
		bars
			.append('rect')
			.attr('width', 0)
			.attr('height', yScale.bandwidth())
			.attr('fill', 'url(#smileyPattern)')
			.transition()
			.duration(3000)
			.ease(d3.easeCubicInOut)
			.attr('width', (d) => {
				const numberOfSmileys = Math.floor(xScale(d[selectedOption]) / smileyWidth);
				return numberOfSmileys * smileyWidth;
			})
			.attr('stroke', 'black');

        // tekst toevoegen die 1.2 in het midden van de bar staat op de y
        // transition dat de tekst optelt van 0 tot het aantal van de data van de selectedoption naar rechts, interpolate is van start tot end, dus in dit geval 0, d[selectedOption]
        // als het geen 0 is, dan zorgt hij ervoor dat de tekst met 4 decimalen te zien is
        // als het 0 is, krijg je geen bar te zien, dan krijg je 0 te zien, met 0 decimalen
        // x gaat om de waarde van de selectedoption, als de tekst 0 is, dan komt het op x=20, anders, dan is de tekst geplaatst op de x-positie -80, dus op de bars. -80 is een offset en zorgt voor de horizontale positie van de svg, in dit geval de text. 
        // de kleur is 0 van de tekst
		bars
			.append('text')
			.attr('y', yScale.bandwidth() / 1.2)
			.attr('x', 0)
			.transition()
			.duration(3000)
			.tween('text', function (d) {
				const interpolator = d3.interpolate(0, d[selectedOption]);
				return function (t) {
					if (d[selectedOption] != 0) {
						d3.select(this).text(interpolator(t).toFixed(4)); // Adjust the precision as needed
					} else {
						d3.select(this).text(interpolator(t).toFixed(0));
					}
				};
			})
			.attr('x', (d) => (d[selectedOption] === 0 ? 20 : xScale(d[selectedOption]) - 80))
			.attr('fill', 'black');
	};

    // parameter met event voor het uitvoeren van een click event
    // event.target.value is de value van de button die was aangeklikt, dus 2015 bijv
    // variabele voor opslaan van data voor het geselecteerde jaar
    // switch betekent dat kijkend naar het selectedYear, de goeie dataset wordt aangewezen aan de selectedData.
    // de functie wordt uitgevoerd 
	const handleClick = (event) => {
		selectedYear = event.target.value;
		console.log('Selected year:', selectedYear);

		let selectedData;

		switch (selectedYear) {
			case '2015':
				selectedData = happiness2015Data;
				break;
			case '2016':
				selectedData = happiness2016Data;
				break;
			case '2017':
				selectedData = happiness2017Data;
				break;
			case '2018':
				selectedData = happiness2018Data;
				break;
			case '2019':
				selectedData = happiness2019Data;
				break;
			default:
				selectedData = [];
				break;
		}

		console.log('selected data:', selectedData);
		console.log('selected option:', selectedOption);

		generateChart(selectedData, selectedOption);
	};

    
    // deze is dezelfde, alleen geldt voor de opties/factoren
    // laat de selectedoption zien als je erop klikt, dus happiness score bijv
    // voert functie generateChart uit met de functie getSelectedData en de selectedOption, dus het goeie jaar en de goeie factor
	function handleSelection(event) {
		selectedOption = event.target.value;
		generateChart(getSelectedData(), selectedOption);
	}

	function getSelectedData() {
		switch (selectedYear) {
			case '2015':
				return happiness2015Data;
			case '2016':
				return happiness2016Data;
			case '2017':
				return happiness2017Data;
			case '2018':
				return happiness2018Data;
			case '2019':
				return happiness2019Data;
			default:
				return [];
		}
	}
}
</script>

<div class="dropdown">
	<select bind:value={selectedOption} on:change={handleSelection}>
		<option value="Happiness Score">Happiness Score</option>
		<option value="Family">Family</option>
		<option value="Freedom">Freedom</option>
		<option value="Health (Life Expectancy)">Health (Life Expectancy)</option>
	</select>
</div>

<div>
	<button class="selectedbutton" on:click={handleClick} value="2015">2015</button>
	<button on:click={handleClick} value="2016">2016</button>
	<button on:click={handleClick} value="2017">2017</button>
	<button on:click={handleClick} value="2018">2018</button>
	<button on:click={handleClick} value="2019">2019</button>
</div>

<div id="chartContainer" />

<style>
	div {
		padding: 10px;
	}

	div button {
		padding: 8px;
		margin: 3px;
		background-color: rgb(238, 238, 46);
		font-size: 15px;
		font-family: 'Josefin Sans';
		border: 2px black;
		border-radius: 5px;
		cursor: pointer;
		transition: ease-in-out 400ms;
	}

	.selectedbutton {
		background-color: rgb(240, 179, 65);
	}

	div button:hover {
		background-color: rgb(240, 179, 65);
		transform: scale(1.5);
	}

	div button:focus {
		background-color: rgb(240, 179, 65);
	}

	.dropdown {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}

    /* transparante border, zodat de pagina niet verspringt/verschuift van plek. nu staat de border er al, alleen is hij nog niet te zien */
	select {
		padding: 20px;
		text-align: center;
		font-size: 40px;
		font-family: 'Pacifico';
		border: 5px transparent solid;
		border-radius: 30px;
		background: rgb(240, 179, 65);
		cursor: pointer;
		transition: ease-in-out 200ms;
	}

	div select:hover {
		border: 5px black solid;
	}
</style>
