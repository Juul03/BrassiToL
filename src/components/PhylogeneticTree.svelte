<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";

  let phyloTreeData;
  let parsedData;

  let allSpecieData;

  const fetchPhylotreeData = async () => {
    try {
      const response = await fetch("/data/BrassiToL_easy.tree");
      if (response.ok) {
        const text = await response.text();
        phyloTreeData = text;
        // Call parseNewick after setting phyloTreeData
        parsedData = parseNewick(phyloTreeData);
        console.log("Parsed Data:", parsedData); // Check the parsed data in the console
        // Now you can proceed with creating the phylogenetic tree using parsedData
        // Example: const svg = createPhylogeneticTree(parsedData);
      } else {
        console.error("Failed to fetch data:", response.status);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchAllSpecieData = async () => {
    try {
      const response = await fetch("/data/metadataBrassiToL.json");
      if (response.ok) {
        allSpecieData = await response.json();
        console.log("exceldata", allSpecieData);
      } else {
        console.error("Failed to fetch data:", response.status);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const width = 900;
  const outerRadius = width / 2;
  const innerRadius = outerRadius - 170;

  // https://github.com/jasondavies/newick.js
  function parseNewick(a) {
    for (
      var e = [], r = {}, s = a.split(/\s*(;|\(|\)|,|:)\s*/), t = 0;
      t < s.length;
      t++
    ) {
      var n = s[t];
      switch (n) {
        case "(":
          var c = {};
          r.branchset = [c];
          e.push(r);
          r = c;
          break;
        case ",":
          var c = {};
          e[e.length - 1].branchset.push(c);
          r = c;
          break;
        case ")":
          r = e.pop();
          break;
        case ":":
          break;
        default:
          var h = s[t - 1];
          ")" == h || "(" == h || "," == h
            ? (r.name = n)
            : ":" == h && (r.length = parseFloat(n));
      }
    }
    return r;
  }

  onMount(async () => {
    await fetchAllSpecieData();
    await fetchPhylotreeData(); // Call this function wherever appropriate in your code to fetch the data
    const svg = createPhylogeneticTree(parsedData);
    const container = document.querySelector("#phyloTree");

    if (container) {
      container.appendChild(svg);
    } else {
      console.error("Container not found");
    }
  });

  const createPhylogeneticTree = (data) => {
    const root = d3
      .hierarchy(data, (d) => d.branchset)
      .sum((d) => (d.branchset ? 0 : 1))
      .sort(
        (a, b) =>
          a.value - b.value || d3.ascending(a.data.length, b.data.length)
      );

    cluster(root);
    setRadius(root, (root.data.length = 0), innerRadius / maxLength(root));
    setColor(root);

    const svg = d3
      .create("svg")
      .attr("viewBox", [-outerRadius, -outerRadius, width, width])
      .attr("font-family", "sans-serif")
      .attr("font-size", 10);

    svg.append("g").call(legend);

    svg.append("style").text(`

.link--active {
  stroke: #000 !important;
  stroke-width: 1.5px;
}

.link-extension--active {
  stroke-opacity: .6;
}

.label--active {
  font-weight: bold;
}

`);

    const linkExtension = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-opacity", 0.25)
      .selectAll("path")
      .data(root.links().filter((d) => !d.target.children))
      .join("path")
      .each(function (d) {
        d.target.linkExtensionNode = this;
      })
      .attr("d", linkExtensionConstant);

    const link = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .selectAll("path")
      .data(root.links())
      .join("path")
      .each(function (d) {
        d.target.linkNode = this;
      })
      .attr("d", linkConstant)
      .attr("stroke", (d) => d.target.color);

    let matchSampleWithSpecie = (sample, data) => {
      const foundDataPoint = data.find(
        (datapoint) => datapoint.SAMPLE === sample
      );
      if (foundDataPoint) {
        console.log(foundDataPoint.SPECIES_NAME_PRINT);
        return foundDataPoint.SPECIES_NAME_PRINT;
      }
      return sample;
    };

    svg
      .append("g")
      .selectAll("text")
      .data(root.leaves())
      .join("text")
      .attr("dy", ".31em")
      .attr(
        "transform",
        (d) =>
          `rotate(${d.x - 90}) translate(${innerRadius + 4},0)${
            d.x < 180 ? "" : " rotate(180)"
          }`
      )
      .attr("text-anchor", (d) => (d.x < 180 ? "start" : "end"))
      .text((d) => d.data.name.replace(/_/g, " "))
      .text((d) => matchSampleWithSpecie(d.data.name, allSpecieData))
      .on("mouseover", mouseovered(true))
      .on("mouseout", mouseovered(false));

    function update(checked) {
      const t = d3.transition().duration(750);
      linkExtension
        .transition(t)
        .attr("d", checked ? linkExtensionVariable : linkExtensionConstant);
      link.transition(t).attr("d", checked ? linkVariable : linkConstant);
    }

    function mouseovered(active) {
      return function (event, d) {
        d3.select(this).classed("label--active", active);
        d3.select(d.linkExtensionNode)
          .classed("link-extension--active", active)
          .raise();
        do d3.select(d.linkNode).classed("link--active", active).raise();
        while ((d = d.parent));
      };
    }

    return Object.assign(svg.node(), { update });
  };

  // Chart functions
  let cluster = d3
    .cluster()
    .size([360, innerRadius])
    .separation((a, b) => 1);

  // Set the radius of each node by recursively summing and scaling the distance from the root.
  let setRadius = (d, y0, k) => {
    d.radius = (y0 += d.data.length) * k;
    if (d.children) d.children.forEach((d) => setRadius(d, y0, k));
  };

  // Compute the maximum cumulative length of any node in the tree.
  let maxLength = (d) => {
    return d.data.length + (d.children ? d3.max(d.children, maxLength) : 0);
  };

  // Set the color of each node by recursively inheriting.
  let setColor = (d) => {
    var name = d.data.name;
    d.color =
      color.domain().indexOf(name) >= 0
        ? color(name)
        : d.parent
          ? d.parent.color
          : null;
    if (d.children) d.children.forEach(setColor);
  };

  let color = d3
    .scaleOrdinal()
    .domain(["Bacteria", "Eukaryota", "Archaea"])
    .range(d3.schemeCategory10);

  let legend = (svg) => {
    const g = svg
      .selectAll("g")
      .data(color.domain())
      .join("g")
      .attr(
        "transform",
        (d, i) => `translate(${-outerRadius},${-outerRadius + i * 20})`
      );

    g.append("rect").attr("width", 18).attr("height", 18).attr("fill", color);

    g.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .text((d) => d);
  };

  let linkExtensionConstant = (d) => {
    return linkStep(d.target.x, d.target.y, d.target.x, innerRadius);
  };

  let linkStep = (startAngle, startRadius, endAngle, endRadius) => {
    const c0 = Math.cos((startAngle = ((startAngle - 90) / 180) * Math.PI));
    const s0 = Math.sin(startAngle);
    const c1 = Math.cos((endAngle = ((endAngle - 90) / 180) * Math.PI));
    const s1 = Math.sin(endAngle);
    return (
      "M" +
      startRadius * c0 +
      "," +
      startRadius * s0 +
      (endAngle === startAngle
        ? ""
        : "A" +
          startRadius +
          "," +
          startRadius +
          " 0 0 " +
          (endAngle > startAngle ? 1 : 0) +
          " " +
          startRadius * c1 +
          "," +
          startRadius * s1) +
      "L" +
      endRadius * c1 +
      "," +
      endRadius * s1
    );
  };

  let linkConstant = (d) => {
    return linkStep(d.source.x, d.source.y, d.target.x, d.target.y);
  };
</script>

<h2>Phylogenetic tree</h2>
<div id="phyloTree" />

<style>
  #phyloTree {
    width: 100%;
    height: 500px;
    /* Add any other styling for the tree container */
  }
</style>
