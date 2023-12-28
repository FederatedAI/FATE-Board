<script setup>
import { ElMessage, ElMessageBox } from 'element-plus';
import { defineEmits, defineExpose, h } from 'vue';

const emits = defineEmits(['confirm', 'cancel']);

// confirm content
const box = h('p', null, [
  h('p', null, ['Are you sure you want to cancel this job?']),
  h(
    'p',
    {
      className: 'sub-title',
    },
    [
      "You can't undo this action，it may take few seconds to  update job status.",
    ]
  ),
]);

const open = (jobId) => {
  ElMessageBox({
    title: 'Cancel',
    message: box,
    showCancelButton: true,
    confirmButtonText: 'Sure',
    cancelButtonText: 'Cancel',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        instance.confirmButtonText = 'Canceling...';
        emits('confirm', () => {
          instance.confirmButtonLoading = false;
          done();
        });
      } else {
        emits('cancel');
        done();
      }
    },
  }).then((action) => {
    if (action === 'confirm') {
      ElMessage({
        type: 'info',
        message: `Job: ${jobId} has been canceled`,
      });
    }
  });
};

defineExpose({
  open,
});
</script>
