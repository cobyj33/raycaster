precision mediump float;
uniform vec2 resolution;
uniform sampler2D cameraLines; // Height of 3, length of resolution, (vec4(lineHeightPercentage, red, green, blue), vec4(darkenPercentage, (0 or 1) hasTexture, percentageAcrossBox, 0), vec4(textureX, textureY, textureWidth, textureHeight))
uniform int numOfCameraLines;
uniform float centerLineHeight;

uniform sampler2D textureAtlas;
uniform vec2 textureAtlasResolution;

bool inRange(float num, float start, float end) {
    return num >= start && num <= end;
}

vec4 darkenColor(vec4 color, float percentage) {
    return vec4((1.0 - percentage) * color.xyz, color.w);
}

// position: 
vec4 fromAtlas(vec2 relativeTexel, vec4 atlasTextureBox) {
    // vec2 yAtBottom = vec2(atlasTextureBox.x, atlasTextureBox.y + atlasTextureBox.z);
    // vec2 translatedBox = yAtBottom.xy / textureAtlasResolution;
    // vec2 scaledRelativeTexel = relativeTexel / textureAtlasResolution;
    // return texture2D(textureAtlas, translatedBox + scaledRelativeTexel);
    vec2 textureDimensions = atlasTextureBox.zw * textureAtlasResolution;
    vec2 actualPosition = relativeTexel * textureDimensions;
    vec2 texelPosition = actualPosition / textureAtlasResolution;

    return texture2D(textureAtlas, atlasTextureBox.xy + texelPosition);
}

void main() {
    float PERCENTAGE_ACROSS_SCREEN = gl_FragCoord.x / resolution.x;
    vec2 texcoord = vec2(PERCENTAGE_ACROSS_SCREEN, 0.0);
    vec2 extraDataCoord = vec2(PERCENTAGE_ACROSS_SCREEN, 0.5);
    vec2 textureAtlasCoordPosition = vec2(PERCENTAGE_ACROSS_SCREEN, 1.0);
    vec4 lineData = texture2D(cameraLines, texcoord); // lineHeightPercentage, r, g, b
    vec4 extraData = texture2D(cameraLines, extraDataCoord); // darkenPercentage, textureIndex, EMPTY, EMPTY
    vec4 textureAtlasCoord = texture2D(cameraLines, textureAtlasCoordPosition);

    float PERCENTAGE_UP_SCREEN = gl_FragCoord.y / resolution.y;

    float BOX_BOTTOM = centerLineHeight - (lineData.x / 2.0);
    float BOX_TOP = centerLineHeight + (lineData.x / 2.0);
    float BOX_SCREEN_PERCENTAGE = BOX_TOP - BOX_BOTTOM;

    if (inRange(PERCENTAGE_UP_SCREEN, BOX_BOTTOM, BOX_TOP)) {
        
        if (extraData.y == 1.0) {
            // float PERCENTAGE_UP_BOX = PERCENTAGE_UP_SCREEN - ( (1.0 - lineData.x) / 2.0);
            float PERCENTAGE_UP_BOX = (PERCENTAGE_UP_SCREEN - BOX_BOTTOM) / BOX_SCREEN_PERCENTAGE;
            gl_FragColor = fromAtlas(vec2(extraData.z, PERCENTAGE_UP_BOX), textureAtlasCoord);
            // gl_FragColor = darkenColor(vec4(lineData.yzw, 1.0), PERCENTAGE_UP_BOX);
        } else {
            gl_FragColor = darkenColor(vec4(lineData.yzw, 1.0), extraData.x);
        }
    } else {
        gl_FragColor = vec4(0, 0, 0, 0);
    }
}