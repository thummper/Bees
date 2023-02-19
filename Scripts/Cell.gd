extends Polygon2D

var vertices = []
var triangles = [];
var centerPoint = null
var cell = [];
var col = Color(0, 255, 0);
var neighbours = [];


func _init(cp):
	centerPoint = cp;


func addNeighbour(cell):
	neighbours.push_back(cell);


func isNeighbour(testCell):
	# Test our vertices against testCell vertices
	for v in vertices:
		if testCell.vertices.has(v):
			return true;
	
	
