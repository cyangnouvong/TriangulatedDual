// Chelsea Yangnouvong
// Provided code for Project 5

let tetra,octa,icosa,star,torus;

let animate_flag = 1;
let normal_flag = 0;
let random_flag = 0;

let time = 0;  // records the passage of time, used to move the objects

let gTable = [];
let vTable = [];
let oTable = [];
let randomList = [];
let rand = 0;

// read in the polygon mesh files
function preload() {
  tetra = loadStrings('assets/tetra.txt');
  octa = loadStrings('assets/octa.txt');
  icosa = loadStrings('assets/icosa.txt');
  star = loadStrings('assets/star.txt');
  torus = loadStrings('assets/torus.txt');
}

// called once at the start of the program
function setup() {
  createCanvas(600, 600, WEBGL);
  
  let fov = 60.0;  // 60 degrees field of view
  perspective(PI * fov / 180.0, width / height, 0.1, 2000);
}

// handle key press commands
function keyPressed() {
  console.log ("key pressed\n");
  switch(key) {
    case ' ':  animate_flag = 1 - animate_flag; break;
    case '1':  parse_polys(tetra); break;
    case '2':  parse_polys(octa); break;
    case '3':  parse_polys(icosa); break;
    case '4':  parse_polys(star); break;
    case '5':  parse_polys(torus); break;
    case 'd':  create_dual(); break;
    case 'n':  normal_flag = 1 - normal_flag; break;
    case 'r':  random_flag = 1 - random_flag; break;
    case 'q':  debugger; break;
  }
}

// called repeatedly to create new per-frame images
function draw() {
  
  rand = 0;
  
  background(200, 200, 255);  // light blue background
  
  // set the virtual camera position
  camera(0, 0, 85, 0, 0, 0, 0, 1, 0);  // from, at, up
  
  // include a little bit of light even in shadows
  ambientLight(40, 40, 40);
  
  // set the light position
  pointLight(255, 255, 255, 100, -100, 300);

  noStroke();  // don't draw polygon outlines
  
  fill (255, 255, 255);
  
  push();
  let mesh_axis = createVector (0, 1, 0);
  rotate (-time, mesh_axis);
  
  beginShape();
  scale(13);
  for (var i = 0; i < vTable.length / 3; i++) {
    var index1 = vTable[i * 3];
    var index2 = vTable[i * 3 + 1];
    var index3 = vTable[i * 3 + 2];
    
    var n1 = calculateSurfaceNorm(index1, index2, index3);
    var n2 = calculateSurfaceNorm(index2, index1, index3);
    var n3 = calculateSurfaceNorm(index3, index2, index1);
    var n = p5.Vector.add(p5.Vector.add(n1, n2), n3);
    
    if (random_flag == 1) {
      fill(randomList[rand].x, randomList[rand].y, randomList[rand].z);
      rand++;
    }
    
    if (normal_flag == 0) {
      beginShape();
      vertexNormal(n.normalize());
      vertex(gTable[index1].x, gTable[index1].y, gTable[index1].z);
      vertex(gTable[index2].x, gTable[index2].y, gTable[index2].z);
      vertex(gTable[index3].x, gTable[index3].y, gTable[index3].z);
      endShape (CLOSE);
    } else if (normal_flag == 1) {
      beginShape();
      vertexNormal(gTable[index1]);
      vertex(gTable[index1].x, gTable[index1].y, gTable[index1].z);
      vertexNormal(gTable[index2]);
      vertex(gTable[index2].x, gTable[index2].y, gTable[index2].z);
      vertexNormal(gTable[index3]);
      vertex(gTable[index3].x, gTable[index3].y, gTable[index3].z);
      endShape (CLOSE);
    }
  }
  endShape(CLOSE);
  
  // this is where you should draw your collection of polygons
  
  pop();
  
  // maybe update time
  if (animate_flag)
    time += 0.02;
}

// Parse a polygon mesh file.
//
// This function currently prints the vertices and faces to the console,
// but you should modify it to save this data in your own mesh data structure.
function parse_polys(s) {
  
  gTable = [];
  vTable = [];
  
  console.log ("in read_polys()");
  
  let vertex_count,face_count;
  let tokens = [];

  // go through all the lines in the file and separate the tokens
  for (let i = 0; i < s.length; i++) {
    tokens[i] = s[i].split(" ");
    //console.log (tokens[i]);
  }

  vertex_count = parseInt(tokens[0][1]);
  face_count = parseInt(tokens[1][1]);
  
  console.log ("vertex count = " + vertex_count);
  console.log ("face count = " + face_count);
  
  // read in the vertex coordinates
  for (let i = 0; i < vertex_count; i++) {
    let tlist = tokens[i+2];
    let x = parseFloat(tlist[0]);
    let y = parseFloat(tlist[1]);
    let z = parseFloat(tlist[2]);
    gTable[i] = createVector(x, y, z);
    console.log ("xyz: " + x + " " + y + " " + z);
  }

  // read in the face indices
  for (let i = 0; i < face_count; i++) {
    let tlist = tokens[i + vertex_count + 2];
    let nverts = parseInt(tlist[0]);
    let v1 = parseInt(tlist[1]);
    let v2 = parseInt(tlist[2]);
    let v3 = parseInt(tlist[3]);
    vTable[i * 3] = v1;
    vTable[i * 3 + 1] = v2;
    vTable[i * 3 + 2] = v3;
    console.log ("verts: " + v1 + " " + v2 + " " + v3);
  }

  opposite();
  
  console.log ("end of read_polys()");
}

// This function should produce the triangulated dual of your current mesh
function create_dual() {
  var newgTable = [];
  var newvTable = [];
  
  for (var i = 0; i < gTable.length; i++) {
    for (var j = 0; j < vTable.length; j++) {
      if (vTable[j] == i) {
        var centroids = [];
        var temp = [];
        var target = j;
        var average = createVector(0, 0, 0);
        
        // calculate centroid of each triangle
        do {
          var cVertex = gTable[vTable[target]];
          var cNextVertex = gTable[vTable[nextCorner(target)]];
          var cPrevVertex = gTable[vTable[prevCorner(target)]];
          var x = (cVertex.x + cNextVertex.x + cPrevVertex.x) / 3;
          var y = (cVertex.y + cNextVertex.y + cPrevVertex.y) / 3;
          var z = (cVertex.z + cNextVertex.z + cPrevVertex.z) / 3;
          centroids[centroids.length] = createVector(x, y, z);
          
          // add if not already a vertex
          if (find(newgTable, centroids[centroids.length - 1] == -1)) {
            newgTable[newgTable.length] = centroids[centroids.length - 1];
          }
          
          temp[temp.length] = find(newgTable, centroids[centroids.length - 1]);
          
          // average of the triangle centroids
          average = p5.Vector.add(average, centroids[centroids.length - 1]);
          target = swing(target);
        } while (target != j);
        
        newgTable[newgTable.length] = createVector(average.x / centroids.length, average.y / centroids.length, average.z / centroids.length)
        
        for (var q = 0; q < centroids.length; q++) {
          newvTable[newvTable.length] = newgTable.length - 1;
          newvTable[newvTable.length] = temp[q];
          newvTable[newvTable.length] = temp[q + 1];
          if (q == centroids.length - 1) {
            newvTable[newvTable.length - 1] = temp[0];
          }
        }
        break;
      }
    }
  }
  gTable = newgTable;
  vTable = newvTable;
  opposite();
}

function nextCorner(curr) {
  return Math.floor(curr / 3) * 3 + ((curr + 1) % 3);
}

function prevCorner(curr) {
  return nextCorner(nextCorner(curr));
}

function swing(curr) {
  var next = nextCorner(curr);
  var opp = oTable[next];
  return nextCorner(opp);
}

function calculateSurfaceNorm(index1, index2, index3) {
  var AB = p5.Vector.sub(gTable[index2], gTable[index1]);
  var AC = p5.Vector.sub(gTable[index3], gTable[index1]);
  var n = p5.Vector.cross(AB, AC);
  return n;
}

function opposite() {
  oTable = [];
  for (var i = 0; i < vTable.length; i++) {
    for (var j = 0; j < vTable.length; j++) {
      var vecINext = gTable[vTable[nextCorner(i)]];
      var vecIPrev = gTable[vTable[prevCorner(i)]];
      var vecJNext = gTable[vTable[nextCorner(j)]];
      var vecJPrev = gTable[vTable[prevCorner(j)]];
      if (equals(vecINext, vecJPrev) && equals(vecIPrev, vecJNext)) {
        oTable[i] = j;
        oTable[j] = i;
      }
    }
  }
  for (var r = 0; r < vTable.length; r++) {
    randomList[r] = createVector(random(256), random(256), random(256));
  }
  /*
  for (var i = 0; i < oTable.length; i++) {
    print(i + " : " + oTable[i] + "\n");
  }
  */
}

function equals(v1, v2) {
  //return v1.x == v2.x && v1.y == v2.y && v1.z && v2.z; does not work ?
  return abs(v1.x - v2.x) < 0.00001 && abs(v1.y - v2.y) < 0.00001 && abs(v1.z - v2.z) < 0.00001;
}

function find(l, g) {
  for(var i = 0; i < l.length; i++) {
    if (equals(l[i], g)) {
      return i;
    }
  }
  return -1
}
