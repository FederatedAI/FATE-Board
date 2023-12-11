<template>
  <div class="f-log">
    <!-- main tab -->
    <div class="f-log-tabs">
      <div class="f-log-tab">
        <span
          v-for="(value, key) in mainTabs"
          :key="key"
          :class="{ 'f-log-tab--active': currentMainTab === key }"
          @click="changeMainTab(key)"
          >{{ capitalize(key) }} Log</span
        >
      </div>
      <el-select
        v-if="(instanceSelection as any).length > 1"
        v-model="currentInstanceId"
        :size="'mini'"
      >
        <el-option
          v-for="item in instanceSelection"
          :key="(item as any).value"
          :label="(item as any).label"
          :value="(item as any).value"
        />
      </el-select>
    </div>

    <!-- sub tab -->
    <section class="f-log-info">
      <div class="f-log-subtabs">
        <div
          v-for="(item, key) in (mainTabs as any)[currentMainTab].tabs"
          :key="key"
          :class="{ 'f-log-subtab--active': currentLogType === key }"
          class="f-log-subtab"
          @click="changeSubTab(key as any)"
        >
          <span class="f-log-subtab-content">{{ item }}</span>
          <span
            v-if="(counts as any)[key] > 0"
            class="f-log-subtab-count"
            :class="`f-log-${item}-total`"
            >({{ (counts as any)[key] }})</span
          >
        </div>
      </div>
      <div class="f-log-containers">
        <LoggerScroll
          v-show="currentLogType === type"
          v-for="(type, _key) in LOG_TYPES"
          :key="type"
          :logs="(logs as any)[type + '_' + currentInstanceId]"
          @scroll-top="handleScrollTop(type)"
          class="f-dashboard-logger"
        ></LoggerScroll>
      </div>
    </section>

    <!-- other -->
    <div ref="checklog" class="f-log-expended">
      <section v-show="expandAll" class="f-log-clickable" @click="toggle">
        <el-icon :size="30"><ArrowDownBold class="f-log-svg"/></el-icon>
      </section>
      <section v-show="!expandAll" class="f-log-clickable" @click="toggle">
        <el-icon :size="30"><ArrowUpBold class="f-log-svg" /></el-icon>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import API from '@/api';
import { ElMessage } from 'element-plus';
import { WSConnect } from 'fate-tools';
import { mapState } from 'vuex';
import LoggerScroll from './LoggerScroll.vue';

const LOG_TYPES: string[] = [
  'partyError',
  'partyWarning',
  'partyInfo',
  'partyDebug',
  'jobSchedule',
  'jobError',
];

const [
  PARTY_ERROR,
  PARTY_WARNING,
  PARTY_INFO,
  PARTY_DEBUG,
  JOB_SCHEDULE,
  JOB_ERROR,
] = LOG_TYPES;

const LOG_TYPES_CAT: any = {
  logSize: 'logSize',
  log: 'log',
  [PARTY_ERROR]: 'log',
  [PARTY_WARNING]: 'log',
  [PARTY_INFO]: 'log',
  [PARTY_DEBUG]: 'log',
  [JOB_SCHEDULE]: 'log',
  [JOB_ERROR]: 'log',
};

function createTabObj(tabs: object, current: string, ...args: any) {
  return {
    tabs,
    current,
    ...args,
  };
}

export default {
  components: {
    LoggerScroll
  },
  data() {
    return {
      currentMainTab: 'algorithm',
      algorithmTab: createTabObj(
        {
          [PARTY_ERROR]: 'error',
          [PARTY_WARNING]: 'warning',
          [PARTY_INFO]: 'info',
          [PARTY_DEBUG]: 'debug',
        },
        PARTY_INFO
      ),
      scheduleTab: createTabObj(
        {
          [JOB_SCHEDULE]: 'info',
          [JOB_ERROR]: 'error',
        },
        JOB_SCHEDULE
      ),
      logs: {},
      counts: {},
      logSizeHasRecevied: false,
      expandAll: false,

      // 高可用支持，多台机器，多份日志展示
      instanceId: [],
      currentInstanceId: '',

      runningInterval: null,
    };
  },
  computed: {
    ...mapState({
      jobId: (state: any) => state.job.jobId,
      role: (state: any) => state.job.role,
      partyId: (state: any) => state.job.partyId,
    }),
    LOG_TYPES() {
      return LOG_TYPES;
    },
    mainTabs() {
      return {
        algorithm: this.algorithmTab,
        schedule: this.scheduleTab,
      };
    },
    currentLogType() {
      return (
        (this.mainTabs as any)[this.currentMainTab] &&
        (this.mainTabs as any)[this.currentMainTab].current
      );
    },
    instanceSelection() {
      const list = [];
      for (const id of this.instanceId) {
        list.push({
          label: id,
          value: id,
        });
      }
      return list;
    },
  },
  watch: {
    logSizeHasRecevied(val) {
      if (val) {
        this.onPull(<any>this.currentLogType);
      }
    },
    counts: {
      handler(val, oldVal) {
        for (const key in val) {
          if (val.hasOwnProperty(key)) {
            if (val[key] !== oldVal[key] && key === this.currentLogType) {
              this.onPull(key, false);
            }
          }
        }
      },
      deep: true,
    },
  },
  created() {
    this.getInstanceIdFromFlow().then(() => {
      this.initLogSocket();
    });
  },
  beforeDestroy() {
    this.runningInterval && clearInterval(this.runningInterval);
    this.ws && (this.ws as any).close();
  },
  methods: {
    capitalize(str: string) {
      return str.substring(0, 1).toUpperCase() + str.substring(1);
    },
    changeMainTab(tab: string) {
      if (this.currentMainTab === tab) {
        return;
      }
      this.currentMainTab = tab;
      this.shouldInitLogByType(<any>this.currentLogType);
    },
    changeSubTab(tab: string) {
      if (this.currentLogType === tab) {
        return;
      }
      (this.mainTabs as any)[this.currentMainTab].current = tab;
      this.shouldInitLogByType(tab);
    },
    shouldInitLogByType(type: string) {
      return (
        !(this.logs as any)[type + '_' + this.currentInstanceId] &&
        this.onPull(type)
      );
    },
    getInstanceIdFromFlow() {
      return API.getInstanceId().then((data: any) => {
        const result = [];
        for (const instance of Object.values(data)) {
          if ((instance as any).host === window.location.host) {
            this.currentInstanceId = (instance as any).instance_id;
          }
          result.push((instance as any).instance_id);
        }
        if (!this.currentInstanceId) {
          this.currentInstanceId = result[0];
        }
        (this as any).instanceId = result;
      });
    },
    initLogSocket() {
      if (!this.ws) {
        if (!this.jobId || !this.role || !this.partyId) {
          console.warn(`Missing required parameters`);
        }
        this.ws = new WSConnect(
          `/log/new/${this.jobId}/${this.role}/${this.partyId}/default`
        );
        (this.ws as any).addEventListener('message', (event: any) => {
          try {
            const res: any = { data: JSON.parse(event.data) };
            if (res.data[JOB_ERROR] !== undefined) {
              res.type = 'logSize';
            } else {
              res.type = 'log';
            }
            this.handleLogMessage(res);
          } catch(error) {
            ElMessage({
              showClose: true,
              message: `This job socket has error`,
              center: true,
              type: 'error'
            });
          }
        });
        (this.ws as any).addEventListener('open', () => {
          this.intervalPull();
        });
      }
      return this.ws;
    },
    handleLogMessage(data: any) {
      const type = LOG_TYPES_CAT[data.type];
      switch (type) {
        case 'logSize':
          this.handleLogSizeResponse(data.data);
          break;
        case 'log':
          this.insertLogs(data.data);
          break;
        default:
          break;
      }
    },
    handleLogSizeResponse(size: any) {
      if (!this.logSizeHasRecevied) {
        this.logSizeHasRecevied = true;
      }
      this.setLogSize(size);
    },
    setLogSize(size: any) {
      this.counts = Object.assign({}, this.counts, size);
    },
    onPull(type: string, backward = true) {
      const count = (this.counts as any)[type];
      const size = 50;
      const logs =
        (this.logs as any)[type + '_' + this.currentInstanceId] || [];
      const instanceId = this.currentInstanceId;
      let begin;
      let end;
      if (!logs.length) {
        end = count;
        begin = Math.max(end - size, 1);
      } else {
        if (backward) {
          end = parseFloat(logs[0].lineNum) - 1;
          begin = Math.max(1, end - size);
        } else {
          begin = parseFloat(logs[logs.length - 1].lineNum) + 1;
          end = count;
        }
      }

      if (count > 0) {
        if (end < begin) {
          return;
        }
        this.ws &&
          (this.ws as any).send(
            JSON.stringify({
              instanceId,
              type,
              begin,
              end,
            })
          );
      } else {
        (this.logs as any)[type + '_' + this.currentInstanceId] = [];
      }
    },
    onCountPull() {
      const type = 'logSize';
      const instanceId = this.currentInstanceId;
      (this.ws as any).send(
        JSON.stringify({
          type,
          instanceId,
        })
      );
    },
    intervalPull() {
      if (!this.runningInterval) {
        this.onCountPull();
        this.runningInterval = <any>setInterval(() => {
          this.onCountPull();
        }, 10000);
      }
    },
    insertLogs(data: any) {
      const { type, data: target } = data;
      const logs =
        (this.logs as any)[type + '_' + this.currentInstanceId] || [];
      let result: any[] = [];
      if (logs.length) {
        const targetRange = this.getLogsRange(target);
        const originRange = this.getLogsRange(logs);
        if (targetRange[0] > originRange[1]) {
          result = result.concat(logs, target);
        } else if (targetRange[1] < originRange[0]) {
          result = result.concat(target, logs);
        } else {
          const start = Math.max(targetRange[0], originRange[0]);
          const end = Math.min(targetRange[1], originRange[1]);
          const startIndex = logs.findIndex(
            (value: any) => Math.abs(parseFloat(value.lineNum) - start) < 0.001
          );
          const endIndex = logs.findIndex(
            (value: any) => Math.abs(parseFloat(value.lineNum) - end) < 0.001
          );
          result = logs.slice();
          result.splice(startIndex, endIndex - startIndex + 1, ...target);
        }
      } else {
        result = target;
      }
      result = result.map((item) => Object.freeze(item));
      this.logs = {
        ...this.logs,
        [type + '_' + this.currentInstanceId]: result,
      };
    },
    getLogsRange(arr: any) {
      return [
        parseFloat(arr[0].lineNum),
        parseFloat(arr[arr.length - 1].lineNum),
      ];
    },
    handleScrollTop(type: any) {
      this.onPull(type);
    },
    toggle() {
      this.expandAll = !this.expandAll;
      this.$emit('expand', this.expandAll)
      if (this.expandAll) {
        this.$nextTick(() => {
          this.$el.scrollIntoView();
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/style/index.scss';

.f-log {
  position: relative;
  @include box-stretch();
  padding: $pale;

  .f-log-tabs {
    @include flex-row();
    align-items: center;
    justify-content: flex-start;
    padding-bottom: math.div($pale, 2);
    margin-bottom: math.div($pale, 2);

    .f-log-tab {
      @include flex-row();

      & > span {
        @include title-4-size();
        font-weight: bold;
        padding-right: $pale;
        color: var(--el-color-info-light-3);
        cursor: pointer;
      }

      .f-log-tab--active {
        color: var(--el-color-primary);
      }
    }
  }

  .f-log-info {
    @include flex-col();
    flex: 1 1 calc(100% - 30px - 30px - 6px);
    height: calc(100% - 30px - 30px - 6px);

    .f-log-subtabs {
      @include flex-row();
      padding-bottom: math.div($pale, 2);
      margin-bottom: math.div($pale, 2);

      .f-log-subtab {
        @include title-4-size();
        color: var(--el-color-info);
        padding-right: $pale * 3;
        cursor: pointer;

        .f-log-subtab-content {
          padding: 0 4px 0 0;
          font-size: 14px;
          color: #6a6c75;
        }

        .f-log-subtab-count {
          min-width: 16px;
          height: 16px;
          padding: 0 5px;
          border-radius: 2px;
          line-height: 16px;
          text-align: center;
          color: #fff;
        }
      }

      .f-log-subtab--active {
        font-weight: 600;
        .f-log-subtab-content {
          color: var(--el-color-primary);
        }
      }
    }
    .f-log-containers {
      height: 100%;
      padding: 0px math.div($pale, 2) 0px 0px;
      overflow: auto;
      width: 100%;
      position: relative;
      background-color: $default-white;
      border-radius: math.div($pale, 3);
      position: relative;
    }

    .f-log-error-total {
      color: var(--el-color-error) !important;
    }

    .f-log-warning-total {
      color: var(--el-color-warning) !important;
    }

    .f-log-info-total {
      color: var(--el-color-info) !important;
    }

    .f-log-debug-total {
      color: var(--el-color-primary) !important;
    }
  }
  .f-log-expended {
    @include flex-row();
    @include flex-center();
    width: 100%;
    padding: math.div($pale, 2);

    .f-log-clickable {
      width: 130px;
      height: 30px;
      border-radius: 15px;
      background-color: $default-white;
      text-align: center;

      &:hover {
        background-color: var(--el-color-primary-light-3);
        color: $default-white;
      }

      .f-log-svg {
        width: 100%;
        height: 30px;
      }
    }
  }

  .f-dashboard-logger{
    width: 100%;
    padding: $pale;
  }
}

</style>
