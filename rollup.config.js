import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import copy from 'rollup-plugin-copy'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    file: 'dist/index.wxs',
    format: 'cjs',
    exports: 'default'
  },
  plugins: [
    typescript(),
    copy({
      targets: [
        { src: 'dist/index.wxs', dest: 'example/', rename: 'weapp-scroll.wxs' }
      ]
    })
  ]
})
