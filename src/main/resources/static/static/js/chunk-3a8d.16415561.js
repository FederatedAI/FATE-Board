(window.webpackJsonp=window.webpackJsonp||[]).push([["chunk-3a8d"],{"A/q9":function(n,t,e){var o=e("KuSI");"string"==typeof o&&(o=[[n.i,o,""]]),o.locals&&(n.exports=o.locals);(0,e("SZ7m").default)("bd91d0e4",o,!0,{})},C9MU:function(n,t,e){var o=e("RMZv");"string"==typeof o&&(o=[[n.i,o,""]]),o.locals&&(n.exports=o.locals);(0,e("SZ7m").default)("1f0469a6",o,!0,{})},KuSI:function(n,t,e){(n.exports=e("I1BE")(!1)).push([n.i,".flex-bottom[data-v-02fe954a] {\n  -webkit-box-align: baseline;\n      -ms-flex-align: baseline;\n          align-items: baseline;\n}\n.running-container[data-v-02fe954a] {\n  padding: 12px;\n  font-family: 'Arial';\n  font-size: 14px;\n}\n.running-container .job-info[data-v-02fe954a] {\n    margin-bottom: 6px;\n}\n.running-container .job-info .job-id[data-v-02fe954a] {\n      font-weight: bold;\n      color: #3e4052;\n}\n.running-container .job-info .kill-btn[data-v-02fe954a] {\n      color: #4159d1;\n      cursor: pointer;\n}\n.running-container .role-info[data-v-02fe954a] {\n    color: #999ba3;\n    font-size: 12px;\n    padding-bottom: 6px;\n    border-bottom: 1px solid #ebedf0;\n}\n.running-container .progress-info[data-v-02fe954a] {\n    width: 100%;\n    height: 100%;\n    position: relative;\n}\n.running-container .progress-info .operation-btn[data-v-02fe954a] {\n      position: absolute;\n}\n.running-container .progress-info .wait-status[data-v-02fe954a] {\n      font-size: 18px;\n      color: #5e7feb;\n      font-weight: bold;\n}\n.running-container .progress-info .running-status[data-v-02fe954a] {\n      font-size: 36px;\n      color: #5e7feb;\n}\n.running-container .progress-info .running-status .precentage-text[data-v-02fe954a] {\n        font-size: 16px;\n}\n.running-container .progress-info .enter-btn[data-v-02fe954a] {\n      font-size: 18px;\n      color: #4159d1;\n      cursor: pointer;\n}\n",""])},RMZv:function(n,t,e){(n.exports=e("I1BE")(!1)).push([n.i,".running-container {\n  height: 100%;\n  padding: 24px 0;\n}\n.running-container .job-list > li {\n    width: 336px;\n    height: 240px;\n    margin: 12px;\n    background: #fff;\n    border-radius: 4px;\n}\n.running-container .job-list > li .top {\n      padding: 12px;\n      padding-bottom: 0;\n}\n.running-container .job-list > li .top .job-id {\n        color: #7f7d8e;\n        font-family: 'Roboto';\n        font-weight: bold;\n        color: #3E4052;\n}\n.running-container .job-list > li .top .enter {\n        text-align: center;\n        height: 22px;\n        line-height: 22px;\n        border-radius: 22px;\n}\n.running-container .job-list > li .top .enter:hover {\n          text-decoration: underline;\n}\n.running-container .job-list > li .role {\n      margin: 0px 12px;\n      color: #bbbbc8;\n      padding-bottom: 6px;\n      border-bottom: 1px solid #EBEDF0;\n      font-family: 'Roboto';\n}\n.running-container .job-list > li .status {\n      height: 188.16px;\n}\n.running-container .job-list > li .status .text {\n        left: 50%;\n        top: 50%;\n        width: 100px;\n        height: 100px;\n        margin-left: -50px;\n        margin-top: -50px;\n        text-align: center;\n        line-height: 100px;\n}\n.running-container .job-list > li .status .mask {\n        z-index: 999;\n        display: none;\n        background: rgba(255, 255, 255, 0.5);\n}\n.running-container .job-list > li .status .el-button {\n        display: none;\n}\n.running-container .job-list > li .status:hover .mask {\n        display: -webkit-box;\n        display: -ms-flexbox;\n        display: flex;\n}\n.running-container .job-list > li .status:hover .text {\n        display: none;\n}\n.running-container .job-list > li .status:hover .el-button {\n        display: block;\n}\n.running-container .ie-ul {\n    width: 100%;\n}\n.running-container .ie-pos {\n    top: 0;\n    left: 0;\n}\n.running-container .dialog-main-content {\n    font-family: 'Lato';\n    font-size: 18px;\n    color: #534c77;\n    text-align: center;\n    font-weight: bold;\n    margin-bottom: 25px;\n}\n.running-container .dialog-sub-content {\n    font-family: 'Lato';\n    font-size: 12px;\n    color: #bbbbc8;\n    text-align: center;\n}\n.running-container .dialog-button {\n    width: 135px;\n    height: 32px;\n    border-radius: 2px;\n    border: 0px;\n    font-family: 'Lato';\n    font-weight: bold;\n    font-size: 12px;\n    text-align: center;\n    cursor: pointer;\n    outline: none;\n}\n.running-container .dialog-check-button {\n    color: #ffffff;\n    background-color: #494ece;\n}\n.running-container .dialog-click-button {\n    color: #ffffff;\n    background-color: #3135a6;\n}\n.running-container .dialog-uncheck-button {\n    color: #7f7d8e;\n    background-color: #e8e8ef;\n}\n",""])},"a4k+":function(n,t,e){"use strict";var o=e("A/q9");e.n(o).a},"b/+g":function(n,t,e){"use strict";e.r(t);var o=e("dv4G"),i={name:"JobRunning",props:{jobId:{type:String,default:""},role:{type:String,default:"guest"},status:{type:String,default:"waiting"}},data:function(){return{mouseoverd:!1,progressNum:0}},watch:{status:{handler:function(){this.getProgress()}}},beforeMount:function(){this.getProgress()},methods:{enter:function(){this.$emit("enter")},getProgress:function(){"waiting"!==this.status?this.progressNum=parseFloat(this.status):this.progressNum=0},mouseoverHandler:function(){"waiting"===this.status?this.mouseoverd=!1:this.mouseoverd=!0},killOperation:function(){this.$emit("kill")}}},a=(e("a4k+"),e("KHd+")),r=Object(a.a)(i,function(){var n=this,t=n.$createElement,e=n._self._c||t;return e("section",{staticClass:"flex flex-col running-container"},[e("div",{staticClass:"flex flex-row space-between job-info"},[e("span",{staticClass:"job-id"},[n._v(n._s(n.jobId))]),n._v(" "),e("span",{staticClass:"kill-btn",on:{click:n.killOperation}},[n._v(n._s("waiting"===n.status?"cancel":"kill"))])]),n._v(" "),e("span",{staticClass:"role-info"},[n._v("Role: "+n._s(n.role))]),n._v(" "),e("div",{staticClass:"flex flex-center justify-center progress-info",on:{mouseover:n.mouseoverHandler,mouseout:function(t){n.mouseoverd=!1}}},[e("el-progress",{attrs:{percentage:n.progressNum,"show-text":!1,width:120,color:"#494ece",type:"circle"}}),n._v(" "),e("div",{staticClass:"operation-btn"},[e("p",{directives:[{name:"show",rawName:"v-show",value:!n.mouseoverd,expression:"!mouseoverd"}],staticClass:"flex flex-row flex-bottom",class:{"wait-status":"waiting"===n.status,"running-status":"waiting"!==n.status}},[e("span",[n._v(n._s("waiting"===n.status?"waiting...":n.progressNum))]),n._v(" "),"waiting"!==n.status?e("span",{staticClass:"precentage-text"},[n._v("%")]):n._e()]),n._v(" "),e("span",{directives:[{name:"show",rawName:"v-show",value:n.mouseoverd,expression:"mouseoverd"}],staticClass:"enter-btn",on:{click:n.enter}},[n._v("enter")])])],1)])},[],!1,null,"02fe954a",null);r.options.__file="JobRunning.vue";var s={components:{jobRunning:r.exports},directives:{},data:function(){return{loading:!0,jobList:[],timer:null,showDialog:!1,mainContent:"",subContent:"",checkSure:null,checkclick:null,willKill:""}},mounted:function(){this.getJobList(),this.timer=setInterval(this.getJobList,5e3)},beforeDestroy:function(){clearInterval(this.timer)},methods:{getJobList:function(){var n=this,t=[];Object(o.b)().then(function(e){e.data.forEach(function(n){var e=n.fJobId,o=n.fStatus,i=n.fRole,a=n.fPartyId,r=n.fProgress||0,s="running"===o?r+"%":o;t.push({jobId:e,fStatus:o,status:s,statusProgress:"running"===o?r:0,role:i,partyId:a})}),n.jobList=t}).then(function(t){n.loading=!1})},enter:function(n,t,e){window.open(this.$router.resolve({path:"/dashboard",query:{job_id:n,role:t,party_id:e}}).href,"_blank")},handleKillJob:function(n,t,e,i,a){var r=this,s={job_id:n,role:t,party_id:e};Object(o.e)(s).then(function(n){var t=n.data.job.fStatus;"waiting"===t?("kill"===i&&(r.jobList[a].status=t,r.jobList.splice()),i="cancel"):"cancel"===i&&(i="kill",r.jobList[a].status=t,r.jobList.splice()),r.checkSure=!0,r.confirmKill(s,i)})},confirmKill:function(n,t){this.mainContent="Are you sure you want to "+t+" this job?",this.subContent="You can't undo this action",this.showDialog=!0,this.willKill=n},sureKillJob:function(){this.submitKillJob(this.willKill)},closeDialog:function(){this.showDialog=!1,this.willKill=""},submitKillJob:function(n){var t=this,e=this;Object(o.f)(n).then(function(n){t.getJobList(),e.closeDialog()})}}},l=(e("jfYB"),Object(a.a)(s,function(){var n=this,t=n.$createElement,e=n._self._c||t;return e("div",{directives:[{name:"loading",rawName:"v-loading",value:n.loading,expression:"loading"}],staticClass:"running-container flex flex-center flex-col app-container"},[e("ul",{staticClass:"job-list flex flex-center flex-wrap ie-ul"},n._l(n.jobList,function(t,o){return e("li",{key:o,staticClass:"shadow"},[e("job-running",{attrs:{"job-id":t.jobId,role:t.role,status:t.status},on:{enter:function(e){n.enter(t.jobId,t.role,t.partyId)},kill:function(e){n.handleKillJob(t.jobId,t.role,t.partyId,"waiting"===t.status?"cancel":"kill",o)}}})],1)})),n._v(" "),e("el-dialog",{attrs:{visible:n.showDialog,width:"510px"},on:{"update:visible":function(t){n.showDialog=t}}},[e("div",{staticClass:"dialog-main-content"},[n._v(n._s(n.mainContent))]),n._v(" "),e("div",{staticClass:"dialog-sub-content"},[n._v(n._s(n.subContent))]),n._v(" "),e("div",{staticClass:"flex justify-center",staticStyle:{"margin-top":"72px"}},[e("button",{staticClass:"dialog-button",class:[!0===n.checkSure?"dialog-check-button":"dialog-uncheck-button",!0===n.checkclick?"dialog-click-button":""],on:{mouseover:function(t){n.checkSure=!0},mouseout:function(t){n.checkSure=null,n.checkclick=null},mousedown:function(t){n.checkclick=!0},click:n.sureKillJob}},[n._v("Sure")]),n._v(" "),e("button",{staticClass:"dialog-button",class:[!1===n.checkSure?"dialog-check-button":"dialog-uncheck-button",!1===n.checkclick?"dialog-click-button":""],staticStyle:{"margin-left":"23px"},on:{mouseover:function(t){n.checkSure=!1},mouseout:function(t){n.checkSure=null,n.checkclick=null},mousedown:function(t){n.checkclick=!1},click:n.closeDialog}},[n._v("cancel")])])])],1)},[],!1,null,null,null));l.options.__file="index.vue";t.default=l.exports},dv4G:function(n,t,e){"use strict";e.d(t,"g",function(){return i}),e.d(t,"b",function(){return a}),e.d(t,"f",function(){return r}),e.d(t,"e",function(){return s}),e.d(t,"d",function(){return l}),e.d(t,"c",function(){return c}),e.d(t,"h",function(){return u}),e.d(t,"i",function(){return d}),e.d(t,"a",function(){return f});var o=e("t3Un");function i(n){return Object(o.a)({url:"/job/query/page",method:"post",data:n})}function a(n){return Object(o.a)({url:"/job/query/status",method:"get",params:n})}function r(n){return Object(o.a)({url:"/job/v1/pipeline/job/stop",method:"post",data:n})}function s(n){var t=n.job_id,e=n.role,i=n.party_id;return Object(o.a)({url:"/job/query/"+t+"/"+e+"/"+i,method:"get"})}function l(n){return Object(o.a)({url:"/v1/pipeline/dag/dependencies",method:"post",data:n})}function c(n){return Object(o.a)({url:"/v1/tracking/component/parameters",method:"post",data:n})}function u(n){var t=n.componentId,e=n.job_id,i=n.role,a=n.party_id,r=n.begin,s=n.end,l=n.type;return Object(o.a)({url:"/queryLogWithSize/"+e+"/"+i+"/"+a+"/"+t+"/"+l+"/"+r+"/"+s,method:"get"})}function d(n){var t=n.componentId,e=void 0===t?"default":t,i=n.job_id,a=n.role,r=n.party_id,s=n.type;return Object(o.a)({url:"/queryLogSize/"+i+"/"+a+"/"+r+"/"+e+"/"+s,method:"get"})}function f(n){return Object(o.a)({url:"/job/update",method:"put",data:n})}},jfYB:function(n,t,e){"use strict";var o=e("C9MU");e.n(o).a}}]);