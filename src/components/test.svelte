<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";

  // TODO: change this so the string is fetched from the file
  const exampleNewick =
    "(ant:17, (bat:31, cow:22):7, dog:22, (elk:33, fox:12):40)";

  // Parsing the Newick string
  const parsedData = parseNewick(exampleNewick);

  console.log("data", parsedData);

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

  onMount(() => {
    const svg = createPhylogeneticTree(parsedData);
    document.querySelector("#phyloTree").appendChild(svg.node());
  });



  const createPhylogeneticTree = (data) => {
    const root = d3
      .hierarchy(data, (d) => d.branchset)
      .sum((d) => (d.branchset ? 0 : 1))
      .sort(
        (a, b) =>
          a.value - b.value || d3.ascending(a.data.length, b.data.length)
      );

    const cluster = d3.cluster().size([2 * Math.PI, innerRadius]);

    cluster(root);

    const svg = d3
      .create("svg")
      .attr("viewBox", [-outerRadius, -outerRadius, width, width])
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .style("display", "block")
      .style("margin", "auto")
      .style("width", "100%")
      .style("height", "auto");

    svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-opacity", 0.4)
      .selectAll("line")
      .data(root.links())
      .join("line")
      .attr("x1", (d) => d.source.y * Math.cos(d.source.x - Math.PI / 2))
      .attr("y1", (d) => d.source.y * Math.sin(d.source.x - Math.PI / 2))
      .attr("x2", (d) => d.target.y * Math.cos(d.target.x - Math.PI / 2))
      .attr("y2", (d) => d.target.y * Math.sin(d.target.x - Math.PI / 2));

    svg
      .append("g")
      .selectAll("circle")
      .data(root.descendants())
      .join("circle")
      .attr(
        "transform",
        (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`
      )
      .attr("fill", (d) => (d.children ? "#555" : "#999"))
      .attr("r", 2);

    return svg;
  };
</script>

<h2>Test Kaas</h2>
<div id="phyloTree" />

<style>
  #phyloTree {
    width: 100%;
    height: 500px;
    /* Add any other styling for the tree container */
  }
</style>
