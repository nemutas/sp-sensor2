struct TextureData {
  sampler2D texture;
  vec2 scale;
};

uniform TextureData u_image1;
uniform TextureData u_image2;
uniform TextureData u_noise;
uniform float u_progress;
uniform float u_tilt;
varying vec2 v_uv;

vec4 coveredTexture(TextureData data){
  vec2 uv = (v_uv - 0.5) * data.scale + 0.5;
  return texture2D(data.texture, uv);
}

void main() {
  vec4 image1 = coveredTexture(u_image1);
  vec4 image2 = coveredTexture(u_image2);
  vec4 noise = coveredTexture(u_noise);

  // float progress = u_progress * 2.0 - 1.0;
  float progress = u_tilt;
  float p = smoothstep(progress + 0.2, progress + 1.0, v_uv.x);
  p = p * 2.0 - 1.0;
  noise.r += p;
  float n = smoothstep(0.3, 0.7, noise.r);
  vec4 color = mix(image1, image2, n);

  gl_FragColor = color;
}