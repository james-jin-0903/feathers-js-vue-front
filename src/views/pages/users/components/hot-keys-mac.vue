<template>

  <div class="hot-key-modal">

    <el-row>
      <span class="black-text hot-key-header">Softphone</span>
    </el-row>

    <hr>
    <div class="pv-15">
      <div class="hot-key-item flex justify-space-between align-center">
        <div class="hot-key-description">
        <span class="black-text">
          Toggle Dialer Prompt
        </span>
        </div>
        <div class="hot-key-group">
        <span class="hot-key-button">
         <i class="mdi mdi-apple-keyboard-option"></i>
        </span>
          <span class="hot-key-button">
          D
        </span>
        </div>
      </div>
      <hr>
      <div class="hot-key-item flex justify-space-between align-center">
        <div class="hot-key-description">
        <span class="black-text">
          Request Transfer
        </span>
        </div>
        <div class="hot-key-group">
        <span class="hot-key-button">
         <i class="mdi mdi-apple-keyboard-option"></i>
        </span>
          <span class="hot-key-button">
          T
        </span>
        </div>
      </div>
      <hr>
      <div class="hot-key-item flex justify-space-between align-center">
        <div class="hot-key-description">
        <span class="black-text">
          Toggle Mute Active Call
        </span>
        </div>
        <div class="hot-key-group">
        <span class="hot-key-button">
         <i class="mdi mdi-apple-keyboard-option"></i>
        </span>
          <span class="hot-key-button">
          M
        </span>
        </div>
      </div>
      <hr>
      <div class="hot-key-item flex justify-space-between align-center">
        <div class="hot-key-description">
        <span class="black-text">
          Hang Up Active Call
        </span>
        </div>
        <div class="hot-key-group">
        <span class="hot-key-button">
         <i class="mdi mdi-apple-keyboard-option"></i>
        </span>
          <span class="hot-key-button">
          B
        </span>
        </div>
      </div>
      <hr>
      <div class="hot-key-item flex justify-space-between align-center">
        <div class="hot-key-description">
        <span class="black-text">
          Dial Digits Active Call
        </span>
        </div>
        <div class="hot-key-group">
        <span class="hot-key-button">
         <i class="mdi mdi-apple-keyboard-option"></i>
        </span>
          <span class="hot-key-button">
          Digit
        </span>
        </div>
      </div>
      <hr>
    </div>

    <el-row>
      <span class="black-text hot-key-header">Help</span>
    </el-row>
    <hr>
    <div class="pv-10">
      <div class="hot-key-item flex justify-space-between align-center">
        <div class="hot-key-description">
        <span class="black-text">
          Toggle Hot Keys
        </span>
        </div>
        <div class="hot-key-group">
        <span class="hot-key-button">
          <i class="mdi mdi-apple-keyboard-option"></i>
        </span>
          <span class="hot-key-button">
          K
        </span>
        </div>
      </div>
    </div>

  </div>

</template>

<script>

  export default {
    name: 'MacHotKeysList'
  }

</script>
