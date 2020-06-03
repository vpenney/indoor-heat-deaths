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

// Define a color scale by
// air conditioning status
const colorScale = d3
  .scaleOrdinal()
  .range(['#007D8A', '#F29E03', '#F85155', '#41B5C2'])

// This is an x-position scale
// for sorting by temp
var xPositionScale = d3.scaleLinear().range([0, width])

// Move the bubble blobs around
// depending on which year the data is from
var forceXSeparate = d3
  .forceX(d => {
    if (d.air_conditioning === 'broken') {
      return width * 0.2
    } else if (d.air_conditioning === 'off') {
      return width * 0.5
    } else if (d.air_conditioning === 'none') {
      return width * 0.7
    } else if (d.air_conditioning === 'unknown') {
      return width * 0.9
    }
  })
  .strength(0.05)

// This separates points based on indoor temp
var forceXSeparateTemp = d3
  .forceX(d => {
    return xPositionScale(d.Temp_cleaned)
  })
  .strength(0.12)

// Define a force for combining the circles
var forceXCombine = d3.forceX(width / 2).strength(0.04)

// Keep those circles from stacking on top of each other
var forceCollide = d3.forceCollide(18)

// This will define where the circles go
// and how they interact
var simulation = d3
  .forceSimulation()
  // Force x and force y will move circles
  // along the axes
  .force('x', forceXCombine)
  .force('y', d3.forceY(height / 1.75).strength(0.045))
  .force('collide', forceCollide)

// Read in files
d3.csv(require('./maricopa_heat_deaths.csv')).then(ready)

function ready(datapoints) {
  console.log('Data is', datapoints)

  // Get a list of dates and a list of prices
  let temp = datapoints.map(d => +d.Temp_cleaned)

  // Define domain for xPositionScale
  xPositionScale.domain(d3.extent(temp))

  // While we're at it, here's an x-axis
  // for the temp button
  var xAxis = d3.axisBottom(xPositionScale)
  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
    .style('display', 'none')

  // Add circles for every data point
  // small and grey, for now
  var circles = svg
    .selectAll('circle')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('class', d => d.Name)
    .attr('fill', 'lightgrey')
    .attr('r', 10)

    .on('mouseover', function(d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('r', 15)

      // This fills in text block on mouseover
      d3.select('#name').text(d.Name)
      d3.select('#age').text(d.Age)
      d3.select('#temp').text(d.Temp_cleaned)
      d3.select('#year').text(d.Year)
      d3.select('#gender').text(d.Gender)

      // Hide end quote on mouseover/click
      d3.select('#end-quote').style('display', 'none')
      d3.select('#info').style('display', 'block')
    })

    .on('mouseout', function(d) {
      // Change the color to the correct color
      // and set the radius back to normal,
      // hide the info text block
      d3.select(this)
        .transition()
        .duration(200)
        .attr('r', 10)
      d3.select('#info').style('display', 'none')
    })

  // Combine the bubbles on click
  d3.select('#combined').on(
    'click',
    d =>
      simulation
        .force('x', forceXCombine)
        .alphaTarget(0.4)
        .restart()
    // console.log("Combine the bubbles.")
  )

  // Separate the bubbles by A/C on click
  d3.select('#status').on('click', d =>
    simulation
      .force('x', forceXSeparate)
      .alphaTarget(0.5)
      .restart()
  )

  // Separate the bubbles by temperature on click
  d3.select('#heat').on('click', d =>
    simulation
      .force('x', forceXSeparateTemp)
      .alphaTarget(0.6)
      .restart()
  )

  simulation
    .nodes(datapoints)
    // Each time there's a tick on the simulation
    // move the data according to the forces
    .on('tick', ticked)

  function ticked() {
    circles.attr('cx', d => d.x).attr('cy', d => d.y)
  }

  // This is where the animations and timing live

  d3.select('#introduction')
    .transition(750)
    .style('display', 'block')

  // After 5 seconds, hide intro text
  d3.select('#introduction')
    .transition(750)
    .delay(10000)
    .style('display', 'none')

  // Indroduce Dickinson text
  d3.select('#dickinson')
    .transition(750)
    .delay(10000)
    .style('display', 'block')

  // Highlight Dickinson point
  d3.selectAll('circle')
    .transition(750)
    .delay(10000)
    .attr('fill', function(d) {
      if (d.Name === 'James Allen Dickinson') {
        return colorScale(d.air_conditioning)
      } else return 'lightgrey'
    })
    .attr('r', d => {
      if (d.Name === 'James Allen Dickinson') {
        return 15
      } else return 10
    })

  d3.select('#dickinson')
    .transition(750)
    .delay(17000)
    .style('display', 'none')

  d3.select('#broken')
    .transition(750)
    .delay(17000)
    .style('display', 'block')

  d3.selectAll('circle')
    .transition(750)
    .delay(17000)
    .attr('fill', function(d) {
      if (d.air_conditioning === 'broken') {
        return colorScale(d.air_conditioning)
      } else return 'lightgrey'
    })
    .attr('fill-opacity', function(d) {
      if (d.Name === 'James Allen Dickinson') {
        return 1
      } else return 0.5
    })
    .attr('r', d => {
      if (d.air_conditioning === 'broken') {
        return 15
      } else return 10
    })

  d3.select('#broken')
    .transition(750)
    .delay(24000)
    .style('display', 'none')

  d3.select('#noac')
    .transition(750)
    .delay(24000)
    .style('display', 'block')

  d3.selectAll('circle')
    .transition(750)
    .delay(24000)
    .attr('fill', function(d) {
      if (d.air_conditioning === 'off') {
        return colorScale(d.air_conditioning)
      } else return 'lightgrey'
    })
    .attr('fill-opacity', function(d) {
      if (d.Name === 'Erminia Quihuis Chacon') {
        return 1
      } else return 0.5
    })
    .attr('r', d => {
      if (d.air_conditioning === 'off') {
        return 15
      } else return 10
    })

  d3.select('#noac')
    .transition(750)
    .delay(40000)
    .style('display', 'none')

  d3.select('#off')
    .transition(750)
    .delay(40000)
    .style('display', 'block')

  d3.selectAll('circle')
    .transition(750)
    .delay(40000)
    .attr('fill', function(d) {
      if (d.air_conditioning === 'none') {
        return colorScale(d.air_conditioning)
      } else return 'lightgrey'
    })

    .attr('fill-opacity', function(d) {
      if (d.Name === 'Humberto Montoya Ayala') {
        return 1
      } else return 0.5
    })
    .attr('r', d => {
      if (d.air_conditioning === 'none') {
        return 15
      } else return 10
    })

  d3.select('#off')
    .transition(750)
    .delay(60000)
    .style('display', 'none')

  d3.select('#unknown')
    .transition(750)
    .delay(60000)
    .style('display', 'block')

  d3.selectAll('circle')
    .transition(750)
    .delay(60000)
    .attr('fill', function(d) {
      if (d.air_conditioning === 'unknown') {
        return colorScale(d.air_conditioning)
      } else return 'lightgrey'
    })
    .attr('fill-opacity', function(d) {
      if (d.Name === 'Candace Dale Bader') {
        return 1
      } else return 0.5
    })
    .attr('r', d => {
      if (d.air_conditioning === 'unknown') {
        return 15
      } else return 10
    })

  d3.select('#unknown')
    .transition(750)
    .delay(80000)
    .style('display', 'none')

  d3.select('#end-quote')
    .transition(750)
    .delay(80000)
    .style('display', 'block')

  d3.selectAll('circle')
    .transition(750)
    .delay(80000)
    .attr('fill', d => {
      return colorScale(d.air_conditioning)
    })
    .attr('fill-opacity', 1)
    .attr('stroke', 'none')
    .attr('r', 10)
}
