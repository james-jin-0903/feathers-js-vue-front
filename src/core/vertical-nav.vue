<template>
  <div class="vertical-nav" :class="{'nav-collapsed':collapseNav, 'open':openSidebar}">
    <div class="sidebar-mask" :class="{'open':openSidebar}" @click="closeNav"></div>

    <div class="sidebar flex column" :class="{'open':openSidebar, ['pos-'+position]:true}">
      <logo :collapse-nav="collapseNav"/>

      <div class="box-nav box grow">
        <div class="scroll-nav" v-bar="{ useScrollbarPseudo: true }">
          <div>
            <Nav :is-collapse="collapseNav" @push-page="pushPage"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
  // @ is an alias to /src
  import Nav from '@/core/nav.vue'
  import Logo from '@/core/logo.vue'

  export default {
    name: 'VerticalNav',
    props: ['collapseNav', 'openSidebar', 'position'],
    data() {
      return {}
    },
    methods: {
      pushPage(index, indexPath) {
        this.$emit('push-page', {page: index})
      },
      closeNav() {
        this.$emit('update:openSidebar', false)
      }
    },
    components: {
      Nav,
      Logo
    }
  }
</script>

<style lang="scss">
  @import '../assets/scss/_variables';
  @import '../assets/scss/_mixins';

  .vertical-nav {
    //width: 230px;
    height: 100%;
    padding: 10px 20px;
    box-sizing: border-box;
    transition: width .2s;

    .sidebar-mask {
      visibility: hidden;
      opacity: 0;
      transition: all .2s;
    }

    .sidebar {
      width: 230px;
      height: 100%;
      transition: width .2s;

      .box-nav {
        overflow: hidden;
        padding-top: 7px;

        .scroll-nav {
          height: 100%;
        }
      }

      &:not(.pos-right) {
        .box-nav {
          .scroll-nav {
            &.vb {
              & > .vb-content {
                margin-left: 0px;
              }

              & > .vb-dragger {
                //left: 3px;
                right: inherit;
              }
            }

            .ps__scrollbar-y-rail {
              left: 0px;
              right: inherit;
            }
          }
        }
      }
    }

    &.nav-collapsed {
      .sidebar {
        width: 74px;
      }
    }
  }

  @media (max-width: 768px) {
    .vertical-nav {
      width: 100%;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      visibility: hidden;

      &.open {
        visibility: visible;
      }

      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9999;
        background: $background-color;
        box-shadow: -10px 0px 10px 10px rgba(0, 0, 0, 0.2), -10px 0px 20px 20px rgba(0, 0, 0, 0.2);
        transform: translateX(-100%);
        opacity: 0;
        transition: all .5s;

        &.pos-right {
          left: initial;
          right: 0;
          box-shadow: 10px 0px 10px 10px rgba(0, 0, 0, 0.2), 10px 0px 20px 20px rgba(0, 0, 0, 0.2);
          transform: translateX(100%);
        }

        &.open {
          opacity: 1;
          transform: translateX(0%);
        }
      }

      .sidebar-mask.open {
        position: fixed;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.4);
        z-index: 999;
        right: 0;
        bottom: 0;
        opacity: 1;
        visibility: visible;
      }
    }
  }

  @import '../assets/scss/custom';

</style>
