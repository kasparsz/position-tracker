<script setup>
import { ref, onMounted, useTemplateRef, watchEffect, onUnmounted } from 'vue';
import { track } from '../../dist/position-tracker-vue';
import { highlighter } from './preview/highlighter';
import { draggable } from './preview/draggable';
import { useLine } from './preview/line';

const element = useTemplateRef('element');
const textTitle = ref('');
const textPosition = ref('');
let tracker = null;
let highlight = null;
let removeDraggable = null;

// useLine(tracker);

const virtualTracker = {
    position: {
        left: ref(50),
        top: ref(50),
        right: ref(50),
        bottom: ref(50),
    },
    // update () {
    //     this.position.left += Math.random() >= 0.5 ? 1 : -1;
    // }
};

// setInterval(() => {
//     virtualTracker.position.left.value += (Math.random() - 0.5) * 5;
//     virtualTracker.position.top.value += (Math.random() - 0.5) * 5;
// }, 1000);

onMounted(() => {
    tracker = track(element.value, virtualTracker);
    highlight = highlighter(element.value);
    // line(tracker);

    watchEffect(() => {
        highlight.highlight();
        textTitle.value = 'virtual signal';
        textPosition.value = `${tracker.relativePosition.left.value.toFixed(0)} x ${tracker.relativePosition.top.value.toFixed(0)}`;
    });

    removeDraggable = draggable(element.value, (position) => {
        element.value.style.transform = `translate(${position.x}px, ${position.y}px)`;
    });
});
onUnmounted(() => {
    if (tracker) {
        tracker.destroy();
        removeDraggable();
    }
});
</script>

<template>
    <li ref="element" class="box-list__box">
        {{ textTitle }}<br />
        {{ textPosition }}
    </li>
</template>

<style scoped>

</style>