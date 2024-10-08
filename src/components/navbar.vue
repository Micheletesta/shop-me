<template>
    <div class="navbarContainer">
       <div class="navbarRow">
        <a class="navbarIcons" v-bind:class="homeSelected" href="/"><img v-bind:src="homeLink" class="navbarIconsImg"/></a>
        <a class="navbarIcons" v-bind:class="favSelected" href="/favorite"><img v-bind:src="favLink" class="navbarIconsImg"/></a>
        <a class="navbarIcons" v-bind:class="shoppingBagSelected" href="/shoppingbag"><img v-bind:src="shoppingBagLink" class="navbarIconsImg" id="shoppingBag"/></a>
       </div>
    </div>
</template>

<script setup>
    import '../style/navbar.css';

    import { useRouter } from 'vue-router'
    import { computed } from 'vue'

    const router = useRouter()
    let currentPathObject = router.currentRoute.value; 

    const homeLink = computed(() => {
        return ( currentPathObject.path == '/' ? './src/icons/homeSelected.png' : './src/icons/home.png')
    });
    const favLink = computed(() => {
        return currentPathObject.path == '/favorite' ? './src/icons/heartSelected.png' : './src/icons/heart.png'
    });
    const shoppingBagLink = computed(() => {
        return currentPathObject.path == '/shoppingbag' ? './src/icons/shopping-bagSelected.png' : './src/icons/shopping-bag.png'
    });

    const homeSelected = computed(() => {
        return currentPathObject.path == '/' ? 'iconSelected' : 'iconUnselected'
    })
    const favSelected = computed(() => {
        return currentPathObject.path == '/favorite' ? 'iconSelected' : 'iconUnselected'
    })
    const shoppingBagSelected = computed(() => {
        return currentPathObject.path == '/shoppingbag' ? 'iconSelected' : 'iconUnselected'
    })

</script>