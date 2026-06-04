<script setup>
import { ref, onMounted, useTemplateRef, watchEffect, onUnmounted } from 'vue';
import { useTracker } from '../../dist/position-tracker-vue';
import { useHighlighter } from './preview/highlighter';
import { draggable } from './preview/draggable';
import { useLine } from './preview/line';

const virtualTracker = {
    position: {
        left: 50,
        top: 50,
        right: 50,
        bottom: 50,
    },
    // update () {
    //     this.position.left += Math.random() >= 0.5 ? 1 : -1;
    // }
};

// setInterval(() => {
//     virtualTracker.position.left += (Math.random() - 0.5) * 5;
//     virtualTracker.position.top += (Math.random() - 0.5) * 5;
// }, 1000);

const element = useTemplateRef('element');
const textTitle = ref('');
const textPosition = ref('');
const tracker = useTracker(element, virtualTracker);
const { highlight } = useHighlighter(element);
let removeDraggable = null;

useLine(tracker);

onMounted(() => {
    watchEffect(() => {
        highlight();
        textTitle.value = 'virtual';
        textPosition.value = `${tracker.relativePosition.left.value.toFixed(0)} x ${tracker.relativePosition.top.value.toFixed(0)}`;
    });

    removeDraggable = draggable(element.value, (position) => {
        element.value.style.transform = `translate(${position.x}px, ${position.y}px)`;
    });
});

function cleanup() {
    if (removeDraggable) {
        removeDraggable();
        removeDraggable = null;
    }
}

onUnmounted(cleanup);
</script>

<template>
    <li ref="element" class="box-list__box">
        {{ textTitle }}<br />
        {{ textPosition }}
    </li>
</template>

<style scoped>

</style>