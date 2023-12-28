<template>
  <svg><use :href="ICONS[name]" /></svg>
</template>

<script lang="ts" setup>
const ICONS: any = {
  FoldDBClick: import('./fold_dashboard_click.svg'),
  FoldDBDefault: import('./fold_dashboard_default.svg'),
  FoldDBHover: import('./fold_dashboard_hover.svg'),
  UnfoldDBClick: import('./unfold_dashboard_click.svg'),
  UnfoldDBDefault: import('./unfold_dashboard_default.svg'),
  UnfoldDBHover: import('./unfold_dashboard_hover.svg'),
  Complete: import('./complete.svg'),
  DisableComplete: import('./disable_complete.svg'),
  Error: import('./error.svg'),
  DisableError: import('./disable_error.svg')
}

defineProps(['name'])
</script>
