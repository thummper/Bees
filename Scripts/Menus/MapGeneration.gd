extends Node2D
const Delaunator = preload("res://Scripts/Delaunator.gd");


const cell = preload("res://Scripts/Cell.gd");

export var width = 1204;
export var height = 1024;
export var numPoints = 100;
var allPoints = PoolVector2Array()
var delaunay;
var relaxCounter = 0;
export var maxRelax = 4;
var cells = [];

var triangles = [];
var sites = [];



func generateVoronoi():
	delaunay = Delaunay.new(Rect2(0,0,width,height));
	for p in allPoints:
		delaunay.add_point(p);
	triangles = delaunay.triangulate();
	sites = delaunay.make_voronoi(triangles);
	

	
	
	
	
	
	#assembleCells(allPoints, delaunay);
	
	#for c in cells:
		#print("CELL: ", c.vertices);
		
		
	while relaxCounter < maxRelax:
		lloydRelaxation();
		relaxCounter += 1;	

func generatePoints():

	
	for n in range(numPoints):
		var x = rand_range(0, width);
		var y = rand_range(0, height);
		print("POINT: ", x, y);
		var point = Vector2(x, y);
		allPoints.append(point);
		
func lloydRelaxation():
	# Iterate over cells and average coords
	var pointsFormatted = [];
	var newPoints = [];
	for c in cells:
		var xTotal = 0;
		var yTotal = 0;
		
		for v in c.vertices:
			# P sure v is an index for something
			# print(v[0], " ", v[1])
			xTotal += v[0];
			yTotal += v[1];
			
		xTotal /= c.vertices.size();
		yTotal /= c.vertices.size();
		
		xTotal = round(xTotal);
		yTotal = round(yTotal);
		
		
		newPoints.push_back(Vector2(xTotal, yTotal))
		
		pointsFormatted.push_back(xTotal);
		pointsFormatted.push_back(yTotal);
		
	# Update the voronoi
	delaunay.coords = pointsFormatted;
	# print(pointsFormatted);
	allPoints = newPoints;
	delaunay = Delaunator.new(allPoints);
	#delaunay.update();
	assembleCells(allPoints, delaunay);
	
	
func relaxMap():
	lloydRelaxation();
	
func assignNeighbours():
	for c in range(0, cells.size()):
		var c1 = cells[c];
		for d in range(0, cells.size()):
			var testCell = cells[d];
			if(d != c):
				if(c1.isNeighbour(testCell)):
					c1.addNeighbour(testCell);
					testCell.addNeighbour(c1);



func _unhandled_input(event):
	if event is InputEventMouseButton:
		if event.is_pressed():
			if event.button_index == BUTTON_LEFT:
				print("MOUSE CLICKED: ", event.global_position)
				highlightClicked(get_global_mouse_position())
#func _input(event):
#	if event is InputEventMouseButton:
#
#		var pos = get_global_mouse_position();
#		print("MOUSE CLICKED AT: ", pos);
#		highlightClicked(pos);
	
	
var closest = null;
func highlightClicked(pos):
	var lowd = INF;
	for s in sites:
		var d = s.center.distance_to(pos);
		if d < lowd:
			lowd = d;
			closest = s;
	
	var boundary = closest.get_boundary()
	if(boundary.has_point(pos)):
		closest.color = Color(255, 0, 0);
		update();
			
	print("CLOSEST: ", closest);
	



func generateMap():
	# 1 - Generate points
	generatePoints();
	
	# Print all points
	for p in allPoints:
		print("DEBUG POINT: ", p.x, p.y);
	
	generateVoronoi();
	assignNeighbours();
	
	


	
	
	
	
	while(relaxCounter < maxRelax):
		relaxMap();
		relaxCounter += 1;



# Called when the node enters the scene tree for the first time.
func _ready():
	# Generate random points within a region
	generateMap();

	
	
func _draw():
	if allPoints.size() > 0:
		
		for site in sites:
			if !delaunay.is_border_site(site):
				var color = site.color;
				if color == Color.black:
					color = Color(randf(), randf(), randf(), 1)
				draw_polygon(site.polygon, [color]);
		
		#draw_points()
		#draw_voronoi_cells(allPoints, delaunay)
		#draw_voronoi_cells_convex_hull(allPoints, delaunay)
		
		#for c in cells:
			#var color = Color(randf(), randf(), randf(), 1)
			#draw_circle(c.centerPoint, 5, Color("#bf4040"));
			#draw_polygon(c.cell, PoolColorArray([c.col]))	
			



# Called every frame. 'delta' is the elapsed time since the previous frame.
#func _process(delta):
#	pass

func assembleCells(points, delaunay):
	
	cells = [];
	
	var index = {}
	for e in delaunay.triangles.size():
		var endpoint = delaunay.triangles[next_half_edge(e)]
		if (!index.has(endpoint) or delaunay.halfedges[e] == -1):
			index[endpoint] = e

	for p in points.size():
		var triangles = []
		var vertices = []
		var incoming = index.get(p)

		if incoming == null:
			triangles.append(0)
		else:
			var edges = edges_around_point(delaunay, incoming)
			for e in edges:
				triangles.append(triangle_of_edge(e))

		for t in triangles:
			vertices.append(triangle_center(points, delaunay, t))

		if triangles.size() > 2:
			var c = cell.new(points[p]);
			c.vertices = vertices;
			c.triangles = triangles;
			var voronoi_cell = PoolVector2Array()
			for vertice in vertices:
				voronoi_cell.append(Vector2(vertice[0], vertice[1]))			
			c.cell = voronoi_cell;
			cells.push_back(c);
			




# Functions from example dela
func draw_voronoi_cells(points, delaunay):
	var seen = []
	for e in delaunay.triangles.size():
		var triangles = []
		var vertices = []
		var p = delaunay.triangles[next_half_edge(e)]
		if not seen.has(p):
			seen.append(p)
			var edges = edges_around_point(delaunay, e)
			for edge in edges:
				triangles.append(triangle_of_edge(edge))
			for t in triangles:
				vertices.append(triangle_center(points, delaunay, t))

		if triangles.size() > 2:
			var color = Color(randf(), randf(), randf(), 1)
			var voronoi_cell = PoolVector2Array()
			for vertice in vertices:
				voronoi_cell.append(Vector2(vertice[0], vertice[1]))
				
			print(voronoi_cell);
			draw_polygon(voronoi_cell, PoolColorArray([color]))
			
			
func draw_voronoi_cells_convex_hull(points, delaunay):
	var index = {}
	for e in delaunay.triangles.size():
		var endpoint = delaunay.triangles[next_half_edge(e)]
		if (!index.has(endpoint) or delaunay.halfedges[e] == -1):
			index[endpoint] = e

	for p in points.size():
		var triangles = []
		var vertices = []
		var incoming = index.get(p)

		if incoming == null:
			triangles.append(0)
		else:
			var edges = edges_around_point(delaunay, incoming)
			for e in edges:
				triangles.append(triangle_of_edge(e))

		for t in triangles:
			vertices.append(triangle_center(points, delaunay, t))

		if triangles.size() > 2:
			var color = Color(randf(), randf(), randf(), 1)
			var voronoi_cell = PoolVector2Array()
			for vertice in vertices:
				voronoi_cell.append(Vector2(vertice[0], vertice[1]))
			draw_polygon(voronoi_cell, PoolColorArray([color]))			

func draw_points():
	for point in allPoints:
		draw_circle(point, 5, Color("#bf4040"))
		
		
func draw_triangle_centers():
	for t in delaunay.triangles.size() / 3:
		draw_circle(
			Vector2(
				triangle_center(allPoints, delaunay, t)[0],
				triangle_center(allPoints, delaunay, t)[1]
			), 5, Color.white)
		draw_circle(
			Vector2(
				triangle_center(allPoints, delaunay, t)[0],
				triangle_center(allPoints, delaunay, t)[1]
			), 4, Color("#4040bf"))


func edges_of_triangle(t):
	return [3 * t, 3 * t + 1, 3 * t + 2]


func triangle_of_edge(e):
	return floor(e / 3)


func next_half_edge(e):
	return e - 2 if e % 3 == 2 else e + 1


func prev_half_edge(e):
	return e + 2 if e % 3 == 0 else e - 1


func points_of_triangle(points, delaunay, t):
	var points_of_triangle = []
	for e in edges_of_triangle(t):
		points_of_triangle.append(points[delaunay.triangles[e]])
	return points_of_triangle


func edges_around_point(delaunay, start):
	var result = []
	var incoming = start
	while true:
		result.append(incoming);
		var outgoing = next_half_edge(incoming)
		incoming = delaunay.halfedges[outgoing];
		if not (incoming != -1 and incoming != start): break
	return result


func triangle_adjacent_to_triangle(delaunay, t):
	var adjacent_triangles = []
	for e in edges_of_triangle(t):
		var opposite = delaunay.halfedges[e]
		if opposite >= 0:
			adjacent_triangles.append(triangle_of_edge(opposite))

	return adjacent_triangles;


func triangle_center(p, d, t, c = "circumcenter"):
	var vertices = points_of_triangle(p, d, t)
	match c:
		"circumcenter":
			return circumcenter(vertices[0], vertices[1], vertices[2])
		"centroid":
			return centroid(vertices[0], vertices[1], vertices[2])
		"incenter":
			return incenter(vertices[0], vertices[1], vertices[2])


func circumcenter(a, b, c):
	var ad = a[0] * a[0] + a[1] * a[1]
	var bd = b[0] * b[0] + b[1] * b[1]
	var cd = c[0] * c[0] + c[1] * c[1]
	var D = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]))

	return [
		1 / D * (ad * (b[1] - c[1]) + bd * (c[1] - a[1]) + cd * (a[1] - b[1])),
		1 / D * (ad * (c[0] - b[0]) + bd * (a[0] - c[0]) + cd * (b[0] - a[0]))
	]


func centroid(a, b, c):
	var c_x = (a[0] + b[0] + c[0]) / 3
	var c_y = (a[1] + b[1] + c[1]) / 3

	return [c_x, c_y]


func incenter(a, b, c):
	var ab = sqrt(pow(a[0] - b[0], 2) + pow(b[1] - a[1], 2))
	var bc = sqrt(pow(b[0] - c[0], 2) + pow(c[1] - b[1], 2))
	var ac = sqrt(pow(a[0] - c[0], 2) + pow(c[1] - a[1], 2))
	var c_x = (ab * a[0] + bc * b[0] + ac * c[0]) / (ab + bc + ac)
	var c_y = (ab * a[1] + bc * b[1] + ac * c[1]) / (ab + bc + ac)

	return [c_x, c_y]		
