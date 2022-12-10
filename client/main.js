$(document).ready(function () {
   // variables
   let dropedImages = [];
   const allowedImagesTypes = ["image/png", "image/jpeg", "image/webp"];

   // menu set up
   $(".page-header__toggle-btn, .page-header__link").click(function () {
      $(".page-header__toggle-btn").toggleClass("page-header__toggle-btn--close");
      $(".page-header__menu").toggleClass("page-header__menu--mobile-show");
   });

   // ajax call to update the hero heading text
   $.ajax({
      url: "http://numbersapi.com/1/30/date?json",
      success: (result) => {
         $(".hero__main-heading").html(result.text.length > 90 ? result.text.slice(0, 90) + "..." : result.text);
      },
      error: () => {
         $(".hero__main-heading").html("Fail to load text");
      },
   });

   // drag and drop set up

   $(".img-uploader-section__drop-area").on("dragleave", function (e) {
      e.preventDefault();
      $(this).removeClass("img-uploader-section__drop-area--active");
   });
   $(".img-uploader-section__drop-area").on("dragenter", function (e) {
      e.preventDefault();
      $(this).addClass("img-uploader-section__drop-area--active");
   });

   $(".img-uploader-section__drop-area").on("dragover", function (e) {
      e.preventDefault();
   });

   $(".img-uploader-section__drop-area").on("drop", function (e) {
      e.preventDefault();
      // if uploading
      if ($(this).attr("disabled") === "disabled") {
         addAlert("Can't drop images while uploading", "danger");
         return;
      }
      const images = e.originalEvent.dataTransfer.files;
      // unactive the uploader
      $(this).removeClass("img-uploader-section__drop-area--active");

      // update dropedImages
      dropedImages = [
         ...dropedImages,
         ...Object.values(images).filter((file) => {
            const isValidfile = allowedImagesTypes.includes(file.type);
            if (!isValidfile) addAlert(`${file.name} is unsupported file`, "danger");
            return isValidfile;
         }),
      ];

      // create the files elements
      $(".img-uploader-section__files").empty();
      dropedImages.forEach((file) => {
         $(".img-uploader-section__files").append(
            $(`<div class="img-uploader-section__file"></div>`).text(file.name)
         );
      });
   });

   // upload files
   $(".img-uploader-section__upload-btn").click(function (e) {
      e.preventDefault();
      // if there is no images to upload
      if (!dropedImages.length) {
         addAlert("Please drop images to upload", "danger");
         return;
      }

      // upload files
      const formData = new FormData();
      dropedImages.forEach((image) => {
         formData.append("image", image);
      });

      // start loading
      $(this).attr("disabled", "");
      $(this).text("UPLOAD FILES...");
      $(".img-uploader-section__drop-area").attr("disabled", "");

      // send images to server
      $.ajax({
         url: "http://localhost:3030/upload",
         type: "post",
         data: formData,
         contentType: false,
         processData: false,
         success: function (response) {
            addAlert(response, "success");
         },
         error: function (error) {
            addAlert(error.readyState === 0 ? "server not responding" : error.responseText, "danger");
         },
         complete: () => {
            // finish loading
            $(this).removeAttr("disabled");
            $(".img-uploader-section__drop-area").removeAttr("disabled");
            $(this).text("UPLOAD FILES");

            // remove local images
            $(".img-uploader-section__files").empty();
            dropedImages = [];
         },
      });
   });

   // set up section scroll animation
   if (isImageUoloadreSectionVisible()) showImgeUploaderSection();
   $(window).scroll(() => {
      if (isImageUoloadreSectionVisible()) showImgeUploaderSection();
   });

   // functions

   function isImageUoloadreSectionVisible() {
      const imageUploaderSection = $(".img-uploader-section")[0];
      return window.scrollY + window.innerHeight > imageUploaderSection.offsetTop + 70;
   }
   function showImgeUploaderSection() {
      $(".img-uploader-section").addClass("img-uploader-section--show");
   }

   function addAlert(text, type) {
      const alertEl = $(`<div class="alert alert--${type}"></div>`).text(text);
      $(".alerts").append(alertEl);
      setTimeout(() => {
         alertEl[0].remove();
      }, 4000);
   }
});
