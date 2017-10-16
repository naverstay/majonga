var body_var,
  browserWindow,
  scrollFixed,
  topSection,
  global_window_Height,
  userSlider,
  userSliderTimer,
  topSlider,
  giftSlider,
  topSliderTimer,
  giftSliderTimer,
  boardGrid,
  odometer,
  clock,
  searchResults,
  currentSearchStep,
  loadSearchResults,
  searchPager,

  //baseM = 0.0714286666666667,
  //baseWindowWidth = 1920,
  //baseRate = .47,

  resizer = true,
  domR = false,
  resizeTimer,

  notifications = [
    "data/notifications.json",
    "data/error.json",
    "data/action.json"
  ],

  count_limit = 3,
  count_handle,
  count_down = {
    clockFace: 'Counter',
    minimumDigits: 3
  },

  //Standard dimensions, for which the body font size is correct

  baseFZ = 1,
  minFZ = [.5, .75],
  maxFZ = [1, 1.5],
  landscapeFlag = 0,
  preferredHeight = [1388, 1270],
  preferredWidth = [640, 1920];


$(function ($) {
  browserWindow = $(window);
  body_var = $('body');
  scrollFixed = $('.scrollFixed');
  topSection = $('.topSection');

  resizer = false;

  if (!resizer) domReady();

});

function domReady(cb) {

  initHummer();

  disableDoubleTap();

  initSearchResults();

  startOrientationWatching(); // отслежаваем медиа-квери

  initPlaceholder(); // проверка пустых/заполненных инпутов

  initTopSlider();

  initGiftSlider();

  initUserSlider();

  initGallery();

  initBoard(); // изотоп

  initSelect(); // селекты

  initMask(); // маски инпутов

  initToddler(); // ползунки

  checkEmptyFields(); // проверка пустых полей

  checkStick();

  all_dialog_close();

  body_var
    .on('tap', function (e) {
      var trgt = $(e.target);
      console.log(trgt.closest('.select2-container').length);
      if (!(trgt.closest('.profile_photos_menu_holder').length
          && trgt.closest('.board_footer_controls').length
          && trgt.closest('.select2-container').length
        )) {
        console.log('hide dd');
        hideDropDowns(trgt);
      }

      hideAside(e);
    })
    .delegate('.viewTogller', 'change', function () {
      boardGrid.toggleClass('_list', $(this).attr('data-view') === 'list');
      relayouGrid();
    })
    .delegate('.editBtn', 'tap', function () {
      console.log('editBtn');
      return false;
    })
    .delegate('.boardMenuToggle', 'tap', function () {
      $('.boardFooter').toggleClass('_menu_opened');
      return false;
    })
    .delegate('.toggleIt', 'change', function () {
      var chck = $(this), data = {}, val = chck.prop('checked');

      console.log(chck, chck.closest('.settingsCollapseBtn'));

      data[chck.attr('data-event')] = val;

      chck.closest('.profile_settings_caption').toggleClass('_toggled', val);

      sendProfileSettings(data);

    })
    .delegate('.giftRmBtn', 'tap', function (e) {
      e.preventDefault();
      giftRemover(e.target);
      return false;
    })
    .delegate('.settingsCollapseAll', 'tap', function () {
      var btn = $(this);

      console.log(btn);

      if (landscapeFlag === 0) {
        if (btn.hasClass('_expanded')) {
          btn.removeClass('_expanded');
          $('.settingsCollapseBlock').slideUp().prev().removeClass('_expanded');
        } else {
          btn.addClass('_expanded');
          $('.settingsCollapseBlock').slideDown().prev().addClass('_expanded');
        }
      }

      return false;
    })
    .delegate('.settingsCollapseBtn', 'tap', function (e) {
      var btn = $(this);

      console.log(btn);

      if (!checkTagParent(e.target, 'label')) {
        $('.settingsCollapseBtn._expanded').not(btn).each(function () {
          $(this).parent().removeClass('_expanded').next('.settingsCollapseBlock').slideUp()
        });

        if (landscapeFlag === 0) {
          $('.settingsCollapseAll').removeClass('_expanded');
          btn.parent().toggleClass('_expanded').next('.settingsCollapseBlock').slideToggle();
        }
      }

      return false;
    })
    .delegate('.profileMenuBtn', 'tap', function (e) {
      e.preventDefault();

      var btn = $(this), parent = btn.closest('.gridItem');

      $('.gridItem').not(parent).removeClass('_menu_opened');

      parent.toggleClass('_menu_opened');

      return false;
    })
    .delegate('.togglePerson', 'change', function () {
      var chk = $(this);

      if (chk.attr('data-toggle') === 'true') {
        $('.secondPersonBlock').slideDown();
      } else {
        $('.secondPersonBlock').slideUp();
      }
    })
    .delegate('.select2-search__field', 'blur', function () {
      var inp = $(this);

      setTimeout(function () {
        inp.closest('.select2-container').prevAll('select.select2').select2("close");
      }, 1);
    })
    .delegate('.photoCheck', 'change', function () {
      $('.checkCounter').text($('.photoCheck:checked').length);
    })
    .delegate('.checkAll', 'change', function () {
      var chk = $(this), target = $(chk.attr('data-target'));

      if (target && target.length) {
        target.prop('checked', chk.prop('checked'));
      }

      $('.checkCounter').text($('.photoCheck:checked').length);

    })
    .delegate('.submitEmulator', 'submit', function () {
      overlay(true);

      setTimeout(function () {
        startNotifications(notifications[Math.floor(Math.random() * notifications.length)]);
      }, 1000);

      return false;
    })
    .delegate('.closeAsideBtn', 'tap', function () {
      $('.openUserMenu').trigger('tap');

      return false;
    })
    .delegate('.openSearch', 'tap', function () {
      $(this).toggleClass('state_off');

      body_var.toggleClass('search_opened').removeClass('profile_opened').removeClass('user_menu_opened');
      $('.openUserMenu').removeClass('state_off');
      $('.openProfileMenu').removeClass('state_off');

      return false;
    })
    .delegate('.openProfileMenu', 'tap', function () {
      $(this).toggleClass('state_off');

      body_var.toggleClass('profile_opened').removeClass('user_menu_opened').removeClass('search_opened');
      $('.openSearch').removeClass('state_off');
      return false;
    })
    .delegate('.openUserMenu', 'tap', function () {
      $(this).toggleClass('state_off');

      body_var.toggleClass('user_menu_opened').removeClass('search_opened');
      $('.openSearch').removeClass('state_off');
      return false;
    })
    .delegate('.tabBtn', 'tap', function () {
      var firedEl = $(this), target = $(firedEl.attr('href'));

      if (target.length) {
        target.show().siblings().hide();
      }

      return false;
    });

  startOdometer();

  domR = true;

  if (typeof cb === 'function') cb();
}

function checkTagParent(el, tag) {
  return el.tagName.toUpperCase() === tag.toUpperCase() || $(el).closest(tag).length > 0;
}

function hideDropDowns(el) {
  $('._menu_opened').removeClass('_menu_opened');

  //console.log(el);

  //$('select.select2').each(function () {
  //  $(this).select2('close');
  //});
}

function giftRemover(link) {
  $(link).closest('.questionnaire_slide').remove();
  giftSlider.update();
  return false;
}

function sendProfileSettings(data) {
  console.log('ajax', data);
}

function initGallery() {
  $('.lightgallery').each(function (ind) {
    var lg = $(this);

    if (lg.hasClass('needMenu')) {
      lg.on('onAfterSlide.lg', function (event, prevIndex, index) {
        var tb = $('.lg-toolbar'),
          tb_menu_btn = $('<span class="lg-icon lg-photomenu gridItem"><span class="lg-menu-dots profileMenuBtn"><span></span></span><span class="profile_photos_menu_holder"></span></span>'),
          item = $(event.currentTarget).find('.gridItem').eq(index),
          menu = item.find('.profile_photos_menu_holder'),
          menu_btn = item.find('.profile_menu_btn');

        if (tb.find('.lg-photomenu').length) {
          tb_menu_btn = tb.find('.lg-photomenu').removeClass('_menu_opened').empty();
        } else {
          tb.append(tb_menu_btn);
        }

        tb_menu_btn.html(menu_btn.clone()).append(menu.clone());

      });
    }

    lg.lightGallery({
      selector: '.galItem',
      speed: 200,
      thumbnail: true,
      zoom: true,
      dynamic: false,
      download: false,
      scale: .5,
      enableZoomAfter: 0,
      actualSize: true
    });
  });
}

function hideAside(e) {
  var trgt = $(e.target);

  if ((e.target.tagName).toLowerCase() === 'a' || trgt.closest('a').length) {
    //console.log('skip tap');
  } else {
    //console.log(e.type, e.target.tagName, trgt.closest('.auth_aside').length, trgt.closest('.filter_holder').length, trgt.closest('.filter_aside').length);

    if (!(trgt.closest('.preventClosing').length > 0)) {
      setTimeout(function () {
        //console.log('state_off click');
        $('.state_off').trigger('tap');
      }, 0);
    }
  }
}

function startNotifications(json) {

  $.getJSON(json, function () {

  })
    .done(function (data) {

      if (data.success) {
        if (data.msg) {
          customAlert(data.msg);
        }
        if (data.action) {
          if (data.action.goto) {
            document.location = data.action.goto;
          }
          if (data.action.func) {
            Function(data.action.func)();
          }
        }
      }
    })
    .error(function () {
      console.log("error");
    })
    .always(function () {
      overlay(false);
    });
}

function overlay(show) {
  $('.glOverlay').toggle(show, 600);
}

function customAlert(txt) {
  alert('customAlert ' + txt);
}

function initSearchResults() {
  loadSearchResults = $('.loadSearchResults');

  if (loadSearchResults.length) {
    searchPager = $('.searchPager');

    $.getJSON("data/search_result.json", function () {

    })
      .done(function (data) {

        if (data.success) {
          searchResults = data;
          currentSearchStep = data.start_pager;

          searchResultsBuilder(currentSearchStep);
          searchPager.html(paginationBuilder(currentSearchStep));

          body_var
            .delegate('.pagPrev', 'tap', function (e) {
              e.preventDefault();

              if (currentSearchStep > 1) {
                currentSearchStep -= 1;

                searchResultsBuilder(currentSearchStep);
                searchPager.html(paginationBuilder(currentSearchStep));
              }

              return false;
            })
            .delegate('.pagLink', 'tap', function (e) {
              e.preventDefault();

              var link = $(this);

              if (!link.hasClass('_current')) {
                currentSearchStep = link.attr('data-page') * 1;

                searchResultsBuilder(currentSearchStep);
                searchPager.html(paginationBuilder(currentSearchStep));
              }

              return false;
            })
            .delegate('.pagNext', 'tap', function (e) {
              e.preventDefault();

              if (currentSearchStep <= Math.ceil(searchResults.search_result.length / searchResults.items_to_show) - 1) {
                currentSearchStep += 1;

                searchResultsBuilder(currentSearchStep);
                searchPager.html(paginationBuilder(currentSearchStep));
              }

              return false;
            });
        }
      })
      .error(function () {
        console.log("error");
      })
      .always(function () {

      });
  }
}

function searchResultsBuilder(start) {
  var arr = searchResults.search_result, len = searchResults.items_to_show, $newItems = '', offset = (start - 1) * len;

  for (var i = offset; i < (Math.min(offset + len, arr.length)); i++) {
    var item = arr[i];

    $newItems += '<div class="profile_photo_unit gridItem">' +
      '<div class="profile_photo_w"><a class="board_unit galItem" href="' + item.photo_big + '">' +
      '<div class="board_img"><img src="' + item.photo + '"></div>' +
      '<div class="board_name"><span class="fz_16">' + item.name + '</span><span class="board_status' + (item.online ? ' _online' : '') + '"></span></div>' +
      '<div class="board_info"><p>' + item.city + '</p></div>' +
      '<div class="board_info"><p>' + item.info + '</p></div>' +
      '</a></div>' +
      '</div>';
  }

  boardGrid.data('lightGallery').destroy(true);

  boardGrid.isotope('remove', $('.gridItem'));

  boardGrid.isotope('insert', $($newItems));

  //console.log(boardGrid.data('lightGallery'));

  setTimeout(function () {
    initGallery();
  }, 1);
}

function paginationBuilder(current) {
  var ret = '<li><a class="pagination_link pagPrev _arrow" href="#"><span>&#8592;</span></a></li>',
    len = searchResults.max_pagination_links - 1,
    maxPage = Math.ceil(searchResults.search_result.length / searchResults.items_to_show) + 1,
    start = Math.min(maxPage - len, current - Math.floor(len / 2));

  start = start < 1 ? 1 : start;

  for (var i = start; i < Math.min(len + start, maxPage); i++) {
    ret += '<li><a class="pagination_link pagLink' +
      (current === i ? ' _current' : '') + '" data-page="' + i + '" href="#"><span>' + i + '</span></a></li>';

  }

  return ret + '<li><a class="pagination_link pagNext _arrow" href="#"><span>&#8594;</span></a></li>';
}

function checkStick() {



  /*  $('.stickIt').on('sticky_kit:stick', function (e) {
      $(this).addClass('_top');
    }).on('sticky_kit:unstick', function (e) {
      $(this).removeClass('_top');
    }).on('sticky_kit:bottom', function (e) {
      $(this).addClass('_bottom');
    }).on('sticky_kit:unbottom', function (e) {
      $(this).removeClass('_bottom');
    }).each(function (ind) {
      var stck = $(this);

      stck.stick_in_parent({
        sticky_class: stck.attr('data-sticky-class')
      });
    });*/
}

function checkEmptyFields() {

  $('.checkEmpty').on('blur', function () {
    var firedEl = $(this);

    firedEl.toggleClass('not_empty', firedEl.val().length > 0);
  });
}

function initUserSlider() {
  userSlider = new Swiper('.userSlider', {
    // Optional parameters
    //direction: 'vertical',
    loop: true,
    autoResize: false,
    spaceBetween: 1,
    slidesPerView: 1,
    // Navigation arrows
    nextButton: '.userSliderHolder .userNext',
    prevButton: '.userSliderHolder .userPrev'
  });
}

function initTopSlider() {
  topSlider = new Swiper('.topSlider', {
    // Optional parameters
    //direction: 'vertical',
    autoHeight: true,
    loop: false,
    freeMode: true,
    freeModeSticky: true,
    autoResize: false,
    spaceBetween: 1,
    slidesPerView: 'auto'
  });
}

function initGiftSlider() {
  giftSlider = new Swiper('.giftSlider', {
    // Optional parameters
    //direction: 'vertical',
    autoHeight: true,
    loop: false,
    freeMode: true,
    freeModeSticky: true,
    autoResize: false,
    spaceBetween: 0,
    slidesPerView: 'auto'
  });
}

function initBoard() {

  if ($('.boardGrid').length) {
    boardGrid = $('.boardGrid').isotope({
      percentPosition: true,
      gutter: 0,
      // main isotope options
      itemSelector: '.gridItem',
      // set layoutMode
      layoutMode: 'packery'
    });
  }
}

function formatResult(rslt) {
  //if (rslt.loading) return rslt.name;

  return rslt.name;
}

function formatResultSelection(rslt) {
  return rslt.id.length ? rslt.name : rslt.text;
}

function initSelect() {
  $.fn.select2.amd.define('select2/i18n/ru', [], function () {
    // Russian
    return {
      errorLoading: function () {
        return 'Результат не может быть загружен.';
      },
      inputTooLong: function (args) {
        var overChars = args.input.length - args.maximum;
        var message = 'Пожалуйста, удалите ' + overChars + ' символ' + plural(overChars, '', 'а', 'ов');
        if (overChars >= 2 && overChars <= 4) {
          message += 'а';
        } else if (overChars >= 5) {
          message += 'ов';
        }
        return message;
      },
      inputTooShort: function (args) {
        var remainingChars = args.minimum - args.input.length;

        var message = 'Пожалуйста, введите ' + remainingChars + ' или более символов';

        return message;
      },
      loadingMore: function () {
        return 'Загружаем ещё ресурсы…';
      },
      maximumSelected: function (args) {
        var message = 'Вы можете выбрать ' + args.maximum + ' элемент' + plural(args.maximum, '', 'а', 'ов');

        if (args.maximum >= 2 && args.maximum <= 4) {
          message += 'а';
        } else if (args.maximum >= 5) {
          message += 'ов';
        }

        return message;
      },
      noResults: function () {
        return 'Ничего не найдено';
      },
      searching: function () {
        return 'Поиск…';
      }
    };
  });

  var s2options = {
      language: 'ru',
      width: '100%',
      closeOnSelect: true,
      allowClear: false,
      minimumResultsForSearch: 3,
      containerCssClass: "select_c2"
    },
    s2ajax = {
      ajax: {
        //url: "https://api.github.com/search/repositories",
        url: "data/cities.json",
        dataType: 'json',
        delay: 250,
        data: function (params) {
          return {
            q: params.term, // search term
            page: params.page
          };
        },
        processResults: function (data, params) {
          // parse the results into the format expected by Select2
          // since we are using custom formatting functions we do not need to
          // alter the remote JSON data, except to indicate that infinite
          // scrolling can be used

          params.page = params.page || 1;

          return {
            results: data.cities,
            pagination: {
              more: (params.page * 30) < data.total_count
            }
          };
        },
        cache: true
      },
      escapeMarkup: function (markup) {
        return markup;
      }, // let our custom formatter work
      minimumInputLength: 1,
      templateResult: formatResult, // omitted for brevity, see the source of this page
      templateSelection: formatResultSelection // omitted for brevity, see the source of this page
    };

  $('.select2').each(function (ind) {
    var $slct = $(this),
      cls = $slct.attr('data-select-class') || '',
      opt = {
        placeholder: $slct.attr('data-placeholder') || 'Select a state',
        dropdownParent: $slct.parent(),
        adaptDropdownCssClass: function (c) {
          return cls;
        }
      };

    opt = Object.assign({}, opt, ($slct.hasClass('ajax') ? s2ajax : s2options));

    $slct.select2(opt);
  });
}

function plural(n, str1, str2, str5) {
  return n + ' ' + ((((n % 10) === 1) && ((n % 100) !== 11)) ? (str1) : (((((n % 10) >= 2) && ((n % 10) <= 4)) && (((n % 100) < 10) || ((n % 100) >= 20))) ? (str2) : (str5)))
}

function initMask(el) {

  if (el === void 0) {
    el = $("input");
  }

  el.each(function (i, el) {
    var inp = $(el), param = {};

    if (inp.attr('data-inputmask') != void 0) {
      inp.inputmask();
    }

    if (inp.attr('data-inputmask-email') != void 0) {
      param.regex = inp.attr('data-inputmask-email');
      param.placeholder = '_';

      inp.inputmask('Regex', param);
    }

    if (inp.attr('data-inputmask-regex') != void 0) {
      inp.inputmask('Regex', param);
    }

    if (inp.attr('data-inputmask-custom') != void 0) {
      inp.inputmask(JSON.parse('{' + inp.attr('data-inputmask-custom').replace(/'/g, '"') + '}'));
    }

  });
}

function initToddler() {
  $('.toddler').each(function (ind) {
    var tdlr = $(this), slide_func = tdlr.attr('data-slide-func');

    noUiSlider.create(this, {
      start: [Number(tdlr.attr('data-start')) || 0, Number(tdlr.attr('data-end')) || 100],
      connect: true,
      step: Number(tdlr.attr('data-step')) || 0,
      range: {
        'min': Number(tdlr.attr('data-min')) || 0,
        'max': Number(tdlr.attr('data-max')) || 100
      }
    });

    if (slide_func && window[slide_func]) {
      this.noUiSlider.on('slide', function (values, handle, unencoded, isTap, positions) {
        window[slide_func](values, handle, unencoded, isTap, positions);
      });
    }

  });
}

function updateAge(values, handle, unencoded, isTap, positions) {
  $('#age_min').val(parseInt(values[0]));
  $('#age_max').val(parseInt(values[1]));
}

$(window).on('resize', function () {

  windowRisize();

}).on('load', function () {

  windowRisize();

  body_var.addClass('dom_ready');

}).on('scroll', function () {
  var scrtop = getScrollTop();

  body_var.toggleClass('top_scrolled', scrtop > 0);

  if (topSection.length && scrollFixed.length) {
    scrollFixed.each(function (ind) {
      var scr = $(this);

      scr.toggleClass('_fixed', scrtop > (scr.offset().top - topSection.outerHeight()))

    });
  }

});

function getScrollTop() {
  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
}

function initPlaceholder() {

  var inp = $('.inpPlaceholder');

  var e = 'blur'.split(',');
  for (var i in e) inp.on(e[i], function () {
    checkPlaceholder(this);
  });

}

function checkPlaceholder(inp) {
  var target = $(inp);

  target.toggleClass('is_empty', target.val().length > 0);
}

function initHummer() {
  delete Hammer.defaults.cssProps.userSelect;

  new Hammer(body_var[0], {
    domEvents: true,
    touchAction: 'pan-x pan-y'
  });
}

function disableDoubleTap() {
  $.fn.nodoubletapzoom = function () {
    $(this).bind('touchstart', function preventZoom(e) {
      var t2 = e.timeStamp
        , t1 = $(this).data('lastTouch') || t2
        , dt = t2 - t1
        , fingers = e.originalEvent.touches.length;
      $(this).data('lastTouch', t2);
      if (!dt || dt > 500 || fingers > 1) return; // not double-tap

      e.preventDefault(); // double tap - prevent the zoom
      // also synthesize click events we just swallowed up
      console.log(this);
      //$(this).trigger('tap');
    });
  };
}

function startOrientationWatching() {
  //if (resizer) {

  enquire.register("screen and (orientation: landscape) and (min-width:1281px)", {
    match: function () {
      landscapeFlag = 1;
      console.log('land', landscapeFlag);
      body_var.addClass('landscape').removeClass('portrait');

      windowRisize();
    },
    unmatch: function () {
      landscapeFlag = 0;
      console.log('unland', landscapeFlag);
      body_var.addClass('portrait').removeClass('landscape');

      windowRisize();
    }
  });

  enquire.register("screen and (orientation: portrait)", {
    match: function () {
      landscapeFlag = 0;
      console.log('port', landscapeFlag);
      body_var.addClass('portrait').removeClass('landscape');

      windowRisize();
    }
  });

}

function windowRisize() {

  clearTimeout(resizeTimer);

  if (resizer) {
    resizeTimer = setTimeout(function () {
      resizeMe(browserWindow.height(), browserWindow.width());
    }, 0);
  } else {
    body_var.css('opacity', 1);
  }
}

function resizeMe(displayHeight, displayWidth) {

  //console.log(landscapeFlag, displayHeight, preferredHeight[landscapeFlag], displayWidth, preferredWidth[landscapeFlag]);

  var dpr = window.devicePixelRatio || 1;

  console.log('devicePixelRatio', dpr, (displayWidth / 640).toFixed(2));

  dpr = 1;

  if (
    //displayHeight < preferredHeight[landscapeFlag] ||
  displayWidth < preferredWidth[landscapeFlag]
  ) {
    var heightPercentage = displayHeight / preferredHeight[landscapeFlag];
    var widthPercentage = displayWidth / preferredWidth[landscapeFlag];
    var percentage = Math.min(
      //heightPercentage,
      widthPercentage);
    var newFontSize = percentage.toFixed(2);

    //console.log(heightPercentage, widthPercentage, Math.min(heightPercentage, widthPercentage));


    //if (browserWindow.width() > 640) {
    //  body_var.css('font-size', '1em');
    //} else {
    body_var.css('font-size', (Math.max(minFZ[landscapeFlag], Math.min(maxFZ[landscapeFlag], newFontSize * baseFZ) / dpr)) + 'em');
    //}

    //$('.keepFZ').css('font-size', (Math.max(minFZ[landscapeFlag], Math.min(maxFZ[landscapeFlag], newFontSize * baseFZ)) / dpr) + 'em');

  } else {

    //if (browserWindow.width() > 640) {
    //  body_var.css('font-size', '1em');
    //} else {
    body_var.css('font-size', (baseFZ / dpr) + 'em');
    //}

    //$('.keepFZ').css('font-size', (baseFZ / dpr) + 'em');
  }

  //var newFZ = browserWindow.width() / baseWindowWidth * baseFZ;
  //
  //body_var.css('font-size', (newFZ > maxFZ ? maxFZ : newFZ) + 'em');

  if (topSlider && topSlider.container.length) {
    clearTimeout(topSliderTimer);
    topSliderTimer = setTimeout(function () {
      topSlider.update(true);
      topSlider.slideTo(topSlider.activeIndex, 0);
    }, 1);
  }

  if (giftSlider && giftSlider.container.length) {
    clearTimeout(giftSliderTimer);
    giftSliderTimer = setTimeout(function () {
      giftSlider.update(true);
      giftSlider.slideTo(giftSlider.activeIndex, 0);
    }, 1);
  }

  if (userSlider && userSlider.container.length) {
    clearTimeout(userSliderTimer);
    userSliderTimer = setTimeout(function () {
      userSlider.update(true);
      userSlider.slideTo(userSlider.activeIndex, 0);
    }, 1);
  }

  relayouGrid();

  if (!domR) {
    domReady(function () {
      body_var.css('opacity', 1);
    });
  }
}

function relayouGrid() {
  if (boardGrid && boardGrid.length) {
    boardGrid.isotope('layout');
  }
}

function all_dialog_close() {
  body_var.on('tap', '.ui-widget-overlay', all_dialog_close_gl);
}

function all_dialog_close_gl() {
  $(".ui-dialog-content").each(function () {
    var $this = $(this);
    if (!$this.parent().hasClass('always_open')) {
      $this.dialog("close");
    }
  });
}

function initValidation() {
  $('.validateMe').each(function (ind) {
    var f = $(this);

    f.validationEngine({
      //binded: false,
      scroll: false,
      showPrompts: true,
      showArrow: false,
      addSuccessCssClassToField: 'success',
      addFailureCssClassToField: 'error',
      parentFieldClass: '.formCell',
      // parentFormClass: '.order_block',
      promptPosition: "centerRight",
      //doNotShowAllErrosOnSubmit: true,
      //focusFirstField          : false,
      autoHidePrompt: false,
      autoHideDelay: 3000,
      autoPositionUpdate: false,
      prettySelect: true,
      //useSuffix                : "_VE_field",
      addPromptClass: 'relative_mode one_msg',
      showOneMessage: false
    });
  });
}

function startOdometer() {
  getUsers();
}

function getUsers() {

  $.getJSON("data/users.json", function () {

  })
    .done(function (data) {

      if (data.success) {
        if (data.users) {

          if (!(clock && clock.$el)) {
            clock = $('.counters').FlipClock(count_limit, count_down);
          }

          if (count_limit > 990) {
            count_limit = 1;
            clock = $('.counters').FlipClock(count_limit, count_down);
          }

          count_limit += Math.max(1, Math.floor(data.users * Math.random()));

          setTimeout(function () {
            count_handle = setInterval(function () {
              clock.increment();

              if (clock.getTime().time > count_limit - 1) {
                clock.stop();
                clearInterval(count_handle);
              }

            }, 1000);
          }, 1);

          setTimeout(function () {
            getUsers();
          }, 10000);
        }
      }
    })
    .error(function () {
      console.log("error");
    })
    .always(function () {

    });
}
