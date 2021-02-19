<template>
  <div class="box-logo flex align-center" :class="{'nav-collapsed':collapseNav, [mode]:true}">
    <!--<div class="letter-logo">P</div>-->
    <!--<img class="image-logo" src="@/assets/images/logo.svg" alt="logo"/>-->
    <div class="app-name align-center" @click="goto('/')">
      <img class="image-text" src="@/assets/images/logo-letter.svg" alt="logo"/>
    </div>
    <button class="collapse-nav" @click="collapseNavToggle">
      <i class="el-icon-menu"></i>
    </button>
  </div>
</template>


<script>
  export default {
    name: 'Logo',
    props: ['mode'],
    data() {
      return {}
    },
    computed: {
      collapseNav(){
        return this.$store.state.collapseNav
      }
    },
    methods: {
      collapseNavToggle() {
        console.log('hello');
        this.$store.commit('toggleCollapseNav');
      },
      goto(index, indexPath) {
        this.$router.push(index)
      }
    }
  }
</script>

<style lang="scss">
  @import '../assets/scss/_variables';
  @import '../assets/scss/_mixins';

  .box-logo {
    height: 60px;
    padding: 0 20px;
    box-sizing: border-box;
    font-size: 20px;
    font-weight: bold;
    position: relative;
    @include text-bordered-shadow();

    .letter-logo {
      width: 30px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      background: $text-color;
      color: $text-color-accent;
      border-radius: 5px;
      margin-right: 10px;
      font-weight: bolder;
      font-size: 20px;
    }

    .image-logo {
      width: 30px;
      height: 30px;
      margin-right: 10px;
      //filter: drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.3));
    }

    .app-name {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }

    .image-text {
      height: 30px;
    }

    .collapse-nav {
      position: absolute;
      top: 50%;
      left: 10px;
      height: 30px;
      width: 30px;
      margin-top: -15px;
      opacity: 0;
      box-shadow: 0px 0px 20px 10px $background-color;
      cursor: pointer;
      border: 1px solid $text-color-accent;
      border-radius: 50%;
      color: $text-color-accent;
      outline: none;
      background: $background-color;
      transition: all .2s;
    }

    &:hover {
      .collapse-nav {
        opacity: 1;
        left: 17px;
      }
    }


    &.nav-collapsed {
      .app-name {
        display: none;
      }
    }

    &.horizontal {
      height: 100%;

      .collapse-nav {
        display: none;
      }
    }
  }


  @media (max-width: 768px) {
    .box-logo {
      .collapse-nav {
        display: none;
      }

      &.horizontal {
        padding: 0 10px;

        .app-name {
          display: none;
        }
      }
    }

  }

  @import '../assets/scss/custom';
</style>
