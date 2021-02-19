<template>
  <div class="page">

    <div class="header">
      <h1>VOXO Help Center</h1>
      <br/>
      <br/>
      <h2>Advice and answers from the VOXO Team</h2>
      <el-autocomplete
        class="inline-input"
        clearable
        v-model="suggestions"
        :fetch-suggestions="querySearch"
        :trigger-on-focus="false"
        @select="handleSelect"
        style="width: 500px;"
        placeholder="Search for articles...">
      </el-autocomplete>
    </div>

    <div class="body-container">

      <div class="body-top">
        <el-row>
          <h2>General Help Articles</h2>

          <div class="button-wrapper">
            <el-col :span="12">
              <a href="https://support.voxo.co/en/articles/2583505-send-a-fax-via-email" target="_blank">
                <el-button square slot="reference"><span>Send a fax via email</span></el-button>
              </a>
              <br/>

              <a href="https://support.voxo.co/en/articles/2566165-how-to-set-up-voicemail" target="_blank">
                <el-button slot="reference"><p>How To:<br/> Set Up Voicemail</p></el-button>
              </a>
              <br/>

              <a href="https://support.voxo.co/en/articles/2569211-invite-a-user-to-voxo-mobile" target="_blank">
                <el-button slot="reference">Invite a user to VOXO mobile</el-button>
              </a>
              <br/>

            </el-col>
          </div>

          <div class="button-wrapper1">
            <el-col :span="12">
              <a href="https://support.voxo.co/en/articles/2566159-how-to-conference-call-voxo-meet" target="_blank">
                <el-button slot="reference"><p>How To:<br/> Conference Call (VOXO Meet)</p></el-button>
              </a>
              <br/>

              <a href="https://support.voxo.co/en/articles/2566137-how-to-transfer-a-call" target="_blank">
                <el-button slot="reference">How To:<br/> Transfer a Call</el-button>
              </a>
              <br/>

              <a href="https://support.voxo.co/en/articles/2566130-how-to-add-a-speed-dial-contact" target="_blank">
                <el-button slot="reference">How To:<br/> Add a Speed Dial Contact</el-button>
              </a>
              <br/>
            </el-col>
          </div>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Support",

    data() {
      return {
        currentUserEmail: "",
        currentUserName: "",
        currentUserId: 0,
        subject: "",
        messageContent: "",
        emailFormVisible: false,
        links: [],
        suggestions: "",
      };
    },
    computed: {
      // Return user data to use in intercom and in email form
      user() {
        return this.$store.state.auth.user;
      }
    },
    // watch: {

    // },
    methods: {
      loadArticles() {
        return [
          {"value": "Send a fax via email", "link": "https://support.voxo.co/en/articles/2583505-send-a-fax-via-email"},
          {
            "value": "How To: Set Up Voicemail",
            "link": "https://support.voxo.co/en/articles/2566165-how-to-set-up-voicemail"
          },
          {
            "value": "Invite a user to VOXO mobile",
            "link": "https://support.voxo.co/en/articles/2569211-invite-a-user-to-voxo-mobile"
          },
          {
            "value": "How To: Conference Call (VOXO Meet)",
            "link": "https://support.voxo.co/en/articles/2566159-how-to-conference-call-voxo-meet"
          },
          {
            "value": "How To: Transfer a Call",
            "link": "https://support.voxo.co/en/articles/2566137-how-to-transfer-a-call"
          },
          {
            "value": "How To: Add a Speed Dial Contact",
            "link": "https://support.voxo.co/en/articles/2566130-how-to-add-a-speed-dial-contact"
          },
        ]
      },
      querySearch(queryString, cb) {
        let links = this.links;
        let results = queryString ? links.filter(this.createFilter(queryString)) : links;
        cb(results);
      },
      createFilter(queryString) {
        return (link) => {
          return (link.value.toLowerCase().indexOf(queryString.toLowerCase()) !== -1);
        };
      },
      handleSelect(item) {
        window.open(item.link, '_blank');
      },
    },
    mounted() {
      this.links = this.loadArticles();
      this.$intercom.show();
    },
    beforeDestroy() {
      this.$intercom.hide();
    }
  }

</script>

<style lang="scss">

  @import '../../../assets/scss/variables';

  .page {
    position: relative;
    overflow: auto;


    .header {
      background: url('../../../assets/images/voxo-background.jpg');
      padding-bottom: 200px;
      display: inline-block;
      width: 98%;
      text-align: center;
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
    }

    .body-container {
      display: flex;
      text-align: center;

      .body-top {
        flex: 1;

        .el-row {
          margin-bottom: 20px;

          &:last-child {
            margin-bottom: 0px;
          }
        }

        .el-col {
          border-radius: 0px;
        }

        .button-wrapper {
          margin: 0px;
          width: 100%;
          text-align: right;

          .el-button {
            margin: 5px;
            height: 100px;
            width: 275px;
            text-align: center;
            font-size: 18px;
          }

          .el-button:hover {
            -webkit-box-shadow: 0 8px 6px -6px black;
            -moz-box-shadow: 0 8px 6px -6px black;
            box-shadow: 0 8px 6px -6px black;
            color: $voxo-green;
          }
        }

        .button-wrapper1 {
          margin: 0px;
          width: 100%;
          text-align: left;

          .el-button {
            margin: 5px;
            height: 100px;
            width: 275px;
            text-align: center;
            font-size: 18px;
          }

          .el-button:hover {
            -webkit-box-shadow: 0 8px 6px -6px black;
            -moz-box-shadow: 0 8px 6px -6px black;
            box-shadow: 0 8px 6px -6px black;
            color: $voxo-green;
          }
        }
      }

      .body-bottom-left {
        flex: 1;
        text-align: center;
        width: 400px;
        height: 180px;
        margin-top: 50px;

        .el-button {
          height: 50px;
          width: 175px;
          font-size: 17px;
        }

        .el-dialog {
          text-align: left;

          .el-input {
            margin-top: 5px;
            width: 200px;
          }
        }
      }
    }
  }
</style>