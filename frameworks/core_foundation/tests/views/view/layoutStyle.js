// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// View Layout Unit Tests
// ========================================================================

/*global module test ok same equals */


/* These unit tests verify:  layout(), frame(), styleLayout() and clippingFrame(). */
(function () {
  var parent, child, frameKeys, layoutKeys;

  frameKeys = ['x', 'y', 'width', 'height', 'scale', 'transformOriginX', 'transformOriginY', 'originalWidth', 'originalHeight'];
  layoutKeys = ['width', 'height', 'top', 'bottom', 'marginLeft', 'marginTop', 'left', 'right',
    'minWidth', 'maxWidth', 'minHeight', 'maxHeight', 'borderTopWidth', 'borderBottomWidth',
    'borderLeftWidth', 'borderRightWidth'];

  // On supported platforms, test CSS transforms too.
  if (SC.platform.supportsCSSTransforms) {
    layoutKeys.push('transform');
    layoutKeys.push('transformOrigin');
  }

  /*
    helper method to test the layout of a view.  Applies the passed layout to a
    view, then compares both its frame and layoutStyle properties both before
    and after adding the view to a parent view.

    You can pass frame rects with some properties missing and they will be
    filled in for you just so you don't have to write so much code.

    @param {Hash} layout layout hash to test
    @param {Hash} no_f expected frame for view with no parent
    @param {Hash} no_s expected layoutStyle for view with no parent
    @param {Hash} with_f expected frame for view with parent
    @param {Hash} with_s expected layoutStyle for view with parent
    @param {Boolean} isFixedShouldBe expected value for view.get('isFixedLayout')
    @returns {void}
  */
  function performLayoutTest(layout, no_f, no_s, with_f, with_s, isFixedShouldBe) {

    // make sure we add null properties and convert numbers to 'XXpx' to style layout.
    layoutKeys.forEach(function (key) {
      if (no_s[key] === undefined) { no_s[key] = null; }
      if (with_s[key] === undefined) { with_s[key] = null; }


      if (typeof no_s[key] === 'number') { no_s[key] = no_s[key].toString() + 'px'; }
      if (typeof with_s[key] === 'number') { with_s[key] = with_s[key].toString() + 'px'; }
    });

    // set layout
    SC.run(function () {
      child.set('layout', layout);
    });

    var layoutStyle = child.get('layoutStyle'),
        frame = child.get('frame');

    // test
    layoutKeys.forEach(function (key) {
      var testKey;
      if (key === 'transform') testKey = SC.browser.experimentalStyleNameFor('transform');
      else if (key === 'transformOrigin') testKey = SC.browser.experimentalStyleNameFor('transformOrigin');
      else testKey = key;
      equals(layoutStyle[testKey], no_s[key], "STYLE NO PARENT %@".fmt(key));
    });

    if (no_f !== undefined) {
      if (frame && no_f) {
        frameKeys.forEach(function (key) {
          equals(frame[key], no_f[key], "FRAME NO PARENT %@".fmt(key));
        });
      } else {
        equals(frame, no_f, "FRAME NO PARENT");
      }
    }


    // add to parent
    SC.RunLoop.begin();
    parent.appendChild(child);
    SC.RunLoop.end();

    layoutStyle = child.get('layoutStyle');
    frame = child.get('frame');

    // test again
    layoutKeys.forEach(function (key) {
      var testKey;
      if (key === 'transform') testKey = SC.browser.experimentalStyleNameFor('transform');
      else if (key === 'transformOrigin') testKey = SC.browser.experimentalStyleNameFor('transformOrigin');
      else testKey = key;
      equals(layoutStyle[testKey], with_s[key], "STYLE W/ PARENT %@".fmt(key));
    });

    if (with_f !== undefined) {
      if (frame && with_f) {
        frameKeys.forEach(function (key) {
          equals(frame[key], with_f[key], "FRAME W/ PARENT %@".fmt(key));
        });
      } else {
        equals(frame, with_f, "FRAME W/ PARENT");
      }
    }

    // check if isFixedLayout is correct

    equals(child.get('isFixedLayout'), isFixedShouldBe, "isFixedLayout");
  }

  /**
    Helper setup that creates a parent and child view so that you can do basic
    tests.
  */
  var commonSetup = {
    setup: function () {

      // create basic parent view
      parent = SC.View.create({
        layout: { top: 0, left: 0, width: 200, height: 200 }
      });

      // create child view to test against.
      child = SC.View.create();
    },

    teardown: function () {
      child.destroy();
      parent.destroy();
      parent = child = null;
    }
  };

  module("NOTIFICATIONS", commonSetup);

  test("Setting layout will notify frame observers", function () {
    var didNotify = NO, didNotifyStyle = NO;
    child.addObserver('frame', this, function () { didNotify = YES; });
    child.addObserver('layoutStyle', this, function () { didNotifyStyle = YES; });

    SC.run(function () {
      child.set('layout', { left: 0, top: 10, bottom: 20, right: 50 });
    });

    ok(didNotify, "didNotify");
    ok(didNotifyStyle, 'didNotifyStyle');
  });

  // ..........................................................
  // TEST FRAME/STYLEFRAME WITH BASIC LAYOUT VARIATIONS
  //
  // NOTE:  Each test evaluates the frame before and after adding it to the
  // parent.

  module('BASIC LAYOUT VARIATIONS', commonSetup);

  test("layout {top, left, width, height}", function () {

    var layout = { top: 10, left: 10, width: 50, height: 50 };
    var s = { top: 10, left: 10, width: 50, height: 50 };
    var no_f = { x: 10, y: 10, width: 50, height: 50, scale: 1, originalWidth: 50, originalHeight: 50, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 10, y: 10, width: 50, height: 50, scale: 1, originalWidth: 50, originalHeight: 50, transformOriginX: 0.5, transformOriginY: 0.5 };

    performLayoutTest(layout, no_f, s, with_f, s, YES);
  });

  test("layout {top, left, bottom, right}", function () {

    var layout = { top: 10, left: 10, bottom: 10, right: 10 };
    var no_f = { x: 10, y: 10, width: 0, height: 0, scale: 1, originalWidth: 0, originalHeight: 0, originalWidth: 0, originalHeight: 0, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 10, y: 10, width: 180, height: 180, scale: 1, originalWidth: 180, originalHeight: 180, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { top: 10, left: 10, bottom: 10, right: 10 };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {bottom, right, width, height}", function () {

    var layout = { bottom: 10, right: 10, width: 50, height: 50 };
    var no_f = { x: 0, y: 0, width: 50, height: 50, scale: 1, originalWidth: 50, originalHeight: 50, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 140, y: 140, width: 50, height: 50, scale: 1, originalWidth: 50, originalHeight: 50, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { bottom: 10, right: 10, width: 50, height: 50 };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {centerX, centerY, width, height}", function () {

    var layout = { centerX: 10, centerY: 10, width: 60, height: 60 };
    var no_f = { x: 10, y: 10, width: 60, height: 60, scale: 1, originalWidth: 60, originalHeight: 60, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 80, y: 80, width: 60, height: 60, scale: 1, originalWidth: 60, originalHeight: 60, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { marginLeft: -20, marginTop: -20, width: 60, height: 60, top: "50%", left: "50%" };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {top, left, width: auto, height: auto}", function () {
    // Reset.
    child.destroy();

    child = SC.View.create({
      useStaticLayout: YES,
      render: function (context) {
        // needed for auto
        context.push('<div style="padding: 10px"></div>');
      }
    });

    // parent MUST have a layer.
    parent.createLayer();
    var layer = parent.get('layer');
    document.body.appendChild(layer);

    var layout = { top: 0, left: 0, width: 'auto', height: 'auto' };
    var no_f = null;
    // See test below
    var with_f; // { x: 0, y: 0, width: 200, height: 200 };
    var s = { top: 0, left: 0, width: 'auto', height: 'auto' };

    performLayoutTest(layout, no_f, s, with_f, s, NO);

    layer.parentNode.removeChild(layer);
    child.destroy();
  });

  // See comment in above test
  test("layout {top, left, width: auto, height: auto} - frame");



  // ..........................................................
  // TEST FRAME/STYLEFRAME WITH BASIC LAYOUT VARIATIONS
  //
  // NOTE:  Each test evaluates the frame before and after adding it to the
  // parent.

  module('BASIC LAYOUT VARIATIONS PERCENTAGE', commonSetup);

  test("layout {top, left, width, height}", function () {

    var layout = { top: 0.1, left: 0.1, width: 0.5, height: 0.5 };
    var s = { top: '10%', left: '10%', width: '50%', height: '50%' };
    var no_f = { x: 0, y: 0, width: 0, height: 0, scale: 1, originalWidth: 0, originalHeight: 0, originalWidth: 0, originalHeight: 0, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 20, y: 20, width: 100, height: 100, scale: 1, originalWidth: 50, originalHeight: 50, originalWidth: 100, originalHeight: 100, transformOriginX: 0.5, transformOriginY: 0.5 };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {top, left, bottom, right}", function () {

    var layout = { top: 0.1, left: 0.1, bottom: 0.1, right: 0.1 };
    var no_f = { x: 0, y: 0, width: 0, height: 0, scale: 1, originalWidth: 0, originalHeight: 0, originalWidth: 0, originalHeight: 0, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f =  { x: 20, y: 20, width: 160, height: 160, scale: 1, originalWidth: 160, originalHeight: 160, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { top: '10%', left: '10%', bottom: '10%', right: '10%' };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {bottom, right, width, height}", function () {

    var layout = { bottom: 0.1, right: 0.1, width: 0.5, height: 0.5 };
    var no_f = { x: 0, y: 0, width: 0, height: 0, scale: 1, originalWidth: 0, originalHeight: 0, originalWidth: 0, originalHeight: 0, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 80, y: 80, width: 100, height: 100, scale: 1, originalWidth: 50, originalHeight: 50, originalWidth: 100, originalHeight: 100, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { bottom: '10%', right: '10%', width: '50%', height: '50%' };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {centerX, centerY, width, height}", function () {

    var layout = { centerX: 0.1, centerY: 0.1, width: 0.6, height: 0.6 };
    var no_f = { x: 0, y: 0, width: 0, height: 0, scale: 1, originalWidth: 0, originalHeight: 0, originalWidth: 0, originalHeight: 0, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 60, y: 60, width: 120, height: 120, scale: 1, originalWidth: 60, originalHeight: 60, originalWidth: 120, originalHeight: 120, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { marginLeft: '-20%', marginTop: '-20%', width: '60%', height: '60%', top: "50%", left: "50%" };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  // Previously, you couldn't set a % width or height with a centerX/centerY of 0.
  // But there's no reason that a % sized view can't be centered at 0 and this
  // test shows that.
  test("layout {centerX 0, centerY 0, width %, height %}", function () {
    var layout = { centerX: 0, centerY: 0, width: 0.6, height: 0.6 };
    var no_f = { x: 0, y: 0, width: 0, height: 0, scale: 1, originalWidth: 0, originalHeight: 0, originalWidth: 0, originalHeight: 0, transformOriginX: 0.5, transformOriginY: 0.5 };

    // The parent frame is 200 x 200.
    var size = 200 * 0.6;
    var with_f = { x: (200 - size) * 0.5, y: (200 - size) * 0.5, width: size, height: size, scale: 1, originalWidth: size, originalHeight: size, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { marginLeft: '-30%', marginTop: '-30%', width: '60%', height: '60%', top: "50%", left: "50%" };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  // Edge case: although rare, centered views should be able to have metrics of zero.
  test("layout {centerX 0, centerY 0, width 0, height 0}", function () {
    var layout = { centerX: 0, centerY: 0, width: 0, height: 0 };
    var no_f = { x: 0, y: 0, width: 0, height: 0, scale: 1, originalWidth: 0, originalHeight: 0, originalWidth: 0, originalHeight: 0, transformOriginX: 0.5, transformOriginY: 0.5 };

    // The parent frame is 200 x 200.
    var size = 0;
    var with_f = { x: (200 - size) * 0.5, y: (200 - size) * 0.5, width: size, height: size, scale: 1, originalWidth: size, originalHeight: size, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { marginLeft: '0px', marginTop: '0px', width: '0px', height: '0px', top: '50%', left: '50%' };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {top, left, width: auto, height: auto}", function () {
    // Reset.
    child.destroy();

    child = SC.View.create({
      useStaticLayout: YES,
      render: function (context) {
        // needed for auto
        context.push('<div style="padding: 10px"></div>');
      }
    });

    // parent MUST have a layer.
    parent.createLayer();
    var layer = parent.get('layer');
    document.body.appendChild(layer);

    var layout = { top: 0.1, left: 0.1, width: 'auto', height: 'auto' };
    var no_f = null;
    // See pending test below
    var with_f; // { x: 20, y: 20, width: 180, height: 180 };
    var s = { top: '10%', left: '10%', width: 'auto', height: 'auto' };

    performLayoutTest(layout, no_f, s, with_f, s, NO);

    layer.parentNode.removeChild(layer);
    child.destroy();
  });

  // See commented out lines in test above
  test("layout {top, left, width: auto, height: auto} - frame");




  // ..........................................................
  // TEST FRAME/STYLEFRAME WITH BASIC LAYOUT VARIATIONS
  //
  // NOTE:  Each test evaluates the frame before and after adding it to the
  // parent.

  module('BASIC LAYOUT VARIATIONS WITH SCALE AND ORIGIN', commonSetup);

  //
  // top, left, width, height
  //
  test("layout {top, left, width, height, scale up}", function () {

    var layout = { top: 10, left: 10, width: 50, height: 50, scale: 2 };
    var s = { top: 10, left: 10, width: 50, height: 50, transform: "scale(2)" };
    var no_f = { x: -15, y: -15, width: 100, height: 100, scale: 2, originalWidth: 50, originalHeight: 50, originalWidth: 50, originalHeight: 50, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: -15, y: -15, width: 100, height: 100, scale: 2, originalWidth: 50, originalHeight: 50, originalWidth: 50, originalHeight: 50, transformOriginX: 0.5, transformOriginY: 0.5 };

    performLayoutTest(layout, no_f, s, with_f, s, YES);
  });

  test("layout {top, left, width, height, scale down}", function () {

    var layout = { top: 10, left: 10, width: 50, height: 50, scale: 0.6 };
    var s = { top: 10, left: 10, width: 50, height: 50, transform: "scale(0.6)" };
    var no_f = { x: 20, y: 20, width: 30, height: 30, scale: 0.6, originalWidth: 50, originalHeight: 50, originalWidth: 50, originalHeight: 50, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 20, y: 20, width: 30, height: 30, scale: 0.6, originalWidth: 50, originalHeight: 50, originalWidth: 50, originalHeight: 50, transformOriginX: 0.5, transformOriginY: 0.5 };

    performLayoutTest(layout, no_f, s, with_f, s, YES);
  });

  test("layout {top, left, width, height, scale up, origin top left}", function () {

    var layout = { top: 10, left: 10, width: 50, height: 50, scale: 2, transformOriginX: 0, transformOriginY: 0 };
    var s = { top: 10, left: 10, width: 50, height: 50, transform: "scale(2)", transformOrigin: "0% 0%" };
    var no_f = { x: 10, y: 10, width: 100, height: 100, scale: 2, originalWidth: 50, originalHeight: 50, originalWidth: 50, originalHeight: 50, transformOriginX: 0, transformOriginY: 0 };
    var with_f = { x: 10, y: 10, width: 100, height: 100, scale: 2, originalWidth: 50, originalHeight: 50, originalWidth: 50, originalHeight: 50, transformOriginX: 0, transformOriginY: 0 };

    performLayoutTest(layout, no_f, s, with_f, s, YES);
  });

  test("layout {top, left, width, height, scale down, origin top left}", function () {

    var layout = { top: 10, left: 10, width: 50, height: 50, scale: 0.6, transformOriginX: 0, transformOriginY: 0 };
    var s = { top: 10, left: 10, width: 50, height: 50, transform: "scale(0.6)", transformOrigin: "0% 0%" };
    var no_f = { x: 10, y: 10, width: 30, height: 30, scale: 0.6, originalWidth: 50, originalHeight: 50, originalWidth: 50, originalHeight: 50, transformOriginX: 0, transformOriginY: 0 };
    var with_f = { x: 10, y: 10, width: 30, height: 30, scale: 0.6, originalWidth: 50, originalHeight: 50, originalWidth: 50, originalHeight: 50, transformOriginX: 0, transformOriginY: 0 };

    performLayoutTest(layout, no_f, s, with_f, s, YES);
  });

  test("layout {top, left, width, height, scale up, origin bottom right}", function () {

    var layout = { top: 10, left: 10, width: 50, height: 50, scale: 2, transformOriginX: 1, transformOriginY: 1 };
    var s = { top: 10, left: 10, width: 50, height: 50, transform: "scale(2)", transformOrigin: "100% 100%" };
    var no_f = { x: -40, y: -40, width: 100, height: 100, scale: 2, originalWidth: 50, originalHeight: 50, originalWidth: 50, originalHeight: 50, transformOriginX: 1, transformOriginY: 1 };
    var with_f = { x: -40, y: -40, width: 100, height: 100, scale: 2, originalWidth: 50, originalHeight: 50, originalWidth: 50, originalHeight: 50, transformOriginX: 1, transformOriginY: 1 };

    performLayoutTest(layout, no_f, s, with_f, s, YES);
  });

  test("layout {top, left, width, height, scale down, origin bottom right}", function () {

    var layout = { top: 10, left: 10, width: 50, height: 50, scale: 0.6, transformOriginX: 1, transformOriginY: 1 };
    var s = { top: 10, left: 10, width: 50, height: 50, transform: "scale(0.6)", transformOrigin: "100% 100%" };
    var no_f = { x: 30, y: 30, width: 30, height: 30, scale: 0.6, originalWidth: 50, originalHeight: 50, originalWidth: 50, originalHeight: 50, transformOriginX: 1, transformOriginY: 1 };
    var with_f = { x: 30, y: 30, width: 30, height: 30, scale: 0.6, originalWidth: 50, originalHeight: 50, originalWidth: 50, originalHeight: 50, transformOriginX: 1, transformOriginY: 1 };

    performLayoutTest(layout, no_f, s, with_f, s, YES);
  });

  //
  // top, left, bottom, right
  //
  test("layout {top, left, bottom, right, scale up}", function () {

    var layout = { top: 10, left: 10, bottom: 10, right: 10, scale: 2 };
    var no_f = { x: 10, y: 10, width: 0, height: 0, scale: 2, originalWidth: 0, originalHeight: 0, originalWidth: 0, originalHeight: 0, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: -80, y: -80, width: 360, height: 360, scale: 2, originalWidth: 180, originalHeight: 180, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { top: 10, left: 10, bottom: 10, right: 10, transform: "scale(2)" };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {top, left, bottom, right, scale down}", function () {

    var layout = { top: 10, left: 10, bottom: 10, right: 10, scale: 0.5 };
    var no_f = { x: 10, y: 10, width: 0, height: 0, scale: 0.5, originalWidth: 0, originalHeight: 0, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 55, y: 55, width: 90, height: 90, scale: 0.5, originalWidth: 180, originalHeight: 180, originalWidth: 180, originalHeight: 180, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { top: 10, left: 10, bottom: 10, right: 10, transform: "scale(0.5)" };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {top, left, bottom, right, scale up, origin top left}", function () {

    var layout = { top: 10, left: 10, bottom: 10, right: 10, scale: 2, transformOriginX: 0, transformOriginY: 0 };
    var no_f = { x: 10, y: 10, width: 0, height: 0, scale: 2, originalWidth: 0, originalHeight: 0, transformOriginX: 0, transformOriginY: 0 };
    var with_f = { x: 10, y: 10, width: 360, height: 360, scale: 2, originalWidth: 180, originalHeight: 180, originalWidth: 180, originalHeight: 180, transformOriginX: 0, transformOriginY: 0 };
    var s = { top: 10, left: 10, bottom: 10, right: 10, transform: "scale(2)", transformOrigin: "0% 0%" };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {top, left, bottom, right, scale down, origin top left}", function () {

    var layout = { top: 10, left: 10, bottom: 10, right: 10, scale: 0.5, transformOriginX: 0, transformOriginY: 0 };
    var no_f = { x: 10, y: 10, width: 0, height: 0, scale: 0.5, originalWidth: 0, originalHeight: 0, transformOriginX: 0, transformOriginY: 0 };
    var with_f = { x: 10, y: 10, width: 90, height: 90, scale: 0.5, originalWidth: 180, originalHeight: 180, transformOriginX: 0, transformOriginY: 0 };
    var s = { top: 10, left: 10, bottom: 10, right: 10, transform: "scale(0.5)", transformOrigin: "0% 0%" };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {top, left, bottom, right, scale up, origin bottom right}", function () {

    var layout = { top: 10, left: 10, bottom: 10, right: 10, scale: 2, transformOriginX: 1, transformOriginY: 1 };
    var no_f = { x: 10, y: 10, width: 0, height: 0, scale: 2, originalWidth: 0, originalHeight: 0, transformOriginX: 1, transformOriginY: 1 };
    var with_f = { x: -170, y: -170, width: 360, height: 360, scale: 2, originalWidth: 180, originalHeight: 180, transformOriginX: 1, transformOriginY: 1 };
    var s = { top: 10, left: 10, bottom: 10, right: 10, transform: "scale(2)", transformOrigin: "100% 100%" };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {top, left, bottom, right, scale down, origin bottom right}", function () {

    var layout = { top: 10, left: 10, bottom: 10, right: 10, scale: 0.5, transformOriginX: 1, transformOriginY: 1 };
    var no_f = { x: 10, y: 10, width: 0, height: 0, scale: 0.5, originalWidth: 0, originalHeight: 0, transformOriginX: 1, transformOriginY: 1 };
    var with_f = { x: 100, y: 100, width: 90, height: 90, scale: 0.5, originalWidth: 180, originalHeight: 180, originalWidth: 180, originalHeight: 180, transformOriginX: 1, transformOriginY: 1 };
    var s = { top: 10, left: 10, bottom: 10, right: 10, transform: "scale(0.5)", transformOrigin: "100% 100%" };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  //
  // bottom, right, width, height
  //
  test("layout {bottom, right, width, height, scaled up}", function () {

    var layout = { bottom: 10, right: 10, width: 50, height: 50, scale: 2 };
    var no_f = { x: -25, y: -25, width: 100, height: 100, scale: 2, originalWidth: 50, originalHeight: 50, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 115, y: 115, width: 100, height: 100, scale: 2, originalWidth: 50, originalHeight: 50, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { bottom: 10, right: 10, width: 50, height: 50, transform: "scale(2)" };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {bottom, right, width, height, scaled down}", function () {

    var layout = { bottom: 10, right: 10, width: 50, height: 50, scale: 0.6 };
    var no_f = { x: 10, y: 10, width: 30, height: 30, scale: 0.6, originalWidth: 50, originalHeight: 50, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 150, y: 150, width: 30, height: 30, scale: 0.6, originalWidth: 50, originalHeight: 50, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { bottom: 10, right: 10, width: 50, height: 50, transform: "scale(0.6)" };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {bottom, right, width, height, scaled up, origin top left}", function () {

    var layout = { bottom: 10, right: 10, width: 50, height: 50, scale: 2, transformOriginX: 0, transformOriginY: 0 };
    var no_f = { x: 0, y: 0, width: 100, height: 100, scale: 2, originalWidth: 50, originalHeight: 50, transformOriginX: 0, transformOriginY: 0 };
    var with_f = { x: 140, y: 140, width: 100, height: 100, scale: 2, originalWidth: 50, originalHeight: 50, transformOriginX: 0, transformOriginY: 0 };
    var s = { bottom: 10, right: 10, width: 50, height: 50, transform: "scale(2)", transformOrigin: "0% 0%" };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {bottom, right, width, height, scaled down, origin top left}", function () {

    var layout = { bottom: 10, right: 10, width: 50, height: 50, scale: 0.6, transformOriginX: 0, transformOriginY: 0 };
    var no_f = { x: 0, y: 0, width: 30, height: 30, scale: 0.6, originalWidth: 50, originalHeight: 50, transformOriginX: 0, transformOriginY: 0 };
    var with_f = { x: 140, y: 140, width: 30, height: 30, scale: 0.6, originalWidth: 50, originalHeight: 50, transformOriginX: 0, transformOriginY: 0 };
    var s = { bottom: 10, right: 10, width: 50, height: 50, transform: "scale(0.6)", transformOrigin: "0% 0%" };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {bottom, right, width, height, scaled up, origin bottom right}", function () {

    var layout = { bottom: 10, right: 10, width: 50, height: 50, scale: 2, transformOriginX: 1, transformOriginY: 1 };
    var no_f = { x: -50, y: -50, width: 100, height: 100, scale: 2, originalWidth: 50, originalHeight: 50, transformOriginX: 1, transformOriginY: 1 };
    var with_f = { x: 90, y: 90, width: 100, height: 100, scale: 2, originalWidth: 50, originalHeight: 50, transformOriginX: 1, transformOriginY: 1 };
    var s = { bottom: 10, right: 10, width: 50, height: 50, transform: "scale(2)", transformOrigin: "100% 100%" };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {bottom, right, width, height, scaled down, origin bottom right}", function () {

    var layout = { bottom: 10, right: 10, width: 50, height: 50, scale: 0.6, transformOriginX: 1, transformOriginY: 1 };
    var no_f = { x: 20, y: 20, width: 30, height: 30, scale: 0.6, originalWidth: 50, originalHeight: 50, transformOriginX: 1, transformOriginY: 1 };
    var with_f = { x: 160, y: 160, width: 30, height: 30, scale: 0.6, originalWidth: 50, originalHeight: 50, transformOriginX: 1, transformOriginY: 1 };
    var s = { bottom: 10, right: 10, width: 50, height: 50, transform: "scale(0.6)", transformOrigin: "100% 100%" };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  //
  // bottom, right, width, height
  //
  test("layout {centerX, centerY, width, height, scale up}", function () {

    var layout = { centerX: 10, centerY: 10, width: 60, height: 60, scale: 2 };
    var no_f = { x: -20, y: -20, width: 120, height: 120, scale: 2, originalWidth: 60, originalHeight: 60, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 50, y: 50, width: 120, height: 120, scale: 2, originalWidth: 60, originalHeight: 60, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { marginLeft: -20, marginTop: -20, width: 60, height: 60, top: "50%", left: "50%", transform: "scale(2)" };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {centerX, centerY, width, height, scale down}", function () {

    var layout = { centerX: 10, centerY: 10, width: 60, height: 60, scale: 0.6 };
    var no_f = { x: 22, y: 22, width: 36, height: 36, scale: 0.6, originalWidth: 60, originalHeight: 60, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 92, y: 92, width: 36, height: 36, scale: 0.6, originalWidth: 60, originalHeight: 60, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { marginLeft: -20, marginTop: -20, width: 60, height: 60, top: "50%", left: "50%", transform: "scale(0.6)" };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {centerX, centerY, width, height, scale up, origin top left}", function () {

    var layout = { centerX: 10, centerY: 10, width: 60, height: 60, scale: 2, transformOriginX: 0, transformOriginY: 0 };
    var no_f = { x: 10, y: 10, width: 120, height: 120, scale: 2, originalWidth: 60, originalHeight: 60, transformOriginX: 0, transformOriginY: 0 };
    var with_f = { x: 80, y: 80, width: 120, height: 120, scale: 2, originalWidth: 60, originalHeight: 60, transformOriginX: 0, transformOriginY: 0 };
    var s = { marginLeft: -20, marginTop: -20, width: 60, height: 60, top: "50%", left: "50%", transform: "scale(2)", transformOrigin: "0% 0%" };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {centerX, centerY, width, height, scale down, origin top left}", function () {

    var layout = { centerX: 10, centerY: 10, width: 60, height: 60, scale: 0.6, transformOriginX: 0, transformOriginY: 0 };
    var no_f = { x: 10, y: 10, width: 36, height: 36, scale: 0.6, originalWidth: 60, originalHeight: 60, transformOriginX: 0, transformOriginY: 0 };
    var with_f = { x: 80, y: 80, width: 36, height: 36, scale: 0.6, originalWidth: 60, originalHeight: 60, transformOriginX: 0, transformOriginY: 0 };
    var s = { marginLeft: -20, marginTop: -20, width: 60, height: 60, top: "50%", left: "50%", transform: "scale(0.6)", transformOrigin: "0% 0%" };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {centerX, centerY, width, height, scale up, origin bottom right}", function () {

    var layout = { centerX: 10, centerY: 10, width: 60, height: 60, scale: 2, transformOriginX: 1, transformOriginY: 1 };
    var no_f = { x: -50, y: -50, width: 120, height: 120, scale: 2, originalWidth: 60, originalHeight: 60, transformOriginX: 1, transformOriginY: 1 };
    var with_f = { x: 20, y: 20, width: 120, height: 120, scale: 2, originalWidth: 60, originalHeight: 60, transformOriginX: 1, transformOriginY: 1 };
    var s = { marginLeft: -20, marginTop: -20, width: 60, height: 60, top: "50%", left: "50%", transform: "scale(2)", transformOrigin: "100% 100%" };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {centerX, centerY, width, height, scale down, origin bottom right}", function () {

    var layout = { centerX: 10, centerY: 10, width: 60, height: 60, scale: 0.6, transformOriginX: 1, transformOriginY: 1 };
    var no_f = { x: 34, y: 34, width: 36, height: 36, scale: 0.6, originalWidth: 60, originalHeight: 60, transformOriginX: 1, transformOriginY: 1 };
    var with_f = { x: 104, y: 104, width: 36, height: 36, scale: 0.6, originalWidth: 60, originalHeight: 60, transformOriginX: 1, transformOriginY: 1 };
    var s = { marginLeft: -20, marginTop: -20, width: 60, height: 60, top: "50%", left: "50%", transform: "scale(0.6)", transformOrigin: "100% 100%" };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {top, left, width: auto, height: auto, scale}", function () {
    // Reset.
    child.destroy();

    child = SC.View.create({
      useStaticLayout: YES,
      render: function (context) {
        // needed for auto
        context.push('<div style="padding: 10px"></div>');
      }
    });

    // parent MUST have a layer.
    parent.createLayer();
    var layer = parent.get('layer');
    document.body.appendChild(layer);

    var layout = { top: 0, left: 0, width: 'auto', height: 'auto', scale: 2 };
    var no_f = null;
    // See test below
    var with_f; // { x: 0, y: 0, width: 200, height: 200 };
    var s = { top: 0, left: 0, width: 'auto', height: 'auto', transform: 'scale(2)' };

    performLayoutTest(layout, no_f, s, with_f, s, NO);

    layer.parentNode.removeChild(layer);
    child.destroy();
  });

  // See comment in above test
  test("layout {top, left, width: auto, height: auto} - frame");


  // ..........................................................
  // TEST CSS TRANSFORM LAYOUT VARIATIONS
  //
  // NOTE:  Each test evaluates the frame before and after adding it to the
  // parent.

  module('ROTATE LAYOUT VARIATIONS', {
    setup: function () {
      commonSetup.setup();
      child.createLayer();
      document.body.appendChild(child.get('layer'));
    },

    teardown: function () {
      document.body.removeChild(child.get('layer'));
      child.destroyLayer();
      commonSetup.teardown();
    }
  });

  function transformFor(view) {
    return view.get('layer').style[SC.browser.experimentalStyleNameFor('transform')];
  }

  test("layout {rotateX}", function () {
    SC.run(function () {
      child.adjust('rotateX', 45).updateLayout(true);
    });

    equals(transformFor(child), 'rotateX(45deg)', 'transform attribute should be "rotateX(45deg)"');
  });

  test("layout {rotateY}", function () {
    SC.run(function () {
      child.adjust('rotateY', 45).updateLayout(true);
    });
    equals(transformFor(child), 'rotateY(45deg)', 'transform attribute should be "rotateY(45deg)"');
  });

  test("layout {rotateZ}", function () {
    SC.run(function () {
      child.adjust('rotateZ', 45).updateLayout(true);
    });

    equals(transformFor(child), 'rotateZ(45deg)', 'transform attribute should be "rotateZ(45deg)"');
  });

  test("layout {rotate}", function () {
    SC.run(function () {
      child.adjust('rotate', 45).updateLayout(true);
    });

    equals(transformFor(child), 'rotateZ(45deg)', 'transform attribute should be "rotateZ(45deg)"');
  });

  test("layout {rotateX} with units", function () {
    SC.run(function () {
      child.adjust('rotateX', '1rad').updateLayout(true);
    });

    equals(transformFor(child), 'rotateX(1rad)', 'transform attribute should be "rotateX(1rad)"');
  });

  // Scale is now a first-class layout property re: frame. The following are simple integration tests with
  // rotate.
  test("layout {scale}", function () {
    SC.run(function () {
      child.adjust('scale', 2).updateLayout(true);
    });

    equals(transformFor(child), 'scale(2)', 'transform attribute should be "scale(2)"');
  });

  test("layout {scale} with multiple", function () {
    SC.run(function () {
      child.adjust('scale', [2, 3]).updateLayout(true);
    });

    equals(transformFor(child), 'scale(2, 3)', 'transform attribute should be "scale(2, 3)"');
  });

  test("layout {rotateX, scale}", function () {
    SC.run(function () {
      child.adjust({ rotateX: 45, scale: 2 }).updateLayout(true);
    });

    equals(transformFor(child), 'rotateX(45deg) scale(2)', 'transform attribute should be "rotateX(45deg) scale(2)"');
  });

  test("layout {rotateX} update", function () {
    SC.run(function () {
      child.adjust('rotateX', 45).updateLayout(true);
      child.adjust('rotateX', 90).updateLayout(true);
    });

    equals(transformFor(child), 'rotateX(90deg)', 'transform attribute should be "rotateX(90deg)"');
  });


  if (SC.platform.supportsCSSTransforms) {

    // ..........................................................
    // TEST FRAME/STYLEFRAME WITH ACCELERATE LAYOUT VARIATIONS
    //
    // NOTE:  Each test evaluates the frame before and after adding it to the
    // parent.

    module('ACCELERATED LAYOUT VARIATIONS', {
      setup: function () {
        commonSetup.setup();
        child.set('wantsAcceleratedLayer', YES);
      },

      teardown: commonSetup.teardown
    });

    test("layout {top, left, width, height}", function () {
      var layout = { top: 10, left: 10, width: 50, height: 50 };
      var expectedTransform = 'translateX(10px) translateY(10px)';
      if (SC.platform.supportsCSS3DTransforms) expectedTransform += ' translateZ(0px)';
      var s = { top: 0, left: 0, width: 50, height: 50, transform: expectedTransform };
      var no_f = { x: 10, y: 10, width: 50, height: 50, scale: 1, originalWidth: 50, originalHeight: 50, transformOriginX: 0.5, transformOriginY: 0.5 };
      var with_f = { x: 10, y: 10, width: 50, height: 50, scale: 1, originalWidth: 50, originalHeight: 50, transformOriginX: 0.5, transformOriginY: 0.5 };

      performLayoutTest(layout, no_f, s, with_f, s, YES);
    });

    test("layout {top, left, bottom, right}", function () {

      var layout = { top: 10, left: 10, bottom: 10, right: 10 };
      var no_f = { x: 10, y: 10, width: 0, height: 0, scale: 1, originalWidth: 0, originalHeight: 0, originalWidth: 0, originalHeight: 0, transformOriginX: 0.5, transformOriginY: 0.5 };
      var with_f = { x: 10, y: 10, width: 180, height: 180, scale: 1, originalWidth: 180, originalHeight: 180, transformOriginX: 0.5, transformOriginY: 0.5 };
      var s = { top: 10, left: 10, bottom: 10, right: 10, transform: null };

      performLayoutTest(layout, no_f, s, with_f, s, NO);
    });

    test("layout {top, left, width: auto, height: auto}", function () {
      // Reset.
      child.destroy();

      child = SC.View.create({
        wantsAcceleratedLayer: YES,
        useStaticLayout: YES,
        render: function (context) {
          // needed for auto
          context.push('<div style="padding: 10px"></div>');
        }
      });

      // parent MUST have a layer.
      parent.createLayer();
      var layer = parent.get('layer');
      document.body.appendChild(layer);

      var layout = { top: 0, left: 0, width: 'auto', height: 'auto' };
      var no_f = null;
      // See test below
      var with_f; // { x: 0, y: 0, width: 200, height: 200 };
      var s = { top: 0, left: 0, width: 'auto', height: 'auto', transform: null };

      performLayoutTest(layout, no_f, s, with_f, s, NO);

      layer.parentNode.removeChild(layer);

      child.destroy();
    });

    // See commented lines in test above
    test("layout {top, left, width: auto, height: auto} - frame");

    test("layout w/ percentage {top, left, width, height}", function () {

      var layout = { top: 0.1, left: 0.1, width: 0.5, height: 0.5 };
      var s = { top: '10%', left: '10%', width: '50%', height: '50%', transform: null };
      var no_f = { x: 0, y: 0, width: 0, height: 0, scale: 1, originalWidth: 0, originalHeight: 0, originalWidth: 0, originalHeight: 0, transformOriginX: 0.5, transformOriginY: 0.5 };
      var with_f = { x: 20, y: 20, width: 100, height: 100, scale: 1, originalWidth: 50, originalHeight: 50, originalWidth: 100, originalHeight: 100, transformOriginX: 0.5, transformOriginY: 0.5 };

      performLayoutTest(layout, no_f, s, with_f, s, NO);
    });

  }



  // ..........................................................
  // TEST FRAME/STYLEFRAME WITH INVALID LAYOUT VARIATIONS
  //
  // NOTE:  Each test evaluates the frame before and after adding it to the
  // parent.

  module('INVALID LAYOUT VARIATIONS', commonSetup);

  test("layout {top, left} - assume right/bottom=0", function () {

    var layout = { top: 0.1, left: 0.1 };
    var no_f = { x: 0, y: 0, width: 0, height: 0, scale: 1, originalWidth: 0, originalHeight: 0, originalWidth: 0, originalHeight: 0, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 20, y: 20, width: 180, height: 180, scale: 1, originalWidth: 180, originalHeight: 180, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { bottom: 0, right: 0, top: '10%', left: '10%' };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {height, width} - assume top/left=0", function () {

    var layout = { height: 0.6, width: 0.6 };
    var no_f = { x: 0, y: 0, width: 0, height: 0, scale: 1, originalWidth: 0, originalHeight: 0, originalWidth: 0, originalHeight: 0, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 0, y: 0, width: 120, height: 120, scale: 1, originalWidth: 60, originalHeight: 60, originalWidth: 120, originalHeight: 120, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { width: '60%', height: '60%', top: 0, left: 0 };

    performLayoutTest(layout, no_f, s, with_f, s, NO);

  });

  test("layout {right, bottom} - assume top/left=0", function () {

    var layout = { right: 0.1, bottom: 0.1 };
    var no_f = { x: 0, y: 0, width: 0, height: 0, scale: 1, originalWidth: 0, originalHeight: 0, originalWidth: 0, originalHeight: 0, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 0, y: 0, width: 180, height: 180, scale: 1, originalWidth: 180, originalHeight: 180, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { bottom: '10%', right: '10%', top: 0, left: 0 };

    performLayoutTest(layout, no_f, s, with_f, s, NO);

  });

  test("layout {right, bottom, maxWidth, maxHeight} - assume top/left=null", function () {

    var layout = { right: 0.1, bottom: 0.1, maxWidth: 10, maxHeight: 10 };
    var no_f = { x: 0, y: 0, width: 0, height: 0, scale: 1, originalWidth: 0, originalHeight: 0, originalWidth: 0, originalHeight: 0, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 0, y: 0, width: 10, height: 10, scale: 1, originalWidth: 10, originalHeight: 10, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { bottom: '10%', right: '10%', top: null, left: null, maxWidth: 10, maxHeight: 10 };

    performLayoutTest(layout, no_f, s, with_f, s, NO);

  });

  test("layout {centerX, centerY} - assume width/height=0", function () {

    var layout = { centerX: 0.1, centerY: 0.1 };
    var no_f = { x: 0, y: 0, width: 0, height: 0, scale: 1, originalWidth: 0, originalHeight: 0, originalWidth: 0, originalHeight: 0, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 120, y: 120, width: 0, height: 0, scale: 1, originalWidth: 0, originalHeight: 0, originalWidth: 0, originalHeight: 0, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { width: 0, height: 0, top: "50%", left: "50%", marginTop: "50%", marginLeft: "50%" };
    performLayoutTest(layout, no_f, s, with_f, s, NO);

  });

  test("layout {top, left, centerX, centerY, height, width} - top/left take presidence", function () {

    var layout = { top: 0.1, left: 0.1, centerX: 0.1, centerY: 0.1, height: 0.6, width: 0.6 };
    var no_f = { x: 0, y: 0, width: 0, height: 0, scale: 1, originalWidth: 0, originalHeight: 0, originalWidth: 0, originalHeight: 0, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 20, y: 20, width: 120, height: 120, scale: 1, originalWidth: 60, originalHeight: 60, originalWidth: 120, originalHeight: 120, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { width: '60%', height: '60%', top: '10%', left: '10%' };

    performLayoutTest(layout, no_f, s, with_f, s, NO);

  });

  test("layout {bottom, right, centerX, centerY, height, width} - bottom/right take presidence", function () {

    var layout = { bottom: 0.1, right: 0.1, centerX: 0.1, centerY: 0.1, height: 0.6, width: 0.6 };
    var no_f = { x: 0, y: 0, width: 0, height: 0, scale: 1, originalWidth: 0, originalHeight: 0, originalWidth: 0, originalHeight: 0, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 60, y: 60, width: 120, height: 120, scale: 1, originalWidth: 60, originalHeight: 60, originalWidth: 120, originalHeight: 120, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { width: '60%', height: '60%', bottom: '10%', right: '10%' };

    performLayoutTest(layout, no_f, s, with_f, s, NO);

  });

  test("layout {top, left, bottom, right, centerX, centerY, height, width} - top/left take presidence", function () {

    var layout = { top: 0.1, left: 0.1, bottom: 0.1, right: 0.1, centerX: 0.1, centerY: 0.1, height: 0.6, width: 0.6 };
    var no_f = { x: 0, y: 0, width: 0, height: 0, scale: 1, originalWidth: 0, originalHeight: 0, originalWidth: 0, originalHeight: 0, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 20, y: 20, width: 120, height: 120, scale: 1, originalWidth: 60, originalHeight: 60, originalWidth: 120, originalHeight: 120, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { width: '60%', height: '60%', top: '10%', left: '10%' };

    performLayoutTest(layout, no_f, s, with_f, s, NO);

  });


  test("layout {centerX, centerY, width:auto, height:auto}", function () {
    var error = 'NONE';
    var layout = { centerX: 0.1, centerY: 0.1, width: 'auto', height: 'auto' };

    try {
      SC.run(function () {
        child.set('layout', layout);
      });
      child.layoutStyle();
    } catch (e) {
      error = e;
    }

    equals(SC.T_ERROR, SC.typeOf(error), 'Layout style functions should throw an ' +
                                           'error if centerx/y and width/height are set at the same time ' + error);
  });


  // ..........................................................
  // TEST BORDER
  //

  module('BORDER LAYOUT VARIATIONS', commonSetup);

  test("layout {top, left, width, height, border}", function () {
    var layout = { top: 10, left: 10, width: 50, height: 50, border: 2 };
    var s = { top: 10, left: 10, width: 46, height: 46,
              borderTopWidth: 2, borderRightWidth: 2, borderBottomWidth: 2, borderLeftWidth: 2 };
    var no_f = { x: 12, y: 12, width: 46, height: 46, scale: 1, originalWidth: 46, originalHeight: 46, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 12, y: 12, width: 46, height: 46, scale: 1, originalWidth: 46, originalHeight: 46, transformOriginX: 0.5, transformOriginY: 0.5 };

    performLayoutTest(layout, no_f, s, with_f, s, YES);
  });

  test("layout {top, left, bottom, right, border}", function () {
    var layout = { top: 10, left: 10, bottom: 10, right: 10, border: 2 };
    var no_f = { x: 12, y: 12, width: 0, height: 0, scale: 1, originalWidth: 0, originalHeight: 0, originalWidth: 0, originalHeight: 0, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 12, y: 12, width: 176, height: 176, scale: 1, originalWidth: 176, originalHeight: 176, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { top: 10, left: 10, bottom: 10, right: 10,
               borderTopWidth: 2, borderRightWidth: 2, borderBottomWidth: 2, borderLeftWidth: 2 };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {top, left, bottom, right, borderTop, borderLeft, borderRight, borderBottom}", function () {
    var layout = { top: 10, left: 10, bottom: 10, right: 10, borderTop: 1, borderRight: 2, borderBottom: 3, borderLeft: 4 };
    var no_f = { x: 14, y: 11, width: 0, height: 0, scale: 1, originalWidth: 0, originalHeight: 0, originalWidth: 0, originalHeight: 0, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 14, y: 11, width: 174, height: 176, scale: 1, originalWidth: 174, originalHeight: 176, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { top: 10, left: 10, bottom: 10, right: 10,
               borderTopWidth: 1, borderRightWidth: 2, borderBottomWidth: 3, borderLeftWidth: 4 };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {top, left, bottom, right, border, borderTop, borderLeft}", function () {
    var layout = { top: 10, left: 10, bottom: 10, right: 10, border: 5, borderTop: 1, borderRight: 2 };
    var no_f = { x: 15, y: 11, width: 0, height: 0, scale: 1, originalWidth: 0, originalHeight: 0, originalWidth: 0, originalHeight: 0, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 15, y: 11, width: 173, height: 174, scale: 1, originalWidth: 173, originalHeight: 174, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { top: 10, left: 10, bottom: 10, right: 10,
               borderTopWidth: 1, borderRightWidth: 2, borderBottomWidth: 5, borderLeftWidth: 5 };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {bottom, right, width, height, border}", function () {

    var layout = { bottom: 10, right: 10, width: 50, height: 50, border: 2 };
    var no_f = { x: 2, y: 2, width: 46, height: 46, scale: 1, originalWidth: 46, originalHeight: 46, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 142, y: 142, width: 46, height: 46, scale: 1, originalWidth: 46, originalHeight: 46, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { bottom: 10, right: 10, width: 46, height: 46,
              borderTopWidth: 2, borderRightWidth: 2, borderBottomWidth: 2, borderLeftWidth: 2 };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {centerX, centerY, width, height, border}", function () {

    var layout = { centerX: 10, centerY: 10, width: 60, height: 60, border: 2 };
    var no_f = { x: 12, y: 12, width: 56, height: 56, scale: 1, originalWidth: 56, originalHeight: 56, transformOriginX: 0.5, transformOriginY: 0.5 };
    var with_f = { x: 82, y: 82, width: 56, height: 56, scale: 1, originalWidth: 56, originalHeight: 56, transformOriginX: 0.5, transformOriginY: 0.5 };
    var s = { marginLeft: -20, marginTop: -20, width: 56, height: 56, top: "50%", left: "50%",
              borderTopWidth: 2, borderRightWidth: 2, borderBottomWidth: 2, borderLeftWidth: 2 };

    performLayoutTest(layout, no_f, s, with_f, s, NO);
  });

  test("layout {top, left, width: auto, height: auto}", function () {
    // Reset.
    child.destroy();

    child = SC.View.create({
      useStaticLayout: YES,
      render: function (context) {
        // needed for auto
        context.push('<div style="padding: 10px"></div>');
      }
    });

    // parent MUST have a layer.
    parent.createLayer();
    var layer = parent.get('layer');
    document.body.appendChild(layer);

    var layout = { top: 0, left: 0, width: 'auto', height: 'auto', border: 2 };
    var no_f = null;
    var with_f; //{ x: 2, y: 2, width: 196, height: 196 };
    var s = { top: 0, left: 0, width: 'auto', height: 'auto',
              borderTopWidth: 2, borderRightWidth: 2, borderBottomWidth: 2, borderLeftWidth: 2 };

    performLayoutTest(layout, no_f, s, with_f, s, NO);

    layer.parentNode.removeChild(layer);

    child.destroy();
  });


  // ..........................................................
  // TEST FRAME/STYLEFRAME WHEN PARENT VIEW IS RESIZED
  //

  module('RESIZE FRAME', commonSetup);

  function verifyFrameResize(layout, before, after) {
    parent.appendChild(child);
    SC.run(function () { child.set('layout', layout); });

    ok(SC.rectsEqual(child.get('frame'), before), "Before: %@ == %@".fmt(SC.inspect(child.get('frame')), SC.inspect(before)));
    SC.run(function () { parent.adjust('width', 300).adjust('height', 300); });

    ok(SC.rectsEqual(child.get('frame'), after), "After: %@ == %@".fmt(SC.inspect(child.get('frame')), SC.inspect(after)));

  }

  test("frame does not change with top/left/w/h", function () {
    var layout = { top: 10, left: 10, width: 60, height: 60 };
    var before = { x: 10, y: 10, width: 60, height: 60 };
    var after =  { x: 10, y: 10, width: 60, height: 60 };
    verifyFrameResize(layout, before, after);
  });

  test("frame shifts down with bottom/right/w/h", function () {
    var layout = { bottom: 10, right: 10, width: 60, height: 60 };
    var before = { x: 130, y: 130, width: 60, height: 60 };
    var after =  { x: 230, y: 230, width: 60, height: 60 };
    verifyFrameResize(layout, before, after);
  });

  test("frame size shifts with top/left/bottom/right", function () {
    var layout = { top: 10, left: 10, bottom: 10, right: 10 };
    var before = { x: 10, y: 10, width: 180, height: 180 };
    var after =  { x: 10, y: 10, width: 280, height: 280 };
    verifyFrameResize(layout, before, after);
  });

  test("frame loc shifts with centerX/centerY", function () {
    var layout = { centerX: 10, centerY: 10, width: 60, height: 60 };
    var before = { x: 80, y: 80, width: 60, height: 60 };
    var after =  { x: 130, y: 130, width: 60, height: 60 };
    verifyFrameResize(layout, before, after);
  });

  //with percentage

  test("frame does not change with top/left/w/h - percentage", function () {
    var layout = { top: 0.1, left: 0.1, width: 0.6, height: 0.6 };
    var before = { x: 20, width: 120, y: 20, height: 120 };
    var after =  { x: 30, y: 30, width: 180, height: 180 };
    verifyFrameResize(layout, before, after);
  });

  test("frame shifts down with bottom/right/w/h - percentage", function () {
    var layout = { bottom: 0.1, right: 0.1, width: 0.6, height: 0.6 };
    var before = { x: 60, y: 60, width: 120, height: 120 };
    var after =  { x: 90, y: 90, width: 180, height: 180 };
    verifyFrameResize(layout, before, after);
  });

  test("frame size shifts with top/left/bottom/right - percentage", function () {
    var layout = { top: 0.1, left: 0.1, bottom: 0.1, right: 0.1 };
    var before = { x: 20, y: 20, width: 160, height: 160 };
    var after =  { x: 30, y: 30, width: 240, height: 240 };
    verifyFrameResize(layout, before, after);
  });

  test("frame loc shifts with centerX/centerY - percentage", function () {
    var layout = { centerX: 0, centerY: 0, width: 0.6, height: 0.6 };
    var before = { x: 40, y: 40, width: 120, height: 120 };
    var after =  { x: 60, y: 60, width: 180, height: 180 };
    verifyFrameResize(layout, before, after);
  });

  test("for proper null variables");
  // nothing should get passed through as undefined, instead we want null in certain cases

  module('STATIC LAYOUT VARIATIONS', commonSetup);

  test("no layout", function () {

    var no_f = null,
        no_s = {},
        with_f = null,
        with_s = {};

    child.set('useStaticLayout', true);

    performLayoutTest(SC.View.prototype.layout, no_f, no_s, with_f, with_s, NO);
  });

  test("with layout", function () {

    var layout = { top: 10, left: 10, width: 50, height: 50 },
        no_f = null,
        no_s = { top: 10, left: 10, width: 50, height: 50 },
        with_f = null,
        with_s = { top: 10, left: 10, width: 50, height: 50 };

    child.set('useStaticLayout', true);

    performLayoutTest(layout, no_f, no_s, with_f, with_s, YES);
  });

  // test("frame size shifts with top/left/bottom/right", function () {
  //   var error=null;
  //   var layout = { top: 10, left: 10, bottom: 10, right: 10 };
  //   parent.appendChild(child);
  //   child.set('layout', layout);
  //   child.get('frame');
  //   parent.adjust('width', 'auto').adjust('height', 'auto');
  //   try{
  //     child.get('frame');
  //   }catch(e) {
  //     error=e;
  //   }
  //   equals(SC.T_ERROR,SC.typeOf(error),'Layout style functions should throw and '+
  //   'error if centerx/y and width/height are set at the same time ' + error );
  //
  //
  // });

  var pane, view;
  module("COMPUTED LAYOUT", {
    setup: function () {

      SC.run(function () {
        // create basic view
        view = SC.View.create({
          useTopLayout: YES,

          layout: function () {
            if (this.get('useTopLayout')) {
              return { top: 10, left: 10, width: 100, height: 100 };
            } else {
              return { bottom: 10, right: 10, width: 200, height: 50 };
            }
          }.property('useTopLayout').cacheable()
        });

        pane = SC.Pane.create({
          layout: { centerX: 0, centerY: 0, width: 400, height: 400 },
          childViews: [view]
        }).append();
      });
    },

    teardown: function () {
      pane.destroy();
      pane = view = null;
    }
  });

  /**
    There was a regression while moving to jQuery 1.8 and removing the seemingly
    unuseful buffered jQuery code, where updating the style failed to clear the
    old style from the view's style attribute.
  */
  test("with computed layout", function () {
    var expectedLayoutStyle,
      expectedStyleAttr,
      layoutStyle,
      styleAttr;

    same(view.get('layout'), { top: 10, left: 10, width: 100, height: 100 }, "Test the value of the computed layout.");
    layoutStyle = view.get('layoutStyle');
    expectedLayoutStyle = { top: "10px", left: "10px", width: "100px", height: "100px" };
    for (var key in layoutStyle) {
      equals(layoutStyle[key], expectedLayoutStyle[key], "Test the value of %@ in the layout style.".fmt(key));
    }
    styleAttr = view.$().attr('style');
    styleAttr = styleAttr.split(/;\s*/).filter(function (o) { return o; });
    expectedStyleAttr = ['left: 10px', 'width: 100px', 'top: 10px', 'height: 100px'];
    for (var i = styleAttr.length - 1; i >= 0; i--) {
      ok(expectedStyleAttr.indexOf(styleAttr[i]) >= 0, "Test the expected style attribute includes `%@` found in the actual style attribute.".fmt(styleAttr[i]));
    }

    SC.run(function () {
      view.set('useTopLayout', NO);
    });

    same(view.get('layout'), { bottom: 10, right: 10, width: 200, height: 50 }, "Test the value of the computed layout.");
    layoutStyle = view.get('layoutStyle');
    expectedLayoutStyle = { bottom: "10px", right: "10px", width: "200px", height: "50px" };
    for (var key in layoutStyle) {
      equals(layoutStyle[key], expectedLayoutStyle[key], "Test the value of %@ in the layout style.".fmt(key));
    }

    styleAttr = view.$().attr('style');
    styleAttr = styleAttr.split(/;\s*/).filter(function (o) { return o; });
    expectedStyleAttr = ['bottom: 10px', 'width: 200px', 'right: 10px', 'height: 50px'];
    for (i = styleAttr.length - 1; i >= 0; i--) {
      ok(expectedStyleAttr.indexOf(styleAttr[i]) >= 0, "Test the expected style attribute includes `%@` found in the actual style attribute.".fmt(styleAttr[i]));
    }
  });


  module("OTHER LAYOUT STYLE TESTS", {
    setup: function () {

      SC.run(function () {
        // create basic view
        view = SC.View.create({});

        pane = SC.Pane.create({
          layout: { centerX: 0, centerY: 0, width: 400, height: 400 },
          childViews: [view]
        }).append();
      });
    },

    teardown: function () {
      pane.destroy();
      pane = view = null;
    }
  });



  /*
    There was a regression where switching from a centered layout to a non-centered
    layout failed to remove the margin style.
  */
  test("Switching from centered to non-centered layouts.", function () {
    var styleAttr;

    SC.run(function () {
      view.set('layout', { centerX: 10, centerY: 10, width: 60, height: 60 });
    });

    SC.run(function () {
      view.set('layout', { left: 10, top: 10, width: 60, height: 60 });
    });

    styleAttr = view.$().attr('style');
    styleAttr = styleAttr.split(/;\s*/).filter(function (o) { return o; });
    var expectedStyleAttr = ['left: 10px', 'top: 10px', 'width: 60px', 'height: 60px'];
    for (var i = styleAttr.length - 1; i >= 0; i--) {
      ok(expectedStyleAttr.indexOf(styleAttr[i]) >= 0, "Test the expected style attribute includes `%@` found in the actual style attribute.".fmt(styleAttr[i]));
    }
  });
})();
