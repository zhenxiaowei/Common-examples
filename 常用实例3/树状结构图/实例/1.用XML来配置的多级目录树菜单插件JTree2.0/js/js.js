
	var myTree=new JTree("showTree","vogueType.xml");
	myTree.setPicPath("JTreePic/");
	myTree.create();
	myTree.root.treeNodes[0].treeNodes[1].click();
	myTree.treeNodes[0].treeNodes[1].expand(false);
	myTree.treeNodes[0].treeNodes[2].expand(false);

