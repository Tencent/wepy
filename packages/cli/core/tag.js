// https://developer.mozilla.org/en-US/docs/Web/HTML/Element
const HTML_TAGS = [
// Main root
'html',
// Document metadata
'link,meta,style,title',
// Sectioning root
'body',
// Content sectioning
'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section',
// Text content
'blockquote,dd,dir,div,dl,dt,figcaption,figure,hr,li,main,ol,p,pre,ul',
// Inline text semantics
'a,abbr,b,bdi,bdo,br,cite,code,data,dfn,em,i,kdb,mark,nobr,q,rp,rt,rtc,ruby,s,samp,small,span,strong,sub,sup,time,tt,u,var,wbr',
// Image and multimedia
'area,audio,img,map,track,video',
// Embedded content
'applet,embed,iframe,noembed,object,param,picture,source',
// Scripting
'canvas,noscript,script',
// Demarcating edits
'del,ins',
// Table content
'caption,col,colgroup,table,tbody,td,tfoot,th,thead,tr',
// Forms
'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea',
// Interactive elements
'details,dialog,menu,menuitem,summary',
// Web Components
'content,element,shadow,slot,template',
// Obsolete and deprecated elements
'acronym,applet,basefont,bgsound,big,blink,center,command,content,dir,element,font,frame,frameset,image,isindex,keygen,listing,marquee,menuitem,multicol,nextid,nobr,noembed,noframes,plaintext,shadow,spacer,strike,tt,xmp'
].join(',').split(',');

// https://developers.weixin.qq.com/miniprogram/dev/component/
const WXML_TAGS = [
// view
'block,view,scroll-view,swiper,movable-view,cover-view',
// base
'icon,text,rich-text,progress',
// form
'button,checkbox,form,input,label,picker,picker-view,radio,slider,switch,textarea',
// navigator
'navigator',
// audio
'image,video,camera,live-player,live-pusher',
// map
'map',
// canvas
'canvas',
// slot
'slot',
// ability
'open-data,web-view,ad'
].join(',').split(',');

const HTML2WXML_MAP = {
  'select': 'picker',
  'datalist': 'picker',
  'img': 'image',
  'source': 'audio',
  'video': 'video',
  'track': 'video',
  'a': 'navigator',
  'span': 'label',
  'contact-button': 'contact-button'
};

/**
 * combine two tags array/object
 * @param  {Array} original original tag list
 * @param  {Undefined/String/Array/Object} addtional addtional list
 * @return {Array}          new tag list Array
 */
const combineTag = function (original, additional) {
  if (typeof additional === 'undefined') {
    return [].concat(original);
  } else if (typeof additional === 'string') {
    original.concat([additional]);
  } else if (Array.isArray(additional)) {
    return original.concat(additional);
  } else if (typeof additional !== 'object') {
    return [].concat(original);
  }
  let addTags = [];
  let removeTags = [];
  for (let k in additional) {
    if (addTags[k]) {
      addTags.push(k);
    } else {
      removeTags.push(k);
    }
  }

  let rst = original.concat(addTags);
  removeTags.forEach(k => {
    let index = rst.indexOf(k);
    while (index !== -1) {
      rst.splice(index, 1);
      index = rst.indexOf(k);
    }
  });
};

const combineTagMap = function (original, additional = {}) {
  let rst = {};
  [original, additional].forEach(obj => {
    for (let k in obj) {
      rst[k] = obj[k];
    }
  })
  return rst;
};


exports = module.exports =  {
  HTML_TAGS,
  WXML_TAGS,
  HTML2WXML_MAP,
  combineTag,
  combineTagMap
};
