<script>
    function parseNewick(newickString) {
      var ancestors = [];
      var tree = {};
      var tokens = newickString.split(/\s*(;|\(|\)|,|:)\s*/);
  
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
  
        switch (token) {
          case '(':
            var subtree = {};
            if (tree.branchset) {
              tree.branchset.push(subtree);
            } else {
              tree.branchset = [subtree];
            }
            ancestors.push(tree);
            tree = subtree;
            break;
          case ',':
            var subtree = {};
            ancestors[ancestors.length - 1].branchset.push(subtree);
            tree = subtree;
            break;
          case ')':
            tree = ancestors.pop();
            break;
          case ':':
            break;
          default:
            var prevToken = tokens[i - 1];
            if (prevToken == ')' || prevToken == '(' || prevToken == ',') {
              tree.name = token;
            } else if (prevToken == ':') {
              tree.length = parseFloat(token);
            }
        }
      }
  
      return tree;
    }
  
    function pruneTree(tree, pruneFunction) {
      if (pruneFunction(tree)) {
        return null; // Prune the current branch if pruneFunction returns true
      }
  
      if (tree.branchset) {
        // Recursively prune branches from the branchset
        tree.branchset = tree.branchset
          .map((child) => pruneTree(child, pruneFunction))
          .filter((child) => child !== null);
  
        // Remove the branchset property if it becomes empty after pruning
        if (tree.branchset.length === 0) {
          delete tree.branchset;
        }
      }
  
      return tree;
    }
  
    var newickString = "(A:0.1,B:0.2,((C:0.3,D:0.4)E:0.5)F);";
  
    var parsedTree = parseNewick(newickString);
    console.log(JSON.stringify(parsedTree, null, 2))

    let pruneFunction = (branch) => {
      // Return true to prune branches with name "C"
      return branch.name === 'C';
    }
  
    var prunedTree = pruneTree(parsedTree, pruneFunction);

    console.log(JSON.stringify(prunedTree, null, 2));
  </script>
  