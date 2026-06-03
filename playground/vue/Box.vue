<script setup>
import { ref, computed, defineExpose, toValue, onMounted, useTemplateRef, watch, watchEffect, onUnmounted } from 'vue';
import { useTracker } from '../../dist/position-tracker-vue';
import { highlighter } from './preview/highlighter';
import { draggable } from './preview/draggable';
import { useLine } from './preview/line';
import BoxRemove from './BoxRemove.vue';

const props = defineProps(['relative', 'debug', 'disabled'])

const element = useTemplateRef('element');
const relative = computed(() => props.relative);
const textTitle = ref('');
const textPosition = ref('');
let tracker = useTracker(element, relative);
let highlight = null;
let removeDraggable = null;

useLine(tracker);

function setupDraggable() {
    if (removeDraggable) {
        removeDraggable();
    }
    removeDraggable = draggable(element.value, (position) => {
        element.value.style.transform = `translate(${position.x}px, ${position.y}px)`;
    });
}

onMounted(() => {
    setupDraggable();

    if (!props.disabled) {
        highlight = highlighter(element.value);
        
        watchEffect(() => {
            highlight.highlight();
            textTitle.value = props.relative === document || props.relative === document.body ? 'body' : props.relative === window ? 'window' : 'relative';
            textPosition.value = `${tracker.relativePosition.left.value.toFixed(0)} x ${tracker.relativePosition.top.value.toFixed(0)}`;
        });
    }
});

function cleanup() {
    if (removeDraggable) {
        removeDraggable();
        removeDraggable = null;
    }
}

onUnmounted(cleanup);

defineExpose({
    element: element,
});
</script>

<template>
    <li ref="element" class="box-list__box">
        <BoxRemove v-if="!$slots.default" @remove="cleanup" />
        <span v-if="!$slots.default">
            {{ textTitle }}<br />
            {{ textPosition }}
        </span>
        <ul v-else class="box-list">
            <slot />
        </ul>
    </li>
</template>