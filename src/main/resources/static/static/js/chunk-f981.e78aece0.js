(window.webpackJsonp=window.webpackJsonp||[]).push([["chunk-f981"],{"+iuc":function(t,n,e){e("wgeU"),e("FlQf"),e("bBy9"),e("B9jh"),e("dL40"),e("xvv9"),e("V+O7"),t.exports=e("WEpk").Set},"/f1G":function(t,n,e){t.exports={default:e("nhzr"),__esModule:!0}},"0tVQ":function(t,n,e){e("FlQf"),e("VJsP"),t.exports=e("WEpk").Array.from},"2WLf":function(t,n,e){var o=e("fNR9");"string"==typeof o&&(o=[[t.i,o,""]]),o.locals&&(t.exports=o.locals);(0,e("SZ7m").default)("08e71456",o,!0,{})},"7Qib":function(t,n,e){"use strict";e.d(n,"h",function(){return b}),e.d(n,"e",function(){return m}),e.d(n,"g",function(){return y}),e.d(n,"d",function(){return x}),e.d(n,"a",function(){return _}),e.d(n,"b",function(){return w}),e.d(n,"i",function(){return k}),e.d(n,"c",function(){return S}),e.d(n,"f",function(){return j});var o=e("sk9p"),i=e.n(o),r=e("jWXv"),a=e.n(r),s=e("rfXi"),l=e.n(s),c=(e("gDS+"),e("P2sY"),e("GQeE")),u=e.n(c),d=e("YDBu"),f=e.n(d),p=e("/f1G"),h=e.n(p),v=e("EJiy"),g=e.n(v);function b(t,n){if(0===arguments.length)return null;var e=n||"{y}-{m}-{d} {h}:{i}:{s}",o=void 0;"object"===(void 0===t?"undefined":g()(t))?o=t:("string"==typeof t&&/^[0-9]+$/.test(t)&&(t=parseInt(t)),"number"==typeof t&&10===t.toString().length&&(t*=1e3),o=new Date(t));var i={y:o.getFullYear(),m:o.getMonth()+1,d:o.getDate(),h:o.getHours(),i:o.getMinutes(),s:o.getSeconds(),a:o.getDay()};return e.replace(/{(y|m|d|h|i|s|a)+}/g,function(t,n){var e=i[n];return"a"===n?[][e]:(t.length>0&&e<10&&(e="0"+e),e||0)})}function m(t){(!(arguments.length>1&&void 0!==arguments[1])||arguments[1])&&(t/=1e3);var n=Math.floor(t/3600),e=Math.floor(t/60%60),o=Math.floor(t%60),i=function(t){return t<1?"00":t<10?"0"+t:t.toString()};return(n=i(n))+":"+(e=i(e))+":"+(o=i(o))}function y(t,n,e){var o=this,i=(arguments.length>3&&void 0!==arguments[3]&&arguments[3],window.location.origin.replace(/http|https/g,"ws")),r=new WebSocket(i+t);return r.onopen=n,r.onmessage=e,r.onerror=function(){try{o.initWebSocket(t,n,e,null)}catch(t){console.log("websoket error:",t)}},r.onclose=function(){},r}function x(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:6;"number"!=typeof t&&(t=parseFloat(t)||0);var e=f()(t);return isNaN(e)?0:e===t?t:t.toFixed(n)}function _(t){if(!t&&"object"!==(void 0===t?"undefined":g()(t)))throw new Error("error arguments","deepClone");var n=t.constructor===Array?[]:{};return u()(t).forEach(function(e){t[e]&&"object"===g()(t[e])?n[e]=_(t[e]):n[e]=t[e]}),n}function w(t){var n=[];return t.forEach(function(t){n.push(t)}),n}function k(t){return l()(new a.a(t))}function S(t){var n=t.header,o=t.data,i=t.filename,r=void 0===i?"text-export":i,a=t.autoWidth,s=void 0===a||a,l=t.bookType,c=void 0===l?"xlsx":l,u=[],d=[];n.forEach(function(t){u.push(t.prop)}),o.forEach(function(t,n){d.push(h()(t))}),Promise.all([e.e("chunk-c314"),e.e("chunk-e1df"),e.e("chunk-ee39")]).then(e.bind(null,"whM/")).then(function(t){t.export_json_to_excel({header:u,data:d,filename:r,autoWidth:s,bookType:c})})}function j(t){if(Array.isArray(t)){var n={};return t.forEach(function(t){var e=i()(t,2),o=e[0],r=e[1];n[o]=r}),n}}},"8iia":function(t,n,e){var o=e("QMMT"),i=e("RRc/");t.exports=function(t){return function(){if(o(this)!=t)throw TypeError(t+"#toJSON isn't generic");return i(this)}}},B9jh:function(t,n,e){"use strict";var o=e("Wu5q"),i=e("n3ko");t.exports=e("raTm")("Set",function(t){return function(){return t(this,arguments.length>0?arguments[0]:void 0)}},{add:function(t){return o.def(i(this,"Set"),t=0===t?0:t,t)}},o)},C2SN:function(t,n,e){var o=e("93I4"),i=e("kAMH"),r=e("UWiX")("species");t.exports=function(t){var n;return i(t)&&("function"!=typeof(n=t.constructor)||n!==Array&&!i(n.prototype)||(n=void 0),o(n)&&null===(n=n[r])&&(n=void 0)),void 0===n?Array:n}},E8gZ:function(t,n,e){var o=e("jmDH"),i=e("w6GO"),r=e("NsO/"),a=e("NV0k").f;t.exports=function(t){return function(n){for(var e,s=r(n),l=i(s),c=l.length,u=0,d=[];c>u;)e=l[u++],o&&!a.call(s,e)||d.push(t?[e,s[e]]:s[e]);return d}}},FyfS:function(t,n,e){t.exports={default:e("Rp86"),__esModule:!0}},IP1Z:function(t,n,e){"use strict";var o=e("2faE"),i=e("rr1i");t.exports=function(t,n,e){n in t?o.f(t,n,i(0,e)):t[n]=e}},"JY/k":function(t,n,e){(t.exports=e("I1BE")(!1)).push([t.i,".history-container {\n  height: 100%;\n}\n.history-container .history-title {\n    height: 24px;\n    padding: 0px 12px;\n    margin-bottom: 12px;\n    background-color: #EBEDF0;\n    font-size: 12px;\n    color: #3145A6;\n}\n.history-container .tool-bar {\n    margin-bottom: 12px;\n}\n.history-container .tool-bar .tool-item {\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n      -webkit-box-align: center;\n          -ms-flex-align: center;\n              align-items: center;\n      margin-right: 24px;\n}\n.history-container .tool-bar .tool-item .title {\n        white-space: nowrap;\n        margin-right: 10px;\n        color: #7f7d8e;\n        font-weight: bold;\n}\n.history-container .tool-bar .tool-item .el-select__tags {\n        display: -webkit-box;\n        display: -ms-flexbox;\n        display: flex;\n        -webkit-box-orient: horizontal;\n        -webkit-box-direction: normal;\n            -ms-flex-direction: row;\n                flex-direction: row;\n        -ms-flex-wrap: nowrap;\n            flex-wrap: nowrap;\n        overflow: hidden;\n}\n.history-container .table-wrapper {\n    border-radius: 4px;\n    height: calc(100% - 72px);\n}\n.history-container .table-wrapper .notes-showing {\n      display: block;\n      max-width: 60%;\n      text-overflow: ellipsis;\n      overflow: hidden;\n      white-space: nowrap;\n      padding-right: 5px;\n}\n.history-container .table-wrapper .notes-editor {\n      width: 120px;\n}\n.history-container .table-wrapper .between-line {\n      background-color: #FAFBFC;\n}\n.history-container .t-header {\n    height: 67px;\n    color: #4159D1;\n    font-size: 16px;\n    font-weight: bold;\n    text-align: left;\n}\n.history-container .t-row {\n    height: 48px;\n    font-size: 14px;\n    color: #7f7d8e;\n}\n.history-container .el-table th {\n    padding: 0;\n}\n.history-container .el-table td {\n    border-bottom: 0px;\n}\n.history-container .el-table .cell {\n    padding-left: 24px;\n}\n.history-container .el-input input {\n    width: 120px;\n    height: 24px;\n    border-radius: 2px;\n    border: 2px solid #EBEDF0;\n}\n.history-container .el-input input .el-input__icon {\n      line-height: 24px;\n}\n.history-container .el-select__tags {\n    border-radius: 2px;\n    height: 16px;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: row;\n            flex-direction: row;\n    -ms-flex-wrap: nowrap;\n        flex-wrap: nowrap;\n}\n.history-container .el-select__tags .el-tag {\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n      -webkit-box-orient: horizontal;\n      -webkit-box-direction: normal;\n          -ms-flex-direction: row;\n              flex-direction: row;\n      -webkit-box-align: center;\n          -ms-flex-align: center;\n              align-items: center;\n      border-radius: 2px;\n      height: 16px;\n      margin-right: 2px;\n}\n.history-container .el-select__tags .el-tag .el-select__tags-text {\n        line-height: 16px;\n}\n.history-container .el-select__tags .el-tag .el-tag__close {\n        line-height: 16px;\n        margin-top: 0px;\n}\n.history-container .el-select__caret {\n    line-height: 24px;\n}\n.history-container .el-table .history-stripe {\n    background: #ededfa;\n}\n.history-container .el-button {\n    padding: 4px 16px;\n}\n.history-container .progress-wrapper .progress-bg {\n    width: 50%;\n    height: 5px;\n    border-radius: 5px;\n    background: #e8e8ef;\n    overflow: hidden;\n}\n.history-container .progress-wrapper .progress-bg .progress-block {\n      height: 100%;\n      background: #494ece;\n}\n.history-container .progress-wrapper .progress-text {\n    margin-left: 7px;\n    color: #494ece;\n    font-size: 16px;\n}\n",""])},"LER+":function(t,n,e){var o=e("SuYs");"string"==typeof o&&(o=[[t.i,o,""]]),o.locals&&(t.exports=o.locals);(0,e("SZ7m").default)("a0dc882c",o,!0,{})},LtUd:function(t,n,e){"use strict";var o=e("p9D2");e.n(o).a},Mz3J:function(t,n,e){"use strict";Math.easeInOutQuad=function(t,n,e,o){return(t/=o/2)<1?e/2*t*t+n:-e/2*(--t*(t-2)-1)+n};var o=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||function(t){window.setTimeout(t,1e3/60)};function i(t,n,e){var i=document.documentElement.scrollTop||document.body.parentNode.scrollTop||document.body.scrollTop,r=t-i,a=0;n=void 0===n?500:n;!function t(){a+=20,function(t){document.documentElement.scrollTop=t,document.body.parentNode.scrollTop=t,document.body.scrollTop=t}(Math.easeInOutQuad(a,i,r,n)),a<n?o(t):e&&"function"==typeof e&&e()}()}var r={name:"Pagination",props:{total:{required:!0,type:Number},page:{type:Number,default:1},limit:{type:Number,default:20},pageSizes:{type:Array,default:function(){return[10,20,30,50]}},layout:{type:String,default:"total, sizes, prev, pager, next, jumper"},background:{type:Boolean,default:!0},autoScroll:{type:Boolean,default:!0},hidden:{type:Boolean,default:!1},position:{type:String,default:"end"}},computed:{currentPage:{get:function(){return this.page},set:function(t){this.$emit("update:page",t)}},pageSize:{get:function(){return this.limit},set:function(t){this.$emit("update:limit",t)}}},methods:{handleSizeChange:function(t){this.$emit("pagination",{page:this.currentPage,limit:t}),this.autoScroll&&i(0,800)},handleCurrentChange:function(t){this.$emit("pagination",{page:t,limit:this.pageSize}),this.autoScroll&&i(0,800)}}},a=(e("yiMW"),e("KHd+")),s=Object(a.a)(r,function(){var t=this,n=t.$createElement,e=t._self._c||n;return t.total>0?e("div",{staticClass:"pagination-container flex",class:{hidden:t.hidden,"flex-end":"end"===t.position,"justify-center":"center"===t.position}},[e("el-pagination",t._b({attrs:{background:t.background,"current-page":t.currentPage,"page-size":t.pageSize,layout:t.layout,"page-sizes":t.pageSizes,total:t.total},on:{"update:currentPage":function(n){t.currentPage=n},"update:pageSize":function(n){t.pageSize=n},"size-change":t.handleSizeChange,"current-change":t.handleCurrentChange}},"el-pagination",t.$attrs,!1))],1):t._e()},[],!1,null,"d9993710",null);s.options.__file="index.vue";n.a=s.exports},Ntdr:function(t,n,e){"use strict";var o={name:"BreadcrumbExt",props:{breads:{type:Array,default:function(){return[]}},needHome:{type:Boolean,default:!0},needBreak:{type:Boolean,default:!0}},data:function(){return{usableBread:[],defaultBreak:{type:"break",val:"el-icon-arrow-right"},defaultHome:{type:"icon",val:"el-icon-s-home",click:this.$_defaultHomeLinkEvent}}},watch:{breads:{handler:function(){this.$_init()},deep:!0},needHome:function(){this.$_init()},needBreak:function(){this.$_init()}},beforeMount:function(){this.$_init()},methods:{$_init:function(){var t=[];this.needHome&&t.push(this.defaultHome),this.needBreak&&t.push(this.defaultBreak);for(var n=0;n<this.breads.length;n++)t.push(this.breads[n]),this.breads[n+1]&&this.needBreak&&t.push(this.defaultBreak);this.usableBread=t},$_defaultHomeLinkEvent:function(){this.$router.push({path:"/"})},formatClick:function(t){"function"==typeof t&&t()}}},i=(e("LtUd"),e("KHd+")),r=Object(i.a)(o,function(){var t=this,n=t.$createElement,e=t._self._c||n;return e("div",{staticClass:"flex flex-row flex-center bread-crumb-container"},t._l(t.usableBread,function(n,o){return e("span",{key:o,class:{"bread-link":"break"!==n.type,"bread-break":"break"===n.type}},["icon"===n.type?e("i",{class:n.val,on:{click:function(e){t.formatClick(n.click)}}}):"break"===n.type?e("i",{class:n.val}):e("span",{on:{click:function(e){t.formatClick(n.click)}}},[t._v(t._s(n.val))])])}))},[],!1,null,"582c73c7",null);r.options.__file="index.vue";n.a=r.exports},Qqxt:function(t,n,e){var o=e("vkZ8");"string"==typeof o&&(o=[[t.i,o,""]]),o.locals&&(t.exports=o.locals);(0,e("SZ7m").default)("124bdec6",o,!0,{})},"RRc/":function(t,n,e){var o=e("oioR");t.exports=function(t,n){var e=[];return o(t,!1,e.push,e,n),e}},Rp86:function(t,n,e){e("bBy9"),e("FlQf"),t.exports=e("fXsU")},SuYs:function(t,n,e){(t.exports=e("I1BE")(!1)).push([t.i,"\n.pagination-container[data-v-d9993710] {\r\n\tbackground: #fff;\r\n\tpadding: 32px 16px;\n}\n.pagination-container.hidden[data-v-d9993710] {\r\n\tdisplay: none;\n}\r\n",""])},"V+O7":function(t,n,e){e("aPfg")("Set")},V1uf:function(t,n,e){"use strict";var o=e("bssT");e.n(o).a},V7Et:function(t,n,e){var o=e("2GTP"),i=e("M1xp"),r=e("JB68"),a=e("tEej"),s=e("v6xn");t.exports=function(t,n){var e=1==t,l=2==t,c=3==t,u=4==t,d=6==t,f=5==t||d,p=n||s;return function(n,s,h){for(var v,g,b=r(n),m=i(b),y=o(s,h,3),x=a(m.length),_=0,w=e?p(n,x):l?p(n,0):void 0;x>_;_++)if((f||_ in m)&&(g=y(v=m[_],_,b),t))if(e)w[_]=g;else if(g)switch(t){case 3:return!0;case 5:return v;case 6:return _;case 2:w.push(v)}else if(u)return!1;return d?-1:c||u?u:w}}},VJsP:function(t,n,e){"use strict";var o=e("2GTP"),i=e("Y7ZC"),r=e("JB68"),a=e("sNwI"),s=e("NwJ3"),l=e("tEej"),c=e("IP1Z"),u=e("fNZA");i(i.S+i.F*!e("TuGD")(function(t){Array.from(t)}),"Array",{from:function(t){var n,e,i,d,f=r(t),p="function"==typeof this?this:Array,h=arguments.length,v=h>1?arguments[1]:void 0,g=void 0!==v,b=0,m=u(f);if(g&&(v=o(v,h>2?arguments[2]:void 0,2)),void 0==m||p==Array&&s(m))for(e=new p(n=l(f.length));n>b;b++)c(e,b,g?v(f[b],b):f[b]);else for(d=m.call(f),e=new p;!(i=d.next()).done;b++)c(e,b,g?a(d,v,[i.value,b],!0):i.value);return e.length=b,e}})},VKFn:function(t,n,e){e("bBy9"),e("FlQf"),t.exports=e("ldVq")},Wu5q:function(t,n,e){"use strict";var o=e("2faE").f,i=e("oVml"),r=e("XJU/"),a=e("2GTP"),s=e("EXMj"),l=e("oioR"),c=e("MPFp"),u=e("UO39"),d=e("TJWN"),f=e("jmDH"),p=e("6/1s").fastKey,h=e("n3ko"),v=f?"_s":"size",g=function(t,n){var e,o=p(n);if("F"!==o)return t._i[o];for(e=t._f;e;e=e.n)if(e.k==n)return e};t.exports={getConstructor:function(t,n,e,c){var u=t(function(t,o){s(t,u,n,"_i"),t._t=n,t._i=i(null),t._f=void 0,t._l=void 0,t[v]=0,void 0!=o&&l(o,e,t[c],t)});return r(u.prototype,{clear:function(){for(var t=h(this,n),e=t._i,o=t._f;o;o=o.n)o.r=!0,o.p&&(o.p=o.p.n=void 0),delete e[o.i];t._f=t._l=void 0,t[v]=0},delete:function(t){var e=h(this,n),o=g(e,t);if(o){var i=o.n,r=o.p;delete e._i[o.i],o.r=!0,r&&(r.n=i),i&&(i.p=r),e._f==o&&(e._f=i),e._l==o&&(e._l=r),e[v]--}return!!o},forEach:function(t){h(this,n);for(var e,o=a(t,arguments.length>1?arguments[1]:void 0,3);e=e?e.n:this._f;)for(o(e.v,e.k,this);e&&e.r;)e=e.p},has:function(t){return!!g(h(this,n),t)}}),f&&o(u.prototype,"size",{get:function(){return h(this,n)[v]}}),u},def:function(t,n,e){var o,i,r=g(t,n);return r?r.v=e:(t._l=r={i:i=p(n,!0),k:n,v:e,p:o=t._l,n:void 0,r:!1},t._f||(t._f=r),o&&(o.n=r),t[v]++,"F"!==i&&(t._i[i]=r)),t},getEntry:g,setStrong:function(t,n,e){c(t,n,function(t,e){this._t=h(t,n),this._k=e,this._l=void 0},function(){for(var t=this._k,n=this._l;n&&n.r;)n=n.p;return this._t&&(this._l=n=n?n.n:this._t._f)?u(0,"keys"==t?n.k:"values"==t?n.v:[n.k,n.v]):(this._t=void 0,u(1))},e?"entries":"values",!e,!0),d(n)}}},ZU66:function(t,n,e){"use strict";var o=e("4d7F"),i=e.n(o),r={data:function(){return{shown:!1,title:"",content:""}},watch:{$route:function(){this._reject&&this.onCancel()}},methods:{confirm:function(t,n){var e=this;return this._reject&&this._reject(new Error("重复调用")),new i.a(function(o,i){e.title=t,e.content=n,e.shown=!0,e._resolve=o,e._reject=i})},onClose:function(t){this.onCancel(),t()},onCancel:function(){this._reject(!1),this.clean()},onConfirm:function(){this._resolve(),this.clean()},clean:function(){this.title="",this.content="",this.shown=!1,this._resolve=null,this._reject=null}}},a=(e("kgVD"),e("KHd+")),s=Object(a.a)(r,function(){var t=this,n=t.$createElement,e=t._self._c||n;return e("el-dialog",{attrs:{visible:t.shown,"before-close":t.onClose,width:"510px"},on:{"update:visible":function(n){t.shown=n}}},[e("div",{staticClass:"dialog-main-content"},[t._v(t._s(t.title))]),t._v(" "),e("div",{staticClass:"dialog-sub-content"},[t._v(t._s(t.content))]),t._v(" "),e("div",{staticClass:"flex justify-center",staticStyle:{"margin-top":"72px"}},[e("button",{staticClass:"dialog-button",on:{click:t.onConfirm}},[t._v("Sure")]),t._v(" "),e("button",{staticClass:"dialog-button",staticStyle:{"margin-left":"23px"},on:{click:t.onCancel}},[t._v("cancel")])])])},[],!1,null,"90ca9f78",null);s.options.__file="Confirm.vue";n.a=s.exports},aPfg:function(t,n,e){"use strict";var o=e("Y7ZC"),i=e("eaoh"),r=e("2GTP"),a=e("oioR");t.exports=function(t){o(o.S,t,{from:function(t){var n,e,o,s,l=arguments[1];return i(this),(n=void 0!==l)&&i(l),void 0==t?new this:(e=[],n?(o=0,s=r(l,arguments[2],2),a(t,!1,function(t){e.push(s(t,o++))})):a(t,!1,e.push,e),new this(e))}})}},bssT:function(t,n,e){var o=e("JY/k");"string"==typeof o&&(o=[[t.i,o,""]]),o.locals&&(t.exports=o.locals);(0,e("SZ7m").default)("716dd3c2",o,!0,{})},cHUd:function(t,n,e){"use strict";var o=e("Y7ZC");t.exports=function(t){o(o.S,t,{of:function(){for(var t=arguments.length,n=new Array(t);t--;)n[t]=arguments[t];return new this(n)}})}},dL40:function(t,n,e){var o=e("Y7ZC");o(o.P+o.R,"Set",{toJSON:e("8iia")("Set")})},dv4G:function(t,n,e){"use strict";e.d(n,"h",function(){return i}),e.d(n,"b",function(){return r}),e.d(n,"f",function(){return a}),e.d(n,"j",function(){return s}),e.d(n,"e",function(){return l}),e.d(n,"d",function(){return c}),e.d(n,"i",function(){return u}),e.d(n,"a",function(){return d}),e.d(n,"c",function(){return f}),e.d(n,"g",function(){return p});var o=e("t3Un");function i(t){return Object(o.a)({url:"/job/query/page/new",method:"post",data:t})}function r(t){return Object(o.a)({url:"/job/query/status",method:"get",params:t})}function a(t){return Object(o.a)({url:"/job/v1/pipeline/job/stop",method:"post",data:t})}function s(t){return Object(o.a)({url:"/job/v1/rerun",method:"post",data:t})}function l(t){var n=t.job_id,e=t.role,i=t.party_id;return Object(o.a)({url:"/job/query/"+n+"/"+e+"/"+i,method:"get"})}function c(t){return Object(o.a)({url:"/v1/tracking/component/parameters",method:"post",data:t})}function u(t){var n=t.componentId,e=t.job_id,i=t.role,r=t.party_id,a=t.begin,s=t.end,l=t.type;return Object(o.a)({url:"/queryLogWithSize/"+e+"/"+i+"/"+r+"/"+n+"/"+l+"/"+a+"/"+s,method:"get"})}function d(t){return Object(o.a)({url:"/job/update",method:"put",data:t})}function f(t){return Object(o.a)({url:"/job/componentCommand",method:"post",data:t})}function p(){return Object(o.a)({url:"/job/query/fields",method:"post"})}},fNR9:function(t,n,e){(t.exports=e("I1BE")(!1)).push([t.i,"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",""])},fW1p:function(t,n,e){var o=e("Y7ZC"),i=e("E8gZ")(!1);o(o.S,"Object",{values:function(t){return i(t)}})},fXsU:function(t,n,e){var o=e("5K7Z"),i=e("fNZA");t.exports=e("WEpk").getIterator=function(t){var n=i(t);if("function"!=typeof n)throw TypeError(t+" is not iterable!");return o(n.call(t))}},"gDS+":function(t,n,e){t.exports={default:e("oh+g"),__esModule:!0}},jWXv:function(t,n,e){t.exports={default:e("+iuc"),__esModule:!0}},"k/8l":function(t,n,e){t.exports={default:e("VKFn"),__esModule:!0}},"k/PY":function(t,n,e){"use strict";e.r(n);var o=e("FyfS"),i=e.n(o),r=e("P2sY"),a=e.n(r),s=e("QbLZ"),l=e.n(s),c=e("YDBu"),u=e.n(c),d=e("Mz3J"),f=e("7Qib"),p=e("L2JU"),h=e("dv4G"),v=e("tH+O"),g=e("Ntdr"),b=e("ZU66"),m={name:"Job",components:{Pagination:d.a,IconHoverAndActive:v.default,BreadcrumbExt:g.a,Confirm:b.a},filters:{},data:function(){return{list:null,condition:{role:"",status:"",job_id:"",party_id:"",note:"",orderRule:"desc",orderField:"f_job_id"},currentRow:1,saveCondition:{},tHead:[{key:"jobId",label:"ID",width:250},{key:"role",label:"Role",width:100},{key:"partyId",label:"Party ID",width:100},{key:"start_time",label:"Start Time",width:200,sortable:"custom"},{key:"end_time",label:"End Time",width:200,sortable:"custom"},{key:"duration",label:"Duration",width:130,sortable:"custom"},{key:"status",label:"Status",width:100},{key:"notes",label:"Notes",minWidth:200},{key:"progress",hidden:!0},{key:"action",label:"action",width:100}],startTimeSort:"desc",endTimeSort:"",listLoading:!1,pageSize:20,total:0,page:this.$route.params.page&&u()(this.$route.params.page)||1,dialogVisible:!1,formLoading:!1,form:{experiment:"",type:"",desc:""},formRules:{experiment:[{required:!0,message:"Please enter your name",trigger:"blur"}],type:[{required:!0,message:"Please enter your name",trigger:"blur"}],desc:[{required:!0,message:"Please enter a description",trigger:"blur"}]},roleOptions:[],statusOptions:[],editorText:"",editorScope:"",willopenScope:""}},computed:l()({},Object(p.c)(["lastJob","icons"]),{sortKeys:function(){return{start_time:"f_start_time",end_time:"f_end_time",duration:"f_elapsed"}}}),beforeMount:function(){var t=this.$route.params,n=t.search_job_id,e=t.search_party_id,o=t.search_role,i=t.search_status,r=t.search_note;n&&(this.condition.job_id=n),e&&(this.condition.party_id=e),o&&o.length>0&&(this.condition.role=o.split(",")),i&&i.length>0&&(this.condition.status=i.split(",")),r&&(this.condition.note=r),this.saveCondition=Object(f.a)(this.condition)},mounted:function(){this.queryList(),this.queryFileds()},methods:{handlePageChange:function(t){var n=t.page;this.page=n,this.queryList()},changeSort:function(t){"start_time"===t?("desc"!==this.startTimeSort?this.startTimeSort="desc":this.startTimeSort="asc",this.endTimeSort=""):"end_time"===t&&("desc"!==this.endTimeSort?this.endTimeSort="desc":this.endTimeSort="asc",this.startTimeSort=""),this.queryList()},queryList:function(){var t=this,n=a()(this.condition,{jobId:this.condition.job_id,partyId:this.condition.party_id,fDescription:this.condition.note}),e=a()({pageNum:this.page,pageSize:this.pageSize},n,{});this.listLoading=!0,Object(h.h)(e).then(function(n){t.saveCondition=Object(f.a)(t.condition),t.listLoading=!1;var e=[];t.total=n.data.totalRecord,n.data.list.forEach(function(t){var n="",o="",i="",r="",a="",s="",l="",c="",u="",d=t.job;d&&(n=d.fJobId||"",o=d.fRole||"",i=d.fPartyId||"",r=d.fStartTime?Object(f.h)(new Date(d.fStartTime)):"",a=d.fEndTime?Object(f.h)(d.fEndTime):"",s=d.fElapsed?Object(f.e)(d.fElapsed):"",l=d.fStatus||"",c="running"===d.fStatus?d.fProgress||0:null,u=d.fDescription||""),e.push({jobId:n,role:o,partyId:i,start_time:r,end_time:a,duration:s,status:l,progress:c,notes:u,notesEdit:!1})}),t.list=e}).catch(function(n){t.listLoading=!1})},search:function(){this.page=1,this.queryList()},toDetailes:function(t,n,e){this.$store.dispatch("changeLastJob",{job_id:t,role:n,party_id:e});var o={job_id:t,role:n,party_id:e,from:"Job overview",page:this.page},i=this.saveCondition,r=i.job_id,a=i.party_id,s=i.role,l=i.status;r&&(o.search_job_id=r),a&&(o.search_party_id=a),s&&s.length>0&&(o.search_role=s.toString()),l&&l.length>0&&(o.search_status=l.toString());var c=this.$router.resolve({path:"/details",query:o});window.open(c.href,"_blank")},toHome:function(){this.$router.push({path:"/"})},tableRowClassName:function(t){var n=t.row,e="t-row";return t.rowIndex%2==0&&(e+=" between-line"),this.lastJob&&n.jobId===this.lastJob.job_id&&n.role===this.lastJob.role&&n.partyId===this.lastJob.party_id&&(e+=" history-stripe"),e},setCurrentRow:function(t){t&&this.$store.dispatch("changeLastJob",{job_id:t.jobId,role:t.role,party_id:t.partyId})},editorNoteForJob:function(t){var n=this,e=!0,o=!1,r=void 0;try{for(var a,s=i()(this.list);!(e=(a=s.next()).done);e=!0){a.value.notesEdit=!1}}catch(t){o=!0,r=t}finally{try{!e&&s.return&&s.return()}finally{if(o)throw r}}this.editorScope?this.willopenScope=t:(this.editorScope=t,this.editorText=this.list[t.$index].notes,this.list[t.$index].notesEdit=!0,this.$nextTick(function(){n.$refs[t.column.id+"_"+t.$index][0].focus()}))},uploadEditor:function(t){var n=this,e=this.editorScope;if(this.editorScope&&this.editorText!==n.list[e.$index].notes){var o={job_id:e.row.jobId,role:e.row.role,party_id:e.row.partyId,notes:this.editorText};Object(h.a)(o).then(function(t){n.list[e.$index].notes=n.editorText,n.list[e.$index].notesEdit=!1,n.editorText="",n.editorScope=null,n.willopenScope&&(n.editorNoteForJob(n.willopenScope),n.willopenScope="")})}else if(n.willopenScope)n.editorText="",n.editorScope=null,n.editorNoteForJob(n.willopenScope),n.willopenScope="";else{if(!e)return;n.list[e.$index].notesEdit=!1,n.editorText="",n.editorScope=null}},closeEditor:function(t){this.list[t.$index].notesEdit=!1,this.editorText="",this.editorScope=null},willshowingToolTip:function(t){t.$index;var n=t.row,e=t.column,o=e.realWidth-20;return 16*n[e.property].length<Math.floor(.6*o-5)},stopToTop:function(t){t.stopPropagation()},onRetry:function(t){var n,e=this,o=t.status;if("complete"!==o){var i="failed"===o||"canceled"===o,r="running"===o||"waiting"===o,a=i?h.j:r?h.f:function(){},s=i?["The job will continue from where it "+o,""]:r?["Are you sure you want to "+("running"===o?"kill":"cancel")+" this job?","You can't undo this action"]:["",""];(n=this.$refs.confirm).confirm.apply(n,s).then(function(){var n={job_id:t.jobId};i&&(n.component_name="pipeline"),a(n).then(function(){e.queryList()})})}},queryFileds:function(){var t=this;Object(h.g)().then(function(n){var e=n.data,o=e.role,i=e.status,r=function(t){return{value:t,label:t}};t.roleOptions=o.map(r),t.statusOptions=i.map(r)})},sortChange:function(t){var n=t.prop,e=t.order;e="descending"===e?"desc":"asc",this.condition.orderRule=e,this.condition.orderField=this.sortKeys[n]||"f_start_time",this.queryList()}}},y=(e("V1uf"),e("KHd+")),x=Object(y.a)(m,function(){var t=this,n=t.$createElement,e=t._self._c||n;return e("div",{staticClass:"app-container flex flex-col history-container bg-dark",on:{click:function(n){t.uploadEditor(n)}}},[e("breadcrumb-ext",{attrs:{breads:[{type:"content",val:"Job Overview"}]}}),t._v(" "),e("div",{staticClass:"tool-bar flex flex-center flex-end"},[e("div",{staticClass:"tool-item"},[e("span",{staticClass:"title"},[t._v("Job ID:")]),t._v(" "),e("el-input",{attrs:{size:"mini",clearable:""},on:{clear:t.search},nativeOn:{keyup:function(n){return"button"in n||!t._k(n.keyCode,"enter",13,n.key,"Enter")?t.search(n):null}},model:{value:t.condition.job_id,callback:function(n){t.$set(t.condition,"job_id",n)},expression:"condition.job_id"}})],1),t._v(" "),e("div",{staticClass:"tool-item"},[e("span",{staticClass:"title"},[t._v("Role:")]),t._v(" "),e("el-select",{attrs:{size:"mini","collapse-tags":"",multiple:"",placeholder:""},model:{value:t.condition.role,callback:function(n){t.$set(t.condition,"role",n)},expression:"condition.role"}},t._l(t.roleOptions,function(t){return e("el-option",{key:t.value,attrs:{value:t.value,label:t.label}})}))],1),t._v(" "),e("div",{staticClass:"tool-item"},[e("span",{staticClass:"title"},[t._v("Party ID:")]),t._v(" "),e("el-input",{attrs:{size:"mini",clearable:""},on:{clear:t.search},nativeOn:{keyup:function(n){return"button"in n||!t._k(n.keyCode,"enter",13,n.key,"Enter")?t.search(n):null}},model:{value:t.condition.party_id,callback:function(n){t.$set(t.condition,"party_id",n)},expression:"condition.party_id"}})],1),t._v(" "),e("div",{staticClass:"tool-item"},[e("span",{staticClass:"title"},[t._v("Status:")]),t._v(" "),e("el-select",{attrs:{size:"mini","collapse-tags":"",multiple:"",placeholder:""},model:{value:t.condition.status,callback:function(n){t.$set(t.condition,"status",n)},expression:"condition.status"}},t._l(t.statusOptions,function(t){return e("el-option",{key:t.value,attrs:{value:t.value,label:t.label}})}))],1),t._v(" "),e("div",{staticClass:"tool-item"},[e("span",{staticClass:"title"},[t._v("Note:")]),t._v(" "),e("el-input",{attrs:{size:"mini",clearable:""},on:{clear:t.search},nativeOn:{keyup:function(n){return"button"in n||!t._k(n.keyCode,"enter",13,n.key,"Enter")?t.search(n):null}},model:{value:t.condition.note,callback:function(n){t.$set(t.condition,"note",n)},expression:"condition.note"}})],1),t._v(" "),e("el-button",{attrs:{size:"mini",type:"primary",round:""},on:{click:t.search}},[t._v("Search")])],1),t._v(" "),e("div",{directives:[{name:"loading",rawName:"v-loading",value:t.listLoading,expression:"listLoading"}],staticClass:"flex flex-col space-between table-wrapper"},[e("el-table",{ref:"currentRowTable",attrs:{data:t.list,"row-class-name":t.tableRowClassName,"header-row-class-name":"t-header",fit:"","element-loading-text":"Loading","highlight-current-row":"","empty-text":"NO DATA",height:"100%"},on:{"current-change":t.setCurrentRow,"sort-change":t.sortChange}},[t._l(t.tHead,function(n){return[n.hidden?t._e():e("el-table-column",{key:n.key,attrs:{prop:n.key,label:n.label,width:n.width,"min-width":n.minWidth,sortable:n.sortable,"show-overflow-tooltip":"Notes"!==n.label,border:""},scopedSlots:t._u([{key:"default",fn:function(o){return["jobId"===n.key?e("span",{staticClass:"text-primary pointer",on:{click:function(e){t.toDetailes(o.row[n.key],o.row.role,o.row.partyId)}}},[t._v(t._s(o.row[n.key]))]):"status"===n.key?e("div",[o.row.progress||0===o.row.progress?e("div",[e("div",{staticClass:"progress-wrapper flex flex-center"},[e("div",{staticClass:"progress-bg"},[e("div",{staticClass:"progress-block",style:{width:o.row.progress+"%"}})]),t._v(" "),e("span",{staticClass:"progress-text"},[t._v(t._s(o.row.progress)+"%")])])]):e("div",[t._v(t._s(o.row[n.key]))])]):"notes"===n.key?e("div",[o.row.notesEdit?o.row.notesEdit?e("div",{staticClass:"flex flex-row flex-end flex-center",on:{click:function(n){n.stopPropagation(),t.stopToTop(n)}}},[e("el-input",{ref:o.column.id+"_"+o.$index,refInFor:!0,staticClass:"notes-editor",attrs:{placeholder:"请输入"},nativeOn:{keyup:function(n){if(!("button"in n)&&t._k(n.keyCode,"enter",13,n.key,"Enter"))return null;t.uploadEditor(n)}},model:{value:t.editorText,callback:function(n){t.editorText=n},expression:"editorText"}}),t._v(" "),e("i",{staticClass:"el-icon-check",on:{click:function(n){if(n.target!==n.currentTarget)return null;t.uploadEditor(n)}}}),t._v(" "),e("i",{staticClass:"el-icon-close",on:{click:function(n){if(n.target!==n.currentTarget)return null;t.closeEditor(o)}}})],1):t._e():e("div",{staticClass:"flex flex-row flex-end flex-center"},[e("el-tooltip",{attrs:{content:o.row[n.key],disabled:t.willshowingToolTip(o),effect:"dark",placement:"top-end"}},[e("span",{staticClass:"notes-showing"},[t._v(t._s(o.row[n.key]))])]),t._v(" "),e("icon-hover-and-active",{attrs:{"default-url":t.icons.normal.edit,"hover-url":t.icons.hover.edit,"active-url":t.icons.active.edit},on:{clickFn:function(n){t.editorNoteForJob(o)}}})],1)]):"action"===n.key?e("div",[e("el-button",{staticClass:"action-button",attrs:{type:"text"},on:{click:function(n){t.onRetry(o.row)}}},[t._v(t._s("failed"===o.row.status||"canceled"===o.row.status?"retry":"waiting"===o.row.status||"running"===o.row.status?"cancel":""))])],1):e("span",[t._v(t._s(o.row[n.key]))])]}}])})]})],2),t._v(" "),e("pagination",{attrs:{total:t.total,page:t.page,layout:"prev, pager, next",limit:t.pageSize,position:"center"},on:{"update:page":function(n){t.page=n},"update:limit":function(n){t.pageSize=n},pagination:t.handlePageChange}})],1),t._v(" "),e("confirm",{ref:"confirm"})],1)},[],!1,null,null,null);x.options.__file="index.vue";n.default=x.exports},kgVD:function(t,n,e){"use strict";var o=e("Qqxt");e.n(o).a},ldVq:function(t,n,e){var o=e("QMMT"),i=e("UWiX")("iterator"),r=e("SBuE");t.exports=e("WEpk").isIterable=function(t){var n=Object(t);return void 0!==n[i]||"@@iterator"in n||r.hasOwnProperty(o(n))}},n3ko:function(t,n,e){var o=e("93I4");t.exports=function(t,n){if(!o(t)||t._t!==n)throw TypeError("Incompatible receiver, "+n+" required!");return t}},n660:function(t,n,e){(t.exports=e("I1BE")(!1)).push([t.i,".bread-crumb-container[data-v-582c73c7] {\n  height: 24px;\n  padding: 0px 12px;\n  margin-bottom: 12px;\n  font-size: 12px;\n  color: #3145A6;\n  background-color: #EBEDF0;\n}\n.bread-crumb-container .bread-break[data-v-582c73c7] {\n    padding: 12px 0px;\n}\n.bread-crumb-container .bread-link[data-v-582c73c7] {\n    cursor: pointer;\n}\n",""])},nhzr:function(t,n,e){e("fW1p"),t.exports=e("WEpk").Object.values},"oh+g":function(t,n,e){var o=e("WEpk"),i=o.JSON||(o.JSON={stringify:JSON.stringify});t.exports=function(t){return i.stringify.apply(i,arguments)}},p9D2:function(t,n,e){var o=e("n660");"string"==typeof o&&(o=[[t.i,o,""]]),o.locals&&(t.exports=o.locals);(0,e("SZ7m").default)("84489e1e",o,!0,{})},raTm:function(t,n,e){"use strict";var o=e("5T2Y"),i=e("Y7ZC"),r=e("6/1s"),a=e("KUxP"),s=e("NegM"),l=e("XJU/"),c=e("oioR"),u=e("EXMj"),d=e("93I4"),f=e("RfKB"),p=e("2faE").f,h=e("V7Et")(0),v=e("jmDH");t.exports=function(t,n,e,g,b,m){var y=o[t],x=y,_=b?"set":"add",w=x&&x.prototype,k={};return v&&"function"==typeof x&&(m||w.forEach&&!a(function(){(new x).entries().next()}))?(x=n(function(n,e){u(n,x,t,"_c"),n._c=new y,void 0!=e&&c(e,b,n[_],n)}),h("add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON".split(","),function(t){var n="add"==t||"set"==t;t in w&&(!m||"clear"!=t)&&s(x.prototype,t,function(e,o){if(u(this,x,t),!n&&m&&!d(e))return"get"==t&&void 0;var i=this._c[t](0===e?0:e,o);return n?this:i})}),m||p(x.prototype,"size",{get:function(){return this._c.size}})):(x=g.getConstructor(n,t,b,_),l(x.prototype,e),r.NEED=!0),f(x,t),k[t]=x,i(i.G+i.W+i.F,k),m||g.setStrong(x,t,b),x}},rfXi:function(t,n,e){t.exports={default:e("0tVQ"),__esModule:!0}},sk9p:function(t,n,e){"use strict";n.__esModule=!0;var o=r(e("k/8l")),i=r(e("FyfS"));function r(t){return t&&t.__esModule?t:{default:t}}n.default=function(){return function(t,n){if(Array.isArray(t))return t;if((0,o.default)(Object(t)))return function(t,n){var e=[],o=!0,r=!1,a=void 0;try{for(var s,l=(0,i.default)(t);!(o=(s=l.next()).done)&&(e.push(s.value),!n||e.length!==n);o=!0);}catch(t){r=!0,a=t}finally{try{!o&&l.return&&l.return()}finally{if(r)throw a}}return e}(t,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}()},"tH+O":function(t,n,e){"use strict";e.r(n);var o={props:{show:{type:Boolean,default:!0},className:{type:String,default:""},defaultUrl:{type:String,default:""},hoverUrl:{type:String,default:""},activeUrl:{type:String,default:""},origin:{type:String,default:"default"},hold:{type:Boolean,default:!1}},data:function(){return{status:"default",holded:"default"}},computed:{imgUrl:function(){var t="";return"default"===this.status?t=this.defaultUrl:"hover"===this.status?t=this.hoverUrl:"active"===this.status&&(t=this.activeUrl),t}},beforeMount:function(){this.inited()},methods:{inited:function(){this.status=this.origin},mouseenter:function(){this.hold&&(this.holded=this.status),this.hoverUrl&&(this.status="hover")},mouseout:function(){this.hold?this.status=this.holded:this.status="default"},mousedown:function(){this.activeUrl&&(this.holded&&(this.holded="active"),this.status="active")},mouseup:function(){"active"!==this.status||this.hold||(this.status="default")},click:function(){this.$emit("clickFn")},restart:function(){this.holded="default",this.status=this.holded},setActive:function(){this.holded="active",this.status="active"}}},i=(e("xhXJ"),e("KHd+")),r=Object(i.a)(o,function(){var t=this,n=t.$createElement,e=t._self._c||n;return e("div",{directives:[{name:"show",rawName:"v-show",value:t.show,expression:"show"}],class:t.className,on:{mouseenter:t.mouseenter,mouseout:t.mouseout,mousedown:t.mousedown,mouseup:t.mouseup,click:function(n){return n.stopPropagation(),t.click(n)}}},[e("img",{staticClass:"wh-100",attrs:{src:t.imgUrl,alt:""}})])},[],!1,null,"123b3c48",null);r.options.__file="index.vue";n.default=r.exports},v6xn:function(t,n,e){var o=e("C2SN");t.exports=function(t,n){return new(o(t))(n)}},vkZ8:function(t,n,e){(t.exports=e("I1BE")(!1)).push([t.i,'.dialog-main-content[data-v-90ca9f78] {\n  font-family: "Lato";\n  font-size: 18px;\n  color: #534c77;\n  text-align: center;\n  font-weight: bold;\n  margin-bottom: 25px;\n}\n.dialog-sub-content[data-v-90ca9f78] {\n  font-family: "Lato";\n  font-size: 12px;\n  color: #bbbbc8;\n  text-align: center;\n}\n.dialog-button[data-v-90ca9f78] {\n  width: 135px;\n  height: 32px;\n  border-radius: 2px;\n  border: 0px;\n  font-family: "Lato";\n  font-weight: bold;\n  font-size: 12px;\n  text-align: center;\n  cursor: pointer;\n  outline: none;\n  color: #7f7d8e;\n  background-color: #e8e8ef;\n}\n.dialog-button[data-v-90ca9f78]:hover {\n    color: #ffffff;\n    background-color: #494ece;\n}\n.dialog-button[data-v-90ca9f78]:active {\n    color: #ffffff;\n    background-color: #3135a6;\n}\n',""])},xhXJ:function(t,n,e){"use strict";var o=e("2WLf");e.n(o).a},xvv9:function(t,n,e){e("cHUd")("Set")},yiMW:function(t,n,e){"use strict";var o=e("LER+");e.n(o).a}}]);