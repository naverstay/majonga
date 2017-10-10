var body_var,
  browserWindow,
  scrollFixed,
  topSection,
  global_window_Height,
  userSlider,
  userSliderTimer,
  topSlider,
  topSliderTimer,
  boardGrid,
  odometer,
  clock,

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
  landscapeFlag = -1,
  preferredHeight = [1388, 1270],
  preferredWidth = [640, 1920];


$(function ($) {
  browserWindow = $(window);
  body_var = $('body');
  scrollFixed = $('.scrollFixed');
  topSection = $('.topSection');

  //resizer = false;

  if (!resizer) domReady();

});

function domReady(cb) {

  new Hammer(body_var[0], {
    domEvents: true
  });

  startOrientationWatching();

  initPlaceholder();

  initTopSlider();

  initUserSlider();

  initBoard();

  initSelect();

  initMask();

  initToddler();

  all_dialog_close();

  checkEmptyFields();

  initGallery();

  body_var.on('click', function (e) {
    if ($(e.target).closest('.profile_photos_menu_holder').length != 1) {
      hideDropDowns();
    }
  });

  body_var
    .on('tap', function (e) {
      hideAside(e);
    })
    .delegate('.settingsCollapseBtn', 'click', function () {
      var btn = $(this);

      btn.toggleClass('_collapsed').next('.settingsCollapseBlock').slideToggle();

      return false;
    })
    .delegate('.profileMenuBtn', 'click', function () {
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
    .delegate('.submitEmulator', 'submit', function () {
      overlay(true);

      setTimeout(function () {
        startNotifications(notifications[Math.floor(Math.random() * notifications.length)]);
      }, 1000);

      return false;
    })
    .delegate('.closeAsideBtn', 'click', function () {
      $('.openUserMenu').click();

      return false;
    })
    .delegate('.openSearch', 'click', function () {
      $(this).toggleClass('state_off');

      body_var.toggleClass('search_opened').removeClass('profile_opened').removeClass('user_menu_opened');
      $('.openUserMenu').removeClass('state_off');
      $('.openProfileMenu').removeClass('state_off');

      return false;
    })
    .delegate('.openProfileMenu', 'click', function () {
      $(this).toggleClass('state_off');

      body_var.toggleClass('profile_opened').removeClass('user_menu_opened').removeClass('search_opened');
      $('.openSearch').removeClass('state_off');
      return false;
    })
    .delegate('.openUserMenu', 'click', function () {
      $(this).toggleClass('state_off');

      body_var.toggleClass('user_menu_opened').removeClass('search_opened');
      $('.openSearch').removeClass('state_off');
      return false;
    })
    .delegate('.tabBtn', 'click', function () {
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

function hideDropDowns() {
  $('._menu_opened').removeClass('_menu_opened');
}

function initGallery() {
  $('.lightgallery').each(function (ind) {
    $(this).lightGallery({
      selector: '.board_unit',
      speed: 200,
      thumbnail: true,
      zoom: true,
      dynamic: false,
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
    //console.log(e.type, e.target.tagName, trgt.closest('.auth_aside').length, trgt.closest('.filter_holder').length);

    if (!(trgt.closest('.preventClosing').length > 0)) {
      setTimeout(function () {
        //console.log('state_off click');
        $('.state_off').click();
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


  //} else {
  //  body_var.addClass('landscape').removeClass('portrait');
  //}
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

  //console.log('devicePixelRatio', dpr);

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
    body_var.css('font-size', (Math.max(minFZ[landscapeFlag], Math.min(maxFZ[landscapeFlag], newFontSize * baseFZ)) / dpr) + 'em');
    //}

    $('.keepFZ').css('font-size', (Math.max(minFZ[landscapeFlag], Math.min(maxFZ[landscapeFlag], newFontSize * baseFZ)) / dpr) + 'em');

  } else {

    //if (browserWindow.width() > 640) {
    //  body_var.css('font-size', '1em');
    //} else {
    body_var.css('font-size', (baseFZ / dpr) + 'em');
    //}

    $('.keepFZ').css('font-size', (baseFZ / dpr) + 'em');
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

  if (userSlider && userSlider.container.length) {
    clearTimeout(userSliderTimer);
    userSliderTimer = setTimeout(function () {
      userSlider.update(true);
      userSlider.slideTo(userSlider.activeIndex, 0);
    }, 1);
  }

  if (boardGrid && boardGrid.length) {
    boardGrid.isotope('layout');
  }

  if (!domR) {
    domReady(function () {
      body_var.css('opacity', 1);
    });
  }
}

function all_dialog_close() {
  body_var.on('click', '.ui-widget-overlay', all_dialog_close_gl);
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
