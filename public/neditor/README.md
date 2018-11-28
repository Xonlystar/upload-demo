- 修改dialogs/image/image.js 760行 getInsertList() 函数
  ```js
  getInsertList: function () {
    var i, data, list = [],
      align = getAlign(),
      prefix = editor.getOpt('imageUrlPrefix'),
      imageSrcField = editor.getOpt("imageUploadService")(this, editor).imageSrcField || 'url';
    for (i = 0; i < this.imageList.length; i++) {
      data = this.imageList[i];
      // 去除无效的图片对象
      if(data[imageSrcField]) { // 添加这行
        list.push({
            src: prefix + data[imageSrcField],
            _src: prefix + data[imageSrcField],
            alt: data.original,
            floatStyle: align
        });
      }   // 添加这行
    }
    return list;
  }
  ```

  - 修改dialogs/video/video.js 738行 uploadSuccess回调函数

  ```js
  uploader.on('uploadSuccess', function (file, res) {
    var $file = $('#' + file.id);
    try {
      // 开始
      let response = editor.getOpt("videoUploadService")(_this, editor).getResponseSuccess(res);
      uploadVideoList.push(response);
      $file.append('<span class="success"></span>');
      // 结束
      // if (editor.getOpt("videoUploadService")(_this, editor).getResponseSuccess(res)) {
      //     uploadVideoList.push(res);
      //     $file.append('<span class="success"></span>');
      // } else {
      //     $file.find('.error').text(res.message).show();
      // }
    } catch (e) {
      $file.find('.error').text(lang.errorServerUpload).show();
    }
  });
  ```
   - 修改neditor.all.js 19630行 去除classname末尾空格