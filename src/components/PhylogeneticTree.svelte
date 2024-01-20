<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { selectedTaxonomyStore } from "$lib/selectedTaxonomyStore";

  let selectedTaxonomy = {};

  // let phyloTreeDataWithOutgroups;
  // let phyloTreeDataWithoutOutgroups;
  let phyloTreeData;
  let parsedData;

  let allSpecieData;

  let svgElement;
  let legendContainer;
  let sharedRoot;

  // Set up basic width and height
  const width = 900;
  const outerRadius = width / 2;
  const innerRadius = outerRadius - 170;

  // Variable that stores the fact that the supertribes are highlighted or not
  let isTextHighlighted = true;
  // Variable that stores the fact that the outgroups are shown or not
  let areOutgroupsShown = false;
  // Variable that stores the fact that the branchlengths are shown or not
  let isBrancheLengthShown = true;

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


  // const fetchPhylotreeData2 = async () => {
  //   try {
  //     const response = await fetch("/data/BrassiToL_easy.tree");
  //     // const response = await fetch("/data/BrassiToL_easy.tree");
  //     // const response = await fetch("/data/BrassiToL_easy_minus_outgroups.tree");
  //     if (response.ok) {
  //       const text = await response.text();
  //       phyloTreeDataWithOutgroups = text;
  //       // Call parseNewick after setting phyloTreeData
  //       phyloTreeDataWithOutgroups = parseNewick(phyloTreeDataWithOutgroups);
  //       // Now you can proceed with creating the phylogenetic tree using parsedData
  //       // Example: const svg = createPhylogeneticTree(parsedData);
  //     } else {
  //       console.error("Failed to fetch data:", response.status);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

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

  // Example usage:
const testData = {name: '',
  branchset: [
    {
      name: '',
      branchset: [
        {
          name: '',
          branchset: [
            { name: 'sample1', branchset: [], length: 3.263256 },
            { name: 'sample2', branchset: [], length: 5.203682 },
            { name: 'sample4', branchset: [], length: 7.345678 },
          ],
          length: 15.789012,
        },
        {
          name: '',
          branchset: [
            { name: 'sample5', branchset: [], length: 2.456789 },
            { name: 'sample6', branchset: [], length: 4.567890 },
          ],
          length: 12.345678,
        },
      ],
      length: 30.123456,
    },
    {
      name: '',
      branchset: [
        {
          name: '',
          branchset: [
            { name: 'sample3', branchset: [], length: 0 },
            { name: 'sample7', branchset: [], length: 1.234567 },
          ],
          length: 10.987654,
        },
        {
          name: '',
          branchset: [
            { name: 'sample8', branchset: [], length: 3.456789 },
            { name: 'sample9', branchset: [], length: 5.678901 },
          ],
          length: 15.789012,
        },
      ],
      length: 25.432109,
    },
  ],
};

  let findOutgroups = (parsedData) => {
  if (areOutgroupsShown) {
    // Create and update the phylogenetic tree with all data
    createTree(document.querySelector("#phyloTree"), parsedData);
  } else {
    const outgroupData = allSpecieData.filter(
      (data) => data.FAMILY !== "Brassicaceae"
    );

    if (outgroupData.length > 0) {
      const outgroupSamples = outgroupData.map((data) => data.SAMPLE);
      // const filteredParsedData = filterOutgroupsFromParsedData(
      //   parsedData,
      //   outgroupSamples
      // );

      // const outgroupSamples = ['sample1', 'sample3', 'sample7'];

      console.log("before", parsedData)
      // const filteredParsedData = removeSamplesAndAncestors(parsedData,outgroupSamples);
      // console.log("after", filteredParsedData);

      // Create and update the phylogenetic tree without the outgroups
      createTree(document.querySelector("#phyloTree"), parsedData);
    } else {
      // No outgroups found
      // Create and update the phylogenetic tree with all data if no outgroups found
      createTree(document.querySelector("#phyloTree"), parsedData);
    }
  }
};

  // let updateTree = (selected) => {
  //   sharedRoot.each((node) => {
  //     let isSelected = selected.includes(node.data.name);

  //     node.ancestors().forEach((ancestor) => {
  //       d3.select(ancestor.linkNode)
  //         .attr("stroke", isSelected ? "red" : "black")
  //         .attr("stroke-width", isSelected ? "2px" : ".35px");
  //     });
  //   });
  // };

  // Function that colors the text with the color of the corresponding supertribe
  let updateTextColors = () => {
    d3.select("svg")
      .selectAll("text")
      .style("fill", (d) => (isTextHighlighted ? d.color : "black"));
  };

  let createLegendContainer = () => {
  // Check if the legendContainer has any child nodes
  const container = document.getElementById("legendContainer");

  if (container && container.childNodes.length > 0) {
    // Clear the existing content of legendContainer
    container.innerHTML = "";
  } else {
    // Create the legend container only if it's not already created
    legendContainer = d3
      .select("#legendContainer")
      .append("div")
      .attr("class", "legend-container")  // Ensure that the class name matches the one in the CSS
      .style("position", "absolute")
      .style("bottom", "10px")
      .style("background", "var(--primary-color-light-1")
      .style("padding", "1rem")
      .style("border-radius", "var(--standard-border-radius")
      .style("left", "calc(50px + 100vw / 4)");
      
    legendContainer.append("h3").text("Supertribe legend").style("font-size", "var(--standard-font-size-header-small)");;
  }
}

  onMount(async () => {
    legendContainer = document.getElementById("legendContainer");

    await fetchPhylotreeData();
    await fetchAllSpecieData();
    // await fetchPhylotreeData2();

    // console.log(phyloTreeDataWithOutgroups);
    findOutgroups(parsedData);

    const highlightSupertribesToggleElement =
      document.querySelector("#highlightCheckbox");

    const showOutgroupsToggleElement =
      document.querySelector("#outgroupCheckbox");

    const showBranchLengthToggleElement = document.querySelector(
      "#branchLengthCheckbox"
    );

    let toggleHighlight = () => {
      updateTextColors();
    };

    let toggleShowOutgroups = () => {
      findOutgroups();
    };

    let toggleShowBranchLength = () => {
      // Get the link selection
      const linkSelection = d3.select("svg").selectAll("path");

      linkSelection
        .transition()
        .duration(500)
        .attr("d", isBrancheLengthShown ? linkVariable : linkConstant);

        if (isBrancheLengthShown == true) {
          // TODO: remove phyloTreeDataWithoutOutgroups to the general data of the tree, when the outgroups are filtered by a function with one source of tree
          createTimeRings(svgElement, phyloTreeDataWithoutOutgroups);
        } else {
          removeTimeRings(svgElement);
        }
    };

    highlightSupertribesToggleElement.addEventListener(
      "change",
      toggleHighlight
    );

    showOutgroupsToggleElement.addEventListener("change", toggleShowOutgroups);

    showBranchLengthToggleElement.addEventListener(
      "change",
      toggleShowBranchLength
    );

    const unsubscribe = selectedTaxonomyStore.subscribe((value) => {
      selectedTaxonomy = value || {}; // Make sure selectedTaxonomy is not null or undefined
      console.log('selected', selectedTaxonomy)

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
        ...taxonomySamplesBinaryCombination,
      ];
      updateTree(combinedSamples);
    });

    return () => {
      unsubscribe(); // Unsubscribe when the component is destroyed
    };
  });

  let updateTree = (selected) => {
    sharedRoot.each((node) => {
      let isSelected = selected.includes(node.data.name);

      node.ancestors().forEach((ancestor) => {
        d3.select(ancestor.linkNode)
          .attr("stroke", isSelected ? "red" : "black")
          .attr("stroke-width", isSelected ? "2px" : ".35px");
      });
    });
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
    console.log("in tree", data)
    const root = d3
      .hierarchy(data, (d) => d.branchset)
      .sum((d) => (d.branchset ? 0 : 1))
      .sort(
        (a, b) =>
          a.value - b.value || d3.ascending(a.data.length, b.data.length)
      );

    let maxTextWidth = 0;
    sharedRoot = root;

    cluster(root);
    setRadius(root, (root.data.length = 0), innerRadius / maxLength(root));
    setColor(root);

    const svg = d3
      .create("svg")
      .attr("viewBox", [-outerRadius, -outerRadius, width, width])
      .attr("font-family", "sans-serif")
      .attr("font-size", 10);

    svgElement = svg
    svg.call(legend, color);

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
      .attr("class", ".linkExtension")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-opacity", 0.25)
      .selectAll("path")
      .data(root.links().filter((d) => !d.target.children))
      .join("path")
      .each(function (d) {
        d.target.linkExtensionNode = this;
      })
      .attr("d", isBrancheLengthShown ? linkVariable : linkConstant);

    const link = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-width", ".35px")
      .selectAll("path")
      .data(root.links())
      .join("path")
      .each(function (d) {
        d.target.linkNode = this;
      })
      .attr("d", linkVariable);

    svg
  .append("g")
  .selectAll("g")
  .data(root.leaves())
  .join("g")
  .attr(
    "transform",
    (d) =>
      `rotate(${d.x}) ${
        d.x < 180
          ? `translate(${innerRadius + 4},0)`
          : `translate(${innerRadius + 4},0) rotate(180)`
      }`
  )
  .each(function (d) {
    let isHighlighted = d.data.name === "ERR4210213";

    // Append text
    const text = d3.select(this)
      .append("text")
      .attr("dy", ".31em")
      .attr("text-anchor", (d) => (d.x < 180 ? "start" : "end"))
      .attr("font-size", ".3rem")
      .attr("fill", (d) => (isTextHighlighted ? d.color : "black"))
      .text((d) => matchSampleWithSpecie(d.data.name, allSpecieData));

    // Use transition to get notified when rendering is complete
    text.transition().on("end", () => {
      const textWidth = text.node().getBBox().width;

       // Track the maximum width
       if (!maxTextWidth || textWidth > maxTextWidth) {
        maxTextWidth = textWidth;
        console.log("max",maxTextWidth)
      }

      // Append square
      d3.select(this)
      .append("rect")
      .attr("x", 0 - maxTextWidth - 25) // Position at the end of the maximum text width
      .attr("y", -1) // Adjust the y position as needed
      .attr("width", maxTextWidth - textWidth + 20) // Adjust the width as needed
      .attr("height", 2) // Adjust the height as needed
      .attr("fill", isHighlighted ? "red" : "black")
      .attr("transform", d.x < 180 ? "scale(-1)" : " ");
    });

    svg.selectAll("text")
  .on("mouseover", function(event, d) {
    mouseovered(true, event, d);
  })
  .on("mouseout", function(event, d) {
    mouseovered(false, event, d);
  });
  });

    function update(checked) {
      const t = d3.transition().duration(750);
      linkExtension
        .transition(t)
        .attr("d", checked ? linkExtensionVariable : linkExtensionConstant);
      link.transition(t).attr("d", checked ? linkVariable : linkConstant);
    }

    function mouseovered(active, event, d) {
      d3.select(this).classed("label--active", active);

      let ancestor = d;
      while (ancestor) {
        if (ancestor.linkNode) {
          d3.select(ancestor.linkNode)
            .attr("stroke", active ? d.color : "#000")
            .attr("stroke-width", active ? "2px" : ".35px")
            .raise();
        }
        ancestor = ancestor.parent;
      }
    }

    if (isBrancheLengthShown == true) {
      createTimeRings(svg, data);
    } else {
      removeTimeRings(svg);
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

  let legend = (svg, colorScale) => {
    createLegendContainer();

    const legendItems = legendContainer
        .selectAll("li")
        .data(colorScale.domain())
        .enter()
        .append("li")
        .style("display", "flex")
        .style("align-items", "center")
        .style("font-size", "var(--standard-font-size-body-small)");

    legendItems
        .append("div")
        .style("width", "11px")
        .style("height", "11px")
        .style("border-radius", "50%")
        .style("margin-right", "5px")
        .style("background-color", (d) => colorScale(d));

    legendItems.append("span").text((d) => d);
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

  function linkVariable(d) {
    return linkStep(d.source.x, d.source.radius, d.target.x, d.target.radius);
  }

  // Function to create time rings
function createTimeRings(svg, data) {
  const branchLengths = []; // Array to store branch lengths

  // Extract branch lengths from the tree data
  function extractBranchLengths(node) {
    if (Array.isArray(node.branchset)) {
      node.branchset.forEach((branch) => {
        branchLengths.push(branch.length || 0); // Include the length of the current branch

        if (Array.isArray(branch.branchset)) {
          // Recursively call the function to handle nested branchsets
          extractBranchLengths(branch);
        }
      });
    }
  }

  extractBranchLengths(data);

  // Find the maximum value in branchLengths
  const maxBranchLength = d3.max(branchLengths);

  // Choose the number of rings you want to display
  const numberOfRings = 6;

  // Calculate the interval between rings
  const ringInterval = maxBranchLength / numberOfRings;

  // Create an array of evenly distributed values for the rings
  const ringValues = Array.from({ length: numberOfRings }, (_, i) => i * ringInterval);

  // Sort ringValues in descending order
  const sortedRingValues = ringValues.slice().reverse();

  // Set up a linear scale based on branch lengths
  const timeScale = d3.scaleLinear()
    .domain([0, d3.max(branchLengths)]) 
    .range([0, innerRadius]);

  const colorScale = ['#b6c3ab', '#c3ceba', '#d0d8c9', '#dde3d8', '#eaeee7', '#f7f8f6'];

  // Append circles for time rings
  let timerings = svg.selectAll(".time-ring")
    .data(ringValues)
    .enter()
    .append("circle")
    .attr("class", "time-ring")
    .attr("cx", 0) 
    .attr("cy", 0)
    .attr("r", 0)
    .attr("fill", (d, i) => colorScale[i - 1 % colorScale.length])
    .attr("stroke", "lightgrey")
    .attr("stroke-dasharray", "3,3")
    .lower();

    timerings.transition()
    .duration(500)
    .attr("r", (d) => timeScale(d))

    // Append text labels for time rings
  let timelabels = svg.selectAll(".time-label")
    .data(sortedRingValues)
    .enter()
    .append("text")
    .attr("class", "time-label")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", "0.5em") 
    .attr("fill", "grey")
    .attr("font-size", ".5rem")
    .attr("text-anchor", "middle")
    .text((d) => `${Math.round(d)} MA`);

    timelabels.transition().duration(500)
    .attr("x", (d) => timeScale(d));
    
}

// Function to remove time rings
function removeTimeRings(svg) {
  svg.selectAll(".time-ring").transition()
    .duration(500)
    .attr("r", 0)
    .remove();
  svg.selectAll(".time-label").transition()
    .duration(500)
    .attr("x", 0)
    .attr("fill", "transparent")
    .remove();
}
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

  <label class="toggle-label">
    Show Branch Length
    <input
      id="branchLengthCheckbox"
      type="checkbox"
      bind:checked={isBrancheLengthShown}
    />
    <span class="toggle-slider"></span>
  </label>
</div>

<!-- Container of tree -->
<div id="phyloTree" />
<div id="legendContainer" />

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
    left: 1rem;
    bottom: 10px;
    width:calc(100vw/4);
    height:13%;

    display:flex;
    flex-direction:column;
    gap:.25rem;
    margin:auto;
    justify-content:center;
    align-items:center;

    background:var(--primary-color-light-2);
    border-radius:var(--standard-border-radius);
  }

  .toggle-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 90%;

    font-size:var(--standard-font-size-body-small);
    font-style:var(--standard-font-style-body-small);
    font-weight:500;
  }

  .toggle-label input {
    display: none;
  }

  .toggle-slider {
    position: relative;
    cursor: pointer;
    width: 40px; /* Adjust the width as needed */
    height: 20px;
    background-color: var(--primary-color-light-2);
    border-radius: 26px;
    border:2px solid var(--primary-color-dark-1);
    transition: var(--basic-transition-time);
  }

  .toggle-slider:before {
    content: "";
    position: absolute;
    height: 15px;
    width: 15px;
    top: 3px;
    left: 3px;
    background-color: var(--primary-color-dark-1);
    border-radius: 50%;
    transition: var(--standard-transition-time);
  }

  input:checked + .toggle-slider {
    border:2px solid transparent;
    background-color: var(--primary-color-dark-1);
  }

  input:checked + .toggle-slider:before {
    background-color: white;
    transform: translateX(19px);
  }
</style>
