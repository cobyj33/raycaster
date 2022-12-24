import _ from "lodash"

export async function fetchTextFile(str: string): Promise<string> {
  const res = await fetch(str)
  const text = await res.text()
  return text
}

// type WebGLContext = WebGL2RenderingContext | WebGLRenderingContext
type WebGLContext = WebGL2RenderingContext


export function compileShader(gl: WebGLContext, type: WebGLContext["VERTEX_SHADER"] | WebGLContext["FRAGMENT_SHADER"], source: string): WebGLShader {
  const shader = gl.createShader(type)
  if (shader !== null && shader !== undefined) {
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) === true) {
      return shader
    }
    throw new Error(`could not compile shader: ${gl.getShaderInfoLog(shader)}`);
  }
  throw new Error(`Could not create webgl shader of type ${ type }  `)
}

export interface WebGLInfoLog {
  status: boolean
  log: string
}

export function testShaderCompilation(gl: WebGLContext, shader: WebGLShader): WebGLInfoLog {
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success === false) {
    return {
      status: false,
      log: gl.getShaderInfoLog(shader) || ""
    }
  }

  return {
    status: true,
    log: ""
  }
}

export function testProgramLinking(gl: WebGLContext, program: WebGLProgram): WebGLInfoLog {
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success === false) {
    return {
      status: false,
      log: gl.getProgramInfoLog(program) || ""
    }
  }

  return {
    status: true,
    log: ""
  }

}

export function compileProgram(gl: WebGLContext, vertex: WebGLShader, fragment: WebGLProgram): WebGLProgram {
  const program = gl.createProgram()
  if (program !== null && program !== undefined) {
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success === true) {
      return program
    }
    throw new Error(` Could not link program: ${gl.getProgramInfoLog(program)} `)
  }
  throw new Error(`Could not create WebGL Program object`)
}

export function compileProgramFromSourceStrings(gl: WebGLContext, vSource: string, fSource: string): WebGLProgram {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vSource)
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fSource)
  return compileProgram(gl, vertexShader, fragmentShader)
}

export function fillBufferData(gl: WebGLContext, bufferType: number, buffer: WebGLBuffer, data: BufferSource) {
  gl.bindBuffer(bufferType, buffer)
  gl.bufferData(bufferType, data, gl.STATIC_DRAW)
  gl.bindBuffer(bufferType, null)
}

export function createVertexBuffer(gl: WebGLContext, data: number[]): WebGLBuffer {
  const vBuf = gl.createBuffer()
  if (vBuf !== null && vBuf !== undefined) {
    fillBufferData(gl, gl.ARRAY_BUFFER, vBuf, new Float32Array(data))
    return vBuf
  }
  throw new Error(`Failed to create WebGL Vertex Buffer from data ${data}`)
}

export function createElementArrayBuffer(gl: WebGLContext, data: number[]) {
  const eBuf = gl.createBuffer()
  if (eBuf !== null && eBuf !== undefined) {
    fillBufferData(gl, gl.ELEMENT_ARRAY_BUFFER, eBuf, new Uint16Array(data))
    return eBuf
  }
  throw new Error(`Failed to create WebGL Element Array Buffer from data ${data}`)
}

export async function compileProgramFromFiles(gl: WebGLContext, vPath: string, fPath: string): Promise<WebGLProgram> {
  const vertexShaderSource = await fetchTextFile(vPath)
  const fragmentShaderSource = await fetchTextFile(fPath)
  return compileProgramFromSourceStrings(gl, vertexShaderSource, fragmentShaderSource)
}

