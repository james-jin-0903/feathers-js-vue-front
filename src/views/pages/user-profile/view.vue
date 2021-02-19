<template>
  <div class="page-profile" id="affix-container" style="position: relative;">
    <div class="card-base card-shadow--medium identity" id="boundary">
      <div class="cover"></div>
      <div class="username">
        <div class="cover-small"></div>
        <div class="avatar-small">
          <img src="@/assets/images/avatar.jpg" alt="avatar">
        </div>
        <span>{{username}}</span>
      </div>
      <img src="@/assets/images/cover-2.jpg" id="color-thief" class="color-thief" alt="profile cover">
      <div class="avatar" v-if="user">
        <div class="edit-hover">
          <span>Edit</span>
        </div>
        <div class="remove-hover" @click="removeAvatar" v-if="user.avatarPath">
          <span class="el-icon-delete"></span>
        </div>
        <div class="avatar-upload"  v-show="!edit">
          <div class="text-center p-2">
            <label for="avatar">
              <img :src="files.length ? files[0].url : ''" v-if="files.length || user.avatarPath"  class="rounded-circle" />
              <span class="contact-avatar" v-else-if="user.hasOwnProperty('myExtension')">
                {{user.myExtension.name.substring(0,1).toUpperCase()}}
              </span>
            </label>
          </div>
          <div class="text-center p-2">
            <file-upload
              extensions="gif,jpg,jpeg,png,webp"
              accept="image/png,image/gif,image/jpeg,image/webp"
              name="avatar"
              class="btn btn-primary"
              :custom-action="uploadAvatar"
              :drop="!edit"
              v-model="files"
              @input-filter="inputFilter"
              @input-file="inputFile"
              ref="upload">
            </file-upload>
          </div>
        </div>
      </div>
    </div>
    <div class="avatar-edit" v-show="files.length && edit">
      <div class="avatar-edit-image" v-if="files.length">
        <img ref="editImage" :src="files[0].url" />
      </div>
      <div class="text-center p-4">
        <button type="button" class="btn btn-secondary" @click.prevent="$refs.upload.clear">Cancel</button>
        <button type="submit" class="btn btn-primary" @click.prevent="editSave">Save</button>
      </div>
    </div>
    <div class="card-base card-shadow--medium info black-text">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="My Profile" name="My Profile">
          <profile-edit></profile-edit>
        </el-tab-pane>
        <el-tab-pane label="My Devices" name="My Devices">
          <my-devices></my-devices>
        </el-tab-pane>
        <el-tab-pane label="Preferences" name="Settings & Preferences">
          <user-settings></user-settings>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
  import Affix from '@/components/Affix'
  import ProfileEdit from './components/edit-profile';
  import MyDevices from './components/devices';
  import userSettings from './components/user-settings';
  import feathersClient from "../../../feathers/feathers-client";
  import FileUpload from 'vue-upload-component';
  import Cropper from 'cropperjs';
  import 'cropperjs/src/css/cropper.css';
  import {hostServer} from "../../../feathers/feathers-client";

  export default {
    name: 'Profile',
    data() {
      return {
        activeTab: 'My Profile',
        affixEnabled: true,
        files: [],
        edit: false,
        cropper: false,
        amiOmniaChannel: ''
      }
    },
    computed: {
      username() {
        const authUser = this.$store.state.auth.user;
        if(authUser.hasOwnProperty('myExtension')){
          return authUser.myExtension.name;
        }
        return this.$store.state.auth.user.email;
      },
      user() {
        return this.$store.state.auth.user;
      }
    },
    watch: {
      user(){
        if(this.user.avatarPath){
          this.files.push({url: this.user.avatarPath});
        }
      },
      edit(value) {
        if (value) {
          this.$nextTick(function () {
            if (!this.$refs.editImage) {
              return
            }
            let cropper = new Cropper(this.$refs.editImage, {
              aspectRatio: 1 / 1,
              viewMode: 1,
            });
            this.cropper = cropper
          })
        } else {
          if (this.cropper) {
            this.cropper.destroy();
            this.cropper = false
          }
        }
      }
    },
    methods: {
      resizeAffixEnabled() {
        if (window.innerWidth <= 768) {
          this.affixEnabled = false
        } else {
          this.affixEnabled = true
        }
      },
      editSave() {
        this.edit = false
        let oldFile = this.files[0]
        let binStr = atob(this.cropper.getCroppedCanvas().toDataURL(oldFile.type).split(',')[1])
        let arr = new Uint8Array(binStr.length)
        for (let i = 0; i < binStr.length; i++) {
          arr[i] = binStr.charCodeAt(i)
        }
        let file = new File([arr], oldFile.name, { type: oldFile.type })
        this.$refs.upload.update(oldFile.id, {
          file,
          type: file.type,
          size: file.size,
          active: true,
        })
      },
      alert(message) {
        alert(message)
      },
      inputFile(newFile, oldFile, prevent) {
        if (newFile && !oldFile) {
          this.$nextTick(function () {
            this.edit = true
          })
        }
        if (!newFile && oldFile) {
          this.edit = false
        }
      },
      inputFilter(newFile, oldFile, prevent) {
        if (newFile && !oldFile) {
          if (!/\.(gif|jpg|jpeg|png|webp)$/i.test(newFile.name)) {
            this.alert('Your choice is not a picture')
            return prevent()
          }
        }
        if (newFile && (!oldFile || newFile.file !== oldFile.file)) {
          newFile.url = '';
          let URL = window.URL || window.webkitURL;
          if (URL && URL.createObjectURL) {
            newFile.url = URL.createObjectURL(newFile.file)
          }
        }
      },
      async uploadAvatar(){
        try{
          console.log(this.files);
          let formData = new FormData();
          const fileBlob = new Blob([this.files[0].file], {type: this.files[0].file.type})
          formData.append(this.files[0].name, fileBlob);

          console.log(formData);

          await fetch(`${hostServer}/bucket-upload-handler`, {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${this.$store.state.auth.accessToken}`
            }
          });
        } catch (e) {
          //need to notify the user the upload failed
          console.log('it did not work');
          this.files = [{url: this.user.avatarPath}];
        }
      },
      removeAvatar() {
        this.$confirm('Remove Avatar?', {
          type: 'warning'
        }).then ( () => {
          const bucketService = feathersClient.service('bucket-upload-handler');
          bucketService.remove(null, {query: {fileName: this.user.avatarFileName}}).then( (res) => {
            console.log(res);
            this.files = [];
          });
        })
      },
      joinSocketChannel(){
        const channelService = feathersClient.service('channel-memberships');
        const peerData = {
          tenantCode: this.user.myExtension.tenantCode,
          tenantId: this.user.myExtension.tenantId,
          extension: this.user.myExtension.number
        };
        const dataOmnia = {
          roomType: 'omnia',
          ...peerData
        };
        const peerName = `${peerData.extension}-${peerData.tenantCode}`;
        channelService.create(dataOmnia).then(res => {console.log(res); this.amiOmniaChannel = `${dataOmnia.roomType}/${peerName}`});
      }
    },
    mounted() {
      this.resizeAffixEnabled();
      window.addEventListener('resize', this.resizeAffixEnabled);
      if(this.user){
        if(this.user.avatarPath){
          this.files.push({url: this.user.avatarPath});
        }

        if(this.user.hasOwnProperty('myExtension')){
          this.joinSocketChannel();
        }
      }



    },
    beforeDestroy() {
      window.removeEventListener('resize', this.resizeAffixEnabled);
      const channelService = feathersClient.service('channel-memberships');
      channelService.remove(null ,{query: {channelName: this.amiChannel}}).then(res => console.log(res));
    },
    components: {
      Affix,
      ProfileEdit,
      MyDevices,
      FileUpload,
      userSettings
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../assets/scss/variables';

  .page-profile {
    overflow: auto;

    .identity {
      margin-bottom: 20px;
      position: relative;
      width: 100%;
      height: 250px;

      .cover {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: url('../../../assets/images/cover-2.jpg');
        background-position: 50%;
        background-size: cover;
        background-repeat: no-repeat;
        width: 100%;
        height: 100%;
      }

      .username {
        color: #32325d;
        position: absolute;
        width: 100%;
        height: 50px;
        bottom: 75px;
        font-weight: 900;
        left: 0;
        right: 0;
        background: #fff;
        line-height: 50px;
        box-sizing: border-box;
        padding-left: 250px;
        font-size: 25px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        box-shadow: 0 7px 14px 0 rgba(50, 50, 93, 0.1), 0 3px 6px 0 rgba(0, 0, 0, 0.07);

        .cover-small {
          width: 220px;
          height: 50px;
          overflow: hidden;
          display: block;
          float: left;
          margin-right: -220px;
          position: relative;
          left: -250px;
          border-radius: 9px;
          -webkit-box-sizing: border-box;
          box-sizing: border-box;
          border: 4px solid white;
          opacity: 0;
          top: 0px;
          background-image: url('../../../assets/images/cover-2.jpg');
          background-position: 50%;
          background-size: cover;
          background-repeat: no-repeat;
          -webkit-transition: all .5s;
          transition: all .5s;
        }

        .avatar-small {
          width: 50px;
          height: 50px;
          overflow: hidden;
          display: block;
          float: left;
          margin-right: -50px;
          position: relative;
          left: -100px;
          border-radius: 50%;
          box-sizing: border-box;
          border: 4px solid white;
          opacity: 0;
          top: 0px;
          transform: rotate(-50deg);
          transition: all .5s;
        }

        .avatar-small img {
          width: 100%;
        }

        &.affix {
          z-index: 99;
          border-radius: 5px;

          .cover-small {
            opacity: 1;
          }

          .avatar-small {
            opacity: 1;
            left: -60px;
            transform: rotate(0deg);
          }
        }
      }

      .avatar {
        position: absolute;
        bottom: 10px;
        left: 50px;
        width: 180px;
        height: 180px;
        overflow: hidden;
        border-radius: 15px;
        box-sizing: border-box;
        box-shadow: 0px 20px 15px -15px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        img {
          max-width: 100%;
          height: auto;
          margin: auto;
        }
      }
    }

    .info {
      padding: 24px 32px;
    }
  }

  @media (max-width: 768px) {
    .page-profile {
      .identity {
        .avatar {
          bottom: inherit;
          top: 10px;
          left: 50%;
          width: 100px;
          margin-left: -50px;
          height: 100px;
          border-width: 3px;
        }

        .username {
          position: inherit;
          padding: 10px;
          margin: 0;
          top: inherit;
          left: inherit;
          z-index: 1;
          right: inherit;
          text-align: center;
          bottom: inherit;
          white-space: inherit;
          line-height: inherit;
          height: auto;
          margin-top: 120px;
          width: 90%;
          margin-left: 5%;
          margin-bottom: 10px;
          border-radius: 50px;

          .colors-box {
            display: none;
          }

          .avatar-small {
            display: none;
          }

          .cover-small {
            display: none;
          }
        }
      }

      .info {
        padding: 8px 16px;
      }
    }

    .remove-hover{
      top: 12px !important;
      left: 20px !important;
    }

    .edit-hover{
      height: 40px !important;
    }
  }

  .avatar .avatar-upload .rounded-circle {
    width: 200px;
    height: 200px;
    cursor: pointer;
    border-radius: 15px;
  }

  .avatar .avatar-upload label{
    cursor: pointer;
  }

  .avatar .text-center .btn {
    margin: 0 .5rem
  }

  .avatar-edit-image {
    width:350px;
    max-height: 350px;
  }

  .avatar .drop-active {
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    position: fixed;
    z-index: 9999;
    opacity: .6;
    text-align: center;
    background: #000;
  }
  .avatar .drop-active h3 {
    margin: -.5em 0 0;
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    -webkit-transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
    font-size: 40px;
    color: #fff;
    padding: 0;
  }

  .avatar-edit{
    position: absolute;
    top: 0;
    left: 20px;
    max-width: 100%;
    z-index: 1000;
    background: #fff;
  }

  .avatar{
    &:hover{
      .edit-hover{
        opacity: 1;
      }
      .remove-hover{
        opacity: 1;
      }
    }
  }

  .edit-hover{
    height:65px;
    width: 100%;
    position: absolute;
    display: flex;
    bottom: 0;
    background: transparentize(#000, 0.6);
    pointer-events: none;
    opacity: 0;
    transition: all 0.5s;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    color: $text-color-dark;
  }

  .remove-hover{
    width: 25px;
    height: 25px;
    background: transparentize(#000, 0.6);
    position: absolute;
    z-index: 1;
    top: 30px;
    left: 30px;
    opacity: 0;
    transition: all 0.5s;
    border-radius: 50%;
    display:flex;
    justify-content: center;
    align-items: center;
    color: $text-color-dark;
  }

  .contact-avatar{
    width: 100%;
    height: 180px;
    font-size: 5em;
  }

  .avatar-edit{
    .cropper-container{
      max-height: 500px;
    }
  }


</style>

<style lang="scss">
  .page-profile {
    .el-tabs:not(.el-tabs--border-card) {
      .el-tabs__item:not(.is-active) {
        color: #32325d;
      }
    }
  }
</style>
