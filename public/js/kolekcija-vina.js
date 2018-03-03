// import $ from 'jquery'
// import 'materialize-css/dist/js/materialize.min.js'
// import 'materialize-css/dist/css/materialize.min.css'
// import 'unitegallery/dist/css/unite-gallery.css';
// import 'unitegallery/dist/js/jquery-11.0.min.js';
// import 'unitegallery/dist/js/unitegallery.min.js';
// import 'unitegallery/dist/themes/tiles/ug-theme-tiles.js';
// import 'masonry-layout/dist/masonry.pkgd.min'
// import 'imagesloaded/imagesloaded.pkgd.min'

import 'normalize-css/normalize.css';
import '../sass/style.scss'

$(document).ready(function () {

  // zatvori flash
  // http://activelab.io/code-snippets/use-jquery-to-hide-a-div-when-the-user-clicks-outside-of-it
  $(document).mouseup((e) => {
    var subject = $('.flash');

    if (e.target.id != subject.attr('id') && !subject.has(e.target).length) {
      subject.remove();
    }
  });

  // $('.infinite-scr').infiniteScroll({
  //   // options
  //   path: '/{{#}}',
  //   append: '#sliphover',
  //   history: false
  // });


  $('#prikaz-forme').click(function () {
    $('#dodaj-sliku-forma').toggleClass('show');
  });

  $('.slika-trigger').on('click', () => {
    $('.slika-fullscreen').css('display', 'block');
    $('.modal').addClass('modal-full');
  })

  $('#slika-close').on('click', () => {
    $('.slika-fullscreen').css('display', 'none');
    $('.modal').removeClass('modal-full');
  })

  $('.fixed-action-btn').floatingActionButton({
    hoverEnabled: false,
    direction: 'left'
  });


  $('.tooltipped').tooltip({
    outDuration: 20,
    exitDelay: 20,
    position: 'top'
  });
  $('.sidenav').sidenav();
  $('.modal').modal({
    onCloseEnd: () => {
      $('.slika-fullscreen').css('display', 'none');
      $('.modal').removeClass('modal-full');

    }
  });
  $('.dropdown-trigger').dropdown({
    hover: true,
    belowOrigin: true,

  });

  $('#gallery').unitegallery({
    gallery_skin: "alexis",
    slider_bullets_skin: "alexis"
  });


  if ($(window).width() < 960) {
    $('.grid-item').hover(function () {
      $(this).children().addClass('icon-izbrisi-show', 2000, 'swing');
    }, (function () {
      $(this).children().removeClass('icon-izbrisi-show', 2000, 'swing');
    }));
  }



  $('.button-collapse').sidenav({
    menuWidth: 300,
    edge: 'right',
    closeOnClick: true,
    draggable: true,
  });

  $('#sliphover').sliphover({
    caption: 'data-caption',
    backgroundColor: 'rgba(0,0,0,.175)',
    fontColor: '#ddd',
    verticalMiddle: false,
    textAlign: 'left',
    withLink: true,
    target: '.sliphover-target'
  });


  // external js: masonry.pkgd.js, imagesloaded.pkgd.js

  // init Masonry after all images have loaded
  var $grid = $('.grid').imagesLoaded(function () {
    $grid.masonry({
      itemSelector: '.grid-item',
      percentPosition: true,
      columnWidth: '.grid-sizer'
    });
  });

});

function showSpinner() {
  $('#spinner').css('display', 'block');
}