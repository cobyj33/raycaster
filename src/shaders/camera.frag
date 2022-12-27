precision mediump float;
uniform vec2 resolution;
uniform sampler2D cameraLines; // Height of 2, length of resolution, (vec4(lineHeightPercentage, red, green, blue), vec4(darkenPercentage, 0, 0, 0))
uniform int numOfCameraLines;
uniform float centerLineHeight;

bool inRange(float num, float start, float end) {
    return num >= start && num <= end;
}

vec4 darkenColor(vec4 color, float percentage) {
    return vec4((1.0 - percentage) * color.xyz, color.w);
}

void main() {
    float PERCENTAGE_ACROSS_SCREEN = gl_FragCoord.x / resolution.x;
    vec2 texcoord = vec2(PERCENTAGE_ACROSS_SCREEN, 0.0);
    vec2 extraDataCoord = vec2(PERCENTAGE_ACROSS_SCREEN, 1.0);
    vec4 lineData = texture2D(cameraLines, texcoord); // lineHeightPercentage, r, g, b
    vec4 extraData = texture2D(cameraLines, extraDataCoord); // darkenPercentage, EMPTY, EMPTY, EMPTY

    float PERCENTAGE_UP_SCREEN = gl_FragCoord.y / resolution.y;

    if (inRange(PERCENTAGE_UP_SCREEN, centerLineHeight - (lineData.x / 2.0), centerLineHeight + (lineData.x / 2.0))) {
        gl_FragColor = darkenColor(vec4(lineData.yzw, 1.0), extraData.x);
    } else {
        gl_FragColor = vec4(0, 0, 0, 0);
    }
}