(function () {
  'use strict';

  // ---------- Data ----------
  var FRAMES = {
    gallery: { label: 'The Gallery', base: 899 },
    studio: { label: 'The Studio', base: 1299 }
  };

  var COLOURS = {
    walnut: 'Walnut',
    oak: 'Oak',
    black: 'Black'
  };

  var SIZES = {
    small: { label: 'Small', dim: '8\u2033 \u00d7 10\u2033', add: 0 },
    medium: { label: 'Medium', dim: '12\u2033 \u00d7 16\u2033', add: 300 },
    large: { label: 'Large', dim: '16\u2033 \u00d7 20\u2033', add: 650 }
  };

  // Recommended-placement copy shown in the info panel — driven by size,
  // independent of whichever mode is currently on screen.
  var PLACEMENT_COPY = {
    small: 'Recommended for desks and shelves.',
    medium: 'Perfect for bedrooms and hallways.',
    large: 'Ideal for living rooms.'
  };

  var MODE_LABELS = { wall: 'Size Preview', closeup: 'Close-up View' };

  // Preview assets: Walnut uses the three size-specific images.
  // Size selection is the only control for the main preview image.
  var PREVIEW_ASSETS = {
    wall: {
      walnut: {
        small: 'assets/small-size.png',
        medium: 'assets/medium-size.jpeg',
        large: 'assets/large-size.jpeg'
      },
      oak: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1000&q=80',
      black: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1000&q=80'
    },
    closeup: {
      walnut: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1000&q=80',
      oak: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=1000&q=80',
      black: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1000&q=80'
    }
  };

  // Accepts either a URL string or a size-keyed map. Falls back to medium,
  // then to whatever key exists, so a partially-populated map can never
  // render an empty scene.
  function resolveSceneAsset(mode, colour, size) {
    var entry = PREVIEW_ASSETS[mode][colour];
    if (typeof entry === 'string') return entry;
    if (!entry) return '';
    if (entry[size]) return entry[size];
    if (entry.medium) return entry.medium;
    for (var k in entry) {
      if (Object.prototype.hasOwnProperty.call(entry, k)) return entry[k];
    }
    return '';
  }

  var warnedFor = {};

  var MAX_FILE_BYTES = 10 * 1024 * 1024;
  var ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  var CLOUDINARY_SIGN_ENDPOINT = '/api/cloudinary-sign';

  // ---------- State ----------
  var state = {
    frame: 'gallery',
    colour: 'walnut',
    // The ordered size is the only place Small/Medium/Large is chosen, and
    // it drives the preview image directly — there is no separate preview
    // size to fall out of step with the order summary.
    size: 'medium',

    // 'wall' is the size-based preview; 'closeup' is the material shot.
    mode: 'wall',
    qty: 1,
    photoDataUrl: null,   // local preview only (never persisted)
    photoUrl: null,       // Cloudinary secure_url — this is what gets persisted/sent onward
    photoUploading: false
  };

  // ---------- DOM refs ----------
  var el = {
    frameOptions: document.querySelectorAll('#frameOptions .frame-option'),
    colourOptions: document.querySelectorAll('#colourOptions .colour-option'),
    sizeOptions: document.querySelectorAll('#sizeOptions .size-option'),
    closeupToggle: document.getElementById('closeupToggle'),
    sceneLabel: document.getElementById('sceneLabel'),
    sceneLayerA: document.getElementById('sceneLayerA'),
    sceneLayerB: document.getElementById('sceneLayerB'),
    wallShadow: document.getElementById('wallShadow'),
    previewStage: document.getElementById('previewStage'),

    placementSize: document.getElementById('placementSize'),
    placementText: document.getElementById('placementText'),

    previewFrame: document.getElementById('previewFrame'),
    previewPhoto: document.getElementById('previewPhoto'),
    uploadPlaceholder: document.getElementById('uploadPlaceholder'),

    photoInput: document.getElementById('photoInput'),
    uploadDrop: document.getElementById('uploadDrop'),
    uploadLabel: document.getElementById('uploadLabel'),
    uploadError: document.getElementById('uploadError'),

    colourValue: document.getElementById('colourValue'),

    qtyMinus: document.getElementById('qtyMinus'),
    qtyPlus: document.getElementById('qtyPlus'),
    qtyValue: document.getElementById('qtyValue'),

    sumFrame: document.getElementById('sumFrame'),
    sumColour: document.getElementById('sumColour'),
    sumSize: document.getElementById('sumSize'),
    sumQty: document.getElementById('sumQty'),
    sumPhoto: document.getElementById('sumPhoto'),
    sumTotal: document.getElementById('sumTotal'),

    continueBtn: document.getElementById('continueBtn'),
    continueHint: document.getElementById('continueHint')
  };

  // Crossfade bookkeeping: which of the two stacked layers is currently
  // showing. The other one is preloaded off-screen (opacity 0) before
  // becoming the visible layer, so the swap is always a fade, never a
  // hard cut.
  var activeLayer = 'a';

  // ---------- Helpers ----------
  function formatRupees(n) {
    return '\u20b9' + n.toLocaleString('en-IN');
  }

  function calcTotal() {
    var unit = FRAMES[state.frame].base + SIZES[state.size].add;
    return unit * state.qty;
  }

  function showError(msg) {
    el.uploadError.textContent = msg;
    el.uploadError.hidden = false;
  }

  function clearError() {
    el.uploadError.hidden = true;
    el.uploadError.textContent = '';
  }


  // ---------- Photo opening geometry ----------
  // The four corners of each asset's inner photo opening, as a percentage
  // of the preview stage. Measured from the supplied images rather than
  // estimated: the dark moulding was isolated, the hole it encloses taken
  // as the opening (for Small, the mat window inside that hole), then each
  // of the four edges fitted as a line and intersected for the corners.
  // Residuals were under 0.4px on images about 1100px wide.
  //
  // Two of the three scenes photograph the frame at an angle, so these are
  // genuine quadrilaterals, not rectangles -- Medium tapers 3.6 percent
  // between its left and right edges, Large 5.2 percent. A plain
  // top/left/width/height box cannot sit flush inside either, which is why
  // the photo is mapped on with the projective transform below.
  var OPENINGS = {
    small: { tl: [36.49, 35.55], tr: [51.67, 35.55], br: [51.67, 55.75], bl: [36.49, 55.75] },
    medium: { tl: [37.50, 20.61], tr: [71.74, 20.38], br: [69.76, 66.11], bl: [35.61, 64.67] },
    large: { tl: [35.30, 14.88], tr: [77.44, 16.89], br: [77.44, 63.14], bl: [35.25, 63.65] }
  };

  function dist(p, q) {
    return Math.sqrt((p[0] - q[0]) * (p[0] - q[0]) + (p[1] - q[1]) * (p[1] - q[1]));
  }

  // Maps the unit square onto a quadrilateral and returns a CSS matrix3d.
  // Standard projective solve; degenerates cleanly to an affine transform
  // when the quad is a parallelogram, which Small effectively is.
  function quadTransform(q, w, h) {
    var x0 = q.tl[0], y0 = q.tl[1], x1 = q.tr[0], y1 = q.tr[1],
        x2 = q.br[0], y2 = q.br[1], x3 = q.bl[0], y3 = q.bl[1];
    var dx1 = x1 - x2, dy1 = y1 - y2,
        dx2 = x3 - x2, dy2 = y3 - y2,
        sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3;
    var a, b, c, d, e, f, g, i;
    if (Math.abs(sx) < 1e-9 && Math.abs(sy) < 1e-9) {
      a = x1 - x0; b = x2 - x1; c = x0;
      d = y1 - y0; e = y2 - y1; f = y0;
      g = 0; i = 0;
    } else {
      var den = dx1 * dy2 - dx2 * dy1;
      g = (sx * dy2 - dx2 * sy) / den;
      i = (dx1 * sy - sx * dy1) / den;
      a = x1 - x0 + g * x1; b = x3 - x0 + i * x3; c = x0;
      d = y1 - y0 + g * y1; e = y3 - y0 + i * y3; f = y0;
    }
    // Element coordinates run 0..w and 0..h, so fold that scale in.
    return 'matrix3d(' + [
      a / w, d / w, 0, g / w,
      b / h, e / h, 0, i / h,
      0, 0, 1, 0,
      c, f, 0, 1
    ].join(',') + ')';
  }

  // Sizes the photo slot and warps it onto the opening. The corner values
  // are percentages resolved against the live stage box, so this is correct
  // at every viewport width; it re-runs whenever the stage resizes.
  function positionOpening() {
    var frame = el.previewFrame;

    // Only the size-keyed assets photograph a real frame. Oak and Black are
    // plain room shots, so they keep the drawn frame and are left alone --
    // without this they would lose their frame and be warped onto Walnut's
    // opening over an unrelated photo.
    var entry = PREVIEW_ASSETS[state.mode] && PREVIEW_ASSETS[state.mode][state.colour];
    var realFrame = entry && typeof entry === 'object';
    var quad = realFrame ? OPENINGS[state.size] : null;

    if (!quad) {
      // Close-up, Oak and Black keep the drawn frame -- clear everything
      // this function sets so nothing is left behind.
      frame.removeAttribute('data-real-frame');
      frame.style.width = '';
      frame.style.height = '';
      frame.style.transform = '';
      return;
    }
    frame.setAttribute('data-real-frame', '');

    var sw = el.previewStage.clientWidth;
    var sh = el.previewStage.clientHeight;
    if (!sw || !sh) return;

    // Corner percentages -> pixels inside the stage's padding box, which is
    // the same box the scene image is painted into.
    var px = {};
    ['tl', 'tr', 'br', 'bl'].forEach(function (k) {
      px[k] = [quad[k][0] / 100 * sw, quad[k][1] / 100 * sh];
    });

    // Source box uses the opening's mean width and height rather than its
    // bounding box, so object-fit:cover crops the photo to the opening's
    // true proportions.
    var w = (dist(px.tl, px.tr) + dist(px.bl, px.br)) / 2;
    var h = (dist(px.tl, px.bl) + dist(px.tr, px.br)) / 2;

    frame.style.width = w + 'px';
    frame.style.height = h + 'px';
    frame.style.transform = quadTransform(px, w, h);
  }

  // ---------- Render: scene (mode + colour driven) ----------
  function renderScene() {
    var url = resolveSceneAsset(state.mode, state.colour, state.size);
    // Keep the stage ratio synchronized with the selected supplied asset.
    el.previewStage.setAttribute('data-size', state.size);
    var incoming = activeLayer === 'a' ? el.sceneLayerB : el.sceneLayerA;
    var outgoing = activeLayer === 'a' ? el.sceneLayerA : el.sceneLayerB;

    incoming.style.backgroundImage = 'url(' + url + ')';
    // Force the browser to register the new background before fading in.
    incoming.getBoundingClientRect();
    incoming.classList.add('active');
    outgoing.classList.remove('active');
    activeLayer = activeLayer === 'a' ? 'b' : 'a';

    el.sceneLabel.textContent =
      (state.mode === 'closeup' ? MODE_LABELS.closeup : SIZES[state.size].label) +
      ' \u00b7 ' + COLOURS[state.colour];

    // The supplied size-preview assets already contain their own natural
    // frame/shadow composition, so don't add the old synthetic shadow on top.
    el.wallShadow.classList.remove('visible');

    // data-mode drives proportional sizing (see CSS) and the close-up
    // zoom/glass-reflection treatment. The customer's photo stays visible
    // in every mode, including Close-up — only the background changes.
    el.previewFrame.setAttribute('data-mode', state.mode);

    // Re-seat the photo in the opening: mode and size both changed above.
    positionOpening();

    // Single toggle now: pressed = close-up, unpressed = the size preview.
    var closeup = state.mode === 'closeup';
    el.closeupToggle.classList.toggle('active', closeup);
    el.closeupToggle.setAttribute('aria-pressed', closeup ? 'true' : 'false');

    // Diagnostic only -- does not affect what renders. A missing scene photo
    // leaves the stage background empty behind the frame, which is easy to
    // misread as a styling bug, so name the file in the console instead.
    if (url.indexOf('http') !== 0 && !warnedFor[url]) {
      var probe = new Image();
      probe.onerror = function () {
        warnedFor[url] = true;
        if (window.console && console.warn) {
          console.warn('[Arshan Frame] Scene image failed to load: "' + url +
            '". Check it is committed to the repo and that the filename case matches.');
        }
      };
      probe.src = url;
    }
  }

  function setMode(mode) {
    state.mode = mode;
    renderScene();
  }

  // Close-up is a toggle, not a tab: pressing it shows the material shot,
  // pressing it again returns to the size preview. It never touches
  // state.size, so price, order summary and checkout are unaffected.
  function toggleCloseup() {
    setMode(state.mode === 'closeup' ? 'wall' : 'closeup');
  }

  // ---------- Render: options ----------
  function renderFrame() {
    el.previewFrame.setAttribute('data-frame', state.frame);
    el.frameOptions.forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.frame === state.frame);
    });
    el.sumFrame.textContent = FRAMES[state.frame].label;
  }

  function renderColour() {
    el.previewFrame.setAttribute('data-colour', state.colour);
    el.colourOptions.forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.colour === state.colour);
    });
    el.colourValue.textContent = COLOURS[state.colour];
    el.sumColour.textContent = COLOURS[state.colour];
    renderScene();
  }

  function renderSize() {
    el.previewFrame.setAttribute('data-size', state.size);
    el.sizeOptions.forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.size === state.size);
    });
    el.sumSize.textContent = SIZES[state.size].label + ' \u00b7 ' + SIZES[state.size].dim;

    // Changing size always returns to the size preview, so the main image
    // visibly changes on every size change — including from close-up,
    // which is a material shot with no size to re-point.
    setMode('wall');
    renderPlacementPanel();

    // Brief fade + scale dip so the resize reads as one smooth motion
    // rather than an instant jump between sizes.
    el.previewFrame.classList.add('is-resizing');
    window.clearTimeout(renderSize._resizeTimer);
    renderSize._resizeTimer = window.setTimeout(function () {
      el.previewFrame.classList.remove('is-resizing');
    }, 260);
  }

  function renderPlacementPanel() {
    el.placementSize.textContent = SIZES[state.size].label;
    el.placementText.textContent = PLACEMENT_COPY[state.size];
  }

  function renderQty() {
    el.qtyValue.textContent = state.qty;
    el.sumQty.textContent = state.qty;
    el.qtyMinus.disabled = state.qty <= 1;
  }

  function renderPhoto() {
    if (state.photoDataUrl) {
      el.previewPhoto.src = state.photoDataUrl;
      el.previewPhoto.hidden = false;
      el.previewPhoto.classList.add('active');
      el.uploadPlaceholder.classList.add('hidden');
      el.uploadLabel.textContent = 'Replace photo';
      // Purely a styling hook for the uploaded state; no behaviour depends
      // on it, and the label text above is unchanged.
      el.uploadDrop.classList.add('has-photo');
    } else {
      el.previewPhoto.hidden = true;
      el.previewPhoto.classList.remove('active');
      el.uploadPlaceholder.classList.remove('hidden');
      el.uploadLabel.textContent = 'Upload your photo';
      el.uploadDrop.classList.remove('has-photo');
    }

    if (state.photoUploading) {
      el.sumPhoto.textContent = 'Uploading\u2026';
    } else if (state.photoUrl) {
      el.sumPhoto.textContent = 'Uploaded';
    } else {
      el.sumPhoto.textContent = 'Not uploaded';
    }
  }

  function renderTotal() {
    el.sumTotal.textContent = formatRupees(calcTotal());
  }

  function renderContinueState() {
    var ready = !!state.photoUrl && !state.photoUploading;
    el.continueBtn.disabled = !ready;

    if (state.photoUploading) {
      el.continueHint.textContent = 'Uploading your photo\u2026';
    } else if (ready) {
      el.continueHint.textContent = 'You can still change anything above before checkout.';
    } else {
      el.continueHint.textContent = 'Upload a photo to continue';
    }
  }

  function renderAll() {
    renderFrame();
    renderColour();
    renderSize();
    renderQty();
    renderPhoto();
    renderTotal();
    renderContinueState();
  }

  // ---------- Event: Frame ----------
  el.frameOptions.forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.frame = btn.dataset.frame;
      renderFrame();
      renderTotal();
    });
  });

  // ---------- Event: Colour ----------
  el.colourOptions.forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.colour = btn.dataset.colour;
      renderColour();
    });
  });

  // ---------- Event: Size ----------
  el.sizeOptions.forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.size = btn.dataset.size;
      renderSize();
      renderTotal();
    });
  });

  // ---------- Event: Close-up toggle ----------
  el.closeupToggle.addEventListener('click', toggleCloseup);

  // ---------- Event: Quantity ----------
  el.qtyMinus.addEventListener('click', function () {
    if (state.qty > 1) {
      state.qty -= 1;
      renderQty();
      renderTotal();
    }
  });
  el.qtyPlus.addEventListener('click', function () {
    if (state.qty < 20) {
      state.qty += 1;
      renderQty();
      renderTotal();
    }
  });

  // ---------- Cloudinary upload ----------
  // Unchanged from Phase 8.1: the file uploads directly from the browser
  // to Cloudinary using a short-lived signature from our own serverless
  // function. Only the returned secure_url is ever persisted.
  function uploadToCloudinary(file) {
    return fetch(CLOUDINARY_SIGN_ENDPOINT, { method: 'POST' })
      .then(function (res) {
        if (!res.ok) throw new Error('sign-failed');
        return res.json();
      })
      .then(function (sign) {
        var formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', sign.apiKey);
        formData.append('timestamp', sign.timestamp);
        formData.append('signature', sign.signature);
        formData.append('folder', sign.folder);

        var uploadUrl = 'https://api.cloudinary.com/v1_1/' + sign.cloudName + '/image/upload';

        return fetch(uploadUrl, { method: 'POST', body: formData });
      })
      .then(function (res) {
        if (!res.ok) throw new Error('upload-failed');
        return res.json();
      })
      .then(function (data) {
        if (!data.secure_url) throw new Error('no-url');
        return data.secure_url;
      });
  }

  // ---------- Event: Upload ----------
  function handleFile(file) {
    clearError();
    if (!file) return;

    if (ALLOWED_TYPES.indexOf(file.type) === -1) {
      showError('Please upload a JPG, PNG or WEBP image.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      showError('That file is larger than 10MB. Please choose a smaller photo.');
      return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      state.photoDataUrl = e.target.result;
      renderPhoto();
    };
    reader.onerror = function () {
      showError('We could not read that file. Please try again.');
    };
    reader.readAsDataURL(file);

    state.photoUploading = true;
    state.photoUrl = null;
    renderPhoto();
    renderContinueState();

    uploadToCloudinary(file)
      .then(function (secureUrl) {
        state.photoUrl = secureUrl;
        state.photoUploading = false;
        renderPhoto();
        renderContinueState();
      })
      .catch(function () {
        state.photoUploading = false;
        state.photoUrl = null;
        renderPhoto();
        renderContinueState();
        showError('We could not upload your photo. Please try again.');
      });
  }

  el.photoInput.addEventListener('change', function (e) {
    handleFile(e.target.files && e.target.files[0]);
  });

  ['dragover', 'dragenter'].forEach(function (evt) {
    el.uploadDrop.addEventListener(evt, function (e) {
      e.preventDefault();
      el.uploadDrop.classList.add('dragover');
    });
  });
  ['dragleave', 'dragend'].forEach(function (evt) {
    el.uploadDrop.addEventListener(evt, function () {
      el.uploadDrop.classList.remove('dragover');
    });
  });
  el.uploadDrop.addEventListener('drop', function (e) {
    e.preventDefault();
    el.uploadDrop.classList.remove('dragover');
    var file = e.dataTransfer.files && e.dataTransfer.files[0];
    handleFile(file);
  });

  // ---------- Event: Continue ----------
  el.continueBtn.addEventListener('click', function () {
    if (el.continueBtn.disabled) return;
    var order = {
      frame: state.frame,
      frameLabel: FRAMES[state.frame].label,
      colour: state.colour,
      colourLabel: COLOURS[state.colour],
      size: state.size,
      sizeLabel: SIZES[state.size].label,
      sizeDim: SIZES[state.size].dim,
      qty: state.qty,
      unitPrice: FRAMES[state.frame].base + SIZES[state.size].add,
      total: calcTotal(),
      photo: state.photoUrl
    };
    try {
      sessionStorage.setItem('cadre_order', JSON.stringify(order));
    } catch (err) {
      /* sessionStorage unavailable: continue without persistence */
    }
    window.location.href = 'customer-details.html';
  });

  // ---------- Init ----------
  // Opening corners are percentages, but matrix3d needs pixels, so the
  // transform has to be recomputed whenever the stage box changes —
  // rotation, browser resize, or the mobile/desktop layout switch.
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(positionOpening).observe(el.previewStage);
  } else {
    window.addEventListener('resize', positionOpening);
  }

  renderAll();
})();
