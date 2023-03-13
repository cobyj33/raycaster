precision mediump float;
uniform vec2 resolution;
uniform sampler2D cameraLines; // Height of 3, length of resolution, (vec4(lineHeightPercentage, red, green, blue), vec4(brightness, (0 or 1) hasTexture, percentageAcrossBox, 0), vec4(textureX, textureY, textureWidth, textureHeight))
uniform int numOfCameraLines;
uniform float centerLineHeight;

uniform sampler2D textureAtlas;
uniform vec2 textureAtlasResolution;

bool inRange(float num, float start, float end) {
    return num >= start && num <= end;
}

// vec4 darkenColor(vec4 color, float percentage) {
//     float luminence = 1.0 - percentage;
//     return vec4(luminence * color.rgb, color.a);
// }

vec4 fromAtlas(vec2 relativeTexel, vec4 atlasTextureBox) {
    vec2 textureDimensions = atlasTextureBox.zw * textureAtlasResolution;
    vec2 actualPosition = relativeTexel * textureDimensions;
    vec2 texelPosition = actualPosition / textureAtlasResolution;

    return texture2D(textureAtlas, atlasTextureBox.xy + texelPosition);
}

void main() {
    float TEXTURE_DATA_HEIGHT = 3.0;

    float PERCENTAGE_ACROSS_SCREEN = gl_FragCoord.x / resolution.x;
    vec2 texcoord = vec2(PERCENTAGE_ACROSS_SCREEN, 0.0 / (TEXTURE_DATA_HEIGHT - 1.0) );
    vec2 extraDataCoord = vec2(PERCENTAGE_ACROSS_SCREEN, 1.0 / (TEXTURE_DATA_HEIGHT - 1.0) );
    vec2 textureAtlasCoordPosition = vec2(PERCENTAGE_ACROSS_SCREEN, (TEXTURE_DATA_HEIGHT - 1.0) );
    vec4 lineData = texture2D(cameraLines, texcoord); // lineHeightPercentage, r, g, b
    vec4 extraData = texture2D(cameraLines, extraDataCoord); // brightness, hasTexture, percentageAcrossBox, EMPTY


    float boxLineHeightPercentage = lineData.x;
    vec4 fallbackColor = vec4(lineData.yzw, 1.0);
    float BRIGHTNESS = extraData.x;
    bool hasTexture = extraData.y == 1.0;
    float PERCENTAGE_ACROSS_BOX = extraData.z;

    vec4 textureAtlasCoord = texture2D(cameraLines, textureAtlasCoordPosition);

    float PERCENTAGE_UP_SCREEN = gl_FragCoord.y / resolution.y;
    float BOX_BOTTOM = centerLineHeight - (lineData.x / 2.0);
    float BOX_TOP = centerLineHeight + (lineData.x / 2.0);
    float BOX_SCREEN_PERCENTAGE = BOX_TOP - BOX_BOTTOM;

    if (inRange(PERCENTAGE_UP_SCREEN, BOX_BOTTOM, BOX_TOP)) {
        float PERCENTAGE_UP_BOX = (PERCENTAGE_UP_SCREEN - BOX_BOTTOM) / BOX_SCREEN_PERCENTAGE;
        
        if (hasTexture) {
            vec4 textureColor = fromAtlas(vec2(PERCENTAGE_ACROSS_BOX, PERCENTAGE_UP_BOX), textureAtlasCoord);
            vec4 darkenedTextureColor = vec4(textureColor.rgb * BRIGHTNESS, textureColor.a);
            gl_FragColor = vec4(textureColor.rgb * BRIGHTNESS, textureColor.a);
        } else {
            gl_FragColor = vec4(fallbackColor.rgb * BRIGHTNESS, fallbackColor.a);
        }
    } else {
        gl_FragColor = vec4(0.15, 0.15, 0.15, 1.0);
    }
}