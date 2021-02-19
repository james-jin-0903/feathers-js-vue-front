<template>

  <el-popover
          :disabled="disabled"
          placement="right"
          width="200"
          trigger="hover">
    <div class="mini-keypad">
      <div class="digits-container">
        <el-input
          readonly
          v-model="number">
        </el-input>
      </div>

      <div class="keypad-layout">
        <div class="keypad-key">
          <el-button type="text" circle @click="keyPress('1')">
            <div class="button-number">
              1
            </div>
            <div class="button-letters">

            </div>
          </el-button>
        </div>
        <div class="keypad-key">
          <el-button type="text" circle @click="keyPress('2')">
            <div class="button-number">
              2
            </div>
            <div class="button-letters">
              ABC
            </div>
          </el-button>
        </div>
        <div class="keypad-key">
          <el-button type="text" circle @click="keyPress('3')">
            <div class="button-number">
              3
            </div>
            <div class="button-letters">
              DEF
            </div>
          </el-button>
        </div>
        <div class="keypad-key">
          <el-button type="text" circle @click="keyPress('4')">
            <div class="button-number">
              4
            </div>
            <div class="button-letters">
              GHI
            </div>
          </el-button>
        </div>
        <div class="keypad-key">
          <el-button type="text" circle @click="keyPress('5')">
            <div class="button-number">
              5
            </div>
            <div class="button-letters">
              JKL
            </div>
          </el-button>
        </div>
        <div class="keypad-key">
          <el-button type="text" circle @click="keyPress('6')">
            <div class="button-number">
              6
            </div>
            <div class="button-letters">
              MNO
            </div>
          </el-button>
        </div>
        <div class="keypad-key">
          <el-button type="text" circle @click="keyPress('7')">
            <div class="button-number">
              7
            </div>
            <div class="button-letters">
              PQRS
            </div>
          </el-button>
        </div>
        <div class="keypad-key">
          <el-button type="text" circle @click="keyPress('8')">
            <div class="button-number">
              8
            </div>
            <div class="button-letters">
              TUV
            </div>
          </el-button>
        </div>
        <div class="keypad-key">
          <el-button type="text" circle @click="keyPress('9')">
            <div class="button-number">
              9
            </div>
            <div class="button-letters">
              WXYZ
            </div>
          </el-button>
        </div>
        <div class="keypad-key">
          <el-button type="text" circle @click="keyPress('*')">
            <div class="button-number">
              *
            </div>
            <div class="button-letters">

            </div>
          </el-button>
        </div>
        <div class="keypad-key">
          <el-button type="text" circle @click="keyPress('0')">
            <div class="button-number">
              0
            </div>
            <div class="button-letters">

            </div>
          </el-button>
        </div>
        <div class="keypad-key">
          <el-button type="text" circle @click="keyPress('#')">
            <div class="button-number">
              #
            </div>
            <div class="button-letters">

            </div>
          </el-button>
        </div>
      </div>
    </div>
    <el-button slot="reference" class="keypad-btn" size="mini" circle type="info" :disabled="disabled">
      <v-svg sprite="keypad"></v-svg>
    </el-button>
  </el-popover>

</template>

<script>

  import feathersClient from "../../../../feathers/feathers-client";

  export default {
    name: 'MiniKeypad',
    props: {
      channel: {required: true},
      server: {required: true},
      disabled: {required: true}
    },
    data () {
      return {
        number: ''
      }
    },
    computed: {
      user(){
        return this.$store.state.auth.user;
      }
    },
    methods: {
      keyPress(val){
        this.number = this.number + val;
        this.sendDTFM(val);
      },
      sendDTFM(val){
        feathersClient.service('nats-actions-handler').create({
          reqType: 'DTMF',
          value: val,
          channel: this.channel,
          hostServer: this.server
        });
      }
    }
  }

</script>

<style lang="scss" scoped>

  @import '../../../../assets/scss/variables';

  .keypad-layout{
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    >* {
      flex-basis: 30%;
    }
  }

  .keypad-key{
    text-align:center;
    margin: auto;
    width: 30px;
  }

  .keypad-btn {
    margin-left: auto;
    background-color: $voxo-purple;
    svg{
      margin-left: -0.52px;
    }
  }

  .el-button {
    width: 50px;
    height: 50px;
  }

  .button-letters{
    font-size: 7pt;
    margin-top: 3px;
  }

  .digits-container{
    padding: 10px;
  }

  .digits-display{
    height: 30px;
    display: flex;
    padding: 0 10px;
    align-items: center;
  }

</style>
