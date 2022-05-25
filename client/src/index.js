import * as THREE from 'three';
import RENDERER from './modules/renderer/renderer.js';
import ASSETS from './modules/atlas/assets.js';
import './style.scss';
import MATERIALS from './modules/game/materials/materials';

const MAIN =  {
  THREE:THREE,
  ASSETS:ASSETS,
  MATERIALS:{},
};

export default MAIN;
ASSETS.load().then(assets => {
  MAIN.MATERIALS = MATERIALS.init();
  RENDERER.init(true);
});

