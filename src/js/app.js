import "../css/style.css";
import * as d3 from "d3";
import * as topojson from "topojson"; 

const mapVisuals = [{number: 0.03, color: "#99ffcc"}, {number: 0.12, color: "#80ffbf"},
                    {number: 0.21, color: "#4dffa6"}, {number: 0.30, color: "#1aff8c"},
                    {number: 0.39, color: "#00cc66"}, {number: 0.48, color: "#008040"},
                    {number: 0.57, color: "#006633"}, {number: 0.66, color: "#00331a"}];

let Legend = d3.select("#legend")
			         .attr("width", 300)
			         .attr("height", 50);

const margin0 = {top: 10, right: 0, bottom: 53, left: 25}; 
const viewHeight0 = +Legend.attr("height") - margin0.top - margin0.bottom;

Legend = Legend.append("g")
               .attr("transform", "translate(" + margin0.left + "," + margin0.top + ")");

const legendColors = Legend.append("g")
                           .selectAll("rect")
                           .data(mapVisuals)
                           .enter()
                           .append("rect")
                           .attr("class", "legendColors")
                           .attr("x", (d, i) => (i * 216) / mapVisuals.length + 14)
                           .attr("y", -10)
                           .attr("height", 8)
                           .attr("width", 27)
                           .style("fill", d => d.color)
                           .style("stroke", "black")
                           .style("stroke-width", 0);

const legendNumbers = mapVisuals.map(d => d.number);
const legendScale = d3.scaleBand()
                      .domain([...legendNumbers])
                      .range([0, 216]);

const legendCall = d3.axisBottom(legendScale)
                     .tickFormat(d3.format(".0%"))
                     .tickSize(18)
                     .tickSizeOuter(0);

const legendAxis = Legend.append("g")
                         .attr("id", "legendAxis")
                         .attr("transform", "translate(" + 0 + "," + viewHeight0 + ")")
                         .call(legendCall);
const height = 650;
const width = 1200;

let svg = d3.select("#svg")
            .attr("height", height)
            .attr("width", width);

const margin1 = {top: -5, right: 0, bottom: 0, left: 150}; 
svg = svg.append("g")
               .attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");

const toolTip = d3.select("body")
                  .append("div")
                  .attr("id", "toolTip")
                  .style("display", "none");

const countiesData = "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json";
const educationData = "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json";

svg.append("a")
   .attr("id", "source")
   .attr("xlink:href", "https://www.ers.usda.gov/data-products/county-level-data-sets/download-data/")
   .attr("target", "_blank")
   .append("text")
   .attr("id", "sourceText0")
   .attr("x", 660)
   .attr("y", 620)
   .style("text-decoration", "underline")
   .text("Source: USDA Economic Research Service");

d3.json(educationData).then(function(eduData) {
    const educationFunc = function(input) {
      for (let i = 0; i < eduData.length; i++) {
        if (eduData[i].fips === input.id) {
          return eduData[i].bachelorsOrHigher;
        }
      }
    };    
  d3.json(countiesData).then(function(data) {
    const counties = topojson.feature(data, data.objects.counties).features;
    const path = d3.geoPath();
    svg.append("g")
       .selectAll("path")
       .data(counties)
       .enter()
       .append("path")
       .attr("class", "county")
       .attr("data-fips", d => d.id)
       .attr("data-education", function(d) {
         return educationFunc(d); 
       }) 
       .attr("d", path)
       .style("fill", function(d) {
         if (educationFunc(d) < 3) {
          return "white";
         } 
         for (let j = 0; j < mapVisuals.length; j++) {
          if (educationFunc(d) < (mapVisuals[j].number * 100)) {
            return mapVisuals[j - 1].color;
          }
        } 
       })
       .on("mouseover", function(d) {
         for (let i = 0; i < eduData.length; i++) {
           if (eduData[i].fips === d.id) {
             toolTip
               .attr("data-education", eduData[i].bachelorsOrHigher)
               .style("left", d3.event.pageX + 20 + "px")
               .style("top", d3.event.pageY + -25 + "px")
               .style("display", "inline-block")
               .html(() => `${eduData[i].area_name}, ${eduData[i].state}: ${eduData[i].bachelorsOrHigher}%`)
            }
          }     
       })
       .on("mouseleave", function() {
         toolTip
           .style("display", "none");
       });
  }).catch(function(err1) {
       alert("Data failed to load, please try again.")
  });
}).catch(function(err0) {
  alert("Data failed to load, please try again.")
});


