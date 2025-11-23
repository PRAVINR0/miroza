import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'scripts/app.js',
  output: {
    file: 'scripts/app.min.js',
    format: 'iife',
    name: 'MIROZA'
  },
  plugins: [resolve(), commonjs(), terser()]
};
