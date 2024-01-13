<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { selectedTaxonomyStore } from "$lib/selectedTaxonomyStore";

  let selectedTaxonomy = {};

  let phyloTreeData;
  let parsedData;

  let allSpecieData;

  // Set up basic width and height
  const width = 900;
  const outerRadius = width / 2;
  const innerRadius = outerRadius - 170;

  // Variable that stores the fact that the supertribes are highlighted or not
  let isTextHighlighted = true;

  const fetchPhylotreeData = async () => {
    try {
      const response = await fetch("/data/BrassiToL_easy.tree");
      if (response.ok) {
        const text = await response.text();
        phyloTreeData = text;
        // Call parseNewick after setting phyloTreeData
        parsedData = parseNewick(phyloTreeData);
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
      } else {
        console.error("Failed to fetch data:", response.status);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

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

  let createTree = (container, data) => {
    const svg = createPhylogeneticTree(data);

    if (container) {
      // Clear the previous content
      container.innerHTML = "";
      // Append the new tree
      container.appendChild(svg);
    } else {
      console.error("Container not found");
    }
  };

  onMount(async () => {
    await fetchAllSpecieData();
    await fetchPhylotreeData();

    const filterOutgroupsFromParsedData = (data, outgroupSamples) => {
      const filterOutgroups = (node) => {
        if (node.branchset) {
          node.branchset = node.branchset.filter((child) => {
            const isOutgroup = outgroupSamples.includes(child.name);
            if (isOutgroup) {
              console.log(`Filtering out: ${child.name}`);
            }
            return !isOutgroup;
          });
          node.branchset.forEach(filterOutgroups);
        }
      };

      const updatedData = JSON.parse(JSON.stringify(data));
      filterOutgroups(updatedData);
      return updatedData;
    };

    let findOutgroups = () => {
      const outgroupData = allSpecieData.filter(
        (data) => data.FAMILY !== "Brassicaceae"
      );

      if (outgroupData.length > 0) {
        console.log(
          "Outgroups found:",
          outgroupData.map((data) => data.FAMILY)
        );

        const outgroupSamples = outgroupData.map((data) => data.SAMPLE);
        console.log("outgroup Samples:", outgroupSamples);
        const filteredParsedData = filterOutgroupsFromParsedData(
          parsedData,
          outgroupSamples
        );

        console.log("filtered", filteredParsedData);

        // Create and update the phylogenetic tree without the outgroups
        createTree(document.querySelector("#phyloTree"), filteredParsedData);
      } else {
        console.log("No outgroups found");
        // Create and update the phylogenetic tree with all data if no outgroups found
        createTree(document.querySelector("#phyloTree"), parsedData);
      }
    };

    findOutgroups();

    const highlightSupertribesToggleElement =
      document.querySelector("#highlightCheckbox");

    let toggleHighlight = () => {
      console.log("status change", highlightSupertribesToggleElement.checked);
      console.log("status change", isTextHighlighted);
      updateTextColors();
    };

    highlightSupertribesToggleElement.addEventListener(
      "change",
      toggleHighlight
    );

    // // TOGGLE moet nog dat bij elke toggle de kleur telkens aangepast wordt
    let updateTextColors = () => {
      d3.select("svg")
        .selectAll("text")
        .style("fill", (d) => (isTextHighlighted ? d.color : "black"));
    };

    // Subscribe to the taxonomy coming in from the filter component
    const unsubscribe = selectedTaxonomyStore.subscribe((value) => {
      selectedTaxonomy = value;
      // Find matching samples with the taxonomy array
      let taxonomySamples = matchTaxonomyWithSample(selectedTaxonomy, "tribes");
      console.log("Outgroup Samples:", taxonomySamples);

      // Update the tree based on the selected taxonomy
      // updateTree();
    });

    return () => {
      unsubscribe(); // Unsubscribe when the component is destroyed
    };
  });

  // Find taxonomy filter selected cooresponding samples
  let matchTaxonomyWithSample = (taxonomy, taxonomyType) => {
    switch (taxonomyType) {
      case "binaryCombination":
        // For binary combinations, return the array itself
        return taxonomy.binaryCombination || [];

      case "species":
        // For species, map each species to its corresponding sample
        return (taxonomy.species || [])
          .map((species) => {
            // Implement your logic to find the sample for the given species
            // This is a placeholder; adapt it based on your actual data structure
            const foundDataPoint = allSpecieData.find(
              (data) => data.SPECIES_NAME_PRINT === species
            );
            return foundDataPoint ? foundDataPoint.SAMPLE : null;
          })
          .filter((sample) => sample !== null);

      case "tribes":
        // For tribes, map each tribe to its corresponding samples
        return (taxonomy.tribes || [])
          .map((tribe) => {
            // Implement your logic to find the samples for the given tribe
            // This is a placeholder; adapt it based on your actual data structure
            const tribeSamples = allSpecieData
              .filter((data) => data.TRIBE === tribe)
              .map((data) => data.SAMPLE);
            return tribeSamples;
          })
          .flat();

      default:
        return [];
    }
  };

  // Data manipulation function
  let matchSampleWithSpecie = (sample, data) => {
    const foundDataPoint = data.find(
      (datapoint) => datapoint.SAMPLE === sample
    );
    if (foundDataPoint) {
      return foundDataPoint.SPECIES_NAME_PRINT;
    }
    return sample;
  };

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
  stroke: blue !important;
  stroke-width: 1.5px;
}

.link-extension--active {
  stroke-opacity: .6;
}

.label--active {
  font-weight: bold;
}

`);

    // Remove the previous paths before adding the updated paths
    svg.selectAll("path").remove();

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
      .attr("stroke-width", ".95px")
      .selectAll("path")
      .data(root.links())
      .join("path")
      .each(function (d) {
        d.target.linkNode = this;
      })
      .attr("d", linkConstant);

    svg
      .append("g")
      .selectAll("text")
      .data(root.leaves())
      .join("text")
      .attr("dy", ".31em")
      .attr(
        "transform",
        (d) =>
          `rotate(${d.x}) translate(${innerRadius + 4},0)${
            d.x < 180 ? "" : " rotate(180)"
          }`
      )
      .attr("text-anchor", (d) => (d.x < 180 ? "start" : "end"))
      .attr("font-size", ".3rem")
      .style("fill", (d) => (isTextHighlighted ? d.color : "black"))
      .text((d) => d.data.name.replace(/_/g, " "))
      .text((d) => matchSampleWithSpecie(d.data.name, allSpecieData))
      // HOVER AND CLICK dont work at the same time
      .on("mouseover", mouseovered(true))
      .on("mouseout", mouseovered(false));

    // Second ring kinda
    // svg
    //   .append("g")
    //   .selectAll("rect")
    //   .data(root.leaves())
    //   .join("rect")
    //   .attr("width", 1)
    //   .attr("height", 50)
    //   .attr("fill", "green")
    //   .attr(
    //     "transform",
    //     (d) =>
    //       `rotate(${d.x}) translate(${innerRadius + 50},0)${
    //         d.x < 180 ? "" : " rotate(180)"
    //       }`
    //   );

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

        const clickedPath = d3.select(d.linkExtensionNode);
        const isSelected = clickedPath.classed("link-extension--active");

        clickedPath.classed("link-extension--active", !isSelected).raise();

        let ancestor = d;
        while (ancestor) {
          if (ancestor.linkNode) {
            d3.select(ancestor.linkNode)
              .classed("link--active", active)
              .raise();
          }
          ancestor = ancestor.parent;
        }
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
    const name = d.data.name;
    const supertribe = getSupertribe(name);
    d.color =
      supertribe !== null
        ? color(supertribe)
        : d.parent
          ? d.parent.color
          : null;
    if (d.children) d.children.forEach(setColor);
  };

  let getSupertribe = (sample) => {
    const foundDataPoint = allSpecieData.find(
      (datapoint) => datapoint.SAMPLE === sample
    );
    return foundDataPoint ? foundDataPoint.SUPERTRIBE : null;
  };

  let color = d3.scaleOrdinal().range(d3.schemeCategory10);

  let legend = (svg) => {
    const g = svg
      .selectAll("g")
      .data(color.domain())
      .join("g")
      .attr(
        "transform",
        (d, i) => `translate(${-outerRadius},${outerRadius - 20 - i * 20})`
      );

    g.append("rect").attr("width", 10).attr("height", 10).attr("fill", color);

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
    const c0 = Math.cos((startAngle = (startAngle / 180) * Math.PI));
    const s0 = Math.sin(startAngle);
    const c1 = Math.cos((endAngle = (endAngle / 180) * Math.PI));
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

<label class="toggle-label">
  Show Supertribes
  <input
    id="highlightCheckbox"
    type="checkbox"
    bind:checked={isTextHighlighted}
  />
  <span class="toggle-slider"></span>
</label>

<!-- Container of tree -->
<div id="phyloTree" />

<style>
  #phyloTree {
    width: 80%;
    height: 500px;
    /* Add any other styling for the tree container */
  }

  /* Style the toggle button */
  .toggle-label {
    position: absolute;
    bottom: 100px; /* Adjust the distance from the bottom as needed */
    left: 20px; /* Adjust the distance from the left as needed */
    display: inline-block;
    width: 50px;
    height: 26px;
  }

  .toggle-label input {
    display: none;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    border-radius: 26px;
    transition: 0.4s;
  }

  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    border-radius: 50%;
    transition: 0.4s;
  }

  input:checked + .toggle-slider {
    background-color: #2196f3;
  }

  input:checked + .toggle-slider:before {
    transform: translateX(22px);
  }
</style>
