<template>
  <div>
    <upload-img id="upload" @getUrl="uploadCallback"/>
    <div v-if="img" >
      <img class="img-result" :src="img"/>
    </div>
  </div>
</template>

<script>
import UploadImg from '@/components/UploadImg'
export default {
  name: 'uploadLocal',
  components: {
    UploadImg
  },
  data () {
    return {
      img: ''
    }
  },
  methods: {
    uploadCallback (res) {
      this.img = res.url
    }
  }
}
</script>

<style scoped>

</style>
