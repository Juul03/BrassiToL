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
  // Variable that stores the fact that the outgroups are shown or not
  let areOutgroupsShown = false;

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

  let findOutgroups = () => {
    if (areOutgroupsShown) {
      // Create and update the phylogenetic tree with all data
      createTree(document.querySelector("#phyloTree"), parsedData);
    } else {
      const outgroupData = allSpecieData.filter(
        (data) => data.FAMILY !== "Brassicaceae"
      );

      if (outgroupData.length > 0) {
        const outgroupSamples = outgroupData.map((data) => data.SAMPLE);
        const filteredParsedData = filterOutgroupsFromParsedData(
          parsedData,
          outgroupSamples
        );

        // Create and update the phylogenetic tree without the outgroups
        createTree(document.querySelector("#phyloTree"), filteredParsedData);
      } else {
        // No outgroups found
        // Create and update the phylogenetic tree with all data if no outgroups found
        createTree(document.querySelector("#phyloTree"), parsedData);
      }
    }
  };

  const filterOutgroupsFromParsedData = (data, outgroupSamples) => {
    const filterOutgroups = (node) => {
      if (node.branchset) {
        node.branchset = node.branchset.filter((child) => {
          const isOutgroup = outgroupSamples.includes(child.name);
          return !isOutgroup;
        });
        node.branchset.forEach(filterOutgroups);
      }
    };

    const updatedData = JSON.parse(JSON.stringify(data));
    filterOutgroups(updatedData);
    return updatedData;
  };

  // Function that colors the text with the color of the corresponding supertribe
  let updateTextColors = () => {
    d3.select("svg")
      .selectAll("text")
      .style("fill", (d) => (isTextHighlighted ? d.color : "black"));
  };

  onMount(async () => {
    await fetchAllSpecieData();
    await fetchPhylotreeData();
    findOutgroups();

    const highlightSupertribesToggleElement =
      document.querySelector("#highlightCheckbox");

    const showOutgroupsToggleElement =
      document.querySelector("#outgroupCheckbox");

    let toggleHighlight = () => {
      updateTextColors();
    };

    let toggleShowOutgroups = () => {
      findOutgroups();
    };

    highlightSupertribesToggleElement.addEventListener(
      "change",
      toggleHighlight
    );

    showOutgroupsToggleElement.addEventListener("change", toggleShowOutgroups);

    const unsubscribe = selectedTaxonomyStore.subscribe((value) => {
      selectedTaxonomy = value || {}; // Make sure selectedTaxonomy is not null or undefined

      let taxonomySamplesSubfamily = matchTaxonomyWithSample(
        selectedTaxonomy,
        "subfamily"
      );

      let taxonomySamplesSupertribe = matchTaxonomyWithSample(
        selectedTaxonomy,
        "supertribes"
      );

      let taxonomySamplesTribes = matchTaxonomyWithSample(
        selectedTaxonomy,
        "tribes"
      );

      let taxonomySamplesGenus = matchTaxonomyWithSample(
        selectedTaxonomy,
        "genus"
      );

      let taxonomySamplesSpecies = matchTaxonomyWithSample(
        selectedTaxonomy,
        "species"
      );

      let taxonomySamplesBinaryCombination = matchTaxonomyWithSample(
        selectedTaxonomy,
        "binarycombination"
      );

      // Merge arrays before updating the tree
      let combinedSamples = [
        ...taxonomySamplesSubfamily,
        ...taxonomySamplesSupertribe,
        ...taxonomySamplesTribes,
        ...taxonomySamplesGenus,
        ...taxonomySamplesSpecies,
        ...taxonomySamplesBinaryCombination,
      ];
      updateTree(combinedSamples);
    });

    return () => {
      unsubscribe(); // Unsubscribe when the component is destroyed
    };
  });

  let updateTree = (selected) => {
    // d3.select("svg")
    //   .selectAll("text")
    //   .style("fill", (d) => (selected.includes(d) ? "red" : "black"));

    d3.select("svg")
      .selectAll("path")
      .transition() // Add a transition for a smoother effect
      .duration(500) // Set the duration to 500 milliseconds
      .style("stroke", (d) =>
        selected.includes(d.target.data.name) ? d.target.color : "#000"
      )
      .attr("stroke-width", (d) =>
        selected.includes(d.target.data.name) ? "2px" : ""
      );
  };

  // Find taxonomy filter selected cooresponding samples
  let matchTaxonomyWithSample = (taxonomy, taxonomyType) => {
    switch (taxonomyType) {
      case "subfamily":
        // For tribes, map each tribe to its corresponding samples
        return (taxonomy.subfamilies || [])
          .map((subfamily) => {
            // Implement your logic to find the samples for the given tribe
            // This is a placeholder; adapt it based on your actual data structure
            const subfamilySamples = allSpecieData
              .filter((data) => data.SUBFAMILY === subfamily)
              .map((data) => data.SAMPLE);
            return subfamilySamples;
          })
          .flat();

      case "supertribes":
        // For tribes, map each tribe to its corresponding samples
        return (taxonomy.supertribes || [])
          .map((supertribe) => {
            // Implement your logic to find the samples for the given tribe
            // This is a placeholder; adapt it based on your actual data structure
            const supertribeSamples = allSpecieData
              .filter((data) => data.SUPERTRIBE === supertribe)
              .map((data) => data.SAMPLE);
            return supertribeSamples;
          })
          .flat();

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

      case "genus":
        // For tribes, map each tribe to its corresponding samples
        return (taxonomy.genus || [])
          .map((genus) => {
            // Implement your logic to find the samples for the given tribe
            // This is a placeholder; adapt it based on your actual data structure
            const genusSamples = allSpecieData
              .filter((data) => data.GENUS === genus)
              .map((data) => data.SAMPLE);
            return genusSamples;
          })
          .flat();

      case "species":
        // For tribes, map each tribe to its corresponding samples
        return (taxonomy.species || [])
          .map((specie) => {
            // Implement your logic to find the samples for the given tribe
            // This is a placeholder; adapt it based on your actual data structure
            const specieSamples = allSpecieData
              .filter((data) => data.SPECIES === specie)
              .map((data) => data.SAMPLE);
            return specieSamples;
          })
          .flat();

      case "binarycombination":
        // For tribes, map each tribe to its corresponding samples
        return (taxonomy.binaryCombination || [])
          .map((bc) => {
            // Implement your logic to find the samples for the given tribe
            // This is a placeholder; adapt it based on your actual data structure
            const binaryCombinationSamples = allSpecieData
              .filter((data) => data.SPECIES_NAME_PRINT === bc)
              .map((data) => data.SAMPLE);
            return binaryCombinationSamples;
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
      .attr("stroke-width", ".50px")
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

<div class="toggle-container">
  <label class="toggle-label">
    Show Supertribes
    <input
      id="highlightCheckbox"
      type="checkbox"
      bind:checked={isTextHighlighted}
    />
    <span class="toggle-slider"></span>
  </label>

  <label class="toggle-label">
    Show Outgroups
    <input
      id="outgroupCheckbox"
      type="checkbox"
      bind:checked={areOutgroupsShown}
    />
    <span class="toggle-slider"></span>
  </label>
</div>

<!-- Container of tree -->
<div id="phyloTree" />

<style>
  #phyloTree {
    width: calc((100vw / 5) * 2.5);
    transform: translateY(-10%);
    margin: auto; /* Center horizontally */
    /* position: absolute;
  top: 50%;
  transform: translateY(-50%); Center vertically */
  }

  /* Style the toggle button */
  .toggle-container {
    position: absolute;
    left: 30px;
    bottom: 10px;
  }

  .toggle-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 200px; /* Adjust the width as needed */
    height: 26px;
    margin-bottom: 10px; /* Adjust the margin as needed */
  }

  .toggle-label input {
    display: none;
  }

  .toggle-slider {
    position: relative;
    cursor: pointer;
    width: 50px; /* Adjust the width as needed */
    height: 26px;
    background-color: #ccc;
    border-radius: 26px;
    transition: 0.4s;
  }

  .toggle-slider:before {
    content: "";
    position: absolute;
    height: 20px;
    width: 20px;
    top: 3px;
    left: 3px;
    background-color: white;
    border-radius: 50%;
    transition: 0.4s;
  }

  input:checked + .toggle-slider {
    background-color: green;
  }

  input:checked + .toggle-slider:before {
    transform: translateX(22px);
  }
</style>
