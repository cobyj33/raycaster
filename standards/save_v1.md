# The first iteration of the saving system for JJRaycaster
We will be using JSON, just since JSON itself is such a 
Images themselves will be stored as data base 64 strings, which may be a bad idea initially because of data size, but there is no server to store any textures and as of right now there is no plan to support storing textures in some sort of database or cloud

The JSON will first consist of 4 fields
-format
-map
-tiles
-camera
-skybox

### format
: str, a value that dictates the format of the JSON Saved, in case the format ever updates
In this case, it would simply be "v1"


### Map
Values:
- rows: int
- cols: int
- tiles: string[][] *the "tiles" will be the name of each tile in the map array

### Tiles
Values:
- TileName:
  - name: tileName
  - color:
    - red: int
    - blue: int
    - green: int
    - alpha: int
  - canHit: bool
  - texture: base64 | null
... continue with all tile names

### Camera
Values:
- position:
  - row: int
  - col: int
- direction:
  - row: int
  - col: int
- FOV: float (radians)
- viewDistance: int
- lookingAngle: float (radians)