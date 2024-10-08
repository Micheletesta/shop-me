<template>
  <input type="file" id="img" />
  <!-- <img id="img" src="../../icons/photo_2024-09-29_16-22-02.jpg" /> -->
  <img src="../../icons/upload.png" @click="uploadImg" />
</template>

<style>
img {
  width: 20px;
  display: block;
}
</style>

<script>
import { BarcodeDetector } from "barcode-detector";
import axios from "axios";
export default {
  data() {
    return {};
  },
  methods: {
    async initDetector() {
      const barcodeDetector = new BarcodeDetector();
      console.log(document.getElementById("img").files[0]);
      barcodeDetector.addEventListener("load", ({ detail }) => {
        console.log(detail); // zxing wasm module
      });
      console.log(await barcodeDetector.detect(document.getElementById("img").files[0]));
      await axios
        .post(
          import.meta.env.VITE_API_URL +
          ":3002/v2/api/cards/card",
            
        )
        .then((res) => {});
    },
    async uploadImg() {
      await this.initDetector();
    },
  },
  mounted() {},
};
</script>
