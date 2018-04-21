/* globals $ */

$('.nav-pills').scrollingTabs({
  bootstrapVersion: 4,
  enableSwiping: true,
  leftArrowContent: [
    '<div class="scrtabs-tab-scroll-arrow scrtabs-tab-scroll-arrow-right pt-2">',
    '<i class="fas fa-chevron-left"></i>',
    '</div>'
  ].join(''),
  rightArrowContent: [
    '<div class="scrtabs-tab-scroll-arrow scrtabs-tab-scroll-arrow-right pt-2 pl-2">',
    '<i class="fas fa-chevron-right"></i>',
    '</div>'
  ].join('')
});