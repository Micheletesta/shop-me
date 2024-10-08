<template>
  <div class="navbar">
    <div class="menuContainer nav-container">
      <!-- <div class="hamburgerContainer" @click="isActive = !isActive">
        <input class="checkbox hamburgerContainer" type="checkbox" name="" id="" />
        <div class="hamburger-lines">
          <span class="line line1"></span>
          <span class="line line2"></span>
          <span class="line line3"></span>
        </div>
      </div> -->
      <div class="logo">
        <img class="menuLogo" src="../icons//DrinkManLogo2.png" />
      </div>
    </div>
  </div>
</template>

<script setup>
import "../style/menu.css";
import { reactive, ref } from "vue";

const isActive = ref(false);

const classObject = reactive({
  show: "showList",
  hide: "hideList",
});

const classLogo = reactive({
  show: "showLogo",
  hide: "hideLogo",
});
</script>
