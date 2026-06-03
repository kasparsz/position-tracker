<script setup>
import { ref, defineExpose, toValue, onMounted, useTemplateRef, watch, watchEffect, onUnmounted } from 'vue';
import { track } from '../../dist/position-tracker-vue';
import { highlighter } from './preview/highlighter';
import { draggable } from './preview/draggable';
import { line } from './preview/line';
import BoxRemove from './BoxRemove.vue';

const props = defineProps(['relative'])

const element = useTemplateRef('element');
const textTitle = ref('');
const textPosition = ref('');
let tracker = null;
let highlight = null;
let removeDraggable = null;
let removeLine = null;

function setupTracking(relative) {
    tracker = track(element.value, relative);
    highlight = highlighter(element.value);

    if (relative !== document && relative !== window) {
        removeLine = line(tracker);
    }
    
    watchEffect(() => {
        highlight.highlight();
        textTitle.value = relative === undefined ? 'body' : relative === window ? 'window' : 'relative';
        textPosition.value = `${tracker.relativePosition.left.value.toFixed(0)} x ${tracker.relativePosition.top.value.toFixed(0)}`;
    });

    setupDraggable();
}
function setupDraggable() {
    if (removeDraggable) {
        removeDraggable();
    }
    removeDraggable = draggable(element.value, (position) => {
        element.value.style.transform = `translate(${position.x}px, ${position.y}px)`;
    });
}

onMounted(() => {
    if (props.relative !== false) {
        if (props.relative === undefined) {
            setupTracking(document);
        } else if (props.relative) {
            setupTracking(props.relative);
        } else {
            watch(() => props.relative, () => {
                const rel = toValue(props.relative);

                if (rel && rel.element) {
                    setupTracking(rel.element);
                } else {
                    console.log(rel);
                }
            });
        }
    } else {
        setupDraggable();
    }
});

function cleanup() {
    if (tracker) {
        tracker.destroy();
        tracker = null;
    }
    if (removeDraggable) {
        removeDraggable();
        removeDraggable = null;
    }
    if (removeLine) {
        removeLine();
        removeLine = null;
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