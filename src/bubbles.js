import * as d3 from 'd3'

const margin = {
  top: 0,
  right: 20,
  bottom: 30,
  left: 20
}

const width = 900 - margin.left - margin.right
const height = 500 - margin.top - margin.bottom

const svg = d3
  .select('#bubbles')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

var radiusScale = d3.scaleSqrt()
  .domain([80,125])
  .range([10,20])


var forceXSeparate = d3.forceX(function(d) {
	if(d.Year === '2016') {
		return 150
	} else if (d.Year === '2017') { 
    return 450 
  } else if (d.Year === '2018'){return 750
  }}).strength(0.05)

var ForceXCombine = d3.forceX(width/2).strength(0.05)

// Keep those circles from stacking on top of each other
var forceCollide = d3.forceCollide(d => radiusScale(d.Temp_cleaned) + 2)

// This will define where the circles go
// and how they interact
var simulation = d3.forceSimulation()
  // Force x and force y will move circles
  // along the axes
  .force('x', forceXSeparate)
  .force('y', d3.forceY(height/2).strength(0.03))
  .force('collide', forceCollide)

// Read in files
d3.csv(require('./maricopa_heat_deaths.csv'))
  .then(ready)

function ready (datapoints) {
  console.log('Data is', datapoints)
  var circles = svg
    .selectAll('circle')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('class', 
    	d => d.Name
    	)
    .attr('fill', 'lightgrey')
    .attr('r', 
    	d => radiusScale(d.Temp_cleaned)
    	)

    // Start of new stuff
    .on('mouseover', function(d) {
      // Make the circle black
      d3.select(this)
        .transition()
        .duration(200)
        .attr('fill', '#F2B749')
        .attr('r', d => radiusScale(d.Temp_cleaned)*1.2)

      d3.select('#name').text(d.Name)
      d3.select('#age').text(d.Age)
      d3.select('#temp').text(d.Temp_cleaned)
      d3.select('#year').text(d.Year)

      // Be sure you're using .style
      // to change CSS rules
      d3.select('#info').style('display', 'block')
    })
    .on('mouseout', function(d) {
      // Change the color to the correct color
      d3.select(this)
        .transition()
        .duration(200)
        .attr('fill', 'lightgrey')
        .attr('r', d => radiusScale(d.Temp_cleaned))

      d3.select('#info').style('display', 'none')
    })

    // End new stuff

  d3.select("#combined").on('click', d => 
    simulation
    .force("x", ForceXCombine)
    .alphaTarget(0.05)
    .restart()
    // console.log("Combine the bubbles.")
    )

  d3.select("#yearly").on('click', d => 
    simulation
    .force("x", forceXSeparate)
    .alphaTarget(0.25)
    .restart()
    )


    simulation.nodes(datapoints)
      // Each time there's a tick on the simulation
      // move the data according to our forces
      .on('tick', ticked)

    function ticked() {
    	circles
    	.attr('cx', d => d.x)
    	.attr('cy', d => d.y)
    }
	}
	