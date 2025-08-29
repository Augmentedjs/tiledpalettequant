const Base = () => {
  return (
    <>
  <img id="source_img" src="deus_ex_denton.png" alt="source image" />
  <table>
    <tr>
      <td><label htmlFor="image_selector">Input image:</label></td>
      <td><input type="file" id="image_selector" accept="image/*" /></td>
    </tr>
    <tr>
      <td><label htmlFor="tile_width">Tile width</label></td>
      <td><input type="number" id="tile_width" min="1" max="32" step="1" value="8"/></td>
    </tr>
    <tr>
      <td><label htmlFor="tile_height">Tile height</label></td>
      <td><input type="number" id="tile_height" min="1" max="32" step="1" value="8"/></td>
    </tr>
    <tr>
      <td><label htmlFor="palette_num">Palettes:</label></td>
      <td><input type="number" id="palette_num" min="1" max="16" step="1" value="4"/></td>
    </tr>
    <tr>
      <td><label htmlFor="colors_per_palette">Colors per palette:</label></td>
      <td><input type="number" id="colors_per_palette" min="2" max="256" step="1" value="16"/></td>
    </tr>
    <tr>
      <td><label htmlFor="bits_per_channel">Bits per channel:</label></td>
      <td><input type="number" id="bits_per_channel" min="2" max="8" step="1" value="3"/></td>
    </tr>
    <tr>
      <td><label htmlFor="fraction_of_pixels">Fraction of pixels:</label></td>
      <td><input type="number" id="fraction_of_pixels" min="0.01" max="10" step="any" value="0.1"/></td>
    </tr>
  </table>
  <fieldset>
    <legend>Color index zero behaviour</legend>
    <table>
      <tr>
        <td>
          <input type="radio" id="unique" name="color_zero" value="unique" checked/>
          <label htmlFor="unique">unique</label>
        </td>
      </tr>
      <tr>
        <td>
          <input type="radio" id="shared" name="color_zero" value="shared"/>
          <label htmlFor="shared">shared color:</label>
          <input type="color" id="shared_color" value="#000000" aria-label="shared color"/>
        </td>
      </tr>
      <tr>
        <td>
          <input type="radio" id="transparent_from_transparent" name="color_zero" 
            value="transparent_from_transparent"/>
          <label htmlFor="transparent_from_transparent">transparent, from transparent pixels</label>
        </td>
      </tr>
      <tr>
        <td>
          <input type="radio" id="transparent_from_color" name="color_zero" value="transparent_from_color"/>
          <label htmlFor="transparent_from_color">transparent color:</label>
          <input type="color" id="transparent_color" value="#ff00ff" aria-label="transparent color"/>
        </td>
      </tr>
    </table>
  </fieldset>
  <fieldset>
    <legend>Dithering</legend>
    <table>
      <tr>
        <td>
          <input type="radio" id="dither_off" name="dither" value="dither_off" checked/>
          <label htmlFor="dither_off">disabled</label>
        </td>
      </tr>
      <tr>
        <td>
          <input type="radio" id="dither_fast" name="dither" value="dither_fast"/>
          <label htmlFor="dither_fast">fast</label>
        </td>
      </tr>
      <tr>
        <td>
          <input type="radio" id="dither_slow" name="dither" value="dither_slow"/>
          <label htmlFor="dither_slow">slow</label>
        </td>
      </tr>
      <tr>
        <td><label htmlFor="dither_weight">Dither weight:</label></td>
        <td><input type="number" id="dither_weight" min="0.01" max="1" step="any" value="0.5"/></td>
      </tr>
    </table>
  </fieldset>
  <fieldset>
    <legend>Dither pattern</legend>
    <table>
      <tr>
        <td>
          <input type="radio" id="dither_diagonal4" name="dither_pattern" value="dither_diagonal4" checked/>
          <label htmlFor="dither_diagonal4">diagonal4</label>
        </td>
        <td>
          <input type="radio" id="dither_diagonal2" name="dither_pattern" value="dither_diagonal2"/>
          <label htmlFor="dither_diagonal2">diagonal2</label>
        </td>
      </tr>
      <tr>
        <td>
          <input type="radio" id="dither_horizontal4" name="dither_pattern" value="dither_horizontal4"/>
          <label htmlFor="dither_horizontal4">horizontal4</label>
        </td>
        <td>
          <input type="radio" id="dither_horizontal2" name="dither_pattern" value="dither_horizontal2"/>
          <label htmlFor="dither_horizontal2">horizontal2</label>
        </td>
      </tr>
      <tr>
        <td>
          <input type="radio" id="dither_vertical4" name="dither_pattern" value="dither_vertical4"/>
          <label htmlFor="dither_vertical4">vertical4</label>
        </td>
        <td>
          <input type="radio" id="dither_vertical2" name="dither_pattern" value="dither_vertical2"/>
          <label htmlFor="dither_vertical2">vertical2</label>
        </td>
      </tr>
    </table>
  </fieldset>
  <div>
    <button type="button" id="quantizeButton">Quantize</button>
    <progress id="progress" max="100" value="0"></progress>
  </div>
  <div id="quantized_images">
  </div>
  </>
  );
};

export default Base;