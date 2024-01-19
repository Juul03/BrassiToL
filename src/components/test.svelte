<script>
    import { onMount } from 'svelte';
  import * as d3 from 'd3';


const removeSamplesAndAncestors = (node, targetSamples) => {
    console.log(node)
  if (node.branchset) {
    // Remove target samples from the current node's branchset
    node.branchset = node.branchset.filter((child) => !targetSamples.includes(child.name));

    // Recursively remove samples from each child and their ancestors
    node.branchset.forEach((child) => removeSamplesAndAncestors(child, targetSamples));

    // Remove the current node if it has no children and not the last sample
    if (node.branchset.length === 0 && !targetSamples.includes(node.name)) {
      delete node.branchset;
    }
  }
};

// Example usage:
const data = {name: '',
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

const targetSamples = ['sample1', 'sample3'];

removeSamplesAndAncestors(data, targetSamples);
console.log("test", data);
</script>